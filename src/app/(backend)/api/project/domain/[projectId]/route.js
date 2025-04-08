import DockersModel from "@/components/backend/api/docker/model";
import DomainsModel from "@/components/backend/api/domain/model";
import ProjectsModel from "@/components/backend/api/project/model";
import UsersModel from "@/components/backend/api/users/model";
import stopAndStartContainer from "@/components/backend/utilities/helpers/stopAndStartContainer";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { getProjectOwner } from "@/components/backend/utilities/middlewares/getProjectOwner";
import { logShared } from "@/components/backend/utilities/middlewares/logShared";
import { axiosPost } from "@/utilities/api";
import { NextResponse } from "next/server";

export async function HEAD(request, { params }) {
  try {
    const { projectId } = await params;
    const { userId } = await verifyToken(request);

    await getProjectOwner({ projectId, userId }); // Ensures user has access

    const searchParams = new URL(request.url).searchParams;
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json(
        { message: "Domain not provided" },
        { status: 400 }
      );
    }

    // Step 1: Check in DomainsModel
    const existingDomain = await DomainsModel.findOne({
      name: { $in: [domain, `${domain}-dev`] },
    }).lean();

    if (existingDomain) {
      return NextResponse.json(
        { message: "Domain already exists" },
        { status: 200 }
      );
    }

    // Step 2: Check for auto-generated project subdomain collisions
    const users = await UsersModel.find({})
      .populate("project", "name")
      .populate("trash", "name")
      .lean();

    const isDuplicate = users.some((user) => {
      const allProjects = [...(user.project || []), ...(user.trash || [])];
      return allProjects.some((project) => {
        const baseName = `${project.name}-${user.username}`;
        return [baseName, `${baseName}-dev`].includes(domain);
      });
    });

    if (isDuplicate) {
      return NextResponse.json(
        { message: "Domain already exists" },
        { status: 200 }
      );
    }

    // If not found anywhere
    return NextResponse.json({ message: "Domain not found" }, { status: 400 });
  } catch (error) {
    console.error("HEAD /domain-check error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { projectId } = await params;
    const { userId, body } = await verifyToken(request);
    const { ownerUserId, ownerUsername } = await getProjectOwner({
      projectId,
      userId,
    });
    const { domain, environment } = body;

    if (!domain) {
      return NextResponse.json(
        { message: "Please provide a domain" },
        { status: 400 }
      );
    }

    const project = await ProjectsModel.findOne({ _id: projectId })
      .populate("domains")
      .lean();

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 400 }
      );
    }

    // Step 1: Check if domain already exists in DomainsModel
    const domainExists = await DomainsModel.findOne({
      name: { $in: [domain, `${domain}-dev`] },
    }).lean();

    if (domainExists) {
      return NextResponse.json(
        { message: "Domain already exists" },
        { status: 400 }
      );
    }

    // Step 2: Check for auto-generated subdomain collisions
    const users = await UsersModel.find({})
      .populate("project", "name")
      .populate("trash", "name")
      .lean();

    const isDuplicate = users.some((user) => {
      const allProjects = [...(user.project || []), ...(user.trash || [])];
      return allProjects.some((project) => {
        const name = `${project.name}-${user.username}`;
        return [name, `${name}-dev`].includes(domain);
      });
    });

    if (isDuplicate) {
      return NextResponse.json(
        { message: "Domain already exists" },
        { status: 400 }
      );
    }

    // Step 3: Create domain
    const domainCreated = await DomainsModel.create({ name: domain });

    // Step 4: Add domain to the project
    await ProjectsModel.findByIdAndUpdate(
      projectId,
      { $push: { domains: domainCreated._id } },
      { new: true }
    );

    await stopAndStartContainer({
      ownerUsername,
      environment,
      projectId,
    });

    logShared({
      userId: ownerUserId,
      log: `Sub-domain added to project '${project.name}' for environment '${environment}' - name: ${domain}`,
      type: "project",
      projectId,
      authId: null,
      apiId: null,
      createdBy: userId,
      link: `/projects/${projectId}/server`,
      linkShared: `/projects/${projectId}/server`,
    });

    return NextResponse.json(
      { message: "Domain added successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { projectId } = await params;

    const { userId, token, email, name, role, body, username } =
      await verifyToken(request);

    const { ownerUserId, ownerUsername } = await getProjectOwner({
      projectId,
      userId,
    });

    const searchParams = new URL(request.url).searchParams;
    const domain = searchParams.get("domain");
    const environment = searchParams.get("environment") || "production";

    if (!domain) {
      return NextResponse.json(
        { message: "Please provide a domain" },
        { status: 400 }
      );
    }

    const domainExists = await DomainsModel.findOne({
      name: domain,
    }).lean();

    if (!domainExists) {
      return NextResponse.json(
        { message: "Domain not found" },
        { status: 400 }
      );
    }

    await ProjectsModel.findOneAndUpdate(
      { _id: projectId },
      {
        $pull: {
          domains: domainExists._id,
        },
      },
      { new: true, lean: true }
    );

    await DomainsModel.deleteOne({ name: domain });

    const project = await ProjectsModel.findOne({ _id: projectId })
      .populate("domains")
      .lean();

    await stopAndStartContainer({
      ownerUsername,
      projectId,
      environment,
    });

    logShared({
      userId: ownerUserId,
      log: `Sub-domain removed from project '${project.name}' for environment '${environment}' - name: ${domain}`,
      type: "project",
      projectId,
      authId: null,
      apiId: null,
      createdBy: userId,
      link: `/projects/${projectId}/server`,
      linkShared: `/projects/${projectId}/server`,
    });

    return NextResponse.json(
      { message: "Domain removed successfully" },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
