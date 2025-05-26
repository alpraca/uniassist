import React, { useState } from 'react';
import { supabase, profileHelpers } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const PersonalInfoForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    birth_date: '',
    country: '',
    bio: '',
    languages: [],
    github: '',
    linkedin: '',
    website: '',
    profile_image_url: '',
    role: 'student'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLanguagesChange = (e) => {
    const languages = e.target.value.split(',').map(lang => lang.trim());
    setFormData(prev => ({
      ...prev,
      languages
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Update profiles table
      await profileHelpers.updateProfile(user.id, formData);

      // Create initial entry in users table with role
      await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          role: formData.role
        });

      // Navigate to next step
      navigate('/onboarding/academics');
    } catch (error) {
      console.error('Error saving personal info:', error);
      alert('Error saving your information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Role Selection */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            I am a...
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['student', 'mentor', 'teacher', 'company'].map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role }))}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.role === role
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-200'
                }`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Basic Information */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            name="full_name"
            required
            value={formData.full_name}
            onChange={handleInputChange}
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Birth Date *
          </label>
          <input
            type="date"
            name="birth_date"
            required
            value={formData.birth_date}
            onChange={handleInputChange}
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country *
          </label>
          <input
            type="text"
            name="country"
            required
            value={formData.country}
            onChange={handleInputChange}
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={4}
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Languages (comma-separated)
          </label>
          <input
            type="text"
            value={formData.languages.join(', ')}
            onChange={handleLanguagesChange}
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            placeholder="English, Spanish, Mandarin..."
          />
        </div>

        {/* Social Links */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GitHub Profile
          </label>
          <input
            type="url"
            name="github"
            value={formData.github}
            onChange={handleInputChange}
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            placeholder="https://github.com/username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            LinkedIn Profile
          </label>
          <input
            type="url"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleInputChange}
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            placeholder="https://linkedin.com/in/username"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Personal Website
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            placeholder="https://yourwebsite.com"
          />
        </div>

        {/* Profile Image URL */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Image URL
          </label>
          <input
            type="url"
            name="profile_image_url"
            value={formData.profile_image_url}
            onChange={handleInputChange}
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            placeholder="https://example.com/your-image.jpg"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Continue to Academics →'}
        </button>
      </div>
    </form>
  );
};

export default PersonalInfoForm; 