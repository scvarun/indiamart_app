import { ChatMessage } from "@/models/ChatMessage";
import { Type } from "class-transformer";

export class GetMessagesRes {
  @Type(() => ChatMessage)
  messages: ChatMessage[];
  
  total: number;
};
