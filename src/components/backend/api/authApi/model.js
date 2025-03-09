import { convertToIST } from "@/utilities/helpers/functions";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const authsSchema = new Schema(
  {
    name: { type: String, default: "auth" },
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "projects", required: true },
    createdAt: {
      type: Date,
      default: () => convertToIST(new Date()),
    },
    updatedAt: {
      type: Date,
      default: () => convertToIST(new Date()),
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
    getRequest: {
      used: { type: Number, default: 0 },
      active: { type: Boolean, default: true },
    },
    postRequest: {
      used: { type: Number, default: 0 },
      active: { type: Boolean, default: true },
    },
    putRequest: {
      used: { type: Number, default: 0 },
      active: { type: Boolean, default: true },
    },
    deleteRequest: {
      used: { type: Number, default: 0 },
      active: { type: Boolean, default: true },
    },
    headRequest: {
      used: { type: Number, default: 0 },
      active: { type: Boolean, default: true },
    },
    patchRequest: {
      used: { type: Number, default: 0 },
      active: { type: Boolean, default: true },
    },
    schema: {
      type: Object,
      default: {
        email: { type: "String", required: true },
        password: { type: "String", required: true },
      },
    },
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
    log: [
      {
        type: {
          type: String,
          enum: [
            "headRequest",
            "getRequest",
            "postRequest",
            "putRequest",
            "patchRequest",
            "deleteRequest",
          ],
        },
        createdAt: {
          type: Date,
          default: () => convertToIST(new Date()),
        },
      },
    ],
  },
  {
    timestamps: true, // Mongoose manages createdAt and updatedAt
  }
);

// Middleware: Update timestamps on save
authsSchema.pre("save", function (next) {
  if (!this.createdAt) {
    this.createdAt = convertToIST(new Date());
  }
  this.updatedAt = convertToIST(new Date());
  next();
});

// Middleware: Auto-update `updatedAt` on findOneAndUpdate
authsSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: convertToIST(new Date()) });
  next();
});

authsSchema.index({ name: "text", userId: 1 });

const AuthsModel =
  mongoose.models.auths || mongoose.model("auths", authsSchema);

export default AuthsModel;
