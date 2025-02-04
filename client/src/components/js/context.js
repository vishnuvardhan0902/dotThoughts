import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext(); // Export the context

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [JwtToken, setToken] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
  const thoughts = () => {
    axios.get("/thoughts").then((response) => {
      console.log(response);
    });
  };

  return (
    <UserContext.Provider value={{ user, setUser, thoughts, JwtToken }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
