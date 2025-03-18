import React from 'react';
import PropTypes from 'prop-types';

const EmojiRatingOption = ({ 
  value, 
  label, 
  imageSource,
  staticImageSource,
  isSelected, 
  onSelect,
  isNA = false
}) => {
  return (
    <div 
      className={`flex flex-col items-center border rounded-lg p-3 
        ${isSelected ? "border-purple-500" : "border-gray-200"} 
        cursor-pointer`}
      onClick={() => onSelect(value)}
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
    >
      {isNA ? (
        <div className="text-4xl font-bold text-gray-400 mb-1">N/A</div>
      ) : (
        <div className="w-12 h-12 sm:w-16 sm:h-16 mb-2 relative">
          {/* Animated image shown only when selected */}
          <img 
            src={imageSource} 
            alt={`${label} emoji`} 
            className={`w-full h-full object-contain absolute top-0 left-0 z-10 transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0'}`} 
          />
          
          {/* Static image shown when not selected */}
          <img 
            src={staticImageSource} 
            alt={`${label} emoji`} 
            className={`w-full h-full object-contain transition-opacity duration-300 ${isSelected ? 'opacity-0' : 'opacity-50'}`} 
          />
        </div>
      )}
      <div className={`text-xs sm:text-sm font-medium text-center ${isSelected ? "text-purple-600" : "text-gray-400"}`}>
        {label}
      </div>
    </div>
  );
};

EmojiRatingOption.propTypes = {
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  imageSource: PropTypes.string,
  staticImageSource: PropTypes.string,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  isNA: PropTypes.bool
};

export default EmojiRatingOption;