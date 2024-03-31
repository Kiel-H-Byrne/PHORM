"use client";

import { ListingTypeEnum, ListingTypeList } from "@/db/listings";
import { ListingsSchema } from "@/db/schemas";
import { toSentenceCase } from "@/util/helpers";
import {
  Box,
  Button,
  FormLabel,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Select,
  SlideFade,
  Text,
  useToast,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { geohashForLocation } from "geofire-common";
import { useSession } from "next-auth/react";
import { ReactNode, memo, useCallback, useEffect, useRef } from "react";
import { FieldError, FieldErrorsImpl, Form, Merge, useForm } from "react-hook-form";
import { mutate } from "swr";
import { IListing, StatesEnum } from "../types";

const ValidationMessage = ({
  children,
}: {
  children: ReactNode | FieldError | Merge<FieldError, FieldErrorsImpl<any>>;
}) => (
  <Text fontSize={10} color={"red"}>
    {children}
  </Text>
);

const AddListingForm = ({ onDrawerClose }: { onDrawerClose: () => void }) => {
  const {
    register,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    control,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(ListingsSchema),
    mode: "all",
    // defaultValues: {
    //   street: "33 Compass Lane",
    //   name: "The Square Club",
    //   city: "Luxe",
    //   state: "XX",
    //   zip: 12345
    // }
  });
  const submitToast = useToast({
    colorScheme: "yellow",
    status: "info",
    title: "Submitting",
    description: `Submitting information...`,
  });

  const successToast = useToast({
    colorScheme: "green",
    status: "success",
    title: "Form Submitted",
    description: `Successfully submitted form.`,
  });

  const alertToast = useToast({
    colorScheme: "red",
    status: "error",
    title: "Form Error",
    description: `Form Error`,
  });

  const formRef = useRef();
  const { data } = useSession();
  const creator = data?.user;
  const getPlaceDetails = useCallback(async (address: string) => {
    //  const if all fields filled, make address, pass to geo, create lat/long
    const geocoder = new google.maps.Geocoder();
    const locationDetails = await geocoder.geocode(
      { address: address },
      function (results, status) {
        if (status == "OK" && results) {
          // map.setCenter(results[0].geometry.location);
          // var marker = new google.maps.marker.AdvancedMarkerElement({
          //     map: map,
          //     position: results[0].geometry.location
          // });
        } else {
          alert(
            "Geocode was not successful for the following reason: " + status
          );
        }
      }
    );
    const {
      geometry: { location },
      place_id,
    } = locationDetails.results[0];
    const { lat, lng } = location;
    const geoHash = geohashForLocation([lat(), lng()]);
    return { lat: lat(), lng: lng(), geoHash, place_id };
  }, []);

  const submitData = useCallback(
    async ({ data }: { data: IListing }) => {
      //date data, transform, then send.
      const { city, state, zip, street } = data;
      const address = `${street} ${city} ${state} ${zip} `;
      const details = await getPlaceDetails(address);
      //combine
      const submitData = { ...data, ...{ creator }, ...details };

      mutate("/api/listings", JSON.stringify(submitData));

      await fetch("/api/listings", {
        method: "POST",
        body: JSON.stringify(submitData),
      });
    },
    [getPlaceDetails, creator]
  );

  useEffect(() => {
    isSubmitting && Object.keys(errors).length !== 0 && submitToast();
    if (isSubmitSuccessful) {
      reset();
      onDrawerClose();
      successToast();
    }
  }, [
    isSubmitSuccessful,
    isSubmitting,
    submitToast,
    reset,
    onDrawerClose,
    successToast,
    errors,
  ]);
  const { onChange } = register("type");
  const listingTypeValue = watch("type");
  const valueIsRetail = listingTypeValue === ListingTypeEnum.RETAIL;
  const valueIsContractor = listingTypeValue === ListingTypeEnum.CONTRACTOR;
  const valueIsNotOnline = listingTypeValue !== ListingTypeEnum.ONLINE;

  const handleChange = (type: ListingTypeEnum) => {
    setValue("type", type);
  };
  return (
    <Box
      borderWidth="1px"
      rounded="lg"
      shadow="1px 1px 3px rgba(0,0,0,0.3)"
      p={2}
      m="0 auto"
    >
      {/* form fields based on value of "type" */}
      <Form
        onSubmit={submitData}
        encType={"application/json"}
        onSuccess={() => console.log("Firing at all?")}
        onError={() => alertToast()}
        control={control}
      >
        <FormLabel htmlFor="type">Business Type</FormLabel>
        <RadioGroup
          id="type"
          {...register("type")}
          onChange={handleChange}
          aria-invalid={errors.type ? "true" : "false"}
        >
          <HStack spacing={2}>
            {ListingTypeList.map((type) => (
              <Radio value={type} key={type}>
                {toSentenceCase(type)}
              </Radio>
            ))}
          </HStack>
        </RadioGroup>

        <FormLabel htmlFor="name">Business Name</FormLabel>
        {errors.name && (
          <ValidationMessage>{errors.name.message}</ValidationMessage>
        )}
        <Input
          id="name"
          autoComplete={"true"}
          {...register("name")}
          aria-invalid={errors.name ? "true" : "false"}
        />
        <Box>
          <FormLabel htmlFor="url">URL</FormLabel>
          {errors.url && (
            <ValidationMessage>
              {errors.url.message as string}
            </ValidationMessage>
          )}

          <Input
            id="url"
            type="number"
            {...register("url", {
              valueAsNumber: true,
            })}
            aria-invalid={errors.url ? "true" : "false"}
          />
        </Box>
        {valueIsRetail && (
          <SlideFade in={valueIsRetail}>
            <FormLabel htmlFor="street">Street</FormLabel>
            {errors.street && (
              <ValidationMessage>
                {errors.street.message as string}
              </ValidationMessage>
            )}
            <Input
              id="street"
              {...register("street")}
              aria-invalid={errors.street ? "true" : "false"}
            />

            <FormLabel htmlFor="city">City</FormLabel>
            {errors.city && (
              <ValidationMessage>
                {errors.city.message as string}
              </ValidationMessage>
            )}
            <Input
              id="city"
              {...register("city")}
              aria-invalid={errors.city ? "true" : "false"}
            />

            <FormLabel htmlFor="state">State</FormLabel>
            {errors.state && (
              <ValidationMessage>
                {errors.state.message as string}
              </ValidationMessage>
            )}
            <Select
              id="state"
              maxLength={2}
              autoComplete={"true"}
              {...register("state")}
              aria-invalid={errors.state ? "true" : "false"}
            >
              {StatesEnum.options.map((state) => (
                <option value={state} key={state}>
                  {state}
                </option>
              ))}
            </Select>
          </SlideFade>
        )}
        {valueIsNotOnline && (
          <SlideFade in={valueIsNotOnline}>
            <FormLabel htmlFor="zip">Zip</FormLabel>
            {errors.zip && (
              <ValidationMessage>
                {errors.zip.message as string}
              </ValidationMessage>
            )}

            <Input
              id="zip"
              type="number"
              {...register("zip", {
                valueAsNumber: true,
              })}
              aria-invalid={errors.zip ? "true" : "false"}
            />
          </SlideFade>
        )}
        {valueIsContractor && (
          <SlideFade in={valueIsContractor}>
            <FormLabel htmlFor="serviceRadius">
              Service Area (in miles from zipcode)
            </FormLabel>
            {errors.serviceRadius && (
              <ValidationMessage>
                {errors.serviceRadius.message as string}
              </ValidationMessage>
            )}
            <Input
              id="serviceRadius"
              {...register("serviceRadius")}
              type="number"
              aria-invalid={errors.serviceRadius ? "true" : "false"}
            />
          </SlideFade>
        )}
        <Box justifyContent={"space-between"} margin="auto">
          <Button type="reset" colorScheme="mwphgldc.blue" variant={"outline"}>
            Reset
          </Button>
          <Button
            type="submit"
            colorScheme="mwphgldc.blue"
            isDisabled={Object.keys(errors).length > 0}
          >
            Submit
          </Button>
        </Box>
      </Form>
    </Box>
  );
};

export default memo(AddListingForm);
