import type { AcademicProfile } from '../types/academicProfile';

interface University {
  name: string;
  country: string;
  ranking: number;
  programs: string[];
  researchFocus: boolean;
  tuitionRange: string;
  admissionRate: string;
  strengths: string[];
  campusType: 'urban' | 'suburban' | 'rural';
  size: 'large' | 'medium' | 'small';
}

interface Mentor {
  id: string;
  name: string;
  university: string;
  field: string;
  expertise: string[];
  researchInterests: string[];
  yearsOfExperience: number;
  availableForMentoring: boolean;
}

// Define regions and their countries
const REGIONS_AND_COUNTRIES = {
  "Europe": [
    "United Kingdom", "Germany", "France", "Netherlands", "Italy", "Spain", 
    "Sweden", "Denmark", "Norway", "Finland", "Switzerland", "Ireland", 
    "Belgium", "Austria", "Poland", "Czech Republic", "Portugal", "Greece"
  ],
  "North America": ["United States", "Canada", "Mexico"],
  "Asia": [
    "Japan", "South Korea", "Singapore", "China", "Hong Kong", "Taiwan", 
    "Malaysia", "Vietnam", "Thailand", "India", "Indonesia"
  ],
  "Australia/Oceania": ["Australia", "New Zealand"]
};

export const calculateUniversityMatch = (university: University, profile: AcademicProfile): number => {
  let totalScore = 0;
  let totalWeight = 0;

  const weights = {
    location: 25, // Increased from 15
    programs: 20, // Adjusted
    researchFocus: 15,
    financialFit: 15,
    campusLife: 15,
    academicFit: 10 // Adjusted
  };

  // Location match (25% of total) - Now more strict and accurate
  if (profile.preferredRegions?.length > 0) {
    totalWeight += weights.location;
    let locationScore = 0;

    // Check if university's country is in any of the preferred regions
    const isInPreferredRegion = profile.preferredRegions.some(region => {
      const regionCountries = REGIONS_AND_COUNTRIES[region] || [];
      return regionCountries.includes(university.country);
    });

    if (isInPreferredRegion) {
      locationScore = weights.location;
    } else if (profile.studyLocation === 'both') {
      // If user is open to both locations, give partial score for non-preferred regions
      locationScore = weights.location * 0.3;
    }

    totalScore += locationScore;
  }

  // Program match (20% of total)
  if (profile.intendedMajor) {
    totalWeight += weights.programs;
    if (university.programs.some(program => 
      program.toLowerCase().includes(profile.intendedMajor.toLowerCase()) ||
      profile.intendedMajor.toLowerCase().includes(program.toLowerCase())
    )) {
      totalScore += weights.programs;
    }
  }

  // Research focus alignment (15% of total)
  if (profile.learningStyle) {
    totalWeight += weights.researchFocus;
    if (
      (profile.learningStyle === 'research-oriented' && university.researchFocus) ||
      (profile.learningStyle === 'hands-on' && !university.researchFocus) ||
      (profile.learningStyle === 'mixed')
    ) {
      totalScore += weights.researchFocus;
    }
  }

  // Financial fit (15% of total)
  if (profile.tuitionPreference) {
    totalWeight += weights.financialFit;
    const tuitionLevel = university.tuitionRange.toLowerCase();
    
    if (
      (profile.tuitionPreference === 'low-cost' && 
        (tuitionLevel.includes('free') || tuitionLevel.includes('low'))) ||
      (profile.tuitionPreference === 'free' && tuitionLevel.includes('free')) ||
      profile.tuitionPreference === 'any'
    ) {
      totalScore += weights.financialFit;
    } else if (profile.tuitionPreference === 'low-cost' && tuitionLevel.includes('moderate')) {
      // Partial score for moderate tuition when looking for low-cost
      totalScore += weights.financialFit * 0.5;
    }
  }

  // Campus life match (15% of total)
  if (profile.campusPreference && profile.universitySize) {
    totalWeight += weights.campusLife;
    let campusScore = 0;
    
    // Campus type match
    if (university.campusType === profile.campusPreference) {
      campusScore += weights.campusLife * 0.5;
    }
    
    // Size match
    if (university.size === profile.universitySize) {
      campusScore += weights.campusLife * 0.5;
    }
    
    totalScore += campusScore;
  }

  // Academic fit (10% of total)
  if (profile.academicPreference) {
    totalWeight += weights.academicFit;
    const admissionRate = university.admissionRate.toLowerCase();
    
    if (
      (profile.academicPreference === 'rigorous' && 
        (admissionRate.includes('selective') || admissionRate.includes('highly'))) ||
      (profile.academicPreference === 'balanced' && 
        (admissionRate.includes('moderate') || admissionRate.includes('balanced')))
    ) {
      totalScore += weights.academicFit;
    }
  }

  // Calculate percentage match
  const matchPercentage = totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;

  // Apply location-based threshold
  if (profile.preferredRegions?.length > 0) {
    const isInPreferredRegion = profile.preferredRegions.some(region => {
      const regionCountries = REGIONS_AND_COUNTRIES[region] || [];
      return regionCountries.includes(university.country);
    });

    // If not in preferred region and user wants specific regions, cap the match score
    if (!isInPreferredRegion && profile.studyLocation !== 'both') {
      return Math.min(matchPercentage, 60); // Cap at 60% for universities outside preferred regions
    }
  }

  return matchPercentage;
};

