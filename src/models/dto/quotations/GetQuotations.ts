import { Quotation } from "@/models/Quotation";
import { Type } from "class-transformer";

export interface GetQuotationRes {
  quotations: Quotation[];

  total: number;
};
