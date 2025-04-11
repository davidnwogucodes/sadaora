import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Avatar, Space, Divider } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, DeleteOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/profile/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const profileData = {
        ...response.data,
        photoUrl: response.data.photoUrl || null,
        interests: response.data.interests?.join(', ') || ''
      };
      
      setProfile(profileData);
      form.setFieldsValue(profileData);
    } catch (error) {
      message.error('Error fetching profile');
    }
  };

  const handleSubmit = async (values) => {
    if (!isEditing) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const dataToSend = {
        ...values,
        photoUrl: values.photoUrl || null,
        interests: values.interests ? values.interests.split(',').map(i => i.trim()).filter(i => i.length > 0) : []
      };

      const response = await axios.put(
        'http://localhost:3000/api/profile/me',
        dataToSend,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const updatedProfile = {
        ...response.data,
        interests: response.data.interests?.join(', ') || ''
      };

      setProfile(updatedProfile);
      form.setFieldsValue(updatedProfile);
      setIsEditing(false);
      message.success('Profile updated successfully!');
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (e) => {
    e.preventDefault();
    setIsEditing(true);
  };

  const cancelEditing = () => {
    form.setFieldsValue(profile);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your profile?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete('http://localhost:3000/api/profile/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success('Profile deleted successfully');
        // Handle logout and redirect
      } catch (error) {
        message.error('Error deleting profile');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Text>Loading...</Text>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="text-center flex-grow">
            <Title level={2}>Profile Settings</Title>
            <Text type="secondary">Update your profile information and preferences</Text>
          </div>
          <Button 
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            className="absolute top-4 right-4"
          >
            Logout
          </Button>
        </div>

        <div className="flex justify-center mb-8">
          <Avatar
            size={100}
            src={profile.photoUrl}
            icon={!profile.photoUrl && <UserOutlined />}
            className="border-2 border-gray-200"
          />
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={profile}
        >
          <Form.Item
            name="photoUrl"
            label="Profile Photo URL"
          >
            <Input 
              placeholder="Enter photo URL" 
              disabled={!isEditing}
            />
          </Form.Item>

          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input 
              placeholder="Your name" 
              disabled={!isEditing}
            />
          </Form.Item>

          <Form.Item
            name="headline"
            label="Headline"
          >
            <Input 
              placeholder="Your professional headline" 
              disabled={!isEditing}
            />
          </Form.Item>

          <Form.Item
            name="bio"
            label="Bio"
          >
            <TextArea
              placeholder="Tell us about yourself"
              rows={4}
              disabled={!isEditing}
            />
          </Form.Item>

          <Form.Item
            name="interests"
            label="Interests"
            tooltip="Separate interests with commas"
          >
            <Input 
              placeholder="e.g. coding, reading, travel" 
              disabled={!isEditing}
            />
          </Form.Item>

          <Divider />

          <div className="flex justify-end space-x-4">
            {isEditing ? (
              <>
                <Button onClick={cancelEditing}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                >
                  Delete Profile
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={startEditing}
                >
                  Edit Profile
                </Button>
              </>
            )}
          </div>
        </Form>
      </Card>
    </div>
  );
} 