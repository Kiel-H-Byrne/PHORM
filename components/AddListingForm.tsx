"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ListingsSchema } from "@/db/schemas";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Heading,
  Input,
  Select,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { geohashForLocation } from "geofire-common";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { Form, useForm } from "react-hook-form";
import { IListing, StatesEnum } from "../types";

const AddListingForm = ({ onDrawerClose }: { onDrawerClose: () => void }) => {
  const {
    register,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    control,
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
    duration: 5000,
    isClosable: true,
  });

  const formRef = useRef();
  const { user } = useAuth();
  const creator = useMemo(
    () =>
      user && {
        id: user.uid,
        name: user.displayName,
        email: user.email,
        image: user.photoURL,
      },
    [user]
  );
  const getPlaceDetails = useCallback(async (address: string) => {
    //  const if all fields filled, make address, pass to geo, create lat/long
    const geocoder = new google.maps.Geocoder();
    const locationDetails = await geocoder.geocode(
      { address: address },
      function (results, status) {
        if (status == "OK" && results) {
          // map.setCenter(results[0].geometry.location);
          // var marker = new google.maps.Marker({
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
      try {
        submitToast();
        //date data, transform, then send.
        const { city, state, zip, street } = data;
        const address = `${street} ${city} ${state} ${zip} `;
        const details = await getPlaceDetails(address);

        // Add description if not provided
        const description =
          data.description || `${data.name} located in ${city}, ${state}`;

        //combine
        const submitData = {
          ...data,
          description,
          creator,
          ...details,
          submitted: new Date(),
          claimsCount: 0,
          claims: [],
        };

        const response = await fetch("/api/listings", {
          method: "POST",
          body: JSON.stringify(submitData),
        });

        if (!response.ok) {
          throw new Error(`Error creating listing: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Error submitting listing:", error);
        alertToast({
          title: "Form Error",
          description:
            error instanceof Error ? error.message : "Failed to create listing",
        });
        throw error;
      }
    },
    [getPlaceDetails, creator, submitToast, alertToast]
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

  return (
    <Box
      borderWidth="1px"
      rounded="lg"
      shadow="1px 1px 3px rgba(0,0,0,0.3)"
      maxWidth={800}
      p={6}
      m="10px auto"
    >
      <Heading as="h2" size="md" mb={4} textAlign="center">
        Add New Business Listing
      </Heading>

      <Form
        onSubmit={submitData}
        encType={"application/json"}
        onSuccess={() => console.log("Form submitted successfully")}
        onError={() => alertToast()}
        control={control}
      >
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
          {/* Business Name */}
          <FormControl isInvalid={!!errors.name} mb={3}>
            <FormLabel htmlFor="name">Business Name</FormLabel>
            <Input
              id="name"
              placeholder="Enter business name"
              autoComplete={"true"}
              {...register("name")}
            />
            <FormErrorMessage>
              {errors.name?.message as string}
            </FormErrorMessage>
          </FormControl>

          {/* Description */}
          <FormControl
            isInvalid={!!errors.description}
            mb={3}
            gridColumn={{ md: "span 2" }}
          >
            <FormLabel htmlFor="description">Description</FormLabel>
            <Textarea
              id="description"
              placeholder="Enter a brief description of the business"
              {...register("description")}
              rows={3}
            />
            <FormErrorMessage>
              {errors.description?.message as string}
            </FormErrorMessage>
          </FormControl>

          {/* Address Section */}
          <Heading
            as="h3"
            size="sm"
            mb={2}
            mt={2}
            gridColumn={{ md: "span 2" }}
          >
            Business Address
          </Heading>

          {/* Street */}
          <FormControl
            isInvalid={!!errors.street}
            mb={3}
            gridColumn={{ md: "span 2" }}
          >
            <FormLabel htmlFor="street">Street Address</FormLabel>
            <Input
              id="street"
              placeholder="123 Main St"
              {...register("street")}
            />
            <FormErrorMessage>
              {errors.street?.message as string}
            </FormErrorMessage>
          </FormControl>

          {/* City */}
          <FormControl isInvalid={!!errors.city} mb={3}>
            <FormLabel htmlFor="city">City</FormLabel>
            <Input id="city" placeholder="City name" {...register("city")} />
            <FormErrorMessage>
              {errors.city?.message as string}
            </FormErrorMessage>
          </FormControl>

          {/* State */}
          <FormControl isInvalid={!!errors.state} mb={3}>
            <FormLabel htmlFor="state">State</FormLabel>
            <Select
              id="state"
              placeholder="Select state"
              {...register("state")}
            >
              {StatesEnum.options.map((state) => (
                <option value={state} key={state}>
                  {state}
                </option>
              ))}
            </Select>
            <FormErrorMessage>
              {errors.state?.message as string}
            </FormErrorMessage>
          </FormControl>

          {/* Zip */}
          <FormControl isInvalid={!!errors.zip} mb={3}>
            <FormLabel htmlFor="zip">Zip Code</FormLabel>
            <Input
              id="zip"
              type="number"
              placeholder="12345"
              {...register("zip", {
                valueAsNumber: true,
              })}
            />
            <FormErrorMessage>{errors.zip?.message as string}</FormErrorMessage>
          </FormControl>
        </Grid>

        <Box display="flex" justifyContent="space-between" mt={6}>
          <Button type="reset" colorScheme="gray" variant="outline" width="48%">
            Reset
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isSubmitting}
            isDisabled={Object.keys(errors).length > 0}
            width="48%"
          >
            Submit
          </Button>
        </Box>
      </Form>
    </Box>
  );
};

export default memo(AddListingForm);
