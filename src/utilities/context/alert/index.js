import { createContext, useState } from "react";
export const CreateAlertContext = createContext();

export const AlertContext = ({ children }) => {
  const [alert, setAlert] = useState({
    open: false,
    title: "",
    content: "",
    handleClose: () => {},
    handleSuccess: () => {},
  });

  return (
    <CreateAlertContext.Provider value={{ alert, setAlert }}>
      {children}
    </CreateAlertContext.Provider>
  );
};
