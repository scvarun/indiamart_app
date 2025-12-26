import { RFQPart } from "@/models/RFQPart";

export default interface GetRFQListRes {
  rfq: RFQPart[];
  total: number;
};