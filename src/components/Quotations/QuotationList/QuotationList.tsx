import { createContext, useContext, useEffect, useMemo, useState } from "react";
import styles from "./QuotationList.module.scss";
import clsx from "clsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getQuotationList } from "@/repo/quotations";
import { Quotation } from "@/models/Quotation";
import { getMessages } from "@/repo/chatMessages";
import { postChatMessage } from "@/repo/chatMessages";
import { ChatMessage } from "@/models/ChatMessage";
import { AuthContext } from "@/context/auth";

type QuotationContextType = {
  messagePosted: number;
  setMessagePosted: React.Dispatch<React.SetStateAction<number>>;
  activeQuotation: string | null;
  setActiveQuotation: (qid: string) => void;
};

const initValue: QuotationContextType = {
  messagePosted: 0,
  activeQuotation: null,
  setMessagePosted: (n) => {},
  setActiveQuotation: (q) => null,
};

const QuotationContext = createContext<QuotationContextType>(initValue);

export default function QuotationList() {
  const [messagePosted, setMessagePosted] = useState(0);
  const [activeQuotation, setActiveQuotation] = useState<string | null>(null);
  return (
    <QuotationContext.Provider
      value={{
        messagePosted,
        setMessagePosted,
        activeQuotation,
        setActiveQuotation,
      }}
    >
      <div className={styles.quotationContainer}>
        <QuotationSidebar />
        <QuotationMessages />
      </div>
    </QuotationContext.Provider>
  );
}

function QuotationSidebar() {
  const { activeQuotation, setActiveQuotation } = useContext(QuotationContext);
  const [query, setQuery] = useState({
    limit: 5,
    page: 1,
  });

  const { data } = useQuery({
    queryKey: ["getQuotationList", query],
    queryFn: () => getQuotationList(query),
  });

  useEffect(() => {
    if (
      data &&
      !activeQuotation &&
      data.quotations.length > 0 &&
      data.quotations[0].id
    ) {
      setActiveQuotation(data.quotations[0].id);
    }
  }, [activeQuotation, data, setActiveQuotation]);

  return (
    <div className={styles.quotationSidebar}>
      {(data?.quotations || []).map((e, i) => (
        <QuotationSidebarItem quotation={e} key={i} />
      ))}
    </div>
  );
}

function QuotationSidebarItem(props: { quotation: Quotation }) {
  const { activeQuotation } = useContext(QuotationContext);
  return (
    <div
      key={`quotations-sidebar-item-${props.quotation.id}`}
      className={clsx({
        [styles.quotationSidebarItem]: true,
        [styles.quotationSidebarItemReply]:
          activeQuotation === props.quotation.id,
      })}
    >
      <h5>
        {props.quotation.partId} - {props.quotation.quantity} items
      </h5>
      <small>
        {props.quotation.createdAt &&
          props.quotation.createdAt.toDate().toISOString()}{" "}
        - {props.quotation.userName}
      </small>
    </div>
  );
}

function QuotationMessages() {
  const { activeQuotation, messagePosted } = useContext(QuotationContext);
  const [messages, setMessages] = useState(new Map<Number, ChatMessage[]>());

  const [query, setQuery] = useState({
    limit: 5,
    page: 1,
  });

  const { data, refetch: fetchMessages } = useQuery({
    enabled: false,
    queryKey: ["getMessages", query, activeQuotation !== null],
    queryFn: () => {
      return getMessages(activeQuotation || "", query);
    },
  });

  useEffect(() => {
    setMessages((m) => {
      return new Map(m.set(query.page, data?.messages || []));
    });
  }, [data, query.page]);

  const hasMorePages = useMemo(() => {
    return data && data?.total > 0 ? (query.page * query.limit) < data?.total  : false;
  }, [data, query.limit, query.page])

  useEffect(() => {
    if (activeQuotation) fetchMessages();
  }, [activeQuotation, fetchMessages, messagePosted, query.page]);

  return (
    <div className={styles.quotationMessageContainer}>
      <div className={styles.quotationMessages}>
        {Array.from(messages.keys()).length === 0 && <p>No messages to display</p>}
        {Array.from(messages.keys()).map((e) => (
          <>
            {messages.get(e)?.map((m) => (
              <QuotationMessageItem key={m.id} message={m} />
            ))}
          </>
        ))}
        {hasMorePages && (
          <button 
            className={styles.loadMoreBtn}
            onClick={() => {
              setQuery((q) => ({
                ...q,
                page: q.page + 1
              }))
            }}>
            Load More
          </button>
        )}
      </div>
      <QuotationMessageBox />
    </div>
  );
}

function QuotationMessageBox() {
  const { activeQuotation, setMessagePosted } = useContext(QuotationContext);
  const [message, setMessage] = useState("");

  const { data, mutate: postMessage } = useMutation({
    mutationKey: ["postChatMessage"],
    mutationFn: () => {
      return postChatMessage(activeQuotation || "", { message });
    },
  });

  useEffect(() => {
    if (data) {
      setMessage('');
      setMessagePosted((m) => m + 1);
    }
  }, [data, setMessagePosted]);

  return (
    <form
      className={styles.quotationMessageBox}
      onSubmit={(e) => {
        e.preventDefault();
        postMessage();
      }}
    >
      <textarea
        className={styles.quotationMessageBoxTextArea}
        maxLength={1000}
        minLength={3}
        onChange={(e) => setMessage(e.target.value)}
        value={message}
      ></textarea>
      <button type="submit">Send</button>
    </form>
  );
}

function QuotationMessageItem(props: { message: ChatMessage }) {
  const { user } = useContext(AuthContext);
  return (
    <div
      className={clsx({
        [styles.quotationMessageItem]: true,
        [styles.quotationMessageItemReply]: user?.uid === props.message.uid,
      })}
    >
      <p>{props.message.message}</p>
      <small>{props.message.createdAt?.toDate().toDateString()}</small>
    </div>
  );
}
