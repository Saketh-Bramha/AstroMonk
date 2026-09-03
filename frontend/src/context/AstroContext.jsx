import { createContext, useContext, useState, useEffect } from 'react';
// import { auth, provider, signInWithPopup, signOut } from '../firebase'; // Will use later

const AstroContext = createContext();

export function useAstro() {
  return useContext(AstroContext);
}

export function AstroProvider({ children }) {
  // Load initial state from localStorage if it exists
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('astro_user');
    return savedUser ? JSON.parse(savedUser) : null;
  }); 

  const [birthDetails, setBirthDetails] = useState(() => {
    const savedDetails = localStorage.getItem('astro_details');
    return savedDetails ? JSON.parse(savedDetails) : null;
  });
  
  // Dummy login for now until Firebase is setup
  const login = () => {
    const mockUser = { displayName: "Seeker", email: "seeker@cosmos.com" };
    setUser(mockUser);
    localStorage.setItem('astro_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    setBirthDetails(null);
    localStorage.removeItem('astro_user');
    localStorage.removeItem('astro_details');
  };

  const saveDetails = (details) => {
    setBirthDetails(details);
    localStorage.setItem('astro_details', JSON.stringify(details));
  };

  return (
    <AstroContext.Provider value={{ user, birthDetails, login, logout, saveDetails }}>
      {children}
    </AstroContext.Provider>
  );
}
