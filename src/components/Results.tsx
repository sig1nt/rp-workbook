import React from 'react';
import { CompetitorResult } from './RankingsInput';

interface ResultsProps {
  results: CompetitorResult[];
  numJudges: number;
}

const Results: React.FC<ResultsProps> = ({ results, numJudges }) => {
  const maxPlace = results.length;

  return (
    <div>
      <h2>Final Results</h2>
      <table border={1} cellPadding={5} style={{ margin: '0 auto', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Competitor</th>
            {Array.from({ length: numJudges }, (_, idx) => (
              <th key={`J${idx + 1}`}>J{idx + 1}</th>
            ))}
            {Array.from({ length: maxPlace }, (_, idx) => (
              <th key={`1-${idx + 1}`}>1-{idx + 1}</th>
            ))}
            <th>Place</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.competitor}>
              <td>{result.competitor}</td>
              {result.scores.map((score, idx) => (
                <td key={`score-${idx}`}>{score}</td>
              ))}
              {result.cumulativeCounts.map((cumulativeCount, idx) => {
                const isHighlighted =
                  result.highlightPlace !== null && idx === result.highlightPlace;
                return (
                  <td
                    key={`cumulative-${idx}`}
                    className={isHighlighted ? 'highlight' : undefined}
                  >
                    {cumulativeCount}{isHighlighted ? ' (' + result.sumOfScoresAtMajority.toString() + ')' : ''}
                  </td>
                );
              })}
              <td>{ordinalSuffix(result.place)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ordinalSuffix = (i: number): string => {
  const j = i % 10,
    k = i % 100;
  if (j === 1 && k !== 11) {
    return i + 'st';
  }
  if (j === 2 && k !== 12) {
    return i + 'nd';
  }
  if (j === 3 && k !== 13) {
    return i + 'rd';
  }
  return i + 'th';
};

export default Results;
