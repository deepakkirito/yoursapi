import { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Divider } from "@mui/material";
import CustomInput from "@/components/common/customTextField";
import CustomSelect from "@/components/common/customSelect";
import NewCustomAiResponse from "@/components/common/customAiResponse/new";
import { showNotification } from "@/components/common/notification";
import { postExampleAiApi } from "@/utilities/api/aiApi";
import { useLocalStorage } from "@/utilities/helpers/hooks/useLocalStorage";
import socket from "@/utilities/helpers/socket";
import { aiSizeOptions } from "@/components/assets/constants/customData";
import { catchError } from "@/utilities/helpers/functions";

const AI = ({ schema, id }) => {
  const [selectedDataSize, setSelectedDataSize] = useState("10");
  const [project, setProject] = useLocalStorage("project", "");
  const [messages, setMessages] = useLocalStorage(`datamessages_${project}`, []);
  const [loading, setLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [latestMessage, setLatestMessage] = useState({ role: "system", content: "" });
  const [sendMessage, setSendMessage] = useState("");

  // Effect to handle incoming AI message chunks
  useEffect(() => {
    const handleAiMessage = (chunk) => {
      setLatestMessage((prev) => ({
        content: prev.content + chunk.content,
        role: "system",
      }));
    };

    socket.on("ai-message", handleAiMessage);

    return () => {
      socket.off("ai-message", handleAiMessage);
    };
  }, []);

  // Effect to handle when the AI message is complete
  useEffect(() => {
    const handleAiMessageEnd = () => {
      // Add the completed AI message to the messages array
      setMessages((prevMessages) => [...prevMessages, latestMessage]);
      setLoading(false);
      setCurrentMessage("");
      setLatestMessage({ role: "system", content: "" });
    };

    socket.once("ai-message-end", handleAiMessageEnd);

    return () => {
      socket.off("ai-message-end", handleAiMessageEnd);
    };
  }, [latestMessage, setMessages]);

  // Handle the save example button click
  const handleSaveExample = async () => {
    try {
      const body = { data: messages };
      const res = await postExampleAiApi(body);
      showNotification({ content: res.data.message });
    } catch (err) {
      catchError(err);
    }
  };

  // Handle sending user message
  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      const newUserMessage = { role: "user", content: currentMessage };

      // Add the user message to messages first (use functional update to avoid stale state)
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, newUserMessage];

        // Emit the user message to AI immediately after updating the message array
        socket.emit("ai-message", { data: updatedMessages });

        return updatedMessages;
      });

      setSendMessage(currentMessage);
      setLoading(true);
    }
  };

  // Handle schema generation request
  const handleGenerateDataFromSchema = () => {
    if (schema) {
      const dataRequest = `Generate at least ${selectedDataSize} data according to this schema: ${JSON.stringify(schema, null, 4)}`;
      const newUserMessage = { role: "user", content: dataRequest };

      // Add the schema generation request to the messages array
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, newUserMessage];

        // Send the message to AI
        socket.emit("ai-message", { data: updatedMessages });

        return updatedMessages;
      });

      setSendMessage(dataRequest);
      setLoading(true);
    } else {
      showNotification({ content: "No schema found", type: "error" });
    }
  };

  return (
    <>
      <Box
        className="flex flex-col gap-4 items-center"
        sx={{
          height: messages?.length > 0 ? "0 !important" : "18rem",
          opacity: messages?.length > 0 ? "0" : "1",
          position: "relative",
          zIndex: messages?.length > 0 ? "-1" : "1",
          transition: "all 1s, opacity 0.1s",
        }}
      >
        <Box className="flex items-center justify-center gap-4 flex-col w-full">
          <CustomInput
            label={"Enter your instructions"}
            size="small"
            multiline
            rows={4}
            formfullwidth
            onChange={(event) => setCurrentMessage(event.target.value)}
            value={currentMessage}
          />
          <Button variant="contained" onClick={handleSendMessage}>Send</Button>
        </Box>

        <Box className="w-[50%]">
          <Divider>or</Divider>
        </Box>

        <Box className="flex items-center justify-center gap-4">
          <Button variant="contained" onClick={handleGenerateDataFromSchema}>
            Generate Data from schema
          </Button>
          <CustomSelect
            size="small"
            fullWidth={false}
            options={aiSizeOptions}
            labelTop="Data size"
            value={selectedDataSize}
            none={false}
            handleChange={(event) => setSelectedDataSize(event.target.value)}
            style={{ width: "min-content !important" }}
          />
        </Box>
      </Box>

      <NewCustomAiResponse messages={messages} latestMessage={latestMessage} />

      {messages?.length > 0 && (
        <Box
          id="ai-input"
          className="flex items-end justify-center gap-2 flex-row w-full sticky bottom-2 p-2 rounded-lg"
          sx={{
            backgroundColor: "background.defaultSolid",
            border: "2px solid",
            borderColor: "divider",
          }}
        >
          <CustomInput
            label={"Enter your instructions"}
            size="small"
            formfullwidth
            onChange={(event) => setCurrentMessage(event.target.value)}
            minRows={1}
            maxRows={6}
            autoFocus
            value={currentMessage}
            multiline
            formSx={{
              "& .MuiInputBase-input": {
                padding: "0 !important",
              },
            }}
          />
          <Box className="flex gap-2 items-center justify-center mb-0.5">
            <Button
              variant="contained"
              disabled={!currentMessage || loading}
              endIcon={loading && <CircularProgress size={16} color="secondary" />}
              className="px-4"
              onClick={handleSendMessage}
            >
              Send
            </Button>
            <Button variant="contained" onClick={() => setMessages([])}>
              Reset
            </Button>
            <Button variant="contained" onClick={handleSaveExample}>
              Save
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
};

export default AI;
