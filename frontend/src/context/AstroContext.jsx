import { createContext, useContext, useState, useEffect } from 'react';
// import { auth, provider, signInWithPopup, signOut } from '../firebase'; // Will use later

const AstroContext = createContext();

export function useAstro() {
  return useContext(AstroContext);
}

export function AstroProvider({ children }) {
  const [user, setUser] = useState(null); // Will hold Google User
  const [birthDetails, setBirthDetails] = useState(null);
  
  // Dummy login for now until Firebase is setup
  const login = () => {
    setUser({ displayName: "Seeker", email: "seeker@cosmos.com" });
  };

  const logout = () => {
    setUser(null);
    setBirthDetails(null);
  };

  const saveDetails = (details) => {
    setBirthDetails(details);
  };

  return (
    <AstroContext.Provider value={{ user, birthDetails, login, logout, saveDetails }}>
      {children}
    </AstroContext.Provider>
  );
}
