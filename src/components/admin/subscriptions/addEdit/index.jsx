"use client";
import CustomSelect from "@/components/common/customSelect";
import CustomInput from "@/components/common/customTextField";
import CustomToggle from "@/components/common/customToggle";
import { showNotification } from "@/components/common/notification";
import PageLayout from "@/components/common/pageLayout";
import {
  createSubscriptionApi,
  deleteSubscriptionApi,
  getSingleSubscriptionApi,
  updateSubscriptionApi,
} from "@/utilities/api/subscriptionApi";
import { catchError } from "@/utilities/helpers/functions";
import { AddRounded, DeleteRounded } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid2,
  IconButton,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const AddEdit = ({ id = "" }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(false);
  const [customLoading, setCustomLoading] = useState({
    status: false,
  });

  console.log(data);

  const fields = useMemo(() => {
    return [
      {
        id: "machineType.data",
        label: "Machine Type",
        type: "text",
        required: true,
      },
      {
        id: "machineType.description",
        label: "Machine Type Description",
        type: "text",
        required: true,
      },
      {
        id: "cpus.data",
        label: "CPUs",
        type: "number",
        required: true,
      },
      {
        id: "cpus.description",
        label: "CPUs Description",
        type: "text",
        required: true,
      },
      {
        id: "cpuType.data",
        label: "CPU Type",
        type: "text",
        required: true,
      },
      {
        id: "cpuType.description",
        label: "CPU Type Description",
        type: "text",
        required: true,
      },
      {
        id: "ram.data",
        label: "RAM",
        type: "number",
        required: true,
      },
      {
        id: "ram.description",
        label: "RAM Description",
        type: "text",
        required: true,
      },
      {
        id: "disk",
        label: "Disk",
        type: "number",
        required: true,
      },
      {
        id: "diskType",
        label: "Disk Type",
        type: "text",
        required: true,
      },
      {
        id: "bandwidth",
        label: "Bandwidth",
        type: "number",
        required: true,
      },
      {
        id: "status",
        label: "Status",
        type: "toggle",
        required: true,
      },
      {
        id: "price",
        label: "Price",
        type: "number",
        required: true,
      },
      {
        id: "currency",
        label: "Currency",
        type: "select",
        options: [
          { label: "USD", value: "USD" },
          { label: "INR", value: "INR" },
          { label: "EUR", value: "EUR" },
        ],
      },
    ];
  }, []);

  useEffect(() => {
    if (!id) return;
    setPageLoading(true);
    getSingleSubscriptionApi(id)
      .then((res) => {
        setData(res.data);
      })
      .catch(catchError)
      .finally(() => setPageLoading(false));
  }, [id]);

  const handleSave = async () => {
    setLoading(true);
    await createSubscriptionApi(data)
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        router.replace("/admin/subscriptions");
      })
      .catch((err) => {
        console.log(err);
        catchError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleUpdate = async () => {
    setLoading(true);
    await updateSubscriptionApi(id, {
      ...data,
      status: data.status ? "true" : "false",
    })
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        router.replace("/admin/subscriptions");
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDelete = async () => {
    setLoading(true);
    await deleteSubscriptionApi(id)
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        router.replace("/admin/subscriptions");
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const renderNavbar = () => {
    return (
      <div className="flex gap-4 items-center justify-between">
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          {id ? "Update" : "Create"} Subscription
        </Typography>
        <div className="flex gap-2 items-center">
          <Button
            variant="contained"
            size="small"
            disabled={loading || pageLoading}
            onClick={handleSave}
            endIcon={loading ? <CircularProgress size={16} /> : ""}
          >
            Create
          </Button>
          <Button
            variant="contained"
            size="small"
            disabled={loading || pageLoading}
            onClick={handleUpdate}
            endIcon={loading ? <CircularProgress size={16} /> : ""}
          >
            Update
          </Button>
          {id && (
            <Button
              variant="contained"
              size="small"
              disabled={loading || pageLoading}
              onClick={handleDelete}
              endIcon={loading ? <CircularProgress size={16} /> : ""}
              color="error"
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    );
  };

  const getValueByPath = (obj, path) => {
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
  };

  const setValueByPath = (obj, path, value) => {
    const keys = path.split(".");
    const lastKey = keys.pop();
    const deepObj = keys.reduce((acc, key) => {
      if (!acc[key]) acc[key] = {};
      return acc[key];
    }, obj);
    deepObj[lastKey] = value;
    return { ...obj };
  };

  const renderField = (field) => {
    return field.type === "text" || field.type === "number" ? (
      <CustomInput
        type={field.type}
        label={field.label}
        placeholder={field.label}
        value={getValueByPath(data, field.id)}
        onChange={(event) => {
          const value =
            field.type === "number"
              ? parseFloat(event.target.value)
              : event.target.value;
          setData(setValueByPath(data, field.id, value));
        }}
      />
    ) : field.type === "toggle" ? (
      <div className="w-full">
        <Typography variant="h6">{field.label}</Typography>
        <CustomToggle
          options={[
            { label: "Active", value: true },
            { label: "Inactive", value: false },
          ]}
          value={
            data?.[field.id] === null || data?.[field.id] === undefined
              ? true
              : getValueByPath(data, field.id)
          }
          disabled={!data?.name || !data?.requests}
          handleChange={(value) => {
            if (value !== null) {
              setData(setValueByPath(data, field.id, value));
            } else {
              setCustomLoading({ ...loading, [field.id]: true });
              setTimeout(() => {
                setCustomLoading({ ...loading, [field.id]: false });
              }, 10);
            }
          }}
        />
      </div>
    ) : field.type === "select" ? (
      <CustomSelect
        size="medium"
        labelTop={field.label}
        options={field.options}
        value={data?.[field.id]}
        none={false}
        handleChange={(event) =>
          setData({ ...data, [field.id]: event.target.value })
        }
      />
    ) : (
      ""
    );
  };

  return (
    <Box>
      <PageLayout navContent={renderNavbar()}>
        {pageLoading ? (
          <Box className="flex justify-center items-center h-[calc(100vh-16.2rem)]">
            <CircularProgress size={24} color="secondary" />
          </Box>
        ) : (
          <Grid2 container spacing={2} className="p-4 items-end">
            {fields.map((field, index) => (
              <Grid2
                item
                size={{
                  xs: 12,
                  md: field.type === "toggle" ? 12 : 6,
                  lg: field.type === "toggle" ? 12 : 4,
                }}
                key={index}
              >
                {renderField(field)}
              </Grid2>
            ))}
          </Grid2>
        )}
        <br />
      </PageLayout>
    </Box>
  );
};

export default AddEdit;
