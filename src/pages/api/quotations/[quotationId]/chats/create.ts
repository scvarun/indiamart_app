import { firestore } from "@/firebase/firebase-admin";
import { ErrorResponse, errorResponse } from "@/helpers/errorResponse";
import { verifyToken } from "@/helpers/verifyToken";
import { ChatMessage } from "@/models/ChatMessage";
import { PostChatMessageReq, PostChatMessageRes } from "@/models/dto/chatMessages/PostChatMessage";
import { plainToClass } from "class-transformer";
import { Timestamp } from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<PostChatMessageRes | ErrorResponse>
) {
  if (req.method === "POST") return postCreateQuotationChatMessage(req, res);
  res.status(404).write("Not Found");
}

async function postCreateQuotationChatMessage(
  req: NextApiRequest,
  res: NextApiResponse<PostChatMessageRes | ErrorResponse>
) {
  try {
    if (typeof req.query.quotationId !== "string") {
      throw new Error("Invalid id");
    }
    const body = plainToClass(PostChatMessageReq, JSON.parse(req.body));
    body.quotationId = req.query.quotationId;
    body.createdAt = Timestamp.fromDate(new Date());
    const decoded = await verifyToken(req.headers.authorization || "");
    body.uid = decoded.uid;
    const chatMessageCol = firestore
      .collection(ChatMessage.collection)
      .withConverter(ChatMessage.converter());
    const chatMessageRef = await chatMessageCol.add(
      JSON.parse(JSON.stringify(body))
    );
    const chatMessage = (await chatMessageRef.get()).data();
    return res.status(200).json({
      message: 'Message posted successfully',
      chatMessage
    });
  } catch (e) {
    return errorResponse(e, res);
  }
}
