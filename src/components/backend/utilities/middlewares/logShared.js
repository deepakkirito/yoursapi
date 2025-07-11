import LoggersModel from "../../api/logger";
import ProjectsModel from "../../api/project/model";

export const logShared = async ({
  userId,
  log,
  type,
  projectId,
  authId,
  apiId,
  createdBy,
  link,
  linkShared,
}) => {
  const project = await ProjectsModel.findOne({ _id: projectId }).lean();

  let userIds = [userId, ...(project?.shared ?? [])];

  // if (userId.toString() === createdBy.toString()) {
  //   userIds = project.shared;
  // } else {
  //   userIds = [
  //     userId,
  //     ...project.shared.filter((s) => s.toString() !== createdBy.toString()),
  //   ];
  // }

  Promise.all(
    userIds.map(async (user) => {
      await LoggersModel.create({
        userId: user,
        log,
        type,
        projectId,
        authId,
        apiId,
        createdBy,
        link: userId.toString() === user.toString() ? link : linkShared,
        updatedAt: new Date(),
        createdAt: new Date(),
      });
    })
  );
};
