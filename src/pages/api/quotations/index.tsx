import { ErrorResponse, errorResponse } from "@/helpers/errorResponse";
import { verifyToken } from "@/helpers/verifyToken";
import { firestore } from "@/firebase/firebase-admin";
import { NextApiRequest, NextApiResponse } from "next";
import { Quotation } from "@/models/Quotation";
import { pageFromQuery } from "@/models/QueryObject";
import { GetQuotationRes } from "@/models/dto/quotations/GetQuotations";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetQuotationRes | ErrorResponse>
) {
  if (req.method === "GET") return getQuotationListings(req, res);
  res.status(404).write("Not Found");
}

async function getQuotationListings(
  req: NextApiRequest,
  res: NextApiResponse<GetQuotationRes | ErrorResponse>
) {
  try {
    const pages = pageFromQuery(req.query);
    const decoded = await verifyToken(req.headers.authorization || "");
    const quotationsCol = firestore
      .collection(Quotation.collection)
      .withConverter(Quotation.converter());
    const query = quotationsCol.where(
      "participants",
      "array-contains",
      decoded.uid
    ).orderBy('createdAt');
    const total = (await query.count().get()).data().count;
    const quotationsRef = query
      .limit(pages.limit)
      .offset((pages.page - 1) * pages.limit);
    const quotations = (await quotationsRef.get()).docs.map((e) => e.data());
    return res.status(200).json({
      quotations,
      total,
    });
  } catch (e) {
    return errorResponse(e, res);
  }
}
