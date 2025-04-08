import mongoose from "mongoose";
import { convertToIST } from "@/utilities/helpers/functions";

const Schema = mongoose.Schema;

const subscriptionSchema = new Schema(
  {
    createdAt: {
      type: Date,
      default: new Date(),
    },
    updatedAt: {
      type: Date,
      default: new Date(),
    },
    status: {
      type: Boolean,
      default: true,
    },
    cpus: {
      data: {
        type: Number,
        default: 0,
      },
      description: {
        type: String,
        default: "",
      },
    },

    cpuType: {
      data: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        default: "",
      },
    },
    ram: {
      data: {
        type: Number,
        default: 0,
      },
      description: {
        type: String,
        default: "",
      },
    },
    disk: {
      type: Number,
      default: 0,
    },
    diskType: {
      type: String,
      default: "",
    },
    machineType: {
      data: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        default: "",
      },
    },
    bandwidth: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      required: true,
      enum: ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD", "INR"],
      default: "INR",
    },
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
