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
    question3: "",
    question4: "",
    question5: "",
    question6: ""
  });

  const [currentPage, setCurrentPage] = useState(0);

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

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
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
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4">
      {currentQuestions.map((q, index) => (
        <RatingQuestion
          key={index}
          question={q.question}
          questionId={currentPage * questionsPerPage + index}
          totalQuestions={questions.length}
          selectedRating={ratings[q.questionKey]}
          onRatingSelect={(value) => handleRatingSelect(q.questionKey, value)}
          emojiOptions={emojiOptions}
        />
      ))}

      <div className="flex flex-col sm:flex-row justify-between gap-4 w-full">
        <Button
          variant="outline"
          className="px-6 py-2 bg-gray-100 text-gray-700"
          onClick={currentPage === 0 ? onPrevStep : handlePrevPage}
        >
          {currentPage === 0 ? "Go Back" : "Previous"}
        </Button>

        <div className="flex-1 flex justify-center items-center">
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <div
                key={index}
                className={`w-8 h-2 rounded ${index === currentPage ? "bg-blue-600" : "bg-gray-300"}`}
              ></div>
            ))}
          </div>
        </div>

        <Button
          className="px-6 py-2 bg-blue-600 text-white"
          onClick={currentPage === totalPages - 1 ? handleContinue : handleNextPage}
          disabled={!ratings[questions[currentPage * questionsPerPage].questionKey]}
        >
          {currentPage === totalPages - 1 ? "Continue" : "Next"}
        </Button>
      </div>
    </div>
  );
}

Ratings.propTypes = {
  onNextStep: PropTypes.func.isRequired,
  onPrevStep: PropTypes.func.isRequired
};