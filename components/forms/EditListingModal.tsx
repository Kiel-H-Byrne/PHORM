import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import EditListingForm from "./EditListingForm";

interface EditListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  onDeleted?: () => void;
}

const EditListingModal = ({
  isOpen,
  onClose,
  listingId,
  onDeleted,
}: EditListingModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "full", md: "xl" }}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Business Listing</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <EditListingForm
            listingId={listingId}
            onClose={onClose}
            onDeleted={onDeleted}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EditListingModal;
