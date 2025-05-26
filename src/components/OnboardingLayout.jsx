import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  { id: 'personal', title: 'Personal Info', icon: '👤' },
  { id: 'academics', title: 'Academics', icon: '📚' },
  { id: 'goals', title: 'Goals', icon: '🎯' },
  { id: 'universities', title: 'University Preferences', icon: '🎓' },
  { id: 'experience', title: 'Experience', icon: '💼' },
  { id: 'technical', title: 'Technical Skills', icon: '💻' },
  { id: 'financial', title: 'Financial & Personality', icon: '💰' },
  { id: 'social', title: 'Social & AI', icon: '🤝' },
  { id: 'bonus', title: 'Bonus Info', icon: '✨' }
];

const OnboardingLayout = ({ currentStep, children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Profile Completion</span>
            <span className="text-sm font-medium text-blue-600">
              Step {steps.findIndex(s => s.id === currentStep) + 1} of {steps.length}
            </span>
          </div>
          <div className="h-2 bg-blue-100 rounded-full">
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((steps.findIndex(s => s.id === currentStep) + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Steps Indicator */}
        <div className="hidden md:flex justify-between mb-12">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={`flex flex-col items-center ${
                steps.findIndex(s => s.id === currentStep) >= idx
                  ? 'text-blue-600'
                  : 'text-gray-400'
              }`}
            >
              <div className="text-2xl mb-2">{step.icon}</div>
              <div className="text-xs font-medium">{step.title}</div>
            </div>
          ))}
        </div>

        {/* Current Step Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {steps.find(s => s.id === currentStep)?.title}
        </h1>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout; 