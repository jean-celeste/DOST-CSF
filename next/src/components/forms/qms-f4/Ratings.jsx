"use client"

import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import RatingQuestion from '@/components/forms-resources/RatingQuestion'
import { fetchQuestions, groupQuestions } from '@/lib/questions/fetchQuestions'
import LoadingSpinner from '@/components/forms-resources/LoadingSpinner'
import { qmsOptions } from '@/lib/options/qms-options'

export default function Ratings({ onNextStep, onPrevStep, formData, onFormDataChange, isReviewMode, formId = 3 }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        console.log('Fetching questions for formId:', formId);
        const fetchedQuestions = await fetchQuestions(formId);
        console.log('Fetched questions:', fetchedQuestions);
        
        const { ratingQuestions } = groupQuestions(fetchedQuestions, formId);
        console.log('Grouped rating questions:', ratingQuestions);
        
        setQuestions(ratingQuestions);
        setError(null);
      } catch (error) {
        console.error('Error loading questions:', error);
        setError('Failed to load questions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [formId]);

  const handleRatingSelect = (questionKey, value) => {
    console.log('Rating selected:', { questionKey, value });
    onFormDataChange({
      ...formData,
      ratings: {
        ...formData.ratings,
        [questionKey]: value
      }
    });
  };

  const handleContinue = () => {
    if (isReviewMode) {
      onNextStep(); // This will be handleReturnToReview from the parent
    } else {
      onNextStep();
    }
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const questionsPerPage = 3;
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  const currentQuestions = questions.slice(
    formData.currentPage * questionsPerPage,
    (formData.currentPage + 1) * questionsPerPage
  );

  console.log('Rendering with questions:', questions);
  console.log('Current page:', formData.currentPage);
  console.log('Current questions:', currentQuestions);

  return (
    <div className="space-y-8">
      <div className="space-y-8">
        {currentQuestions.map((q, index) => (
          <motion.div
            key={q.question_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <RatingQuestion
              question={q.question_text}
              questionId={formData.currentPage * questionsPerPage + index}
              totalQuestions={questions.length}
              selectedRating={formData.ratings[`question${q.question_id}`]}
              onRatingSelect={(value) => handleRatingSelect(`question${q.question_id}`, value)}
              emojiOptions={qmsOptions.ratingOptions}
              showEmoji={true}
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
          disabled={!currentQuestions.every(q => formData.ratings[`question${q.question_id}`])}
        >
          {formData.currentPage === totalPages - 1 ? (isReviewMode ? "Return to Review" : "Continue") : "Next"}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

Ratings.propTypes = {
  onNextStep: PropTypes.func.isRequired,
  onPrevStep: PropTypes.func.isRequired,
  formData: PropTypes.shape({
    ratings: PropTypes.object,
    currentPage: PropTypes.number
  }).isRequired,
  onFormDataChange: PropTypes.func.isRequired,
  isReviewMode: PropTypes.bool,
  formId: PropTypes.number
};
