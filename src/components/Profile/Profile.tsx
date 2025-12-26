import { AuthContext } from "@/context/auth";
import { postSaveUserProfile } from "@/repo/auth";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { useMutation } from "@tanstack/react-query";
import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import styles from './Profile.module.scss';
import { PostSaveProfileReq } from "@/models/dto/auth/SaveProfile";

const resolver = classValidatorResolver(PostSaveProfileReq);

export default function Profile() {
  const auth = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<PostSaveProfileReq>({
    resolver,
    defaultValues: {},
  });

  const {
    data,
    isLoading,
    mutate: createListing,
  } = useMutation({
    mutationKey: ["postSaveUserProfile"],
    mutationFn: postSaveUserProfile,
  });

  useEffect(() => {
    if(auth.userProfile) {
      setValue('firstName', auth.userProfile.firstName);
      setValue('lastName', auth.userProfile.lastName);
    }
  }, [auth.userProfile, setValue]);

  return (
    <>
      <form onSubmit={handleSubmit(d => postSaveUserProfile(d))}>
        <div className={styles.inputGroup}>
          <label>First Name</label>
          <input type="text" {...register('firstName')} />
          {errors.firstName && (
            <p>{errors.firstName.message}</p>
          )} 
        </div>

        <div className={styles.inputGroup}>
          <label>Last Name</label>
          <input type="text" {...register('lastName')} />
          {errors.lastName && (
            <p>{errors.lastName.message}</p>
          )} 
        </div>

        <p>Current plan: </p>

        <button type="submit">Update</button>
      </form>
    </>
  );
}
