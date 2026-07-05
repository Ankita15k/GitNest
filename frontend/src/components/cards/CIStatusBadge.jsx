import { useEffect, useState } from 'react';
import { useApiRetry } from '../../hooks/useApiRetry.js';
import './CIStatusBadge.css';

const CIStatusBadge = ({ commitSha, repositoryId, pullRequestId }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const { retryRequest } = useApiRetry();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const response = await retryRequest(
          `/api/v1/webhooks/status/${commitSha}?repositoryId=${repositoryId}`
        );
        setStatus(response);
      } catch (err) {
        setStatus(null);
      } finally {
        setLoading(false);
      }
    };

    if (commitSha && repositoryId) {
      fetchStatus();
    }
  }, [commitSha, repositoryId, retryRequest]);

  if (loading || !status) {
    return null;
  }

  const getStatusIcon = (allPassed, hasFailed, isPending) => {
    if (hasFailed) return '✗';
    if (allPassed) return '✓';
    if (isPending) return '⏳';
    return '−';
  };

  const getStatusClass = (allPassed, hasFailed, isPending) => {
    if (hasFailed) return 'ci-status-failure';
    if (allPassed) return 'ci-status-success';
    if (isPending) return 'ci-status-pending';
    return 'ci-status-neutral';
  };

  return (
    <div className="ci-status-badge">
      <div className={`ci-badge ${getStatusClass(status.allPassed, status.hasFailed, status.isPending)}`}>
        <span className="ci-icon">{getStatusIcon(status.allPassed, status.hasFailed, status.isPending)}</span>
        <span className="ci-label">
          {status.hasFailed ? 'Failed' : status.allPassed ? 'Passed' : status.isPending ? 'Running' : 'Neutral'}
        </span>
      </div>

      {status.statuses && status.statuses.length > 0 && (
        <div className="ci-details">
          {status.statuses.map((s, idx) => (
            <div key={idx} className="ci-check">
              <span className={`ci-check-icon ${s.status}`}>
                {s.status === 'success' ? '✓' : s.status === 'failure' ? '✗' : s.status === 'pending' ? '⏳' : '−'}
              </span>
              <span className="ci-check-name">{s.checkName}</span>
              {s.url && (
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="ci-check-link">
                  View
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CIStatusBadge;
