// src/components/RankingsInput.tsx
import React, { useState } from 'react';

export interface CompetitorResult {
  competitor: string;
  scores: number[];
  counts: number[];
  cumulativeCounts: number[];
  majorityColumn: number | null;
  cumulativeCountAtMajority: number;
  sumOfScoresAtMajority: number;
  place: number;
  highlightPlace: number | null; // Added this line
}

interface RankingsInputProps {
  competitors: string[];
  numJudges: number;
  setResults: React.Dispatch<
    React.SetStateAction<Array<CompetitorResult> | null>
  >;
}

const RankingsInput: React.FC<RankingsInputProps> = ({
  competitors,
  numJudges,
  setResults,
}) => {
  const numCompetitors = competitors.length;

  const [rankings, setRankings] = useState<number[][]>(
    Array.from({ length: numJudges }, () => Array(numCompetitors).fill(0))
  );

  const handleInputChange = (judgeIndex: number, competitorIndex: number, value: string) => {
    const newRankings = rankings.map((judgeRankings, idx) =>
      idx === judgeIndex
        ? judgeRankings.map((rank, idx2) => (idx2 === competitorIndex ? parseInt(value) : rank))
        : judgeRankings
    );
    setRankings(newRankings);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedResults = calculateResults(rankings);
    setResults(calculatedResults);
  };

  const calculateResults = (rankings: number[][]): CompetitorResult[] => {
    const numJudges = rankings.length;
    const numCompetitors = rankings[0].length;
    const majority = Math.floor(numJudges / 2) + 1;
  
    // Initialize competitor data
    interface CompetitorData {
      name: string;
      scores: number[];
      counts: number[];
      cumulativeCounts: number[];
      majorityColumn: number | null;
      cumulativeCountAtMajority: number;
      sumOfScoresAtMajority: number;
      place: number | null;
      highlightPlace: number | null;
      tieBreakScores?: number[];
      headToHeadWins?: number;
    }
  
    const competitorsData: CompetitorData[] = competitors.map((name) => ({
      name,
      scores: [],
      counts: Array(numCompetitors).fill(0),
      cumulativeCounts: Array(numCompetitors).fill(0),
      majorityColumn: null,
      cumulativeCountAtMajority: 0,
      sumOfScoresAtMajority: 0,
      place: null,
      highlightPlace: null,
    }));
  
    // Aggregate rankings
    rankings.forEach((judgeRankings) => {
      judgeRankings.forEach((rank, idx) => {
        const competitor = competitorsData[idx];
        competitor.scores.push(rank);
        competitor.counts[rank - 1]++;
      });
    });
  
    // Calculate cumulative counts and determine where each competitor achieves majority
    competitorsData.forEach((competitor) => {
      let cumulative = 0;
      for (let i = 0; i < numCompetitors; i++) {
        cumulative += competitor.counts[i];
        competitor.cumulativeCounts[i] = cumulative;
  
        if (cumulative >= majority && competitor.majorityColumn === null) {
          competitor.majorityColumn = i; // Column index where majority is achieved
          competitor.cumulativeCountAtMajority = cumulative;
  
          // Sum of scores that make up the majority
          let sum = 0;
          for (let j = 0; j <= i; j++) {
            sum += competitor.counts[j] * (j + 1); // (j + 1) because ranks start from 1
          }
          competitor.sumOfScoresAtMajority = sum;
        }
      }
    });
  
    // Determine placements
    let place = 1;
    const placedCompetitors: CompetitorData[] = [];
  
    while (placedCompetitors.length < numCompetitors) {
      // Get competitors not yet placed
      const remainingCompetitors = competitorsData.filter((comp) => comp.place === null);
  
      if (remainingCompetitors.length === 0) break;
  
      // Find the lowest majority column among remaining competitors
      const minMajorityColumn = Math.min(
        ...remainingCompetitors.map((comp) => comp.majorityColumn ?? numCompetitors)
      );
  
      // Get competitors who achieved majority at this column
      let candidates = remainingCompetitors.filter(
        (comp) => comp.majorityColumn === minMajorityColumn
      );
  
      if (candidates.length === 1) {
        // Only one competitor achieved majority at this column
        candidates[0].place = place++;
        candidates[0].highlightPlace = minMajorityColumn; // Set highlightPlace
        placedCompetitors.push(candidates[0]);
      } else {
        // Multiple competitors achieved majority in the same column
        // Compare cumulative counts at majority column
        const maxCumulativeCount = Math.max(
          ...candidates.map((comp) => comp.cumulativeCountAtMajority)
        );
        candidates = candidates.filter(
          (comp) => comp.cumulativeCountAtMajority === maxCumulativeCount
        );
  
        if (candidates.length === 1) {
          candidates[0].place = place++;
          candidates[0].highlightPlace = minMajorityColumn; // Set highlightPlace
          placedCompetitors.push(candidates[0]);
        } else {
          // Sum totals comparison
          const minSumOfScores = Math.min(
            ...candidates.map((comp) => comp.sumOfScoresAtMajority)
          );
          candidates = candidates.filter(
            (comp) => comp.sumOfScoresAtMajority === minSumOfScores
          );
  
          if (candidates.length === 1) {
            candidates[0].place = place++;
            candidates[0].highlightPlace = minMajorityColumn; // Set highlightPlace
            placedCompetitors.push(candidates[0]);
          } else {
            // Next score(s) comparison
            let tieResolved = false;
            const maxRank = numCompetitors;
  
            for (
              let nextRank = minMajorityColumn + 1;
              nextRank < maxRank;
              nextRank++
            ) {
              // Include next rank
              candidates.forEach((comp) => {
                comp.tieBreakScores = comp.scores
                  .filter((score) => score <= nextRank + 1)
                  .sort((a, b) => a - b);
              });
  
              // Recalculate cumulative counts at new rank
              candidates.forEach((comp) => {
                comp.cumulativeCountAtMajority = comp.tieBreakScores!.length;
              });
  
              const maxCumulativeCountNext = Math.max(
                ...candidates.map((comp) => comp.cumulativeCountAtMajority)
              );
  
              const newCandidates = candidates.filter(
                (comp) => comp.cumulativeCountAtMajority === maxCumulativeCountNext
              );
  
              if (newCandidates.length === 1) {
                newCandidates[0].place = place++;
                newCandidates[0].highlightPlace = nextRank; // Set highlightPlace
                placedCompetitors.push(newCandidates[0]);
                tieResolved = true;
                break;
              } else {
                candidates = newCandidates;
              }
            }
  
            if (!tieResolved) {
              // Exact tie - Treat as separate contest
              // Compare head-to-head rankings
              candidates.forEach((comp) => {
                comp.headToHeadWins = 0;
              });
  
              for (let judge = 0; judge < numJudges; judge++) {
                const judgeRankings = rankings[judge];
  
                // Get rankings for tied competitors
                const judgeScores = candidates.map((comp) => {
                  const idx = competitorsData.findIndex((c) => c.name === comp.name);
                  return {
                    competitor: comp,
                    score: judgeRankings[idx],
                  };
                });
  
                // Sort by judge's scores
                judgeScores.sort((a, b) => a.score - b.score);
  
                // Assign head-to-head wins
                for (let i = 0; i < judgeScores.length; i++) {
                  judgeScores[i].competitor.headToHeadWins =
                    (judgeScores[i].competitor.headToHeadWins || 0) +
                    (judgeScores.length - i - 1);
                }
              }
  
              // Determine placement based on head-to-head wins
              const maxWins = Math.max(
                ...candidates.map((comp) => comp.headToHeadWins || 0)
              );
  
              const finalCandidates = candidates.filter(
                (comp) => (comp.headToHeadWins || 0) === maxWins
              );
  
              if (finalCandidates.length === 1) {
                finalCandidates[0].place = place++;
                finalCandidates[0].highlightPlace = minMajorityColumn; // Set highlightPlace
                placedCompetitors.push(finalCandidates[0]);
              } else {
                // Completely equal - Assign same place or decide on further tie-breakers
                finalCandidates.forEach((comp) => {
                  comp.place = place;
                  comp.highlightPlace = null; // No highlight
                  placedCompetitors.push(comp);
                });
                place += finalCandidates.length;
              }
            }
          }
        }
      }
    }
  
    // Prepare final results
    const finalResults: CompetitorResult[] = competitorsData
      .map((data) => ({
        competitor: data.name,
        scores: data.scores,
        counts: data.counts,
        cumulativeCounts: data.cumulativeCounts,
        majorityColumn: data.majorityColumn,
        cumulativeCountAtMajority: data.cumulativeCountAtMajority,
        sumOfScoresAtMajority: data.sumOfScoresAtMajority,
        place: data.place!,
        highlightPlace: data.highlightPlace,
      }))
      .sort((a, b) => a.place - b.place);
  
    return finalResults;
  };


  return (
    <form onSubmit={handleSubmit}>
      {rankings.map((judgeRankings, judgeIndex) => (
        <div key={judgeIndex}>
          <h3>Judge {judgeIndex + 1}</h3>
          {judgeRankings.map((rank, competitorIndex) => (
            <div key={competitorIndex}>
              <label>
                {competitors[competitorIndex]} Rank:
                <input
                  type="number"
                  value={rank || ''}
                  onChange={(e) =>
                    handleInputChange(judgeIndex, competitorIndex, e.target.value)
                  }
                  min="1"
                  max={numCompetitors}
                  required
                />
              </label>
            </div>
          ))}
        </div>
      ))}
      <button type="submit">Calculate Results</button>
    </form>
  );
};

export default RankingsInput;
