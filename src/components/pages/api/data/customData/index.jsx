import { sizeOptions } from "@/components/assets/constants/customData";
import AutocompleteSelect from "@/components/common/autoCompleteSelect";
import CustomSelect from "@/components/common/customSelect";
import { getCustomDataApi } from "@/utilities/api/customDataApi";
import { ThemeContext } from "@/utilities/context/theme";
import { Editor } from "@monaco-editor/react";
import { Box, CircularProgress, Divider, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";

const CustomData = () => {
  const [dataList, setDataList] = useState([]);
  const [selectedDataList, setSelectedDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedData, setSelectedData] = useState({ label: "", value: "" });
  const [selectedDataSize, setSelectedDataSize] = useState("10");
  const { theme } = useContext(ThemeContext);

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
  return (
    <Box className="flex flex-col gap-4 items-center">
      {loading ? (
        <Box className="flex justify-center items-center h-full">
          <CircularProgress color="secondary" size={24} />
        </Box>
      ) : (
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
      )}
      {selectedDataList.length > 0 && !loading && (
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
        </Box>
      )}
    </Box>
  );
};

export default CustomData;
