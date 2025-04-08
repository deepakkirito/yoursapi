import mongoose from "mongoose";
import generator from "generate-password";
import { convertToIST } from "@/utilities/helpers/functions";

const Schema = mongoose.Schema;

// Function to generate a random referral code
const generateReferralCode = () =>
  generator.generate({
    length: 6,
    lowercase: true,
    numbers: true,
  });

const usersSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    updatedAt: {
      type: Date,
      default: new Date(),
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
    role: {
      type: String,
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profile: {
      type: String,
      default: "https://cdn-icons-png.freepik.com/512/11390/11390805.png",
    },
    referralCode: {
      type: String,
      default: generateReferralCode,
    },
    referredUsers: [{ type: Schema.Types.ObjectId, ref: "users"}],
    project: [{ type: Schema.Types.ObjectId, ref: "projects" }],
    trash: [{ type: Schema.Types.ObjectId, ref: "projects" }],
    shared: [
      {
        permission: {
          type: Schema.Types.ObjectId,
          ref: "permissions",
        },
        project: { type: Schema.Types.ObjectId, ref: "projects" },
        owner: { type: Schema.Types.ObjectId, ref: "users" },
        sharedBy: { type: Schema.Types.ObjectId, ref: "users" },
      },
    ],
    sharedUsers: [{ type: Schema.Types.ObjectId, ref: "users" }],
    lastReset: { type: Date, default: new Date() },
    credits: {
      data: {
        type: Number,
        default: 50000,
      },
      updatedAt: {
        type: Date,
        default: new Date(),
      },
      timeline: [
        {
          createdAt: { type: Date, default: new Date() },
          value: { type: Number, default: 0 },
          transactionId: { type: String, default: null },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

usersSchema.index({ email: "text", referralCode: "text", username: "text" });

const UsersModel =
  mongoose.models?.users || mongoose.model("users", usersSchema);

export default UsersModel;
