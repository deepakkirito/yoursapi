import UsersModel from "@/components/backend/api/users/model";
import { checkRequest } from "@/components/backend/utilities/middlewares/checkRequest";
import { NextResponse } from "next/server";
import { getDataDynamicHandler } from "@/components/backend/controller/data/get";
import { headDataDynamicHandler } from "@/components/backend/controller/data/head";
import { putDataDynamicHandler } from "@/components/backend/controller/data/put";
import { patchDataDynamicHandler } from "@/components/backend/controller/data/patch";
import { deleteDataDynamicHandler } from "@/components/backend/controller/data/delete";

export async function HEAD(req, { params }) {
  try {
    const { username, projectname, apiname, id } = await params;

    // Validate request
    const check = await checkRequest({
      username,
      projectname,
      apiname,
      reqType: "headRequest",
    });

    if (!["auth", "data"].includes(check)) return check;

    if (check === "data")
      return await headDataDynamicHandler({
        req,
        username,
        projectname,
        apiname,
        id,
      });
  } catch (error) {
    console.error("HEAD API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req, { params }) {
  try {
    const { username, projectname, apiname, id } = await params;

    // ✅ Check request validity
    const check = await checkRequest({
      username,
      projectname,
      apiname,
      reqType: "getRequest",
    });

    if (!["auth", "data"].includes(check)) return check;

    if (check === "data")
      return await getDataDynamicHandler({
        req,
        username,
        projectname,
        apiname,
        id,
      });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { username, projectname, apiname, id } = await params;
    const check = await checkRequest({
      username,
      projectname,
      apiname,
      reqType: "putRequest",
    });
    if (!["auth", "data"].includes(check)) return check;

    if (check === "data")
      return await putDataDynamicHandler({
        req,
        username,
        projectname,
        apiname,
        id,
      });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const { username, projectname, apiname, id } = await params;
    const check = await checkRequest({
      username,
      projectname,
      apiname,
      reqType: "patchRequest",
    });
    if (!["auth", "data"].includes(check)) return check;

    if (check === "data")
      return await patchDataDynamicHandler({
        req,
        username,
        projectname,
        apiname,
        id,
      });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { username, projectname, apiname, id } = await params;
    const check = await checkRequest({
      username,
      projectname,
      apiname,
      reqType: "deleteRequest",
    });
    if (!["auth", "data"].includes(check)) return check;

    if (check === "data")
      return await deleteDataDynamicHandler({
        req,
        username,
        projectname,
        apiname,
        id,
      });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
