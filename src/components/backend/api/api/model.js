import mongoose from "mongoose";

const Schema = mongoose.Schema;

const apisSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
    getRequest: {
      used: {
        type: Number,
        default: 0,
      },
      active: {
        type: Boolean,
        default: true,
      },
    },
    postRequest: {
      used: {
        type: Number,
        default: 0,
      },
      active: {
        type: Boolean,
        default: true,
      },
    },
    putRequest: {
      used: {
        type: Number,
        default: 0,
      },
      active: {
        type: Boolean,
        default: true,
      },
    },
    deleteRequest: {
      used: {
        type: Number,
        default: 0,
      },
      active: {
        type: Boolean,
        default: true,
      },
    },
    headRequest: {
      used: {
        type: Number,
        default: 0,
      },
      active: {
        type: Boolean,
        default: true,
      },
    },
    patchRequest: {
      used: {
        type: Number,
        default: 0,
      },
      active: {
        type: Boolean,
        default: true,
      },
    },
    schema: {
      type: Object,
      default: null,
    },
    strict: {
      type: Boolean,
      default: false,
    },
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "projects", required: true },
    logs: [
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
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

apisSchema.index({ name: "text", userId: 1 });

const ApisModel = mongoose.models.apis || mongoose.model("apis", apisSchema);

export default ApisModel;
