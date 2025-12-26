import Settings from "@/components/Account/Settings";
import AuthGuard from "@/components/AuthGuard";

export default function SettingsPage() {
  return (
    <AuthGuard>
      <Settings />
    </AuthGuard>
  );
}
