import localFont from "next/font/local";
import "./globals.css";
import LayoutWrapper from "./layoutWrapper";
import "react-toastify/dist/ReactToastify.css";
import Logo from "./favicon.ico";

export const metadata = {
  title: "Youpi",
  description: "REST API generator for developers",
  keywords:
    "developer, api, api-platform, react, nextjs, mongodb, youpi, yours api",
  author: "Deepak Saini",
  favicon: "/favicon.ico",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
