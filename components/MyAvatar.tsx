import {
  Avatar,
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
import { signOut, useSession } from "next-auth/react";
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
  const { isOpen, onToggle, onOpen, onClose } = useDisclosure();

  return status === "authenticated" && session.user ? (
    <Popover placement="top-start">
      <PopoverTrigger>
        <Avatar
          loading="lazy"
          src={
            session.user.image ??
            `https://api.dicebear.com/6.x/bottts/svg?seed=${session.user.email}`
          }
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader fontWeight="semibold" textAlign={"center"}>
          Log Out/Share
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
            <Button onClick={() => signOut()}>Log Out</Button>
            <Button onClick={onToggle}>Edit Profile</Button>
          </HStack>
          <EditProfileModal
            isOpen={isOpen}
            onClose={onClose}
            onToggle={onToggle}
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  ) : status === "loading" ? (
    <CircularProgress isIndeterminate>
      <CircularProgressLabel>
        <Icon as={TbProgress} />
      </CircularProgressLabel>
    </CircularProgress>
  ) : // <Button leftIcon={<CheckCircleIcon />} onClick={() => signIn()}>
  //   Login
  // </Button>
  null;
};

export default memo(MyAvatar);
