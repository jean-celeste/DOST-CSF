// "use client"

import { useState } from "react"
import PropTypes from 'prop-types'
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"

// Import the emoji images
import neutralFace from "../../assets/emojis/face_without_mouth_animated.png"
import frowningFace from "../../assets/emojis/frowning_face_animated.png"
import grinningFace from "../../assets/emojis/grinning_face_with_smiling_eyes_animated.png"
import poutingFace from "../../assets/emojis/pouting_face_animated.png"
import heartEyesFace from "../../assets/emojis/smiling_face_with_heart-eyes_animated.png"
import smilingFace from "../../assets/emojis/smiling_face_with_smiling_eyes_animated.png"

export default function Ratings({ onNextStep, onPrevStep }) {
  const [selectedRating, setSelectedRating] = useState("")
  const [hoveredRating, setHoveredRating] = useState("")

  const handleRatingSelect = (value) => {
    setSelectedRating(value)
  }

  const handleContinue = () => {
    if (selectedRating) {
      onNextStep();
    }
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto p-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Service Satisfaction Rating</h2>
        <p className="text-gray-600">I am satisfied with the service that I availed.</p>
      </div>

      <div className="relative pt-28 pb-8"> 
        {/* N/A Option - Top Center */}
        <div
          role="radio"
          aria-checked={selectedRating === "na"}
          tabIndex={0}
          className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center p-4 cursor-pointer transition-all rounded-full w-32 h-32",
            "hover:bg-blue-50 hover:border-blue-300 hover:shadow-md",
            selectedRating === "na" 
              ? "bg-blue-100 border-2 border-blue-500 shadow-md" 
              : "border border-gray-200",
            "transform hover:-translate-y-1"
          )}
          onClick={() => handleRatingSelect("na")}
          onMouseEnter={() => setHoveredRating("na")}
          onMouseLeave={() => setHoveredRating("")}
        >
          <div className={cn(
            "text-3xl font-bold transition-colors",
            selectedRating === "na" || hoveredRating === "na" ? "text-blue-600" : "text-gray-400"
          )}>N/A</div>
          <div className={cn(
            "text-sm font-medium text-center transition-colors",
            selectedRating === "na" || hoveredRating === "na" ? "text-blue-600" : "text-gray-500"
          )}>Not Applicable</div>
        </div>

        {/* Middle Row - Semi-circle */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div
            role="radio"
            aria-checked={selectedRating === "neutral"}
            tabIndex={0}
            className={cn(
              "flex flex-col items-center justify-center p-3 cursor-pointer transition-all rounded-full w-28 h-28 mx-auto",
              "hover:bg-blue-50 hover:border-blue-300 hover:shadow-md",
              selectedRating === "neutral" 
                ? "bg-blue-100 border-2 border-blue-500 shadow-md" 
                : "border border-gray-200",
              "transform hover:-translate-y-1"
            )}
            onClick={() => handleRatingSelect("neutral")}
            onMouseEnter={() => setHoveredRating("neutral")}
            onMouseLeave={() => setHoveredRating("")}
          >
            <div className={cn(
              "relative w-16 h-16 mb-2 transition-transform",
              (selectedRating === "neutral" || hoveredRating === "neutral") && "scale-110"
            )}>
              <img 
                src={neutralFace} 
                alt="Neutral face" 
                className="w-full h-full object-contain drop-shadow-sm" 
              />
            </div>
            <div className={cn(
              "text-sm font-medium text-center transition-colors",
              selectedRating === "neutral" || hoveredRating === "neutral" ? "text-blue-600" : "text-gray-700"
            )}>Neither Agree nor Disagree</div>
          </div>

          <div
            role="radio"
            aria-checked={selectedRating === "strongly-agree"}
            tabIndex={0}
            className={cn(
              "flex flex-col items-center justify-center p-3 cursor-pointer transition-all rounded-full w-36 h-36 mx-auto -mt-4",
              "hover:bg-blue-50 hover:border-blue-300 hover:shadow-lg",
              selectedRating === "strongly-agree" 
                ? "bg-blue-100 border-2 border-blue-500 shadow-lg" 
                : "border border-blue-200 bg-blue-50/30",
              "transform hover:-translate-y-2"
            )}
            onClick={() => handleRatingSelect("strongly-agree")}
            onMouseEnter={() => setHoveredRating("strongly-agree")}
            onMouseLeave={() => setHoveredRating("")}
          >
            <div className={cn(
              "relative w-20 h-20 mb-2 transition-transform",
              (selectedRating === "strongly-agree" || hoveredRating === "strongly-agree") && "scale-110"
            )}>
              <img 
                src={heartEyesFace} 
                alt="Heart eyes face" 
                className="w-full h-full object-contain drop-shadow-md" 
              />
              {(selectedRating === "strongly-agree" || hoveredRating === "strongly-agree") && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  ★
                </div>
              )}
            </div>
            <div className="text-sm font-medium text-blue-600 text-center">Strongly Agree</div>
          </div>

          <div
            role="radio"
            aria-checked={selectedRating === "agree"}
            tabIndex={0}
            className={cn(
              "flex flex-col items-center justify-center p-3 cursor-pointer transition-all rounded-full w-28 h-28 mx-auto",
              "hover:bg-blue-50 hover:border-blue-300 hover:shadow-md",
              selectedRating === "agree" 
                ? "bg-blue-100 border-2 border-blue-500 shadow-md" 
                : "border border-gray-200",
              "transform hover:-translate-y-1"
            )}
            onClick={() => handleRatingSelect("agree")}
            onMouseEnter={() => setHoveredRating("agree")}
            onMouseLeave={() => setHoveredRating("")}
          >
            <div className={cn(
              "relative w-16 h-16 mb-2 transition-transform",
              (selectedRating === "agree" || hoveredRating === "agree") && "scale-110"
            )}>
              <img 
                src={smilingFace} 
                alt="Smiling face" 
                className="w-full h-full object-contain drop-shadow-sm" 
              />
            </div>
            <div className={cn(
              "text-sm font-medium text-center transition-colors",
              selectedRating === "agree" || hoveredRating === "agree" ? "text-blue-600" : "text-gray-700"
            )}>Agree</div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-2 gap-8 max-w-sm mx-auto">
          <div
            role="radio"
            aria-checked={selectedRating === "strongly-disagree"}
            tabIndex={0}
            className={cn(
              "flex flex-col items-center justify-center p-3 cursor-pointer transition-all rounded-full w-28 h-28 mx-auto",
              "hover:bg-blue-50 hover:border-blue-300 hover:shadow-md",
              selectedRating === "strongly-disagree" 
                ? "bg-blue-100 border-2 border-blue-500 shadow-md" 
                : "border border-gray-200",
              "transform hover:-translate-y-1"
            )}
            onClick={() => handleRatingSelect("strongly-disagree")}
            onMouseEnter={() => setHoveredRating("strongly-disagree")}
            onMouseLeave={() => setHoveredRating("")}
          >
            <div className={cn(
              "relative w-16 h-16 mb-2 transition-transform",
              (selectedRating === "strongly-disagree" || hoveredRating === "strongly-disagree") && "scale-110"
            )}>
              <img 
                src={poutingFace} 
                alt="Pouting face" 
                className="w-full h-full object-contain drop-shadow-sm" 
              />
            </div>
            <div className={cn(
              "text-sm font-medium text-center transition-colors",
              selectedRating === "strongly-disagree" || hoveredRating === "strongly-disagree" ? "text-blue-600" : "text-gray-700"
            )}>Strongly Disagree</div>
          </div>

          <div
            role="radio"
            aria-checked={selectedRating === "disagree"}
            tabIndex={0}
            className={cn(
              "flex flex-col items-center justify-center p-3 cursor-pointer transition-all rounded-full w-28 h-28 mx-auto",
              "hover:bg-blue-50 hover:border-blue-300 hover:shadow-md",
              selectedRating === "disagree" 
                ? "bg-blue-100 border-2 border-blue-500 shadow-md" 
                : "border border-gray-200",
              "transform hover:-translate-y-1"
            )}
            onClick={() => handleRatingSelect("disagree")}
            onMouseEnter={() => setHoveredRating("disagree")}
            onMouseLeave={() => setHoveredRating("")}
          >
            <div className={cn(
              "relative w-16 h-16 mb-2 transition-transform",
              (selectedRating === "disagree" || hoveredRating === "disagree") && "scale-110"
            )}>
              <img 
                src={frowningFace} 
                alt="Frowning face" 
                className="w-full h-full object-contain drop-shadow-sm" 
              />
            </div>
            <div className={cn(
              "text-sm font-medium text-center transition-colors",
              selectedRating === "disagree" || hoveredRating === "disagree" ? "text-blue-600" : "text-gray-700"
            )}>Disagree</div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 w-full pt-6">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={onPrevStep}
        >
          Back
        </Button>
        <Button 
          className="w-full" 
          disabled={!selectedRating} 
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

// Props validation
Ratings.propTypes = {
  onNextStep: PropTypes.func.isRequired,
  onPrevStep: PropTypes.func.isRequired
}