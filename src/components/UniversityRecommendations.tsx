'use client';

import React, { useEffect, useState } from 'react';
import { UniversityAIService } from '../services/universityAI';
import { ExtendedUserProfile } from '../services/userProfileService';

interface UniversityRecommendationsProps {
  userProfile: ExtendedUserProfile;
}

interface MatchAnalysis {
  academicFit: number;
  culturalFit: number;
  financialFit: number;
  overallFit: number;
  reasons: string[];
}

export default function UniversityRecommendations({ userProfile }: UniversityRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchAnalyses, setMatchAnalyses] = useState<Map<string, MatchAnalysis>>(new Map());

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!userProfile?.gpa || !userProfile?.intendedMajor) {
        setError('Please complete your profile with GPA and intended major');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        console.log('Starting recommendation process with profile:', {
          gpa: userProfile.gpa,
          intendedMajor: userProfile.intendedMajor,
          preferredRegions: userProfile.preferredRegions,
          tuitionPreference: userProfile.tuitionPreference,
          learningStyle: userProfile.learningStyle,
          testScores: userProfile.testScores,
          academicGoals: userProfile.academicGoals
        });
        
        // Get API key from environment variable
        const apiKey = 'AIzaSyDNF0OZ3tlOSHM3_WSGD32_DZ2npTxZquo';
        if (!apiKey) {
          throw new Error('Missing API key - please check your environment variables');
        }
        
        const aiService = new UniversityAIService(apiKey);
        const results = await aiService.getUniversityRecommendations({
          gpa: userProfile.gpa,
          intendedMajor: userProfile.intendedMajor,
          preferredRegions: userProfile.preferredRegions,
          tuitionPreference: userProfile.tuitionPreference,
          learningStyle: userProfile.learningStyle,
          testScores: userProfile.testScores
        });
        
        if (!results || results.length === 0) {
          throw new Error('No universities found. Please try adjusting your profile criteria.');
        }

        // Calculate match analyses for each university
        const analyses = new Map<string, MatchAnalysis>();
        results.forEach(uni => {
          const analysis = calculateMatchAnalysis(uni, userProfile);
          analyses.set(uni.name, analysis);
        });
        
        // Sort recommendations by overall fit score
        const sortedResults = results.sort((a, b) => {
          const analysisA = analyses.get(a.name);
          const analysisB = analyses.get(b.name);
          return (analysisB?.overallFit || 0) - (analysisA?.overallFit || 0);
        });
        
        setMatchAnalyses(analyses);
        setRecommendations(sortedResults);
      } catch (err) {
        console.error('Error in recommendation process:', err);
        if (err instanceof Error && err.message.includes('API key')) {
          setError('System configuration error. Please contact support.');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to get university recommendations. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userProfile]);

  const calculateMatchAnalysis = (university: any, profile: ExtendedUserProfile): MatchAnalysis => {
    let academicFit = 0;
    let culturalFit = 0;
    let financialFit = 0;
    const reasons: string[] = [];

    // Academic Fit (40% of total)
    // Base academic score on university's match score
    if (university.matchScore >= 80) {
      academicFit += 40;
      reasons.push('Excellent academic match');
    } else if (university.matchScore >= 70) {
      academicFit += 35;
      reasons.push('Strong academic match');
    } else if (university.matchScore >= 60) {
      academicFit += 25;
      reasons.push('Good academic match');
    } else if (university.matchScore >= 50) {
      academicFit += 15;
      reasons.push('Moderate academic match');
    }

    // Program match
    if (university.programDetails.availablePrograms.some(program => 
      program.toLowerCase().includes(profile.intendedMajor.toLowerCase()) ||
      profile.intendedMajor.toLowerCase().includes(program.toLowerCase())
    )) {
      academicFit += 30;
      reasons.push('Offers your intended major');
    }

    // Learning style match
    if (profile.learningStyle && university.programDetails.learningEnvironment === profile.learningStyle) {
      academicFit += 20;
      reasons.push(`Matches your ${profile.learningStyle} learning style`);
    }

    // Cultural Fit (30% of total)
    // Location preferences
    if (profile.academicGoals?.locationPreferences) {
      const { citySize, campusType } = profile.academicGoals.locationPreferences;
      
      if (citySize && university.programDetails.campusLocation?.cityType === citySize) {
        culturalFit += 30;
        reasons.push(`Located in a ${citySize} city, matching your preference`);
      }
      
      if (campusType && university.programDetails.campusLocation?.type === campusType) {
        culturalFit += 30;
        reasons.push(`${campusType.charAt(0).toUpperCase() + campusType.slice(1)} campus environment, as preferred`);
      }
    }

    // Region match
    if (profile.preferredRegions.some(region => 
      university.country.toLowerCase().includes(region.toLowerCase())
    )) {
      culturalFit += 40;
      reasons.push('Located in your preferred region');
    }

    // Financial Fit (30% of total)
    const tuitionMap = {
      'free': 100,
      'low': 80,
      'moderate': 60,
      'high': 40
    };

    const tuitionScore = tuitionMap[university.programDetails.tuitionRange as keyof typeof tuitionMap] || 50;
    
    if (profile.tuitionPreference === 'free' && university.programDetails.tuitionRange === 'free') {
      financialFit = 100;
      reasons.push('Offers free tuition, matching your preference');
    } else if (profile.tuitionPreference === 'low-cost' && 
              (university.programDetails.tuitionRange === 'free' || university.programDetails.tuitionRange === 'low')) {
      financialFit = 90;
      reasons.push('Offers affordable tuition, matching your preference');
    } else {
      financialFit = tuitionScore;
      if (tuitionScore >= 60) {
        reasons.push('Reasonable tuition costs');
      }
    }

    // Calculate overall fit with weighted components
    const overallFit = Math.round(
      (academicFit * 0.4) +  // 40% weight for academic fit
      (culturalFit * 0.3) +  // 30% weight for cultural fit
      (financialFit * 0.3)   // 30% weight for financial fit
    );

    return {
      academicFit: Math.round(academicFit),
      culturalFit: Math.round(culturalFit),
      financialFit: Math.round(financialFit),
      overallFit,
      reasons
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Finding universities that match your profile...</p>
        <p className="mt-2 text-sm text-gray-500">This may take a few moments</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-yellow-800 font-medium mb-2">Error Finding Universities</h3>
        <p className="text-yellow-600 mb-4">{error}</p>
        <p className="text-yellow-600 mb-4">
          To get better recommendations, try:
        </p>
        <ul className="list-disc list-inside text-yellow-700 mb-4">
          <li>Checking your GPA is entered correctly</li>
          <li>Verifying your intended major</li>
          <li>Expanding your preferred regions</li>
          <li>Adjusting your tuition preferences</li>
        </ul>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-yellow-800 font-medium mb-2">No Results Found</h3>
        <p className="text-yellow-600 mb-4">
          We couldn't find any universities matching your criteria. Try:
        </p>
        <ul className="list-disc list-inside text-yellow-700 mb-4">
          <li>Adjusting your GPA range</li>
          <li>Expanding your preferred regions</li>
          <li>Considering different program options</li>
          <li>Checking different tuition preferences</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-green-800">
          <span className="font-medium">Found {recommendations.length} universities</span> that match your profile!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((uni, index) => {
          const analysis = matchAnalyses.get(uni.name);
          return (
            <div
              key={`${uni.name}-${index}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{uni.name}</h3>
                  <span className={`px-2 py-1 text-sm rounded ${
                    (analysis?.overallFit || 0) >= 70 ? 'bg-green-500' :
                    (analysis?.overallFit || 0) >= 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  } text-white`}>
                    {analysis?.overallFit || 0}% Match
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-gray-600">{uni.country}</p>
                  {uni.programDetails.ranking && (
                    <p className="text-sm text-gray-500">World Ranking: #{uni.programDetails.ranking}</p>
                  )}
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Available Programs:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {uni.programDetails.availablePrograms.map((program: string, i: number) => (
                      <li key={i}>{program}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Why This Match:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {analysis?.reasons.map((reason: string, i: number) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Match Analysis:</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Academic Fit:</span>
                      <span className="text-sm font-medium">{analysis?.academicFit}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Cultural Fit:</span>
                      <span className="text-sm font-medium">{analysis?.culturalFit}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Financial Fit:</span>
                      <span className="text-sm font-medium">{analysis?.financialFit}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Admission Requirements:</h4>
                  <p className="text-sm text-gray-600">{uni.programDetails.admissionRequirements}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 