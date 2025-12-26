import AuthGuard from "@/components/AuthGuard";
import GetMatchesList from "@/components/Matches/GetMatchesList/GetMatchesList";

export default function SellPage() {
  return (
    <AuthGuard>
      <GetMatchesList />
    </AuthGuard>
  );
}