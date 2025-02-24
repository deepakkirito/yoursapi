import mongoose from "mongoose";

const Schema = mongoose.Schema;

const sessionsSchema = new Schema({
  jwt: {
    type: String,
    required: true,
  },
  userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
  location: { type: Schema.Types.ObjectId, ref: "locations" },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
});

sessionsSchema.index({ jwt: "text", userId: "text" });

const SessionsModel =
  mongoose.models?.sessions || mongoose.model("sessions", sessionsSchema);

export default SessionsModel;
