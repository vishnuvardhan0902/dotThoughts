import React, { useEffect, useState } from 'react';
import ThoughtCard from './ThoughtCard';
import '../css/ThoughtCard.css';

function HomePage() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [thoughts, setThoughts] = useState([]);
  const [deletedThoughts, setDeletedThoughts] = useState(new Set());

  useEffect(() => {
    const fetchThoughts = async () => {
      try {
        const response = await fetch('https://dotthoughts-backend.onrender.com/user-api/thoughts');
        const data = await response.json();

        const mappedThoughts = data['thoughts'].map((outerItem) => ({
          thoughtId: outerItem.thoughtId,
          username: outerItem.username,
          profilePic: outerItem.profilePic || '',
          description: outerItem.description,
          postImage: outerItem.postImage,
          comments: outerItem.comments,
          likes: outerItem.likes,
        }));
        setThoughts(mappedThoughts);
      } catch (error) {
        console.error('Error fetching thoughts:', error);
      }
    };

    fetchThoughts();
  }, []);

  const handleDeleteThought = (thoughtId) => {
    // Add thought ID to deletedThoughts set
    setDeletedThoughts((prev) => new Set(prev.add(thoughtId)));
  };

  return (
    <div className="home-page">
      <h2 className="text-center my-3">Thoughts Feed</h2>
      <div className="content-home-feed d-flex flex-wrap justify-content-center">
        {thoughts
          .filter((thought) => !deletedThoughts.has(thought.thoughtId)) // Filter out deleted thoughts
          .map((thought) => (
            <ThoughtCard
              key={thought.thoughtId}
              userProfile={false}
              thoughtId={thought.thoughtId}
              username={thought.username}
              profilePic={thought.profilePic}
              description={thought.description}
              postImage={thought.postImage}
              comments={thought.comments}
              likes={thought.likes}
              onDelete={() => handleDeleteThought(thought.thoughtId)} // Pass delete handler
            />
          ))}
      </div>
    </div>
  );
}

export default HomePage;
