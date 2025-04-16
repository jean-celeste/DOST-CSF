import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Star, Heart, Clock, PlusCircle } from 'lucide-react';

const ThankYouModal = ({ isOpen, onClose, onNewForm }) => {
  const [countdown, setCountdown] = useState(10); // 10 seconds countdown

  useEffect(() => {
    let timer;
    if (isOpen && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      onClose();
      onNewForm();
    }
    return () => clearInterval(timer);
  }, [isOpen, countdown, onClose, onNewForm]);

  const handleNewForm = () => {
    onClose();
    onNewForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur effect */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal content */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
      >
        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Star className="w-8 h-8 text-yellow-400" />
          </motion.div>
        </div>
        
        <div className="absolute -bottom-4 -left-4">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="w-8 h-8 text-pink-400" />
          </motion.div>
        </div>

        {/* Main content */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <CheckCircle className="w-16 h-16 text-green-500" />
          </motion.div>

          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Thank You for Your Feedback!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Your input helps us improve our services and better serve our customers.
            We truly appreciate your time and valuable feedback.
          </p>

          {/* Countdown timer */}
          <div className="flex items-center justify-center gap-2 mb-6 text-blue-600">
            <Clock className="w-5 h-5" />
            <span className="font-medium">
              Closing in {countdown} seconds
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewForm}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium
                       hover:bg-green-700 transition-colors duration-200
                       shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Submit Another Form
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium
                       hover:bg-blue-700 transition-colors duration-200
                       shadow-lg hover:shadow-xl"
            >
              Close Now
            </motion.button>
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full"
              initial={{
                x: Math.random() * 100,
                y: Math.random() * 100,
                opacity: 0
              }}
              animate={{
                x: Math.random() * 100,
                y: Math.random() * 100,
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ThankYouModal; 