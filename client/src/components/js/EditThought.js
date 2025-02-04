import React, { useState, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { UserContext } from './context';
import axios from 'axios';
import '../css/CreateThought.css'; // Import the updated CSS

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dadytm6jv/image/upload';
const UPLOAD_PRESET = 'cloud_dotThoughts';

function EditThought() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [existingThought, setExistingThought] = useState(null);
  const [mediaHovered, setMediaHovered] = useState(false);
  const location = useLocation();
  const thoughtId = location.state.thoughtId;

  // Fetch the existing thought data
  useEffect(() => {
    async function fetchThought() {
      try {
        const res = await axios.get(`http://localhost:4000/user-api/get-thought/${thoughtId}`);
        setExistingThought(res.data);
        setValue('description', res.data.description);  // Set description to the form
        setUploadedUrl(res.data.postImage || '');  // Set uploaded URL if available
      } catch (err) {
        console.error('Error fetching thought:', err);
        alert('Failed to fetch thought data.');
      }
    }

    if (thoughtId) {
      fetchThought();
    }
  }, [thoughtId, setValue]);

  // Handle file upload to Cloudinary
  async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type and size (e.g., max 15 MB)
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
    data.append('upload_preset', UPLOAD_PRESET);

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

  // Handle editing the thought
  async function handleEditThought(data) {
    if (!user) {
      alert('You need to be logged in to edit a thought.');
      return;
    }

    const thoughtData = {
      thoughtId, // Use the existing thoughtId
      dateOfModification: new Date(), // Current date and time
      username: user.username, // Logged-in user's username
      description: data.description, // Thought description
      postImage: uploadedUrl || existingThought.postImage, // Use uploaded URL or existing one
      likes: existingThought.likes, // Keep the existing like count
      comments: existingThought.comments, // Keep the existing comments
      status: existingThought.status, // Keep the existing status
    };

    setIsSubmitting(true);
    try {
      const res = await axios.put('http://localhost:4000/user-api/edit-thought', thoughtData);
      console.log(res);
      alert('Thought updated successfully!');
      navigate('/');
    } catch (err) {
      console.error('Error editing thought:', err);
      alert('Failed to update thought. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="create-thought-container">
      <h1>Edit Your Thought</h1>
      {existingThought ? (
        <form onSubmit={handleSubmit(handleEditThought)} className="create-thought-form">
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
            
            {/* Media Display with Hover Effect */}
            <div 
              className="media-preview-container" 
              onMouseEnter={() => setMediaHovered(true)} 
              onMouseLeave={() => setMediaHovered(false)}
            >
              {uploadedUrl || existingThought.postImage ? (
                <div className="media-preview">
                  {uploadedUrl || existingThought.postImage.endsWith('mp4') ? (
                    <video src={uploadedUrl || existingThought.postImage} controls className="media" />
                  ) : (
                    <img src={uploadedUrl || existingThought.postImage} alt="Thought Media" className="media" />
                  )}
                  {mediaHovered && (
                    <div className="replace-media-overlay" onClick={() => document.getElementById('image').click()}>
                      <span>Replace Media</span>
                    </div>
                  )}
                </div>
              ) : (
                <p>No media available.</p>
              )}
            </div>

            {/* Hidden File Input for Selecting New Media */}
            <input
              type="file"
              id="image"
              onChange={handleFileUpload}
              className="form-control"
              disabled={isUploading}
              style={{ display: 'none' }}
            />
            {isUploading && <p className="uploading-text">Uploading...</p>}
            {uploadedUrl && <p>Uploaded Image/Video: <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">View</a></p>}
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-primary" disabled={isSubmitting || isUploading}>
            {isSubmitting ? 'Updating...' : 'Update Thought'}
          </button>
        </form>
      ) : (
        <p>Loading thought...</p>
      )}
    </div>
  );
}

export default EditThought;
