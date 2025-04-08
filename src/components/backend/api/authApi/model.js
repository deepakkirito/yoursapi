import { convertToIST } from "@/utilities/helpers/functions";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const environmentTypeData = {
  authType: {
    type: String,
    default: "none",
    enum: ["none", "cookie", "jwt"],
  },
  captcha: {
    type: Boolean,
    default: false,
  },
  tokenAge: {
    type: Number,
    default: 24,
  },
  schema: {
    data: {
      type: Object,
      default: {
        email: { type: "String", required: true },
        password: { type: "String", required: true },
      },
      updatedAt: {
        type: Date,
        default: new Date(),
      },
    },
  },
};

const authsSchema = new Schema(
  {
    name: { type: String, default: "auth" },
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "projects", required: true },
    createdAt: {
      type: Date,
      default: new Date(),
    },
    updatedAt: {
      type: Date,
      default: new Date(),
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
    data: {
      environMentType: {
        type: String,
        default: "production",
        enum: ["production", "development"],
      },
      data: environmentTypeData,
    },
  },
  {
    timestamps: true,
  }
);

authsSchema.index({ name: "text", userId: 1 });

const AuthsModel =
  mongoose.models.auths || mongoose.model("auths", authsSchema);

export default AuthsModel;
