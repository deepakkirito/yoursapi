import LocationModel from "@/components/backend/api/location/model";
import ProjectsModel from "@/components/backend/api/project/model";
import SessionsModel from "@/components/backend/api/session/model";
import UsersModel from "@/components/backend/api/users/model";
import { updateUserValidator } from "@/components/backend/api/users/validator";
import generateToken from "@/components/backend/utilities/helpers/generateToken";
import {
  comparePassword,
  hashPassword,
} from "@/components/backend/utilities/helpers/password";
import { getSessionDetails } from "@/components/backend/utilities/helpers/session";
import { validateRequest } from "@/components/backend/utilities/helpers/validator";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { redirectToLogin } from "@/components/backend/utilities/middlewares/customResponse";
import { copyDatabase } from "@/components/backend/utilities/middlewares/mongoose";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId, token, email, name, role } = await verifyToken(request);

    const user = await UsersModel.findOne(
      { _id: userId },
      {
        _id: 1,
        name: 1,
        email: 1,
        profile: 1,
        username: 1,
        totalReq: 1,
        plan: 1,
        validity: 1,
        usedReq: 1,
        additionalReq: 1,
      }
    );

    if (!user) {
      return redirectToLogin(request);
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const {
      userId,
      token: oldToken,
      email,
      name,
      role,
      body,
      username: oldUsername,
    } = await verifyToken(request);

    const validator = await validateRequest(request, updateUserValidator);

    if (validator) {
      return validator;
    }

    const { username, name: newName, newPassword, profile, oldPassword } = body;

    const user = await UsersModel.findOne({ _id: userId });

    if (!user) {
      return redirectToLogin(request);
    }

    // Update password
    if (newPassword && oldPassword) {
      const isMatch = await comparePassword(oldPassword, user.password);

      if (!isMatch) {
        return NextResponse.json(
          { message: "Invalid old password" },
          { status: 400 }
        );
      }

      const isMatch2 = await comparePassword(newPassword, user.password);

      if (isMatch2) {
        return NextResponse.json(
          { message: "New password cannot be same as old password" },
          { status: 400 }
        );
      }

      const password = await hashPassword(newPassword);

      await UsersModel.updateOne({ _id: userId }, { $set: { password } });

      return NextResponse.json(
        { message: "Password updated successfully" },
        {
          status: 200,
        }
      );
    }

    // Update profile picture or name
    if (profile || newName) {
      const updatedUser = await UsersModel.updateOne(
        { _id: userId },
        {
          $set: {
            profile: profile || user.profile,
            name: newName || user.name,
          },
        }
      );

      return NextResponse.json(
        { message: `${profile ? "Profile" : "Name"} updated successfully` },
        {
          status: 200,
        }
      );
    }

    // Update username
    if (username) {
      const projects = await ProjectsModel.find(
        { userId },
        { name: 1, apiIds: 1 }
      ).populate("apiIds");

      if (!projects?.length) {
        return NextResponse.json(
          { message: "Projects not found" },
          { status: 400 }
        );
      }

      await Promise.all(
        projects.map(async (project) => {
          await copyDatabase({
            oldDbName: `${oldUsername}_${project.name.toLowerCase()}`,
            newDbName: `${username}_${project.name.toLowerCase()}`,
            dropOldDb: true,
          });
        })
      );

      const updatedUser = await UsersModel.findOneAndUpdate(
        { _id: userId },
        {
          $set: {
            username,
          },
        }
      );

      const token = generateToken(
        updatedUser,
        process.env.AUTH_EXPIRES_REMEMBER
      );

      await SessionsModel.findOneAndUpdate(
        { jwt: oldToken.value },
        { $set: { jwt: token } },
        { new: true }
      );

      const response = NextResponse.json(
        { message: "Username updated successfully" },
        {
          status: 200,
        }
      );

      response.cookies.set("accessToken", token, {
        httpOnly: true, // Prevent client-side access
        secure: process.env.NODE_ENV === "production", // Secure in production
        maxAge: process.env.AUTH_EXPIRES_REMEMBER,
        path: "/",
        sameSite: "lax", // Strictly follow the same-site cookie policy
      });

      return response;
    }

    // Default response if no conditions are met
    return NextResponse.json(
      { message: "No valid fields to update" },
      { status: 400, statusText: "Bad Request" }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
