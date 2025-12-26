import config from "@/config";
import { firebaseAuth } from "@/firebase/firebase";
import { ApiError } from "@/models/ErrorResponse";
import { Query, queryToParams } from "@/models/QueryObject";
import { GetMatchingListingsRes } from "@/models/dto/auth/GetMatchingListing";
import { RemoveMatchingListingReq, RemoveMatchingListingRes } from "@/models/dto/auth/RemoveMatchingListing";

export async function getMatchesList(
  req: Query
): Promise<GetMatchingListingsRes> {
  const token = await firebaseAuth.currentUser?.getIdToken();
  if (!token) throw new Error("Authorization error");
  const res = await fetch(
    `${config.apiHost}/auth/profile/matches` +
      (Object.keys(req).length > 0 ? "?" + queryToParams(req) : ""), {
      method: "GET",
      headers: { Authorization: token },
    });
  if(!res.ok) throw new ApiError(await res.json());
  return await res.json();
}

export async function deleteMatch(
  req: RemoveMatchingListingReq
): Promise<RemoveMatchingListingRes> {
  const token = await firebaseAuth.currentUser?.getIdToken();
  if (!token) throw new Error("Authorization error");
  const res = await fetch(
    `${config.apiHost}/auth/profile/remove-match`, {
      method: "POST",
      body: JSON.stringify(req),
      headers: { 
        Authorization: token
      },
    })
  if(!res.ok) throw new ApiError(await res.json());
  return await res.json();
}
