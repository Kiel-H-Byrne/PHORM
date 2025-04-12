import { useAuth } from "@/contexts/AuthContext";
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
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { memo } from "react";
import {
  FaFacebookSquare,
  FaLinkedinIn,
  FaTwitterSquare,
} from "react-icons/fa";
import { TbProgress } from "react-icons/tb";

const MyAvatar = () => {
  const { user, loading, signOut } = useAuth();
  const { push } = useRouter();
  const handleSignOut = async () => {
    await signOut();
    push("/");
  };
  const isLoggedIn = !!user;
  return (
    <Popover placement="top-start">
      <PopoverTrigger>
        <Box>
          {isLoggedIn && user?.photoURL ? (
            <Avatar loading="lazy" src={user.photoURL} />
          ) : loading ? (
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
                <Link href="/dashboard">
                  <Button>Dashboard</Button>
                </Link>
              </>
            ) : (
              <Button onClick={() => push("/auth/login")}>Sign In</Button>
            )}
          </HStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  ); // <Button leftIcon={<CheckCircleIcon />} onClick={() => signIn()}>
  //   Login
  // </Button>
};

export default memo(MyAvatar);
