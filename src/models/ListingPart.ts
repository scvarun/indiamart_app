import { Type, plainToClass } from "class-transformer";
import { IsArray, IsDate, IsNumber, IsOptional, IsPositive, Length, Min } from "class-validator";
import {
  PartialWithFieldValue,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { UserProfile } from "./User";
import { RFQPart } from "./RFQPart";

export class ListingPart {
  static collection = "listing_parts";

  @IsOptional()
  id?: string;

  @IsOptional()
  uid?: string;

  @Length(3)
  partId?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAt?: Date;

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
  @Type(() => UserProfile)
  user?: UserProfile;

  @IsOptional()
  @IsArray()
  @Type(() => RFQPart)
  matches?: RFQPart[];

  static converter = () => ({
    toFirestore: (data: PartialWithFieldValue<ListingPart>) => data,
    fromFirestore: (snap: QueryDocumentSnapshot<ListingPart>) => ({
      id: snap.id,
      ...plainToClass(ListingPart, snap.data()),
    }),
  });
}
