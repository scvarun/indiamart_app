import { ChatMessage } from "@/models/ChatMessage";

export class PostChatMessageReq extends ChatMessage {}

export class PostChatMessageRes {
  message: string;
  chatMessage: ChatMessage;
};
