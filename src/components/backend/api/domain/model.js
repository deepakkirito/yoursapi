import mongoose from "mongoose";

const Schema = mongoose.Schema;

const domainsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "custom",
      enum: ["custom", "user"],
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
    updatedAt: {
      type: Date,
      default: new Date(),
    },
  },
  {
    timestamps: true,
  }
);

domainsSchema.index({ name: "text" });

const DomainsModel =
  mongoose.models?.domains || mongoose.model("domains", domainsSchema);

export default DomainsModel;
