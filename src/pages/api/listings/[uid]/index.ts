import { firestore } from "@/firebase/firebase-admin";
import { ErrorResponse, errorResponse } from "@/helpers/errorResponse";
import { verifyToken } from "@/helpers/verifyToken";
import { ListingPart } from "@/models/ListingPart";
import { EditListingRes } from "@/models/dto/listings/EditListing";
import { GetSingleListingRes } from "@/models/dto/listings/GetSingleListing";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetSingleListingRes | ErrorResponse>
) {
  if (req.method === "GET") return getListings(req, res);
  if (req.method === "PATCH") return updateListing(req, res);
  res.status(404).write("Not Found");
}

async function getListings(
  req: NextApiRequest,
  res: NextApiResponse<GetSingleListingRes | ErrorResponse>
) {
  try {
    const { uid } = req.query;
    if (typeof uid !== "string") throw new Error("Invalid id");
    await verifyToken(req.headers.authorization || "");
    const listingPartCol = firestore
      .collection(ListingPart.collection)
      .withConverter(ListingPart.converter());
    const listingPartsRef = (await listingPartCol.where("uid", "==", uid).get())
      .docs;
    return res.status(200).json({
      listings: listingPartsRef.map((e) => e.data()),
    });
  } catch (e) {
    return errorResponse(e, res);
  }
}

async function updateListing(
  req: NextApiRequest,
  res: NextApiResponse<EditListingRes | ErrorResponse>
) {
  try {
    const { uid } = req.query;
    if (typeof uid !== "string") throw new Error("Invalid id");
    await verifyToken(req.headers.authorization || "");
    const listingPartCol = firestore
      .collection(ListingPart.collection)
      .withConverter(ListingPart.converter());
    const listingPartsRef = (await listingPartCol.where("uid", "==", uid).get())
      .docs;
    return res.status(200).json({
      message: 'Listing updated successfully',
      listings: listingPartsRef.map((e) => e.data()),
    });
  } catch (e) {
    return errorResponse(e, res);
  }
}
