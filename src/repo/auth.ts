import config from "@/config";
import { firebaseAuth } from "@/firebase/firebase";
import { UserProfile } from "@/models/User";
import {
  CreateSubscriptionReq,
  CreateSubscriptionRes,
  RegisterUserReq,
} from "@/models/dto/auth/RegisterUser";
import { PostSaveProfileReq, PostSaveProfileRes } from "@/models/dto/auth/SaveProfile";

export async function registerUser(req: Omit<RegisterUserReq, "password">): Promise<UserProfile> {
  const res = await fetch(`${config.apiHost}/auth/register`, {
    method: "POST",
    body: JSON.stringify(req),
  })
  if(!res.ok) throw new Error(await res.json());
  return await res.json();
}

export async function createSubscription(
  req: CreateSubscriptionReq
): Promise<CreateSubscriptionRes> {
  const res = await fetch(`${config.apiHost}/auth/register/create-subscription`, {
    method: "POST",
    body: JSON.stringify(req),
  });
  if(!res.ok) throw new Error(await res.json());
  return await res.json();
}

export async function getSelfUserProfile(): Promise<UserProfile> {
  const token = await firebaseAuth.currentUser?.getIdToken();
  if (!token) throw new Error("Authorization error");
  const res = await fetch(`${config.apiHost}/auth/profile`, {
    method: "GET",
    headers: { Authorization: token },
  })
  if(!res.ok) throw new Error(await res.json());
  const json = await res.json();
  return json.userProfile;
}

export async function getUserProfile(uid: string): Promise<UserProfile> {
  const token = await firebaseAuth.currentUser?.getIdToken();
  if (!token) throw new Error("Authorization error");
  const res = await fetch(`${config.apiHost}/auth/profile/${uid}`, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })
  if(!res.ok) throw new Error(await res.json());
  const json = await res.json();
  return json.userProfile;
}

export async function postSaveUserProfile(req: PostSaveProfileReq): Promise<PostSaveProfileRes> {
  const token = await firebaseAuth.currentUser?.getIdToken();
  if (!token) throw new Error("Authorization error");
  const res = await fetch(`${config.apiHost}/auth/profile`, {
    body: JSON.stringify(req),
    method: "POST",
    headers: { 
      Authorization: token,
      'Content-Type': 'text/json',
    }
  })
  if(!res.ok) throw new Error(await res.json());
  return await res.json();
}