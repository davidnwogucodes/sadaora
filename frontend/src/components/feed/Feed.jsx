import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Avatar, Button, Input, Space, Empty, Spin, message } from 'antd';
import { UserOutlined, HeartOutlined, HeartFilled, MessageOutlined, ShareAltOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;

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
      message.error('Failed to load profiles');
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
      
      setProfiles(profiles.map(profile => 
        profile.id === profileId 
          ? { ...profile, isFollowing: true }
          : profile
      ));
      message.success('Successfully followed user');
    } catch (error) {
      message.error('Failed to follow user');
    }
  };

  const handleUnfollow = async (profileId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/profile/${profileId}/follow`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProfiles(profiles.map(profile => 
        profile.id === profileId 
          ? { ...profile, isFollowing: false }
          : profile
      ));
      message.success('Successfully unfollowed user');
    } catch (error) {
      message.error('Failed to unfollow user');
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

  const handleSearch = (value) => {
    setInterests(value.trim());
  };

  if (loading && profiles.length === 0) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Profile Action Card */}
      <Card className="mb-6">
        <div className="relative flex items-start pt-6">
          <Space>
            <Avatar size="large" icon={<UserOutlined />} src={user?.photoUrl} />
            <div>
              <h3 className="text-lg font-medium">Welcome, {user?.name}</h3>
              <p className="text-gray-500 text-sm">Update your profile to help others discover you</p>
            </div>
          </Space>
          <Button
            type="primary"
            onClick={() => navigate('/profile')}
            size="small"
            className="absolute -top-1 right-0"
          >
            View Profile
          </Button>
        </div>
      </Card>

      {/* Search Section */}
      <Card className="mb-6">
        <Search
          placeholder="Search by interests (comma-separated)"
          allowClear
          enterButton="Search"
          size="large"
          onSearch={handleSearch}
          defaultValue={interests}
        />
      </Card>

      {/* Feed Content */}
      {profiles.length > 0 ? (
        <div className="space-y-4">
          {profiles.map((profile, index) => (
            <Card
              key={profile.id}
              ref={index === profiles.length - 1 ? lastProfileElementRef : null}
              className="feed-card"
              actions={[
                <Button 
                  type="text" 
                  icon={profile.isFollowing ? <HeartFilled className="text-red-500" /> : <HeartOutlined />}
                >
                  Like
                </Button>,
                <Button type="text" icon={<MessageOutlined />}>Comment</Button>,
                <Button type="text" icon={<ShareAltOutlined />}>Share</Button>
              ]}
            >
              <div className="relative">
                <div className="flex items-start">
                  <Space align="start">
                    <Avatar
                      size="large"
                      src={profile.photoUrl}
                      icon={!profile.photoUrl && <UserOutlined />}
                    />
                    <div>
                      <h4 className="font-medium m-0">{profile.name}</h4>
                      {profile.headline && (
                        <p className="text-gray-500 text-sm m-0">{profile.headline}</p>
                      )}
                      {profile.interests?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {profile.interests.map((interest, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Space>
                  <Button
                    type={profile.isFollowing ? "default" : "primary"}
                    onClick={() => profile.isFollowing ? handleUnfollow(profile.id) : handleFollow(profile.id)}
                    size="small"
                    className="absolute top-0 right-0"
                  >
                    {profile.isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {loading && (
            <div className="flex justify-center py-4">
              <Spin />
            </div>
          )}
        </div>
      ) : (
        <Empty
          description={
            <span>
              {interests ? 'No profiles found matching your search' : 'No profiles available'}
            </span>
          }
        />
      )}
    </div>
  );
} 