import LocationModel from "@/components/backend/api/location/model";
import LoggersModel from "@/components/backend/api/logger";
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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/utilities/helpers/firebaseConfig";
import SubscriptionModel from "@/components/backend/api/subscription/model";

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
        credits: 1,
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

    const validator = await validateRequest(
      { ...request, body },
      updateUserValidator
    );

    if (validator) {
      return validator;
    }

    const {
      username,
      name: newName,
      newPassword,
      profile,
      oldPassword,
      referralCode,
    } = body;

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

      await UsersModel.findOneAndUpdate(
        { _id: user._id },
        { $set: { password } },
        { new: true, lean: true }
      );

      return NextResponse.json(
        { message: "Password updated successfully" },
        {
          status: 200,
        }
      );
    }

    // Update profile picture or name
    if (profile || newName) {
      var downloadURL = "";
      if (profile) {
        const base64ToBlob = (base64String) => {
          const byteCharacters = atob(base64String.split(",")[1]); // Remove "data:image/jpeg;base64,"
          const byteArrays = [];

          for (let i = 0; i < byteCharacters.length; i++) {
            byteArrays.push(byteCharacters.charCodeAt(i));
          }

          return new Blob([new Uint8Array(byteArrays)], { type: "image/jpeg" }); // Adjust MIME type if needed
        };

        const fileBlob = base64ToBlob(profile);
        const fileRef = ref(storage, `profile-images/${user.email}`);

        const snapshot = await uploadBytes(fileRef, fileBlob);
        downloadURL = await getDownloadURL(snapshot.ref);
      }

      const updatedUser = await UsersModel.findOneAndUpdate(
        { _id: userId },
        {
          $set: {
            profile: downloadURL || user.profile,
            name: newName || user.name,
          },
        },
        { new: true, lean: true }
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
      if (user.username !== "") {
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
      }

      const updatedUser = await UsersModel.findOneAndUpdate(
        { _id: userId },
        {
          $set: {
            username,
          },
        }
      );

      if (referralCode) {
        const user = await UsersModel.findOneAndUpdate(
          { _id: userId },
          {
            $set: {
              referralCode: referralCode,
            },
          },
          { new: true }
        );

        await UsersModel.findOneAndUpdate(
          { referralCode },
          {
            $push: { referredUsers: userId },
          },
          { new: true }
        );
      }

      const response = NextResponse.json(
        { message: "Username updated successfully" },
        {
          status: 200,
        }
      );

      return response;
    }

    const getMessage = () => {
      if (newName) {
        return `Name ${user.name} updated to ${newName}`;
      }

      if (profile) {
        return `Profile updated`;
      }

      if (newPassword) {
        return `Password updated`;
      }

      if (username && !referralCode) {
        return `Username ${user.username} updated to ${username}`;
      }

      if (username && referralCode) {
        return `Username ${user.username} updated to ${username} and referral code updated to ${referralCode}`;
      }

      return "Invalid option triggered";
    };

    await LoggersModel.create({
      userId: userId,
      type: "user",
      createdBy: userId,
      log: getMessage(),
    });

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
