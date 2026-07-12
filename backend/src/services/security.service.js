import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import sagaQueue from '../queue/sagaQueue.js';
import { crawlRepositoryFiles } from '../security/fileCrawler.js';
import { scanFiles } from '../security/secretScanner.js';
import { scanDependencies, detectVersionMismatches, runNpmAudit } from '../security/dependencyScanner.js';
import SecurityEvent from '../models/SecurityEvent.model.js';

export const REPOSITORY_SECURITY_SCAN_TYPE = 'REPOSITORY_SECURITY_SCAN';

// Step definitions for the Saga
const scanSteps = [
  {
    name: 'crawl_and_scan',
    execute: async (context, session) => {
      const { userId, repoName } = context;

      const repoPath = path.resolve(process.cwd(), 'repositories', userId, repoName);
      if (!fs.existsSync(repoPath)) {
        throw new Error(`Repository directory does not exist at path: ${repoPath}`);
      }

      // 1. Crawl all text files in the repository
      const files = await crawlRepositoryFiles(repoPath);

      // 2. Scan files for secrets
      const secretFindings = scanFiles(files);

      // 3. Scan for dependency vulnerabilities and mismatches
      let dependencyFindings = [];
      let mismatchFindings = [];

      const packageJsonFile = files.find((f) => f.path === 'package.json');
      const packageLockFile = files.find((f) => f.path === 'package-lock.json');

      if (packageJsonFile) {
        try {
          const packageJson = JSON.parse(packageJsonFile.content);
          dependencyFindings = scanDependencies(packageJson);

          if (packageLockFile) {
            try {
              const packageLock = JSON.parse(packageLockFile.content);
              mismatchFindings = detectVersionMismatches(packageJson, packageLock);
            } catch (err) {
              // Ignore lock file parsing issues
            }
          }
        } catch (err) {
          // Ignore package file parsing issues
        }
      }

      // 4. Run optional npm audit
      let auditFindings = [];
      try {
        auditFindings = await runNpmAudit(repoPath);
      } catch (err) {
        // Ignore npm audit errors to keep scan resilient
      }

      // Combine all findings
      const findings = [
        ...secretFindings,
        ...dependencyFindings,
        ...mismatchFindings,
        ...auditFindings,
      ];

      context.findings = findings;
      return { findings };
    },
    compensate: async (context, session) => {
      // Crawl and scan is read-only, no rollback needed
    },
  },
  {
    name: 'calculate_risk_and_persist',
    execute: async (context, session) => {
      const { repositoryId, scanId, findings } = context;

      const SEVERITY_WEIGHTS = {
        CRITICAL: 50,
        HIGH: 25,
        MEDIUM: 10,
        LOW: 2,
      };

      // 1. Calculate cumulative risk score capped at 100
      let rawScore = 0;
      for (const finding of findings) {
        rawScore += SEVERITY_WEIGHTS[finding.severity] || 0;
      }
      const riskScore = Math.min(100, rawScore);

      // 2. Build model documents
      const events = findings.map((finding) => ({
        repository: repositoryId,
        scanId,
        type: finding.type,
        severity: finding.severity,
        message: finding.message,
        metadata: {
          file: finding.file,
          line: finding.line,
          match: finding.match,
          package: finding.package,
          ...finding.metadata,
        },
        riskScore,
      }));

      // 3. Delete any partially-inserted documents from a previous failed attempt before re-inserting.
      await SecurityEvent.deleteMany({ repository: repositoryId, scanId }, { session });

      // 4. Persist findings to MongoDB using the shared transactional session
      if (events.length > 0) {
        await SecurityEvent.insertMany(events, { session });
      }

      context.riskScore = riskScore;
      context.totalFindings = findings.length;

      return { riskScore, totalFindings: findings.length };
    },
    compensate: async (context, session) => {
      const { repositoryId, scanId } = context;
      // Undo persistence by removing all security events created for this scan
      await SecurityEvent.deleteMany({ repository: repositoryId, scanId }, { session });
    },
  },
];

/**
 * Triggers a repository security scan in the background using SagaOrchestrator.
 * @param {string} userId - ID of the repository owner.
 * @param {string} repositoryId - ID of the repository.
 * @param {string} repoName - Name of the repository.
 * @returns {Promise<{ scanId: string, promise: Promise<any> }>}
 */
export const triggerRepositoryScan = async (userId, repositoryId, repoName) => {
  const scanId = uuidv4();
  const initialContext = {
    userId: userId.toString(),
    repositoryId: repositoryId.toString(),
    repoName,
    scanId,
    findings: [],
    riskScore: 0,
    totalFindings: 0,
  };

  // Enqueue job via SagaQueue.
  // Note: we return the scanId immediately to the caller, and let the saga process in the background.
  const promise = sagaQueue.enqueue(
    scanId,
    REPOSITORY_SECURITY_SCAN_TYPE,
    scanSteps,
    initialContext,
    { maxRetries: 2, retryDelayMs: 200 }
  );

  return {
    scanId,
    promise,
  };
};
