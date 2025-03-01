import { NextResponse } from "next/server";

export async function GET(req) {
  return NextResponse.json({ message: "Version 1 of platform youpi" });
}
