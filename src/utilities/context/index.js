import { useEffect, useState } from "react";
import { ThemeContext } from "./theme";
import { AuthContext } from "./auth";
import { PopupContext } from "./popup";
import { SidebarContext } from "./sidebar";
import { NavTitleContext } from "./navTitle";
import { AlertContext } from "./alert";
import { ServerTabContext } from "./serverTab";
import { ProjectDataContext } from "./projectData";

const Context = ({ children, getTheme }) => {
  const [theme, setTheme] = useState();
  const [login, setLogin] = useState(false);

  useEffect(() => {
    setTheme(
      localStorage.getItem("theme") !== "undefined" &&
        localStorage.getItem("theme") !== "null"
        ? localStorage.getItem("theme")
        : "dark"
    );
    setLogin(localStorage.getItem("login") === "true" ? true : false);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    getTheme(theme);
  }, [theme]);

  // useEffect(() => {
  //   login
  //     ? localStorage.setItem("login", login)
  //     : localStorage.removeItem("login");
  //   !login;
  // }, [login]);

  return (
    <AuthContext.Provider value={{ login, setLogin }}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <SidebarContext>
          <PopupContext>
            <AlertContext>
              <ServerTabContext>
                <ProjectDataContext>
                  <NavTitleContext>{children}</NavTitleContext>
                </ProjectDataContext>
              </ServerTabContext>
            </AlertContext>
          </PopupContext>
        </SidebarContext>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
};

export default Context;
