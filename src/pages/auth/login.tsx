import { useContext, useEffect } from "react";
import { AuthContext } from "@/context/auth";
import { useRouter } from "next/router";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { IsEmail, Length } from "class-validator";

class LoginForm {
  @IsEmail()
  @Length(3)
  email: string;

  @Length(8)
  password: string;
}

const resolver = classValidatorResolver(LoginForm);

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver, defaultValues: {
      email: 'varun9509@gmail.com',
      password: 'password'
    }
  });

  const auth = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (auth.setError) {
        auth.setError(null);
      }
    }
  }, [auth])

  useEffect(() => {
    if (auth.user !== null) {
      router.push('/sell');
    }
  }, [auth.user, router]);

  const handleSubmitLogin = async (data: LoginForm) => {
    auth.login({ email: data.email, password: data.password });
  }

  if (auth.user === undefined) {
    return <p>Loading...</p>
  }

  return (
    <>
      <form onSubmit={handleSubmit((data) => handleSubmitLogin(data))}>
        
        <label>Email</label>
        <input type="email" {...register('email')} />

        <label >Password</label>
        <input type="password" {...register('password')} />

        <button type="submit" disabled={auth.isLoading}>{auth.isLoading ? 'Loading...' : 'Submit'}</button>

        <Link href="/auth/register">Register</Link>

        <div>
          {auth.error && (
            <p>{auth.error.message}</p>
          )}
        </div>
      </form>
    </>
  );
}