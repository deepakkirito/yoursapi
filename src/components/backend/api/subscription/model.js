import mongoose from "mongoose";
import { convertToIST } from "@/utilities/helpers/functions";

const Schema = mongoose.Schema;

const subscriptionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: () => convertToIST(new Date()),
    },
    updatedAt: {
      type: Date,
      default: () => convertToIST(new Date()),
    },
    status: {
      type: Boolean,
      default: true,
    },
    requests: {
      type: Number,
      default: 0,
    },
    ramLimit: {
      type: Number,
      default: 2048,
    },
    cpuLimit: {
      type: Number,
      default: 1,
    },
    projectLimit: {
      type: Number,
      default: null,
    },
    apiLimit: {
      type: Number,
      default: null,
    },
    price: [
      {
        value: {
          type: Number,
          default: 0,
        },
        currency: {
          type: String,
          default: "INR",
        },
        type: {
          type: String,
          default: "monthly",
          enum: ["monthly", "yearly", "quarterly"],
        },
        discount: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({ name: "text" });

const SubscriptionModel =
  mongoose.models?.subscriptions ||
  mongoose.model("subscriptions", subscriptionSchema);

export default SubscriptionModel;
