import mongoose from "mongoose";

const Schema = mongoose.Schema;

const projectsSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
  updatedBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
  apiIds: [{ type: Schema.Types.ObjectId, ref: "apis" }],
  shared: [{ type: Schema.Types.ObjectId, ref: "users" }],
  authId: { type: Schema.Types.ObjectId, ref: "auths" },
},{
  timestamps: true,
});

projectsSchema.index({ name: "text", userId: "text" });

const ProjectsModel =
  mongoose.models.projects || mongoose.model("projects", projectsSchema);

export default ProjectsModel;
