import { ThemeContext } from "@/utilities/context/theme";
import {
  catchError,
  getDataToString,
  isValidJson,
} from "@/utilities/helpers/functions";
import { useLocalStorage } from "@/utilities/helpers/hooks/useLocalStorage";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { ContentCopyRounded, RefreshRounded } from "@mui/icons-material";
import { showNotification } from "../notification";
import StreamingText from "../streamingText";
import TooltipCustom from "../tooltip";
import Markdown from "react-markdown";
import { useSearchParams } from "next/navigation";
import { CreateAlertContext } from "@/utilities/context/alert";
import useCustomWindow from "@/utilities/helpers/hooks/window";
import { postCustomDataApi } from "@/utilities/api/customDataApi";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { createRoot } from "react-dom/client";
import { Editor } from "@monaco-editor/react";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

const MarkdownRenderer = ({ content }) => (
  <Typography
    variant="body1"
    color="text.primary"
    sx={{ width: "100%", overflowWrap: "break-word" }}
  >
    <Markdown
      remarkPlugins={[remarkGfm]} // Supports GitHub-flavored markdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <SyntaxHighlighter
              style={dracula} // Black theme for dark mode
              language={match[1]}
              PreTag="div"
              showLineNumbers // Optional: Shows line numbers
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code
              className={className}
              style={{
                backgroundColor: "#1e1e1e", // Black background for inline code
                color: "#f8f8f2", // Dracula text color
                padding: "2px 5px",
                borderRadius: "5px",
              }}
              {...props}
            >
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </Markdown>
  </Typography>
);

const aiImage =
  "https://cdn.glitch.global/1451944e-7aa5-4b35-8561-bbbd6e79fae9/happy-hacker.gif?v=1682951858146";

const NewCustomAiResponse = ({
  messages,
  loading,
  data,
  handleRetry,
  latestMessage,
}) => {
  // const [profile] = useLocalStorage("profile");
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, latestMessage]);

  return (
    <Box className="flex flex-col gap-4 items-center py-4 w-full">
      {messages?.map((message, index) => (
        <MessageBubble
          key={index}
          message={message}
          // profile={profile}
          data={data}
          handleRetry={handleRetry}
        />
      ))}
      {latestMessage?.content && (
        <MessageBubble
          message={latestMessage}
          // profile={profile}
          data={data}
          handleRetry={handleRetry}
        />
      )}
      {loading && <LoadingMessage />}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default NewCustomAiResponse;

const MessageBubble = ({ message, profile, data, handleRetry }) => {
  return (
    <Box
      className="flex gap-2 items-start w-full"
      sx={{
        flexDirection: message.role === "user" ? "row-reverse" : "row",
      }}
    >
      <Avatar
        sx={{
          color: "text.primary",
          width: message.role === "user" ? "2.5rem" : "4rem",
          height: message.role === "user" ? "2.5rem" : "4rem",
        }}
        src={message.role === "user" ? profile : aiImage}
      />
      <Box
        sx={{
          borderRadius: "1rem",
          padding: "0.5rem",
          backgroundColor: "background.defaultSolid",
          border: "2px solid",
          borderColor: "divider",
          minWidth: "0%",
          maxWidth: "80%",
        }}
      >
        <RenderMessages
          message={message.content}
          handleRetry={() => handleRetry(message)}
        />
      </Box>
    </Box>
  );
};

const LoadingMessage = () => (
  <Box className="flex gap-2 items-start w-full">
    <Avatar sx={{ color: "text.primary", marginTop: "0.2rem" }} src={aiImage} />
    <Box
      className="flex flex-col gap-2 items-center justify-center"
      sx={{
        borderRadius: "1rem",
        padding: "0.5rem",
        backgroundColor: "background.defaultSolid",
        border: "2px solid",
        borderColor: "divider",
        minWidth: "0%",
        maxWidth: "80%",
      }}
    >
      <Avatar sx={{ width: "10rem", height: "10rem" }} src={aiImage} />
      <StreamingText text="Thinking..." speed={500} />
    </Box>
  </Box>
);

const RenderMessages = ({ message }) => {
  return (
    <Box className="px-2 w-full overflow-auto user" sx={{ userSelect: "text" }}>
      <MarkdownContent>{message}</MarkdownContent>
    </Box>
  );
};

const MarkdownContent = ({ children }) => (
  <Typography
    variant="body1"
    color="text.primary"
    sx={{ width: "100%", overflowWrap: "break-word" }}
  >
    <Markdown
      remarkPlugins={[remarkGfm]} // Supports GitHub-flavored markdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <SyntaxHighlighter
              style={dracula} // Black theme for dark mode
              language={match[1]}
              PreTag="div"
              showLineNumbers // Optional: Shows line numbers
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code
              className={className}
              style={{
                backgroundColor: "#1e1e1e", // Black background for inline code
                color: "#f8f8f2", // Dracula text color
                padding: "2px 5px",
                borderRadius: "5px",
              }}
              {...props}
            >
              {children}
            </code>
          );
        },
      }}
    >
      {children}
    </Markdown>
  </Typography>
);