import { convertToIST } from "@/utilities/helpers/functions";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const environmentTypeData = {
  dbString: {
    data: {
      type: String,
      default: null,
    },
    updatedAt: {
      type: Date,
      default: new Date(),
    },
  },
  environmentVariables: {
    data: { type: Object, default: {} },
    updatedAt: {
      type: Date,
      default: new Date(),
    },
  },
  activeSubscription: {
    data: {
      type: String,
      default: null,
    },
    updatedAt: {
      type: Date,
      default: new Date(),
    },
  },
  instance: {
    status: {
      type: Boolean,
      default: false,
    },
    containerId: {
      type: String,
      default: null,
    },
    updatedAt: {
      type: Date,
      default: new Date(),
    },
  },
};

const projectsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["youpiapi", "webhosting"],
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
    updatedAt: {
      type: Date,
      default: new Date(),
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    apiIds: [{ type: Schema.Types.ObjectId, ref: "apis" }],
    shared: [{ type: Schema.Types.ObjectId, ref: "users" }],
    authId: { type: Schema.Types.ObjectId, ref: "auths" },
    data: {
      production: environmentTypeData,
      development: environmentTypeData,
    },
    dependencies: {
      data: [
        {
          type: String,
          default: "express",
        },
      ],
      updatedAt: {
        type: Date,
        default: new Date(),
      },
    },
    environment: {
      data: {
        type: String,
        default: "node",
      },
      version: {
        type: String,
        default: "18-alpine",
      },
      updatedAt: {
        type: Date,
        default: new Date(),
      },
    },
    domains: [
      {
        type: Schema.Types.ObjectId,
        ref: "domains",
      },
    ],
  },
  {
    timestamps: true,
  }
);

projectsSchema.index({ name: "text", userId: 1 });

const ProjectsModel =
  mongoose.models.projects || mongoose.model("projects", projectsSchema);

export default ProjectsModel;
