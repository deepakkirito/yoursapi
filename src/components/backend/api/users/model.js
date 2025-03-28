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
      default: () => convertToIST(new Date()),
    },
    createdAt: {
      type: Date,
      default: () => convertToIST(new Date()),
    },
    plan: {
      type: String,
      default: "free",
    },
    validity: {
      type: Date,
      default: () => convertToIST(new Date()),
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
    totalReq: {
      type: Number,
      default: 300,
    },
    usedReq: {
      type: Number,
      default: 0,
    },
    additionalReq: {
      type: Number,
      default: 0,
    },
    referralCode: {
      type: String,
      default: generateReferralCode,
    },
    referredBy: { type: Schema.Types.ObjectId, ref: "users", default: null },
    mongoDbKey: {
      type: String,
      default: null,
    },
    fetchData: {
      type: String,
      default: "self",
      enum: ["self", "master"],
    },
    project: [{ type: Schema.Types.ObjectId, ref: "projects" }],
    trash: [{ type: Schema.Types.ObjectId, ref: "projects" }],
    shared: [
      {
        permission: {
          type: String,
          default: "read",
          enum: ["read", "write", "admin", "custom"],
        },
        permissionDetails: {
          type: Map,
          of: String,
        },
        project: { type: Schema.Types.ObjectId, ref: "projects" },
        owner: { type: Schema.Types.ObjectId, ref: "users" },
        sharedBy: { type: Schema.Types.ObjectId, ref: "users" },
      },
    ],
    sharedUsers: [{ type: Schema.Types.ObjectId, ref: "users" }],
    lastReset: { type: Date, default: () => convertToIST(new Date()) }, // Track last reset time
  },
  {
    timestamps: true,
  }
);

// **Middleware to update timestamps**
usersSchema.pre("save", function (next) {
  if (this.createdAt) {
    this.createdAt = convertToIST(new Date(this.createdAt));
  }
  this.updatedAt = convertToIST(new Date());
  next();
});

usersSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: convertToIST(new Date()) });
  next();
});

// **Indexes for search and automatic reset cleanup**
usersSchema.index({ email: "text", referralCode: "text", username: "text" }); // Full-text search
// usersSchema.index({ lastReset: 1 }, { expireAfterSeconds: 86400 }); // TTL index for daily reset

const UsersModel =
  mongoose.models?.users || mongoose.model("users", usersSchema);

export default UsersModel;
