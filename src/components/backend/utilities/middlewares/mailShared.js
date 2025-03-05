import ProjectsModel from "../../api/project/model";
import { sendMail } from "../nodemailer";

export const mailShared = async ({
  userEmail,
  subject,
  template,
  context,
  projectId,
  apiName,
  apiLink,
  apiLinkShared,
}) => {
  const project = await ProjectsModel.findOne({ _id: projectId })
    .populate("shared", "name email")
    .populate("userId", "name email")
    .lean();

  let userIds = [];

  if (userEmail === project.userId.email) {
    userIds = project.shared;
  } else {
    userIds = [
      {
        name: project.userId.name,
        email: project.userId.email,
      },
      ...project.shared.filter((s) => s.email !== userEmail),
    ];
  }

  Promise.all(
    userIds.map(async (user) => {
      await sendMail({
        userEmail: user.email,
        subject,
        template,
        context: {
          username: user.name,
          projectName: project.name,
          apiName,
          apiLink:
            userEmail === project.userId.email
              ? apiLinkShared
              : user.email === project.userId.email
                ? apiLink
                : apiLinkShared,
        },
      });
    })
  );
};
