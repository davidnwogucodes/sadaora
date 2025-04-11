import { useState, useEffect } from 'react';
import { Button, notification } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import axios from 'axios';

export default function PostCard({ post }) {
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    checkIfLiked();
  }, [post.author._id]);

  const checkIfLiked = async () => {
    try {
      const response = await axios.get(`/api/profile/${post.author._id}/like`);
      setIsLiked(response.data.isLiked);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLike = async () => {
    try {
      if (!isLiked) {
        await axios.post(`/api/profile/${post.author._id}/like`);
        notification.success({
          message: 'Success',
          description: 'User liked!',
          placement: 'top',
        });
      } else {
        await axios.delete(`/api/profile/${post.author._id}/like`);
        notification.info({
          message: 'Info',
          description: 'User unliked',
          placement: 'top',
        });
      }
      setIsLiked(!isLiked);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to update like status',
        placement: 'top',
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      <div className="flex items-center mb-4">
        <img 
          src={post.author.photoUrl || 'https://via.placeholder.com/40'} 
          alt={post.author.name}
          className="w-10 h-10 rounded-full mr-4"
        />
        <div>
          <h3 className="font-semibold">{post.author.name}</h3>
          <p className="text-gray-500 text-sm">{post.createdAt}</p>
        </div>
      </div>

      <p className="text-gray-800 mb-4">{post.content}</p>

      {post.imageUrl && (
        <img 
          src={post.imageUrl} 
          alt="Post content" 
          className="rounded-lg mb-4 w-full"
        />
      )}

      <div className="flex items-center space-x-6">
        <Button 
          type="text"
          onClick={handleLike}
          icon={isLiked ? <HeartFilled style={{ color: '#f5222d' }} /> : <HeartOutlined />}
          className="flex items-center"
        >
          Like
        </Button>

        <Button 
          type="text"
          className="flex items-center"
          icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>}
        >
          Comment
        </Button>

        <Button 
          type="text"
          className="flex items-center"
          icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>}
        >
          Share
        </Button>
      </div>
    </div>
  );
} 