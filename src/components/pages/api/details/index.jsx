import { getDate } from "@/utilities/helpers/functions";
import { Avatar, Divider, Typography } from "@mui/material";
import Image from "next/image";

const Details = ({ data }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-4 items-center">
        <Typography variant="h7" fontWeight={"700"} component="span">
          Created At:{" "}
        </Typography>
        <Typography variant="h7" component="span">
          {getDate(data.createdAt)}
        </Typography>

        <div className="flex gap-4 items-center">
          <Typography variant="h7" fontWeight={"700"} component="span">
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

          {/* ✅ Ensure Typography does not wrap divs */}
          <div className="flex flex-col gap-0">
            <Typography variant="h7" component="span">
              {data.createdBy?.name}
            </Typography>
            <Typography variant="h7" component="span">
              {data.createdBy?.email}
            </Typography>
          </div>
        </div>
      </div>

      <Divider />

      <div className="flex gap-4 items-center">
        <Typography variant="h7" fontWeight={"700"} component="span">
          Updated At:
        </Typography>
        <Typography variant="h7" component="span">
          {getDate(data.updatedAt)}
        </Typography>

        <div className="flex gap-4 items-center">
          <Typography variant="h7" fontWeight={"700"} component="span">
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

          {/* ✅ Fixing nested div inside Typography */}
          <div className="flex flex-col gap-0">
            <Typography variant="h7" component="span">
              {data.updatedBy?.name}
            </Typography>
            <Typography variant="h7" component="span">
              {data.updatedBy?.email}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
