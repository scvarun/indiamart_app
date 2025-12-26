import { ListingPart } from "@/models/ListingPart";
import { Length } from "class-validator";

export class FindRFQMatchesReq {
  @Length(3)
  uid: string;
}

export interface FindRFQMatchesRes {
  listings: ListingPart[];
}