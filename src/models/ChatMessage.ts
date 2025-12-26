import { Type, plainToClass } from "class-transformer";
import { IsOptional, Length } from "class-validator";
import { PartialWithFieldValue, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { Timestamp } from "firebase/firestore";

export class ChatMessage {
  static collection = "chat_messages";

  @Length(3)
  uid?: string;

  @IsOptional()
  id?: string;

  @Length(3)
  quotationId?: string;

  @Length(3)
  message: string;

  @IsOptional()
  @Type(() => Timestamp)
  createdAt?: Timestamp;

  static converter = () => ({
    toFirestore: (data: PartialWithFieldValue<ChatMessage>) => data,
    fromFirestore: (snap: QueryDocumentSnapshot<ChatMessage>) => ({
      id: snap.id,
      ...plainToClass(ChatMessage, snap.data()),
    }),
  });
}
