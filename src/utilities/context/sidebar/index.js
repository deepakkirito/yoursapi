import { createContext, useState } from "react";
export const CreateSidebarContext = createContext();

export const SidebarContext = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <CreateSidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {children}
    </CreateSidebarContext.Provider>
  );
};
