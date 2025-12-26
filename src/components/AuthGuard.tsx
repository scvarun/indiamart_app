import { AuthContext } from "@/context/auth";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

type AuthGuardProps = {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = (props) => {
  const auth = useContext(AuthContext);
  const router = useRouter();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    if (auth.user === null) {
      router.push('/auth/login');
    }
  }, [auth, router]);

  if (!auth.user) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div style={{ marginBottom: 40 }}>
        <button onClick={(e) => {
          e.preventDefault();
          logout();
        }}>Logout</button>
      </div>
      {props.children}
    </>
  );
}

export default AuthGuard;