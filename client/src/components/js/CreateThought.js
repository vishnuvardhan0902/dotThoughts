import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './context';
import axios from 'axios';
import '../css/CreateThought.css'; // Import the updated CSS

const IMG_CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dadytm6jv/image/upload';
const VIDEO_CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dadytm6jv/video/upload'

const UPLOAD_PRESET = 'cloud_dotThoughts';

function CreateThought() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');

  // Handle file upload to Cloudinary
  async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type and size (e.g., max 15 MB)
    const videoType = ['video/mp4'];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
    const maxFileSize = 15 * 1024 * 1024; // 15 MB
    
    if (!allowedTypes.includes(file.type)) {
      alert('Unsupported file type. Please upload an image or video.');
      return;
    }
    if (file.size > maxFileSize) {
      alert('File size exceeds 15 MB. Please choose a smaller file.');
      return;
    }

    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'cloud_dotThoughts');
    const CLOUDINARY_URL = videoType.includes(file.type)?VIDEO_CLOUDINARY_URL:IMG_CLOUDINARY_URL;
    setIsUploading(true);
    try {
      const res = await axios.post(CLOUDINARY_URL, data);
      setUploadedUrl(res.data.url);
      console.log('Uploaded URL:', res.data.url);
    } catch (err) {
      console.error('Error uploading file to Cloudinary:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }

  // Handle creating a new thought
  async function handleCreateThought(data) {
    if (!user) {
      alert('You need to be logged in to create a thought.');
      return;
    }

    const thoughtData = {
      thoughtId: String(Date.now()), // Unique ID based on current timestamp
      dateOfCreation: new Date(), // Current date and time
      dateOfModification: new Date(), // Same as creation at the start
      username: user.username, // Logged-in user's username
      description: data.description, // Thought description
      postImage: uploadedUrl || '', // Image URL or empty if not uploaded
      likes: 0, // Default value
      comments: [], // Default empty array
      status: true, // Default value
    };
    console.log(thoughtData)
    setIsSubmitting(true);
    try {
      const res = await axios.post('https://dotthoughts-backend.onrender.com/user-api/create-thought', thoughtData);
      console.log(res)
      alert('Thought created successfully!');
      navigate('/');
    } catch (err) {
      console.error('Error creating thought:', err);
      alert('Failed to create thought. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="create-thought-container">
      <h1>Create a New Thought</h1>
      <form onSubmit={handleSubmit(handleCreateThought)} className="create-thought-form">
        {/* Description Input */}
        <div className="form-group">
          <label htmlFor="description" className="thought-description">Description</label>
          <textarea
            id="description"
            placeholder="Share your thoughts..."
            {...register('description', { required: 'Description is required' })}
            className="description-text"
          />
          {errors.description && <span className="error-text">{errors.description.message}</span>}
        </div>

        {/* Image Upload */}
        <div className="form-group">
          <label htmlFor="image" className="thought-description">Upload an Image/Video (optional)</label>
          <input
            type="file"
            id="image"
            onChange={handleFileUpload}
            className="form-control"
            disabled={isUploading}
          />
          {isUploading && <p className="uploading-text">Uploading...</p>}
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn-primary" disabled={isSubmitting || isUploading}>
          {isSubmitting ? 'Posting...' : 'Post Thought'}
        </button>
      </form>
    </div>
  );
}

export default CreateThought;
