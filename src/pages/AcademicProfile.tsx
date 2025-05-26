import React from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import AcademicProfileForm from '../components/profile/AcademicProfileForm';

const AcademicProfile = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const redirect = searchParams.get('redirect');
  const isNewProfile = !user?.unsafeMetadata?.academicProfile;

  const handleProfileComplete = () => {
    if (redirect) {
      navigate(`/${redirect}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {isNewProfile ? 'Welcome to UniAssist!' : 'Academic Profile'}
            </h1>
            {isNewProfile ? (
              <div className="space-y-4">
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Let's get to know you better! Please complete your academic profile to help us provide
                  personalized university recommendations and find compatible roommates.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    This will only take a few minutes
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Your data is secure
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 max-w-2xl mx-auto">
                Update your academic information and preferences to get better matches and recommendations.
              </p>
            )}
          </div>

          <AcademicProfileForm onComplete={handleProfileComplete} />
        </motion.div>
      </div>
    </div>
  );
};

export default AcademicProfile; 