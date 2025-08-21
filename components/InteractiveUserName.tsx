import {
  Avatar,
  Box,
  Flex,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Skeleton,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useFetchUser } from "../util/userHooks";

export const InteractiveUserName = ({
  userName,
  uid,
  showAvatar,
}: {
  userName: string;
  uid: string;
  showAvatar?: boolean;
}) => {
  const user = useFetchUser(uid) || null;

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
