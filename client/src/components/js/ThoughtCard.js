import React, { useContext, useState, useEffect } from 'react';
import Comment from './Comment';
import axios from 'axios';
import { Link,useNavigate } from 'react-router-dom';
import '../css/ThoughtCard.css'
import { UserContext } from './context';
import { axiosWithToken } from '../../axiosWithToken';
function ThoughtCard({
  thoughtId,
  userProfile,
  username,
  profilePic,
  description,
  postImage,
  comments = [],
  likes,
  onClick,
  onDelete, // Added onDelete prop
}) {
  const [isVisibleOpinionBox, setIsVisibleOpinionBox] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentList, setCommentList] = useState([]);
  const [likesCount, setLikesCount] = useState(likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const { user, setUser } = useContext(UserContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await axiosWithToken.get(`http://localhost:4000/user-api/get-comments/${thoughtId}`);
        setCommentList(res.data.comments);
      } catch (err) {
        console.error('Error fetching comments:', err);
      }
    }
    fetchComments();
  }, [thoughtId]);

  useEffect(() => {
    if (user?.likedThoughtsId?.includes(thoughtId)) {
      setIsLiked(true);
    }
  }, [user, thoughtId]);

  async function handleLikeToggle() {
    try {
      if (isLiked) {
        await axiosWithToken.post(`http://localhost:4000/user-api/unlike-thought/${thoughtId}`, {
          username: user.username,
        });
        setLikesCount((prev) => prev - 1);
        setIsLiked(false);

        setUser((prevUser) => ({
          ...prevUser,
          likedThoughtsId: prevUser.likedThoughtsId.filter((id) => id !== thoughtId),
        }));
      } else {
        await axiosWithToken.post(`http://localhost:4000/user-api/like-thought/${thoughtId}`, {
          username: user.username,
        });
        setLikesCount((prev) => prev + 1);
        setIsLiked(true);

        setUser((prevUser) => ({
          ...prevUser,
          likedThoughtsId: [...prevUser.likedThoughtsId, thoughtId],
        }));
      }
    } catch (err) {
      console.error('Error updating like:', err);
    }
  }

  async function addComment() {
    if (newComment.trim()) {
      const newCommentObj = { username: user.username, comment: newComment };
      setCommentList((prev) => [...prev, newCommentObj]);

      try {
        await axiosWithToken.post(`http://localhost:4000/user-api/add-comment/${thoughtId}`, newCommentObj);
        setNewComment('');
      } catch (err) {
        console.error('Error adding comment:', err);
      }
    }
  }

  function toggleCommentBox() {
    setIsVisibleOpinionBox((prev) => !prev);
  }

  async function handleDelete() {
    try {
      const res = await axiosWithToken.delete(`http://localhost:4000/user-api/delete-thought/${thoughtId}`);
      console.log(res.data);
      onDelete(); // Call onDelete prop when the thought is deleted
    } catch (err) {
      console.error(err);
    }
  }

  function handleEdit() {
    navigate('/edit-thought', { state: { thoughtId: thoughtId } });
  }

  return (
    <div className="thought card shadow-sm" onClick={onClick}>
      {postImage && (
        <div className="thought-content">
          <img className="thought-thumbnail" src={postImage} alt="Post Thumbnail" />
        </div>
      )}
      <div className="thought-description">
        <p className="description-text">{description}</p>
      </div>
      <div className="thought-footer">
        <div className="user-info">
          <img className="profile-pic" src="profile_logo.png" alt="profile_logo.png" />
          <p className="user-name">{username}</p>
        </div>
        <div className="thought-interactions">
          <button
            className={`thought-interaction-btn like-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLikeToggle}
          >
            {isLiked ? '❤️' : '🤍'} {likesCount}
          </button>
          <button className="thought-interaction-btn comment-btn" onClick={toggleCommentBox}>
            💬 Opinions
          </button>
          {userProfile && (
            <div>
              <button className={`thought-interaction-btn like-btn`} onClick={handleEdit}>
                ✎ Edit
              </button>
              <button className="thought-interaction-btn like-btn delete-btn" onClick={handleDelete}>
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>
      {isVisibleOpinionBox && (
        <div className="comment-section-overlay">
          <div className="comment-section full-screen">
            <div className="thought-popup-header">
              <span>Opinions</span>
              <button onClick={toggleCommentBox}>✖</button>
            </div>
            <div className="thought-popup-body">
              <div className="thought-comment-input">
                <input
                  type="text"
                  placeholder="Add your opinion..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button className="add-comment-btn" onClick={addComment}>
                  Post
                </button>
              </div>
              <div className="thought-comment-list">
                {commentList.map((comment, index) => (
                  <Comment key={index} name={comment.username} content={comment.comment} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ThoughtCard;
