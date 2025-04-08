import CustomInput from "@/components/common/customTextField";
import { showNotification } from "@/components/common/notification";
import TooltipCustom from "@/components/common/tooltip";
import {
  addDomainApi,
  checkDomainExistApi,
  removeDomainApi,
} from "@/utilities/api/projectApi";
import { catchError } from "@/utilities/helpers/functions";
import { Add, DeleteRounded, InfoRounded } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

const Domains = ({
  projectData,
  projectId,
  environment,
  setProjectData,
  instanceStatus,
}) => {
  const [domains, setDomains] = useState([]);
  const [domain, setDomain] = useState("");
  const [domainError, setDomainError] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [headLoading, setHeadLoading] = useState(false);

  useEffect(() => {
    const domains = projectData?.domains.map((domain) => domain.name);
    setDomains(domains || []);
  }, [projectData]);

  const checkDomain = async () => {
    await checkDomainExistApi({ id: projectId, domain })
      .then((res) => {
        setDomainError(true);
      })
      .catch((err) => {
        setDomainError(false);
      })
      .finally(() => {
        setHeadLoading(false);
      });
  };

  const handleAddDomain = async () => {
    setAddLoading(true);
    await addDomainApi({ id: projectId, body: { domain, environment } })
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        setProjectData({
          ...projectData,
          domains: [...projectData.domains, { name: domain }],
        });
        setDomain("");
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setAddLoading(false);
      });
  };

  const handleDeleteDomain = async (domain) => {
    setRemoveLoading(true);
    await removeDomainApi({ id: projectId, domain, environment })
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        setProjectData({
          ...projectData,
          domains: projectData.domains.filter((item) => item.name !== domain),
        });
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setRemoveLoading(false);
      });
  };

  useEffect(() => {
    setHeadLoading(true);
    setDomainError(false);
    const timeoutId = setTimeout(() => {
      checkDomain();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [domain]);

  return (
    <div className="mx-4">
      <div>
        <div className="flex gap-2 items-center">
          <Typography variant="h6">Connect Sub-domains</Typography>
          {domains?.length === 2 && (
            <TooltipCustom
              title={
                <div className="flex gap-2 items-start flex-col p-1">
                  {domains?.length === 2 && (
                    <Typography variant="h8">
                      You can only connect 2 sub-domains
                    </Typography>
                  )}
                </div>
              }
            >
              <InfoRounded fontSize="small" />
            </TooltipCustom>
          )}

          {removeLoading && <CircularProgress size={16} color="secondary" />}
        </div>
        {domains?.length === 0 ? (
          <Typography variant="h8">No sub-domains connected</Typography>
        ) : (
          <div className="flex gap-2 items-start flex-col justify-start">
            {domains.map((domain, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Typography variant="h8">
                  {domain}
                  {environment === "development" ? "-dev" : ""}.youpi.
                  {process.env.NEXT_PUBLIC_ENVIRONMENT === "dev"
                    ? "com"
                    : "pro"}
                </Typography>
                <IconButton
                  onClick={() => handleDeleteDomain(domain)}
                  disabled={removeLoading}
                >
                  <DeleteRounded color="error" fontSize="small" />
                </IconButton>
              </div>
            ))}
          </div>
        )}
      </div>
      <br />
      {domains?.length < 2 && (
        <div className="flex gap-2 items-center">
          <CustomInput
            label="Sub-domain"
            fullWidth={false}
            formfullwidth={false}
            size="small"
            placeholder={"Enter sub-domain"}
            value={domain}
            onChange={(e) =>
              setDomain((prev) => {
                const regex = new RegExp(/^[a-zA-Z0-9_-]+$/);
                if (regex.test(e.target.value)) {
                  return e.target.value.toLowerCase();
                } else if (e.target.value === "") {
                  return "";
                } else {
                  return prev;
                }
              })
            }
            inputProps={{
              maxLength: 30,
            }}
            error={domainError}
            helperText={domainError ? "Domain already exists" : null}
          />
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={<Add />}
            disabled={!domain || addLoading || domainError || headLoading}
            endIcon={addLoading && <CircularProgress size={16} />}
            onClick={() => {
              handleAddDomain();
            }}
          >
            Add
          </Button>
        </div>
      )}
      <br />
      <Divider className="w-full" />
      <br />
      <div>
        <Typography variant="h6">Connect your Domain</Typography>
      </div>
    </div>
  );
};

export default Domains;
