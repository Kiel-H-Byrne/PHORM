import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
} from "@chakra-ui/react";
import AddCouponForm from "./AddCouponForm";

interface AddCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  createdBy: string;
  onSuccess?: () => void;
}

export default function AddCouponModal({
  isOpen,
  onClose,
  createdBy,
  onSuccess,
}: AddCouponModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
      <ModalContent>
        <ModalHeader>Create a Member Deal or Coupon</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <AddCouponForm
            createdBy={createdBy}
            onSuccess={() => {
              if (onSuccess) onSuccess();
              onClose();
            }}
          />
        </ModalBody>
        <ModalFooter borderTopWidth="1px" py={3}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
