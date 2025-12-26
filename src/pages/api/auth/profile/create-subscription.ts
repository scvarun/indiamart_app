import config from "@/config";
import { ErrorResponse, errorResponse } from "@/helpers/errorResponse";
import { CreateSubscriptionReq, CreateSubscriptionRes } from "@/models/dto/auth/RegisterUser";
import { NextApiRequest, NextApiResponse } from "next";
import Razorpay from "razorpay";
import add from 'date-fns/add';
import { firestore } from "@/firebase/firebase-admin";
import { Subscription } from "@/models/Subscription";
import { verifyToken } from "@/helpers/verifyToken";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { Timestamp } from "firebase-admin/firestore";
import { decode } from "punycode";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateSubscriptionRes | ErrorResponse>
) {
  if (req.method === "POST") {
    return posthandler(req, res);
  } else {
    return res.status(404).write("Not Found");
  }
}
async function posthandler(
  req: NextApiRequest,
  res: NextApiResponse<CreateSubscriptionRes | ErrorResponse>
) {
  try {
    const body = plainToClass(CreateSubscriptionReq, JSON.parse(req.body));
    const errors = await validate(body);
    if (errors.length) throw errors[0];
    const decoded = await verifyToken(req.headers.authorization || "");
    const razorpay = new Razorpay({
      key_id: config.razorpayKey,
      key_secret: config.razorpaySecret,
    });
    const plan = await razorpay.plans.fetch(config.razorpayPlanId);
    const razorpaySubscription = await razorpay.subscriptions.create({
      plan_id: plan.id,
      total_count: 1,
      start_at: add(new Date(), { days: 30, }).getTime(),
    });
    const subscriptionCol = firestore
      .collection(Subscription.collection)
      .withConverter(Subscription.converter());

    const subscription = subscriptionCol.add({
      planId: razorpaySubscription.plan_id,
      amount: Number(plan.item.amount),
      currency: plan.item.currency,
      customerId: razorpaySubscription.customer_id,
      period: plan.period,
      startedAt: Timestamp.fromDate(new Date(razorpaySubscription.start_at)),
      status: razorpaySubscription.status,
      uid: decoded.uid,
    });
    return res.status(200).send({
      amount: Number(plan.item.amount),
      currency: plan.item.currency,
      planId: plan.id,
      message: 'Subscription created successfully',
    })
  } catch(e) {
    return errorResponse(e, res);
  }
}