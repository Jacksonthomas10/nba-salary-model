import { useState } from "react";

export default function FirstUseWalkthrough({ onClose }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to the Salary Value Model",
      body: (
        <>
          <p>
            This tool evaluates NBA contracts using <strong>PIE</strong> —
            a box-score impact metric — to compare <strong>impact vs cost</strong>.
          </p>
        </>
      ),
    },
    {
      title: "What This Model Actually Does",
      body: (
        <ul>
          <li>Normalizes player impact using PIE</li>
          <li>Accounts for role and tier (not reputation)</li>
          <li>Evaluates contracts relative to cap context</li>
        </ul>
      ),
    },
    {
      title: "How to Use It",
      body: (
        <ul>
          <li>Search for a player</li>
          <li>Adjust availability assumptions if needed</li>
          <li>Read the contract evaluation — not just salary</li>
        </ul>
      ),
    },
    {
      title: "Key Insight",
      body: (
        <p>
          <strong>High-salary players can still be elite value</strong>.
          This model cares about impact per dollar — not headlines.
        </p>
      ),
    },
  ];

  const isLast = step === steps.length - 1;

  return (
    <div className="walkthrough-overlay">
      <div className="walkthrough-modal">
        <h2>{steps[step].title}</h2>

        <div className="walkthrough-body">
          {steps[step].body}
        </div>

        <div className="walkthrough-actions">
          <button
            className="secondary-btn"
            onClick={onClose}
          >
            Skip
          </button>

          <button
            className="primary-btn"
            onClick={() =>
              isLast ? onClose() : setStep(step + 1)
            }
          >
            {isLast ? "Start Exploring" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

