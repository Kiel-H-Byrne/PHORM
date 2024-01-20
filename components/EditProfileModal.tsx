import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { EditProfileForm } from "./EditProfileForm";

export const EditProfileModal = ({
  isOpen,
  onClose,
  onToggle,
}: {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Your Profile</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <EditProfileForm onToggle={onToggle} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
