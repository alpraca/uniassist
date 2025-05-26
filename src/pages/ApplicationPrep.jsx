import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const INITIAL_QUESTIONS = [
  {
    id: 'goals',
    question: "What are your primary academic and career goals?",
    type: 'text',
    placeholder: "E.g., I want to become a software engineer focusing on AI..."
  },
  {
    id: 'experience',
    question: "What relevant experiences or projects have you worked on?",
    type: 'text',
    placeholder: "Tell us about your projects, internships, or work experience..."
  },
  {
    id: 'social_links',
    question: "Please provide your relevant social media or portfolio links",
    type: 'social',
    fields: ['LinkedIn', 'GitHub', 'Portfolio Website', 'Other']
  },
  {
    id: 'achievements',
    question: "What are your key achievements or awards?",
    type: 'text',
    placeholder: "List any academic awards, competitions, or recognition..."
  },
  {
    id: 'extracurricular',
    question: "Tell us about your extracurricular activities and leadership roles",
    type: 'text',
    placeholder: "Describe your involvement in clubs, organizations, or community service..."
  }
];

const ApplicationPrep = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [university, setUniversity] = useState(location.state?.university || null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [socialLinks, setSocialLinks] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiResponse, setAiResponse] = useState({
    analysis: {
      overallScore: 0,
      categoryScores: {
        academic: 0,
        extracurricular: 0,
        experience: 0,
        fit: 0
      },
      strengths: [],
      improvements: []
    },
    recommendedPrograms: [],
    scholarships: [],
    timeline: [],
    contacts: {
      admissions: { name: '', email: '', phone: '', hours: '' },
      programCoordinator: { name: '', email: '', phone: '', office: '' },
      financialAid: { name: '', email: '', phone: '', website: '' },
      international: { name: '', email: '', phone: '', website: '' }
    },
    suggestedEssayTopics: []
  });
  const [essayTopics, setEssayTopics] = useState([]);
  const [generatedEssays, setGeneratedEssays] = useState({});
  const [applicationProgress, setApplicationProgress] = useState({});
  const [savedApplications, setSavedApplications] = useState([]);
  const [analysisDetails, setAnalysisDetails] = useState({
    strengths: [],
    improvements: [],
    overallScore: 0,
    categoryScores: {
      academic: 0,
      extracurricular: 0,
      experience: 0,
      fit: 0
    }
  });
  const [editingEssay, setEditingEssay] = useState(null);
  const [editInstructions, setEditInstructions] = useState('');
  const [essayWordCounts, setEssayWordCounts] = useState({});

  useEffect(() => {
    if (isUserLoaded && !user) {
      navigate('/sign-in', { state: { returnTo: location.pathname } });
    }
  }, [isUserLoaded, user, navigate, location.pathname]);

  useEffect(() => {
    if (!university) {
      navigate('/universities');
      return;
    }
    
    // Load saved application if it exists
    const loadSavedApplication = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!user?.id || !university?.id) {
          console.log('Missing user or university ID');
          return;
        }

        // Get saved universities from localStorage
        const savedUniversities = JSON.parse(localStorage.getItem('savedUniversities') || '[]');
        const savedApplication = savedUniversities.find(uni => 
          uni.id === university.id || 
          uni.id === `${university.name}-${university.country}`.toLowerCase().replace(/\s+/g, '-')
        );
        
        if (!savedApplication) {
          // If no saved application exists, initialize from user profile
          const userProfile = user.publicMetadata;
          setAnswers({
            goals: `My primary goal is to study ${userProfile.intendedMajor} with a focus on ${userProfile.careerGoals?.join(', ')}. I am particularly interested in ${userProfile.programPreferences?.join(', ')} opportunities.`,
            experience: `I have maintained a GPA of ${userProfile.gpa} and am proficient in ${userProfile.languages?.join(', ')}. I have technical interests in ${userProfile.technicalInterests?.join(', ')}.`,
            achievements: userProfile.academicAwards?.join(', ') || '',
            extracurricular: `I am involved in ${userProfile.extracurricularInterests?.join(', ')} and ${userProfile.athleticInterests?.join(', ')}. I also participate in ${userProfile.clubPreferences?.join(', ')}.`
          });
          return;
        }
        
        // Get application progress from localStorage
        const savedProgress = JSON.parse(localStorage.getItem(`applicationProgress_${savedApplication.id}`) || '{}');
        const savedAnswers = JSON.parse(localStorage.getItem(`applicationAnswers_${savedApplication.id}`) || '{}');
        const savedSocialLinks = JSON.parse(localStorage.getItem(`socialLinks_${savedApplication.id}`) || '{}');

        setAnswers(savedAnswers);
        setSocialLinks(savedSocialLinks);
        setApplicationProgress(savedProgress || {
          information: 0,
          analysis: 0,
          essays: 0,
          documents: 0,
          submission: 0
        });

      } catch (error) {
        console.error('Error loading saved application:', error);
        setError(`Failed to load saved application: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadSavedApplication();
  }, [university, user?.id, user?.publicMetadata]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const generateAIResponse = async () => {
    setLoading(true);
    setError(null);
    try {
      // Validate user authentication
      if (!user) {
        throw new Error('Please sign in to continue');
      }

      // Validate university selection
      if (!university) {
        throw new Error('Please select a university before proceeding');
      }

      // Validate required fields
      const requiredFields = ['goals', 'experience', 'achievements', 'extracurricular'];
      const missingFields = requiredFields.filter(field => !answers[field]?.trim());
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      // Log validation state
      console.log('Validation passed:', {
        userPresent: !!user,
        userId: user.id,
        universityPresent: !!university,
        universityId: university.id || `${university.name}-${university.country}`.toLowerCase().replace(/\s+/g, '-'),
        answersComplete: missingFields.length === 0
      });

      const prompt = `You are an AI university application advisor helping a student with their application to ${university.name}.

Student Profile:
Goals: ${answers.goals}
Experience: ${answers.experience}
Achievements: ${answers.achievements}
Extracurricular Activities: ${answers.extracurricular}
${socialLinks ? `Social Links: ${JSON.stringify(socialLinks, null, 2)}` : ''}

University Information:
Name: ${university.name}
Country: ${university.country}
Programs: ${university.programs}
Tuition: ${university.tuitionRange}
Ranking: ${university.globalRanking || 'Not available'}

Please analyze the student's profile and provide:
1. Overall compatibility score (0-100)
2. Category scores for:
   - Academic fit (0-100)
   - Extracurricular engagement (0-100)
   - Experience relevance (0-100)
   - Overall fit (0-100)
3. Key strengths (3-5 points)
4. Areas for improvement (2-3 points)
5. Suggested essay topics (2-3 topics with prompts)
6. Timeline for application process
7. Scholarship opportunities
8. Important contact information

Format the response as a JSON object with these exact fields:
{
  "analysis": {
    "overallScore": number,
    "categoryScores": {
      "academic": number,
      "extracurricular": number,
      "experience": number,
      "fit": number
    },
    "strengths": string[],
    "improvements": string[]
  },
  "recommendedPrograms": string[],
  "scholarships": Array<{name: string, amount: string, deadline: string}>,
  "timeline": Array<{date: string, task: string}>,
  "contacts": {
    "admissions": {name: string, email: string, phone: string, hours: string},
    "programCoordinator": {name: string, email: string, phone: string, office: string},
    "financialAid": {name: string, email: string, phone: string, website: string},
    "international": {name: string, email: string, phone: string, website: string}
  },
  "suggestedEssayTopics": Array<{
    title: string,
    prompt: string,
    wordLimit: number,
    tips: string[]
  }>
}`;

      const payload = {
        contents: [{ parts: [{ text: prompt }] }]
      };

      const response = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response from AI');
      }

      const responseText = data.candidates[0].content.parts[0].text;
      let jsonText = responseText.match(/```json\n?([\s\S]*?)\n?```/)?.[1] || responseText.trim();
      jsonText = jsonText.replace(/```/g, '').trim();
      
      const aiResponse = JSON.parse(jsonText);

      // Save the AI response in localStorage
      const universityId = university.id || `${university.name}-${university.country}`.toLowerCase().replace(/\s+/g, '-');
      localStorage.setItem(`aiResponse_${universityId}`, JSON.stringify(aiResponse));

      setAiResponse(aiResponse);
      setAnalysisDetails({
        strengths: aiResponse.analysis.strengths,
        improvements: aiResponse.analysis.improvements,
        overallScore: aiResponse.analysis.overallScore,
        categoryScores: aiResponse.analysis.categoryScores
      });
      
      // Update progress based on completed sections
      const newProgress = {
        information: 100,
        analysis: 100,
        essays: Object.keys(generatedEssays).length / (aiResponse.suggestedEssayTopics?.length || 1) * 100,
        documents: applicationProgress.documents || 0,
        submission: applicationProgress.submission || 0
      };
      setApplicationProgress(newProgress);
      
      // Save updated progress
      localStorage.setItem(`applicationProgress_${universityId}`, JSON.stringify(newProgress));

      setCurrentStep(1);
    } catch (error) {
      console.error('Error generating content:', error);
      setError(error.message || 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const generateEssay = async (topic) => {
    setLoading(true);
    try {
      const prompt = `You are a university application essay writer helping a student write an essay for ${university.name}.

Topic: ${topic.title}
Prompt: ${topic.prompt}
Word Limit: ${topic.wordLimit}

Student Profile:
Goals: ${answers.goals}
Experience: ${answers.experience}
Achievements: ${answers.achievements}
Extracurricular Activities: ${answers.extracurricular}

Please write a compelling essay that:
1. Directly addresses the prompt
2. Incorporates the student's experiences and achievements
3. Maintains a personal and authentic voice
4. Stays within the word limit
5. Follows the tips provided: ${topic.tips.join(', ')}

The essay should be well-structured, engaging, and showcase the student's fit with ${university.name}.`;

      const payload = {
        contents: [{ parts: [{ text: prompt }] }]
      };

      const response = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response from AI');
      }

      const essayText = data.candidates[0].content.parts[0].text.trim();
      const wordCount = essayText.split(/\s+/).length;

      // Save essay to localStorage
      const universityId = university.id || `${university.name}-${university.country}`.toLowerCase().replace(/\s+/g, '-');
      const savedEssays = JSON.parse(localStorage.getItem(`essays_${universityId}`) || '{}');
      savedEssays[topic.title] = essayText;
      localStorage.setItem(`essays_${universityId}`, JSON.stringify(savedEssays));

      // Save word count
      const savedWordCounts = JSON.parse(localStorage.getItem(`essayWordCounts_${universityId}`) || '{}');
      savedWordCounts[topic.title] = wordCount;
      localStorage.setItem(`essayWordCounts_${universityId}`, JSON.stringify(savedWordCounts));

      setGeneratedEssays(prev => ({
        ...prev,
        [topic.title]: essayText
      }));
      
      setEssayWordCounts(prev => ({
        ...prev,
        [topic.title]: wordCount
      }));

      // Update essay progress
      const essayProgress = (Object.keys(generatedEssays).length + 1) / aiResponse.suggestedEssayTopics.length * 100;
      const newProgress = {
        ...applicationProgress,
        essays: essayProgress
      };
      setApplicationProgress(newProgress);
      localStorage.setItem(`applicationProgress_${universityId}`, JSON.stringify(newProgress));

    } catch (error) {
      console.error('Error generating essay:', error);
      setError('Failed to generate essay. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const editEssay = async (topic, instructions) => {
    setLoading(true);
    try {
      const existingEssay = generatedEssays[topic.title];
      const prompt = `You are a university application essay editor. Please edit the following essay for ${university.name} according to these instructions:

Topic: ${topic.title}
Prompt: ${topic.prompt}
Word Limit: ${topic.wordLimit}
Edit Instructions: ${instructions}

Current Essay:
${existingEssay}

Please provide the edited version that:
1. Follows the edit instructions
2. Maintains the essay's core message
3. Stays within the word limit
4. Keeps a personal and authentic voice
5. Improves clarity and impact`;

      const payload = {
        contents: [{ parts: [{ text: prompt }] }]
      };

      const response = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response from AI');
      }

      const editedEssay = data.candidates[0].content.parts[0].text.trim();
      const wordCount = editedEssay.split(/\s+/).length;

      // Save edited essay to localStorage
      const universityId = university.id || `${university.name}-${university.country}`.toLowerCase().replace(/\s+/g, '-');
      const savedEssays = JSON.parse(localStorage.getItem(`essays_${universityId}`) || '{}');
      savedEssays[topic.title] = editedEssay;
      localStorage.setItem(`essays_${universityId}`, JSON.stringify(savedEssays));

      // Save updated word count
      const savedWordCounts = JSON.parse(localStorage.getItem(`essayWordCounts_${universityId}`) || '{}');
      savedWordCounts[topic.title] = wordCount;
      localStorage.setItem(`essayWordCounts_${universityId}`, JSON.stringify(savedWordCounts));

      setGeneratedEssays(prev => ({
        ...prev,
        [topic.title]: editedEssay
      }));
      
      setEssayWordCounts(prev => ({
        ...prev,
        [topic.title]: wordCount
      }));

      setEditingEssay(null);
      setEditInstructions('');
    } catch (error) {
      console.error('Error editing essay:', error);
      setError('Failed to edit essay. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveApplication = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id || !university?.id) {
        throw new Error('Missing user or university information');
      }

      const universityId = university.id || `${university.name}-${university.country}`.toLowerCase().replace(/\s+/g, '-');

      // Save all application data to localStorage
      localStorage.setItem(`applicationAnswers_${universityId}`, JSON.stringify(answers));
      localStorage.setItem(`socialLinks_${universityId}`, JSON.stringify(socialLinks));
      localStorage.setItem(`applicationProgress_${universityId}`, JSON.stringify(applicationProgress));

      // Update the university in savedUniversities if it exists
      const savedUniversities = JSON.parse(localStorage.getItem('savedUniversities') || '[]');
      const existingIndex = savedUniversities.findIndex(uni => 
        uni.id === universityId || 
        uni.id === `${uni.name}-${uni.country}`.toLowerCase().replace(/\s+/g, '-')
      );

      if (existingIndex >= 0) {
        savedUniversities[existingIndex] = { ...university, id: universityId };
      } else {
        savedUniversities.push({ ...university, id: universityId });
      }

      localStorage.setItem('savedUniversities', JSON.stringify(savedUniversities));
      alert('Application progress saved successfully!');
    } catch (error) {
      console.error('Error saving application:', error);
      setError(`Failed to save application: ${error.message}`);
      alert(`Failed to save application: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add error display component
  const ErrorMessage = ({ message }) => (
    message ? (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{message}</p>
          </div>
        </div>
      </div>
    ) : null
  );

  // Add loading indicator component
  const LoadingSpinner = () => (
    loading ? (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-gray-700">Loading...</p>
        </div>
      </div>
    ) : null
  );

  if (!isUserLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <LoadingSpinner />
      <div className="max-w-4xl mx-auto">
        <ErrorMessage message={error} />
        {university && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Application Preparation for {university.name}
                </h1>
                <p className="text-gray-600">Let's help you create the perfect application!</p>
              </div>
              <button
                onClick={saveApplication}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Progress
              </button>
            </div>
          </motion.div>
        )}

        {/* Progress Steps with Percentage */}
        <div className="mb-8">
          {['Information', 'Analysis', 'Essays', 'Next Steps'].map((step, index) => (
            <div key={step} className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className={`font-medium ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                  {step}
                </span>
                <span className="text-sm text-gray-500">
                  {applicationProgress[step.toLowerCase()] || 0}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${applicationProgress[step.toLowerCase()] || 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Questions Form */}
        {currentStep === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {INITIAL_QUESTIONS.map((q) => (
              <div key={q.id} className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{q.question}</h3>
                {q.type === 'social' ? (
                  <div className="space-y-4">
                    {q.fields.map((platform) => (
                      <div key={platform} className="flex items-center space-x-4">
                        <label className="w-32 text-gray-700">{platform}:</label>
                        <input
                          type="text"
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder={`Your ${platform} URL`}
                          value={socialLinks[platform] || ''}
                          onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <textarea
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={4}
                    placeholder={q.placeholder}
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  />
                )}
              </div>
            ))}
            <button
              onClick={() => {
                generateAIResponse();
                setCurrentStep(1);
              }}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Generate Application Strategy
            </button>
          </motion.div>
        )}

        {/* AI Analysis with Detailed Breakdown */}
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
                    className="bg-blue-600 h-3 rounded-full"
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
                        className={`h-2 rounded-full ${
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
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-green-600">Your Strengths</h3>
                  <ul className="space-y-2">
                    {analysisDetails.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-yellow-600">Areas for Improvement</h3>
                  <ul className="space-y-2">
                    {analysisDetails.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep(2)}
                className="w-full mt-8 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue to Essays
              </button>
            </div>
          </motion.div>
        )}

        {/* Essay Generation */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">Essay Topics</h2>
              <div className="space-y-6">
                {aiResponse.suggestedEssayTopics.map((topic, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium mb-2">{topic.title}</h3>
                      <p className="text-gray-600 mb-2">{topic.prompt}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Word Limit: {topic.wordLimit}
                      </div>
                    </div>

                    <div className="mb-4 bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-700 mb-2">Writing Tips:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {topic.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="text-sm text-blue-600">{tip}</li>
                        ))}
                      </ul>
                    </div>

                    {generatedEssays[topic.title] ? (
                      <div className="prose max-w-none">
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-gray-900">Your Essay</h4>
                            <span className={`text-sm ${
                              essayWordCounts[topic.title] > topic.wordLimit ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {essayWordCounts[topic.title] || 0} / {topic.wordLimit} words
                            </span>
                          </div>
                          <p className="whitespace-pre-line">{generatedEssays[topic.title]}</p>
                        </div>
                        
                        {editingEssay === topic.title ? (
                          <div className="mt-4 space-y-4">
                            <textarea
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              rows={4}
                              placeholder="Enter your editing instructions (e.g., 'Make it more personal', 'Add more details about my leadership experience', 'Remove the part about...')"
                              value={editInstructions}
                              onChange={(e) => setEditInstructions(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingEssay(null);
                                  setEditInstructions('');
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => editEssay(topic, editInstructions)}
                                disabled={!editInstructions.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Apply Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => generateEssay(topic)}
                              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Regenerate
                            </button>
                            <button
                              onClick={() => setEditingEssay(topic.title)}
                              className="text-green-600 hover:text-green-700 flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => generateEssay(topic)}
                        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Generate Essay
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Next Steps with Progress Tracking */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg p-6 shadow-sm"
          >
            <h2 className="text-2xl font-bold mb-6">Application Checklist & Next Steps</h2>
            
            {/* Important Dates */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Important Dates for {university.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900">Application Deadline</h4>
                  <p className="text-blue-700">{university.applicationDeadline}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900">Document Submission</h4>
                  <p className="text-blue-700">{university.documentDeadline}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900">Scholarship Deadline</h4>
                  <p className="text-blue-700">{university.scholarshipDeadline}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900">Program Start</h4>
                  <p className="text-blue-700">{university.programStart}</p>
                </div>
              </div>
            </div>

            {/* Application Steps */}
            <div className="space-y-4">
              {[
                {
                  title: "Document Collection",
                  items: [
                    "Official transcripts",
                    "Standardized test scores",
                    "Letters of recommendation",
                    "Portfolio (if required)",
                    "Financial documents"
                  ],
                  progress: 20
                },
                {
                  title: "Essay Preparation",
                  items: [
                    "Personal statement",
                    "Supplemental essays",
                    "Research proposal (if required)"
                  ],
                  progress: Object.keys(generatedEssays).length / essayTopics.length * 100
                },
                {
                  title: "Application Submission",
                  items: [
                    "Complete online application form",
                    "Pay application fees",
                    "Submit all required documents",
                    "Confirm submission"
                  ],
                  progress: 0
                }
              ].map((section, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">{section.title}</h3>
                    <span className="text-sm text-gray-500">{Math.round(section.progress)}% Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${section.progress}%` }}
                    />
                  </div>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Contact Information */}
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Key Contacts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium mb-2 text-blue-600">Admissions Office</h4>
                  <div className="space-y-2">
                    <p className="text-sm">{aiResponse.contacts.admissions.name}</p>
                    <a 
                      href={`mailto:${aiResponse.contacts.admissions.email}`}
                      className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {aiResponse.contacts.admissions.email}
                    </a>
                    <a 
                      href={`tel:${aiResponse.contacts.admissions.phone}`}
                      className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {aiResponse.contacts.admissions.phone}
                    </a>
                    <p className="text-sm text-gray-500">{aiResponse.contacts.admissions.hours}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium mb-2 text-blue-600">Program Coordinator</h4>
                  <div className="space-y-2">
                    <p className="text-sm">{aiResponse.contacts.programCoordinator.name}</p>
                    <a 
                      href={`mailto:${aiResponse.contacts.programCoordinator.email}`}
                      className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {aiResponse.contacts.programCoordinator.email}
                    </a>
                    <a 
                      href={`tel:${aiResponse.contacts.programCoordinator.phone}`}
                      className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {aiResponse.contacts.programCoordinator.phone}
                    </a>
                    <p className="text-sm text-gray-500">{aiResponse.contacts.programCoordinator.office}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium mb-2 text-blue-600">Financial Aid Office</h4>
                  <div className="space-y-2">
                    <p className="text-sm">{aiResponse.contacts.financialAid.name}</p>
                    <a 
                      href={`mailto:${aiResponse.contacts.financialAid.email}`}
                      className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {aiResponse.contacts.financialAid.email}
                    </a>
                    <a 
                      href={`tel:${aiResponse.contacts.financialAid.phone}`}
                      className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {aiResponse.contacts.financialAid.phone}
                    </a>
                    <a 
                      href={aiResponse.contacts.financialAid.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Visit Website
                    </a>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium mb-2 text-blue-600">International Student Office</h4>
                  <div className="space-y-2">
                    <p className="text-sm">{aiResponse.contacts.international.name}</p>
                    <a 
                      href={`mailto:${aiResponse.contacts.international.email}`}
                      className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {aiResponse.contacts.international.email}
                    </a>
                    <a 
                      href={`tel:${aiResponse.contacts.international.phone}`}
                      className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {aiResponse.contacts.international.phone}
                    </a>
                    <a 
                      href={aiResponse.contacts.international.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Visit Website
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Previous Step
            </button>
          )}
          {currentStep < 3 && (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next Step
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationPrep; 