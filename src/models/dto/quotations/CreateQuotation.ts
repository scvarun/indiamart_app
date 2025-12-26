import { Quotation } from "@/models/Quotation";

export class CreateQuotationReq extends Quotation {
}

export type CreateQuotationRes = {
  message: string;
  quotation: Quotation;
};
