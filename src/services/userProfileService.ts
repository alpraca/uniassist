import type { UserResource } from '@clerk/types';

export interface AcademicGoals {
  careerPath?: string[];
  researchInterests?: string[];
  workPreference?: 'industry' | 'academia' | 'both';
  studyEnvironment?: 'large-university' | 'small-college' | 'any';
  internshipImportance?: 'high' | 'medium' | 'low';
  budgetRange?: {
    min: number;
    max: number;
    currency: string;
  };
  locationPreferences?: {
    climate?: string[];
    citySize?: 'large' | 'medium' | 'small';
    campusType?: 'urban' | 'suburban' | 'rural';
  };
}

export interface ExtendedUserProfile {
  gpa: number;
  intendedMajor: string;
  preferredRegions: string[];
  tuitionPreference: 'free' | 'low-cost' | 'any';
  learningStyle: 'research-oriented' | 'hands-on';
  testScores?: {
    SAT?: number;
    ACT?: number;
    IELTS?: number;
    TOEFL?: number;
  };
  academicGoals: AcademicGoals;
  previousApplications?: {
    universityName: string;
    programName: string;
    status: 'accepted' | 'rejected' | 'waitlisted' | 'pending';
    year: number;
  }[];
  interests?: string[];
  strengths?: string[];
  extracurriculars?: {
    activity: string;
    role: string;
    duration: string;
    description: string;
  }[];
  awards?: {
    name: string;
    year: number;
    level: string;
  }[];
  lastUpdated?: Date;
}

class UserProfileService {
  private static instance: UserProfileService;
  private profiles: Map<string, ExtendedUserProfile> = new Map();

  private constructor() {}

  public static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService();
    }
    return UserProfileService.instance;
  }

  public async saveProfile(userId: string, profile: Partial<ExtendedUserProfile>): Promise<void> {
    try {
      // Get existing profile or create new one
      const existingProfile = await this.getProfile(userId) || {};
      
      // Merge new profile data with existing data
      const updatedProfile = {
        ...existingProfile,
        ...profile,
        lastUpdated: new Date()
      };

      // Validate required fields
      this.validateProfile(updatedProfile);

      // Save to Clerk user metadata
      await this.saveToClerk(userId, updatedProfile);
      
      // Cache locally
      this.profiles.set(userId, updatedProfile as ExtendedUserProfile);
      
      console.log('Profile saved successfully:', updatedProfile);
    } catch (error) {
      console.error('Error saving profile:', error);
      throw new Error('Failed to save user profile');
    }
  }

  private validateProfile(profile: Partial<ExtendedUserProfile>): void {
    const requiredFields = ['gpa', 'intendedMajor', 'preferredRegions', 'tuitionPreference', 'learningStyle'];
    const missingFields = requiredFields.filter(field => !profile[field as keyof ExtendedUserProfile]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate GPA is a number between 0 and 4
    if (typeof profile.gpa === 'number' && (profile.gpa < 0 || profile.gpa > 4)) {
      throw new Error('GPA must be between 0 and 4');
    }
  }

  public async getProfile(userId: string): Promise<ExtendedUserProfile | null> {
    try {
      // Check cache first
      if (this.profiles.has(userId)) {
        return this.profiles.get(userId)!;
      }

      // Get from Clerk if not in cache
      const profile = await this.getFromClerk(userId);
      if (profile) {
        // Convert date string back to Date object
        if (profile.lastUpdated) {
          profile.lastUpdated = new Date(profile.lastUpdated);
        }
        
        this.profiles.set(userId, profile);
        return profile;
      }

      return null;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw new Error('Failed to get user profile');
    }
  }

  private async saveToClerk(userId: string, profile: Partial<ExtendedUserProfile>): Promise<void> {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          profile: {
            ...profile,
            lastUpdated: profile.lastUpdated?.toISOString()
          }
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to save profile to Clerk: ${error}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error('Failed to save profile to Clerk');
      }
    } catch (error) {
      console.error('Error saving to Clerk:', error);
      throw error;
    }
  }

  private async getFromClerk(userId: string): Promise<ExtendedUserProfile | null> {
    try {
      const response = await fetch(`/api/user/profile?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to get profile from Clerk');
      }
      
      const data = await response.json();
      return data.profile || null;
    } catch (error) {
      console.error('Error getting from Clerk:', error);
      throw error;
    }
  }

  public calculateProfileCompleteness(profile: Partial<ExtendedUserProfile>): number {
    const requiredFields = ['gpa', 'intendedMajor', 'preferredRegions', 'tuitionPreference', 'learningStyle'];
    const optionalFields = ['testScores', 'academicGoals', 'interests', 'strengths', 'extracurriculars', 'awards'];
    
    let score = 0;
    let total = requiredFields.length + optionalFields.length;

    // Check required fields
    requiredFields.forEach(field => {
      const value = profile[field as keyof ExtendedUserProfile];
      if (value) {
        if (Array.isArray(value) && value.length > 0) score++;
        else if (typeof value === 'object' && Object.keys(value).length > 0) score++;
        else if (value) score++;
      }
    });

    // Check optional fields
    optionalFields.forEach(field => {
      const value = profile[field as keyof ExtendedUserProfile];
      if (value) {
        if (Array.isArray(value) && value.length > 0) score++;
        else if (typeof value === 'object' && Object.keys(value).length > 0) score++;
      }
    });

    return (score / total) * 100;
  }

  public getProfileStrengths(profile: ExtendedUserProfile): string[] {
    const strengths: string[] = [];

    if (profile.gpa >= 3.5) strengths.push('Strong Academic Performance');
    if (profile.testScores?.SAT && profile.testScores.SAT >= 1400) strengths.push('Excellent SAT Score');
    if (profile.testScores?.ACT && profile.testScores.ACT >= 30) strengths.push('Excellent ACT Score');
    if (profile.extracurriculars && profile.extracurriculars.length >= 3) strengths.push('Strong Extracurricular Involvement');
    if (profile.awards && profile.awards.length > 0) strengths.push('Academic/Extra-curricular Achievements');
    if (profile.academicGoals && Object.keys(profile.academicGoals).length >= 4) strengths.push('Clear Academic Goals');

    return strengths;
  }

  public getImprovementAreas(profile: ExtendedUserProfile): string[] {
    const improvements: string[] = [];

    if (profile.gpa < 3.0) improvements.push('Consider improving academic performance');
    if (!profile.testScores?.SAT && !profile.testScores?.ACT) improvements.push('Consider taking SAT or ACT');
    if (!profile.extracurriculars || profile.extracurriculars.length < 2) improvements.push('Add more extracurricular activities');
    if (!profile.academicGoals || Object.keys(profile.academicGoals).length < 3) improvements.push('Define academic goals more clearly');
    if (!profile.interests || profile.interests.length < 3) improvements.push('Add more academic interests');

    return improvements;
  }
}

export const userProfileService = UserProfileService.getInstance(); 