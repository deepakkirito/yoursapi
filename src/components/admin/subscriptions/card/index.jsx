import { getDate } from "@/utilities/helpers/functions";
import { DeleteRounded } from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

const SubscriptionCard = ({ data, handleDelete, clickUrl, deleteLoading }) => {
  const router = useRouter();

  const getRam = (ram) => {
    if (ram >= 1) {
      return `${ram} GB`;
    } else {
      return `${ram * 1024} MB`;
    }
  };
  return (
    <Box
      className="flex flex-col gap-1 w-full"
      sx={{
        borderRadius: "0.5rem",
        padding: "1rem",
        backgroundColor: "background.default",
        border: "1px solid",
        borderColor: "divider",
        cursor: "pointer",
        transition: "all 0.5s",
        ":hover": {
          backgroundColor: "background.defaultSolid",
          "& .MuiIconButton-root": {
            transform: "translateX(0rem)",
            opacity: 1,
          },
        },
      }}
      onClick={() => router.push(clickUrl)}
    >
      <div className="flex gap-2 items-center justify-between">
        <Typography variant="h7">Plan Details</Typography>
        {deleteLoading ? (
          <CircularProgress size={16} color="secondary" />
        ) : (
          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              handleDelete(data._id);
            }}
            sx={{
              transform: "translateX(1rem)",
              opacity: 0,
              transition: "all 0.5s",
            }}
          >
            <DeleteRounded color="error" />
          </IconButton>
        )}
      </div>
      <div className="flex gap-2 items-center justify-between">
        <Typography variant="h8">
          Machine Type: {data?.machineType.data}
        </Typography>
        <Typography variant="h8">
          Status: {data?.status ? "Active" : "Inactive"}
        </Typography>
      </div>
      <div className="flex gap-2 items-center justify-between">
        <Typography variant="h8">Cpu Type: {data?.cpuType.data}</Typography>
        <Typography variant="h8">{data?.cpus.data} CPU</Typography>
      </div>
      <div className="flex gap-2 items-center justify-between">
        <Typography variant="h8">Ram: {getRam(data?.ram.data)}</Typography>
        <Typography variant="h8">
          Disk: {data?.disk} GB {data?.diskType}
        </Typography>
      </div>
      <div className="flex gap-2 items-center justify-between">
        <Typography variant="h8">
          Disk Transfer: {data?.bandwidth} TB
        </Typography>
        <Typography variant="h8">
          Price: {data?.price} {data?.currency}
        </Typography>
      </div>
      <Divider className="w-full" />
      <div className="flex gap-2 items-center justify-between">
        <Typography variant="h8">
          Created at: {getDate(data?.createdAt)}
        </Typography>
      </div>
      <div className="flex gap-2 items-center justify-between">
        <Typography variant="h8">
          Last modified: {getDate(data?.updatedAt)}
        </Typography>
      </div>
    </Box>
  );
};

export default SubscriptionCard;
