'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import UniversityRecommendations from './UniversityRecommendations';
import DebugProfile from './DebugProfile';
import EnhancedProfileForm from './EnhancedProfileForm';
import { userProfileService, ExtendedUserProfile } from '../services/userProfileService';
import { GEMINI_API_KEY } from '../config/ai-config';

export default function Dashboard() {
  const { user } = useUser();
  const [profile, setProfile] = useState<ExtendedUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('Loading profile for user:', user.id);
        const userProfile = await userProfileService.getProfile(user.id);
        
        if (userProfile) {
          console.log('Loaded profile data:', userProfile);
          setProfile(userProfile);
          setShowRecommendations(true);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  const handleProfileSubmit = async (formData: ExtendedUserProfile) => {
    try {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('Submitting profile data:', formData);
      
      // Save profile data
      await userProfileService.saveProfile(user.id, formData);
      
      // Update local state
      setProfile(formData);
      setShowRecommendations(true);

      // Scroll to recommendations
      const recommendationsSection = document.getElementById('university-recommendations');
      if (recommendationsSection) {
        recommendationsSection.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile data');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Your Academic Profile</h2>
        <EnhancedProfileForm 
          onSubmit={handleProfileSubmit}
          initialData={profile || undefined}
        />
      </div>

      {process.env.NODE_ENV === 'development' && (
        <DebugProfile 
          profile={profile}
          formattedProfile={profile || undefined}
          apiKey={GEMINI_API_KEY}
        />
      )}
      
      <div id="university-recommendations" className="mt-8">
        {showRecommendations && profile && (
          <>
            <h2 className="text-2xl font-bold mb-4">University Recommendations</h2>
            <UniversityRecommendations 
              userProfile={profile}
            />
          </>
        )}
      </div>
    </div>
  );
} 