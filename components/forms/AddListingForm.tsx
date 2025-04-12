"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ListingsSchema } from "@/db/schemas";
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Divider,
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
  Tooltip,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { STATE_ABBREVIATIONS } from "../../util/constants";
import { IListing } from "@/types";
import PlacesAutocomplete from "./PlacesAutocomplete";
import parseAddressComponents, { ParsedAddress } from "@/util/addressParser";

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
  "Other"
];

// Relationship types
const RELATIONSHIP_TYPES = [
  { value: "owner", label: "I own this business" },
  { value: "manager", label: "I manage this business" },
  { value: "consultant", label: "I am a consultant/service provider" },
  { value: "affiliate", label: "I can provide benefits for this business" }
];

const AddListingForm = ({ onDrawerClose }: AddListingFormProps) => {
  // State for selected categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState<string>("");
  const [relationshipType, setRelationshipType] = useState<string>("owner");
  const [benefitsOffered, setBenefitsOffered] = useState<string>("");
  const [consultingServices, setConsultingServices] = useState<string>("");
  
  // State for address from Places Autocomplete
  const [addressData, setAddressData] = useState<ParsedAddress | null>(null);
  
  const {
    register,
    reset,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IListing>({
    resolver: zodResolver(ListingsSchema),
    mode: "all",
    defaultValues: {
      categories: [],
      isPremium: false,
      name: '',
      description: '',
      street: '',
      city: '',
      state: 'DC',
      phone: '',
      url: '',
      email: '',
    }
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
  const handleRemoveCategory = useCallback((category: string) => {
    const updatedCategories = selectedCategories.filter(
      (c) => c !== category
    );
    setSelectedCategories(updatedCategories);
    setValue("categories", updatedCategories);
  }, [selectedCategories, setValue]);

  // Handle selecting a predefined category
  const handleSelectCategory = useCallback((category: string) => {
    if (!selectedCategories.includes(category)) {
      const updatedCategories = [...selectedCategories, category];
      setSelectedCategories(updatedCategories);
      setValue("categories", updatedCategories);
    }
  }, [selectedCategories, setValue]);

  // Handle relationship type change
  const handleRelationshipChange = useCallback((value: string) => {
    setRelationshipType(value);
  }, []);

  const submitData = async (data: IListing) => {
    try {
      submitToast();

      if (!user) {
        throw new Error("You must be logged in to add a listing");
      }

      // Check if we have address data from Places Autocomplete
      if (!addressData) {
        throw new Error("Please select a valid address from the suggestions");
      }

      // Add description if not provided
      const description =
        data.description || `${data.name} located in ${addressData.city}, ${addressData.state}`;

      // Add relationship metadata
      let metaData: Record<string, any> = {
        relationshipType: relationshipType
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
        lat: addressData.lat,
        lng: addressData.lng,
        place_id: addressData.placeId,
        street: addressData.street,
        city: addressData.city,
        state: addressData.state,
        zip: addressData.zip,
        address: addressData.formattedAddress,
        submitted: new Date(),
        claimsCount: 0,
        claims: [],
        categories: selectedCategories,
        metaData
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
    setAddressData(null);
  };
  
  // Handle place selection from Google Places Autocomplete
  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    const parsedAddress = parseAddressComponents(place);
    setAddressData(parsedAddress);
    
    // Update form fields with the parsed address data
    setValue("street", parsedAddress.street);
    setValue("city", parsedAddress.city);
    setValue("state", parsedAddress.state);
    setValue("zip", parsedAddress.zip);
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
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
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
            <RadioGroup value={relationshipType} onChange={handleRelationshipChange}>
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
              <FormLabel htmlFor="benefitsOffered">Benefits You Can Offer</FormLabel>
              <Textarea
                id="benefitsOffered"
                placeholder="Describe the friends & family benefits you can offer (discounts, special services, etc.)"
                value={benefitsOffered}
                onChange={(e) => setBenefitsOffered(e.target.value)}
                rows={3}
              />
              <FormHelperText>This helps other members understand what benefits they can receive</FormHelperText>
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
              <FormHelperText>Provide details about your expertise and services</FormHelperText>
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

          {/* Google Places Autocomplete */}
          <PlacesAutocomplete 
            onPlaceSelect={handlePlaceSelect}
            isInvalid={!addressData && !!errors.street}
            errorMessage="Please select a valid address"
            defaultValue={addressData?.formattedAddress || ""}
          />
          
          {/* Hidden address fields - populated by Places Autocomplete */}
          <input type="hidden" {...register("street")} />
          <input type="hidden" {...register("city")} />
          <input type="hidden" {...register("state")} />
          <input type="hidden" {...register("zip", { valueAsNumber: true })} />
          
          {/* Display selected address details */}
          {addressData && (
            <FormControl mb={3} gridColumn={{ md: "span 2" }}>
              <Box p={3} bg="blue.50" borderRadius="md">
                <Text fontWeight="medium" mb={1}>Selected Address:</Text>
                <Text>{addressData.street}</Text>
                <Text>{addressData.city}, {addressData.state} {addressData.zip}</Text>
              </Box>
            </FormControl>
          )}

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
                    <TagCloseButton onClick={() => handleRemoveCategory(category)} />
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
            <FormHelperText>Premium listings appear at the top of search results and include enhanced features</FormHelperText>
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
