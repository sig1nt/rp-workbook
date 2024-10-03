import React, { useState } from 'react';

interface SetupFormProps {
  setCompetitors: React.Dispatch<React.SetStateAction<string[]>>;
  setNumJudges: React.Dispatch<React.SetStateAction<number | null>>;
}

const SetupForm: React.FC<SetupFormProps> = ({ setCompetitors, setNumJudges }) => {
  const [numCompetitors, setNumCompetitors] = useState<number>(0);
  const [judges, setJudges] = useState<string>('');
  const [competitorNames, setCompetitorNames] = useState<string[]>([]);

  const handleNumCompetitorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setNumCompetitors(value);
    setCompetitorNames(Array(value).fill(''));
  };

  const handleCompetitorNameChange = (index: number, value: string) => {
    const newNames = [...competitorNames];
    newNames[index] = value;
    setCompetitorNames(newNames);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCompetitors(competitorNames);
    setNumJudges(parseInt(judges));
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Number of Competitors:
        <input
          type="number"
          value={numCompetitors || ''}
          onChange={handleNumCompetitorsChange}
          min="1"
          required
        />
      </label>
      <br />
      {competitorNames.map((name, index) => (
        <div key={index}>
          <label>
            Competitor {index + 1} Name:
            <input
              type="text"
              value={name}
              onChange={(e) => handleCompetitorNameChange(index, e.target.value)}
              required
            />
          </label>
        </div>
      ))}
      <br />
      <label>
        Number of Judges:
        <input
          type="number"
          value={judges}
          onChange={(e) => setJudges(e.target.value)}
          min="1"
          required
        />
      </label>
      <br />
      <button type="submit">Next</button>
    </form>
  );
};

export default SetupForm;
