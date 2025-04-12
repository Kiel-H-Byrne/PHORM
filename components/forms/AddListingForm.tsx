"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ListingsSchema } from "@/db/schemas";
import { IListing } from "@/types";
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
import { memo, useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { STATE_ABBREVIATIONS } from "../../util/constants";

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
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<IListing>({
    resolver: zodResolver(ListingsSchema),
    mode: "all",
    defaultValues: {
      categories: [],
      isPremium: false,
      name: "",
      description: "",
      street: "",
      city: "",
      state: "DC",
      phone: "",
      url: "",
      email: "",
    },
  });

  const submitToast = useToast({
    title: "Form Submitted",
    description: "Your business listing has been submitted successfully!",
    status: "success",
    duration: 5000,
    isClosable: true,
  });

  const alertToast = useToast({
    title: "Form Error",
    description: "There was an error submitting your form. Please try again.",
    status: "error",
    duration: 5000,
    isClosable: true,
  });

  const { user } = useAuth();
  const creator = useMemo(
    () =>
      user && {
        id: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      },
    [user]
  );

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

  // Get geocoding details from address
  const getPlaceDetails = useCallback(async (address: string) => {
    return new Promise<{
      lat: number;
      lng: number;
      placeId: string;
    }>((resolve, reject) => {
      try {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const { lat, lng } = results[0].geometry.location;
            resolve({
              lat: lat(),
              lng: lng(),
              placeId: results[0].place_id,
            });
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }, []);

  const submitData = async (data: IListing) => {
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

      await response.json();

      // Reset form and close drawer on success
      reset();
      onDrawerClose();

      return true;
    } catch (error) {
      console.error("Error submitting listing:", error);
      alertToast({
        title: "Form Error",
        description:
          error instanceof Error ? error.message : "Failed to create listing",
      });
      throw error;
    }
  };

  // Reset form
  const handleReset = () => {
    reset();
    setSelectedCategories([]);
    setRelationshipType("owner");
    setBenefitsOffered("");
    setConsultingServices("");
  };

  // If user is not authenticated, show login message
  if (!user) {
    return (
      <Box textAlign="center" p={6}>
        <Heading as="h3" size="lg" mb={4}>
          Authentication Required
        </Heading>
        <Text mb={4}>You must be logged in to add a business listing.</Text>
      </Box>
    );
  }

  return (
    <Box width="100%" maxWidth="100%">
      <form onSubmit={handleSubmit(submitData)}>
        <Grid gap={6}>
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
            gridColumn={{ md: "span 2" }}
            borderBottomWidth="1px"
            pb={2}
            mb={4}
          >
            Address Information
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
              {STATE_ABBREVIATIONS.map((state) => (
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

          {/* Form Actions */}
          <Box gridColumn={{ md: "span 2" }} textAlign="center">
            <Button
              type="reset"
              onClick={handleReset}
              mr={3}
              isDisabled={isSubmitting}
            >
              Reset
            </Button>
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isSubmitting}
              loadingText="Submitting"
            >
              Submit
            </Button>
          </Box>
        </Grid>
      </form>
    </Box>
  );
};

export default memo(AddListingForm);
