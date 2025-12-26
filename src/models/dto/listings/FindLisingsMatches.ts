import { ListingPart } from "@/models/ListingPart";
import { Length } from "class-validator";

export class FindListingsMatchesReq {
  @Length(3)
  uid: string;
}

export interface FindListingsMatchesRes {
  listings: ListingPart[];
}