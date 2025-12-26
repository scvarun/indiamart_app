import { firestore } from "@/firebase/firebase-admin";
import { ErrorResponse, errorResponse } from "@/helpers/errorResponse";
import { verifyToken } from "@/helpers/verifyToken";
import { ApiError } from "@/models/ErrorResponse";
import { UserProfile } from "@/models/User";
import { GetProfileRes } from "@/models/dto/auth/GetProfile";
import {
  PostSaveProfileReq,
  PostSaveProfileRes,
} from "@/models/dto/auth/SaveProfile";
import { instanceToPlain, plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any | ErrorResponse>
) {
  if (req.method === "GET") return getUserProfile(req, res);
  if (req.method === "POST") return saveUserProfile(req, res);
  res.status(404).write("Not Found");
}

async function getUserProfile(
  req: NextApiRequest,
  res: NextApiResponse<GetProfileRes | ErrorResponse>
) {
  try {
    const decoded = await verifyToken(req.headers.authorization || "");
    const userProfileCol = firestore
      .collection(UserProfile.collection)
      .withConverter<UserProfile>(UserProfile.converter());
    const userProfileQuery = (
      await userProfileCol.where("uid", "==", decoded.uid).get()
    ).docs;
    if (!userProfileQuery.length) throw new Error("User not found for provided uid");
    const userProfile = userProfileQuery[0].data();
    
    return res.status(200).json({
      userProfile: userProfileQuery[0].data(),
    });
  } catch (e) {
    return errorResponse(e, res);
  }
}

async function saveUserProfile(
  req: NextApiRequest,
  res: NextApiResponse<PostSaveProfileRes | ErrorResponse>
) {
  try {
    const body = plainToClass(PostSaveProfileReq, JSON.parse(req.body));
    const errors = await validate(body);
    if (errors.length) throw errors[0];
    const decoded = await verifyToken(req.headers.authorization || "");
    const { uid } = decoded;
    if (typeof uid !== "string") throw new Error("Invalid id");
    const userProfileCol = firestore
      .collection(UserProfile.collection)
      .withConverter<UserProfile>(UserProfile.converter());
    const userProfiles = (await userProfileCol.where("uid", "==", uid).get())
      .docs;
    if (!userProfiles.length)
      throw new Error("User not found for provided uid");
    const userProfile = userProfiles.at(0);
    if (!userProfile) throw new ApiError(new Error("User not found"), 404);
    await userProfile.ref.update(instanceToPlain(body));
    const updateUserProfile = (await userProfile.ref.get()).data();
    if (!updateUserProfile) throw new ApiError(Error("User not found"), 404);
    return res.status(200).json({
      user: updateUserProfile,
    });
  } catch (e) {
    return errorResponse(e, res);
  }
}
