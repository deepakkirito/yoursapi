import mongoose from "mongoose";
import { convertToIST } from "@/utilities/helpers/functions";

const Schema = mongoose.Schema;

const permissionsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
    updatedAt: {
      type: Date,
      default: new Date(),
    },
    userId: { type: Schema.Types.ObjectId, ref: "users" },
    editName: { type: Boolean, default: false },
    inactiveProject: { type: Boolean, default: false },
    restoreProject: { type: Boolean, default: false },
    share: { type: Boolean, default: false },
    createApi: { type: Boolean, default: false },
    deleteApi: { type: Boolean, default: false },
    schema: { type: Boolean, default: false },
    apiSettings: { type: Boolean, default: false },
    saveData: { type: Boolean, default: false },
    editInstance: { type: Boolean, default: false },
    startInstance: { type: Boolean, default: false },
    createPermission: { type: Boolean, default: false },
    updatePermission: { type: Boolean, default: false },
    common: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

permissionsSchema.index({ name: "text" });

const PermissionsModel =
  mongoose.models?.permissions || mongoose.model("permissions", permissionsSchema);

export default PermissionsModel;