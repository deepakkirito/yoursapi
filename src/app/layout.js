import localFont from "next/font/local";
import "./globals.css";
import LayoutWrapper from "./layoutWrapper";
import 'react-toastify/dist/ReactToastify.css';
import Logo from "./favicon.ico";

export const metadata = {
  title: "Company",
  description: "A company providing services to developers",
  keywords: "company, developer, api, api-platform, react, nextjs, mongodb",
  author: "Deepak Saini",
  favicon: "/favicon.ico",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
