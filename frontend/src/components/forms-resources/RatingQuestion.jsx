import PropTypes from 'prop-types';
import EmojiRatingOption from './EmojiRatingOption';

export default function RatingQuestion({ 
  question, 
  questionId, 
  totalQuestions, 
  selectedRating, 
  onRatingSelect,
  emojiOptions
}) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm w-full">
      <div className="flex justify-between items-center mb-6">
        <p className="font-medium text-gray-900 text-lg">{question}</p>
        <div className="text-sm text-gray-500">
          <span className="inline-flex items-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 mr-1" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2"/>
            </svg>
            SQD{questionId + 1} / SQD{totalQuestions}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
        {emojiOptions.map((option) => (
          <EmojiRatingOption
            key={option.value}
            value={option.value}
            label={option.label}
            imageSource={option.imageSource}
            staticImageSource={option.imageSourceStatic}
            isSelected={selectedRating === option.value}
            onSelect={onRatingSelect}
            isNA={option.value === 'na'}
          />
        ))}
      </div>
    </div>
  );
}

RatingQuestion.propTypes = {
  question: PropTypes.string.isRequired,
  questionId: PropTypes.number.isRequired,
  totalQuestions: PropTypes.number.isRequired,
  selectedRating: PropTypes.string,
  onRatingSelect: PropTypes.func.isRequired,
  emojiOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      imageSource: PropTypes.string,
      imageSourceStatic: PropTypes.string,
    })
  ).isRequired
};