import { createContext, useState } from "react";
export const CreateProjectDataContext = createContext();

export const ProjectDataContext = ({ children }) => {
  const [environment, setEnvironment] = useState("production");
  const [projectData, setProjectData] = useState(null);

  return (
    <CreateProjectDataContext.Provider
      value={{ environment, setEnvironment, projectData, setProjectData }}
    >
      {children}
    </CreateProjectDataContext.Provider>
  );
};
