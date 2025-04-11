import { useAuth } from "@/contexts/AuthContext";
import { findUserById } from "@/db/users";
import { IUser } from "@/types";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Tag,
  TagCloseButton,
  TagLabel,
  Textarea,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { MdAdd } from "react-icons/md";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

export default function EditProfileForm({
  onUpdate,
}: {
  onUpdate: () => void;
}) {
  const { user } = useAuth();
  const { data: member }: { data?: IUser | null } = useSWR(
    `/api/users/${user?.uid}`,
    async () => await findUserById(user?.uid)
  );
  const { trigger, error: updateError } = useSWRMutation(
    `/api/users/${user?.uid}`,
    async (url, { arg }) => {
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg),
      });
      if (!res.ok) {
        toast({
          title: updateError,
          status: "error",
          duration: 3000,
        });
      } else {
        toast({
          title: "Profile updated",
          status: "success",
          duration: 3000,
        });
      }
      return res.json();
    }
  );
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState("");
  const [formData, setFormData] = useState<Partial<IUser["profile"]>>({
    firstName: member?.profile.firstName || "",
    lastName: member?.profile.lastName || "",
    contact: {
      email: member?.profile.contact?.email || "",
      phone: member?.profile.contact?.phone || "",
    },
    bio: member?.profile.bio || "",
    location: member?.profile.location || "",
    specialties: member?.profile.specialties || [],
    experienceLevel: member?.profile.experienceLevel || "intermediate",
    availability: member?.profile.availability || "",
    socialLinks: member?.profile.socialLinks || [],
    orgs: member?.profile.orgs || [],
  });

  const handleAddSpecialty = () => {
    if (
      newSpecialty &&
      formData.specialties &&
      !formData.specialties.includes(newSpecialty)
    ) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, newSpecialty],
      });
      setNewSpecialty("");
    }
  };

  const handleRemoveSpecialty = (specialty: string) => {
    if (formData.specialties) {
      setFormData({
        ...formData,
        specialties: formData.specialties.filter((s) => s !== specialty),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("I want to send", JSON.stringify(formData));

      trigger(formData);

      onUpdate();
    } catch (error) {
      toast({
        title: "Error updating profile",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={6}>
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
          gap={6}
          w="full"
        >
          <FormControl isRequired>
            <FormLabel>First Name</FormLabel>
            <Input
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Last Name</FormLabel>
            <Input
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={formData.contact?.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contact: { ...formData.contact, email: e.target.value },
                })
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>Phone</FormLabel>
            <Input
              type="tel"
              value={formData.contact?.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contact: { ...formData.contact, phone: e.target.value },
                })
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>Location</FormLabel>
            <Select
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            >
              <option value="">Select location</option>
              <option value="DC">Washington, DC</option>
              <option value="MD">Maryland</option>
              <option value="VA">Virginia</option>
              <option value="OTHER">Other</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Experience Level</FormLabel>
            <Select
              value={formData.experienceLevel}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  experienceLevel: e.target
                    .value as IUser["profile"]["experienceLevel"],
                })
              }
            >
              <option value="">Select experience level</option>
              <option value="entry">Entry Level</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Availability</FormLabel>
            <Select
              value={formData.availability}
              onChange={(e) =>
                setFormData({ ...formData, availability: e.target.value })
              }
            >
              <option value="">Select availability</option>
              <option value="fulltime">Full Time</option>
              <option value="parttime">Part Time</option>
              <option value="contract">Contract</option>
            </Select>
          </FormControl>

          <FormControl>
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
              {formData.specialties?.map((specialty: string) => (
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
          </FormControl>
        </Grid>

        <FormControl>
          <FormLabel>Bio</FormLabel>
          <Textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
          />
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          isLoading={isLoading}
          loadingText="Updating..."
          w={{ base: "full", md: "auto" }}
        >
          Update Profile
        </Button>
      </VStack>
    </Box>
  );
}
