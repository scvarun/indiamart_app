import { Transform, Type, plainToClass } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  Length,
  Min,
} from "class-validator";
import {
  DocumentData,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { UserProfile } from "./User";
import { Timestamp } from "firebase/firestore";

export class RFQPart {
  static collection = "rfq_parts";

  @IsOptional()
  @IsBoolean()
  selected?: boolean = false;
  
  @IsBoolean()
  inStock?: boolean = false;

  @IsOptional()
  id?: string;

  @IsOptional()
  uid?: string;

  @IsOptional()
  @Type(() => UserProfile)
  user?: UserProfile;

  @Length(3)
  partId: string;

  @Min(1)
  quantity: number;

  @IsOptional()
  comment?: string;

  @IsPositive()
  @IsNumber()
  price: number;

  @Length(3)
  mfg: string;

  @Length(4)
  date: string;

  @IsOptional()
  @Type(() => Timestamp)
  @Transform(() => Timestamp)
  createdAt?: Timestamp;

  @IsOptional()
  @IsArray()
  @Type(() => String)
  matching_listings?: string[];

  static converter = () => ({
    toFirestore: (data: PartialWithFieldValue<RFQPart>) => data,
    fromFirestore: (snap: QueryDocumentSnapshot<DocumentData>) => ({
      id: snap.id,
      ...plainToClass(RFQPart, snap.data()),
    }),
  });
}
