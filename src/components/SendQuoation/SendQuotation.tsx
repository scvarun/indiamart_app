import { AuthContext } from "@/context/auth";
import { ListingPart } from "@/models/ListingPart";
import { CreateQuotationReq, CreateQuotationRes } from "@/models/dto/quotations/CreateQuotation";
import { postCreateQuotation } from "@/repo/quotations";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { useMutation } from "@tanstack/react-query";
import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import styles from './SendQuotation.module.scss';
import { RFQPart } from "@/models/RFQPart";

const resolver = classValidatorResolver(CreateQuotationReq);

export default function SendQuotation({
    listingPart,
    closeQuotationModal,
  }: {
    listingPart: ListingPart | RFQPart;
    closeQuotationModal: () => void;
  }) {
    const { user } = useContext(AuthContext);
  
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<CreateQuotationReq>({
      resolver,
      defaultValues: {
        partId: listingPart.partId,
        quantity: listingPart.quantity,
        mfg: listingPart.mfg,
        date: listingPart.date,
        price: listingPart.price,
        participants: [listingPart.uid, user?.uid || ''],
      },
    });
  
    const {
      data,
      isLoading,
      mutate: createQuotation,
    } = useMutation<CreateQuotationRes, Error, CreateQuotationReq>({
      mutationKey: ["postCreateQuotation"],
      mutationFn: postCreateQuotation,
    });
  
    const handleSubmitQuotation = async (quote: CreateQuotationReq) => {
      createQuotation(quote);
    };
  
    useEffect(() => {
      if (data) {
        closeQuotationModal();
      }
    }, [closeQuotationModal, data]);
  
    return (
      <>
        <div
          className={styles.backdrop}
          onClick={() => closeQuotationModal()}
        ></div>
        <form
          className={styles.formModal}
          onSubmit={handleSubmit((e) => handleSubmitQuotation(e))}
        >
          <button onClick={() => closeQuotationModal()}>
            Close
          </button>
          <div>
            <label>Part Id</label>
            <input
              type="text"
              key={`quote-${listingPart.uid}-partId`}
              {...register("partId")}
            />
            {errors.partId && <p>{errors.partId.message}</p>}
          </div>
          <div className={styles.row}>
            <div>
              <label>MFG</label>
              <input
                type="text"
                key={`quote-${listingPart.uid}-mfg`}
                {...register("mfg")}
              />
              {errors.mfg && <p>{errors.mfg.message}</p>}
            </div>
            <div>
              <label>D/C</label>
              <input type="text" {...register("date")} />
              {errors.date && <p>{errors.date.message}</p>}
            </div>
  
            <div>
              <label>Quantity</label>
              <input
                type="number"
                {...register("quantity", {
                  valueAsNumber: true,
                })}
              />
              {errors.quantity && <p>{errors.quantity.message}</p>}
            </div>
            <div>
              <label>Price</label>
              <input
                type="number"
                {...register("price", {
                  valueAsNumber: true,
                })}
              />
              {errors.price && <p>{errors.price.message}</p>}
            </div>
          </div>
          <button type="submit">{isLoading ? "Loading..." : "Submit"}</button>
        </form>
      </>
    );
  }
  