import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  HStack,
  Icon,
  Link,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  useDisclosure,
} from "@chakra-ui/react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { memo } from "react";
import {
  FaFacebookSquare,
  FaLinkedinIn,
  FaTwitterSquare,
} from "react-icons/fa";
import { TbProgress } from "react-icons/tb";
import { EditProfileModal } from "./EditProfileModal";

const MyAvatar = () => {
  const { data: session, status } = useSession();
  const { push } = useRouter();
  const { isOpen, onToggle, onOpen, onClose } = useDisclosure();
  const handleSignOut = () => {
    push("/");
    signOut();
  };
  const isLoggedIn = status === "authenticated";
  return (
    <Popover placement="top-start">
      <PopoverTrigger>
        <Box>
          {isLoggedIn && session?.user?.image ? (
            <Avatar loading="lazy" src={session.user.image} />
          ) : status === "loading" ? (
            <CircularProgress isIndeterminate>
              <CircularProgressLabel>
                <Icon as={TbProgress} />
              </CircularProgressLabel>
            </CircularProgress>
          ) : (
            <Avatar
              src={`https://api.dicebear.com/7.x/shapes/svg?backgroundType=gradientLinear,solid&radius=50&seed=${Math.random().toPrecision(
                20
              )}}`}
            />
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader fontWeight="semibold" textAlign={"center"}>
          Status
        </PopoverHeader>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>
          <HStack spacing={1} justifyContent={"space-evenly"}>
            <Link href="#">
              <Icon boxSize={30} as={FaFacebookSquare} />
            </Link>
            <Link href="#">
              <Icon boxSize={30} as={FaLinkedinIn} />
            </Link>
            <Link href="#">
              <Icon boxSize={30} as={FaTwitterSquare} />
            </Link>
          </HStack>
          <HStack justify="space-evenly">
            {isLoggedIn ? (
              <>
              <Button onClick={handleSignOut}>Sign Out</Button>
              <Button onClick={onToggle}>Edit Profile</Button>
              </>
            ) : (
              <Button onClick={() => signIn()}>Sign In</Button>
            )}
          </HStack>
          <EditProfileModal
            isOpen={isOpen}
            onClose={onClose}
            onToggle={onToggle}
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  ); // <Button leftIcon={<CheckCircleIcon />} onClick={() => signIn()}>
  //   Login
  // </Button>
};

export default memo(MyAvatar);
