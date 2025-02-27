import { NextResponse } from "next/server";

export const validateData = (data) => {
  try {
    if (!data) {
      return [];
    }

    const parsedData = JSON.parse(data);

    if (!Array.isArray(parsedData)) {
      return NextResponse.json(
        { message: "Data must be an array" },
        { status: 400 }
      );
    }

    if (
      !parsedData.every(
        (item) =>
          typeof item === "object" && item !== null && !Array.isArray(item)
      )
    ) {
      return NextResponse.json(
        { message: "Array must contain only objects" },
        { status: 400 }
      );
    }

    return parsedData;
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid JSON format" },
      { status: 400 }
    );
  }
};
