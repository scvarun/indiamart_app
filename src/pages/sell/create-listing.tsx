import AuthGuard from "@/components/AuthGuard";
import CreateListing from "@/components/Listings/CreateListing/CreateListing";

export default function CreateListingPage() {
  return (
    <AuthGuard>
      <CreateListing />
    </AuthGuard>
  );
}