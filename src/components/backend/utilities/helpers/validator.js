import { validationResult } from "express-validator";
import { NextResponse } from "next/server";

export async function validateRequest(req, validations) {
  await Promise.all(
    validations.map((validation) => validation.run(req))
  );

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return NextResponse.json({ errors: errors.array() }, { status: 422 });
  }

  return null; // No errors
}
