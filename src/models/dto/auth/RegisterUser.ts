import { UserProfile } from "@/models/User";
import { IsAlpha, IsAlphanumeric, IsEmail, IsOptional, MinLength } from "class-validator";

export type CreateSubscriptionRes = {
  amount: number;
  currency: string;
  planId: string;
};

export type CreateSubscriptionSuccessRes = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export class RegisterUserReq {
  @MinLength(3)
  @IsOptional()
  uid: string;

  @MinLength(3)
  @IsEmail()
  email: string;

  @MinLength(3)
  @IsAlpha()
  firstName: string;

  @MinLength(3)
  @IsAlpha()
  lastName: string;
};

export class RegisterUserForm extends RegisterUserReq {
  @IsOptional()
  @MinLength(8)
  @IsAlphanumeric()
  password?: string;
};

export type RegisterUserRes = {
  message: string;
  userProfile: UserProfile;
};

export class CreateSubscriptionReq implements Omit<RegisterUserReq, "uid"> {
  @MinLength(3)
  @IsEmail()
  email: string;

  @MinLength(3)
  @IsAlpha()
  firstName: string;

  @MinLength(3)
  @IsAlpha()
  lastName: string;
};