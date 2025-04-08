import { convertToIST } from "@/utilities/helpers/functions";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const sessionsSchema = new Schema(
  {
    jwt: {
      type: String,
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    location: { type: Schema.Types.ObjectId, ref: "locations" },
    createdAt: {
      type: Date,
      default: new Date(),
    },
    lastActive: {
      type: Date,
      default: new Date(),
    },
  },
  {
    timestamps: true, // Disable Mongoose default timestamps
  }
);

sessionsSchema.index({ jwt: "text", userId: 1 });

const SessionsModel =
  mongoose.models?.sessions || mongoose.model("sessions", sessionsSchema);

export default SessionsModel;
