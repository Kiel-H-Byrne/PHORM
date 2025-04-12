"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ListingsSchema } from "@/db/schemas";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Grid,
  Heading,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { geohashForLocation } from "geofire-common";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { IListing, StatesEnum } from "../../types";

interface AddListingFormProps {
  onDrawerClose: () => void;
}

// Business categories
const BUSINESS_CATEGORIES = [
  "Restaurant",
  "Retail",
  "Professional Services",
  "Consulting",
  "Legal",
  "Financial",
  "Healthcare",
  "Education",
  "Technology",
  "Construction",
  "Real Estate",
  "Transportation",
  "Entertainment",
  "Hospitality",
  "Manufacturing",
  "Wholesale",
  "Non-Profit",
  "Other",
];

// Relationship types
const RELATIONSHIP_TYPES = [
  { value: "owner", label: "I own this business" },
  { value: "manager", label: "I manage this business" },
  { value: "consultant", label: "I am a consultant/service provider" },
  { value: "affiliate", label: "I can provide benefits for this business" },
];

// Business hours template
const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const AddListingForm = ({ onDrawerClose }: AddListingFormProps) => {
  // State for selected categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState<string>("");
  const [relationshipType, setRelationshipType] = useState<string>("owner");
  const [benefitsOffered, setBenefitsOffered] = useState<string>("");
  const [consultingServices, setConsultingServices] = useState<string>("");

  const {
    register,
    reset,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    control,
    watch,
  } = useForm({
    resolver: zodResolver(ListingsSchema),
    mode: "all",
    defaultValues: {
      categories: [],
      isPremium: false,
    },
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

  // Handle adding a category
  const handleAddCategory = useCallback(() => {
    if (newCategory && !selectedCategories.includes(newCategory)) {
      const updatedCategories = [...selectedCategories, newCategory];
      setSelectedCategories(updatedCategories);
      setValue("categories", updatedCategories);
      setNewCategory("");
    }
  }, [newCategory, selectedCategories, setValue]);

  // Handle removing a category
  const handleRemoveCategory = useCallback(
    (category: string) => {
      const updatedCategories = selectedCategories.filter(
        (c) => c !== category
      );
      setSelectedCategories(updatedCategories);
      setValue("categories", updatedCategories);
    },
    [selectedCategories, setValue]
  );

  // Handle selecting a predefined category
  const handleSelectCategory = useCallback(
    (category: string) => {
      if (!selectedCategories.includes(category)) {
        const updatedCategories = [...selectedCategories, category];
        setSelectedCategories(updatedCategories);
        setValue("categories", updatedCategories);
      }
    },
    [selectedCategories, setValue]
  );

  // Handle relationship type change
  const handleRelationshipChange = useCallback((value: string) => {
    setRelationshipType(value);
  }, []);

  const submitData = useCallback(
    async (data: IListing) => {
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

        // Add relationship metadata
        let metaData: Record<string, any> = {
          relationshipType: relationshipType,
        };

        // Add specific fields based on relationship type
        if (relationshipType === "affiliate") {
          metaData.benefitsOffered = benefitsOffered;
        } else if (relationshipType === "consultant") {
          metaData.consultingServices = consultingServices;
        }

        // Combine all data
        const submitData = {
          ...data,
          description,
          creator,
          ...details,
          submitted: new Date(),
          claimsCount: 0,
          claims: [],
          categories: selectedCategories,
          metaData,
        };

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
    [
      getPlaceDetails,
      creator,
      submitToast,
      alertToast,
      user,
      relationshipType,
      benefitsOffered,
      consultingServices,
      selectedCategories,
    ]
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

      <form onSubmit={handleSubmit(submitData)} encType={"application/json"}>
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

          {/* Relationship to Business */}
          <FormControl mb={3} gridColumn={{ md: "span 2" }}>
            <FormLabel>Your Relationship to this Business</FormLabel>
            <RadioGroup
              value={relationshipType}
              onChange={handleRelationshipChange}
            >
              <Stack direction="column" spacing={2}>
                {RELATIONSHIP_TYPES.map((type) => (
                  <Radio key={type.value} value={type.value}>
                    {type.label}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
          </FormControl>

          {/* Conditional fields based on relationship type */}
          {relationshipType === "affiliate" && (
            <FormControl mb={3} gridColumn={{ md: "span 2" }}>
              <FormLabel htmlFor="benefitsOffered">
                Benefits You Can Offer
              </FormLabel>
              <Textarea
                id="benefitsOffered"
                placeholder="Describe the friends & family benefits you can offer (discounts, special services, etc.)"
                value={benefitsOffered}
                onChange={(e) => setBenefitsOffered(e.target.value)}
                rows={3}
              />
              <FormHelperText>
                This helps other members understand what benefits they can
                receive
              </FormHelperText>
            </FormControl>
          )}

          {relationshipType === "consultant" && (
            <FormControl mb={3} gridColumn={{ md: "span 2" }}>
              <FormLabel htmlFor="consultingServices">Your Services</FormLabel>
              <Textarea
                id="consultingServices"
                placeholder="Describe the consulting or professional services you offer"
                value={consultingServices}
                onChange={(e) => setConsultingServices(e.target.value)}
                rows={3}
              />
              <FormHelperText>
                Provide details about your expertise and services
              </FormHelperText>
            </FormControl>
          )}

          {/* Description */}
          <FormControl
            isInvalid={!!errors.description}
            mb={3}
            gridColumn={{ md: "span 2" }}
          >
            <FormLabel htmlFor="description">Business Description</FormLabel>
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

          {/* Email */}
          <FormControl isInvalid={!!errors.email} mb={3}>
            <FormLabel htmlFor="email">Business Email</FormLabel>
            <Input
              id="email"
              type="email"
              placeholder="business@example.com"
              {...register("email")}
            />
            <FormErrorMessage>
              {errors.email?.message as string}
            </FormErrorMessage>
          </FormControl>

          {/* Business Hours */}
          <FormControl mb={3} gridColumn={{ md: "span 2" }}>
            <FormLabel htmlFor="businessHours">Business Hours</FormLabel>
            <Textarea
              id="businessHours"
              placeholder="Monday-Friday: 9am-5pm, Saturday: 10am-3pm, Sunday: Closed"
              {...register("businessHours")}
              rows={2}
            />
            <FormHelperText>
              Enter the regular hours of operation
            </FormHelperText>
          </FormControl>

          {/* Categories */}
          <FormControl mb={3} gridColumn={{ md: "span 2" }}>
            <FormLabel>Business Categories</FormLabel>

            {/* Selected Categories */}
            <Box mb={3}>
              <HStack spacing={2} flexWrap="wrap">
                {selectedCategories.map((category) => (
                  <Tag
                    size="md"
                    key={category}
                    borderRadius="full"
                    variant="solid"
                    colorScheme="blue"
                    mb={2}
                  >
                    <TagLabel>{category}</TagLabel>
                    <TagCloseButton
                      onClick={() => handleRemoveCategory(category)}
                    />
                  </Tag>
                ))}
              </HStack>
            </Box>

            {/* Add Custom Category */}
            <HStack mb={3}>
              <Input
                placeholder="Add custom category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                size="md"
              />
              <Button onClick={handleAddCategory} colorScheme="blue">
                Add
              </Button>
            </HStack>

            {/* Predefined Categories */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Common Categories:
              </Text>
              <HStack spacing={2} flexWrap="wrap">
                {BUSINESS_CATEGORIES.slice(0, 10).map((category) => (
                  <Tag
                    size="md"
                    key={category}
                    borderRadius="full"
                    variant="outline"
                    colorScheme="gray"
                    cursor="pointer"
                    onClick={() => handleSelectCategory(category)}
                    mb={2}
                    _hover={{ bg: "blue.50" }}
                  >
                    <TagLabel>{category}</TagLabel>
                  </Tag>
                ))}
              </HStack>
            </Box>
          </FormControl>

          {/* Premium Listing */}
          <FormControl mb={3} gridColumn={{ md: "span 2" }}>
            <Checkbox {...register("isPremium")}>
              <Text fontWeight="medium">Premium Listing</Text>
            </Checkbox>
            <FormHelperText>
              Premium listings appear at the top of search results and include
              enhanced features
            </FormHelperText>
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
      </form>
    </Box>
  );
};

export default memo(AddListingForm);
