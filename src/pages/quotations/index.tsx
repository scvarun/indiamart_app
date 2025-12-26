import AuthGuard from "@/components/AuthGuard";
import QuotationList from "@/components/Quotations/QuotationList/QuotationList";
import Link from "next/link";

export default function SellPage() {
  return (
    <AuthGuard>
      <Link href="/buy">Buy</Link>
      <Link href="/sell">Sell</Link>
      <QuotationList />
    </AuthGuard>
  );
}