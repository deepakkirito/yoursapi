import { createContext, useState } from "react";
import CreateProject from "@/components/assets/svg/createProject.svg";
export const CreatePopupContext = createContext();

export const PopupContext = ({ children }) => {
  const [popup, setPopup] = useState({
    title: "",
    open: false,
    element: null,
    image: CreateProject,
  });

  return (
    <CreatePopupContext.Provider value={{ popup, setPopup }}>
      {children}
    </CreatePopupContext.Provider>
  );
};
