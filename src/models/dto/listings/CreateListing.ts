import { ListingPart } from "@/models/ListingPart";
import { Type } from "class-transformer";
import {
  Length,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  IsOptional,
} from "class-validator";

export class CreateListingReq {
  @Length(3)
  @IsOptional()
  uid: string;

  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @Type(() => ListingPart)
  parts: ListingPart[];
}

export type CreateListingRes = {
  message: string;
  listings: ListingPart[];
};
