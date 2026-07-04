import { useEffect, useState } from 'react';
import { useApiRetry } from '../../hooks/useApiRetry.js';
import './TeamWorkloadAnalytics.css';

const TeamWorkloadAnalytics = () => {
  const [workload, setWorkload] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('totalLoad');
  const [selectedContributor, setSelectedContributor] = useState(null);
  const { retryRequest } = useApiRetry();

  useEffect(() => {
    const fetchWorkload = async () => {
      try {
        setLoading(true);
        const response = await retryRequest('/api/v1/team/workload');
        setWorkload(response.data.workload || []);
      } catch (err) {
        setError(err.message || 'Failed to load workload data');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkload();
  }, [retryRequest]);

  const getSortedWorkload = () => {
    const sorted = [...workload];
    switch (sortBy) {
      case 'issues':
        return sorted.sort((a, b) => b.openIssues - a.openIssues);
      case 'reviews':
        return sorted.sort((a, b) => b.reviewRequests - a.reviewRequests);
      case 'resolutionTime':
        return sorted.sort((a, b) => b.avgIssueResolutionDays - a.avgIssueResolutionDays);
      case 'reviewTime':
        return sorted.sort((a, b) => b.avgReviewDays - a.avgReviewDays);
      default:
        return sorted;
    }
  };

  const getLoadLevel = (issues, reviews) => {
    const total = issues + reviews;
    if (total >= 15) return 'overloaded';
    if (total >= 10) return 'busy';
    if (total >= 5) return 'moderate';
    return 'light';
  };

  if (loading) {
    return <div className="team-workload loading">Loading team workload...</div>;
  }

  if (error) {
    return <div className="team-workload error">Error: {error}</div>;
  }

  const sortedData = getSortedWorkload();
  const selectedData = selectedContributor
    ? workload.find((w) => w.login === selectedContributor)
    : null;

  return (
    <div className="team-workload-container">
      <div className="workload-header">
        <h2>Team Workload Analytics</h2>
        <p className="subtitle">Distribution of open issues and PR reviews across team members</p>
      </div>

      <div className="workload-controls">
        <label>Sort by:</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="totalLoad">Total Workload</option>
          <option value="issues">Open Issues</option>
          <option value="reviews">Review Requests</option>
          <option value="resolutionTime">Avg Issue Resolution Time</option>
          <option value="reviewTime">Avg Review Time</option>
        </select>
      </div>

      <div className="workload-table-container">
        <table className="workload-table">
          <thead>
            <tr>
              <th>Contributor</th>
              <th>Open Issues</th>
              <th>Review Requests</th>
              <th>Avg Resolution (days)</th>
              <th>Avg Review Time (days)</th>
              <th>Load Level</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((contributor) => {
              const loadLevel = getLoadLevel(contributor.openIssues, contributor.reviewRequests);
              return (
                <tr
                  key={contributor.login}
                  className={`workload-row load-${loadLevel}`}
                  onClick={() => setSelectedContributor(contributor.login)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="contributor-name">{contributor.login}</td>
                  <td className="issues-count">{contributor.openIssues}</td>
                  <td className="review-count">{contributor.reviewRequests}</td>
                  <td className="resolution-time">{contributor.avgIssueResolutionDays.toFixed(1)}</td>
                  <td className="review-time">{contributor.avgReviewDays.toFixed(1)}</td>
                  <td className={`load-badge load-${loadLevel}`}>{loadLevel}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedData && (
        <div className="workload-details">
          <div className="details-header">
            <h3>Details for {selectedData.login}</h3>
            <button onClick={() => setSelectedContributor(null)}>Close</button>
          </div>

          <div className="details-metrics">
            <div className="metric">
              <label>Open Issues</label>
              <div className="metric-value">{selectedData.openIssues}</div>
            </div>
            <div className="metric">
              <label>Review Requests</label>
              <div className="metric-value">{selectedData.reviewRequests}</div>
            </div>
            <div className="metric">
              <label>Total Workload</label>
              <div className="metric-value">{selectedData.openIssues + selectedData.reviewRequests}</div>
            </div>
            <div className="metric">
              <label>Avg Resolution Time</label>
              <div className="metric-value">{selectedData.avgIssueResolutionDays.toFixed(1)} days</div>
            </div>
          </div>
        </div>
      )}

      <div className="workload-legend">
        <h4>Load Levels</h4>
        <div className="legend-items">
          <div className="legend-item load-light">
            <span className="legend-color"></span>
            <span>Light (0-4 items)</span>
          </div>
          <div className="legend-item load-moderate">
            <span className="legend-color"></span>
            <span>Moderate (5-9 items)</span>
          </div>
          <div className="legend-item load-busy">
            <span className="legend-color"></span>
            <span>Busy (10-14 items)</span>
          </div>
          <div className="legend-item load-overloaded">
            <span className="legend-color"></span>
            <span>Overloaded (15+ items)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamWorkloadAnalytics;
