import config from "@/config";
import { firebaseAuth } from "@/firebase/firebase";
import { ApiError } from "@/models/ErrorResponse";
import { Query, queryToParams } from "@/models/QueryObject";
import { CreateQuotationReq, CreateQuotationRes } from "@/models/dto/quotations/CreateQuotation";
import { GetQuotationRes } from "@/models/dto/quotations/GetQuotations";

export async function postCreateQuotation(
    req: CreateQuotationReq
  ): Promise<CreateQuotationRes> {
    const token = await firebaseAuth.currentUser?.getIdToken();
    if (!token) throw new Error("Authorization error");
    const res = await fetch(`${config.apiHost}/quotations/create`, {
      method: "POST",
      body: JSON.stringify(req),
      headers: { Authorization: token },
    });
    if(!res.ok) throw new ApiError(await res.json());
    return await res.json();
  }

export async function getQuotationList(req: Query): Promise<GetQuotationRes> {
  const token = await firebaseAuth.currentUser?.getIdToken();
  if (!token) throw new Error("Authorization error");
  const res = await fetch(
    `${config.apiHost}/quotations` +
      (Object.keys(req).length > 0 ? "?" + queryToParams(req) : ""),
    {
      method: "GET",
      headers: { Authorization: token },
    }
  );
  if(!res.ok) throw new ApiError(await res.json());
  return await res.json();
}