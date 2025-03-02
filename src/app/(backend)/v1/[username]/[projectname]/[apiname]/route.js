import { deleteDataHandler } from "@/components/backend/controller/data/delete";
import { getDataHandler } from "@/components/backend/controller/data/get";
import { headDataHandler } from "@/components/backend/controller/data/head";
import { patchDataHandler } from "@/components/backend/controller/data/patch";
import { postDataHandler } from "@/components/backend/controller/data/post";
import { putDataHandler } from "@/components/backend/controller/data/put";
import { checkRequest } from "@/components/backend/utilities/middlewares/checkRequest";
import { NextResponse } from "next/server";

export async function HEAD(req, { params }) {
  try {
    const { username, projectname, apiname } = await params;

    // Validate request
    const check = await checkRequest({
      username,
      projectname,
      apiname,
      reqType: "headRequest",
    });
    if (!["auth", "data"].includes(check)) return check;

    if (check === "data")
      return await headDataHandler({
        req,
        username,
        projectname,
        apiname,
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
    const { username, projectname, apiname } = await params;

    // Validate the request
    const check = await checkRequest({
      username,
      projectname,
      apiname,
      reqType: "getRequest",
    });

    if (!["auth", "data"].includes(check)) return check;

    if (check === "data")
      return await getDataHandler({
        req,
        username,
        projectname,
        apiname,
      });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req, { params }) {
  try {
    const { username, projectname, apiname } = await params;

    // Validate request
    const check = await checkRequest({
      username,
      projectname,
      apiname,
      reqType: "postRequest",
    });

    if (!["auth", "data"].includes(check)) return check;

    if (check === "data")
      return await postDataHandler({
        req,
        username,
        projectname,
        apiname,
      });
  } catch (error) {
    console.error("Insert Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { username, projectname, apiname } = await params;

    // Validate request
    const check = await checkRequest({
      username,
      projectname,
      apiname,
      reqType: "putRequest",
    });

    if (!["auth", "data"].includes(check)) return check;

    if (check === "data")
      return await putDataHandler({
        req,
        username,
        projectname,
        apiname,
      });
  } catch (error) {
    console.error("Replace Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const { username, projectname, apiname } = await params;

    // Validate request
    const check = await checkRequest({
      username,
      projectname,
      apiname,
      reqType: "patchRequest",
    });

    if (!["auth", "data"].includes(check)) return check;

    if (check === "data")
      return await patchDataHandler({
        req,
        username,
        projectname,
        apiname,
      });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { username, projectname, apiname } = await params;

    // Validate request
    const check = await checkRequest({
      username,
      projectname,
      apiname,
      reqType: "deleteRequest",
    });

    if (!["auth", "data"].includes(check)) return check;

    if (check === "data")
      return await deleteDataHandler({
        req,
        username,
        projectname,
        apiname,
      });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
