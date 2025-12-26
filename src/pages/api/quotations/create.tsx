import "reflect-metadata";
import type { NextApiRequest, NextApiResponse } from "next";
import { CreateQuotationReq, CreateQuotationRes } from "@/models/dto/quotations/CreateQuotation";
import { verifyToken } from "@/helpers/verifyToken";
import { errorResponse, ErrorResponse } from "@/helpers/errorResponse";
import { firestore } from "@/firebase/firebase-admin";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { UserProfile } from "@/models/User";
import { Quotation } from "@/models/Quotation";
import { Timestamp } from "firebase/firestore";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateQuotationRes | ErrorResponse>
) {
  if (req.method === "POST") return postCreateQuotation(req, res);
  res.status(404).write("Not Found");
}

async function postCreateQuotation(
  req: NextApiRequest,
  res: NextApiResponse<CreateQuotationRes | ErrorResponse>
) {
  try {
    const decoded = await verifyToken(req.headers.authorization || "");
    const body = plainToClass(CreateQuotationReq, JSON.parse(req.body));
    const userProfileCol = firestore
      .collection(UserProfile.collection)
      .withConverter(UserProfile.converter());
    const userProfile = (
      await userProfileCol.where("uid", "==", decoded.uid).get()
    ).docs[0];
    body.userName = userProfile.data().firstName + " " + userProfile.data().lastName;
    body.createdAt = Timestamp.fromDate(new Date);
    const errors = await validate(body);
    if (errors.length) throw errors[0];
    const quotationCol = firestore
      .collection(Quotation.collection)
      .withConverter(Quotation.converter());
    const quotationRef = await quotationCol.add(
      JSON.parse(JSON.stringify(body))
    );
    await userProfile.ref.update({
      quotations: [...(userProfile.data().quotations || []), quotationRef.id],
      updatedAt: new Date().toISOString(),
    });
    const quotation = (await quotationRef.get()).data();
    if(!quotation) throw new Error('Quotation not found');
    return res.status(200).json({
      message: "Listing created successfully",
      quotation,
    });
  } catch (e) {
    return errorResponse(e, res);
  }
}
