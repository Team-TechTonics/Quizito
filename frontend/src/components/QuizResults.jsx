
import React from 'react';


const QuizResults = ({ results = [], quizTitle = 'Quiz Results' }) => {
  const calculateAverage = () => {
    if (results.length === 0) return 0;
    const total = results.reduce((sum, result) => sum + result.score, 0);
    return (total / results.length).toFixed(1);
  };

  const getHighestScore = () => {
    if (results.length === 0) return null;
    return results.reduce((max, result) => 
      result.score > max.score ? result : max
    );
  };

  return (
    <div className="quiz-results-container">
      <h2 className="quiz-results-title">{quizTitle}</h2>
      
      <div className="results-summary">
        <div className="summary-card">
          <h3>Average Score</h3>
          <p className="summary-value">{calculateAverage()}%</p>
        </div>
        <div className="summary-card">
          <h3>Total Participants</h3>
          <p className="summary-value">{results.length}</p>
        </div>
        <div className="summary-card">
          <h3>Highest Score</h3>
          <p className="summary-value">
            {results.length > 0 ? `${getHighestScore().score}%` : 'N/A'}
          </p>
          {results.length > 0 && (
            <p className="summary-detail">
              by {getHighestScore().participantName}
            </p>
          )}
        </div>
      </div>

      <div className="results-table">
        <h3>Detailed Results</h3>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Participant</th>
              <th>Score</th>
              <th>Time Taken</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {results.length > 0 ? (
              results
                .sort((a, b) => b.score - a.score)
                .map((result, index) => (
                  <tr key={result.id}>
                    <td>{index + 1}</td>
                    <td>{result.participantName}</td>
                    <td>{result.score}%</td>
                    <td>{result.timeTaken}</td>
                    <td>{result.date}</td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results">
                  No results available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuizResults;
