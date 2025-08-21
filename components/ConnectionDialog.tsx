import { Member } from "@/types";
import {
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";

interface ConnectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetMember: Member;
}

export default function ConnectionDialog({
  isOpen,
  onClose,
  targetMember,
}: ConnectionDialogProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetMemberId: targetMember.id,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send connection request");
      }

      toast({
        title: "Connection request sent",
        description: `Your request has been sent to ${targetMember.firstName}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send connection request. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Connect with {targetMember.firstName}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Add a personal message</FormLabel>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi ${targetMember.firstName}, I'd like to connect with you...`}
              size="sm"
              rows={4}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText="Sending"
          >
            Send Request
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
