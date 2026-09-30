"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ListingInputSchema } from "@/db/schemas";
import { IListing, StatesEnum } from "@/types";
import { trackEvent } from "@/util/analytics";
import authFetch from "@/util/authFetch";
import { BUSINESS_CATEGORIES } from "@/util/constants";
import { geocodeAddress, useGoogleMaps } from "@/util/mapsLoader";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
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
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import NextLink from "next/link";
import { memo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSWRConfig } from "swr";
import * as z from "zod";

interface AddListingFormProps {
  onDrawerClose: () => void;
}

const ListingFormSchema = ListingInputSchema.omit({
  lat: true,
  lng: true,
  place_id: true,
  imageUri: true,
  categories: true,
})
  .extend({
    category: z.string().min(1, "Choose a category"),
    keywords: z.string().max(200).optional(),
  })
  .refine((d) => !!(d.phone || d.email || d.url), {
    message: "Add at least one way to contact the business",
    path: ["phone"],
  });

type ListingFormValues = z.input<typeof ListingFormSchema>;
type ListingFormOutput = z.output<typeof ListingFormSchema>;

const STEP_FIELDS: Record<1 | 2, (keyof ListingFormValues)[]> = {
  1: ["name", "category", "description"],
  2: ["street", "city", "state", "zip", "phone", "email", "url"],
};

/**
 * AddListingForm
 * 1) What is the business  2) Where / how to reach it  3) Optional extras
 */
