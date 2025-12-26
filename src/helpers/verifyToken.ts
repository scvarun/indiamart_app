import { firebaseAuth } from "@/firebase/firebase-admin";
import { ApiError } from "@/models/ErrorResponse";

export async function verifyToken(token: string) {
  try {
    return await firebaseAuth.verifyIdToken(token);
  } catch (e) {
    throw new ApiError(e, 403, "Authentication error");
  }
}
