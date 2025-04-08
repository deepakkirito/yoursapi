import { showNotification } from "@/components/common/notification";
import { addSubscriptionApi } from "@/utilities/api/projectApi";
import { getSubscriptionApi } from "@/utilities/api/subscriptionApi";
import { catchError } from "@/utilities/helpers/functions";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const Pricing = ({
  data,
  projectId,
  setPlanDetails,
  planDetails,
  status,
  environment,
  handleRefetch = () => {},
}) => {
  const [loading, setLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
  });
  const [filter, setFilter] = useState("price");
  const [sort, setSort] = useState("lth");
  const [search, setSearch] = useState("");
  const [addSubscriptionLoading, setAddSubscriptionLoading] = useState(false);

  const getRam = (ram) => {
    if (ram >= 1) {
      return `${ram} GB`;
    } else {
      return `${ram * 1024} MB`;
    }
  };

  useEffect(() => {
    subscriptionData?.length &&
      setPlanDetails(
        subscriptionData.find(
          (item) => item._id === data?.data?.activeSubscription?.data?._id
        )
      );
  }, [data, subscriptionData]);

  const getSubscription = async () => {
    setLoading(true);
    await getSubscriptionApi(
      pagination.page,
      pagination.rowsPerPage,
      search,
      sort,
      filter
    )
      .then((res) => {
        setSubscriptionData(res.data.data);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getSubscription();
  }, []);

  const handleAddSubscription = async () => {
    setAddSubscriptionLoading(true);
    await addSubscriptionApi(projectId, {
      subscriptionId: planDetails._id,
      environment,
    })
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        handleRefetch(false);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setAddSubscriptionLoading(false);
      });
  };

  return (
    <div className="flex flex-row gap-4 items-start justify-left">
      {/* <div className="p-2">
        {subscriptionData.length > 0 && !loading && (
          <Box
            className="flex flex-col gap-1 items-start justify-left min-w-[20rem]"
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "0.5rem",
              padding: "1rem",
              backgroundColor: "background.defaultSolid",
            }}
          >
            <div className="flex gap-4 items-center justify-between w-full">
              <Typography variant="h8">MachineType</Typography>
              <Typography variant="h8">CPU Type</Typography>
            </div>
            <div className="flex gap-4 items-center justify-between w-full">
              <Typography variant="h8">CPUs</Typography>
              <Typography variant="h8">Ram</Typography>
            </div>
            <div className="flex gap-4 items-center justify-between w-full">
              <Typography variant="h8">Disk</Typography>
              <Typography variant="h8">Data transfer</Typography>
            </div>
            <div className="flex gap-4 items-center justify-between w-full">
              <Typography variant="h8">Pricing per month</Typography>
              <Typography variant="h8">Pricing per hour</Typography>
            </div>
          </Box>
        )}
      </div> */}
      <div className="flex gap-4 items-start justify-left overflow-x-auto overflow-y-hidden p-2">
        {loading ? (
          <div className="flex justify-center items-center">
            <CircularProgress color="secondary" />
          </div>
        ) : !(subscriptionData.length > 0) ? (
          "No Subscription found"
        ) : (
          subscriptionData.map((item, index) => (
            <Box
              key={index}
              className="flex flex-col gap-1 items-center justify-left cursor-pointer min-w-[18rem]"
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "0.5rem",
                padding: "1rem",
                backgroundColor:
                  data?.data?.activeSubscription?.data?._id === item._id
                    ? "background.defaultSolid"
                    : "background.default",
                transition: "all 0.5s",
                transform:
                  data?.data?.activeSubscription?.data?._id === item._id
                    ? "scale(1.05)"
                    : planDetails?._id === item._id
                      ? "scale(1.05)"
                      : "scale(1)",
              }}
              onClick={() => setPlanDetails(item)}
            >
              <div className="flex gap-8 items-center justify-between w-full">
                <Typography variant="h8">
                  {item.machineType.data} Machine
                </Typography>
                <Typography variant="h8">{item.cpuType.data} CPU</Typography>
              </div>
              <div className="flex gap-8 items-center justify-between w-full">
                <Typography variant="h8">{item.cpus.data} cores cpu</Typography>
                <Typography variant="h8">
                  {getRam(item.ram.data)} RAM
                </Typography>
              </div>
              <div className="flex gap-8 items-center justify-between w-full">
                <Typography variant="h8">
                  {item.disk} GB {item.diskType} Disk
                </Typography>
                <Typography variant="h8">
                  {item.bandwidth} TB Data Transfer
                </Typography>
              </div>
              <div className="flex gap-8 items-center justify-between w-full">
                <Typography variant="h8">
                  {item.price} {item.currency} / Month
                </Typography>
                <Typography variant="h8">
                  {(item.price / (30 * 24)).toFixed(2)} {item.currency} / hour
                </Typography>
              </div>
              {data?.data?.activeSubscription?.data?._id === item._id && (
                <Typography
                  variant="h8"
                  sx={{
                    backgroundColor: "status.green",
                    padding: "0.1rem 0.6rem",
                    borderRadius: "1rem",
                  }}
                >
                  Active
                </Typography>
              )}
              {planDetails?._id === item._id &&
                data?.data?.activeSubscription?.data?._id !== item._id && (
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    disabled={addSubscriptionLoading}
                    sx={{
                      borderRadius: "2rem",
                      fontSize: "0.6rem",
                    }}
                    onClick={() => handleAddSubscription(item._id)}
                    endIcon={
                      addSubscriptionLoading && <CircularProgress size={16} />
                    }
                  >
                    Activate Plan
                  </Button>
                )}
            </Box>
          ))
        )}
      </div>
    </div>
  );
};

export default Pricing;
