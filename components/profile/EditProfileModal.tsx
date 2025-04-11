import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import EditProfileForm from "./EditProfileForm";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export const EditProfileModal = ({
  isOpen,
  onClose,
  onToggle,
}: EditProfileModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Your Profile</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <EditProfileForm onUpdate={onToggle} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
