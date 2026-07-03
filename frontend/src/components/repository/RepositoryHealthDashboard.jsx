import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApiRetry } from '../../hooks/useApiRetry.js';
import './RepositoryHealthDashboard.css';

const HealthScoreBadge = ({ score }) => {
  const getScoreColor = (score) => {
    if (score >= 75) return 'health-score-green';
    if (score >= 50) return 'health-score-yellow';
    return 'health-score-red';
  };

  const getScoreLabel = (score) => {
    if (score >= 75) return 'Healthy';
    if (score >= 50) return 'At Risk';
    return 'Critical';
  };

  return (
    <div className={`health-score-badge ${getScoreColor(score)}`}>
      <div className="score-value">{score}</div>
      <div className="score-label">{getScoreLabel(score)}</div>
    </div>
  );
};

const MetricCard = ({ title, value, percentage, description }) => {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <h4>{title}</h4>
      </div>
      <div className="metric-body">
        <div className="metric-value">{value}</div>
        {percentage !== undefined && (
          <div className="metric-percentage">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <span>{percentage}%</span>
          </div>
        )}
        {description && <p className="metric-description">{description}</p>}
      </div>
    </div>
  );
};

export const RepositoryHealthDashboard = () => {
  const { username, reponame } = useParams();
  const [health, setHealth] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { retryRequest } = useApiRetry();

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        setLoading(true);
        const [healthRes, breakdownRes, recommendationsRes] = await Promise.all([
          retryRequest(`/api/v1/repositories/${username}/${reponame}/health`),
          retryRequest(`/api/v1/repositories/${username}/${reponame}/health/breakdown`),
          retryRequest(`/api/v1/repositories/${username}/${reponame}/health/recommendations`),
        ]);

        setHealth(healthRes.data);
        setBreakdown(breakdownRes.data);
        setRecommendations(recommendationsRes.data);
      } catch (err) {
        setError(err.message || 'Failed to load health data');
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, [username, reponame, retryRequest]);

  if (loading) {
    return <div className="health-dashboard loading">Loading repository health...</div>;
  }

  if (error) {
    return <div className="health-dashboard error">Error: {error}</div>;
  }

  if (!health) {
    return <div className="health-dashboard">No health data available</div>;
  }

  const { summary } = health;

  return (
    <div className="repository-health-dashboard">
      <div className="health-header">
        <h2>Repository Health Score</h2>
        <p className="subtitle">Comprehensive metrics for {reponame}</p>
      </div>

      <div className="health-overview">
        <HealthScoreBadge score={summary?.overallScore || 0} />

        <div className="health-metrics-grid">
          {breakdown?.metrics && breakdown.metrics.map((metric) => (
            <MetricCard
              key={metric.name}
              title={metric.label}
              value={metric.value}
              percentage={metric.percentage}
              description={metric.description}
            />
          ))}
        </div>
      </div>

      {recommendations?.recommendations && recommendations.recommendations.length > 0 && (
        <div className="health-recommendations">
          <h3>Recommendations for Improvement</h3>
          <ul className="recommendations-list">
            {recommendations.recommendations.map((rec, idx) => (
              <li key={idx} className={`recommendation priority-${rec.priority}`}>
                <span className="priority-badge">{rec.priority.toUpperCase()}</span>
                <div className="recommendation-content">
                  <p className="recommendation-text">{rec.text}</p>
                  {rec.impact && <small className="recommendation-impact">Impact: {rec.impact}</small>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RepositoryHealthDashboard;
