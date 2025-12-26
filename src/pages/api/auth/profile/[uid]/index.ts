import { firestore } from "@/firebase/firebase-admin";
import { ErrorResponse, errorResponse } from "@/helpers/errorResponse";
import { verifyToken } from "@/helpers/verifyToken";
import { UserProfile } from "@/models/User";
import { NextApiRequest, NextApiResponse } from "next";

type Data = {
  userProfile: UserProfile;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | ErrorResponse>
) {
  if (req.method === "GET") return getUserProfile(req, res);
  res.status(404).write("Not Found");
}

async function getUserProfile(
  req: NextApiRequest,
  res: NextApiResponse<Data | ErrorResponse>
) {
  try {
    await verifyToken(req.headers.authorization || "");
    const { uid } = req.query;
    if (typeof uid !== "string") throw new Error("Invalid id");
    const userProfileCol = firestore
      .collection(UserProfile.collection)
      .withConverter<UserProfile>(UserProfile.converter());
    const userProfile = (await userProfileCol.where("uid", "==", uid).get())
      .docs;
    if (!userProfile.length) throw new Error("User not found for provided uid");
    return res.status(200).json({
      userProfile: userProfile[0].data(),
    });
  } catch (e) {
    return errorResponse(e, res);
  }
}
