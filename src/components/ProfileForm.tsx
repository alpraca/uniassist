'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/clerk-react';

interface ProfileFormProps {
  onSubmit: (profileData: any) => void;
  initialData?: any;
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

export default function ProfileForm({ onSubmit, initialData }: ProfileFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    gpa: initialData?.gpa || '',
    intendedMajor: initialData?.intendedMajor || '',
    preferredRegions: initialData?.preferredRegions || [],
    tuitionPreference: initialData?.tuitionPreference || 'any',
    learningStyle: initialData?.learningStyle || '',
    satScore: initialData?.satScore || '',
    actScore: initialData?.actScore || '',
    ieltsScore: initialData?.ieltsScore || '',
    toeflScore: initialData?.toeflScore || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Clean and validate the data
      const cleanedData = {
        ...formData,
        gpa: parseFloat(formData.gpa.toString()) || 0,
        preferredRegions: formData.preferredRegions.length > 0 ? formData.preferredRegions : REGIONS,
        satScore: formData.satScore ? parseInt(formData.satScore.toString()) : undefined,
        ieltsScore: formData.ieltsScore ? parseFloat(formData.ieltsScore.toString()) : undefined
      };

      // Save to user metadata using API route
      if (user?.id) {
        const response = await fetch('/api/user/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            profile: cleanedData
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save profile');
        }
      }

      console.log('Profile saved:', cleanedData);
      
      // Call the onSubmit handler
      onSubmit(cleanedData);
      
      // Force a refresh of the page to update the recommendations
      router.refresh();
      
      // Scroll to recommendations section
      const recommendationsSection = document.getElementById('university-recommendations');
      if (recommendationsSection) {
        recommendationsSection.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegionChange = (region: string) => {
    setFormData(prev => {
      const currentRegions = Array.isArray(prev.preferredRegions) ? prev.preferredRegions : [];
      if (currentRegions.includes(region)) {
        return {
          ...prev,
          preferredRegions: currentRegions.filter(r => r !== region)
        };
      } else {
        return {
          ...prev,
          preferredRegions: [...currentRegions, region]
        };
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
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
          <p className="mt-1 text-xs text-gray-500">Enter your GPA on a 4.0 scale</p>
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
              placeholder="e.g., Computer Science, Engineering, Business"
            />
          </label>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Regions (Optional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {REGIONS.map(region => (
              <label key={region} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={Array.isArray(formData.preferredRegions) && formData.preferredRegions.includes(region)}
                  onChange={() => handleRegionChange(region)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-700">{region}</span>
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500">Leave empty to consider all regions</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tuition Preference
            <select
              name="tuitionPreference"
              value={formData.tuitionPreference}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="any">Any</option>
              <option value="free">Free</option>
              <option value="low-cost">Low Cost</option>
            </select>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Learning Style
            <select
              name="learningStyle"
              value={formData.learningStyle}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="">Not Specified</option>
              <option value="research-oriented">Research Oriented</option>
              <option value="hands-on">Hands-on</option>
            </select>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            SAT Score (Optional)
            <input
              type="number"
              name="satScore"
              min="400"
              max="1600"
              value={formData.satScore}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="e.g., 1200"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            IELTS Score (Optional)
            <input
              type="number"
              name="ieltsScore"
              step="0.5"
              min="0"
              max="9"
              value={formData.ieltsScore}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="e.g., 7.0"
            />
          </label>
        </div>
      </div>

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