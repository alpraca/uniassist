import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import type { User } from '@clerk/backend';
import EssayChat from './EssayChat';
import { motion } from 'framer-motion';

interface University {
  id: string;
  name: string;
  applicationDeadline?: string;
  documentDeadline?: string;
  scholarshipDeadline?: string;
  programStart?: string;
  strengths?: string[];
  programSpecificInfo?: Record<string, { description: string }>;
}

interface LocationState {
  university?: University;
  returnTo?: string;
  error?: string;
}

interface AIResponse {
  analysis: {
    strengths: string[];
    weaknesses: string[];
    score: number;
  };
  recommendations: string[];
  suggestedEssayTopics: Array<{
    title: string;
    prompt: string;
    wordLimit: number;
    tips: string[];
  }>;
}

type ClerkUser = {
  id: string;
  [key: string]: any;
};

interface AnalysisDetails {
  overallScore: number;
  categoryScores: {
    academic: number;
    extracurricular: number;
    experience: number;
    fit: number;
  };
  strengths: string[];
  improvements: string[];
}

interface Answers {
  goals: string;
  experience: string;
  achievements: string;
  extracurricular: string;
  [key: string]: string;
}

const validateUserData = (user: ClerkUser | null | undefined): user is ClerkUser => {
  if (!user || !user.id) {
    console.error('Invalid user data:', { user });
    return false;
  }
  return true;
};

const validateUniversityData = (university: University | null): university is University => {
  if (!university || !university.id || !university.name) {
    console.error('Invalid university data:', { university });
    return false;
  }
  return true;
};

