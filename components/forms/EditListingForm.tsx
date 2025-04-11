"use client";

import { useAuth } from "@/contexts/AuthContext";
import { listingsFetch } from "@/db/listings";
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
  Skeleton,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { geohashForLocation } from "geofire-common";
import { memo, useCallback, useEffect, useState } from "react";
import { Form, useForm } from "react-hook-form";
import useSWR from "swr";
import { IListing, StatesEnum } from "../../types";

interface EditListingFormProps {
  listingId: string;
  onClose: () => void;
}

const EditListingForm = ({ listingId, onClose }: EditListingFormProps) => {
  const { user } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Fetch the listing data
  const {
    data: listing,
    error,
    isLoading,
  } = useSWR<IListing>(
    listingId ? `/api/listings/${listingId}` : null,
    async () => {
      const result = await listingsFetch(listingId);
      return result as IListing;
    }
  );

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    control,
  } = useForm<IListing>({
    resolver: zodResolver(ListingsSchema),
    mode: "all",
  });

  // Toast notifications
  const submitToast = useToast({
    colorScheme: "yellow",
    status: "info",
    title: "Updating",
    description: `Updating listing information...`,
    duration: 3000,
    isClosable: true,
  });

  const successToast = useToast({
    colorScheme: "green",
    status: "success",
    title: "Listing Updated",
    description: `Successfully updated the listing.`,
    duration: 5000,
    isClosable: true,
  });

  const errorToast = useToast({
    colorScheme: "red",
    status: "error",
    title: "Update Error",
    description: `Failed to update the listing.`,
    duration: 5000,
    isClosable: true,
  });

  // Check if user is authorized to edit this listing
  useEffect(() => {
    if (listing && user) {
      const isCreator = listing.creator?.id === user.uid;
      setIsAuthorized(isCreator);
    }
  }, [listing, user]);

  // Set form values when listing data is loaded
  useEffect(() => {
    if (listing) {
      reset(listing);
    }
  }, [listing, reset]);

  // Handle form submission
  const onSubmit = useCallback(
    async (data: IListing) => {
      try {
        submitToast();

        if (!user) {
          throw new Error("You must be logged in to edit a listing");
        }

        if (!isAuthorized) {
          throw new Error("You are not authorized to edit this listing");
        }

        // Extract address components
        const { city, state, zip, street } = data;
        const address = `${street} ${city} ${state} ${zip}`;

        // Get geocoding details if address changed
        let geoData = {};
        if (
          listing &&
          (listing.street !== street ||
            listing.city !== city ||
            listing.state !== state ||
            listing.zip !== zip)
        ) {
          try {
            const geocoder = new google.maps.Geocoder();
            const geocodeResponse =
              await new Promise<google.maps.GeocoderResponse>(
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
            geoData = { lat, lng, geoHash, place_id };
          } catch (error) {
            console.error("Error getting place details:", error);
            throw error;
          }
        }

        // Combine all data
        const updateData = {
          ...data,
          ...geoData,
          updated: new Date(),
        };

        // Submit to API
        const response = await fetch(`/api/listings/${listingId}`, {
          method: "PUT",
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          throw new Error(`Error updating listing: ${response.statusText}`);
        }

        successToast();
        onClose();
        return await response.json();
      } catch (error) {
        console.error("Error updating listing:", error);
        errorToast({
          description:
            error instanceof Error ? error.message : "Failed to update listing",
        });
        throw error;
      }
    },
    [
      user,
      isAuthorized,
      listing,
      listingId,
      submitToast,
      successToast,
      errorToast,
      onClose,
    ]
  );

  // Show loading state
  if (isLoading) {
    return (
      <Box p={6}>
        <Skeleton height="40px" mb={4} data-testid="skeleton" />
        <Skeleton height="20px" mb={2} data-testid="skeleton" />
        <Skeleton height="40px" mb={4} data-testid="skeleton" />
        <Skeleton height="20px" mb={2} data-testid="skeleton" />
        <Skeleton height="40px" mb={4} data-testid="skeleton" />
        <Skeleton height="20px" mb={2} data-testid="skeleton" />
        <Skeleton height="40px" mb={4} data-testid="skeleton" />
      </Box>
    );
  }

  // Show error state
  if (error || !listing) {
    return (
      <Box textAlign="center" p={6}>
        <Heading as="h3" size="md" mb={4} color="red.500">
          Error Loading Listing
        </Heading>
        <Text>
          {error instanceof Error
            ? error.message
            : "Failed to load the listing. Please try again."}
        </Text>
        <Button mt={4} onClick={onClose}>
          Close
        </Button>
      </Box>
    );
  }

  // Show unauthorized state
  if (isAuthorized === false) {
    return (
      <Box textAlign="center" p={6}>
        <Heading as="h3" size="md" mb={4} color="red.500">
          Unauthorized
        </Heading>
        <Text>You are not authorized to edit this listing.</Text>
        <Button mt={4} onClick={onClose}>
          Close
        </Button>
      </Box>
    );
  }

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
        Edit Business Listing
      </Heading>

      <Form
        onSubmit={handleSubmit(onSubmit)}
        encType={"application/json"}
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

          {/* Website */}
          <FormControl isInvalid={!!errors.url} mb={3}>
            <FormLabel htmlFor="url">Website URL</FormLabel>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              {...register("url")}
            />
            <FormErrorMessage>{errors.url?.message as string}</FormErrorMessage>
          </FormControl>
        </Grid>

        <Box display="flex" justifyContent="space-between" mt={6}>
          <Button
            onClick={onClose}
            colorScheme="gray"
            variant="outline"
            width="48%"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isSubmitting}
            isDisabled={Object.keys(errors).length > 0}
            width="48%"
          >
            Update Listing
          </Button>
        </Box>
      </Form>
    </Box>
  );
};

export default memo(EditListingForm);
