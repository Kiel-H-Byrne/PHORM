import React from "react";
import {
  Avatar,
  Flex,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Table,
  Text,
  Th,
  Thead,
  Tbody,
  Tr,
  Skeleton,
  Box,
  Td,
} from "@chakra-ui/react";
import { fetchUser } from "../util/userHooks";

export const InteractiveUserName = ({
  userName,
  uid,
  showAvatar
}: {
  userName: string;
  uid: string;
  showAvatar?: boolean;
}) => {
  const user = uid ? fetchUser(uid) : null;
  return (
    <Box>
      <Popover placement="auto-end" trigger="hover">
        <PopoverTrigger>
          <Skeleton isLoaded={!!uid}>
            <Flex>
              {showAvatar && (
                <Avatar
                  src={`https://avatars.dicebear.com/api/bottts/${uid}.svg`}
                  size="xs"
                ></Avatar>
              )}
              <Text>@{user?.profile?.userName || user?.name || userName}</Text>
            </Flex>
          </Skeleton>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader
            fontWeight="semibold"
            fontSize="sm"
            textTransform="capitalize"
          >
            {userName}:
          </PopoverHeader>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody fontWeight="normal" fontSize="sm">
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Stat</Th>
                  <Th>Score</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>SomethingImpressive</Td>
                  <Td>3,089</Td>
                </Tr>
              </Tbody>
            </Table>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  );
};