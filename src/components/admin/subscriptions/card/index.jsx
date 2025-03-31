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
  return (
    <Box
      className="flex flex-col gap-2 w-full"
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
        <Typography variant="h6">Name: {data?.name}</Typography>
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
        <Typography variant="h7">
          {data?.requests ?? "Unlimited"} requests
        </Typography>
        <Typography variant="h7">
          Status: {data?.status ? "Active" : "Inactive"}
        </Typography>
      </div>
      <div className="flex gap-2 items-center justify-between">
        <Typography variant="h7">{data?.cpuLimit} CPU</Typography>
        <Typography variant="h7">{data?.ramLimit} MB RAM</Typography>
      </div>
      <div className="flex gap-2 items-center justify-between">
        <Typography variant="h7">
          Projects Limit: {data?.projectLimit ?? "Unlimited"}
        </Typography>
        <Typography variant="h7">
          APIs Limit: {data?.apiLimit ?? "Unlimited"}
        </Typography>
      </div>
      <Divider className="w-full" />
      <div className="flex gap-1 justify-between flex-col">
        <Typography
          variant="h7"
          sx={{
            fontWeight: "bold",
          }}
        >
          Plans
        </Typography>
        {data?.price?.length > 0
          ? data?.price?.map((item, index) => (
              <Typography key={index} variant="h7">
                {item.type.toUpperCase()} - {item.currency} {item.value} -{" "}
                {item.discount}% off - {(item.value * item.discount) / 100}{" "}
                {item.currency} -{" "}
                {item.value - (item.value * item.discount) / 100}{" "}
                {item.currency}
              </Typography>
            ))
          : "No plans"}
      </div>
      <Divider className="w-full" />
      <div className="flex gap-2 items-center justify-between">
        <Typography variant="h7">
          Created at: {getDate(data?.createdAt)}
        </Typography>
      </div>
      <div className="flex gap-2 items-center justify-between">
        <Typography variant="h7">
          Last modified: {getDate(data?.updatedAt)}
        </Typography>
      </div>
    </Box>
  );
};

export default SubscriptionCard;
