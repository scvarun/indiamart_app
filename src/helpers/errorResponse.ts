import { ApiError } from "@/models/ErrorResponse";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

export interface ErrorResponse {
  message: string;
}
export function errorResponse(e: unknown, res: NextApiResponse<ErrorResponse>) {
  let error: ApiError;
  if (e instanceof ApiError) {
    error = e;
  } else {
    error = new ApiError(e);
  }
  return res.status(error.statusCode).json({ message: error.message });
}

export function errorResponseMiddleware(e: unknown) {
  let error: ApiError;
  if (e instanceof ApiError) {
    error = e;
  } else {
    error = new ApiError(e);
  }
  return NextResponse.json(JSON.stringify({ message: error.message }), {
    status: error.statusCode,
    headers: { 'content-type': 'application/json' },
  });
}
