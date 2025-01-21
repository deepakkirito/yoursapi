import { sizeOptions } from "@/components/assets/constants/customData";
import AutocompleteSelect from "@/components/common/autoCompleteSelect";
import CustomSelect from "@/components/common/customSelect";
import { showNotification } from "@/components/common/notification";
import {
  getCustomDataApi,
  postCustomDataApi,
} from "@/utilities/api/customDataApi";
import { CreateAlertContext } from "@/utilities/context/alert";
import { ThemeContext } from "@/utilities/context/theme";
import { catchError } from "@/utilities/helpers/functions";
import { Editor } from "@monaco-editor/react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";

const CustomData = ({ schema, refetch = () => {} }) => {
  const [dataList, setDataList] = useState([]);
  const [selectedDataList, setSelectedDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedData, setSelectedData] = useState({ label: "", value: "" });
  const [selectedDataSize, setSelectedDataSize] = useState("10");
  const { theme } = useContext(ThemeContext);
  const { alert, setAlert } = useContext(CreateAlertContext);
  const searchparams = useSearchParams();
  const apiId = searchparams.get("id");
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    getDataList();
  }, []);

  useEffect(() => {
    selectedData.value &&
      getDataList(selectedData.value, Number(selectedDataSize));
  }, [selectedData, selectedDataSize]);

  const getDataList = async (id = "", size = 0) => {
    let query = "";
    if (id !== "" && size !== 0) {
      query = `id=${id}&size=${size}`;
    }
    setLoading(true);
    await getCustomDataApi(query)
      .then((response) => {
        if (id !== "" && size !== 0) {
          setSelectedDataList(response.data);
        } else {
          setDataList(response.data);
        }
      })
      .catch((error) => {
        catchError(error);
        window.location.href = "/projects";
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleUpdateData = async (option) => {
    const body = {
      data: selectedDataList,
      option: option,
    };
    setUpdateLoading(true);
    await postCustomDataApi(apiId, body)
      .then((res) => {
        refetch();
        showNotification({
          content: res.data.message,
        });
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setUpdateLoading(false);
      });
  };

  return (
    <Box className="flex flex-col gap-4 items-center">
      <div className="w-full flex gap-4 items-center">
        <AutocompleteSelect
          fullWidth
          size="small"
          options={dataList.map((item) => ({
            label: item.name,
            value: item._id,
          }))}
          label="Data list"
          placeholder="Enter to search"
          value={selectedData}
          onChange={(newValue) => {
            setSelectedData(newValue);
          }}
        />
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
      </div>
      {!loading ? (
        selectedDataList.length > 0 ? (
          <Box className="w-full">
            <Typography variant="h6">Data Preview</Typography>
            <Divider />
            <Box
              sx={{
                marginTop: "1rem",
                outline: "3px solid",
                outlineColor: "divider",
                borderRadius: "0.3rem",
                backgroundColor: "background.default",
                overflow: "hidden",
              }}
            >
              <Editor
                height="300px"
                width="100%"
                theme={`vs-${theme}`}
                defaultLanguage="javascript"
                disabled={true}
                defaultValue={JSON.stringify(selectedDataList, null, 4)
                  .replace(/"/g, "") // Escape double quotes
                  .replace(/\\n/g, "\n")}
                options={{
                  readOnly: true, // Disable typing
                }}
              />
            </Box>
            <Box className="flex gap-2 items-center justify-center py-4 gap-4">
              <Button
                variant="contained"
                size="small"
                disabled={updateLoading}
                endIcon={
                  updateLoading && (
                    <CircularProgress size={16} color="loading" />
                  )
                }
                onClick={() => {
                  setAlert({
                    open: true,
                    title: "Are you Sure?",
                    content: (
                      <Box className="flex flex-col gap-2">
                        <Typography>
                          - Custom data will be merged with the existing data.
                        </Typography>
                        {schema !== null && (
                          <Typography>
                            - This api have a schema set, this data may not get
                            saved if custom data doesn&apos;t matches the schema.
                          </Typography>
                        )}
                      </Box>
                    ),
                    handleClose: () => {
                      setAlert({ ...alert, open: false });
                    },
                    handleSuccess: () => {
                      handleUpdateData("merge");
                      setAlert({ ...alert, open: false });
                    },
                  });
                }}
              >
                Merge
              </Button>
              <Button
                variant="contained"
                size="small"
                disabled={updateLoading}
                endIcon={
                  updateLoading && (
                    <CircularProgress size={16} color="loading" />
                  )
                }
                onClick={() => {
                  setAlert({
                    open: true,
                    title: "Are you Sure?",
                    content: (
                      <Box className="flex flex-col gap-2">
                        <Typography>
                          - Custom data will be replaced with the existing data.
                        </Typography>
                        {schema !== null && (
                          <Typography>
                            - This api have a schema set, this data may not get
                            saved if custom data doesn&apos;t matches the schema.
                          </Typography>
                        )}
                      </Box>
                    ),
                    handleClose: () => {
                      setAlert({ ...alert, open: false });
                    },
                    handleSuccess: () => {
                      handleUpdateData("replace");
                      setAlert({ ...alert, open: false });
                    },
                  });
                }}
              >
                Replace
              </Button>
            </Box>
          </Box>
        ) : (
          ""
        )
      ) : (
        <Box className="flex justify-center items-center h-full">
          <CircularProgress color="secondary" size={24} />
        </Box>
      )}
    </Box>
  );
};

export default CustomData;
