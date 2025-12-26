import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { useAuth } from "@/context/auth";
import Tooltip from "../../Tooltip/Tooltip";
import styles from "./CreateRFQ.module.scss";
import { format } from "date-fns";
import { ListingPart } from "@/models/ListingPart";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { CreateRFQReq, CreateRFQRes } from "@/models/dto/rfq/CreateRFQ";
import { uid } from "uid";
import { useMutation } from "@tanstack/react-query";
import { postCreateRFQ } from "@/repo/rfq";
import { useRouter } from "next/router";

const resolver = classValidatorResolver(CreateRFQReq);

type KeyType = keyof ListingPart;
type FieldsToDisplayType = {
  key: keyof ListingPart;
};

export default function CreateRFQ() {
  const { user } = useAuth();
  const router = useRouter();
  const [fieldsToDisplay, updateFieldsToDisplay] = useState<
    FieldsToDisplayType[]
  >([
    { key: "partId" },
    { key: "mfg" },
    { key: "quantity" },
    { key: "price" },
    { key: "date" },
    { key: "comment" },
  ]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    getValues,
    setValue,
  } = useForm<CreateRFQReq>({
    resolver,
    defaultValues: {
      uid: user?.uid,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "parts",
  });

  const {
    isLoading,
    error,
    data,
    mutate: createRFQ,
  } = useMutation<CreateRFQRes, Error, CreateRFQReq>({
    mutationKey: ["postCreateRFQ"],
    mutationFn: postCreateRFQ,
  });

  useEffect(() => {
    if (data) router.push("/buy");
  }, [data, router]);

  const submitForm = (data: CreateRFQReq) => {
    const rfq = getValues();
    rfq.parts = rfq.parts.map((e) => {
      e.uid = undefined;
      return e;
    });
    createRFQ(rfq);
  };

  const titleForKey = (key: KeyType): string => {
    switch (key) {
      case "partId":
        return "PartID";
      case "mfg":
        return "MFG";
      case "quantity":
        return "Quantity";
      case "price":
        return "Price";
      case "date":
        return "Date";
      case "comment":
        return "Comment";
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

  const removeSelected = () => {
    const selected = getValues("parts").reduce((p: number[], c, i) => {
      if (c.selected) p.push(i);
      return p;
    }, []);
    remove(selected);
  };

  const targetSelectAll = (checked: boolean) => {
    const parts = getValues("parts");
    parts.forEach((e) => (e.selected = checked));
    setValue("parts", parts);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit((data) => submitForm(data))}
        className={styles.form}
      >
        <table style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    targetSelectAll(e.target.checked);
                  }}
                />
              </th>
              {fieldsToDisplay.map((field, fieldsIndex) => (
                <th key={"fields-" + fieldsIndex}>
                  <select
                    value={field.key}
                    style={{
                      display: "block",
                      margin: 10,
                    }}
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
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => {
              const error = (errors.parts || [])[index] || {};
              return (
                <tr key={field.id} id={field.id}>
                  <td>
                    <input
                      type="checkbox"
                      {...register(`parts.${index}.selected`)}
                    />
                  </td>
                  {fieldsToDisplay.map((e, fieldsIndex) => {
                    switch (e.key) {
                      case "quantity":
                      case "price":
                        return (
                          <td key={`value-${index}-${fieldsIndex}-${e.key}`}>
                            <Tooltip
                              title={error[e.key]?.message || ""}
                              active={error[e.key] !== undefined}
                            >
                              <input
                                type="number"
                                min={1}
                                placeholder={titleForKey(e.key)}
                                id={`parts.${index}.${e.key}`}
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
                                id={`parts.${index}.${e.key}`}
                              />
                            </Tooltip>
                          </td>
                        );
                      // case "comment":
                      // case "createdAt":
                      // case "id":
                      // case "mfg":
                      // case "partId":
                      // case "uid":
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
                                id={`parts.${index}.${e.key}`}
                                // @ts-ignore
                                // TODO: FIX THIS
                                {...register(`parts.${index}.${e.key}`)}
                              />
                            </Tooltip>
                          </td>
                        );
                    }
                  })}
                </tr>
              );
            })}
            <tr>
              <td></td>
              {fieldsToDisplay.map((e, i) => (
                <td key={"new-item-input-" + i}>
                  <div style={{ padding: 10 }}>
                    <input
                      type="text"
                      placeholder={titleForKey(e.key)}
                      onKeyDown={(key) => {
                        if (
                          String.fromCharCode(key.keyCode).match(/(\w|\s)/g) ===
                          null
                        )
                          return;
                        append({
                          id: uid(),
                          partId: "",
                          price: 0,
                          mfg: "",
                          quantity: 1,
                          date: format(new Date(), "yyyy-MM-dd"),
                          selected: false,
                        });
                        setTimeout(() => {
                          const el = document.getElementById(
                            `parts.${fields.length}.${e.key}`
                          );
                          if (el) el.focus();
                        }, 10);
                      }}
                    />
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        {error && <p>{error.message}</p>}
        <button type="button" onClick={(e) => removeSelected()}>
          Remove Selected
        </button>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : "Create RFQ"}
        </button>
      </form>
    </>
  );
}
