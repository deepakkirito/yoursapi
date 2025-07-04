import {
  Box,
  Button,
  CircularProgress,
  Divider,
  FormHelperText,
  IconButton,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  Cancel,
  Delete,
  DeleteForeverRounded,
  Edit,
  InfoOutlined,
  Save,
} from "@mui/icons-material";
import CustomInput from "@/components/common/customTextField";
import CustomSelect from "@/components/common/customSelect";
import { schemaOptions } from "@/components/assets/constants/schema";
import { Editor } from "@monaco-editor/react";
import { ThemeContext } from "@/utilities/context/theme";
import SchemaRoundedIcon from "@mui/icons-material/SchemaRounded";
import TooltipCustom from "@/components/common/tooltip";
import { catchError, scrollToTarget } from "@/utilities/helpers/functions";
import { showNotification } from "@/components/common/notification";
import { updateApiSchemaApi } from "@/utilities/api/apiApi";
import MultiValueTextField from "@/components/common/multiValueTextfield";
import { updateAuthApi } from "@/utilities/api/authApiApi";

const Schema = ({
  data,
  apiId,
  refetch = (loading) => {},
  auth = false,
  excludeKeyValues = [],
  shared = false,
  permission,
}) => {
  const [schemaEdit, setSchemaEdit] = useState(false);
  const [schemaKey, setSchemaKey] = useState("");
  const [schemaValue, setSchemaValue] = useState([{ key: "", value: "" }]);
  const [schemaLayout, setSchemaLayout] = useState({});
  const [loading, setLoading] = useState(false);
  const getPermission = shared ? permission !== "read" : true;

  const handleAddSchemaLayout = () => {
    let temp = {};
    schemaValue.forEach((value) => {
      temp[value.key] = value.value;
    });
    setSchemaLayout({
      ...schemaLayout,
      [schemaKey]: temp,
    });
    setSchemaValue([{ key: "", value: "" }]);
    setSchemaKey("");
    setSchemaEdit(false);
  };

  useEffect(() => {
    if (data) {
      setSchemaLayout(data);
    }
  }, [data]);

  const handleSaveSchema = async () => {
    const body = {
      schema: Object.keys(schemaLayout)?.length ? schemaLayout : null,
    };
    setLoading(true);
    const updateSchema = auth ? updateAuthApi : updateApiSchemaApi;
    await updateSchema(apiId, body)
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        refetch(false);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setSchemaEdit(false);
        setLoading(false);
      });
  };

  const addUpdateSchemaCheck = useMemo(() => {
    let check = false;
    schemaValue.forEach((value) => {
      if (value.key === "" || value.value === "") {
        check = true;
      }
    });
    return check;
  }, [schemaValue]);

  return (
    <Box>
      <Box className="flex justify-between items-center h-full">
        <div className="flex items-center gap-4">
          <Button
            variant="contained"
            color="primary"
            size="small"
            disabled={schemaKey === "" || addUpdateSchemaCheck}
            startIcon={<AddIcon />}
            onClick={handleAddSchemaLayout}
          >
            {schemaEdit ? "Update Schema" : "Add Key"}
          </Button>
        </div>

        <Button
          variant="contained"
          color="success"
          size="small"
          startIcon={<Save />}
          endIcon={loading && <CircularProgress size={20} color="loading" />}
          disabled={
            (data
              ? data === schemaLayout
              : Object.keys(schemaLayout)?.length === 0) ||
            loading ||
            !getPermission
          }
          onClick={handleSaveSchema}
        >
          Save Schema
        </Button>
      </Box>

      <AddSchema
        data={data}
        schemaKey={schemaKey}
        schemaValue={schemaValue}
        schemaLayout={schemaLayout}
        schemaEdit={schemaEdit}
        setSchemaEdit={setSchemaEdit}
        setSchemaLayout={setSchemaLayout}
        setSchemaValue={setSchemaValue}
        setSchemaKey={setSchemaKey}
        excludeKeys={Object.keys(excludeKeyValues)}
        excludeKeyValues={excludeKeyValues}
      />
    </Box>
  );
};

