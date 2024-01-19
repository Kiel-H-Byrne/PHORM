import { Link, useColorModeValue } from "@chakra-ui/react";

export const NavLink = ({ path, label }: { path: string; label: string }) => {
  const LinkHoverBgColor = useColorModeValue("gray.200", "gray.700");
  return (
    <Link
      px={2}
      py={1}
      rounded={"md"}
      _hover={{
        textDecoration: "none",
        bg: LinkHoverBgColor,
      }}
      href={path}
    >
      {label}
    </Link>
  );
};
