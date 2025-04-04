import { useAuth } from "@/contexts/AuthContext";
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
import React from "react";
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
  const types = FormSchema.shape;
  const { user } = useAuth();

  const {
    data: userData,
    mutate,
    isLoading,
  } = useSWR(`/api/users/${user?.uid}`, fetcher);

  const successToast = useToast({
    colorScheme: "green",
    status: "success",
    title: "Profile Updated",
    description: `Successfully submitted form.`,
  });

  const onSubmit = async (data: Partial<IUser["profile"]>) => {
    try {
      console.log("Submitting profile data:", data);
      const response = await fetch(`/api/users/${user?.uid}`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error("Error updating profile:", response.statusText);
        return;
      }

      // Update the local data
      mutate();

      // Close the form and show success message
      onToggle();
      successToast();
    } catch (error) {
      console.error("Error in profile update:", error);
    }
  };

  // Initialize form with user data when it's loaded
  React.useEffect(() => {
    if (userData && userData.profile) {
      console.log("Setting form values from user data:", userData.profile);
      // Reset form with user profile data
      reset(userData.profile);
    } else if (!isLoading) {
      console.log("No profile data found, using defaults");
      // Set default values if no profile exists
      reset({
        firstName: "",
        lastName: "",
        location: "",
        bio: "",
        orgs: [],
      });
    }
  }, [userData, isLoading, reset]);

  // Show loading state or form
  return !isLoading ? <Form1 /> : <div>Loading profile data...</div>;

  function Form1() {
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        {keys.map((field) => {
          return (
            <React.Fragment key={field}>
              <FormControl isInvalid={!!errors[field]?.message}></FormControl>
              <FormLabel htmlFor={field}>
                {" "}
                {camelToSentenceCase(field)}
              </FormLabel>
              {errors[field] && <span>{errors[field]?.message as string}</span>}
              {field === "state" ? (
                <Select
                  key={field}
                  id={field}
                  maxLength={2}
                  autoComplete={"true"}
                  defaultValue={"DC"}
                  {...register(field)}
                  aria-invalid={errors.state ? "true" : "false"}
                >
                  {StatesEnum.options.map((state) => (
                    <option value={state} key={state}>
                      {state}
                    </option>
                  ))}
                </Select>
              ) : field === "number" ? (
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
                  // Use controlled inputs instead of defaultValue for better handling of undefined values
                  value={getValues(field) || ""}
                  {...register(field)}
                  aria-invalid={errors.name ? "true" : "false"}
                />
              )}
            </React.Fragment>
          );
        })}
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
    );
  }
}
