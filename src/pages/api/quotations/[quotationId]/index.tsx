import { ErrorResponse, errorResponse } from "@/helpers/errorResponse";
import { verifyToken } from "@/helpers/verifyToken";
import { firestore } from "@/firebase/firebase-admin";
import { NextApiRequest, NextApiResponse } from "next";
import { Quotation } from "@/models/Quotation";

type Data = {
  quotation: Quotation;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | ErrorResponse>
) {
  if (req.method === "GET") return getQuotation(req, res);
  res.status(404).write("Not Found");
}

async function getQuotation(
  req: NextApiRequest,
  res: NextApiResponse<Data | ErrorResponse>
) {
  try {
    if (typeof req.query.quotationId !== "string") {
      throw new Error("Invalid id");
    }
    await verifyToken(req.headers.authorization || "");
    const quotationsCol = firestore
      .collection(Quotation.collection)
      .withConverter(Quotation.converter());
    const quotation = (
      await quotationsCol.doc(req.query.quotationId).get()
    ).data();
    if (!quotation) {
      throw new Error("Quotation not found");
    }
    return res.status(200).json({
      quotation,
    });
  } catch (e) {
    return errorResponse(e, res);
  }
}
