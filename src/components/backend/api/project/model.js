import { convertToIST } from "@/utilities/helpers/functions";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const projectsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: () => convertToIST(new Date()), // Store in IST
    },
    updatedAt: {
      type: Date,
      default: () => convertToIST(new Date()), // Store in IST
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    apiIds: [{ type: Schema.Types.ObjectId, ref: "apis" }],
    shared: [{ type: Schema.Types.ObjectId, ref: "users" }],
    authId: { type: Schema.Types.ObjectId, ref: "auths" },
    dbString: { type: String, default: null },
    fetchData: {
      type: String,
      default: "self",
      enum: ["self", "master", "project"],
    },
    instance: {
      nodeVersion: { type: String, default: "node:18-alpine" },
      dependencies: [{ type: String }],
      environmentVariables: { type: Object },
      ramUsage: { type: Number, default: 512 },
      cpuUsage: { type: Number, default: 0.5 },
      status: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true, // Disable Mongoose default timestamps
  }
);

// Middleware to update `updatedAt` before save/update operations
projectsSchema.pre("save", function (next) {
  if (this.createdAt) {
    this.createdAt = convertToIST(new Date(this.createdAt));
  }
  this.updatedAt = convertToIST(new Date());
  next();
});

projectsSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: convertToIST(new Date()) });
  next();
});

projectsSchema.index({ name: "text", userId: 1 });

const ProjectsModel =
  mongoose.models.projects || mongoose.model("projects", projectsSchema);

export default ProjectsModel;
