import mongoose from "mongoose";
import generator from "generate-password";

const Schema = mongoose.Schema;

// Generate a random referral code
const referralCode = generator.generate({
  length: 6,
  lowercase: true,
  numbers: true,
});

const usersSchema = new Schema({
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
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  plan: {
    type: String,
    default: "free",
  },
  validity: {
    type: Date,
    default: Date.now,
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
    default: referralCode,
  },
  referredBy: { type: Schema.Types.ObjectId, ref: "users", default: null },
  mongoDbKey: {
    type: String,
    default: null,
  },
  saveInternal: {
    type: Boolean,
    default: true,
  },
  saveExternal: {
    type: Boolean,
    default: false,
  },
  fetchData: {
    type: String,
    default: "self",
    enum: ["self", "user"],
  },
  project: [{ type: Schema.Types.ObjectId, ref: "projects" }],
  trash: [{ type: Schema.Types.ObjectId, ref: "projects" }],
  shared: [
    {
      permission: {
        type: String,
        default: "read",
        enum: ["read", "write", "admin"],
      },
      project: { type: Schema.Types.ObjectId, ref: "projects" },
      owner: { type: Schema.Types.ObjectId, ref: "users" },
      sharedBy: { type: Schema.Types.ObjectId, ref: "users" },
    },
  ],
  sharedUsers: [{ type: Schema.Types.ObjectId, ref: "users" }],
});

usersSchema.index({ email: "text", referralCode: "text", username: "text" });

const UsersModel =
  mongoose.models?.users || mongoose.model("users", usersSchema);

export default UsersModel;
