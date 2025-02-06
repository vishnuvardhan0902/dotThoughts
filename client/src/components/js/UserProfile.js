import React, { useEffect, useState,useContext } from 'react';
import ThoughtCard from './ThoughtCard';
import { UserContext } from './context';
function UserProfile() {
    const [thoughts, setThoughts] = useState([]);
    const { user, setUser } = useContext(UserContext);
    const [menuOpen, setMenuOpen] = useState(false);
    useEffect(() => {
    const fetchThoughts = async () => {
        try {
        const response = await fetch(`https://dotthoughts-backend.onrender.com/user-api/thoughts/${user.username}`);
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

  return (
    <div className="home-page">
      <div>
        <h2 className="text-center my-3">{user.username}</h2>
      </div>
      <div className="content-home-feed d-flex flex-wrap justify-content-center">
        {thoughts.map((thought) => (
          <ThoughtCard
            key={thought.thoughtId}
            userProfile = {true}
            thoughtId={thought.thoughtId}
            username={thought.username}
            profilePic={thought.profilePic}
            description={thought.description}
            postImage={thought.postImage}
            comments={thought.comments}
            likes={thought.likes}
          />
        ))}
      </div>
    </div>
  )
}

export default UserProfile