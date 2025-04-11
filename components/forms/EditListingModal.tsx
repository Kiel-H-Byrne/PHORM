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
}

const EditListingModal = ({ isOpen, onClose, listingId }: EditListingModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Business Listing</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <EditListingForm listingId={listingId} onClose={onClose} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EditListingModal;
