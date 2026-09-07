import { ICoupon, IListing } from "@/types";
import fetcher from "@/util/fetch";
import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  Stack,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import * as z from "zod";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  discountType: z.enum(["percent", "amount", "bogo", "free"]),
  value: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().optional()),
  code: z.string().optional(),
  memberOnly: z.boolean().default(true),
  terms: z.string().optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  tags: z.string().optional(), // comma separated input
  listingId: z.string().optional(),
});

export default function AddCouponForm({
  createdBy,
  onSuccess,
}: {
  createdBy: string;
  onSuccess?: () => void;
}) {
  const toast = useToast();
  const router = useRouter();

  const { data: listings } = useSWR<IListing[]>("/api/listings?all=true", fetcher, {
    revalidateOnFocus: false,
  });

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
    watch,
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { discountType: "percent", memberOnly: true } });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    const payload: Partial<ICoupon> = {
      title: values.title,
      description: values.description || "",
      discountType: values.discountType,
      value: values.value,
      code: values.code || "",
      memberOnly: values.memberOnly,
      terms: values.terms || "",
      validFrom: values.validFrom || undefined,
      validUntil: values.validUntil || undefined,
      tags: values.tags ? values.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      listingId: values.listingId || undefined,
      createdBy,
      active: true,
    };
    const res = await fetch("/api/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) {
      toast({ title: "Failed to create coupon", status: "error" });
      return;
    }
    toast({ title: "Coupon created", status: "success" });
    reset();
    if (onSuccess) {
      onSuccess();
    }
    router.push("/coupons");
  };

  const discountType = watch("discountType");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Title</FormLabel>
          <Input placeholder="e.g., 15% off for PHORM members" {...register("title")} />
        </FormControl>
        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea placeholder="Short details, restrictions, days, etc." {...register("description")} />
        </FormControl>
        <HStack>
          <FormControl>
            <FormLabel>Discount Type</FormLabel>
            <Select {...register("discountType")}>
              <option value="percent">Percent %</option>
              <option value="amount">Amount ($)</option>
              <option value="bogo">BOGO</option>
              <option value="free">Free add-on</option>
            </Select>
          </FormControl>
          {discountType !== "free" && discountType !== "bogo" && (
            <FormControl>
              <FormLabel>Value</FormLabel>
              <Input type="number" step="0.01" placeholder={discountType === "percent" ? "e.g., 15" : "e.g., 10.00"} {...register("value")} />
            </FormControl>
          )}
        </HStack>
        <FormControl>
          <FormLabel>Code (optional)</FormLabel>
          <Input placeholder="e.g., PHA15" {...register("code")} />
        </FormControl>
        <FormControl>
          <FormLabel>Valid From</FormLabel>
          <Input type="date" {...register("validFrom")} />
        </FormControl>
        <FormControl>
          <FormLabel>Valid Until</FormLabel>
          <Input type="date" {...register("validUntil")} />
        </FormControl>
        <FormControl>
          <FormLabel>Terms (optional)</FormLabel>
          <Textarea placeholder="Fine print, exclusions, etc." {...register("terms")} />
        </FormControl>
        <FormControl>
          <FormLabel>Tags (comma separated)</FormLabel>
          <Input placeholder="e.g., haircut, lunch, service" {...register("tags")} />
        </FormControl>
        <FormControl>
          <FormLabel>Listing (optional)</FormLabel>
          <Select placeholder="General/Consulting (no specific listing)" {...register("listingId")}>
            {listings?.map((l) => (
              <option key={l.id ?? l.name} value={String(l.id)}>
                {l.name}
              </option>
            ))}
          </Select>
        </FormControl>
        <Checkbox defaultChecked {...register("memberOnly")}>Members only</Checkbox>
        <HStack>
          <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
            Create Coupon
          </Button>
        </HStack>
      </Stack>
    </form>
  );
}

