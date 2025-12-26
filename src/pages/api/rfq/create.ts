import "reflect-metadata";
import type { NextApiRequest, NextApiResponse } from "next";
import { CreateRFQReq, CreateRFQRes } from "@/models/dto/rfq/CreateRFQ";
import { verifyToken } from "@/helpers/verifyToken";
import { errorResponse, ErrorResponse } from "@/helpers/errorResponse";
import { firestore } from "@/firebase/firebase-admin";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { RFQPart } from "@/models/RFQPart";
import { UserProfile } from "@/models/User";
import { Timestamp } from "firebase/firestore";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateRFQRes | ErrorResponse>
) {
  if (req.method === "POST") return postCreateRFQ(req, res);
  res.status(404).write("Not Found");
}

async function postCreateRFQ(
  req: NextApiRequest,
  res: NextApiResponse<CreateRFQRes | ErrorResponse>
) {
  try {
    const decoded = await verifyToken(req.headers.authorization || "");
    const body = plainToClass(CreateRFQReq, JSON.parse(req.body));
    const errors = await validate(body);
    if (errors.length) throw errors[0];
    body.parts = body.parts.map((e) => {
      delete e.id;
      e.uid = decoded.uid;
      e.createdAt = Timestamp.fromDate(new Date());
      return e;
    });
    const rfqPartsCol = firestore
      .collection(RFQPart.collection)
      .withConverter(RFQPart.converter());
    const userProfileCol = firestore
      .collection(UserProfile.collection)
      .withConverter(UserProfile.converter());
    const userProfile = (
      await userProfileCol.where("uid", "==", decoded.uid).get()
    ).docs[0];
    const rfq_parts_id = userProfile.data().rfq_parts || [];
    const rfq_parts: RFQPart[] = [];
    for (var i = 0; i < body.parts.length; i++) {
      const rfqRef = await rfqPartsCol.add(
        JSON.parse(JSON.stringify(body.parts[i]))
      );
      const rfq = (await rfqRef.get()).data();
      if (rfq) {
        rfq_parts.push(rfq);
      }
      rfq_parts_id.push(rfqRef.id);
    }
    return res.status(200).json({
      message: "RFQ created successfully",
      rfqs: rfq_parts,
    });
  } catch (e) {
    return errorResponse(e, res);
  }
}
