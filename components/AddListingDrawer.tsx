import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay
} from "@chakra-ui/react";
import { AddListingForm } from "./AddListingForm";

export function AddListingDrawer({
  drawerIsOpen, firstField, onDrawerClose,
}: {
  drawerIsOpen: boolean;
  firstField: undefined;
  onDrawerClose: () => void;
}) {
  return (
    <Drawer
      isOpen={drawerIsOpen}
      placement={"left"}
      initialFocusRef={firstField}
      onClose={onDrawerClose}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" m={"auto"}>
          Add Your Business{" "}
        </DrawerHeader>

        <DrawerBody>
          <AddListingForm />
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px">
          <Button variant="outline" mr={3} onClick={onDrawerClose}>
            Cancel
          </Button>
          {/* <Button colorScheme="blue" onClick={(e) => handleSubmit(submitData, handleErrors)}>Submit</Button> */}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
