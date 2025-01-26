import { sizeOptions } from "@/components/assets/constants/customData";
import CustomAiResponse from "@/components/common/customAiResponse";
import CustomSelect from "@/components/common/customSelect";
import CustomInput from "@/components/common/customTextField";
import { showNotification } from "@/components/common/notification";
import { postDataAiApi, postExampleAiApi } from "@/utilities/api/aiApi";
import {
  catchError,
  getDataToString,
  scrollToTarget,
} from "@/utilities/helpers/functions";
import { useLocalStorage } from "@/utilities/helpers/hooks/useLocalStorage";
import { Box, Button, CircularProgress, Divider } from "@mui/material";
import { useState } from "react";

const AI = ({ schema, id }) => {
  const [selectedDataSize, setSelectedDataSize] = useState("10");
  const [project, setProject] = useLocalStorage("project", "");
  const [messages, setMessages] = useLocalStorage(
    `datamessages_${project}`,
    []
  );
  const [loading, setLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");

  const handleSubmitSchema = async () => {
    const convertedData = getDataToString([
      {
        type: "text",
        content: `Generate atleast ${selectedDataSize} data according to this schema: `,
      },
      {
        type: "object",
        content: schema,
      },
    ]);

    setMessages([
      ...messages,
      {
        role: "user",
        content: convertedData,
      },
    ]);
    setLoading(true);
    scrollToTarget(`loading`);
    await postMessage({
      custom: convertedData,
    });
  };

  const postMessage = async ({ custom = "" }) => {
    const body = {
      data: [...messages, { role: "user", content: custom || currentMessage }],
    };
    await postDataAiApi(body)
      .then((res) => {
        setCurrentMessage("");
        setMessages([
          ...messages,
          { role: "user", content: custom || currentMessage },
          { role: "system", content: res.data },
        ]);
      })
      .catch((err) => {
        console.log(err);
        catchError(err);
      })
      .finally(() => {
        setLoading(false);
        scrollToTarget(`message-${messages.length}`);
      });
  };

  const handleGeneratedData = async () => {
    setLoading(true);
    setMessages([
      ...messages,
      {
        role: "user",
        content: currentMessage,
      },
    ]);
    scrollToTarget(`loading`);
    await postMessage({
      custom: "",
    });
  };

  const handleSaveExample = async () => {
    const body = {
      data: messages,
    };
    await postExampleAiApi(body)
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
      })
      .catch((err) => {
        catchError(err);
      });
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
            multiline="true"
            rows={4}
            formfullwidth={true}
            onChange={(event) => {
              setCurrentMessage(event.target.value.toString());
            }}
            value={currentMessage}
          />
          <Button variant="contained" onClick={handleGeneratedData}>
            send
          </Button>
        </Box>
        <Box className="w-[50%]">
          <Divider>or</Divider>
        </Box>
        <Box className="flex items-center justify-center gap-4">
          <Button
            variant="contained"
            onClick={() => {
              schema
                ? handleSubmitSchema()
                : showNotification({
                    content: "No schema found",
                    type: "error",
                  });
            }}
          >
            Generate Data from schema
          </Button>
          <CustomSelect
            size="small"
            fullWidth={false}
            options={sizeOptions}
            labelTop="Data size"
            value={selectedDataSize}
            none={false}
            handleChange={(event) => {
              setSelectedDataSize(event.target.value);
            }}
            style={{ width: "min-content !important" }}
          />
        </Box>
      </Box>
      <CustomAiResponse messages={messages} loading={loading} />
      {messages?.length > 0 && (
        <Box
          id="ai-input"
          className="flex items-center justify-center gap-4 flex-row w-full sticky bottom-2 p-4 rounded-lg"
          sx={{
            backgroundColor: "background.defaultSolid",
            border: "2px solid",
            borderColor: "divider",
          }}
        >
          <CustomInput
            label={"Enter your instructions"}
            size="small"
            formfullwidth={true}
            paddingLeft="1rem"
            onChange={(event) => {
              setCurrentMessage(String(event.target.value));
            }}
            autoFocus={true}
            value={currentMessage}
            multiline={true}
            formSx={{
              "& .MuiInputBase-input": {
                padding: "0 !important",
              },
            }}
          />

          <Button
            variant="contained"
            disabled={currentMessage === "" || loading}
            endIcon={
              loading && <CircularProgress size={16} color="secondary" />
            }
            className="px-4"
            onClick={handleGeneratedData}
          >
            send
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setMessages([]);
            }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              handleSaveExample();
            }}
          >
            Save
          </Button>
        </Box>
      )}
    </>
  );
};

export default AI;
