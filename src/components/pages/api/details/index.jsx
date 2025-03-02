import { getDate } from "@/utilities/helpers/functions";
import { Avatar, Divider, Typography } from "@mui/material";
import Image from "next/image";

const Details = ({ data }) => {
  return (
    <div className="flex flex-col gap-2 flex-wrap">
      <div className="flex gap-4 items-center flex-wrap">
        <Typography variant="h7" fontWeight={"700"}>
          Created At:{" "}
        </Typography>
        <Typography variant="h7">{getDate(data.createdAt)}</Typography>
        <div className="flex gap-4 items-center">
          <Typography variant="h7" fontWeight={"700"}>
            by
          </Typography>
          {data.createdBy?.profile && (
            <Image
              src={data.createdBy?.profile}
              alt="avatar"
              width={40}
              height={40}
              style={{
                borderRadius: "50%",
              }}
            />
          )}
          <div className="flex flex-col gap-0">
            <Typography variant="h7">{data.createdBy?.name}</Typography>
            <Typography variant="h7">{data.createdBy?.email}</Typography>
          </div>
        </div>
      </div>
      <Divider />
      <div className="flex gap-4 items-center flex-wrap">
        <Typography variant="h7" fontWeight={"700"}>
          Updated At:
        </Typography>
        <Typography variant="h7">{getDate(data.updatedAt)}</Typography>
        <div className="flex gap-4 items-center">
          <Typography variant="h7" fontWeight={"700"}>
            by
          </Typography>
          {data.updatedBy?.profile && (
            <Image
              src={data.updatedBy?.profile}
              alt="avatar"
              width={40}
              height={40}
              style={{
                borderRadius: "50%",
              }}
            />
          )}
          <div className="flex flex-col gap-0">
            <Typography variant="h7">{data.updatedBy?.name}</Typography>
            <Typography variant="h7">{data.updatedBy?.email}</Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
