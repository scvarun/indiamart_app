import config from "@/config";
import { firebaseAuth } from "@/firebase/firebase";
import { Query, QueryObject, queryToParams } from "@/models/QueryObject";
import { GetMessagesRes } from "@/models/dto/chatMessages/GetMessages";
import {
  PostChatMessageReq,
  PostChatMessageRes,
} from "@/models/dto/chatMessages/PostChatMessage";
import { plainToClass } from "class-transformer";

export async function postChatMessage(
  quotationId: string,
  req: PostChatMessageReq
): Promise<PostChatMessageRes> {
  if(!quotationId || !quotationId.length) throw new Error('Invalid id');
  const token = await firebaseAuth.currentUser?.getIdToken();
  if (!token) throw new Error("Authorization error");
  const json = await fetch(`${config.apiHost}/quotations/${quotationId}/chats/create`, {
    method: "POST",
    body: JSON.stringify(req),
    headers: { Authorization: token },
  }).then((res) => res.json());
  return plainToClass(PostChatMessageRes, json);
}

export async function getMessages(
  quotationId: string,
  req: Query
): Promise<GetMessagesRes> {
  if(!quotationId || !quotationId.length) throw new Error(`Invalid id : '${quotationId}'`);
  const token = await firebaseAuth.currentUser?.getIdToken();
  if (!token) throw new Error("Authorization error");
  const res = await fetch(
    `${config.apiHost}/quotations/${quotationId}/chats` +
      (Object.keys(req).length > 0 ? "?" + queryToParams(req) : ""),
    {
      method: "GET",
      headers: { Authorization: token },
    }
  ).then((res) => res.json());
  return plainToClass(GetMessagesRes, res);
}
