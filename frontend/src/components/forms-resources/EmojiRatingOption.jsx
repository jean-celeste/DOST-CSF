import PropTypes from 'prop-types'

export default function EmojiRatingOption({ 
  value, 
  label, 
  imageSource,
  staticImageSource,
  isSelected, 
  onSelect,
  isNA = false
}) {
  return (
    <div 
      className={`flex flex-col items-center border rounded-lg p-3 
        ${isSelected ? "border-[transparent] bg-gradient-to-b from-[#A25CCB] to-[#FF6161] p-[1px]" : "border-gray-200"} 
        cursor-pointer`}
      onClick={() => onSelect(value)}
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
    >
      <div className={`flex flex-col items-center w-full h-full rounded-lg bg-white ${isSelected ? "p-[10px]" : "p-0"}`}>
        {isNA ? (
          <div className="text-4xl font-bold text-gray-400 mb-1">N/A</div>
        ) : (
          <div className="w-16 h-16 sm:w-20 sm:h-20 mb-2 relative">
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
    </div>
  )
}

EmojiRatingOption.propTypes = {
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  imageSource: PropTypes.string,
  staticImageSource: PropTypes.string,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  isNA: PropTypes.bool
}