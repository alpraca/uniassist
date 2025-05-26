'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { userProfileService, ExtendedUserProfile, AcademicGoals } from '../services/userProfileService';

interface EnhancedProfileFormProps {
  onSubmit: (profileData: ExtendedUserProfile) => void;
  initialData?: Partial<ExtendedUserProfile>;
}

const REGIONS = [
  "North America",
  "Europe",
  "Asia",
  "United Kingdom",
  "Australia/Oceania",
  "Middle East",
  "Latin America"
];

const CAREER_PATHS = [
  "Industry Professional",
  "Academic Research",
  "Entrepreneurship",
  "Public Service",
  "Consulting",
  "Graduate Studies"
];

const STUDY_ENVIRONMENTS = [
  { value: "large-university", label: "Large University" },
  { value: "small-college", label: "Small College" },
  { value: "any", label: "No Preference" }
];

const CITY_SIZES = [
  { value: "large", label: "Large City" },
  { value: "medium", label: "Medium City" },
  { value: "small", label: "Small City/Town" }
];

const CAMPUS_TYPES = [
  { value: "urban", label: "Urban" },
  { value: "suburban", label: "Suburban" },
  { value: "rural", label: "Rural" }
];

export default function EnhancedProfileForm({ onSubmit, initialData }: EnhancedProfileFormProps) {
  const { user } = useUser();
  const [saving, setSaving] = useState(false);
  const [completeness, setCompleteness] = useState(0);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [improvements, setImprovements] = useState<string[]>([]);

  const [formData, setFormData] = useState<Partial<ExtendedUserProfile>>({
    gpa: initialData?.gpa || 0,
    intendedMajor: initialData?.intendedMajor || '',
    preferredRegions: initialData?.preferredRegions || [],
    tuitionPreference: initialData?.tuitionPreference || 'any',
    learningStyle: initialData?.learningStyle || 'hands-on',
    testScores: initialData?.testScores || {},
    academicGoals: initialData?.academicGoals || {
      careerPath: [],
      studyEnvironment: 'any',
      internshipImportance: 'medium',
      locationPreferences: {
        citySize: 'medium',
        campusType: 'urban'
      }
    },
    interests: initialData?.interests || [],
    strengths: initialData?.strengths || [],
    extracurriculars: initialData?.extracurriculars || [],
    awards: initialData?.awards || []
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Calculate profile completeness
    const complete = userProfileService.calculateProfileCompleteness(formData);
    setCompleteness(complete);

    // Get profile analysis if we have enough data
    if (complete > 30) {
      setStrengths(userProfileService.getProfileStrengths(formData as ExtendedUserProfile));
      setImprovements(userProfileService.getImprovementAreas(formData as ExtendedUserProfile));
    }
  }, [formData]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate GPA
    if (!formData.gpa || formData.gpa < 0 || formData.gpa > 4) {
      errors.gpa = 'GPA must be between 0 and 4';
    }

    // Validate Major
    if (!formData.intendedMajor?.trim()) {
      errors.intendedMajor = 'Major is required';
    }

    // Validate Regions
    if (!formData.preferredRegions?.length) {
      errors.preferredRegions = 'Select at least one region';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fix the errors in the form before submitting.');
      return;
    }

    setSaving(true);

    try {
      if (!user?.id) throw new Error('User not authenticated');

      // Ensure all required fields are present
      const completeProfile: ExtendedUserProfile = {
        gpa: Number(formData.gpa),
        intendedMajor: formData.intendedMajor!,
        preferredRegions: formData.preferredRegions || [],
        tuitionPreference: formData.tuitionPreference || 'any',
        learningStyle: formData.learningStyle || 'hands-on',
        testScores: {
          SAT: formData.testScores?.SAT ? Number(formData.testScores.SAT) : undefined,
          ACT: formData.testScores?.ACT ? Number(formData.testScores.ACT) : undefined,
          IELTS: formData.testScores?.IELTS ? Number(formData.testScores.IELTS) : undefined,
          TOEFL: formData.testScores?.TOEFL ? Number(formData.testScores.TOEFL) : undefined
        },
        academicGoals: {
          careerPath: formData.academicGoals?.careerPath || [],
          studyEnvironment: formData.academicGoals?.studyEnvironment || 'any',
          internshipImportance: formData.academicGoals?.internshipImportance || 'medium',
          locationPreferences: {
            citySize: formData.academicGoals?.locationPreferences?.citySize || 'medium',
            campusType: formData.academicGoals?.locationPreferences?.campusType || 'urban'
          }
        },
        interests: formData.interests || [],
        strengths: formData.strengths || [],
        extracurriculars: formData.extracurriculars || [],
        awards: formData.awards || []
      };

      // Save to user profile service
      await userProfileService.saveProfile(user.id, completeProfile);
      
      // Call the onSubmit handler
      onSubmit(completeProfile);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(error instanceof Error ? error.message : 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (field: keyof ExtendedUserProfile, value: string) => {
    setFormData(prev => {
      const currentValues = Array.isArray(prev[field]) ? prev[field] as string[] : [];
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [field]: currentValues.filter(v => v !== value)
        };
      } else {
        return {
          ...prev,
          [field]: [...currentValues, value]
        };
      }
    });
  };

  const addExtracurricular = () => {
    setFormData(prev => ({
      ...prev,
      extracurriculars: [
        ...(prev.extracurriculars || []),
        { activity: '', role: '', duration: '', description: '' }
      ]
    }));
  };

  const updateExtracurricular = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const extracurriculars = [...(prev.extracurriculars || [])];
      extracurriculars[index] = { ...extracurriculars[index], [field]: value };
      return { ...prev, extracurriculars };
    });
  };

  const addAward = () => {
    setFormData(prev => ({
      ...prev,
      awards: [
        ...(prev.awards || []),
        { name: '', year: new Date().getFullYear(), level: '' }
      ]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow">
      {/* Profile Completeness Indicator */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-2">Profile Completeness</h3>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${
              completeness >= 70 ? 'bg-green-500' :
              completeness >= 40 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${completeness}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-1">{completeness.toFixed(0)}% complete</p>
      </div>

      {/* Basic Academic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            GPA (0.0 - 4.0)
            <input
              type="number"
              name="gpa"
              step="0.01"
              min="0"
              max="4"
              value={formData.gpa}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Intended Major
            <input
              type="text"
              name="intendedMajor"
              value={formData.intendedMajor}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </label>
        </div>
      </div>

      {/* Test Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            SAT Score
            <input
              type="number"
              name="satScore"
              min="400"
              max="1600"
              value={formData.testScores?.SAT || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                testScores: { ...prev.testScores, SAT: parseInt(e.target.value) }
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            ACT Score
            <input
              type="number"
              name="actScore"
              min="1"
              max="36"
              value={formData.testScores?.ACT || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                testScores: { ...prev.testScores, ACT: parseInt(e.target.value) }
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            IELTS Score
            <input
              type="number"
              name="ieltsScore"
              step="0.5"
              min="0"
              max="9"
              value={formData.testScores?.IELTS || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                testScores: { ...prev.testScores, IELTS: parseFloat(e.target.value) }
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            TOEFL Score
            <input
              type="number"
              name="toeflScore"
              min="0"
              max="120"
              value={formData.testScores?.TOEFL || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                testScores: { ...prev.testScores, TOEFL: parseInt(e.target.value) }
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </label>
        </div>
      </div>

      {/* Academic Goals */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Academic Goals</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Career Paths
              <div className="mt-2 space-y-2">
                {CAREER_PATHS.map(path => (
                  <label key={path} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.academicGoals?.careerPath?.includes(path)}
                      onChange={() => handleArrayChange('academicGoals.careerPath' as any, path)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">{path}</span>
                  </label>
                ))}
              </div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Study Environment
              <select
                name="studyEnvironment"
                value={formData.academicGoals?.studyEnvironment || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  academicGoals: { ...prev.academicGoals, studyEnvironment: e.target.value as any }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              >
                <option value="">Select Preference</option>
                {STUDY_ENVIRONMENTS.map(env => (
                  <option key={env.value} value={env.value}>{env.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              City Size Preference
              <select
                name="citySize"
                value={formData.academicGoals?.locationPreferences?.citySize || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  academicGoals: {
                    ...prev.academicGoals,
                    locationPreferences: {
                      ...prev.academicGoals?.locationPreferences,
                      citySize: e.target.value as any
                    }
                  }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              >
                <option value="">Select Preference</option>
                {CITY_SIZES.map(size => (
                  <option key={size.value} value={size.value}>{size.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Campus Type
              <select
                name="campusType"
                value={formData.academicGoals?.locationPreferences?.campusType || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  academicGoals: {
                    ...prev.academicGoals,
                    locationPreferences: {
                      ...prev.academicGoals?.locationPreferences,
                      campusType: e.target.value as any
                    }
                  }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              >
                <option value="">Select Preference</option>
                {CAMPUS_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Internship Importance
              <select
                name="internshipImportance"
                value={formData.academicGoals?.internshipImportance || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  academicGoals: { ...prev.academicGoals, internshipImportance: e.target.value as any }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              >
                <option value="">Select Importance</option>
                <option value="high">Very Important</option>
                <option value="medium">Somewhat Important</option>
                <option value="low">Not Important</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* Extracurriculars */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Extracurricular Activities</h3>
          <button
            type="button"
            onClick={addExtracurricular}
            className="text-primary hover:text-primary-dark"
          >
            + Add Activity
          </button>
        </div>

        {formData.extracurriculars?.map((activity, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Activity Name
                <input
                  type="text"
                  value={activity.activity}
                  onChange={(e) => updateExtracurricular(index, 'activity', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
                <input
                  type="text"
                  value={activity.role}
                  onChange={(e) => updateExtracurricular(index, 'role', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </label>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
                <textarea
                  value={activity.description}
                  onChange={(e) => updateExtracurricular(index, 'description', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  rows={2}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Analysis */}
      {completeness > 30 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="text-lg font-medium text-green-700 mb-2">Profile Strengths</h3>
            <ul className="list-disc list-inside space-y-1">
              {strengths.map((strength, index) => (
                <li key={index} className="text-sm text-gray-700">{strength}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-yellow-700 mb-2">Areas for Improvement</h3>
            <ul className="list-disc list-inside space-y-1">
              {improvements.map((improvement, index) => (
                <li key={index} className="text-sm text-gray-700">{improvement}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Add error messages */}
      {Object.keys(formErrors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h4 className="text-red-800 font-medium mb-2">Please fix the following errors:</h4>
          <ul className="list-disc list-inside text-red-600">
            {Object.entries(formErrors).map(([field, error]) => (
              <li key={field}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <button
          type="submit"
          disabled={saving}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            saving ? 'bg-gray-400' : 'bg-primary hover:bg-primary-dark'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
        >
          {saving ? 'Saving Profile...' : 'Save Profile & Find Universities'}
        </button>
      </div>
    </form>
  );
} 