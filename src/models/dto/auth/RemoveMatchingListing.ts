import { Type } from "class-transformer";
import { IsArray, IsString } from "class-validator";

export class RemoveMatchingListingReq {
  @IsString()
  listing_id?: string;

  @IsArray()
  @Type(() => String)
  rfq_parts?: string[];
}

export type RemoveMatchingListingRes = {
  message: string;
};