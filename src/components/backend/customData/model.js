import mongoose from "mongoose";

const Schema = mongoose.Schema;

const customDataSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  data: {
    type: Array,
    default: [],
  },
});

customDataSchema.index({ name: "text" });

const CustomDataModel =
  mongoose.models.customData || mongoose.model("customData", customDataSchema);

export default CustomDataModel;
