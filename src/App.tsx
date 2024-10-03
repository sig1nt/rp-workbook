import React, { useState } from 'react';
import SetupForm from './components/SetupForm';
import RankingsInput from './components/RankingsInput';
import Results from './components/Results';
import { CompetitorResult } from './components/RankingsInput';
import './App.css';

const App: React.FC = () => {
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [numJudges, setNumJudges] = useState<number | null>(null);
  const [results, setResults] = useState<Array<CompetitorResult> | null>(null);

  return (
    <div className="App">
      <h1>Relative Placement Scoring System</h1>
      {competitors.length === 0 || !numJudges ? (
        <SetupForm setCompetitors={setCompetitors} setNumJudges={setNumJudges} />
      ) : !results ? (
        <RankingsInput
          competitors={competitors}
          numJudges={numJudges}
          setResults={setResults}
        />
      ) : (
        <Results results={results} numJudges={numJudges} />
      )}
    </div>
  );
};

export default App;
