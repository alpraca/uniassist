import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SparklesIcon, AcademicCapIcon, UserGroupIcon, HomeModernIcon } from '@heroicons/react/24/outline';
import { getRecommendedUniversities, getRecommendedMentors } from '../utils/recommendations';
import { universities, getUniversityMatchScore } from '../data/universities';

// Get the Gemini API key from the .env file
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Sample data (replace with actual data from your backend)
const mentors = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    university: "Stanford University",
    field: "Computer Science",
    expertise: ["AI", "Machine Learning", "Data Science"],
    researchInterests: ["Deep Learning", "Computer Vision"],
    yearsOfExperience: 8,
    availableForMentoring: true
  },
  {
    id: "2",
    name: "Prof. James Wilson",
    university: "MIT",
    field: "Engineering",
    expertise: ["Robotics", "Control Systems", "Automation"],
    researchInterests: ["Autonomous Systems", "Human-Robot Interaction"],
    yearsOfExperience: 12,
    availableForMentoring: true
  },
  // Add more mentors...
];

const Dashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [userInput, setUserInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [conversation, setConversation] = React.useState([
    {
      role: 'ai',
      content: `Hey ${user?.firstName || 'there'}! 😊 I'm your friendly UniAssist AI. I'm here to help you with anything about universities, mentors, or finding roommates. Ask me anything, and I'll do my best to help you out like a real friend would!`
    }
  ]);
  const [recommendations, setRecommendations] = useState({
    universities: [],
    mentors: []
  });
  const [savedUniversities, setSavedUniversities] = useState([]);

  useEffect(() => {
    // Check if user has completed their academic profile
    if (user && !user.unsafeMetadata.academicProfile) {
      navigate('/academic-profile?redirect=dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Generate recommendations when profile is available
    if (user?.unsafeMetadata?.academicProfile) {
      console.log('Profile found:', user.unsafeMetadata.academicProfile); // Debug log
      const profile = user.unsafeMetadata.academicProfile;
      
      // Check if required profile fields are filled - more lenient approach
      const requiredFields = ['intendedMajor']; // Only require intended major
      const hasRequiredFields = requiredFields.every(field => {
        const value = profile[field];
        return value !== undefined && value !== null && value !== '';
      });

      if (!hasRequiredFields) {
        console.log('Missing required fields'); // Debug log
        setRecommendations({
          universities: [],
          mentors: []
        });
        return;
      }

      // Get university recommendations with admission and success chances
      const universityRecommendations = universities
        .map(university => {
          const scores = getUniversityMatchScore(university, profile);
          return {
            university,
            ...scores
          };
        })
        .filter(rec => rec.matchScore > 20) // Lower threshold for showing universities
        .sort((a, b) => {
          // Sort by match score first, then admission chance
          if (b.matchScore !== a.matchScore) {
            return b.matchScore - a.matchScore;
          }
          return b.admissionChance - a.admissionChance;
        })
        .slice(0, 10); // Show more universities

      console.log('University recommendations:', universityRecommendations); // Debug log

      // Calculate mentor matches based on field and interests
      const mentorRecommendations = mentors
        .map(mentor => {
          let matchScore = 0;
          
          // Field match
          if (mentor.field === profile.intendedMajor) {
            matchScore += 40;
          }
          
          // Research interests match
          if (profile.technicalInterests) {
            const matchingInterests = mentor.expertise.filter(exp => 
              profile.technicalInterests.some(interest => 
                exp.toLowerCase().includes(interest.toLowerCase())
              )
            );
            matchScore += (matchingInterests.length / mentor.expertise.length) * 30;
          }
          
          // Learning style match
          if (profile.learningStyle === 'research-oriented' && 
              mentor.researchInterests && mentor.researchInterests.length > 0) {
            matchScore += 30;
          } else if (profile.learningStyle === 'hands-on' && mentor.yearsOfExperience > 5) {
            matchScore += 30;
          }

          return {
            mentor,
            matchScore: Math.round(matchScore)
          };
        })
        .filter(rec => rec.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3);
      
      setRecommendations({
        universities: universityRecommendations,
        mentors: mentorRecommendations
      });
    }
  }, [user]);

  useEffect(() => {
    // Load saved universities from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('savedUniversities') || '[]');
      setSavedUniversities(saved);
    } catch (error) {
      console.error('Error loading saved universities:', error);
    }
  }, []);

  if (!user) return null;

  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;
    
    // Add user message to conversation
    const userMessage = { role: 'user', content: userInput };
    setConversation(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    
    try {
      // Prepare the payload for Gemini API
      const payload = {
        contents: [
          {
            parts: [
              { text: `You are UniAssist, a friendly, supportive, and empathetic AI assistant for students. Always answer in a warm, conversational, and encouraging tone. Be concise but add a touch of personality and friendliness. If the user seems stressed or confused, reassure them.\n\nUser: ${userInput}` }
            ]
          }
        ]
      };
      
      // Make the HTTP request
      const response = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      let aiText = 'Sorry, I did not get a response.';
      if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
        aiText = data.candidates[0].content.parts[0].text;
      } else if (data.error && data.error.message) {
        aiText = `Error: ${data.error.message}`;
      }
      setConversation(prev => [...prev, { role: 'ai', content: aiText }]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      setConversation(prev => [
        ...prev,
        { 
          role: 'ai', 
          content: 'Sorry, I encountered an error. Please try again later.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  // Helper to send a predefined message from Quick Actions
  const sendQuickAction = async (quickInput) => {
    setConversation(prev => [...prev, { role: 'user', content: quickInput }]);
    setIsLoading(true);
    try {
      const payload = {
        contents: [
          {
            parts: [
              { text: `You are UniAssist, a friendly, supportive, and empathetic AI assistant for students. Always answer in a warm, conversational, and encouraging tone. Be concise but add a touch of personality and friendliness. If the user seems stressed or confused, reassure them.\n\nUser: ${quickInput}` }
            ]
          }
        ]
      };
      const response = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      let aiText = 'Sorry, I did not get a response.';
      if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
        aiText = data.candidates[0].content.parts[0].text;
      } else if (data.error && data.error.message) {
        aiText = `Error: ${data.error.message}`;
      }
      setConversation(prev => [...prev, { role: 'ai', content: aiText }]);
    } catch (error) {
      setConversation(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add function to remove saved university
  const handleRemoveUniversity = (index) => {
    try {
      const updated = savedUniversities.filter((_, i) => i !== index);
      localStorage.setItem('savedUniversities', JSON.stringify(updated));
      setSavedUniversities(updated);
    } catch (error) {
      console.error('Error removing university:', error);
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome Back, {user.firstName}!</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Here are your personalized recommendations based on your academic profile.
            </p>
          </div>
          
          {/* Dashboard Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Profile Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Academic Profile</p>
                  {user?.unsafeMetadata?.academicProfile ? (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm">
                        GPA: {user.unsafeMetadata.academicProfile.gpa}
                      </p>
                      <p className="text-sm">
                        Major: {user.unsafeMetadata.academicProfile.intendedMajor}
                      </p>
                      <p className="text-sm">
                        Learning Style: {user.unsafeMetadata.academicProfile.learningStyle.replace('-', ' ')}
                      </p>
                      <button
                        onClick={() => navigate('/academic-profile')}
                        className="mt-2 text-primary text-sm hover:underline"
                      >
                        Edit Profile
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate('/academic-profile')}
                      className="mt-2 text-primary text-sm hover:underline"
                    >
                      Complete Your Academic Profile
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Recommended Universities */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Universities You Can Get Into</h2>
              {user?.unsafeMetadata?.academicProfile ? (
                recommendations.universities.length > 0 ? (
                  <div className="space-y-4">
                    {recommendations.universities.map(({ university, matchScore, admissionChance, successChance, details }) => (
                      <div 
                        key={university.name} 
                        className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${
                          admissionChance >= 70 ? 'border-green-200 bg-green-50' :
                          admissionChance >= 40 ? 'border-yellow-200 bg-yellow-50' :
                          'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{university.name}</h3>
                            <p className="text-sm text-gray-600">{university.country}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-primary">
                              #{university.ranking} Global
                            </div>
                            {university.programSpecificInfo[user.unsafeMetadata.academicProfile.intendedMajor]?.ranking && (
                              <div className="text-sm text-gray-600">
                                #{university.programSpecificInfo[user.unsafeMetadata.academicProfile.intendedMajor].ranking} in Major
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <div className={`text-center p-2 rounded ${
                            admissionChance >= 70 ? 'bg-green-100 text-green-800' :
                            admissionChance >= 40 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            <div className="text-sm font-medium">{admissionChance}%</div>
                            <div className="text-xs">Admission</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="text-sm font-medium">{successChance}%</div>
                            <div className="text-xs text-gray-600">Success</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="text-sm font-medium">{matchScore}%</div>
                            <div className="text-xs text-gray-600">Match</div>
                          </div>
                        </div>
                        <div className="mt-3 space-y-2">
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Key Strengths:</span> {university.strengths.slice(0, 3).join(' • ')}
                          </div>
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Admission Rate:</span> {(university.admissionCriteria.acceptanceRate * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Min GPA:</span> {university.admissionCriteria.minGPA} | 
                            <span className="font-medium"> Avg GPA:</span> {university.admissionCriteria.avgGPA}
                          </div>
                          
                          {/* Add Prepare to Apply button */}
                          <button
                            onClick={() => navigate('/application-prep', { state: { university }})}
                            className="w-full mt-3 py-2 px-4 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Prepare to Apply
                          </button>
                </div>
              </div>
            ))}
                    <button
                      onClick={() => navigate('/universities')}
                      className="text-primary text-sm hover:underline"
                    >
                      View All Universities
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No matching universities found based on your profile.</p>
                    <p className="text-sm text-gray-500">Try adjusting your preferences or academic profile to see more options.</p>
                    <button
                      onClick={() => navigate('/academic-profile')}
                      className="mt-4 text-primary hover:underline"
                    >
                      Update Profile
                    </button>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Complete your profile to get university recommendations.</p>
                  <button
                    onClick={() => navigate('/academic-profile')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
                  >
                    Complete Profile
                  </button>
              </div>
            )}
          </div>
          
            {/* Recommended Mentors */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Recommended Mentors</h2>
              {recommendations.mentors.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.mentors.slice(0, 3).map(({ mentor, matchScore }) => (
                    <div key={mentor.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{mentor.name}</p>
                        <p className="text-sm text-gray-600">{mentor.field} at {mentor.university}</p>
                      </div>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {Math.round(matchScore)}% Match
                      </span>
                    </div>
                  ))}
            <button 
                    onClick={() => navigate('/mentors')}
                    className="text-primary text-sm hover:underline"
                  >
                    View All Mentors
            </button>
          </div>
              ) : (
                <p className="text-gray-600">Complete your profile to get mentor recommendations.</p>
              )}
            </div>

        {/* Quick Actions */}
            <div className="col-span-full mt-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/universities')}
                  className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  Browse Universities
                </button>
                <button
                  onClick={() => navigate('/mentors')}
                  className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  Find Mentors
                </button>
                <button
                  onClick={() => navigate('/roommates')}
                  className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  Find Roommates
                </button>
              </div>
        </div>

        {/* Saved Universities Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Saved Universities</h2>
          {savedUniversities.length > 0 ? (
            <div className="space-y-4">
              {savedUniversities.map((uni, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{uni.name}</h3>
                      <p className="text-sm text-gray-600">{uni.country}</p>
                      <p className="text-sm text-gray-500 mt-1">{uni.programs}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveUniversity(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Tuition: {uni.tuitionRange}
                    </span>
                    <button
                      onClick={() => navigate('/application-prep', { state: { university: uni } })}
                      className="text-primary text-sm hover:underline"
                    >
                      Continue Application
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No universities saved yet.</p>
              <button
                onClick={() => navigate('/universities')}
                className="mt-4 text-primary hover:underline"
              >
                Search Universities
              </button>
            </div>
          )}
        </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 