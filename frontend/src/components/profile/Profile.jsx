import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    headline: '',
    photoUrl: '',
    interests: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/profile/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      setFormData(response.data);
    } catch (error) {
      setError('Error fetching profile');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInterestsChange = (e) => {
    // Split by comma, trim whitespace, and filter out empty strings
    const interests = e.target.value
      ? e.target.value.split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
      : [];
    setFormData(prev => ({
      ...prev,
      interests
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate required fields
    if (!formData.name?.trim()) {
      setError('Name is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Only include fields that have values
      const dataToSend = {
        name: formData.name.trim()
      };

      // Only add optional fields if they have values
      if (formData.bio?.trim()) dataToSend.bio = formData.bio.trim();
      if (formData.headline?.trim()) dataToSend.headline = formData.headline.trim();
      if (formData.photoUrl?.trim()) dataToSend.photoUrl = formData.photoUrl.trim();
      if (Array.isArray(formData.interests) && formData.interests.length > 0) {
        dataToSend.interests = formData.interests.filter(i => i.trim().length > 0);
      }

      console.log('Submitting profile update:', dataToSend); // Debug log
      
      const response = await axios.put(
        'http://localhost:3000/api/profile/me',
        dataToSend,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setProfile(response.data);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Profile update error:', error.response?.data || error); // More detailed error logging
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.errors?.[0]?.msg ||
                          error.message || 
                          'Error updating profile';
      setError(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your profile?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete('http://localhost:3000/api/profile/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Handle post-deletion (e.g., logout and redirect)
      } catch (error) {
        setError('Error deleting profile');
      }
    }
  };

  if (!profile) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-full sm:max-w-2xl bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="px-4 py-4 sm:px-8 sm:py-6 border-b border-gray-100">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Update your profile information and preferences.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mx-4 sm:mx-8 mt-4 p-3 sm:p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mx-4 sm:mx-8 mt-4 p-3 sm:p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-4 sm:space-y-6">
            {/* Profile Photo */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-100 mb-3 border-2 border-gray-200">
                {formData.photoUrl ? (
                  <img
                    src={formData.photoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </div>
              <input
                type="url"
                name="photoUrl"
                value={formData.photoUrl || ''}
                onChange={handleInputChange}
                className="w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                placeholder="Enter photo URL"
              />
            </div>

            {/* Form Fields */}
            <div className="space-y-4 sm:space-y-6">
              {/* Name Field */}
              <div className="space-y-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:items-start">
                <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              {/* Headline Field */}
              <div className="space-y-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:items-start">
                <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Headline
                </label>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    name="headline"
                    value={formData.headline || ''}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              {/* Bio Field */}
              <div className="space-y-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:items-start">
                <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Bio
                </label>
                <div className="sm:col-span-2">
                  <textarea
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              {/* Interests Field */}
              <div className="space-y-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:items-start">
                <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Interests
                </label>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={formData.interests?.join(', ') || ''}
                    onChange={handleInterestsChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    placeholder="e.g. coding, reading, travel"
                  />
                  {formData.interests?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-4 sm:pt-5 border-t border-gray-200">
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-full sm:w-auto rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-4 sm:p-8 space-y-6">
            {/* View Profile */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-5">
              {profile.photoUrl && (
                <div className="flex-shrink-0 mb-4 sm:mb-0">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-gray-200">
                    <img
                      src={profile.photoUrl}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                {profile.headline && (
                  <p className="text-sm text-gray-500">{profile.headline}</p>
                )}
              </div>
            </div>

            {profile.bio && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                <p className="mt-1 text-sm text-gray-900">{profile.bio}</p>
              </div>
            )}

            {profile.interests?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Interests</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {profile.interests.join(', ')}
                </p>
              </div>
            )}

            {/* Profile Actions */}
            <div className="pt-4 sm:pt-5 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full sm:w-auto rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full sm:w-auto rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Delete Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 