import { Type, plainToClass } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsOptional,
  Length,
  MinLength,
} from "class-validator";
import {
  PartialWithFieldValue,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { ListingPart } from "./ListingPart";
import { RFQPart } from "./RFQPart";
import { Quotation } from "./Quotation";
import { SubscriptionPlan } from "./SubscriptionPlan";

export class UserProfile {
  static collection = "user_profiles";

  @Length(3)
  firstName: string;

  @Length(3)
  lastName: string;

  @Length(3)
  @IsOptional()
  id?: string;

  @IsOptional()
  @Length(3)
  uid?: string;

  @IsDateString()
  @IsOptional()
  createdAt?: string;

  @IsDateString()
  @IsOptional()
  updatedAt?: string;

  @MinLength(3)
  current_plan: string;

  current_plan_item: SubscriptionPlan;

  @IsOptional()
  @IsArray()
  @Type(() => String)
  listing_parts?: string[];

  @IsOptional()
  @IsArray()
  @Type(() => ListingPart)
  listing_parts_items?: ListingPart[];

  @IsOptional()
  @IsArray()
  @Type(() => String)
  rfq_parts?: string[];
  
  @IsOptional()
  @IsArray()
  @Type(() => RFQPart)
  rfq_parts_items?: RFQPart[];

  @IsOptional()
  @IsArray()
  @Type(() => String)
  quotations?: string[];

  @IsOptional()
  @IsArray()
  @Type(() => Quotation)
  quotation_items?: Quotation[];

  @IsOptional()
  @IsArray()
  @Type(() => String)
  matching_listing?: string[];

  @IsOptional()
  @IsArray()
  @Type(() => ListingPart)
  matching_listing_items?: ListingPart[];

  static converter = () => ({
    toFirestore: (data: PartialWithFieldValue<UserProfile>) => data,
    fromFirestore: (snap: QueryDocumentSnapshot<UserProfile>) => ({
      id: snap.id,
      ...plainToClass(UserProfile, snap.data()),
    }),
  });
}