export const calculateMentorMatch = (mentor: Mentor, profile: AcademicProfile): number => {
  let totalScore = 0;
  let totalWeight = 0;

  const weights = {
    fieldMatch: 35,
    researchInterests: 25,
    expertise: 25,
    universityAlignment: 15
  };

  // Field match
  if (profile.intendedMajor) {
    totalWeight += weights.fieldMatch;
    if (mentor.field.toLowerCase().includes(profile.intendedMajor.toLowerCase()) ||
        profile.intendedMajor.toLowerCase().includes(mentor.field.toLowerCase())) {
      totalScore += weights.fieldMatch;
    }
  }

  // Research interests overlap
  if (profile.technicalInterests?.length > 0 && mentor.researchInterests.length > 0) {
    totalWeight += weights.researchInterests;
    const researchInterestOverlap = mentor.researchInterests.filter(interest =>
      profile.technicalInterests.some(userInterest => 
        interest.toLowerCase().includes(userInterest.toLowerCase()) ||
        userInterest.toLowerCase().includes(interest.toLowerCase())
      )
    ).length;
    const overlapScore = (researchInterestOverlap / mentor.researchInterests.length) * weights.researchInterests;
    totalScore += overlapScore;
  }

  // Expertise alignment with student's interests
  if (profile.programPreferences?.length > 0 && mentor.expertise.length > 0) {
    totalWeight += weights.expertise;
    const expertiseOverlap = mentor.expertise.filter(exp =>
      profile.programPreferences.some(pref => 
        exp.toLowerCase().includes(pref.toLowerCase()) ||
        pref.toLowerCase().includes(exp.toLowerCase())
      )
    ).length;
    const expertiseScore = (expertiseOverlap / mentor.expertise.length) * weights.expertise;
    totalScore += expertiseScore;
  }

  // University alignment with preferred regions
  if (profile.preferredRegions?.length > 0) {
    totalWeight += weights.universityAlignment;
    if (profile.preferredRegions.some(region => 
      mentor.university.toLowerCase().includes(region.toLowerCase())
    )) {
      totalScore += weights.universityAlignment;
    }
  }

  // Calculate percentage match
  return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;
};

export const getRecommendedUniversities = (
  universities: University[],
  profile: AcademicProfile,
  limit: number = 5
): { university: University; matchScore: number }[] => {
  return universities
    .map(university => ({
      university,
      matchScore: calculateUniversityMatch(university, profile)
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
};

export const getRecommendedMentors = (
  mentors: Mentor[],
  profile: AcademicProfile,
  limit: number = 3
): { mentor: Mentor; matchScore: number }[] => {
  return mentors
    .filter(mentor => mentor.availableForMentoring)
    .map(mentor => ({
      mentor,
      matchScore: calculateMentorMatch(mentor, profile)
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}; 