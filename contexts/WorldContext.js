// ✅
import React, { createContext, useState, useEffect } from "react";
import { World } from "cannon-es";

const WorldContext = createContext();

const WorldContextProvider = ({ children }) => {
  const [world, setWorld] = useState(null);
  const [isWorldInitialized, setIsWorldInitialized] = useState(false);

  const initializeWorld = () => {
    if (isWorldInitialized) return;

    const newWorld = new World();
    newWorld.gravity.set(0, -9.82, 0);
    setWorld(newWorld);
    setIsWorldInitialized(true);
  };

  return (
    <WorldContext.Provider value={{ world, isWorldInitialized, initializeWorld }}>
      {children}
    </WorldContext.Provider>
  );
};

export default WorldContextProvider;
export { WorldContext };
