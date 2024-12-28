import CustomSelect from "@/components/common/customSelect";
import CustomToggle from "@/components/common/customToggle";
import { showNotification } from "@/components/common/notification";
import {
  getMigrateDataApi,
  postMigrateDataApi,
  saveDBStringApi,
} from "@/utilities/api/databaseApi";
import { catchError } from "@/utilities/helpers/functions";
import { CheckBox, ContentCopyOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid2,
  IconButton,
  Input,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import Image from "next/image";
import NotFound from "@/components/assets/svg/notFound.png";
import TooltipCustom from "@/components/common/tooltip";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import DataTransfer from "@/components/assets/json/dataTransfer.json";
import Lottie from "react-lottie";
import { encrypt } from "@/utilities/helpers/encryption";

const DatabaseDetails = ({
  dbString,
  saveInternal,
  saveExternal,
  apiDatabase,
  fetchData = () => {},
}) => {
  const [loading, setLoading] = useState(false);
  const [migrateSelect, setMigrateSelect] = useState("");
  const [migrateData, setMigrateData] = useState([]);
  const [migrateSelectLoading, setMigrateSelectLoading] = useState(false);
  const [selectProject, setSelectProject] = useState([]);
  const [selectApi, setSelectApi] = useState({});
  const [migrateOption, setMigrateOption] = useState("");
  const [showTransfer, setShowTransfer] = useState(false);

  useEffect(() => {
    migrateSelect && handleMigrate();
  }, [migrateSelect]);

  useEffect(() => {
    scrollToMigrate();
  }, [selectProject]);

  useEffect(() => {
    scrollToMigrate("migrateButton");
  }, [migrateOption]);

  const scrollToMigrate = (id = "migrate") => {
    setTimeout(() => {
      const migrateClick = document.getElementById(id);
      if (migrateClick) {
        migrateClick.scrollIntoView({ behavior: "smooth" });
      }
    }, 500);
  };

  const handleMigrate = async () => {
    setMigrateSelectLoading(true);
    await getMigrateDataApi(migrateSelect)
      .then((res) => {
        setMigrateData(res.data);
      })
      .catch((err) => {
        catchError(err);
        setMigrateSelect("");
      })
      .finally(() => {
        setMigrateSelectLoading(false);
        scrollToMigrate();
        setMigrateOption("");
        setSelectProject([]);
      });
  };

  const handleMigrateStart = async () => {
    const body = {
      project: selectProject.map((data) => data.project),
      api: selectApi,
      migrate: migrateOption,
    };
    setShowTransfer(true);
    let timeoutId = setTimeout(() => {
      scrollToMigrate("showTransfer");
    }, 500);
    await postMigrateDataApi(migrateSelect, body)
      .then((res) => {
        showNotification({
          content: res.data.message,
          type: "success",
        });
        setMigrateSelect(
          migrateSelect === "external" ? "internal" : "external"
        );
        setSelectProject([]);
        setSelectApi({});
        setMigrateOption("");
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setShowTransfer(false);
        setTimeout(() => {
          scrollToMigrate();
        }, 500);
      });
  };

  const handleSave = async ({ internal, external, apiDatabaseSelect }) => {
    setLoading(true);
    await saveDBStringApi({
      dbString: encrypt(dbString),
      saveExternal: external,
      saveInternal: internal,
      fetchData: apiDatabaseSelect,
    })
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        fetchData(false);
      })
      .catch((err) => {
        catchError(err);
        fetchData(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const dbstringArray = dbString?.split(":");

  const handleSelectAll = () => {
    const select = {};
    scrollToMigrate();
    setSelectProject(
      migrateData.length === selectProject.length ? [] : migrateData
    );
    migrateData.forEach((item) => {
      select[item.name] = item.collections;
    });
    setSelectApi(migrateData.length === selectProject.length ? {} : select);
  };

  console.log({ selectProject, selectApi });

  return (
    <Box>
      {/* Database Details Section */}
      <Box className="flex flex-col gap-4">
        <Box className="flex gap-2 items-center">
          <Typography variant="h5">Connected Database Details</Typography>
          {loading && <CircularProgress color="secondary" size={24} />}
        </Box>
        {/* Section one */}
        <Box className="flex gap-2 items-center justify-start">
          <Typography variant="h7" className="text-break w-[8rem]">
            <b>MongoDB String</b>
          </Typography>
          <Box
            sx={{
              borderRadius: "0.5rem 1.5rem 1.5rem 0.5rem",
              border: "0.01rem solid",
              borderColor: "background.invert",
              backgroundColor: "background.default",
              padding: "0.2rem 0.2rem 0.2rem 0.5rem",
            }}
          >
            <Typography variant="h7" className="text-break">
              {dbstringArray[0]}:{dbstringArray[1]}:**your-password**@
              {dbstringArray[2]?.split("@")[1]}
            </Typography>
            <IconButton
              onClick={() => {
                navigator.clipboard.writeText(dbString);
                showNotification({
                  content: "Copied to clipboard",
                  type: "success",
                });
              }}
              sx={{
                background: "none",
                backgroundColor: "background.defaultSolid",
                marginLeft: "0.5rem",
              }}
            >
              <ContentCopyOutlined />
            </IconButton>
          </Box>
        </Box>
        <Grid2 container spacing={2}>
          {/* Section two */}
          <Grid2
            item
            size={{ xs: 12, md: 6 }}
            className="flex gap-3 flex-col"
            sx={{
              borderRadius: "0.5rem",
              backgroundColor: "background.default",
              padding: "1rem",
            }}
          >
            <Box>
              <FormLabel id="checkbox-buttons-group-label">
                Active database that stores your data
              </FormLabel>
            </Box>
            <Box className="flex gap-3 justify-around flex-wrap">
              <Box className="flex gap-2 items-center">
                <Typography variant="h7" className="w-[8rem]">
                  <b>Your Database</b>{" "}
                </Typography>
                <CustomToggle
                  options={[
                    { label: "Active", value: true },
                    { label: "Inactive", value: false },
                  ]}
                  value={saveExternal}
                  handleChange={(value) => {
                    Boolean(value) !== saveExternal &&
                      handleSave({
                        internal: saveInternal,
                        external: Boolean(value),
                      });
                  }}
                />
              </Box>
              <Box className="flex gap-2 items-center">
                <Typography variant="h7" className="w-[8rem]">
                  <b>Our Database</b>{" "}
                </Typography>
                <CustomToggle
                  options={[
                    { label: "Active", value: true },
                    { label: "Inactive", value: false },
                  ]}
                  value={saveInternal}
                  handleChange={(value) => {
                    Boolean(value) !== saveInternal &&
                      handleSave({
                        internal: Boolean(value),
                        external: saveExternal,
                      });
                  }}
                />
              </Box>
            </Box>
          </Grid2>
          {/* Section three */}
          <Grid2
            item
            size={{ xs: 12, md: 6 }}
            sx={{
              borderRadius: "0.5rem",
              backgroundColor: "background.default",
              padding: "1rem",
            }}
          >
            <FormControl>
              <FormLabel id="radio-buttons-group-label" className="mb-4">
                Select from which database your apis will fetch data
              </FormLabel>
              <RadioGroup
                row
                aria-labelledby="radio-buttons-group-label"
                name="radio-buttons-group"
                value={apiDatabase}
                onChange={(event) =>
                  handleSave({
                    apiDatabaseSelect: event.target.value,
                    internal: saveInternal,
                    external: saveExternal,
                  })
                }
              >
                <FormControlLabel
                  value="user"
                  control={
                    <Radio
                      disabled={!(saveExternal && saveInternal)}
                      sx={{
                        color: "checkbox",
                        "&.Mui-checked": {
                          color: "checkbox",
                        },
                      }}
                    />
                  }
                  label="Your Database"
                />
                <FormControlLabel
                  value="self"
                  control={
                    <Radio
                      disabled={!(saveExternal && saveInternal)}
                      sx={{
                        color: "checkbox",
                        "&.Mui-checked": {
                          color: "checkbox",
                        },
                      }}
                    />
                  }
                  label="Our Database"
                />
              </RadioGroup>
            </FormControl>
          </Grid2>
        </Grid2>
      </Box>
      <br />
      <Divider />
      <br />
      {/* Migrate Section */}
      <Box id="migrate" className="flex flex-col">
        <Box className="flex gap-2 items-center mb-2">
          <Typography variant="h5">Migrate your data</Typography>
          {migrateSelectLoading && (
            <CircularProgress color="secondary" size={24} />
          )}
        </Box>
        {/* Migrate Selection */}
        <Box
          className="float-left w-[100%] mb-3"
          sx={{
            position: "sticky",
            top: "0rem",
            backgroundColor: "background.defaultSolid",
            borderRadius: "0.5rem",
            zIndex: "5",
            // marginLeft: "-0.5rem",
          }}
        >
          <CustomSelect
            none={false}
            options={[
              {
                label: "From our Database to your Database",
                value: "external",
              },
              {
                label: "From your Database to our Database",
                value: "internal",
              },
            ]}
            value={migrateSelect}
            labelTop="Select an option to proceed"
            handleChange={(event) => {
              setMigrateSelect(event.target.value);
            }}
            // style={{ border: "1px solid", borderColor: "border.default" }}
          />
        </Box>
        {/* Migrate Data */}
        <Box>
          {migrateData?.length ? (
            <Box width={"100%"}>
              <Divider />
              <br />
              <Box className="mb-4 flex justify-between items-center">
                <FormLabel id="radio-buttons-group-label">
                  Select projects you want to migrate - {selectProject.length}{" "}
                  selected{" "}
                  {selectProject.length
                    ? "(choose migrate option at the bottom)"
                    : ""}
                </FormLabel>
                <Button
                  variant="contained"
                  onClick={handleSelectAll}
                  size="small"
                >
                  {migrateData.length === selectProject.length
                    ? "Deselect all"
                    : "Select all"}
                </Button>
              </Box>
              <Grid2 container spacing={2}>
                {migrateData.map((item, index) => {
                  return (
                    <Grid2
                      item
                      key={index}
                      size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                    >
                      <FormGroup
                        sx={{
                          padding: "0.5rem",
                          borderRadius: "0.5rem",
                          backgroundColor: "background.default",
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              sx={{
                                color: "checkbox",
                                "&.Mui-checked": {
                                  color: "checkbox",
                                },
                              }}
                              icon={<FolderOpenIcon />}
                              checkedIcon={<FolderRoundedIcon />}
                              checked={
                                selectProject.filter(
                                  (project) => project.name === item.name
                                ).length
                                  ? true
                                  : false
                              }
                              onChange={(event) => {
                                if (event.target.checked) {
                                  setSelectProject([
                                    ...selectProject,
                                    {
                                      name: item.name,
                                      size: item.sizeOnDisk,
                                      empty: item.empty,
                                    },
                                  ]);
                                  setSelectApi({
                                    ...selectApi,
                                    [item.name]: item.collections,
                                  });
                                } else {
                                  setSelectProject(
                                    selectProject.filter(
                                      (project) => project.name !== item.name
                                    )
                                  );
                                  setSelectApi({
                                    ...selectApi,
                                    [item.name]: [],
                                  });
                                }
                              }}
                            />
                          }
                          label={
                            <Box className="flex flex-col gap-0 h-full">
                              <Typography variant="h5">{item.name}</Typography>
                              <Box className="ml-0 flex flex-col gap-0">
                                <Typography variant="h7">
                                  Size:{" "}
                                  {(item.sizeOnDisk / 1024 / 1024).toFixed(2)}{" "}
                                  MB
                                </Typography>
                                {/* <Typography variant="h7">
                                Empty: {String(item.empty)}
                              </Typography> */}
                                <TooltipCustom
                                  title={
                                    item.collections?.length ? (
                                      <Box className="flex flex-col">
                                        {item.collections?.map(
                                          (data, index) => {
                                            return (
                                              <FormControlLabel
                                                key={index}
                                                control={
                                                  <Checkbox
                                                    sx={{
                                                      color: "checkbox",
                                                      "&.Mui-checked": {
                                                        color: "checkbox",
                                                      },
                                                    }}
                                                    disabled={
                                                      selectProject.filter(
                                                        (fltr) =>
                                                          fltr?.name ===
                                                          item.name
                                                      ).length === 0
                                                    }
                                                    icon={
                                                      <DescriptionOutlinedIcon />
                                                    }
                                                    checkedIcon={
                                                      <DescriptionRoundedIcon />
                                                    }
                                                    checked={selectApi[
                                                      item.name
                                                    ]?.includes(data)}
                                                    onChange={(event) => {
                                                      if (
                                                        event.target.checked
                                                      ) {
                                                        setSelectApi({
                                                          ...selectApi,
                                                          [item.name]: [
                                                            ...selectApi[
                                                              item.name
                                                            ],
                                                            data,
                                                          ],
                                                        });
                                                      } else {
                                                        setSelectApi({
                                                          ...selectApi,
                                                          [item.name]:
                                                            selectApi[
                                                              item.name
                                                            ].filter(
                                                              (filtr) =>
                                                                filtr !== data
                                                            ),
                                                        });
                                                      }
                                                    }}
                                                  />
                                                }
                                                label={data}
                                              />
                                            );
                                          }
                                        )}
                                      </Box>
                                    ) : (
                                      "No apis"
                                    )
                                  }
                                  placement="top"
                                >
                                  <Typography variant="h7">
                                    Apis: {item.collections?.length}
                                  </Typography>
                                </TooltipCustom>
                              </Box>
                            </Box>
                          }
                        />
                      </FormGroup>
                    </Grid2>
                  );
                })}
              </Grid2>
            </Box>
          ) : (
            <Box className="text-center">
              {migrateSelect && !migrateSelectLoading ? (
                <>
                  <Image
                    src={NotFound}
                    alt="no project"
                    width={0}
                    height={0}
                    style={{
                      width: "40%",
                      height: "auto",
                    }}
                  />
                  <Typography className="notFound">
                    No Projects found
                  </Typography>
                </>
              ) : (
                ""
              )}
            </Box>
          )}
          <br />
          {selectProject.length ? (
            <Box className="ml-4">
              <Box className="mb-2">
                <FormControl>
                  <FormLabel id="radio-buttons-group-label">
                    Choose an Option
                  </FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="radio-buttons-group-label"
                    name="radio-buttons-group"
                    value={migrateOption}
                    onChange={(event) => setMigrateOption(event.target.value)}
                  >
                    <FormControlLabel
                      value="replace"
                      control={
                        <Radio
                          sx={{
                            color: "checkbox",
                            "&.Mui-checked": {
                              color: "checkbox",
                            },
                          }}
                        />
                      }
                      label="Replace"
                    />
                    <FormControlLabel
                      value="merge"
                      control={
                        <Radio
                          sx={{
                            color: "checkbox",
                            "&.Mui-checked": {
                              color: "checkbox",
                            },
                          }}
                        />
                      }
                      label="Merge"
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
              {!showTransfer && migrateOption && (
                <Button
                  id="migrateButton"
                  variant="contained"
                  color="secondary"
                  onClick={handleMigrateStart}
                >
                  Migrate
                </Button>
              )}
            </Box>
          ) : (
            ""
          )}
          {showTransfer && (
            <Box id="showTransfer" className="text-center">
              <Box
                sx={{
                  transform: `rotateY(${migrateSelect === "internal" ? "180deg" : "0deg"})`,
                }}
              >
                <Lottie
                  options={{
                    animationData: DataTransfer,
                    loop: true,
                    autoPlay: true,
                  }}
                  height={350}
                  width={350}
                />
              </Box>
              <Typography
                variant="h8"
                color="text.primary"
                className="relative top-[-5rem]"
              >
                For large data transfer, it may take a while
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DatabaseDetails;
