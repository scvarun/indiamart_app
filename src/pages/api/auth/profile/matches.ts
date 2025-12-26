import { ErrorResponse, errorResponse } from "@/helpers/errorResponse";
import { verifyToken } from "@/helpers/verifyToken";
import { GetMatchingListingsRes } from "@/models/dto/auth/GetMatchingListing";
import { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "@/firebase/firebase-admin";
import { pageFromQuery } from "@/models/QueryObject";
import { RFQPart } from "@/models/RFQPart";
import * as admin from "firebase-admin";
import { ListingPart } from "@/models/ListingPart";
import { UserProfile } from "@/models/User";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetMatchingListingsRes | ErrorResponse>
) {
  if (req.method === "GET") return getMatchingListings(req, res);
  res.status(404).write("Not Found");
}

async function getMatchingListings(
  req: NextApiRequest,
  res: NextApiResponse<GetMatchingListingsRes | ErrorResponse>
) {
  try {
    const decoded = await verifyToken(req.headers.authorization || "");
    const pages = pageFromQuery(req.query);
    const rfqPartsCol = firestore
      .collection(RFQPart.collection)
      .withConverter(RFQPart.converter());
    const listingPartsCol = firestore
      .collection(ListingPart.collection)
      .withConverter(ListingPart.converter());
    const userProfilesCol = firestore
      .collection(UserProfile.collection)
      .withConverter(UserProfile.converter());

    const rfq_parts = (await rfqPartsCol.where("uid", "==", decoded.uid).get())
      .docs;
    const rfq_match_map = new Map<string, RFQPart[]>();
    const matches_ids: string[] = rfq_parts.reduce((p: string[], c) => {
      c.data().matching_listings?.map((e) => {
        const arr = rfq_match_map.get(e) ?? [];
        rfq_match_map.set(e, [...arr, c.data()]);
        p.push(e);
      });
      return p;
    }, []);

    if(!matches_ids?.length) {
      return res.status(200).json({
        listings: [],
        total: 0,
      });
    }

    const listingsQuery = listingPartsCol
      .where(admin.firestore.FieldPath.documentId(), "in", matches_ids)
      .limit(pages.limit)
      .offset((pages.page - 1) * pages.limit);
    const total = (await listingsQuery.count().get()).data().count;
    let listings = (await listingsQuery.get()).docs.map((e) => e.data());

    const userIds = listings.map((e) => e.uid);
    const users = (await userProfilesCol.where("uid", "in", userIds).get())
      .docs;
    const userMap = new Map<string, UserProfile>();
    users.map((e) => {
      userMap.set(e.data().uid || '', e.data())
    });

    listings = listings.map((e) => {
      if (e.uid) e.user = userMap.get(e.uid);
      if (e.id && rfq_match_map.has(e.id)) {
        e.matches = [...(e.matches ?? []), ...(rfq_match_map.get(e.id) ?? [])];
      }
      return e;
    });

    return res.status(200).json({
      listings,
      total,
    });
  } catch (e) {
    return errorResponse(e, res);
  }
}
