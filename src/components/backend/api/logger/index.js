import { convertToIST } from "@/utilities/helpers/functions";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const loggerSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    createdAt: {
      type: Date,
      default: () => convertToIST(new Date()), // Store in IST
    },
    updatedAt: {
      type: Date,
      default: () => convertToIST(new Date()), // Store in IST
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
  },
  {
    timestamps: true, // Disable automatic timestamps to manually control IST storage
  }
);

// Middleware to update `updatedAt` before save/update operations
loggerSchema.pre("save", function (next) {
  if (this.createdAt) {
    this.createdAt = convertToIST(new Date(this.createdAt));
  }
  this.updatedAt = convertToIST(new Date());
  next();
});

loggerSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: convertToIST(new Date()) });
  next();
});

loggerSchema.index({ userId: 1, log: "text" });

const LoggersModel =
  mongoose.models.loggers || mongoose.model("loggers", loggerSchema);

export default LoggersModel;
