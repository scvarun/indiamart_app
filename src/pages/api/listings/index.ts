import { ErrorResponse, errorResponse } from "@/helpers/errorResponse";
import { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "@/firebase/firebase-admin";
import { pageFromQuery } from "@/models/QueryObject";
import { ListingPart } from "@/models/ListingPart";
import { UserProfile } from "@/models/User";
import * as admin from "firebase-admin";
import { verifyToken } from "@/helpers/verifyToken";
import { GetListingsRes } from "@/models/dto/listings/GetListings";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetListingsRes | ErrorResponse>
) {
  if (req.method === "GET") return getListings(req, res);
  res.status(404).write("Not Found");
}

async function getListings(
  req: NextApiRequest,
  res: NextApiResponse<GetListingsRes | ErrorResponse>
) {
  try {
    await verifyToken(req.headers.authorization || "");
    const pages = pageFromQuery(req.query);
    const userProfileCol = firestore
      .collection(UserProfile.collection)
      .withConverter(UserProfile.converter());
    const listingsPartsCol = firestore
      .collection(ListingPart.collection)
      .withConverter(ListingPart.converter());
    const query = userProfileCol.orderBy('updatedAt', 'desc').orderBy('listing_parts');
    const total = (await query.count().get()).data().count;
    const userProfiles = query
      .limit(pages.limit)
      .offset((pages.page - 1) * pages.limit);
    let users = (await userProfiles.get()).docs.map((e) => e.data());
    const listingPartIds = users.reduce((c, p) => {
      if (p.listing_parts?.length) {
        c = [...c, ...(p.listing_parts || [])];
      }
      return c;
    }, new Array<string>());
    const listings =
      listingPartIds.length > 0
        ? (
            await listingsPartsCol.where(admin.firestore.FieldPath.documentId(), "in", listingPartIds).get()
          ).docs.map((e) => e.data())
        : [];
    const listingsMap = new Map<string, ListingPart>();
    listings.forEach((e) => {
      if (e.id) listingsMap.set(e.id, e);
    });
    users = users.map((u) => {
      delete u.rfq_parts;
      delete u.quotations;
      const listing_parts_items = (u.listing_parts || []).reduce((c, p) => {
        const item = listingsMap.get(p);
        if (item) c.push(item);
        return c;
      }, new Array<ListingPart>());
      return {
        ...u,
        listing_parts_items,
      };
    });
    return res.status(200).json({
      listings: users,
      total,
    });
  } catch (e) {
    return errorResponse(e, res);
  }
}
