"use client"

import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import RatingQuestion from '@/components/forms-resources/RatingQuestion';
import { ChevronRight, ChevronLeft, Star, Info } from 'lucide-react';
import { motion } from 'framer-motion';

//Animated emojis
const heartEyesFace = "/assets/emojis/smiling_face_with_heart-eyes_animated.png";
const smilingFace = "/assets/emojis/smiling_face_with_smiling_eyes_animated.png";
const neutralFace = "/assets/emojis/face_without_mouth_animated.png";
const frowningFace = "/assets/emojis/frowning_face_animated.png";
const poutingFace = "/assets/emojis/pouting_face_animated.png";

//Static emojis
const heartEyesFaceStatic = "/assets/emojis/smiling_face_with_heart-eyes_color.svg";
const smilingFaceStatic = "/assets/emojis/smiling_face_with_smiling_eyes_color.svg";
const neutralFaceStatic = "/assets/emojis/face_without_mouth_color.svg";
const frowningFaceStatic = "/assets/emojis/frowning_face_color.svg";
const poutingFaceStatic = "/assets/emojis/pouting_face_color.svg";

export default function Ratings({ onNextStep, onPrevStep, formData, onFormDataChange }) {
  const handleRatingSelect = (questionKey, value) => {
    onFormDataChange({
      ...formData,
      ratings: {
        ...formData.ratings,
        [questionKey]: value
      }
    });
  };

  const handleContinue = () => {
    onNextStep();
  };

  const handleNextPage = () => {
    onFormDataChange({
      ...formData,
      currentPage: formData.currentPage + 1
    });
  };

  const handlePrevPage = () => {
    onFormDataChange({
      ...formData,
      currentPage: formData.currentPage - 1
    });
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
    formData.currentPage * questionsPerPage,
    (formData.currentPage + 1) * questionsPerPage
  );

  return (
    <div className="bg-white rounded-xl shadow-meium overflow-hidden">
      <div className="p-8">
        <div className="space-y-8">
          <div className="space-y-8">
            {currentQuestions.map((q, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <RatingQuestion
                  question={q.question}
                  questionId={formData.currentPage * questionsPerPage + index}
                  totalQuestions={questions.length}
                  selectedRating={formData.ratings[q.questionKey]}
                  onRatingSelect={(value) => handleRatingSelect(q.questionKey, value)}
                  emojiOptions={emojiOptions}
                />
              </motion.div>
            ))}
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center items-center space-x-3">
            {Array.from({ length: totalPages }).map((_, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer
                  ${index === formData.currentPage 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 w-12 shadow-md" 
                    : "bg-gray-200 hover:bg-gray-300 w-8"
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-20">
          <Button
            variant="outline"
            className="px-6 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            onClick={formData.currentPage === 0 ? onPrevStep : handlePrevPage}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {formData.currentPage === 0 ? "Go Back" : "Previous"}
          </Button>
          <Button
            variant="gradient"
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md"
            onClick={formData.currentPage === totalPages - 1 ? handleContinue : handleNextPage}
            disabled={!currentQuestions.every(q => formData.ratings[q.questionKey])}
          >
            {formData.currentPage === totalPages - 1 ? "Continue" : "Next"}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

Ratings.propTypes = {
  onNextStep: PropTypes.func.isRequired,
  onPrevStep: PropTypes.func.isRequired,
  formData: PropTypes.shape({
    ratings: PropTypes.shape({
      question1: PropTypes.string,
      question2: PropTypes.string,
      question3: PropTypes.string,
      question4: PropTypes.string,
      question5: PropTypes.string,
      question6: PropTypes.string
    }),
    currentPage: PropTypes.number
  }).isRequired,
  onFormDataChange: PropTypes.func.isRequired
};