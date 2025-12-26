import {
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthContext } from "@/context/auth";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  CreateSubscriptionRes,
  CreateSubscriptionSuccessRes,
  RegisterUserForm,
} from "@/models/dto/auth/RegisterUser";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { useForm } from "react-hook-form";
import { createSubscription } from "@/repo/auth";
import { useMutation } from "@tanstack/react-query";
import config from "@/config";

const resolver = classValidatorResolver(RegisterUserForm);

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver,
    defaultValues: {
      email: "varun9509@gmail.com",
      firstName: "Varun",
      lastName: "Chauhan",
      password: "password",
    },
  });
  const [registerPaymentSuccess, setRegisterPaymentSucess] =
    useState<CreateSubscriptionSuccessRes | null>(null);
  const auth = useContext(AuthContext);
  const router = useRouter();

  const {
    data: createSubscriptionData,
    isLoading: createSubscriptionLoading,
    mutate: postCreateSubscription,
  } = useMutation({
    mutationKey: ["postCreateListing"],
    mutationFn: createSubscription,
  });

  function loadScript(src) {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  const displayRazorpay = useCallback(async (d: CreateSubscriptionRes) => {
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    // @ts-ignore
    const paymentObject = new window.Razorpay({
      key: config.razorpayKey,
      amount: d.amount.toString(),
      currency: d.currency,
      handler: async (res: CreateSubscriptionSuccessRes) => {
        setRegisterPaymentSucess(res);
      },
    });
    paymentObject.open();
  }, []);

  // const registerUser = async (d: RegisterUserReq) => {
  //   await displayRazorpay(d);
  // };

  useEffect(() => {
    if (createSubscriptionData) {
      displayRazorpay(createSubscriptionData);
    }
  }, [createSubscriptionData, displayRazorpay]);

  useEffect(() => {
    if (registerPaymentSuccess) {
      console.log(registerPaymentSuccess);
    }
  }, [registerPaymentSuccess]);

  useEffect(() => {
    if (auth.userProfile) {
      router.push("/sell");
    }
  }, [auth.userProfile, router]);

  if (auth.user === undefined) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <form
        onSubmit={handleSubmit((d) => {
          postCreateSubscription(d);
        })}
      >
        <label>First name</label>
        <input type="text" {...register("firstName")} />
        {errors.firstName && <p>{errors.firstName.message}</p>}

        <label>Last name</label>
        <input type="text" {...register("lastName")} />
        {errors.lastName && <p>{errors.lastName.message}</p>}

        <label>Email</label>
        <input type="email" {...register("email")} />
        {errors.email && <p>{errors.email.message}</p>}

        <label>Password</label>
        <input type="password" {...register("password")} />
        {errors.password && <p>{errors.password.message}</p>}

        <button type="submit">
          {createSubscriptionLoading ? "Loading..." : "Register"}
        </button>
        <Link href="/auth/login">Login</Link>

        <p>{auth.error?.message}</p>
      </form>
    </>
  );
}
