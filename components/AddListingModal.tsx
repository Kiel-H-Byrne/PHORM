import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useBreakpointValue,
  Button,
} from "@chakra-ui/react";
import { memo, useRef } from "react";
import AddListingForm from "./forms/AddListingForm";

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function AddListingModal({ isOpen, onClose }: AddListingModalProps) {
  const modalSize = useBreakpointValue({ base: "full", md: "5xl", lg: "6xl" });
  const initialRef = useRef(null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={modalSize}
      initialFocusRef={initialRef}
      scrollBehavior="inside"
      isCentered
    >
      <ModalOverlay 
        bg="blackAlpha.300"
        backdropFilter="blur(5px)"
      />
      <ModalContent maxW={{ base: "95%", md: "90%", lg: "1000px" }}>
        <ModalHeader 
          textAlign="center" 
          borderBottomWidth="1px" 
          fontSize={{ base: "xl", md: "2xl" }}
          py={4}
        >
          Add Your Business
        </ModalHeader>
        <ModalCloseButton size="lg" />
        
        <ModalBody py={6} px={{ base: 4, md: 8 }}>
          <AddListingForm onDrawerClose={onClose} />
        </ModalBody>
        
        <ModalFooter borderTopWidth="1px" py={4}>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default memo(AddListingModal);
