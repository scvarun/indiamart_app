import { firestore } from "@/firebase/firebase-admin";
import { ErrorResponse, errorResponse } from "@/helpers/errorResponse";
import { verifyToken } from "@/helpers/verifyToken";
import { ChatMessage } from "@/models/ChatMessage";
import { pageFromQuery } from "@/models/QueryObject";
import { GetMessagesRes } from "@/models/dto/chatMessages/GetMessages";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetMessagesRes | ErrorResponse>
) {
  if (req.method === "GET") return getQuotationChats(req, res);
  res.status(404).write("Not Found");
}

async function getQuotationChats(
  req: NextApiRequest,
  res: NextApiResponse<GetMessagesRes | ErrorResponse>
) {
  try {
    const pages = pageFromQuery(req.query);
    await verifyToken(req.headers.authorization || "");
    if (typeof req.query.quotationId !== "string") {
      throw new Error("Invalid id");
    }
    const chatMessageCol = firestore
      .collection(ChatMessage.collection)
      .withConverter(ChatMessage.converter());
    const query = chatMessageCol
      .where("quotationId", "==", req.query.quotationId)
      .orderBy("createdAt", "desc");
    const total = (await query.count().get()).data().count;
    const messages = (
      await query
        .limit(pages.limit)
        .offset((pages.page - 1) * pages.limit)
        .get()
    ).docs.map((e) => e.data());
    return res.status(200).json({
      total,
      messages,
    });
  } catch (e) {
    return errorResponse(e, res);
  }
}
