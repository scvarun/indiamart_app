import AuthGuard from "@/components/AuthGuard";
import CreateRFQ from "@/components/RFQs/CreateRFQ/CreateRFQ";
import Link from "next/link";

export default function CreateListingPage() {
  return (
    <AuthGuard>
      <Link href="/buy">Back to listings</Link>
      <CreateRFQ />
    </AuthGuard>
  );
}