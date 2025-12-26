import { ListingPart } from "@/models/ListingPart";
import { QueryObject } from "@/models/QueryObject";

export interface GetMatchingListingsReq {
  query: QueryObject;
}

export type GetMatchingListingsRes = {
  listings: ListingPart[];
  total: number;
};