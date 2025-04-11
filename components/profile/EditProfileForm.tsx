import { useAuth } from "@/contexts/AuthContext";
import { findUserById } from "@/db/users";
import { IUser } from "@/types";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Skeleton,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Textarea,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MdAdd } from "react-icons/md";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { z } from "zod";

// Profile schema for validation
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  contact: z.object({
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
  }),
  bio: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  specialties: z.array(z.string()).optional().default([]),
  experienceLevel: z.enum(["entry", "intermediate", "expert"]).optional(),
  availability: z.string().optional().or(z.literal("")),
  socialLinks: z.array(z.string()).optional().default([]),
  orgs: z.array(z.string()).optional().default([]),
  classYear: z.number().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function EditProfileForm({
  onUpdate,
}: {
  onUpdate: () => void;
}) {
  const { user } = useAuth();
  const [newSpecialty, setNewSpecialty] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const toast = useToast();
  
  // Fetch user data
  const { data: userData, error: fetchError, isLoading } = useSWR<IUser | null>(
    user?.uid ? `/api/users/${user.uid}` : null,
    async () => {
      if (!user?.uid) return null;
      return await findUserById(user.uid);
    }
  );
  
  // Setup form with validation
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      contact: {
        email: "",
        phone: "",
      },
      bio: "",
      location: "",
      specialties: [],
      experienceLevel: "intermediate",
      availability: "",
      socialLinks: [],
      orgs: [],
    },
  });
  
  // Setup mutation for updating profile
  const { trigger, error: updateError } = useSWRMutation(
    user?.uid ? `/api/users/${user.uid}` : null,
    async (url, { arg }) => {
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
      
      return res.json();
    }
  );
  
  // Initialize form with user data when it's loaded
  useEffect(() => {
    if (userData?.profile) {
      reset({
        firstName: userData.profile.firstName || "",
        lastName: userData.profile.lastName || "",
        contact: {
          email: userData.profile.contact?.email || "",
          phone: userData.profile.contact?.phone || "",
        },
        bio: userData.profile.bio || "",
        location: userData.profile.location || "",
        specialties: userData.profile.specialties || [],
        experienceLevel: userData.profile.experienceLevel || "intermediate",
        availability: userData.profile.availability || "",
        socialLinks: userData.profile.socialLinks || [],
        orgs: userData.profile.orgs || [],
        classYear: userData.profile.classYear,
      });
    }
  }, [userData, reset]);
  
  // Handle adding a specialty
  const handleAddSpecialty = () => {
    if (newSpecialty && !getValues("specialties")?.includes(newSpecialty)) {
      const currentSpecialties = getValues("specialties") || [];
      setValue("specialties", [...currentSpecialties, newSpecialty]);
      setNewSpecialty("");
    }
  };
  
  // Handle removing a specialty
  const handleRemoveSpecialty = (specialty: string) => {
    const currentSpecialties = getValues("specialties") || [];
    setValue(
      "specialties",
      currentSpecialties.filter((s) => s !== specialty)
    );
  };
  
  // Handle form submission
  const onSubmit = async (data: ProfileFormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update your profile",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await trigger(data);
      
      toast({
        title: "Profile updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      onUpdate();
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: error instanceof Error ? error.message : "An error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <Box>
        <VStack spacing={6} align="stretch">
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
            <Skeleton height="80px" data-testid="skeleton" />
            <Skeleton height="80px" data-testid="skeleton" />
            <Skeleton height="80px" data-testid="skeleton" />
            <Skeleton height="80px" data-testid="skeleton" />
            <Skeleton height="80px" data-testid="skeleton" />
            <Skeleton height="80px" data-testid="skeleton" />
          </Grid>
          <Skeleton height="120px" data-testid="skeleton" />
          <Skeleton height="40px" data-testid="skeleton" />
        </VStack>
      </Box>
    );
  }
  
  // Show error state
  if (fetchError) {
    return (
      <Box textAlign="center" p={6}>
        <Text color="red.500" fontSize="lg" fontWeight="bold">
          Error loading profile
        </Text>
        <Text mt={2}>
          {fetchError instanceof Error
            ? fetchError.message
            : "Failed to load profile data. Please try again."}
        </Text>
        <Button mt={4} colorScheme="blue" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }
  
  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={6}>
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
          gap={6}
          w="full"
        >
          <FormControl isRequired isInvalid={!!errors.firstName}>
            <FormLabel>First Name</FormLabel>
            <Input
              {...register("firstName")}
            />
            <FormErrorMessage>
              {errors.firstName?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isRequired isInvalid={!!errors.lastName}>
            <FormLabel>Last Name</FormLabel>
            <Input
              {...register("lastName")}
            />
            <FormErrorMessage>
              {errors.lastName?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.contact?.email}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              {...register("contact.email")}
            />
            <FormErrorMessage>
              {errors.contact?.email?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.contact?.phone}>
            <FormLabel>Phone</FormLabel>
            <Input
              type="tel"
              {...register("contact.phone")}
            />
            <FormErrorMessage>
              {errors.contact?.phone?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.location}>
            <FormLabel>Location</FormLabel>
            <Select
              {...register("location")}
            >
              <option value="">Select location</option>
              <option value="DC">Washington, DC</option>
              <option value="MD">Maryland</option>
              <option value="VA">Virginia</option>
              <option value="OTHER">Other</option>
            </Select>
            <FormErrorMessage>
              {errors.location?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.experienceLevel}>
            <FormLabel>Experience Level</FormLabel>
            <Select
              {...register("experienceLevel")}
            >
              <option value="">Select experience level</option>
              <option value="entry">Entry Level</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </Select>
            <FormErrorMessage>
              {errors.experienceLevel?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.availability}>
            <FormLabel>Availability</FormLabel>
            <Select
              {...register("availability")}
            >
              <option value="">Select availability</option>
              <option value="fulltime">Full Time</option>
              <option value="parttime">Part Time</option>
              <option value="contract">Contract</option>
            </Select>
            <FormErrorMessage>
              {errors.availability?.message}
            </FormErrorMessage>
          </FormControl>
          
          <FormControl isInvalid={!!errors.classYear}>
            <FormLabel>Class Year</FormLabel>
            <Input
              type="number"
              placeholder="Year you were raised (e.g., 2010)"
              {...register("classYear", {
                valueAsNumber: true,
              })}
            />
            <FormErrorMessage>
              {errors.classYear?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.specialties} gridColumn={{ md: "span 2" }}>
            <FormLabel>Specialties</FormLabel>
            <InputGroup>
              <Input
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                placeholder="Add a specialty"
              />
              <InputRightElement>
                <IconButton
                  aria-label="Add specialty"
                  icon={<MdAdd />}
                  size="sm"
                  onClick={handleAddSpecialty}
                />
              </InputRightElement>
            </InputGroup>
            <HStack spacing={2} mt={2} wrap="wrap">
              {getValues("specialties")?.map((specialty: string) => (
                <Tag
                  key={specialty}
                  size="md"
                  borderRadius="full"
                  variant="solid"
                  colorScheme="blue"
                >
                  <TagLabel>{specialty}</TagLabel>
                  <TagCloseButton
                    onClick={() => handleRemoveSpecialty(specialty)}
                  />
                </Tag>
              ))}
            </HStack>
            <FormErrorMessage>
              {errors.specialties?.message}
            </FormErrorMessage>
          </FormControl>
        </Grid>

        <FormControl isInvalid={!!errors.bio}>
          <FormLabel>Bio</FormLabel>
          <Textarea
            {...register("bio")}
            rows={4}
          />
          <FormErrorMessage>
            {errors.bio?.message}
          </FormErrorMessage>
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          isLoading={isSubmitting}
          loadingText="Updating..."
          w={{ base: "full", md: "auto" }}
        >
          Update Profile
        </Button>
      </VStack>
    </Box>
  );
}
