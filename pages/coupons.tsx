import AddCouponForm from "@/components/forms/AddCouponForm";
import AddCouponModal from "@/components/forms/AddCouponModal";
import { ICoupon } from "@/types";
import fetcher from "@/util/fetch";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  HStack,
  Heading,
  Icon,
  NumberInput,
  NumberInputField,
  Select,
  SimpleGrid,
  Stack,
  Tag,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import useSWR, { mutate } from "swr";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { FaPlus, FaTag } from "react-icons/fa";
import { MdLocalOffer } from "react-icons/md";

type CouponsPageResponse = {
  data: ICoupon[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function CouponCard({ c }: { c: ICoupon }) {
  const bg = useColorModeValue("white", "gray.800");
  return (
    <Card bg={bg} borderRadius="md" shadow="sm">
      <CardHeader>
        <Heading size="md">{c.title}</Heading>
        {c.code ? (
          <Tag colorScheme="purple" mt={2}>
            Code: {c.code}
          </Tag>
        ) : null}
      </CardHeader>
      <CardBody>
        {c.description ? (
          <Text color="gray.700" mb={2}>
            {c.description}
          </Text>
        ) : null}
        <Text fontSize="sm" color="gray.600">
          {c.discountType}
          {c.value ? ` • ${c.value}` : ""}
          {c.memberOnly ? " • Members only" : ""}
        </Text>
        {Array.isArray(c.tags) && c.tags.length > 0 && (
          <HStack mt={3} spacing={2} wrap="wrap">
            {c.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </HStack>
        )}
      </CardBody>
    </Card>
  );
}

export default function CouponsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const page = parseInt((router.query.page as string) || "1", 10);
  const pageSize = parseInt((router.query.pageSize as string) || "12", 10);

  const params = new URLSearchParams();
  params.set("includeCount", "true");
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  const data_uri = `/api/coupons?${params.toString()}`;

  const { data, mutate: mutateCoupons } = useSWR<CouponsPageResponse>(data_uri, fetcher, {
    revalidateOnFocus: false,
  });

  const items = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const pushQuery = (patch: Record<string, any>) => {
    router.push({ pathname: router.pathname, query: { ...router.query, ...patch } }, undefined, { shallow: true });
  };

  const handleAddCouponClick = () => {
    if (user) {
      onOpen();
    } else {
      router.push("/auth/login?redirect=/coupons");
    }
  };

  const emptyBg = useColorModeValue("gray.50", "gray.800");
  const emptyBorder = useColorModeValue("gray.200", "gray.700");

  return (
    <Stack spacing={8} px={{ base: 4, md: 8 }} py={{ base: 6, md: 10 }} maxW="1200px" mx="auto">
      <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "flex-start", sm: "center" }} gap={4}>
        <Box>
          <Heading size="xl">Member Deals & Coupons</Heading>
          <Text color="gray.600" mt={1}>
            Explore discounts and special offers from businesses in the PHORM network.
          </Text>
        </Box>
        <Button
          colorScheme="blue"
          leftIcon={<Icon as={FaPlus} />}
          onClick={handleAddCouponClick}
          flexShrink={0}
        >
          Add a Coupon
        </Button>
      </Flex>

      {user && (
        <AddCouponModal
          isOpen={isOpen}
          onClose={onClose}
          createdBy={user.uid}
          onSuccess={() => {
            mutateCoupons();
            mutate("/api/coupons");
          }}
        />
      )}

      {items.length === 0 ? (
        <Box
          textAlign="center"
          py={12}
          px={6}
          bg={emptyBg}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={emptyBorder}
        >
          <Icon as={MdLocalOffer} boxSize={14} color="blue.400" mb={4} />
          <Heading size="lg" mb={2}>
            No Deals or Coupons Found
          </Heading>
          <Text color="gray.600" maxW="500px" mx="auto" mb={6}>
            There are currently no active deals or coupons available in the network.
            Be the first to share an exclusive discount or offer with the PHORM community!
          </Text>
          <Button
            colorScheme="blue"
            size="lg"
            leftIcon={<Icon as={FaPlus} />}
            onClick={handleAddCouponClick}
          >
            {user ? "Create the First Coupon" : "Log In to Add a Coupon"}
          </Button>
        </Box>
      ) : (
        <>
          <HStack w="100%" justify="space-between" wrap="wrap" gap={3}>
            <Text color="gray.600">
              Page {page} of {totalPages} • {total} offers
            </Text>
            <HStack>
              <Text fontSize="sm">Page size:</Text>
              <Select size="sm" value={String(pageSize)} onChange={(e) => pushQuery({ pageSize: e.target.value, page: 1 })} w="auto">
                {[12, 20, 50].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </Select>
              <HStack>
                <Button size="sm" onClick={() => pushQuery({ page: Math.max(1, page - 1) })} isDisabled={page <= 1}>Prev</Button>
                <Button size="sm" onClick={() => pushQuery({ page: Math.min(totalPages, page + 1) })} isDisabled={page >= totalPages}>Next</Button>
              </HStack>
              <HStack>
                <Text fontSize="sm">Go to:</Text>
                <NumberInput size="sm" value={page} min={1} max={totalPages} onChange={(_, v) => {
                  const next = Math.min(totalPages, Math.max(1, v || 1));
                  if (next !== page) pushQuery({ page: next });
                }} w="80px">
                  <NumberInputField />
                </NumberInput>
              </HStack>
            </HStack>
          </HStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
            {items.map((c) => (
              <CouponCard key={String((c as any).id)} c={c} />
            ))}
          </SimpleGrid>
        </>
      )}
    </Stack>
  );
}

