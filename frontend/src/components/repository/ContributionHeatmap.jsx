import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApiRetry } from '../../hooks/useApiRetry.js';
import './ContributionHeatmap.css';

const ContributionHeatmap = () => {
  const { username, reponame } = useParams();
  const [heatmapData, setHeatmapData] = useState(null);
  const [selectedContributor, setSelectedContributor] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const { retryRequest } = useApiRetry();

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        setLoading(true);
        const params = selectedContributor ? `?contributor=${selectedContributor}` : '';
        const response = await retryRequest(
          `/api/v1/repositories/${username}/${reponame}/heatmap${params}`
        );

        setHeatmapData(response.data.heatmap);
        if (!selectedContributor && response.data.contributors) {
          setContributors(response.data.contributors);
        }
      } catch (err) {
        setError(err.message || 'Failed to load heatmap data');
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmapData();
  }, [username, reponame, selectedContributor, retryRequest]);

  const getColorClass = (count) => {
    if (count === 0) return 'heatmap-cell-0';
    if (count === 1) return 'heatmap-cell-1';
    if (count === 2) return 'heatmap-cell-2';
    if (count === 3) return 'heatmap-cell-3';
    if (count === 4) return 'heatmap-cell-4';
    return 'heatmap-cell-5';
  };

  const getWeeks = () => {
    if (!heatmapData || !heatmapData.days) return [];
    const weeks = [];
    const daysCopy = [...heatmapData.days];

    while (daysCopy.length > 0) {
      weeks.push(daysCopy.splice(0, 7));
    }

    return weeks;
  };

  if (loading) {
    return <div className="contribution-heatmap loading">Loading contribution data...</div>;
  }

  if (error) {
    return <div className="contribution-heatmap error">Error: {error}</div>;
  }

  if (!heatmapData) {
    return <div className="contribution-heatmap">No heatmap data available</div>;
  }

  const weeks = getWeeks();

  return (
    <div className="contribution-heatmap-container">
      <div className="heatmap-header">
        <h3>Contribution Heatmap</h3>
        <p className="subtitle">Commit activity over the last 52 weeks</p>
      </div>

      {contributors.length > 0 && (
        <div className="contributor-filter">
          <label>Filter by contributor:</label>
          <select
            value={selectedContributor || ''}
            onChange={(e) => setSelectedContributor(e.target.value || null)}
          >
            <option value="">All Contributors</option>
            {contributors.map((contrib) => (
              <option key={contrib.id} value={contrib.id}>
                {contrib.name} ({contrib.commitCount} commits)
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="heatmap-wrapper">
        <div className="heatmap-grid">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="heatmap-week">
              {week.map((day, dayIdx) => (
                <div
                  key={`${weekIdx}-${dayIdx}`}
                  className={`heatmap-cell ${getColorClass(day.count)}`}
                  title={`${day.date}: ${day.count} commits`}
                  onMouseEnter={() => setHoveredCell({ date: day.date, count: day.count })}
                  onMouseLeave={() => setHoveredCell(null)}
                  role="img"
                  aria-label={`${day.date}: ${day.count} ${day.count === 1 ? 'commit' : 'commits'}`}
                />
              ))}
            </div>
          ))}
        </div>

        {hoveredCell && (
          <div className="heatmap-tooltip">
            <strong>{hoveredCell.date}</strong>
            <br />
            {hoveredCell.count} {hoveredCell.count === 1 ? 'commit' : 'commits'}
          </div>
        )}
      </div>

      <div className="heatmap-legend">
        <span>Less</span>
        {[0, 1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`heatmap-cell ${getColorClass(level)}`}
            title={level === 5 ? '5+ commits' : `${level} commits`}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

export default ContributionHeatmap;
