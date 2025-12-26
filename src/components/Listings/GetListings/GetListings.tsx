import { getListings } from "@/repo/listings";
import { useQuery } from "@tanstack/react-query";
import { UserProfile } from "@/models/User";
import { ListingPart } from "@/models/ListingPart";
import { useContext, useMemo, useState } from "react";
import { AuthContext } from "@/context/auth";
import SendQuotation from "@/components/SendQuoation/SendQuotation";
import { useRouter } from "next/router";

export default function Listings() {
  const router = useRouter();
  const [sendQuotationListingPart, setSendQuotationListingPart] =
    useState<ListingPart>();

  const query = useMemo(() => {
    return {
      ...router.query,
      limit: Number(router.query.limit) || 10,
      page: Number(router.query.page) || 1,
    };
  }, [router.query]);

  const { data } = useQuery({
    queryKey: ["getListings", query],
    queryFn: getListings,
  });

  const pages = useMemo(() => {
    const total = data?.total || 0;
    return total > 0
      ? Array.from(Array(Math.ceil(total / query.limit)).keys())
      : [];
  }, [data?.total, query]);

  return (
    <>
      <ul>
        {(data?.listings || []).map((e) => (
          <ListingsItem
            listing={e}
            key={e.id}
            openQuotationModal={(l) => setSendQuotationListingPart(l)}
          />
        ))}
      </ul>

      {sendQuotationListingPart && (
        <SendQuotation
          listingPart={sendQuotationListingPart}
          closeQuotationModal={() => setSendQuotationListingPart(undefined)}
        />
      )}
    </>
  );
}

function ListingsItem(props: {
  listing: UserProfile;
  openQuotationModal: (l: ListingPart) => void;
}) {
  const { user } = useContext(AuthContext);

  return (
    <li>
      {props.listing.firstName} {props.listing.lastName}
      <table
        style={{
          width: "100%",
        }}
      >
        <tbody>
          {props.listing.listing_parts_items?.map((listingPart) => (
            <tr key={listingPart.id}>
              <td>{listingPart.partId}</td>
              <td>{listingPart.quantity}</td>
              <td>{listingPart.comment}</td>
              <td>{listingPart.date}</td>
              <td>
                {user?.uid !== listingPart.uid && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      props.openQuotationModal(listingPart);
                    }}
                  >
                    Send Quotation
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </li>
  );
}
