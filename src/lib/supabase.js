import { createClient } from '@supabase/supabase-js';

// Default values for development - REPLACE THESE WITH YOUR ACTUAL VALUES
const FALLBACK_URL = 'https://your-project-id.supabase.co';
const FALLBACK_KEY = 'your-anon-key';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for profile management
export const profileHelpers = {
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error.message);
      return null;
    }
  },

  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ user_id: userId, ...updates })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error.message);
      return null;
    }
  },

  async getOnboardingProgress(userId) {
    try {
      const tables = [
        'profiles',
        'academics',
        'goals',
        'university_preferences',
        'resume_experience',
        'technical_skills',
        'financial_info',
        'personality',
        'social_networking',
        'bonus_info'
      ];

      const progress = {};
      
      for (const table of tables) {
        const { data } = await supabase
          .from(table)
          .select('user_id')
          .eq('user_id', userId)
          .single();
        
        progress[table] = !!data;
      }

      return progress;
    } catch (error) {
      console.error('Error fetching onboarding progress:', error.message);
      return {};
    }
  }
};

// Database schema for connections
export const createConnection = async (senderId, receiverId, type) => {
  try {
    const { data, error } = await supabase
      .from('connections')
      .insert([
        {
          sender_id: senderId,
          receiver_id: receiverId,
          type,
          status: 'pending'
        }
      ]);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating connection:', error.message);
    return null;
  }
};

// Database schema for profiles
export const updateProfile = async (userId, role, profileData) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert([
        {
          user_id: userId,
          role,
          ...profileData
        }
      ]);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating profile:', error.message);
    return null;
  }
};

// Get user profile
export const getProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    return null;
  }
}; 