import { useMutation, useQuery } from "@tanstack/react-query";
import { ListingPart } from "@/models/ListingPart";
import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "@/context/auth";
import SendQuotation from "@/components/SendQuoation/SendQuotation";
import { useRouter } from "next/router";
import { deleteMatch, getMatchesList } from "@/repo/matches";
import Link from "next/link";
import { GetMatchingListingsRes } from "@/models/dto/auth/GetMatchingListing";

export default function GetMatchesList() {
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

  const { data, error, isLoading, refetch: fetchMatchingListings,  } = useQuery<GetMatchingListingsRes, Error>({
    queryKey: ["getMatchesList", query],
    queryFn: () => getMatchesList(query),
    keepPreviousData: false,
  });

  const pages = useMemo(() => {
    const total = data?.total || 0;
    return total > 0
      ? Array.from(Array(Math.ceil(total / query.limit)).keys()).map(
          (e) => e + 1
        )
      : [];
  }, [data?.total, query]);

  return (
    <>
      {error && <p>{error.message}</p>}
      {isLoading && <p>Loading...</p>}
      {!isLoading && !error && (
        <>
          {!data.listings.length && <p>No matches to display</p>}
          {data.listings.length > 0 && (
            <>
              <ul>
                {data.listings.map((e) => (
                  <ListingsItem
                    listing={e}
                    key={e.id}
                    openQuotationModal={(l) => setSendQuotationListingPart(l)}
                    refreshList={() => fetchMatchingListings()}
                  />
                ))}
              </ul>
              <ul>
                {pages.map((e) => (
                  <li key={`page-${e}`}>
                    <Link href={{ query }}>{e}</Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          
        </>
      )}
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
  listing: ListingPart;
  openQuotationModal: (l: ListingPart) => void;
  refreshList: () => void;
}) {
  const { data, isLoading: postDeleteMatchLoading, mutate: postDeleteMatch } = useMutation({
    mutationFn: deleteMatch,
  });
  const { user } = useContext(AuthContext);
  const { listing } = props;

  useEffect(() => {
    if(data) props.refreshList();
  }, [data, props]);
  
  return (
    <li>
      {props.listing.user?.firstName} {props.listing.user?.lastName}
      <table
        style={{
          width: "100%",
        }}
      >
        <tbody>
          <tr key={listing.id}>
            <td>{listing.partId}</td>
            <td>{listing.quantity}</td>
            <td>{listing.comment}</td>
            <td>{listing.date}</td>
            <td>
              {user?.uid !== listing.uid && (
                <button
                  type="button"
                  disabled={postDeleteMatchLoading}
                  onClick={() => {
                    props.openQuotationModal(listing);
                  }}
                >
                  Send Quotation
                </button>
              )}
            </td>
            <td>
              {user?.uid !== listing.uid && (
                <button
                  type="button"
                  disabled={postDeleteMatchLoading}
                  onClick={() => {
                    postDeleteMatch({
                      listing_id: listing.id,
                      rfq_parts: listing.matches?.map((e) => e.id || ""),
                    });
                  }}
                >
                  {postDeleteMatchLoading ? "Loading..." : "Delete Match"}
                </button>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </li>
  );
}
