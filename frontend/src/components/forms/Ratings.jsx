// "use client"

import { useState } from "react";
import PropTypes from 'prop-types';
import { Button } from "../ui/button";
import RatingQuestion from '../forms-resources/RatingQuestion';

// Import the emoji images
import heartEyesFace from "../../assets/emojis/smiling_face_with_heart-eyes_animated.png";
import smilingFace from "../../assets/emojis/smiling_face_with_smiling_eyes_animated.png";
import neutralFace from "../../assets/emojis/face_without_mouth_animated.png";
import frowningFace from "../../assets/emojis/frowning_face_animated.png";
import poutingFace from "../../assets/emojis/pouting_face_animated.png";

import heartEyesFaceStatic from "../../assets/emojis/smiling_face_with_heart-eyes_color.svg";
import smilingFaceStatic from "../../assets/emojis/smiling_face_with_smiling_eyes_color.svg";
import neutralFaceStatic from "../../assets/emojis/face_without_mouth_color.svg";
import frowningFaceStatic from "../../assets/emojis/frowning_face_color.svg";
import poutingFaceStatic from "../../assets/emojis/pouting_face_color.svg";

export default function Ratings({ onNextStep, onPrevStep }) {
  const [ratings, setRatings] = useState({
    question1: "",
    question2: "",
    question3: ""
  });

  const handleRatingSelect = (questionKey, value) => {
    setRatings({
      ...ratings,
      [questionKey]: value
    });
  };

  const handleContinue = () => {
    // You could add validation here if needed
    onNextStep();
  };

  // Define emoji options once to reuse
  const emojiOptions = [
    {
      value: "strongly-agree",
      label: "Strongly Agree",
      imageSource: heartEyesFace,
      imageSourceStatic: heartEyesFaceStatic
    },
    {
      value: "agree",
      label: "Agree",
      imageSource: smilingFace,
      imageSourceStatic: smilingFaceStatic
    },
    {
      value: "disagree",
      label: "Disagree",
      imageSource: frowningFace,
      imageSourceStatic: frowningFaceStatic
    },
    {
      value: "neutral",
      label: "Neither Agree\nor Disagree",
      imageSource: neutralFace,
      imageSourceStatic: neutralFaceStatic
    },
    {
      value: "strongly-disagree",
      label: "Strongly Disagree",
      imageSource: poutingFace,
      imageSourceStatic: poutingFaceStatic
    },
    {
      value: "na",
      label: "Not Applicable",
      imageSource: null
    }
  ];
  
  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4">  
      {/* First question */}
      <RatingQuestion
        question="I am satisfied with the service that I availed."
        questionId={0}
        totalQuestions={8}
        selectedRating={ratings.question1}
        onRatingSelect={(value) => handleRatingSelect("question1", value)}
        emojiOptions={emojiOptions}
      />
      
      {/* Second question */}
      <RatingQuestion
        question="I spent a reasonable amount of time for my transaction."
        questionId={1}
        totalQuestions={8}
        selectedRating={ratings.question2}
        onRatingSelect={(value) => handleRatingSelect("question2", value)}
        emojiOptions={emojiOptions}
      />
      
      {/* Third question */}
      <RatingQuestion
        question="The office followed the transaction's requirements and steps based on the information provided."
        questionId={2}
        totalQuestions={8}
        selectedRating={ratings.question3}
        onRatingSelect={(value) => handleRatingSelect("question3", value)}
        emojiOptions={emojiOptions}
      />

      <div className="flex justify-between gap-4 w-full">
        <Button 
          variant="outline" 
          className="px-6 py-2 bg-gray-100 text-gray-700"
          onClick={onPrevStep}
        >
          Go Back
        </Button>
        
        <div className="flex-1 flex justify-center items-center">
          <div className="flex space-x-2">
            <div className="w-8 h-2 bg-blue-600 rounded"></div>
            <div className="w-8 h-2 bg-gray-300 rounded"></div>
            <div className="w-8 h-2 bg-gray-300 rounded"></div>
          </div>
        </div>
        
        <Button 
          className="px-6 py-2 bg-blue-600 text-white"
          onClick={handleContinue}
          disabled={!ratings.question1 && !ratings.question2 && !ratings.question3}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

Ratings.propTypes = {
  onNextStep: PropTypes.func.isRequired,
  onPrevStep: PropTypes.func.isRequired
};