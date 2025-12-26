import config from "@/config";
import { firebaseAuth } from "@/firebase/firebase";
import { CreateRFQReq, CreateRFQRes } from "@/models/dto/rfq/CreateRFQ";
import { Query, queryToParams } from "@/models/QueryObject";
import GetRFQListRes from "@/models/dto/rfq/GetRFQList";
import { FindRFQMatchesReq, FindRFQMatchesRes } from "@/models/dto/rfq/FindRFQMatches";
import { ApiError } from "@/models/ErrorResponse";

export async function getRFQList(req: Query): Promise<GetRFQListRes> {
  const token = await firebaseAuth.currentUser?.getIdToken();
  if (!token) throw new Error("Authorization error");
  const res = await fetch(
    `${config.apiHost}/rfq` +
      (Object.keys(req).length > 0 ? "?" + queryToParams(req) : ""),
    {
      method: "GET",
      headers: { Authorization: token },
    }
  );
  if(!res.ok) throw new ApiError(await res.json());
  return await res.json();
}

export async function postCreateRFQ(req: CreateRFQReq): Promise<CreateRFQRes> {
  const token = await firebaseAuth.currentUser?.getIdToken();
  if (!token) throw new Error("Authorization error");
  const res =  await fetch(`${config.apiHost}/rfq/create`, {
    method: "POST",
    body: JSON.stringify(req),
    headers: { Authorization: token },
  })
  if(!res.ok) throw new ApiError(await res.json());
  return await res.json();
}

export async function findMatches(
  req: FindRFQMatchesReq,
  ops?: { token?: string }
): Promise<FindRFQMatchesRes> {
  const token = ops?.token ?? await firebaseAuth.currentUser?.getIdToken();
  if (!token) throw new Error("Authorization error");
  return await fetch(`${config.apiHost}/rfq/${req.uid}/find-matches`, {
    method: "PATCH",
    body: JSON.stringify(req),
    headers: { Authorization: token },
  }).then((res) => res.json());
}
