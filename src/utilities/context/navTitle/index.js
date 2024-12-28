import { createContext, useState } from "react";
export const CreateNavTitleContext = createContext();

export const NavTitleContext = ({ children }) => {
  const [navTitle, setNavTitle] = useState("");

  return (
    <CreateNavTitleContext.Provider value={{ navTitle, setNavTitle }}>
      {children}
    </CreateNavTitleContext.Provider>
  );
};
