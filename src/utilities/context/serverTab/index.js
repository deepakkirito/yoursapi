import { createContext, useState } from "react";
export const CreateServerTabContext = createContext();

export const ServerTabContext = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <CreateServerTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </CreateServerTabContext.Provider>
  );
};
