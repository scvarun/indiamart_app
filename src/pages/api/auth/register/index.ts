import type { NextApiRequest, NextApiResponse } from "next";
import { firebaseAuth, firestore } from "@/firebase/firebase-admin";
import { ErrorResponse, errorResponse } from "@/helpers/errorResponse";
import { plainToClass } from "class-transformer";
import { UserProfile } from "@/models/User";
import { validate } from "class-validator";
import { RegisterUserRes } from "@/models/dto/auth/RegisterUser";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterUserRes | ErrorResponse>
) {
  if (req.method === "POST") {
    return posthandler(req, res);
  } else {
    return res.status(404).write("Not Found");
  }
}
async function posthandler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterUserRes | ErrorResponse>
) {
  const body = JSON.parse(req.body);
  try {
    const userProfileBody = plainToClass(UserProfile, body);
    const errors = await validate(userProfileBody);
    if (errors.length) throw errors[0];
    userProfileBody.createdAt = new Date().toISOString();
    userProfileBody.updatedAt = new Date().toISOString();
    const userProfileCol = firestore
      .collection(UserProfile.collection)
      .withConverter(UserProfile.converter());
    const userProfileRef = await userProfileCol.add(
      userProfileBody
    );
    const userProfile = await userProfileRef.get();
    return res.status(200).json({
      message: "User registered successfully",
      userProfile: userProfile.data(),
    });
  } catch (e) {
    try {
      await firebaseAuth.deleteUser(body.uid);
    } catch (e) {
      console.error(e);
    }
    return errorResponse(e, res);
  }
}
