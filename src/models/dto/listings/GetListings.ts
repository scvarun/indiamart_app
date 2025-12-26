import { QueryObject } from "@/models/QueryObject";
import { UserProfile } from "@/models/User";

export interface GetListingsReq {
  query: QueryObject;
}

export type GetListingsRes = {
  listings: UserProfile[];
  total: number;
};