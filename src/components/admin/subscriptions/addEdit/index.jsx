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
  const [priceArray, setPriceArray] = useState([]);
  const [price, setPrice] = useState({});

  const fields = useMemo(() => {
    return [
      {
        id: "name",
        label: "Subscription Name",
        type: "text",
        required: true,
      },
      {
        id: "requests",
        label: "Requests",
        type: "number",
        required: true,
      },
      {
        id: "ramLimit",
        label: "RAM Limit",
        type: "number",
      },
      {
        id: "cpuLimit",
        label: "CPU Limit",
        type: "number",
      },
      {
        id: "projectLimit",
        label: "Project Limit",
        type: "number",
      },
      {
        id: "apiLimit",
        label: "API Limit",
        type: "number",
      },
      {
        id: "status",
        label: "Status",
        type: "toggle",
      },
    ];
  }, []);

  const priceFields = [
    {
      id: "value",
      label: "Price",
      type: "number",
    },
    {
      id: "discount",
      label: "Discount",
      type: "number",
    },
    {
      id: "currency",
      label: "Currency",
      type: "select",
      options: [
        { label: "INR", value: "INR" },
        { label: "USD", value: "USD" },
      ],
    },
    {
      id: "type",
      label: "Type",
      type: "select",
      options: [
        { label: "Monthly", value: "monthly" },
        { label: "Yearly", value: "yearly" },
        { label: "Quarterly", value: "quarterly" },
      ],
    },
  ];

  useEffect(() => {
    if (!id) return;
    setPageLoading(true);
    getSingleSubscriptionApi(id)
      .then((res) => {
        setData(res.data);
        setPriceArray(res.data.price);
      })
      .catch(catchError)
      .finally(() => setPageLoading(false));
  }, [id]);

  const handleSave = async () => {
    setLoading(true);
    await createSubscriptionApi({ ...data, price: priceArray })
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
      price: priceArray,
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
            disabled={loading || !data?.name || pageLoading}
            onClick={!id ? handleSave : handleUpdate}
            endIcon={loading ? <CircularProgress size={16} /> : ""}
          >
            {id ? "Update" : "Create"}
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

  const renderField = (field) => {
    return field.type === "text" || field.type === "number" ? (
      <CustomInput
        type={field.type}
        label={field.label}
        placeholder={field.label}
        value={data?.[field.id]}
        onChange={(event) =>
          setData({ ...data, [field.id]: event.target.value.toUpperCase() })
        }
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
              : data?.[field.id]
          }
          disabled={!data?.name || !data?.requests}
          handleChange={(value) => {
            if (value !== null) {
              setData({ ...data, [field.id]: value });
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
        handleChange={(event) =>
          setData({ ...data, [field.id]: event.target.value })
        }
      />
    ) : (
      ""
    );
  };

  const renderPriceField = (field) => {
    return field.type === "number" || field.type === "text" ? (
      <CustomInput
        type={field.type}
        label={field.label}
        placeholder={field.label}
        value={price?.[field.id]}
        onChange={(event) =>
          setPrice({ ...price, [field.id]: event.target.value })
        }
      />
    ) : field.type === "select" ? (
      <CustomSelect
        size="medium"
        none={false}
        labelTop={field.label}
        options={field.options}
        value={price?.[field.id]}
        handleChange={(event) =>
          setPrice({ ...price, [field.id]: event.target.value })
        }
      />
    ) : (
      ""
    );
  };

  const renderPriceFieldsArray = (field, index) => {
    return field.type === "number" || field.type === "text" ? (
      <CustomInput
        type={field.type}
        label={field.label}
        placeholder={field.label}
        value={priceArray[index]?.[field.id]}
        onChange={(event) =>
          setPriceArray((prevState) => {
            const newState = [...prevState];
            newState[index] = {
              ...(newState[index] || {}), // Ensure the object exists
              [field.id]: event.target.value,
            };
            return newState;
          })
        }
      />
    ) : field.type === "select" ? (
      <CustomSelect
        size="medium"
        none={false}
        labelTop={field.label}
        options={field.options}
        value={priceArray[index]?.[field.id]}
        onChange={(event) =>
          setPriceArray((prevState) => {
            const newState = [...prevState];
            newState[index] = {
              ...(newState[index] || {}), // Ensure the object exists
              [field.id]: event.target.value,
            };
            return newState;
          })
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
            <div className="w-full">
              <br />
              <Divider className="w-full" />
              <br />
            </div>
            <Box
              className="w-full"
              sx={{
                borderRadius: "0.5rem",
                padding: "1rem",
                backgroundColor: "background.default",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              {priceArray?.length > 0 &&
                priceArray.map((item, indexArray) => (
                  <Grid2
                    container
                    spacing={2}
                    key={indexArray}
                    className="items-center mb-2"
                  >
                    {priceFields.map((field, index) => (
                      <Grid2
                        item
                        size={{
                          xs: 12,
                          md: 6,
                          lg: 4,
                        }}
                        key={index}
                      >
                        {renderPriceFieldsArray(field, indexArray)}
                      </Grid2>
                    ))}
                    <IconButton
                      onClick={() => {
                        setPriceArray((prevState) => {
                          const newState = [...prevState];
                          newState.splice(indexArray, 1);
                          return newState;
                        });
                      }}
                    >
                      <DeleteRounded color="error" />
                    </IconButton>
                  </Grid2>
                ))}
            </Box>
            {priceFields.map((field, index) => (
              <Grid2
                item
                size={{
                  xs: 12,
                  md: 6,
                  lg: 4,
                }}
                key={index}
              >
                {renderPriceField(field)}
              </Grid2>
            ))}
            <IconButton
              onClick={() => {
                setPriceArray((prevState) => [...(prevState ?? []), price]);
                setPrice({});
              }}
            >
              <AddRounded />
            </IconButton>
          </Grid2>
        )}
        <br />
      </PageLayout>
    </Box>
  );
};

export default AddEdit;
