import SendQuotation from "@/components/SendQuoation/SendQuotation";
import { AuthContext } from "@/context/auth";
import { RFQPart } from "@/models/RFQPart";
import GetRFQListRes from "@/models/dto/rfq/GetRFQList";
import { getRFQList } from "@/repo/rfq";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useMemo, useState } from "react";

export default function RFQList() {
  const router = useRouter();
  const [sendQuotationRFQPart, setSendQuotationRFQPart] = useState<RFQPart>();

  const query = useMemo(() => {
    return {
      ...router.query,
      limit: Number(router.query.limit) || 10,
      page: Number(router.query.page) || 1,
    };
  }, [router.query]);

  const { data } = useQuery<GetRFQListRes, Error>({
    queryKey: ["getRFQList", query],
    queryFn: () => getRFQList(query),
  });

  const pages = useMemo(() => {
    const total = data?.total || 0;
    return total > 0
      ? Array.from(Array(Math.ceil(total / Number(query.limit))).keys())
      : [];
  }, [data?.total, query]);

  const closeQuotationModal = () => {
    setSendQuotationRFQPart(undefined);
    router.push("/quotations");
  };

  return (
    <>
      <Link href="/buy/create-rfq">Create RFQ</Link>
      <ul>
        {data?.rfq.map((e) => (
          <RFQListItem
            key={e.id}
            rfq={e}
            openQuotationModal={(r) => setSendQuotationRFQPart(r)}
          />
        ))}
      </ul>
      <div>
        {pages.map((e) => (
          <Link key={e} href={{ query: { ...query, page: e + 1 } }}>
            {e + 1}
          </Link>
        ))}
      </div>
      {sendQuotationRFQPart && (
        <SendQuotation
          listingPart={sendQuotationRFQPart}
          closeQuotationModal={closeQuotationModal}
        />
      )}
    </>
  );
}

const RFQListItem: React.FC<{
  rfq: RFQPart;
  openQuotationModal: (l: RFQPart) => void;
}> = (props) => {
  const { user } = useContext(AuthContext);
  return (
    <li>
      <p>
        {props.rfq.user?.firstName} {props.rfq.user?.lastName}
      </p>
      <table style={{ width: "100%" }}>
        <tbody>
          <tr key={props.rfq.id}>
            <td>{props.rfq.partId}</td>
            <td>{props.rfq.quantity}</td>
            <td>{props.rfq.comment}</td>
            <td>{props.rfq.date}</td>
            <td>{props.rfq.createdAt?.toDate().toISOString()}</td>
            <td>
              {props.rfq.user?.uid !== user?.uid && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    props.openQuotationModal(props.rfq);
                  }}
                >
                  Send Quotation
                </button>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </li>
  );
};
