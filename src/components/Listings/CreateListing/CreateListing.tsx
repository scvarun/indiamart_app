import {
  CreateListingReq,
  CreateListingRes,
} from "@/models/dto/listings/CreateListing";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { useAuth } from "@/context/auth";
import Tooltip from "../../Tooltip/Tooltip";
import styles from "./CreateListing.module.scss";
import { format, isValid } from "date-fns";
import { useEffect, useState } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { postCreateListing } from "@/repo/listings";
import { ListingPart } from "@/models/ListingPart";
import Link from "next/link";
import { useRouter } from "next/router";

export type KeyType = keyof ListingPart;

export type FieldsToDisplayType = {
  key: keyof ListingPart;
};

const resolver = classValidatorResolver(CreateListingReq);

export default function CreateListing() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    data,
    isLoading,
    mutate: createListing,
  } = useMutation<CreateListingRes, Error, CreateListingReq>({
    mutationKey: ["postCreateListing"],
    mutationFn: postCreateListing,
  });

  const [fieldsToDisplay, updateFieldsToDisplay] = useState<
    FieldsToDisplayType[]
  >([
    { key: "partId" },
    { key: "mfg" },
    { key: "date" },
    { key: "price" },
    { key: "quantity" },
    { key: "comment" },
  ]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateListingReq>({
    resolver,
    defaultValues: {
      uid: user?.uid,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "parts",
  });

  const titleForKey = (key: KeyType): string => {
    switch (key) {
      case "comment":
        return "Comment";
      case "date":
        return "D/C";
      case "mfg":
        return "MFG";
      case "price":
        return "Price";
      case "partId":
        return "Part ID";
      case "quantity":
        return "Quantity";
      default:
        return "Field";
    }
  };

  const keysToShow: KeyType[] = [
    "comment",
    "date",
    "partId",
    "quantity",
    "mfg",
    "price",
  ];

  useEffect(() => {
    console.log(data);
    if (data) router.back();
  }, [data, router]);

  return (
    <>
      <div>
        <Link href="/sell">Back to listings</Link>
      </div>
      <form
        onSubmit={handleSubmit((d) => createListing(d))}
        className={styles.form}
      >
        <table style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>ID</th>
              {fieldsToDisplay.map((field, fieldsIndex) => (
                <th key={"fields-" + fieldsIndex}>
                  <select
                    value={field.key}
                    onChange={(e) => {
                      const fields = [...fieldsToDisplay];
                      fields[fieldsIndex].key = e.target.value as KeyType;
                      updateFieldsToDisplay(fields);
                    }}
                  >
                    {keysToShow.map((option, optionIndex) => (
                      <option
                        key={`option-${fieldsIndex}-${optionIndex}`}
                        value={option}
                      >
                        {titleForKey(option)}
                      </option>
                    ))}
                  </select>
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => {
              const error = (errors.parts || [])[index] || {};
              return (
                <tr key={field.id}>
                  <td>#{index + 1}</td>
                  {fieldsToDisplay.map((e, fieldsIndex) => {
                    switch (e.key) {
                      case "price":
                      case "quantity":
                        return (
                          <td key={`value-${index}-${fieldsIndex}-${e.key}`}>
                            <Tooltip
                              title={error[e.key]?.message || ""}
                              active={error[e.key] !== undefined}
                            >
                              <input
                                type="number"
                                min={1}
                                placeholder="Quantity"
                                {...register(`parts.${index}.${e.key}`, {
                                  valueAsNumber: true,
                                })}
                              />
                            </Tooltip>
                          </td>
                        );
                      case "date":
                        return (
                          <td key={`value-${index}-${fieldsIndex}-${e.key}`}>
                            <Tooltip
                              title={error?.date?.message || ""}
                              active={error?.date !== undefined}
                            >
                              <input
                                type="date"
                                {...register(`parts.${index}.date`)}
                              />
                            </Tooltip>
                          </td>
                        );
                      default:
                        return (
                          <td key={`value-${index}-${fieldsIndex}-${e.key}`}>
                            <Tooltip
                              title={error[e.key]?.message || ""}
                              active={error[e.key] !== undefined}
                            >
                              <input
                                type="text"
                                placeholder={titleForKey(e.key)}
                                {...register(`parts.${index}.${e.key}`)}
                              />
                            </Tooltip>
                          </td>
                        );
                    }
                  })}
                  <td>
                    <button type="button" onClick={() => remove(index)}>
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <Controller
          control={control}
          name="parts"
          render={({ field }) => (
            <button
              type="button"
              disabled={field.value?.length >= 5}
              onClick={() =>
                append({
                  partId: "",
                  price: 0,
                  mfg: "",
                  quantity: 1,
                  date: format(new Date(), "yyyy-MM-dd"),
                })
              }
            >
              Add
            </button>
          )}
        />
        <button type="submit" disabled={!isValid || isLoading}>
          {isLoading ? "Loading..." : "Submit"}
        </button>
      </form>
    </>
  );
}
