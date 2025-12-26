import { Transform, Type, plainToClass } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsPositive, Length, Min } from "class-validator";
import { PartialWithFieldValue, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { Timestamp } from "firebase/firestore";

export class Quotation {
  static collection = "quotations";

  @IsOptional()
  uid?: string;

  @IsOptional()
  id?: string;

  @IsOptional()
  rfqId?: string;

  @Length(3)
  partId: string;

  @IsPositive()
  @IsNumber()
  price: number;

  @Length(3)
  mfg: string;

  @Length(4)
  date: string;

  @Min(1)
  quantity: number;

  @IsOptional()
  comment?: string;

  @IsOptional()
  userName?: string;

  @IsOptional()
  companyName?: string;

  @IsOptional()
  @Type(() => Timestamp)
  @Transform(() => Timestamp)
  createdAt?: Timestamp;

  @IsArray()
  @Type(() => String)
  participants: string[];

  static converter = () => ({
    toFirestore: (data: PartialWithFieldValue<Quotation>) => data,
    fromFirestore: (snap: QueryDocumentSnapshot<Quotation>) => ({
      id: snap.id,
      ...plainToClass(Quotation, snap.data()),
    }),
  });
}
