import mongoose from "mongoose";

const Schema = mongoose.Schema;

const dockerSchema = new Schema(
  {
    name: String,
    containerId: String,
    logs: [
      {
        timestamp: { type: Date, default: Date.now },
        cpu: {
          total: Number,
          user: Number,
          sys: Number,
        },
        memory: {
          usage: Number, // in bytes
          limit: Number,
          percent: Number,
        },
        network: {
          rx: Number, // bytes received
          tx: Number, // bytes sent
        },
        diskIO: {
          read: Number, // bytes
          write: Number,
        },
        processes: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

dockerSchema.index({ containerId: "text" });

const DockersModel =
  mongoose.models?.dockers || mongoose.model("dockers", dockerSchema);

export default DockersModel;
