import mongoose from "mongoose";

const Schema = mongoose.Schema;

const statisticsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    totalUsed: { type: Number, default: 0 },
    projectsUsed: [
      {
        name: { type: Schema.Types.ObjectId, ref: "projects", required: true },
        apiUsed: [
          {
            name: { type: Schema.Types.ObjectId, ref: "apis" },
            headUsed: { type: Number, default: 0 },
            getUsed: { type: Number, default: 0 },
            postUsed: { type: Number, default: 0 },
            putUsed: { type: Number, default: 0 },
            patchUsed: { type: Number, default: 0 },
            deleteUsed: { type: Number, default: 0 },
          },
        ],
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

statisticsSchema.index({ userId: 1, createdAt: 1 });

const StatisticsModel =
  mongoose.models.statistics || mongoose.model("statistics", statisticsSchema);

export default StatisticsModel;
