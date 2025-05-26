export interface StandardizedTest {
  name: string;
  score: string;
  date: string;
}

export interface AdvancedCourse {
  name: string;
  grade: string;
  year: string;
}

export interface AcademicProfile {
  // Academic Background
  gpa: string;
  standardizedTests: StandardizedTest[];
  advancedCourses?: AdvancedCourse[];
  strongestSubjects: string[];
  favoriteSubjects: string[];
  academicAwards: string[];
  intendedMajor: string;

  // Study Preferences
  academicPreference: 'rigorous' | 'balanced';
  learningStyle: 'research-oriented' | 'hands-on' | 'mixed';
  environmentPreference: 'competitive' | 'collaborative' | 'both';
  programPreferences: string[]; // e.g. ["Research", "Internships", "Study Abroad"]
  technicalInterests: string[]; // e.g. ["AI", "Robotics", "Web Development"]

  // Location Preferences
  studyLocation: 'home-country' | 'abroad' | 'both';
  preferredRegions: string[];
  campusPreference: 'urban' | 'suburban' | 'rural';
  universitySize: 'large' | 'medium' | 'small';

  // Financial Considerations
  tuitionPreference: 'free' | 'low-cost' | 'any';
  scholarshipNeeded: boolean;
  workStudyInterest: boolean;

  // Career Goals
  careerGoals: string[];
  industryPreferences: string[];
  targetUniversityTier: 'top' | 'mid' | 'any';

  // Social & Extracurricular
  extracurricularInterests: string[];
  clubPreferences: string[];
  athleticInterests?: string[];

  // Additional Information
  languages: string[];
  specialNeeds?: string[];
  additionalNotes?: string;
} 