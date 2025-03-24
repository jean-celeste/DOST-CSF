"use client"

import { useState } from "react";
import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import RatingQuestion from '@/components/forms-resources/RatingQuestion';

//Animated emojis
const heartEyesFace = "/assets/emojis/smiling_face_with_heart-eyes_animated.png";
const smilingFace = "/assets/emojis/smiling_face_with_smiling_eyes_animated.png";
const neutralFace = "/assets/emojis/face_without_mouth_animated.png";
const frowningFace = "/assets/emojis/frowning_face_animated.png";
const poutingFace = "/assets/emojis/pouting_face_animated.png";

//STatic emojis
const heartEyesFaceStatic = "/assets/emojis/smiling_face_with_heart-eyes_color.svg";
const smilingFaceStatic = "/assets/emojis/smiling_face_with_smiling_eyes_color.svg";
const neutralFaceStatic = "/assets/emojis/face_without_mouth_color.svg";
const frowningFaceStatic = "/assets/emojis/frowning_face_color.svg";
const poutingFaceStatic = "/assets/emojis/pouting_face_color.svg";

export default function Ratings({ onNextStep, onPrevStep }) {
  const [formState, setFormState] = useState({
    ratings: {
      question1: "",
      question2: "",
      question3: "",
      question4: "",
      question5: "",
      question6: ""
    },
    currentPage: 0
  });

  const handleRatingSelect = (questionKey, value) => {
    setFormState(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [questionKey]: value
      }
    }));
  };

  const handleContinue = () => {
    // You could add validation here if needed
    onNextStep();
  };

  const handleNextPage = () => {
    setFormState(prev => ({
      ...prev,
      currentPage: prev.currentPage + 1
    }));
  };

  const handlePrevPage = () => {
    setFormState(prev => ({
      ...prev,
      currentPage: prev.currentPage - 1
    }));
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

  // Define the questions and divide them into pages
  const questions = [
    {
      question: "I am satisfied with the service that I availed.",
      questionKey: "question1"
    },
    {
      question: "I spent a reasonable amount of time for my transaction.",
      questionKey: "question2"
    },
    {
      question: "The office followed the transaction's requirements and steps based on the information provided.",
      questionKey: "question3"
    },
    {
      question: "I am satisfied with the service that I availed.",
      questionKey: "question4"
    },
    {
      question: "I spent a reasonable amount of time for my transaction.",
      questionKey: "question5"
    },
    {
      question: "I am satisfied with the service that I availed.",
      questionKey: "question6"
    }
  ];

  const questionsPerPage = 3;
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  const currentQuestions = questions.slice(
    formState.currentPage * questionsPerPage,
    (formState.currentPage + 1) * questionsPerPage
  );

  return (
    <div className="space-y-8 w-full mx-auto p-2">
      {currentQuestions.map((q, index) => (
        <RatingQuestion
          key={index}
          question={q.question}
          questionId={formState.currentPage * questionsPerPage + index}
          totalQuestions={questions.length}
          selectedRating={formState.ratings[q.questionKey]}
          onRatingSelect={(value) => handleRatingSelect(q.questionKey, value)}
          emojiOptions={emojiOptions}
        />
      ))}

      <div className="flex flex-col sm:flex-row justify-between gap-4 w-full">
        <Button
          variant="outline"
          className="px-6 py-2 bg-gray-100 text-gray-700"
          onClick={formState.currentPage === 0 ? onPrevStep : handlePrevPage}
        >
          {formState.currentPage === 0 ? "Go Back" : "Previous"}
        </Button>

        <div className="flex-1 flex justify-center items-center">
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <div
                key={index}
                className={`w-8 h-2 rounded ${index === formState.currentPage ? "bg-blue-600" : "bg-gray-300"}`}
              ></div>
            ))}
          </div>
        </div>

        <Button
          className="px-6 py-2 bg-blue-600 text-white"
          onClick={formState.currentPage === totalPages - 1 ? handleContinue : handleNextPage}
          disabled={!formState.ratings[questions[formState.currentPage * questionsPerPage].questionKey]}
        >
          {formState.currentPage === totalPages - 1 ? "Continue" : "Next"}
        </Button>
      </div>
    </div>
  );
}

Ratings.propTypes = {
  onNextStep: PropTypes.func.isRequired,
  onPrevStep: PropTypes.func.isRequired
};