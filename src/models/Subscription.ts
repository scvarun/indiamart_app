import { Transform, Type, plainToClass } from "class-transformer";
import {
  IsCurrency,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  MinLength,
} from "class-validator";
import { DocumentData, PartialWithFieldValue, QueryDocumentSnapshot, Timestamp } from "firebase-admin/firestore";

const ALL_SUBSCRIPTION_STATUS = [
  "created",
  "authenticated",
  "active",
  "pending",
  "halted",
  "cancelled",
  "completed",
  "expired",
] as const;
type SUBSCRIPTION_STATUS = (typeof ALL_SUBSCRIPTION_STATUS)[number];

const ALL_SUBSCRIPTION_PERIODS = [
  "daily",
  "weekly",
  "monthly",
  "yearly"
] as const;
type SUBSCRIPTION_PERIODS = (typeof ALL_SUBSCRIPTION_PERIODS)[number];

export class Subscription {
  static collection = "subscriptions";

  @IsOptional()
  id?: string;

  @IsOptional()
  uid?: string;

  @MinLength(4)
  planId: string;

  @MinLength(4)
  customerId: string | null;

  @MinLength(4)
  @IsIn(ALL_SUBSCRIPTION_STATUS)
  status: SUBSCRIPTION_STATUS;

  @IsCurrency()
  currency: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @MinLength(3)
  @IsIn(ALL_SUBSCRIPTION_PERIODS)
  period: SUBSCRIPTION_PERIODS;

  @Type(() => Timestamp)
  @Transform(() => Timestamp)
  startedAt: Timestamp;

  @Type(() => Timestamp)
  @Transform(() => Timestamp)
  canceledAt?: Timestamp;

  static converter = () => ({
    toFirestore: (data: PartialWithFieldValue<Subscription>) => data,
    fromFirestore: (snap: QueryDocumentSnapshot<DocumentData>) => ({
      id: snap.id,
      ...plainToClass(Subscription, snap.data()),
    }),
  });
}
