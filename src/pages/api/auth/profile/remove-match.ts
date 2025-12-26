import { ErrorResponse, errorResponse } from "@/helpers/errorResponse";
import { verifyToken } from "@/helpers/verifyToken";
import { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "@/firebase/firebase-admin";
import * as admin from "firebase-admin";
import {
  RemoveMatchingListingReq,
  RemoveMatchingListingRes,
} from "@/models/dto/auth/RemoveMatchingListing";
import { plainToClass } from "class-transformer";
import { RFQPart } from "@/models/RFQPart";
import { validate } from "class-validator";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<RemoveMatchingListingRes | ErrorResponse>
) {
  if (req.method === "POST") return removeMatch(req, res);
  res.status(404).write("Not Found");
}

async function removeMatch(
  req: NextApiRequest,
  res: NextApiResponse<RemoveMatchingListingRes | ErrorResponse>
) {
  try {
    const decoded = await verifyToken(req.headers.authorization || "");
    const body = plainToClass(RemoveMatchingListingReq, JSON.parse(req.body));
    const errors = await validate(body);
    if (errors.length) throw errors[0];

    const rfqPartsCol = firestore
      .collection(RFQPart.collection)
      .withConverter(RFQPart.converter());

    const refs = (
      await rfqPartsCol
        .where(admin.firestore.FieldPath.documentId(), "in", body.rfq_parts)
        .get()
    );

    if (!refs.docs.length) {
      throw new Error("Some RFQ parts provided were not found");
    }

    const userSet = new Set(refs.docs.map((e) => e.data().uid));
    if(userSet.size !== 1 || Array.from(userSet)[0] !== decoded.uid) {
      throw new Error("You are not the owner of the provided rfq");
    }

    await Promise.all(refs.docs.map(async (e) => {
      const matches = new Set(e.data().matching_listings)
      matches.delete(body.listing_id || '');
      await e.ref.update({
        matching_listings: Array.from(matches),
      })
    }));

    return res.status(200).json({
      message: "Match deleted successfully",
    });
  } catch (e) {
    return errorResponse(e, res);
  } finally {
    console.timeEnd('testing');
  }
}
