import { axiosPost } from "@/utilities/api";
import DockersModel from "../../api/docker/model";
import ProjectsModel from "../../api/project/model";
import SubscriptionModel from "../../api/subscription/model";

export default async function stopAndStartContainer({
  ownerUsername,
  projectId,
  environment,
}) {
  try {
    const project = await ProjectsModel.findOne({
      _id: projectId,
    })
    .populate("domains")
    .lean();

    if (project.data[environment].instance.status) {
      const subscriptionId = project.data[environment].activeSubscription.data;

      const subscription = await SubscriptionModel.findOne({
        _id: subscriptionId,
      }).lean();

      await axiosPost("/docker/stop/instance", {
        username: ownerUsername,
        projectName: project.name,
        environment,
        containerId: project.data[environment].instance.containerId,
      });

      await ProjectsModel.findOneAndUpdate(
        { _id: projectId },
        {
          $set: {
            [`data.${environment}.instance.status`]: false,
            [`data.${environment}.instance.updatedAt`]: new Date(),
            [`data.${environment}.instance.containerId`]: null,
          },
        },
        { new: true, lean: true }
      );

      const docker = await axiosPost("/docker/start/instance", {
        username: ownerUsername,
        projectName: project.name,
        environment,
        config: {
          additionalConfig: {
            memoryLimit: subscription.ram.data * 1024 + "m",
            cpuLimit: subscription.cpus.data.toString(),
          },
        },
        customDomains:
          project?.domains.filter((item) => item.type === "custom") || [],
        userDomain:
          project.domains.find((item) => item.type === "user") || null,
      });

      await DockersModel.findOneAndUpdate(
        {
          containerId: project.data[environment].instance.containerId,
        },
        {
          containerId: docker.data.containerId,
        },
        { new: true, lean: true }
      );

      await ProjectsModel.findOneAndUpdate(
        { _id: projectId },
        {
          $set: {
            [`data.${environment}.instance.status`]: true,
            [`data.${environment}.instance.updatedAt`]: new Date(),
            [`data.${environment}.instance.containerId`]:
              docker.data.containerId,
          },
        }
      );
    }
  } catch (err) {
    throw err;
  }
}
