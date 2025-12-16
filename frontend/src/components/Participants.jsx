import React, { useState } from 'react';

const Participants = ({ participants = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const filteredParticipants = participants
    .filter(participant =>
      participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'score') {
        comparison = a.score - b.score;
      } else if (sortBy === 'joinedAt') {
        comparison = new Date(a.joinedAt) - new Date(b.joinedAt);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '⬆️' : '⬇️';
  };

  return (
    <div className="participants-container">
      <div className="participants-header">
        <h2>Participants ({participants.length})</h2>
        
        <div className="participants-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search participants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Sort by Name</option>
            <option value="score">Sort by Score</option>
            <option value="joinedAt">Sort by Join Date</option>
          </select>
        </div>
      </div>

      <div className="participants-list">
        {filteredParticipants.length > 0 ? (
          <table className="participants-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>
                  Name {getSortIcon('name')}
                </th>
                <th onClick={() => handleSort('score')}>
                  Score {getSortIcon('score')}
                </th>
                <th>Status</th>
                <th onClick={() => handleSort('joinedAt')}>
                  Joined {getSortIcon('joinedAt')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map((participant) => (
                <tr key={participant.id} className="participant-row">
                  <td className="participant-info">
                    <div className="participant-avatar">
                      {participant.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="participant-name">{participant.name}</div>
                      <div className="participant-email">{participant.email}</div>
                    </div>
                  </td>
                  <td>
                    <div className="score-display">
                      <span className="score-value">{participant.score}%</span>
                      <div className="score-bar">
                        <div 
                          className="score-fill"
                          style={{ width: `${participant.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${participant.status}`}>
                      {participant.status}
                    </span>
                  </td>
                  <td>
                    {new Date(participant.joinedAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button className="action-button view-button">View</button>
                    <button className="action-button remove-button">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-participants">
            <p>No participants found</p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="clear-search-button"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      <div className="participants-stats">
        <div className="stat-card">
          <h3>Active</h3>
          <p>{participants.filter(p => p.status === 'active').length}</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p>{participants.filter(p => p.status === 'completed').length}</p>
        </div>
        <div className="stat-card">
          <h3>Average Score</h3>
          <p>
            {participants.length > 0
              ? Math.round(
                  participants.reduce((sum, p) => sum + p.score, 0) / participants.length
                ) + '%'
              : '0%'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Participants;
