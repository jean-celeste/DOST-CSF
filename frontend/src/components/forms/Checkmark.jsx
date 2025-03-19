// frontend/src/components/forms/Checkmark.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@/components/ui/button';

const Checkmark = ({ onNextStep, onPrevStep }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const options = [
    "I know what a CC is and I saw this office's CC.",
    "I know what a CC is but I did NOT see this office's CC.",
    "I learned of the CC only when I saw this office's CC.",
    "I do not know what a CC is and I did not see one in this office."
  ];

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (selectedOption) {
      onNextStep();
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-6">
        Which of the following best describes your awareness of a CC?
      </h2>
      
      <div className="space-y-4">
        {options.map((option, index) => (
          <button
            key={index}
            className={`w-full p-4 rounded-xl text-left transition-all
              ${selectedOption === option 
                ? 'bg-blue-100 border border-blue-500' 
                : 'bg-white border border-gray-200'
              } hover:border-blue-400`}
            onClick={() => handleOptionChange(option)}
          >
            <span className="text-base">{option}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-between mt-20">
        <Button
          variant="outline"
          className="px-6 py-2 bg-gray-100 rounded-lg"
          onClick={onPrevStep}
        >
          Go Back
        </Button>
        <Button
          variant="gradient"
          className="px-6 py-2 rounded-lg"
          onClick={handleSubmit}
          disabled={!selectedOption}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

Checkmark.propTypes = {
  onNextStep: PropTypes.func.isRequired,
  onPrevStep: PropTypes.func.isRequired
};

export default Checkmark;