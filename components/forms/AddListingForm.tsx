"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ListingsSchema } from "@/db/schemas";
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  HStack,
  Heading,
  Input,
  Progress,
  Select,
  SimpleGrid,
  Text,
  Textarea,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { geohashForLocation } from "geofire-common";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, Form, useForm } from "react-hook-form";
import { IListing, StatesEnum } from "../../types";

interface AddListingFormProps {
  onDrawerClose: () => void;
}

// Additional user-friendly fields for the wizard only
type WizardOnly = {
  businessType?: "Service" | "Retail" | "Trade";
  contactName?: string;
  services?: string[];
};

/**
 * AddListingForm
 * A 3-step, user-friendly wizard to add a business listing.
 * Steps:
 * 1) Business Information
 * 2) Contact & Location
 * 3) Services & Details
 */
const AddListingForm = ({ onDrawerClose }: AddListingFormProps) => {
  const {
    register,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    control,
    trigger,
  } = useForm<Partial<IListing> & WizardOnly>({
    resolver: zodResolver(ListingsSchema),
    mode: "all",
  });

  const submitToast = useToast({
    colorScheme: "yellow",
    status: "info",
    title: "Submitting",
    description: `Submitting information...`,
    duration: 3000,
    isClosable: true,
  });

  const successToast = useToast({
    colorScheme: "green",
    status: "success",
    title: "Form Submitted",
    description: `Successfully submitted form.`,
    duration: 5000,
    isClosable: true,
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
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const BUSINESS_TYPES: WizardOnly["businessType"][] = [
    "Service",
    "Retail",
    "Trade",
  ];
  const SERVICES_OPTIONS = [
    "Plumbing",
    "Catering",
    "Design",
    "Consulting",
    "IT Services",
    "Construction",
    "Retail",
  ] as const;
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
    if (!window.google || !window.google.maps) {
      throw new Error("Google Maps API not loaded");
    }

    try {
      const geocoder = new google.maps.Geocoder();
      const geocodeResponse = await new Promise<google.maps.GeocoderResponse>(
        (resolve, reject) => {
          geocoder.geocode({ address }, (results, status) => {
            if (status === "OK" && results && results.length > 0) {
              resolve({ results } as google.maps.GeocoderResponse);
            } else {
              reject(
                new Error(
                  `Geocode was not successful: ${status}. Please check the address.`
                )
              );
            }
          });
        }
      );

      const {
        geometry: { location },
        place_id,
      } = geocodeResponse.results[0];
      const lat = location.lat();
      const lng = location.lng();
      const geoHash = geohashForLocation([lat, lng]);
      return { lat, lng, geoHash, place_id };
    } catch (error) {
      console.error("Error getting place details:", error);
      throw error;
    }
  }, []);

  const submitData = useCallback(
    async ({ data }: { data: Partial<IListing> & WizardOnly }) => {
      try {
        submitToast();

        if (!user) {
          throw new Error("You must be logged in to add a listing");
        }

        // Extract address components
        const { city, state, zip, street } = data;
        const address = `${street} ${city} ${state} ${zip}`;

        // Get geocoding details
        const details = await getPlaceDetails(address);

        // Add description if not provided
        const description =
          data.description || `${data.name} located in ${city}, ${state}`;

        // Combine all data
        const submitData = {
          ...data,
          description,
          creator,
          ...details,
          // Map wizard-only fields to existing schema fields
          categories: (data.services as string[]) || [],
          submitted: new Date(),
          claimsCount: 0,
          claims: [],
        } as any;

        // Submit to API
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
    [getPlaceDetails, creator, submitToast, alertToast, user]
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

  if (!user) {
    return (
      <Box textAlign="center" p={6}>
        <Heading as="h3" size="md" mb={4}>
          Authentication Required
        </Heading>
        <Text>You must be logged in to add a business listing.</Text>
      </Box>
    );
  }
  console.log(step);
  return (
    <Box
      borderWidth="1px"
      rounded="lg"
      shadow="1px 1px 3px rgba(0,0,0,0.3)"
      maxWidth={800}
      p={6}
      m="10px auto"
    >
      <Heading as="h2" size="lg" mb={2} textAlign="center">
        Add Your Business
      </Heading>
      <Text textAlign="center" color="gray.600" mb={4}>
        Step {step} of 3
      </Text>
      <Progress
        value={(step / 3) * 100}
        size="sm"
        colorScheme="blue"
        mb={6}
        aria-label={`Step ${step} of 3`}
      />

      <Form
        onSubmit={submitData}
        encType={"application/json"}
        onSuccess={() => console.log("Form submitted successfully")}
        onError={() => alertToast()}
        control={control}
      >
        {step === 1 && (
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
            {/* Business Name */}
            <FormControl
              isInvalid={!!errors.name}
              mb={3}
              gridColumn={{ md: "span 2" }}
            >
              <FormLabel htmlFor="name">Business Name</FormLabel>
              <Input
                id="name"
                placeholder="Enter business name"
                autoComplete="true"
                {...register("name")}
              />
              <FormErrorMessage>
                {errors.name?.message as string}
              </FormErrorMessage>
            </FormControl>

            {/* Business Type */}
            <FormControl mb={3}>
              <FormLabel htmlFor="businessType">Business Type</FormLabel>
              <Select
                id="businessType"
                placeholder="Select type"
                {...register("businessType")}
              >
                {BUSINESS_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Description */}
            <FormControl
              isInvalid={!!errors.description}
              mb={3}
              gridColumn={{ md: "span 2" }}
            >
              <FormLabel htmlFor="description">Short Description</FormLabel>
              <Textarea
                id="description"
                placeholder="Up to 150 characters"
                maxLength={150}
                rows={3}
                {...register("description")}
              />
              <FormErrorMessage>
                {errors.description?.message as string}
              </FormErrorMessage>
            </FormControl>
          </Grid>
        )}

        {step === 2 && (
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
            {/* Contact Name */}
            <FormControl mb={3}>
              <FormLabel htmlFor="contactName">Contact Person's Name</FormLabel>
              <Input
                id="contactName"
                placeholder="Full name"
                {...register("contactName")}
              />
            </FormControl>

            {/* Phone */}
            <FormControl isInvalid={!!errors.phone} mb={3}>
              <FormLabel htmlFor="phone">Phone Number</FormLabel>
              <Input
                id="phone"
                type="tel"
                placeholder="(123) 456-7890"
                {...register("phone")}
              />
              <FormErrorMessage>
                {errors.phone?.message as string}
              </FormErrorMessage>
            </FormControl>

            {/* Email */}
            {/* <FormControl isInvalid={!!errors.email} mb={3} gridColumn={{ md: "span 2" }}>
              <FormLabel htmlFor="email">Email Address</FormLabel>
              <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
              <FormErrorMessage>{errors.email?.message as string}</FormErrorMessage>
            </FormControl> */}

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
            {/* <FormControl isInvalid={!!errors.zip} mb={3}>
              <FormLabel htmlFor="zip">Zip Code</FormLabel>
              <Input id="zip" type="number" placeholder="12345" {...register("zip", { valueAsNumber: true })} />
              <FormErrorMessage>{errors.zip?.message as string}</FormErrorMessage>
            </FormControl> */}
          </Grid>
        )}

        {step === 3 && (
          <VStack align="stretch" spacing={4}>
            {/* Services Offered */}
            <FormControl>
              <FormLabel>Services Offered</FormLabel>
              <Controller
                control={control}
                name="services"
                render={({ field }) => (
                  <CheckboxGroup
                    value={field.value || []}
                    onChange={field.onChange}
                  >
                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                      {SERVICES_OPTIONS.map((opt) => (
                        <Checkbox key={opt} value={opt} size="md">
                          {opt}
                        </Checkbox>
                      ))}
                    </SimpleGrid>
                  </CheckboxGroup>
                )}
              />
            </FormControl>

            {/* Website URL */}
            <FormControl isInvalid={!!errors.url}>
              <FormLabel htmlFor="url">Website URL</FormLabel>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                {...register("url")}
              />
              <FormErrorMessage>
                {errors.url?.message as string}
              </FormErrorMessage>
            </FormControl>

            {/* Social Links */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <FormControl>
                <FormLabel htmlFor="facebook">Facebook</FormLabel>
                <Input
                  id="facebook"
                  placeholder="facebook.com/yourpage"
                  {...register("social.facebook" as const)}
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="instagram">Instagram</FormLabel>
                <Input
                  id="instagram"
                  placeholder="instagram.com/yourhandle"
                  {...register("social.instagram" as const)}
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="twitter">Twitter/X</FormLabel>
                <Input
                  id="twitter"
                  placeholder="twitter.com/yourhandle"
                  {...register("social.twitter" as const)}
                />
              </FormControl>
            </SimpleGrid>
          </VStack>
        )}

        {/* Navigation Buttons */}
        <HStack mt={6} justify="space-between">
          <Button
            onClick={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s))}
            variant="outline"
            isDisabled={step === 1}
          >
            Back
          </Button>
          {step < 3 ? (
            <Button
              colorScheme="blue"
              onClick={async () => {
                // Validate current step fields before moving on
                const step1Fields = [
                  "name",
                  "businessType",
                  "description",
                ] as const;
                const step2Fields = [
                  "contactName",
                  "phone",
                  // "email",
                  "street",
                  "city",
                  "state",
                  // "zip",
                ] as const;
                const toValidate = step === 1 ? step1Fields : step2Fields;
                const ok = await trigger(toValidate as any);
                if (ok) setStep((s) => (s + 1) as 1 | 2 | 3);
                console.log(ok);
              }}
            >
              Next
            </Button>
          ) : (
            <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
              Submit
            </Button>
          )}
        </HStack>
      </Form>
    </Box>
  );
};

export default memo(AddListingForm);