const AddSchema = ({
  data,
  schemaKey,
  schemaValue,
  setSchemaValue,
  setSchemaKey,
  schemaLayout,
  setSchemaLayout,
  schemaEdit,
  setSchemaEdit,
  excludeKeys,
  excludeKeyValues,
}) => {
  const { theme } = useContext(ThemeContext);
  const [codeValidator, setCodeValidator] = useState([]);
  const [editorRefresh, setEditorRefresh] = useState(false);

  const updatedSchemaOptions = useMemo(() => {
    const checkk = schemaValue.map((value) => value.key);
    return schemaOptions.map((option) => {
      if (checkk.includes(option.value)) {
        return {
          ...option,
          disabled: true,
        };
      }
      return option;
    });
  }, [schemaOptions, schemaValue]);

  useEffect(() => {
    setEditorRefresh(true);
    setTimeout(() => {
      setEditorRefresh(false);
    }, 10);
  }, [schemaLayout]);

  const getSchemaValueDetails = (index, key) => {
    const data = updatedSchemaOptions.find(
      (option) => option.value === (key || schemaValue[index].key)
    );
    return {
      input: data?.value || "",
      type: data?.type || "",
      description: data?.description || "",
      default: data?.default || "",
      options: data?.options || [],
    };
  };

  const handleDeleteSchema = (schema) => {
    const newSchemaLayout = { ...schemaLayout };
    delete newSchemaLayout[schema];
    setSchemaLayout(newSchemaLayout);
  };

  const handleEditSchema = (schema) => {
    setSchemaEdit(true);
    setSchemaKey(schema);
    scrollToTarget("schema");
    setSchemaValue(
      Object.keys(schemaLayout[schema]).map((key) => ({
        key,
        value: schemaLayout[schema][key],
      }))
    );
  };

  return (
    <Box className="py-4">
      <Box
        className="flex justify-between items-center flex-col gap-4"
        sx={{
          outline: "1px solid",
          outlineColor: "divider",
          borderRadius: "0.3rem",
          padding: "1rem",
          backgroundColor: "background.default",
        }}
      >
        <CustomInput
          label="Key"
          size="small"
          value={schemaKey}
          disabled={excludeKeys.includes(schemaKey)}
          onChange={(event) => setSchemaKey(event.target.value)}
        />
        <Box className="w-[100%] flex justify-between items-center gap-4 flex-col">
          {schemaValue.map((value, index) => {
            const {
              input,
              type,
              description,
              options,
              default: defaultValue,
            } = getSchemaValueDetails(index);
            return (
              <div
                key={index}
                className="flex justify-between items-left flex-col gap-2 w-[100%]"
              >
                <Box
                  className={`flex justify-between items-${input === "enum" ? "start" : "center"} gap-4 w-[100%]`}
                >
                  <CustomSelect
                    fullWidth
                    labelTop="Value"
                    none={false}
                    options={updatedSchemaOptions}
                    value={value.key}
                    disabled={excludeKeyValues[schemaKey]?.includes(value.key)}
                    onChange={(event) => {
                      const { default: defaultValue } = getSchemaValueDetails(
                        index,
                        event.target.value
                      );
                      setSchemaValue([
                        ...schemaValue.map((item, i) =>
                          i === index
                            ? {
                                key: event.target.value,
                                value: defaultValue,
                              }
                            : item
                        ),
                      ]);
                    }}
                  />
                  {(type === "text" || type === "number") &&
                    input !== "enum" && (
                      <CustomInput
                        fullWidth
                        type={type}
                        label="Value"
                        size="small"
                        value={value.value}
                        disabled={excludeKeyValues[schemaKey]?.includes(
                          value.key
                        )}
                        onChange={(event) =>
                          setSchemaValue([
                            ...schemaValue.map((item, i) =>
                              i === index
                                ? { ...item, value: event.target.value }
                                : item
                            ),
                          ])
                        }
                      />
                    )}
                  {input === "enum" && (
                    <MultiValueTextField
                      label="Value"
                      placeholder="Type and press Enter"
                      disabled={excludeKeyValues[schemaKey]?.includes(
                        value.key
                      )}
                      onChange={(values) =>
                        setSchemaValue([
                          ...schemaValue.map((item, i) =>
                            i === index ? { ...item, value: values } : item
                          ),
                        ])
                      }
                      values={value.value || defaultValue}
                      setValues={setSchemaValue}
                    />
                  )}
                  {type === "select" && (
                    <CustomSelect
                      labelTop="Value"
                      size="small"
                      none={false}
                      options={options}
                      disabled={excludeKeyValues[schemaKey]?.includes(
                        value.key
                      )}
                      value={value.value || defaultValue}
                      onChange={(event) =>
                        setSchemaValue([
                          ...schemaValue.map((item, i) =>
                            i === index
                              ? { ...item, value: event.target.value }
                              : item
                          ),
                        ])
                      }
                    />
                  )}
                  <div className="flex gap-2">
                    {index === schemaValue.length - 1 && (
                      <IconButton
                        disabled={
                          schemaValue[index].key === "" ||
                          schemaKey === "" ||
                          schemaValue[index].value === ""
                        }
                        onClick={() => {
                          setSchemaValue([
                            ...schemaValue,
                            { key: "", value: "" },
                          ]);
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    )}
                    {!excludeKeyValues[schemaKey]?.includes(value.key) &&
                      schemaValue.length !== 1 && (
                        <IconButton
                          onClick={() => {
                            setSchemaValue([
                              ...schemaValue.filter((_, i) => i !== index),
                            ]);
                          }}
                        >
                          <Delete color="error" />
                        </IconButton>
                      )}
                  </div>
                </Box>
                {schemaValue[index].key && (
                  <div className="flex flex-col gap-1 w-[100%]">
                    <Typography variant="h7">
                      <b>Description: </b>
                      {description}
                    </Typography>
                    <Typography variant="h7">
                      <b>Default Value: </b>
                      {defaultValue ? defaultValue : "None"}
                    </Typography>
                  </div>
                )}
                {index !== schemaValue.length - 1 && <Divider />}
              </div>
            );
          })}
        </Box>
      </Box>
      <br />
      <Box className="w-[100%]">
        <Box className="flex items-center gap-2 mb-2">
          <SchemaRoundedIcon />
          <Typography variant="h6"> Schema Preview</Typography>
        </Box>
        <Box className="w-[100%">
          {!Boolean(Object.keys(schemaLayout)?.length) && (
            <>
              <Divider />
              <br />
              <Typography variant="h7" className="flex justify-center">
                No Schema Found
              </Typography>
            </>
          )}
          {Object.keys(schemaLayout)?.map((schema, index) => {
            return (
              <div key={index}>
                <Divider />
                <br />
                <Box
                  key={index}
                  className="flex justify-between items-center flex-col gap-4"
                  sx={{
                    outline: "1px solid",
                    outlineColor: "divider",
                    borderRadius: "0.3rem",
                    padding: "1rem",
                    backgroundColor: "background.default",
                  }}
                >
                  <Box className="flex items-center gap-4 w-[100%]">
                    <Typography
                      variant="h7"
                      sx={{
                        fontWeight: "bold",
                        color: "text.primary",
                        backgroundColor: "background.defaultSolid",
                        padding: "0.4rem 0.8rem",
                        borderRadius: "2rem",
                      }}
                    >
                      {index + 1}
                    </Typography>
                    <CustomInput
                      fullWidth={true}
                      label="Key"
                      size="small"
                      value={schema}
                      inputProps={{
                        readOnly: true,
                      }}
                      // onChange={(event) => setSchemaLayout({ ...schemaLayout })}
                    />
                    <Box className="flex gap-2 items-center">
                      <TooltipCustom title="Edit" placement="top">
                        <IconButton onClick={() => handleEditSchema(schema)}>
                          <Edit />
                        </IconButton>
                      </TooltipCustom>
                      {!excludeKeys.includes(schema) && (
                        <TooltipCustom title="Delete" placement="top">
                          <IconButton
                            onClick={() => handleDeleteSchema(schema)}
                          >
                            <Delete color="error" />
                          </IconButton>
                        </TooltipCustom>
                      )}
                    </Box>
                  </Box>
                  <Box className="w-[100%] flex justify-between items-center gap-4 flex-col">
                    {Object.keys(schemaLayout[schema]).map((key, index) => {
                      return (
                        <Box
                          key={index}
                          className="flex justify-between items-center gap-4 w-[100%]"
                        >
                          <CustomSelect
                            readOnly
                            labelTop="Type"
                            size="small"
                            none={false}
                            value={key}
                            options={schemaOptions}
                          />
                          <CustomInput
                            readOnly
                            label="Value"
                            size="small"
                            value={schemaLayout[schema][key]}
                            inputProps={{
                              readOnly: true,
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
                <br />
                <Divider />
              </div>
            );
          })}
          {!editorRefresh && Object.keys(schemaLayout)?.length !== 0 && (
            <Box
              className="w-[100%] flex justify-between gap-2 flex-col overflow-hidden"
              sx={{
                outline: "3px solid",
                outlineColor: "divider",
                borderRadius: "0.3rem",
                backgroundColor: "background.default",
              }}
            >
              <Editor
                height="300px"
                width="100%"
                theme={`vs-${theme}`}
                defaultLanguage="javascript"
                disabled={true}
                defaultValue={JSON.stringify(schemaLayout, null, 4)
                  .replace(/"/g, "") // Escape double quotes
                  .replace(/\\n/g, "\n")}
                onValidate={(value) => setCodeValidator(value)}
                options={{
                  readOnly: true,
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Schema;
