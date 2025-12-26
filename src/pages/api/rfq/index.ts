import { ErrorResponse, errorResponse } from "@/helpers/errorResponse";
import { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "@/firebase/firebase-admin";
import { RFQPart } from "@/models/RFQPart";
import { pageFromQuery } from "@/models/QueryObject";
import { UserProfile } from "@/models/User";
import GetRFQListRes from "@/models/dto/rfq/GetRFQList";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetRFQListRes | ErrorResponse>
) {
  if (req.method === "GET") return getRFQList(req, res);
  res.status(404).write("Not Found");
}

async function getRFQList(
  req: NextApiRequest,
  res: NextApiResponse<GetRFQListRes | ErrorResponse>
) {
  try {
    const pages = pageFromQuery(req.query);
    const rfqCol = firestore
      .collection(RFQPart.collection)
      .withConverter(RFQPart.converter());
    const userProfileCol = firestore
      .collection(UserProfile.collection)
      .withConverter(UserProfile.converter());
    const query = rfqCol.orderBy('createdAt');
    const total = (await query.count().get()).data().count;
    const rfqRefs = query
      .limit(pages.limit)
      .offset((pages.page - 1) * pages.limit);
    const data = await rfqRefs.get();
    let rfq = data.docs.map((e) => ({ ...e.data(), id: e.id }));
    let rfqUserIds = Array.from(new Set(rfq.map((e) => e.uid))).filter((e) => e);
    const users = rfqUserIds.length > 0 ? (
      await userProfileCol.where('uid', "in", rfqUserIds).get()
    ).docs.map((e) => e.data()) : [];
    const usersMap = new Map<string, UserProfile>();
    users.forEach((e) => {
      usersMap.set(e.uid || '', e);
    });
    rfq = rfq.map((e) => ({
      ...e,
      user: e.uid ? usersMap.get(e.uid) : undefined,
    }));
    return res.status(200).json({
      rfq,
      total,
    });
  } catch (e) {
    return errorResponse(e, res);
  }
}
