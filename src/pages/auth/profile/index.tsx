import AuthGuard from "@/components/AuthGuard";
import Profile from "@/components/Profile/Profile";

export default function ProfilePage() {
  return (
    <AuthGuard>
      <Profile />
    </AuthGuard>
  );
}
