import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Feed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [interests, setInterests] = useState('');
  const observer = useRef();
  const lastProfileElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const fetchProfiles = async (pageNum = 1, interestsFilter = '', shouldAppend = false) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const endpoint = interestsFilter 
        ? `http://localhost:3000/api/feed/filter?page=${pageNum}&interests=${interestsFilter}`
        : `http://localhost:3000/api/feed?page=${pageNum}`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch follow status for each profile
      const profilesWithFollow = await Promise.all(
        response.data.profiles.map(async (profile) => {
          try {
            const followResponse = await axios.get(`http://localhost:3000/api/profile/${profile.id}/follow`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            return { ...profile, isFollowing: followResponse.data.isFollowing };
          } catch (error) {
            return { ...profile, isFollowing: false };
          }
        })
      );

      setProfiles(prev => shouldAppend ? [...prev, ...profilesWithFollow] : profilesWithFollow);
      setHasMore(response.data.pagination.currentPage < response.data.pagination.pages);
      setError('');
    } catch (error) {
      setError('Error fetching profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (profileId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:3000/api/profile/${profileId}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the profiles state to reflect the new follow status
      setProfiles(profiles.map(profile => 
        profile.id === profileId 
          ? { ...profile, isFollowing: true }
          : profile
      ));
    } catch (error) {
      setError('Error following user');
    }
  };

  const handleUnfollow = async (profileId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/profile/${profileId}/follow`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the profiles state to reflect the new follow status
      setProfiles(profiles.map(profile => 
        profile.id === profileId 
          ? { ...profile, isFollowing: false }
          : profile
      ));
    } catch (error) {
      setError('Error unfollowing user');
    }
  };

  useEffect(() => {
    setPage(1);
    setProfiles([]);
    fetchProfiles(1, interests, false);
  }, [interests]);

  useEffect(() => {
    if (page > 1) {
      fetchProfiles(page, interests, true);
    }
  }, [page]);

  const handleInterestsFilter = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page when filtering
    setInterests(e.target.interests.value.trim());
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="px-4 py-6 sm:py-8 max-w-full mx-auto sm:max-w-4xl">
      {/* Profile Action */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Welcome, {user?.name}</h2>
            <p className="text-sm text-gray-600">Update your profile to help others discover you</p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 font-medium text-sm"
          >
            View My Profile
          </button>
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Discover People</h1>
      
      {/* Filter Form */}
      <form onSubmit={handleInterestsFilter} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            name="interests"
            placeholder="Filter by interest"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            defaultValue={interests}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 sm:flex-none bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium"
            >
              Filter
            </button>
            {interests && (
              <button
                type="button"
                onClick={() => setInterests('')}
                className="flex-1 sm:flex-none bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 text-sm font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((profile, index) => (
          <div
            key={profile.id}
            ref={index === profiles.length - 1 ? lastProfileElementRef : null}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
                <div className="flex-shrink-0">
                  {profile.photoUrl ? (
                    <img
                      src={profile.photoUrl}
                      alt={profile.name}
                      className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                      <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{profile.name}</h3>
                  {profile.headline && (
                    <p className="text-sm text-gray-500">{profile.headline}</p>
                  )}
                  {profile.interests?.length > 0 && (
                    <p className="mt-1 text-sm text-gray-600">
                      {profile.interests.join(', ')}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 border-t border-gray-100 pt-4">
                <button
                  onClick={() => handleFollow(profile.id)}
                  className="w-full rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {profile.isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}
    </div>
  );
} 