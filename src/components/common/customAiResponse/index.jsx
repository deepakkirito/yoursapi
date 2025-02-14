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

const aiImage =
  "https://cdn.glitch.global/1451944e-7aa5-4b35-8561-bbbd6e79fae9/happy-hacker.gif?v=1682951858146";

const CustomAiResponse = ({ messages, loading, data, handleRetry }) => {
  const [profile] = useLocalStorage("profile");
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <Box className="flex flex-col gap-4 items-center py-4 w-full">
      {messages?.map((message, index) => (
        <MessageBubble
          key={index}
          message={message}
          profile={profile}
          data={data}
          handleRetry={handleRetry}
        />
      ))}
      {loading && <LoadingMessage />}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default CustomAiResponse;

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
          message={isValidJson(message.content)}
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

const RenderMessages = ({ message, handleRetry }) => {
  return (
    <Box
      className="p-2 w-full overflow-hidden user"
      sx={{ userSelect: "text" }}
    >
      {message.valid ? (
        Array.isArray(message.content) ? (
          message.content.map((item, index) => (
            <MessageContent key={index} item={item} />
          ))
        ) : (
          <MarkdownContent>{message.content}</MarkdownContent>
        )
      ) : (
        <ErrorMessage content={message.content} handleRetry={handleRetry} />
      )}
    </Box>
  );
};

const MessageContent = ({ item }) => {
  switch (item.type) {
    case "text":
      return <MarkdownContent>{item.content}</MarkdownContent>;
    case "objectArray":
    case "json":
    case "code":
    case "object":
    case "array":
      return <CodeBlock content={getDataToString(item.content)} />;
    case "html":
      return <HtmlPreview content={item.content} />;
    default:
      return null;
  }
};

const MarkdownContent = ({ children }) => (
  <Typography
    variant="body1"
    color="text.primary"
    sx={{ width: "100%", overflowWrap: "break-word" }}
  >
    <Markdown>{children}</Markdown>
  </Typography>
);

const CodeBlock = ({ content }) => (
  <Box className="relative w-full">
    <TooltipCustom title="Copy to clipboard">
      <ContentCopyRounded
        className="absolute top-2 right-2 cursor-pointer z-10"
        color="secondary"
        onClick={() => {
          navigator.clipboard.writeText(content);
          showNotification({ content: "Copied" });
        }}
      />
    </TooltipCustom>
    <SyntaxHighlighter
      language="javascript"
      style={materialDark}
      className="p-3 rounded-lg overflow-auto"
    >
      {content}
    </SyntaxHighlighter>
  </Box>
);

const HtmlPreview = ({ content }) => (
  <Box className="flex gap-2 items-center w-full">
    <Box className="flex gap-2 items-start flex-col w-full">
      <iframe
        title="HTML Preview"
        srcDoc={content}
        style={{
          minWidth: "30rem",
          maxWidth: "40rem",
          height: "30rem",
          borderRadius: "0.5rem",
          border: "none",
        }}
      />
    </Box>
    <TooltipCustom title="Copy HTML">
      <ContentCopyRounded
        className="cursor-pointer"
        onClick={() => {
          navigator.clipboard.writeText(content);
          showNotification({ content: "Copied" });
        }}
      />
    </TooltipCustom>
  </Box>
);

const ErrorMessage = ({ content, handleRetry }) => (
  <Box className="flex flex-col gap-2 items-start">
    <Typography color="error">{content}</Typography>
    <Button
      variant="contained"
      size="small"
      startIcon={<RefreshRounded />}
      onClick={handleRetry}
    >
      Retry
    </Button>
  </Box>
);
