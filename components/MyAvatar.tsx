import { useAuth } from "@/contexts/AuthContext";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  HStack,
  Icon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { memo } from "react";
import { TbProgress } from "react-icons/tb";

const MyAvatar = () => {
  const { user, loading, signOut } = useAuth();
  const { push } = useRouter();
  const handleSignOut = async () => {
    await signOut();
    push("/");
  };
  const isLoggedIn = !!user;
  if (!isLoggedIn) {
    return loading ? (
      <CircularProgress isIndeterminate size="32px">
        <CircularProgressLabel>
          <Icon as={TbProgress} />
        </CircularProgressLabel>
      </CircularProgress>
    ) : (
      <Button as={NextLink} href="/auth/login" size="sm" variant="outline">
        Sign in
      </Button>
    );
  }
  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Box as="button" aria-label="Account menu">
          <Avatar
            size="sm"
            loading="lazy"
            src={user?.photoURL || undefined}
            name={user?.displayName || user?.email || undefined}
          />
        </Box>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader fontWeight="semibold" textAlign={"center"}>
          {user?.displayName || user?.email || user?.phoneNumber || "Account"}
        </PopoverHeader>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>
          <HStack justify="space-evenly">
            <Button as={NextLink} href="/dashboard" colorScheme="blue">
              My dashboard
            </Button>
            <Button onClick={handleSignOut}>Sign out</Button>
          </HStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default memo(MyAvatar);
