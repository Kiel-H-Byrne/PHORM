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
  FormLabel,
  Grid,
  HStack,
  Input,
  Select,
  Skeleton,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { memo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR, { useSWRConfig } from "swr";
import * as z from "zod";

interface EditListingFormProps {
  listingId: string;
  onClose: () => void;
  onDeleted?: () => void;
}

const EditFormSchema = ListingInputSchema.omit({
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

type EditFormValues = z.input<typeof EditFormSchema>;
type EditFormOutput = z.output<typeof EditFormSchema>;

const EditListingForm = ({
  listingId,
  onClose,
  onDeleted,
}: EditListingFormProps) => {
  const { user } = useAuth();
  const toast = useToast();
  const { mutate } = useSWRConfig();
  const { isLoaded: mapsLoaded } = useGoogleMaps();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: listing, isLoading } = useSWR<IListing>(
    listingId ? `/api/listings/${listingId}` : null
  );

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditFormValues, unknown, EditFormOutput>({
    resolver: zodResolver(EditFormSchema),
    mode: "onTouched",
  });

  useEffect(() => {
    if (!listing) return;
    const [category = "", ...keywords] = listing.categories || [];
    reset({
      name: listing.name || "",
      category,
      keywords: keywords.join(", "),
      description: listing.description || "",
      street: listing.street || "",
      city: listing.city || "",
      state: listing.state,
      zip: listing.zip ? String(listing.zip) : "",
      phone: listing.phone || "",
      email: listing.email || "",
      url: listing.url || "",
      businessHours: listing.businessHours || "",
    });
  }, [listing, reset]);

  const refreshListings = () =>
    mutate(
      (key) => typeof key === "string" && key.startsWith("/api/listings"),
      undefined,
      { revalidate: true }
    );

  const onSubmit = async (values: EditFormOutput) => {
    if (!listing) return;
    setSubmitError(null);
    try {
      const { category, keywords, ...rest } = values;
      const addressChanged =
        rest.street !== (listing.street || "") ||
        rest.city !== listing.city ||
        rest.state !== listing.state ||
        (rest.zip || "") !== String(listing.zip || "");
      const geo = addressChanged
        ? await geocodeAddress(
            [rest.street, rest.city, `${rest.state} ${rest.zip || ""}`]
              .filter(Boolean)
              .join(", ")
          )
        : {};
      const extra = (keywords || "")
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
      const categories = Array.from(new Set([category, ...extra])).slice(0, 5);

      const res = await authFetch(`/api/listings/${listingId}`, {
        method: "PUT",
        body: JSON.stringify({ ...rest, ...geo, categories }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Failed to update listing");

      trackEvent("edit_listing_complete");
      toast({ title: "Listing updated", status: "success", duration: 3000 });
      refreshListings();
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to update listing"
      );
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Remove this listing from PHORM? Members will no longer be able to find it."
      )
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      const res = await authFetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to remove listing");
      }
      toast({ title: "Listing removed", status: "success", duration: 3000 });
      refreshListings();
      if (onDeleted) onDeleted();
      else onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to remove listing"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <Skeleton height="400px" />;
  if (!listing) return <Text>Listing not found.</Text>;
  const ownerId =
    typeof listing.creator === "object" ? listing.creator?.id : listing.creator;
  if (!user || ownerId !== user.uid) {
    return <Text>Only the owner of this listing can edit it.</Text>;
  }

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
        <FormControl
          isInvalid={!!errors.name}
          isRequired
          gridColumn={{ md: "span 2" }}
        >
          <FormLabel htmlFor="edit-name">Business name</FormLabel>
          <Input id="edit-name" {...register("name")} />
          <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.category} isRequired>
          <FormLabel htmlFor="edit-category">Category</FormLabel>
          <Select
            id="edit-category"
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

        <FormControl>
          <FormLabel htmlFor="edit-keywords">Search keywords</FormLabel>
          <Input
            id="edit-keywords"
            placeholder="comma separated"
            {...register("keywords")}
          />
        </FormControl>

        <FormControl
          isInvalid={!!errors.description}
          gridColumn={{ md: "span 2" }}
        >
          <FormLabel htmlFor="edit-description">What do you do?</FormLabel>
          <Textarea
            id="edit-description"
            rows={3}
            maxLength={500}
            {...register("description")}
          />
          <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.street} gridColumn={{ md: "span 2" }}>
          <FormLabel htmlFor="edit-street">Street address (optional)</FormLabel>
          <Input id="edit-street" {...register("street")} />
        </FormControl>

        <FormControl isInvalid={!!errors.city} isRequired>
          <FormLabel htmlFor="edit-city">City</FormLabel>
          <Input id="edit-city" {...register("city")} />
          <FormErrorMessage>{errors.city?.message}</FormErrorMessage>
        </FormControl>

        <HStack align="start">
          <FormControl isInvalid={!!errors.state} isRequired>
            <FormLabel htmlFor="edit-state">State</FormLabel>
            <Select id="edit-state" placeholder="--" {...register("state")}>
              {StatesEnum.options.map((state) => (
                <option value={state} key={state}>
                  {state}
                </option>
              ))}
            </Select>
            <FormErrorMessage>{errors.state?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.zip}>
            <FormLabel htmlFor="edit-zip">ZIP</FormLabel>
            <Input
              id="edit-zip"
              inputMode="numeric"
              maxLength={5}
              {...register("zip")}
            />
            <FormErrorMessage>{errors.zip?.message}</FormErrorMessage>
          </FormControl>
        </HStack>

        <FormControl isInvalid={!!errors.phone}>
          <FormLabel htmlFor="edit-phone">Phone</FormLabel>
          <Input id="edit-phone" type="tel" {...register("phone")} />
          <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.email}>
          <FormLabel htmlFor="edit-email">Email</FormLabel>
          <Input id="edit-email" type="email" {...register("email")} />
          <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.url} gridColumn={{ md: "span 2" }}>
          <FormLabel htmlFor="edit-url">Website</FormLabel>
          <Input id="edit-url" inputMode="url" {...register("url")} />
          <FormErrorMessage>{errors.url?.message}</FormErrorMessage>
        </FormControl>

        <FormControl gridColumn={{ md: "span 2" }}>
          <FormLabel htmlFor="edit-hours">Hours</FormLabel>
          <Textarea id="edit-hours" rows={2} {...register("businessHours")} />
        </FormControl>
      </Grid>

      {submitError && (
        <Alert status="error" mt={4} borderRadius="md">
          <AlertIcon />
          {submitError}
        </Alert>
      )}

      <HStack mt={6} justify="space-between">
        <Button
          colorScheme="red"
          variant="ghost"
          onClick={handleDelete}
          isLoading={isDeleting}
        >
          Remove listing
        </Button>
        <HStack>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isSubmitting}
            isDisabled={!isDirty || !mapsLoaded}
          >
            Save changes
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
};

export default memo(EditListingForm);
