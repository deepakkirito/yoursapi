import mongoose from "mongoose";

const Schema = mongoose.Schema;

const locationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  ip: { type: String },
  browser: { type: String },
  os: { type: String },
  device: { type: String },
  country: { type: String },
  region: { type: String },
  city: { type: String },
  lat: { type: Number },
  lon: { type: Number },
});

locationSchema.index({
  userId: "text",
  ip: "text",
  browser: "text",
  os: "text",
  device: "text",
});

const LocationModel =
  mongoose.models.locations || mongoose.model("locations", locationSchema);

export default LocationModel;
