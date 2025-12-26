import AuthGuard from "@/components/AuthGuard";
import RFQList from "@/components/RFQs/RFQList/RFQList";

export default function CreateListingPage() {
  return (
    <AuthGuard>
      <RFQList />
    </AuthGuard>
  );
}