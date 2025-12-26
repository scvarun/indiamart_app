import AuthGuard from "@/components/AuthGuard";
import EditListing from "@/components/Listings/EditListing/EditListing";

export default function EditListingPage() {
  return (
    <AuthGuard>
      <EditListing />
    </AuthGuard>
  );
}