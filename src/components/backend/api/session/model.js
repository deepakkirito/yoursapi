import { convertToIST } from "@/utilities/helpers/functions";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const sessionsSchema = new Schema(
  {
    jwt: {
      type: String,
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    location: { type: Schema.Types.ObjectId, ref: "locations" },
    createdAt: {
      type: Date,
      default: () => convertToIST(new Date()), // Store in IST
    },
    lastActive: {
      type: Date,
      default: () => convertToIST(new Date()), // Store in IST
    },
  },
  {
    timestamps: true, // Disable Mongoose default timestamps
  }
);

// Middleware to update `lastActive` before update
sessionsSchema.pre("findOneAndUpdate", function (next) {
  if (this.createdAt) {
    this.createdAt = convertToIST(new Date(this.createdAt));
  }
  this.set({ lastActive: convertToIST(new Date()) });
  next();
});

sessionsSchema.index({ jwt: "text", userId: 1 });

const SessionsModel =
  mongoose.models?.sessions || mongoose.model("sessions", sessionsSchema);

export default SessionsModel;