const AddListingForm = ({ onDrawerClose }: AddListingFormProps) => {
  const { user } = useAuth();
  const { mutate } = useSWRConfig();
  const { isLoaded: mapsLoaded } = useGoogleMaps();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [created, setCreated] = useState<IListing | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ListingFormValues, unknown, ListingFormOutput>({
    resolver: zodResolver(ListingFormSchema),
    mode: "onTouched",
  });

  useEffect(() => {
    trackEvent("add_listing_start");
  }, []);

  const goNext = async () => {
    if (step === 3) return;
    const ok = await trigger(STEP_FIELDS[step]);
    if (ok) {
      trackEvent("add_listing_step", { step: step + 1 });
      setStep((s) => (s + 1) as 1 | 2 | 3);
    }
  };

  const onSubmit = async (values: ListingFormOutput) => {
    setSubmitError(null);
    try {
      const { category, keywords, ...rest } = values;
      const address = [
        rest.street,
        rest.city,
        `${rest.state} ${rest.zip || ""}`,
      ]
        .filter(Boolean)
        .join(", ");
      const geo = await geocodeAddress(address);
      const extra = (keywords || "")
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
      const categories = Array.from(new Set([category, ...extra])).slice(0, 5);

      const res = await authFetch("/api/listings", {
        method: "POST",
        body: JSON.stringify({ ...rest, ...geo, categories }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          res.status === 401
            ? "Your session expired. Please sign in again."
            : body.error || "We couldn't save your listing. Please try again."
        );
      }
      trackEvent("add_listing_complete", { category });
      mutate(
        (key) => typeof key === "string" && key.startsWith("/api/listings"),
        undefined,
        { revalidate: true }
      );
      setCreated(body as IListing);
      reset();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create listing";
      trackEvent("add_listing_error", { message });
      setSubmitError(message);
    }
  };

  if (!user) {
    return (
      <Box textAlign="center" p={6}>
        <Heading as="h3" size="md" mb={4}>
          Sign in to add your business
        </Heading>
        <Button as={NextLink} href="/auth/login" colorScheme="blue">
          Sign in
        </Button>
      </Box>
    );
  }

  if (created) {
    return (
      <VStack spacing={4} p={4} textAlign="center">
        <Heading size="md">🎉 {created.name} is live!</Heading>
        <Text color="gray.600">
          Members can now find your business on the map and in search. Share
          your listing with your lodge to help people find you.
        </Text>
        <Button
          as={NextLink}
          href={`/listing/${created.id}`}
          colorScheme="blue"
          width="full"
          onClick={onDrawerClose}
        >
          View your listing
        </Button>
        <Button
          variant="outline"
          width="full"
          onClick={() => {
            setCreated(null);
            setStep(1);
            onDrawerClose();
          }}
        >
          Done
        </Button>
      </VStack>
    );
  }

  return (
    <Box maxWidth={800} py={2} m="0 auto">
      <Text textAlign="center" color="gray.600" mb={2}>
        Step {step} of 3
      </Text>
      <Progress
        value={(step / 3) * 100}
        size="sm"
        colorScheme="blue"
        mb={6}
        aria-label={`Step ${step} of 3`}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        onKeyDown={(e) => {
          // Enter advances the wizard instead of submitting early.
          const target = e.target as HTMLElement;
          if (e.key === "Enter" && step < 3 && target.tagName !== "TEXTAREA") {
            e.preventDefault();
            goNext();
          }
        }}
      >
        <Box display={step === 1 ? "block" : "none"}>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.name} isRequired>
              <FormLabel htmlFor="name">Business name</FormLabel>
              <Input
                id="name"
                placeholder="e.g. Hiram's Plumbing"
                autoComplete="organization"
                {...register("name")}
              />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.category} isRequired>
              <FormLabel htmlFor="category">Category</FormLabel>
              <Select
                id="category"
                placeholder="Select a category"
                {...register("category")}
              >
                {BUSINESS_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.category?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.description}>
              <FormLabel htmlFor="description">What do you do?</FormLabel>
              <Textarea
                id="description"
                placeholder="One or two sentences about your business"
                maxLength={500}
                rows={3}
                {...register("description")}
              />
              <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
            </FormControl>
          </VStack>
        </Box>

        <Box display={step === 2 ? "block" : "none"}>
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
            <FormControl
              isInvalid={!!errors.street}
              gridColumn={{ md: "span 2" }}
            >
              <FormLabel htmlFor="street">Street address</FormLabel>
              <Input
                id="street"
                placeholder="123 Main St"
                autoComplete="street-address"
                {...register("street")}
              />
              <FormHelperText>
                Optional. Leave it blank if you work from home or travel to
                clients.
              </FormHelperText>
              <FormErrorMessage>{errors.street?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.city} isRequired>
              <FormLabel htmlFor="city">City</FormLabel>
              <Input
                id="city"
                autoComplete="address-level2"
                {...register("city")}
              />
              <FormErrorMessage>{errors.city?.message}</FormErrorMessage>
            </FormControl>

            <HStack align="start">
              <FormControl isInvalid={!!errors.state} isRequired>
                <FormLabel htmlFor="state">State</FormLabel>
                <Select id="state" placeholder="--" {...register("state")}>
                  {StatesEnum.options.map((state) => (
                    <option value={state} key={state}>
                      {state}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.state?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.zip}>
                <FormLabel htmlFor="zip">ZIP</FormLabel>
                <Input
                  id="zip"
                  inputMode="numeric"
                  maxLength={5}
                  autoComplete="postal-code"
                  {...register("zip")}
                />
                <FormErrorMessage>{errors.zip?.message}</FormErrorMessage>
              </FormControl>
            </HStack>

            <Text
              gridColumn={{ md: "span 2" }}
              fontWeight="semibold"
              mt={2}
              fontSize="sm"
            >
              How can members reach you? (at least one)
            </Text>

            <FormControl isInvalid={!!errors.phone}>
              <FormLabel htmlFor="phone">Phone</FormLabel>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="(202) 555-0123"
                {...register("phone")}
              />
              <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.email}>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
              />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.url} gridColumn={{ md: "span 2" }}>
              <FormLabel htmlFor="url">Website</FormLabel>
              <Input
                id="url"
                type="url"
                inputMode="url"
                placeholder="example.com"
                {...register("url")}
              />
              <FormErrorMessage>{errors.url?.message}</FormErrorMessage>
            </FormControl>
          </Grid>
        </Box>

        <Box display={step === 3 ? "block" : "none"}>
          <VStack align="stretch" spacing={4}>
            <Text color="gray.600" fontSize="sm">
              These details are optional. You can publish now and add them later
              from your dashboard.
            </Text>
            <FormControl isInvalid={!!errors.keywords}>
              <FormLabel htmlFor="keywords">Search keywords</FormLabel>
              <Input
                id="keywords"
                placeholder="e.g. plumbing, water heaters, HVAC"
                {...register("keywords")}
              />
              <FormHelperText>Comma separated. Up to 4.</FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="businessHours">Hours</FormLabel>
              <Textarea
                id="businessHours"
                rows={2}
                placeholder="Mon–Fri 9am–5pm"
                {...register("businessHours")}
              />
            </FormControl>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <FormControl>
                <FormLabel htmlFor="facebook">Facebook</FormLabel>
                <Input id="facebook" {...register("social.facebook")} />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="instagram">Instagram</FormLabel>
                <Input id="instagram" {...register("social.instagram")} />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="twitter">X / Twitter</FormLabel>
                <Input id="twitter" {...register("social.twitter")} />
              </FormControl>
            </SimpleGrid>
          </VStack>
        </Box>

        {submitError && (
          <Alert status="error" mt={4} borderRadius="md">
            <AlertIcon />
            {submitError}
          </Alert>
        )}

        <HStack mt={6} justify="space-between">
          <Button
            onClick={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s))}
            variant="outline"
            isDisabled={step === 1 || isSubmitting}
          >
            Back
          </Button>
          {step < 3 ? (
            <Button colorScheme="blue" onClick={goNext}>
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isSubmitting}
              isDisabled={!mapsLoaded}
              loadingText="Publishing"
            >
              Publish listing
            </Button>
          )}
        </HStack>
      </form>
    </Box>
  );
};

export default memo(AddListingForm);
