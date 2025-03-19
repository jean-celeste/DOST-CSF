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
    <div className="p-8 bg-white rounded-lg max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">Which of the following best describes your awareness of a CC?</h2>
      <div className="space-y-4">
        {options.map((option, index) => (
          <button
            key={index}
            className={`w-full p-4 rounded-lg text-left ${selectedOption === option ? 'bg-blue-100 border border-blue-500' : 'bg-gray-100'} hover:bg-blue-50`}
            onClick={() => handleOptionChange(option)}
          >
            <span className="text-gray-800">{option}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          className="px-6 py-2 bg-gray-100 text-gray-700"
          onClick={onPrevStep}
        >
          Go Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedOption}
          className={`px-6 py-2 ${!selectedOption ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
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