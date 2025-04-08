import CustomInput from "@/components/common/customTextField";
import { showNotification } from "@/components/common/notification";
import {
  checkProjectExistApi,
  createProjectApi,
} from "@/utilities/api/projectApi";
import { CreateAlertContext } from "@/utilities/context/alert";
import { catchError } from "@/utilities/helpers/functions";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import DescriptionIcon from "@mui/icons-material/Description";
import CustomSelect from "@/components/common/customSelect";

const AddProjectNew = ({ handleSuccess = () => {} }) => {
  const { alert, setAlert } = useContext(CreateAlertContext);
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectType, setProjectType] = useState("youpiapi");
  const [projectValidator, setProjectValidator] = useState("");
  const [validator, setValidator] = useState([]);

  useEffect(() => {
    projectName &&
      checkProjectExistApi(projectName)
        .then((res) => {
          setProjectValidator("");
        })
        .catch((err) => {
          setProjectValidator({
            name: "projectName",
            msg: "Project name already exist",
          });
        });
    setValidator([]);
  }, [projectName]);

  const handleCreate = () => {
    setLoading(true);

    createProjectApi({
      projectName: projectName,
      description: projectDescription,
      type: projectType,
    })
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        handleSuccess();
        setAlert({
          open: false,
        });
      })
      .catch((err) => {
        if (err.response.status === 422) {
          const temp = err.response.data.errors?.map((item) => ({
            name: item.path,
            msg: item.msg,
          }));
          setValidator(temp);
        } else {
          catchError(err);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Box className="flex flex-col">
      <div className="flex flex-col gap-1 items-start">
        <CustomInput
          placeholder="Enter project name"
          sx={{
            width: {
              xs: "15rem",
              md: "25rem",
            },
          }}
          value={projectName}
          onChange={(event) => {
            setProjectName(event.target.value);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <AccountTreeRoundedIcon
                  color="secondary"
                  fontSize="small"
                  className="mr-2"
                />
              ),
            },
          }}
        />

        <CustomInput
          placeholder="Enter project description"
          multiline
          sx={{
            width: {
              xs: "15rem",
              md: "25rem",
            },
          }}
          value={projectDescription}
          onChange={(event) => {
            setProjectDescription(event.target.value);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <DescriptionIcon
                  color="secondary"
                  fontSize="small"
                  className="mr-2"
                />
              ),
            },
          }}
        />
        <CustomSelect
          label="Project Type"
          size="medium"
          none={false}
          options={[
            { label: "Youpi Api", value: "youpiapi" },
            { label: "Web Hosting", value: "webhosting" },
          ]}
          value={projectType}
          handleChange={(event) => {
            setProjectType(event.target.value);
          }}
          labelWidth="10rem"
          sx={{
            marginTop: "0.5rem",
          }}
        />
      </div>
      <ul>
        {projectValidator && (
          <Typography className="text-red-500 list-disc" component={"li"}>
            <b>{projectValidator.msg}</b>
          </Typography>
        )}

        {validator?.map((item, index) => {
          return (
            <Typography
              key={index}
              className="text-red-500 list-disc"
              component={"li"}
            >
              <b>{item.msg}</b>
            </Typography>
          );
        })}
      </ul>
      <Box className="flex gap-2 items-center justify-around">
        <Button
          variant="contained"
          color="success"
          sx={{
            borderRadius: "3rem",
            padding: "0.5rem 2rem",
          }}
          disabled={loading || !projectName || !projectDescription}
          endIcon={loading ? <CircularProgress size={16} /> : null}
          onClick={handleCreate}
        >
          Create
        </Button>
        <Button
          variant="contained"
          color="error"
          sx={{
            borderRadius: "3rem",
            padding: "0.5rem 2rem",
          }}
          onClick={() => {
            setAlert({
              open: false,
            });
          }}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default AddProjectNew;
