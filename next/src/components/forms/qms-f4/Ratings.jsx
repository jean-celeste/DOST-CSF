"use client"

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
      value: "outstanding",
      label: "Outstanding (Lubos na kasiya-siya)",
      imageSource: heartEyesFace,
      imageSourceStatic: heartEyesFaceStatic
    },
    {
      value: "very-satisfactory",
      label: "Very Satisfactory (Napaka Kasiya-siya)",
      imageSource: smilingFace,
      imageSourceStatic: smilingFaceStatic
    },
    {
      value: "satisfactory",
      label: "Satisfactory (Kasiya-siya)",
      imageSource: frowningFace,
      imageSourceStatic: frowningFaceStatic
    },
    {
      value: "fair",
      label: "Fair (Katamtaman)",
      imageSource: neutralFace,
      imageSourceStatic: neutralFaceStatic
    },
    {
      value: "unsatisfactory",
      label: "Unsatisfactory (Hindi Kasiya-siya)",
      imageSource: poutingFace,
      imageSourceStatic: poutingFaceStatic
    }
  ];

  // Define the questions and divide them into pages
  const questions = [
    {
      question: "Appropriateness of the Service/Activity (Kaangkupan ng Serbisyo/Aktibidad)",
      questionKey: "question1"
    },
    {
      question: "How beneficial is the Service/Activity (Gaano kapaki-pakkinabang ang serbisyo/aktibidad)",
      questionKey: "question2"
    },
    {
      question: "Attitude of Staff (Kagandahang loob at asal ng mga kawani)",
      questionKey: "question3"
    },
    {
      question: "Gender Fair Treatment (Pantay pantay na pakikitungo)",
      questionKey: "question4"
    },
    {
      question: "OVER-ALL SATISFACTION (Pangkalahatang kasiyahan ng serbisyong naibigay)",
      questionKey: "question5"
    }
  ];

  const questionsPerPage = 3;
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  const currentQuestions = questions.slice(
    formData.currentPage * questionsPerPage,
    (formData.currentPage + 1) * questionsPerPage
  );

  return (
    <div className="space-y-8 w-full mx-auto p-2">
      {currentQuestions.map((q, index) => (
        <RatingQuestion
          key={index}
          question={q.question}
          questionId={formData.currentPage * questionsPerPage + index}
          totalQuestions={questions.length}
          selectedRating={formData.ratings[q.questionKey]}
          onRatingSelect={(value) => handleRatingSelect(q.questionKey, value)}
          emojiOptions={emojiOptions}
        />
      ))}

      <div className="flex flex-col sm:flex-row justify-between gap-4 w-full">
        <Button
          variant="outline"
          className="px-6 py-2 bg-gray-100 text-gray-700"
          onClick={formData.currentPage === 0 ? onPrevStep : handlePrevPage}
        >
          {formData.currentPage === 0 ? "Go Back" : "Previous"}
        </Button>

        <div className="flex-1 flex justify-center items-center">
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <div
                key={index}
                className={`w-8 h-2 rounded ${index === formData.currentPage ? "bg-blue-600" : "bg-gray-300"}`}
              ></div>
            ))}
          </div>
        </div>

        <Button
          className="px-6 py-2 bg-blue-600 text-white"
          onClick={formData.currentPage === totalPages - 1 ? handleContinue : handleNextPage}
          disabled={!formData.ratings[questions[formData.currentPage * questionsPerPage].questionKey]}
        >
          {formData.currentPage === totalPages - 1 ? "Continue" : "Next"}
        </Button>
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
      question5: PropTypes.string
    }),
    currentPage: PropTypes.number
  }).isRequired,
  onFormDataChange: PropTypes.func.isRequired
};
