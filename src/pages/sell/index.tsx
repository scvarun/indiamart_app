import AuthGuard from "@/components/AuthGuard";
import Listings from "@/components/Listings/GetListings/GetListings";
import Link from "next/link";

export default function SellPage() {
  return (
    <AuthGuard>
      <Link href="/sell/create-listing">Create Listing</Link>
      <Listings />
    </AuthGuard>
  );
}