const ApplicationPrep = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [university, setUniversity] = useState<University | null>(null);
  const [answers, setAnswers] = useState<Answers>({
    goals: '',
    experience: '',
    achievements: '',
    extracurricular: ''
  });
  const [socialLinks, setSocialLinks] = useState({});
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [essays, setEssays] = useState<Record<string, string>>({});
  const [selectedTopic, setSelectedTopic] = useState<{
    title: string;
    prompt: string;
    wordLimit: number;
    tips: string[];
  } | null>(null);
  const [progress, setProgress] = useState({
    information: 0,
    analysis: 0,
    essays: 0,
    nextSteps: 0
  });
  const [analysisDetails, setAnalysisDetails] = useState<AnalysisDetails>({
    overallScore: 0,
    categoryScores: {
      academic: 0,
      extracurricular: 0,
      experience: 0,
      fit: 0
    },
    strengths: [],
    improvements: []
  });

  // Load saved data on component mount
  useEffect(() => {
    const loadSavedData = () => {
      try {
        // Try to get university from location state first
        const state = location.state as LocationState;
        if (state?.university && typeof state.university === 'object' && 'id' in state.university) {
          setUniversity(state.university as University);
          document.cookie = `selectedUniversity=${JSON.stringify(state.university)}; path=/; SameSite=Strict; Secure`;
          return;
        }

        // Try to get from cookies if not in state
        const cookies = document.cookie.split(';');
        const universityCookie = cookies.find(c => c.trim().startsWith('selectedUniversity='));
        if (universityCookie) {
          const parsed = JSON.parse(decodeURIComponent(universityCookie.split('=')[1].trim()));
          if (parsed && typeof parsed === 'object' && 'id' in parsed) {
            setUniversity(parsed as University);
          }
        }

        // Try to load saved application data
        const savedAnswers = localStorage.getItem('applicationAnswers');
        if (savedAnswers) {
          const parsed = JSON.parse(savedAnswers);
          setAnswers(parsed);
        }

        const savedSocialLinks = localStorage.getItem('socialLinks');
        if (savedSocialLinks) {
          setSocialLinks(JSON.parse(savedSocialLinks));
        }

      } catch (e) {
        console.error('Error loading saved data:', e);
      } finally {
        setIsInitialized(true);
      }
    };

    loadSavedData();
  }, [location.state]);

  // Save answers whenever they change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('applicationAnswers', JSON.stringify(answers));
    }
  }, [answers, isInitialized]);

  // Save social links whenever they change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('socialLinks', JSON.stringify(socialLinks));
    }
  }, [socialLinks, isInitialized]);

  // Update cookie when university changes
  useEffect(() => {
    if (university && isInitialized) {
      document.cookie = `selectedUniversity=${JSON.stringify(university)}; path=/; SameSite=Strict; Secure`;
    }
  }, [university, isInitialized]);

  // Debug logging and validation
  useEffect(() => {
    if (isUserLoaded && isInitialized) {
      console.log('Application state:', {
        isAuthenticated: !!user,
        userId: user?.id,
        userLoaded: isUserLoaded,
        university: university,
        hasAnswers: Object.keys(answers).length > 0,
        hasSocialLinks: Object.keys(socialLinks).length > 0
      });

      // Validate essential data
      if (!user?.id || !university?.id) {
        console.error('Missing user or university ID', {
          userId: user?.id,
          universityId: university?.id
        });
      }
    }
  }, [isUserLoaded, user, university, answers, socialLinks, isInitialized]);

  // Add data validation effect with retry logic
  useEffect(() => {
    if (isUserLoaded && isInitialized) {
      if (!user || !validateUserData(user as ClerkUser)) {
        console.log('No user found, redirecting to sign-in');
        navigate('/auth/signin', { 
          state: { 
            returnTo: location.pathname,
            university: university
          } 
        });
        return;
      }
      
      // Check if university data is valid
      if (!validateUniversityData(university)) {
        console.log('Invalid university data:', university);
        
        // Try to recover from cookies one last time
        const cookies = document.cookie.split(';');
        const universityCookie = cookies.find(c => c.trim().startsWith('selectedUniversity='));
        if (universityCookie) {
          try {
            const parsed = JSON.parse(decodeURIComponent(universityCookie.split('=')[1].trim()));
            if (parsed && validateUniversityData(parsed as University)) {
              setUniversity(parsed as University);
              return;
            }
          } catch (e) {
            console.error('Failed to recover university from cookie:', e);
          }
        }
        
        // Set error state and redirect if recovery fails
        setError('Please select a university before starting the application process.');
        navigate('/universities', { 
          state: { 
            error: 'Please select a university before starting the application process.',
            returnTo: location.pathname
          } 
        });
        return;
      }

      // Reset error state if all validations pass
      setError(null);
    }
  }, [isUserLoaded, user, university, navigate, location.pathname, isInitialized]);

  // Update the answer change handler
  const handleAnswerChange = (field: keyof Answers, value: string) => {
    setAnswers(prev => {
      const newAnswers = { ...prev, [field]: value };
      // Immediately calculate new analysis when answers change
      if (university) {
        const newAnalysis = calculateAnalysis(newAnswers, university);
        setAnalysisDetails(newAnalysis);
      }
      return newAnswers;
    });
  };

  // Update progress whenever relevant state changes
  useEffect(() => {
    const requiredFields = ['goals', 'experience', 'achievements', 'extracurricular'];
    const completedFields = requiredFields.filter(field => answers[field]?.trim().length > 0);
    const informationProgress = (completedFields.length / requiredFields.length) * 100;
    
    // Calculate analysis progress based on completed information
    const analysisProgress = completedFields.length === requiredFields.length ? 100 : 
                           completedFields.length > 0 ? (completedFields.length / requiredFields.length) * 100 : 0;
    
    // Calculate essays progress
    const essaysProgress = aiResponse?.suggestedEssayTopics 
      ? (Object.keys(essays).length / aiResponse.suggestedEssayTopics.length) * 100 
      : 0;

    setProgress({
      information: Math.round(informationProgress),
      analysis: Math.round(analysisProgress),
      essays: Math.round(essaysProgress),
      nextSteps: 0
    });
  }, [answers, aiResponse, essays]);

  // Update analysis calculation function
  const calculateAnalysis = (answers: Answers, university: University) => {
    const scores = {
      academic: 0,
      extracurricular: 0,
      experience: 0,
      fit: 0
    };
    
    const strengths: string[] = [];
    const improvements: string[] = [];

    // Academic score calculation
    if (answers.goals?.trim()) {
      const goalsContent = answers.goals.trim();
      const goalsLength = goalsContent.length;
      const hasSpecificGoals = /university|career|study|research|degree|major|academic/i.test(goalsContent);
      const hasDetailedPlans = /plan|intend|aim|aspire|future|objective/i.test(goalsContent);
      
      if (goalsLength > 200 && hasSpecificGoals && hasDetailedPlans) {
        scores.academic = 90;
        strengths.push('Exceptionally well-defined academic goals with clear plans');
      } else if (goalsLength > 150 && hasSpecificGoals) {
        scores.academic = 75;
        strengths.push('Well-defined academic goals with clear direction');
      } else if (goalsLength > 100) {
        scores.academic = 60;
        strengths.push('Good academic goals foundation');
        improvements.push('Consider adding more specific details about your academic plans');
      } else if (goalsLength > 0) {
        scores.academic = 40;
        improvements.push('Elaborate more on your academic goals and be more specific');
      }
    } else {
      improvements.push('Add your academic and career goals');
    }

    // Experience score calculation
    if (answers.experience?.trim()) {
      const experienceContent = answers.experience.trim();
      const experienceLength = experienceContent.length;
      const hasRelevantExperience = /project|internship|work|research|volunteer|leadership/i.test(experienceContent);
      const hasDetailedExperience = /responsible|managed|led|developed|created|achieved/i.test(experienceContent);
      
      if (experienceLength > 200 && hasRelevantExperience && hasDetailedExperience) {
        scores.experience = 90;
        strengths.push('Exceptional relevant experience with detailed accomplishments');
      } else if (experienceLength > 150 && hasRelevantExperience) {
        scores.experience = 75;
        strengths.push('Strong relevant experience with good details');
      } else if (experienceLength > 100) {
        scores.experience = 60;
        strengths.push('Good experience foundation');
        improvements.push('Add more specific details about your responsibilities and achievements');
      } else if (experienceLength > 0) {
        scores.experience = 40;
        improvements.push('Provide more details about your experiences and their relevance');
      }
    } else {
      improvements.push('Include your relevant experiences');
    }

    // Achievements score calculation (contributing to experience score)
    if (answers.achievements?.trim()) {
      const achievementsContent = answers.achievements.trim();
      const achievementsLength = achievementsContent.length;
      const hasSignificantAchievements = /award|honor|recognition|certificate|scholarship|prize/i.test(achievementsContent);
      
      if (achievementsLength > 150 && hasSignificantAchievements) {
        scores.experience += 10;
        strengths.push('Notable achievements and recognition');
      } else if (achievementsLength > 100) {
        scores.experience += 5;
        improvements.push('Consider highlighting more significant achievements');
      }
      // Cap experience score at 100
      scores.experience = Math.min(100, scores.experience);
    }

    // Extracurricular score calculation
    if (answers.extracurricular?.trim()) {
      const extracurricularContent = answers.extracurricular.trim();
      const activities = extracurricularContent.split(/[.,;]/).filter(Boolean);
      const hasLeadershipRoles = /leader|president|founder|captain|chair|coordinator|head|director/i.test(extracurricularContent);
      const hasDetailedInvolvement = /organize|manage|coordinate|develop|create|lead/i.test(extracurricularContent);
      
      if (activities.length >= 3 && hasLeadershipRoles && hasDetailedInvolvement) {
        scores.extracurricular = 90;
        strengths.push('Outstanding extracurricular involvement with leadership roles');
      } else if (activities.length >= 2 && (hasLeadershipRoles || hasDetailedInvolvement)) {
        scores.extracurricular = 75;
        strengths.push('Strong extracurricular participation with good involvement');
      } else if (activities.length >= 2) {
        scores.extracurricular = 60;
        strengths.push('Good extracurricular participation');
        improvements.push('Consider taking on leadership roles in your activities');
      } else if (activities.length > 0) {
        scores.extracurricular = 40;
        improvements.push('Consider joining more extracurricular activities and taking leadership roles');
      }
    } else {
      improvements.push('Add your extracurricular activities');
    }

    // University fit score calculation
    if (university && answers.goals) {
      const fitScore = calculateUniversityFit(answers.goals, university);
      scores.fit = fitScore;
      
      if (fitScore >= 90) {
        strengths.push('Exceptional alignment with university values and programs');
      } else if (fitScore >= 75) {
        strengths.push('Strong alignment with university values and programs');
      } else if (fitScore >= 60) {
        strengths.push('Good alignment with university');
        improvements.push('Consider highlighting more specific connections to university programs');
      } else {
        improvements.push('Try to better align your goals with university strengths and programs');
      }
    }

    // Calculate overall score as weighted average with dynamic weights
    const weights = {
      academic: 0.3,
      experience: 0.25,
      extracurricular: 0.25,
      fit: 0.2
    };

    // Adjust weights based on completeness
    let totalWeight = 0;
    let weightedSum = 0;
    Object.entries(scores).forEach(([category, score]) => {
      if (score > 0) {
        const weight = weights[category as keyof typeof weights];
        weightedSum += score * weight;
        totalWeight += weight;
      }
    });

    const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

    return {
      overallScore,
      categoryScores: scores,
      strengths: [...new Set(strengths)], // Remove duplicates
      improvements: [...new Set(improvements)] // Remove duplicates
    };
  };

  // Update university fit calculation
  const calculateUniversityFit = (goals: string, university: University): number => {
    let fitScore = 50; // Base score
    
    if (!goals || !university) return fitScore;
    
    const goalsLower = goals.toLowerCase();
    
    // Check if goals align with university strengths
    if (university.strengths) {
      const strengthMatches = university.strengths.filter(strength =>
        goalsLower.includes(strength.toLowerCase())
      );
      
      fitScore += (strengthMatches.length / university.strengths.length) * 30;
      
      // Bonus for multiple strength matches
      if (strengthMatches.length > 1) {
        fitScore += 10;
      }
    }
    
    // Check program-specific alignment
    if (university.programSpecificInfo) {
      const programMatches = Object.values(university.programSpecificInfo).filter(info =>
        goalsLower.includes(info.description.toLowerCase())
      );
      
      fitScore += (programMatches.length / Object.keys(university.programSpecificInfo).length) * 20;
      
      // Bonus for specific program mentions
      if (programMatches.length > 0) {
        fitScore += 10;
      }
    }
    
    return Math.min(100, Math.round(fitScore));
  };

  const generateAIResponse = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error('User authentication required. Please sign in again.');
      }

      if (!university) {
        throw new Error('Please select a university before proceeding.');
      }

      const currentUser = user as ClerkUser;

      // Additional validation
      if (!currentUser.id || !university.id) {
        throw new Error('Missing required user or university information. Please try again.');
      }

      // Validate answers
      const requiredFields = ['goals', 'experience', 'achievements', 'extracurricular'];
      const missingFields = requiredFields.filter(field => !answers[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      // Detailed validation logging
      console.log('Generating AI response with:', {
        userPresent: true,
        userId: currentUser.id,
        universityPresent: true,
        universityId: university.id,
        answers,
        socialLinks
      });

      const response = await fetch('/api/generate-application-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          university,
          answers,
          socialLinks,
          userId: currentUser.id
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate content');
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.analysis || !data.suggestedEssayTopics) {
        throw new Error('Invalid response from AI service');
      }

      setAiResponse(data);
      setCurrentStep(1);

      // Update progress
      const informationProgress = 100;
      const analysisProgress = 100;
      
      setProgress(prev => ({
        ...prev,
        information: informationProgress,
        analysis: analysisProgress
      }));

    } catch (error) {
      console.error('Error generating content:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      setAiResponse(null); // Reset AI response on error
      setAnalysisDetails({ // Reset analysis details on error
        overallScore: 0,
        categoryScores: {
          academic: 0,
          extracurricular: 0,
          experience: 0,
          fit: 0
        },
        strengths: [],
        improvements: []
      });
    } finally {
      setLoading(false);
    }
  };

  const saveApplication = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('User authentication required. Please sign in again.');
      }

      const currentUser = user as ClerkUser;

      // Detailed validation logging
      console.log('Saving application with:', {
        userPresent: true,
        userId: currentUser.id,
        universityPresent: !!university,
        universityId: university?.id,
        answers,
        socialLinks,
        aiResponse
      });

      if (!validateUserData(currentUser)) {
        throw new Error('User authentication required. Please sign in again.');
      }
      
      if (!validateUniversityData(university)) {
        throw new Error('Invalid university information. Please select a university again.');
      }

      const response = await fetch('/api/save-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          universityId: university.id,
          answers,
          socialLinks,
          essays,
          progress: {
            information: Object.keys(answers).length > 0 ? 100 : 0,
            analysis: aiResponse ? 100 : 0,
            essays: aiResponse?.suggestedEssayTopics ? (Object.keys(essays).length / aiResponse.suggestedEssayTopics.length) * 100 : 0,
            nextSteps: 0
          },
          analysis: aiResponse?.analysis || null
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save application');
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      alert('Application saved successfully!');
    } catch (error) {
      console.error('Error saving application:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      alert(`Failed to save application: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEssayGenerated = (topic: string, essayText: string) => {
    setEssays(prev => ({
      ...prev,
      [topic]: essayText
    }));
  };

  // Update the progress tracker UI
  const ProgressTracker = () => (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Application Progress</h2>
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="mb-2">Information</div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-blue-600 rounded-full transition-all duration-300" 
              style={{ width: `${progress.information}%` }}
            />
          </div>
        </div>
        <div className="text-center">
          <div className="mb-2">Analysis</div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-blue-600 rounded-full transition-all duration-300" 
              style={{ width: `${progress.analysis}%` }}
            />
          </div>
        </div>
        <div className="text-center">
          <div className="mb-2">Essays</div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-blue-600 rounded-full transition-all duration-300" 
              style={{ width: `${progress.essays}%` }}
            />
          </div>
        </div>
        <div className="text-center">
          <div className="mb-2">Next Steps</div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-blue-600 rounded-full transition-all duration-300" 
              style={{ width: `${progress.nextSteps}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Show loading state while initializing
  if (!isInitialized || !isUserLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      {error && (
        <div className="max-w-4xl mx-auto mb-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-gray-700">Loading...</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        <ProgressTracker />

        {/* Information Form Section */}
        {currentStep === 0 && (
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Your Profile Information</h2>
            <form onSubmit={(e) => { e.preventDefault(); generateAIResponse(); }} className="space-y-6">
              <div>
                <label htmlFor="academic-goals" className="block text-sm font-medium text-gray-700 mb-2">
                  Academic and Career Goals
                </label>
                <textarea
                  id="academic-goals"
                  name="academic-goals"
                  value={answers.goals}
                  onChange={(e) => handleAnswerChange('goals', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={4}
                  placeholder="Describe your academic and career goals..."
                  required
                  aria-label="Academic and Career Goals"
                />
              </div>
              <div>
                <label htmlFor="relevant-experience" className="block text-sm font-medium text-gray-700 mb-2">
                  Relevant Experience
                </label>
                <textarea
                  id="relevant-experience"
                  name="relevant-experience"
                  value={answers.experience}
                  onChange={(e) => handleAnswerChange('experience', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={4}
                  placeholder="Describe your relevant experience..."
                  required
                  aria-label="Relevant Experience"
                />
              </div>
              <div>
                <label htmlFor="key-achievements" className="block text-sm font-medium text-gray-700 mb-2">
                  Key Achievements
                </label>
                <textarea
                  id="key-achievements"
                  name="key-achievements"
                  value={answers.achievements}
                  onChange={(e) => handleAnswerChange('achievements', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={4}
                  placeholder="List your key achievements..."
                  required
                  aria-label="Key Achievements"
                />
              </div>
              <div>
                <label htmlFor="extracurricular-activities" className="block text-sm font-medium text-gray-700 mb-2">
                  Extracurricular Activities
                </label>
                <textarea
                  id="extracurricular-activities"
                  name="extracurricular-activities"
                  value={answers.extracurricular}
                  onChange={(e) => handleAnswerChange('extracurricular', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={4}
                  placeholder="Describe your extracurricular activities..."
                  required
                  aria-label="Extracurricular Activities"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                aria-label={loading ? 'Generating...' : 'Generate Application Strategy'}
              >
                {loading ? 'Generating...' : 'Generate Application Strategy'}
              </button>
            </form>
          </div>
        )}

        {/* Analysis Section */}
        {currentStep === 1 && aiResponse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Your Application Analysis</h2>
              
              {/* Overall Score */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-semibold">Overall Match Score</h3>
                  <span className="text-2xl font-bold text-blue-600">{analysisDetails.overallScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${analysisDetails.overallScore}%` }}
                  />
                </div>
              </div>

              {/* Category Scores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {Object.entries(analysisDetails.categoryScores).map(([category, score]) => (
                  <div key={category} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium capitalize">{category} Fit</h4>
                      <span className={`font-medium ${
                        score >= 70 ? 'text-green-600' :
                        score >= 50 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>{score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          score >= 70 ? 'bg-green-500' :
                          score >= 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Strengths and Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-3">Your Strengths</h4>
                  <ul className="space-y-2">
                    {analysisDetails.strengths.map((strength, index) => (
                      <li key={index} className="flex items-center text-green-700">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-3">Areas for Improvement</h4>
                  <ul className="space-y-2">
                    {analysisDetails.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-center text-yellow-700">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Essay Topics Section */}
        {aiResponse?.suggestedEssayTopics && (
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Essay Topics</h2>
            <div className="space-y-6">
              {aiResponse.suggestedEssayTopics.map((topic) => (
                <div key={topic.title} className="border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-2">{topic.title}</h3>
                  <p className="text-gray-600 mb-4">{topic.prompt}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <span>Word Limit: {topic.wordLimit}</span>
                  </div>
                  
                  {/* Writing Tips */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-blue-700 mb-2">Writing Tips:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {topic.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-blue-600">{tip}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Essay Status */}
                  {essays[topic.title] ? (
                    <div className="space-y-4">
                      <div className="prose max-w-none">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <pre className="whitespace-pre-wrap font-sans">{essays[topic.title]}</pre>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setSelectedTopic(topic)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Edit Essay
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedTopic(topic)}
                      className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start Writing
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Essay Chat Interface */}
        {selectedTopic && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-xl font-semibold">{selectedTopic.title}</h3>
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <EssayChat
                  userProfile={{
                    goals: answers['goals'] || '',
                    experience: answers['experience'] || '',
                    achievements: answers['achievements'] || '',
                    extracurricular: answers['extracurricular'] || '',
                    socialLinks
                  }}
                  university={university!}
                  topic={selectedTopic}
                  onEssayGenerated={(essay) => {
                    handleEssayGenerated(selectedTopic.title, essay);
                    setSelectedTopic(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationPrep;