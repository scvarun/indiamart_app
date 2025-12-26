import config from "@/config";
import { firebaseAuth } from "@/firebase/firebase";
import { ApiError } from "@/models/ErrorResponse";
import {
  CreateListingReq,
  CreateListingRes,
} from "@/models/dto/listings/CreateListing";
import { EditListingReq, EditListingRes } from "@/models/dto/listings/EditListing";
import { FindListingsMatchesReq, FindListingsMatchesRes } from "@/models/dto/listings/FindLisingsMatches";
import { GetListingsRes } from "@/models/dto/listings/GetListings";
import { GetSingleListingRes } from "@/models/dto/listings/GetSingleListing";

export async function getListings(): Promise<GetListingsRes> {
  const token = await firebaseAuth.currentUser?.getIdToken();
  if (!token) throw new Error("Authorization error");
  const res = await fetch(`${config.apiHost}/listings`, {
    method: "GET",
    headers: { Authorization: token },
  });
  if(!res.ok) throw new ApiError(await res.json());
  return await res.json();
}

export async function getSingleListing(uid: string): Promise<GetSingleListingRes> {
  const token = await firebaseAuth.currentUser?.getIdToken();
  if (!token) throw new Error("Authorization error");
  const res = await fetch(`${config.apiHost}/listings/${uid}`, {
    method: "GET",
    headers: { Authorization: token },
  });
  if(!res.ok) throw new ApiError(await res.json());
  return await res.json();
}

export async function postCreateListing(
  req: CreateListingReq
): Promise<CreateListingRes> {
  const token = await firebaseAuth.currentUser?.getIdToken();
  if (!token) throw new Error("Authorization error");
  return await fetch(`${config.apiHost}/listings/create`, {
    method: "POST",
    body: JSON.stringify(req),
    headers: { Authorization: token },
  }).then((res) => res.json());
}

export async function postEditListing(
  req: EditListingReq
): Promise<EditListingRes> {
  const token = await firebaseAuth.currentUser?.getIdToken();
  if (!token) throw new Error("Authorization error");
  return await fetch(`${config.apiHost}/listings/${req.uid}`, {
    method: "PATCH",
    body: JSON.stringify(req),
    headers: { Authorization: token },
  }).then((res) => res.json());
}

export async function findMatches(
  req: FindListingsMatchesReq,
  ops?: { token?: string }
): Promise<FindListingsMatchesRes> {
  const token = ops?.token ?? await firebaseAuth.currentUser?.getIdToken();
  if (!token) throw new Error("Authorization error");
  return await fetch(`${config.apiHost}/listings/${req.uid}/find-matches`, {
    method: "PATCH",
    body: JSON.stringify(req),
    headers: { Authorization: token },
  }).then((res) => res.json());
}