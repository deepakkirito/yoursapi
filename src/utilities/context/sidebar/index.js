import { createContext, useState } from "react";
export const CreateSidebarContext = createContext();

export const SidebarContext = ({ children }) => {
  const [open, setOpen] = useState(true);

  return (
    <CreateSidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </CreateSidebarContext.Provider>
  );
};
