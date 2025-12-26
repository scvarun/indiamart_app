import "reflect-metadata";
import type { NextApiRequest, NextApiResponse } from "next";
import { CreateListingReq, CreateListingRes } from "@/models/dto/listings/CreateListing";
import { verifyToken } from "@/helpers/verifyToken";
import { errorResponse, ErrorResponse } from "@/helpers/errorResponse";
import { firestore } from "@/firebase/firebase-admin";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { UserProfile } from "@/models/User";
import { ListingPart } from "@/models/ListingPart";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateListingRes | ErrorResponse>
) {
  if (req.method === "POST") return postCreateListing(req, res);
  res.status(404).write("Not Found");
}

async function postCreateListing(
  req: NextApiRequest,
  res: NextApiResponse<CreateListingRes | ErrorResponse>
) {
  try {
    const decoded = await verifyToken(req.headers.authorization || "");
    const body = plainToClass(CreateListingReq, JSON.parse(req.body));
    const errors = await validate(body);
    if (errors.length) throw errors[0];
    body.parts = body.parts.map((e) => {
      e.uid = decoded.uid;
      e.createdAt = new Date();
      return e;
    });
    const listingPartsCol = firestore
      .collection(ListingPart.collection)
      .withConverter(ListingPart.converter());
    const userProfileCol = firestore
      .collection(UserProfile.collection)
      .withConverter(UserProfile.converter());
    const userProfile = (
      await userProfileCol.where("uid", "==", decoded.uid).get()
    ).docs[0];
    const listing_parts_id = userProfile.data().listing_parts || [];
    const listing_parts: ListingPart[] = [];
    for (var i = 0; i < body.parts.length; i++) {
      const listingRef = await listingPartsCol.add(
        JSON.parse(JSON.stringify(body.parts[i]))
      );
      const listing = (await listingRef.get()).data();
      if (listing) {
        listing_parts.push(listing);
      }
      listing_parts_id.push(listingRef.id);
    }
    await userProfile.ref.update({
      listing_parts: listing_parts_id,
      updatedAt: new Date().toISOString(),
    });
    return res.status(200).json({
      message: "Listing created successfully",
      listings: listing_parts,
    });
  } catch (e) {
    return errorResponse(e, res);
  }
}
