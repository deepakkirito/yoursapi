import { convertToIST } from "@/utilities/helpers/functions";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const loggerSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    createdAt: {
      type: Date,
      default: new Date(),
    },
    updatedAt: {
      type: Date,
      default: new Date(),
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
    log: { type: String, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "projects" },
    apiId: { type: Schema.Types.ObjectId, ref: "apis" },
    authId: { type: Schema.Types.ObjectId, ref: "auths" },
    type: {
      type: String,
      required: true,
      enum: ["user", "auth", "api", "project", "data"],
    },
    read: { type: Boolean, default: false },
    status: { type: String, enum: ["success", "error"], default: "success" },
    link: { type: String },
    environment: { type: String, enum: ["production", "development"] },
  },
  {
    timestamps: true,
  }
);

loggerSchema.index({ userId: 1, log: "text" });

const LoggersModel =
  mongoose.models.loggers || mongoose.model("loggers", loggerSchema);

export default LoggersModel;
