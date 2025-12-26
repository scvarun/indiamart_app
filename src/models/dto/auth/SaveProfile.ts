import { UserProfile } from "@/models/User";
import { MinLength } from "class-validator";

type IPostSaveProfileReq = Pick<UserProfile, 'firstName' | 'lastName'>;
export class PostSaveProfileReq implements IPostSaveProfileReq {
  @MinLength(3)
  firstName: string;

  @MinLength(3)
  lastName: string;
}

export interface PostSaveProfileRes {
  user: UserProfile;
}