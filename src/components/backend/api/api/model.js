import mongoose from "mongoose";

const Schema = mongoose.Schema;

const environmentTypeData = {
  getRequest: {
    secured: { type: Boolean, default: true },
  },
  postRequest: {
    secured: { type: Boolean, default: true },
  },
  putRequest: {
    secured: { type: Boolean, default: true },
  },
  deleteRequest: {
    secured: { type: Boolean, default: true },
  },
  headRequest: {
    secured: { type: Boolean, default: true },
  },
  patchRequest: {
    secured: { type: Boolean, default: true },
  },
  schema: {
    data: { type: Object, default: null },
    updatedAt: { type: Date, default: new Date() },
  },
};

const apisSchema = new Schema(
  {
    name: {
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
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "projects", required: true },
  },
  {
    timestamps: true,
  }
);

apisSchema.index({ name: "text", userId: 1 });

const ApisModel = mongoose.models.apis || mongoose.model("apis", apisSchema);

export default ApisModel;
