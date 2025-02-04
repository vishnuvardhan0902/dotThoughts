import React from 'react';
import '../css/Comment.css';

function Comment({ name, username, content, avatarUrl,time }) {
    return (
        <div className="comment">
            <div className="user-info">
                <div className="avatar">
                    <img src="profile_logo.png" alt={`${name}'s avatar`} style={{ width: '100%', height: '100%' }} />
                </div>
                <span className="name">{name}</span>
            </div>
            <div className="content">
                <p>{content}</p>
            </div>
            
        </div>
    );
}

export default Comment;
