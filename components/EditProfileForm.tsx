import { ProfileSchema } from "@/db/schemas";
import { IUser, PHA_LODGES, StatesEnum } from "@/types";
import fetcher from "@/util/fetch";
import { camelToSentenceCase } from "@/util/helpers";
import { DeleteIcon } from "@chakra-ui/icons";
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  Select,
  useToast,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { MdSave } from "react-icons/md";
import useSWR from "swr";

const FormSchema = ProfileSchema.omit({
  roles: true,
  skills: true,
  email: true,
  deverifiedListings: true,
  verifiedListings: true,
  favorites: true,
  ownedListings: true,
  contact: true,
  social: true,
});

export function EditProfileForm({ onToggle }: { onToggle: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful, isSubmitted },
    reset,
    getValues,
    setValue,
  } = useForm({
    resolver: zodResolver(FormSchema),
  });

  const keys = Object.keys(FormSchema.keyof().Values);
  const { data: session } = useSession();
  const {
    data: userData,
    mutate,
    isLoading,
  } = useSWR(`/api/users/${(session?.user as IUser).id}`, fetcher);

  const successToast = useToast({
    colorScheme: "green",
    status: "success",
    title: "Profile Updated",
    description: `Successfully submitted form.`,
  });

  const onSubmit = async (data: IUser["profile"]) => {
    const { ok } = await fetch(`/api/users/${(session?.user as IUser).id}`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    mutate({ data });
    if (ok) {
      onToggle();
      successToast();
    }
  };

  return (
    !isLoading && (
      <form onSubmit={handleSubmit(onSubmit)}>
        {keys.map((field) => (
          <React.Fragment key={field}>
            <FormControl isInvalid={!!errors[field]?.message}></FormControl>
            <FormLabel htmlFor={field}> {camelToSentenceCase(field)}</FormLabel>
            {errors[field] && <span>{errors[field]?.message as string}</span>}
            {field === "lodgeOrChapterState" ? (
              <Select
                key={field}
                id={field}
                maxLength={2}
                autoComplete={"true"}
                defaultValue={"DC"}
                {...register(field)}
                aria-invalid={errors.state ? "true" : "false"}
                // only DC Lodges ATM
                // value={"DC"}
              >
                {StatesEnum.options.map((state) => (
                  <option value={state} key={state}>
                    {state}
                  </option>
                ))}
              </Select>
            ) : field === "lodgeOrChapterNumber" ? (
              <Select
                key={field}
                id={field}
                maxLength={2}
                autoComplete={"true"}
                {...register(field)}
                aria-invalid={errors.state ? "true" : "false"}
              >
                {Object.keys(PHA_LODGES["DC"]).map((number) => {
                  let val = parseInt(number);
                  return (
                    <option value={val} key={val}>
                      {val}
                    </option>
                  );
                })}
              </Select>
            ) : (
              <Input
                id={field}
                autoComplete={"true"}
                defaultValue={userData.profile?.[field]}
                {...register(field)}
                aria-invalid={errors.name ? "true" : "false"}
              />
            )}
          </React.Fragment>
        ))}
        <HStack justify={"space-evenly"} p={3}>
          {isSubmitting ? (
            <Button>Submitting...</Button>
          ) : !isSubmitted ? (
            <Button
              type="submit"
              disabled={Object.keys(errors).length > 0 || isSubmitting}
              leftIcon={<Icon as={MdSave} />}
            >
              Save
            </Button>
          ) : null}
          <Button
            type="reset"
            disabled={isSubmitting}
            leftIcon={<Icon as={DeleteIcon} />}
          >
            Reset
          </Button>
        </HStack>
      </form>
    )
  );
}
