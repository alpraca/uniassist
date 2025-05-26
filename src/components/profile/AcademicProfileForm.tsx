import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import type { AcademicProfile, StandardizedTest, AdvancedCourse } from '../../types/academicProfile';

interface AcademicProfileFormProps {
  onComplete?: () => void;
}

const AcademicProfileForm: React.FC<AcademicProfileFormProps> = ({ onComplete }) => {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Partial<AcademicProfile>>({});

  useEffect(() => {
    // Load existing profile from Clerk metadata
    if (user?.unsafeMetadata?.academicProfile) {
      setProfile(user.unsafeMetadata.academicProfile as AcademicProfile);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await user.update({
        unsafeMetadata: {
          academicProfile: profile
        }
      });
      onComplete?.();
    } catch (error) {
      console.error('Error saving profile:', error);
      // Show error message to user
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (updates: Partial<AcademicProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const renderAcademicBackground = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Academic Background</h3>
      
      {/* GPA */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Current GPA</label>
        <input
          type="text"
          value={profile.gpa || ''}
          onChange={(e) => updateProfile({ gpa: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="e.g. 3.8/4.0"
        />
      </div>

      {/* Intended Major */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Intended Major</label>
        <input
          type="text"
          value={profile.intendedMajor || ''}
          onChange={(e) => updateProfile({ intendedMajor: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="e.g. Computer Science"
        />
      </div>

      {/* Standardized Tests */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Standardized Tests</label>
        <div className="space-y-2">
          {(profile.standardizedTests || []).map((test, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={test.name}
                onChange={(e) => {
                  const newTests = [...(profile.standardizedTests || [])];
                  newTests[index] = { ...test, name: e.target.value };
                  updateProfile({ standardizedTests: newTests });
                }}
                className="mt-1 block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="Test Name"
              />
              <input
                type="text"
                value={test.score}
                onChange={(e) => {
                  const newTests = [...(profile.standardizedTests || [])];
                  newTests[index] = { ...test, score: e.target.value };
                  updateProfile({ standardizedTests: newTests });
                }}
                className="mt-1 block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="Score"
              />
              <input
                type="date"
                value={test.date}
                onChange={(e) => {
                  const newTests = [...(profile.standardizedTests || [])];
                  newTests[index] = { ...test, date: e.target.value };
                  updateProfile({ standardizedTests: newTests });
                }}
                className="mt-1 block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => updateProfile({
              standardizedTests: [...(profile.standardizedTests || []), { name: '', score: '', date: '' }]
            })}
            className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-primary hover:bg-primary/90"
          >
            Add Test
          </button>
        </div>
      </div>

      {/* Strong Subjects */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Strongest Academic Subjects</label>
        <input
          type="text"
          value={profile.strongestSubjects?.join(', ') || ''}
          onChange={(e) => updateProfile({ strongestSubjects: e.target.value.split(',').map(s => s.trim()) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="e.g. Mathematics, Physics, Computer Science"
        />
      </div>

      {/* Favorite Subjects */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Favorite Academic Subjects</label>
        <input
          type="text"
          value={profile.favoriteSubjects?.join(', ') || ''}
          onChange={(e) => updateProfile({ favoriteSubjects: e.target.value.split(',').map(s => s.trim()) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="e.g. Literature, Biology, Art"
        />
      </div>

      {/* Academic Awards */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Academic Awards & Recognitions</label>
        <textarea
          value={profile.academicAwards?.join('\n') || ''}
          onChange={(e) => updateProfile({ academicAwards: e.target.value.split('\n').filter(s => s.trim()) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          rows={3}
          placeholder="List your academic awards, one per line"
        />
      </div>
    </div>
  );

  const renderStudyPreferences = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Study Preferences</h3>
      
      {/* Academic Preference */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Academic Rigor Preference</label>
        <select
          value={profile.academicPreference || ''}
          onChange={(e) => updateProfile({ academicPreference: e.target.value as 'rigorous' | 'balanced' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        >
          <option value="">Select preference</option>
          <option value="rigorous">Intense Academic Rigor</option>
          <option value="balanced">Balanced Curriculum</option>
        </select>
      </div>

      {/* Learning Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Learning Style</label>
        <select
          value={profile.learningStyle || ''}
          onChange={(e) => updateProfile({ learningStyle: e.target.value as 'research-oriented' | 'hands-on' | 'mixed' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        >
          <option value="">Select style</option>
          <option value="research-oriented">Research & Independent Study</option>
          <option value="hands-on">Hands-on Learning</option>
          <option value="mixed">Mixed Approach</option>
        </select>
      </div>

      {/* Environment Preference */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Learning Environment</label>
        <select
          value={profile.environmentPreference || ''}
          onChange={(e) => updateProfile({ environmentPreference: e.target.value as 'competitive' | 'collaborative' | 'both' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        >
          <option value="">Select environment</option>
          <option value="competitive">Competitive</option>
          <option value="collaborative">Collaborative</option>
          <option value="both">Both</option>
        </select>
      </div>

      {/* Program Preferences */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Program Preferences</label>
        <input
          type="text"
          value={profile.programPreferences?.join(', ') || ''}
          onChange={(e) => updateProfile({ programPreferences: e.target.value.split(',').map(s => s.trim()) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="e.g. Research, Internships, Study Abroad"
        />
      </div>

      {/* Technical Interests */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Technical Interests</label>
        <input
          type="text"
          value={profile.technicalInterests?.join(', ') || ''}
          onChange={(e) => updateProfile({ technicalInterests: e.target.value.split(',').map(s => s.trim()) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="e.g. AI, Robotics, Web Development"
        />
      </div>
    </div>
  );

  const renderLocationPreferences = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Location & University Preferences</h3>
      
      {/* Study Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Study Location Preference</label>
        <select
          value={profile.studyLocation || ''}
          onChange={(e) => updateProfile({ studyLocation: e.target.value as 'home-country' | 'abroad' | 'both' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        >
          <option value="">Select preference</option>
          <option value="home-country">Home Country</option>
          <option value="abroad">Abroad</option>
          <option value="both">Both</option>
        </select>
      </div>

      {/* Preferred Regions */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Preferred Regions</label>
        <input
          type="text"
          value={profile.preferredRegions?.join(', ') || ''}
          onChange={(e) => updateProfile({ preferredRegions: e.target.value.split(',').map(s => s.trim()) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="e.g. North America, Europe, Asia"
        />
      </div>

      {/* Campus Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Campus Setting</label>
        <select
          value={profile.campusPreference || ''}
          onChange={(e) => updateProfile({ campusPreference: e.target.value as 'urban' | 'suburban' | 'rural' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        >
          <option value="">Select setting</option>
          <option value="urban">Urban</option>
          <option value="suburban">Suburban</option>
          <option value="rural">Rural</option>
        </select>
      </div>

      {/* University Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700">University Size</label>
        <select
          value={profile.universitySize || ''}
          onChange={(e) => updateProfile({ universitySize: e.target.value as 'large' | 'medium' | 'small' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        >
          <option value="">Select size</option>
          <option value="large">Large</option>
          <option value="medium">Medium</option>
          <option value="small">Small</option>
        </select>
      </div>
    </div>
  );

  const renderFinancialConsiderations = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Financial Considerations</h3>
      
      {/* Tuition Preference */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Tuition Preference</label>
        <select
          value={profile.tuitionPreference || ''}
          onChange={(e) => updateProfile({ tuitionPreference: e.target.value as 'free' | 'low-cost' | 'any' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        >
          <option value="">Select preference</option>
          <option value="free">Free Education</option>
          <option value="low-cost">Low-Cost Options</option>
          <option value="any">Any Cost Level</option>
        </select>
      </div>

      {/* Scholarship Needed */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Scholarship Need</label>
        <div className="mt-2">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={profile.scholarshipNeeded || false}
              onChange={(e) => updateProfile({ scholarshipNeeded: e.target.checked })}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-2">I need scholarship opportunities</span>
          </label>
        </div>
      </div>

      {/* Work Study Interest */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Work Study Interest</label>
        <div className="mt-2">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={profile.workStudyInterest || false}
              onChange={(e) => updateProfile({ workStudyInterest: e.target.checked })}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-2">I'm interested in work-study opportunities</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderCareerGoals = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Career Goals</h3>
      
      {/* Career Goals */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Career Goals</label>
        <textarea
          value={profile.careerGoals?.join('\n') || ''}
          onChange={(e) => updateProfile({ careerGoals: e.target.value.split('\n').filter(s => s.trim()) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          rows={3}
          placeholder="List your career goals, one per line"
        />
      </div>

      {/* Industry Preferences */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Industry Preferences</label>
        <input
          type="text"
          value={profile.industryPreferences?.join(', ') || ''}
          onChange={(e) => updateProfile({ industryPreferences: e.target.value.split(',').map(s => s.trim()) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="e.g. Tech, Healthcare, Finance"
        />
      </div>

      {/* Target University Tier */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Target University Tier</label>
        <select
          value={profile.targetUniversityTier || ''}
          onChange={(e) => updateProfile({ targetUniversityTier: e.target.value as 'top' | 'mid' | 'any' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        >
          <option value="">Select tier</option>
          <option value="top">Top-Tier Universities</option>
          <option value="mid">Mid-Tier Universities</option>
          <option value="any">Any Tier</option>
        </select>
      </div>
    </div>
  );

  const renderSocialAndExtracurricular = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Social & Extracurricular Interests</h3>
      
      {/* Extracurricular Interests */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Extracurricular Interests</label>
        <input
          type="text"
          value={profile.extracurricularInterests?.join(', ') || ''}
          onChange={(e) => updateProfile({ extracurricularInterests: e.target.value.split(',').map(s => s.trim()) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="e.g. Music, Debate, Photography"
        />
      </div>

      {/* Club Preferences */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Club Preferences</label>
        <input
          type="text"
          value={profile.clubPreferences?.join(', ') || ''}
          onChange={(e) => updateProfile({ clubPreferences: e.target.value.split(',').map(s => s.trim()) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="e.g. Robotics Club, Chess Club, Environmental Club"
        />
      </div>

      {/* Athletic Interests */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Athletic Interests (Optional)</label>
        <input
          type="text"
          value={profile.athleticInterests?.join(', ') || ''}
          onChange={(e) => updateProfile({ athleticInterests: e.target.value.split(',').map(s => s.trim()) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="e.g. Basketball, Swimming, Tennis"
        />
      </div>
    </div>
  );

  const renderAdditionalInformation = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Additional Information</h3>
      
      {/* Languages */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Languages</label>
        <input
          type="text"
          value={profile.languages?.join(', ') || ''}
          onChange={(e) => updateProfile({ languages: e.target.value.split(',').map(s => s.trim()) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="e.g. English, Spanish, Mandarin"
        />
      </div>

      {/* Special Needs */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Special Needs (Optional)</label>
        <input
          type="text"
          value={profile.specialNeeds?.join(', ') || ''}
          onChange={(e) => updateProfile({ specialNeeds: e.target.value.split(',').map(s => s.trim()) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="List any special needs or accommodations"
        />
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
        <textarea
          value={profile.additionalNotes || ''}
          onChange={(e) => updateProfile({ additionalNotes: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          rows={3}
          placeholder="Any additional information you'd like to share"
        />
      </div>
    </div>
  );

  const steps = [
    { title: 'Academic Background', component: renderAcademicBackground },
    { title: 'Study Preferences', component: renderStudyPreferences },
    { title: 'Location Preferences', component: renderLocationPreferences },
    { title: 'Financial Considerations', component: renderFinancialConsiderations },
    { title: 'Career Goals', component: renderCareerGoals },
    { title: 'Social & Extracurricular', component: renderSocialAndExtracurricular },
    { title: 'Additional Information', component: renderAdditionalInformation }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Academic Profile</h2>
          <span className="text-sm text-gray-500">Step {currentStep} of {steps.length}</span>
        </div>
        <div className="mt-4 flex gap-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full ${
                index + 1 === currentStep ? 'bg-primary' :
                index + 1 < currentStep ? 'bg-primary/60' :
                'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {steps[currentStep - 1].component()}
      </motion.div>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          Previous
        </button>
        
        <button
          type="button"
          onClick={() => {
            if (currentStep === steps.length) {
              handleSave();
            } else {
              setCurrentStep(prev => Math.min(steps.length, prev + 1));
            }
          }}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {loading ? 'Saving...' : currentStep === steps.length ? 'Save Profile' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default AcademicProfileForm; 