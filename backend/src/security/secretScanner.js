const SECRET_PATTERNS = [
  {
    name: 'AWS Access Key',
    regex: /(?:^|[^A-Z0-9])((AKIA|ASIA)[A-Z0-9]{16})(?:$|[^A-Z0-9])/,
    severity: 'CRITICAL',
  },
  {
    name: 'AWS Secret Key',
    regex: /aws_secret_access_key\s*[=:]\s*['"]?([A-Za-z0-9/+=]{40})['"]?/i,
    severity: 'CRITICAL',
  },
  {
    name: 'GitHub Token',
    regex: /(ghp_[A-Za-z0-9_]{36,}|gho_[A-Za-z0-9_]{36,}|ghs_[A-Za-z0-9_]{36,}|ghr_[A-Za-z0-9_]{36,}|github_pat_[A-Za-z0-9_]{22,})/,
    severity: 'CRITICAL',
  },
  {
    name: 'OpenAI API Key',
    regex: /(sk-[A-Za-z0-9]{20,})/,
    severity: 'CRITICAL',
  },
  {
    name: 'JWT Secret',
    regex: /(?:jwt_secret|JWT_SECRET|jwt[-_]?key)\s*[=:]\s*['"]([^'"]{8,})['"]/i,
    severity: 'HIGH',
  },
  {
    name: 'Generic API Key',
    regex: /(?:api[_-]?key|apikey|api[_-]?secret)\s*[=:]\s*['"]([^'"]{8,})['"]/i,
    severity: 'HIGH',
  },
  {
    name: 'Private Key',
    regex: /-----BEGIN\s+(RSA|EC|DSA|OPENSSH|PGP)?\s*PRIVATE KEY-----/,
    severity: 'CRITICAL',
  },
  {
    name: 'Hardcoded Password',
    regex: /(?:password|passwd|pwd)\s*[=:]\s*['"]([^'"]{4,})['"]/i,
    severity: 'HIGH',
  },
  {
    name: 'Connection String with Credentials',
    regex: /(?:mongodb|postgres|mysql|redis):\/\/[^:\s]+:[^@\s]+@/i,
    severity: 'HIGH',
  },
  {
  name: 'Generic Secret Assignment',
  regex: /(?:^|[^a-zA-Z])(?:secret_key|token_secret|auth_secret|api_secret|secret_token)\s*[=:]\s*['"]([^'"]{16,})['"]/i,
  severity: 'MEDIUM',
  },
  {
  name: 'High Entropy Secret',
  regex: /(?:secret|password|token|key|auth)\s*[=:]\s*['"]([a-zA-Z0-9+/=]{32,})['"](?!\s*\+)/i,
  severity: 'MEDIUM',
  },
];

const ENV_FILE_PATTERN = /^\.env(\.local|\.development|\.production|\.staging|\.test)?$/;

/**
 * Scans file content for secret patterns.
 * @param {string} content - File content to scan.
 * @param {string} filePath - Path of the file being scanned.
 * @returns {Array<{type: string, severity: string, message: string, file: string, line: number, match: string}>}
 */
export const scanContent = (content, filePath) => {
  const findings = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip comment-only lines and empty lines
    if (/^\s*(\/\/|#|\/\*|\*|<!--)/.test(line) || !line.trim()) continue;

    for (const pattern of SECRET_PATTERNS) {
      const match = line.match(pattern.regex);
      if (match) {
        findings.push({
          type: 'SECRET_EXPOSED',
          severity: pattern.severity,
          message: `${pattern.name} detected`,
          file: filePath,
          line: i + 1,
          match: match[1] ? `${match[1].substring(0, 6)}****` : '[redacted]',
        });
      }
    }
  }

  return findings;
};

/**
 * Checks if a filename represents a .env file that should not be committed.
 * @param {string} fileName - The basename of the file.
 * @returns {{ type: string, severity: string, message: string, file: string } | null}
 */
export const checkEnvFile = (fileName) => {
  if (ENV_FILE_PATTERN.test(fileName)) {
    return {
      type: 'SECRET_EXPOSED',
      severity: 'CRITICAL',
      message: `Environment file "${fileName}" should not be committed to the repository`,
      file: fileName,
    };
  }
  return null;
};

/**
 * Scans a list of files for secrets.
 * @param {Array<{path: string, content: string}>} files - Files to scan.
 * @returns {Array} Combined findings from all files.
 */
export const scanFiles = (files) => {
  const findings = [];

  for (const file of files) {
    const baseName = file.path.split('/').pop();
    const envFinding = checkEnvFile(baseName);
    if (envFinding) {
      envFinding.file = file.path;
      findings.push(envFinding);
    }
    findings.push(...scanContent(file.content, file.path));
  }

  return findings;
};

export { SECRET_PATTERNS, ENV_FILE_PATTERN };
