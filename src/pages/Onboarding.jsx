import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase, profileHelpers } from '../lib/supabase';
import OnboardingLayout from '../components/OnboardingLayout';
import PersonalInfoForm from '../components/onboarding/PersonalInfoForm';

const steps = [
  'personal',
  'academics',
  'goals',
  'universities',
  'experience',
  'technical',
  'financial',
  'social',
  'bonus'
];

const Onboarding = () => {
  const { step } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/auth/signin');
          return;
        }

        // Check if onboarding is complete
        const progress = await profileHelpers.getOnboardingProgress(user.id);
        const completedSteps = Object.values(progress).filter(Boolean).length;

        if (completedSteps === steps.length) {
          navigate('/dashboard');
          return;
        }

        // If no step specified, redirect to first incomplete step
        if (!step) {
          const nextStep = steps[completedSteps];
          navigate(`/onboarding/${nextStep}`);
          return;
        }

        // Validate current step
        if (!steps.includes(step)) {
          navigate(`/onboarding/${steps[0]}`);
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error('Error checking auth:', error);
        navigate('/auth/signin');
      }
    };

    checkAuth();
  }, [step, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 'personal':
        return <PersonalInfoForm />;
      // Add other steps as they are created
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">This step is under construction.</p>
          </div>
        );
    }
  };

  return (
    <OnboardingLayout currentStep={step}>
      {renderStep()}
    </OnboardingLayout>
  );
};

export default Onboarding; 