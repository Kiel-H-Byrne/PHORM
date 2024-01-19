import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/react";
import { memo } from "react";
import { AddListingForm } from "./";

function AddListingDrawer({
  drawerIsOpen,
  firstField,
  onDrawerClose,
}: {
  drawerIsOpen: boolean;
  firstField: undefined;
  onDrawerClose: () => void;
}) {
  // const handleSubmit () => {
  //   if (formRef.current) {
  // 		formRef.current.dispatchEvent(
  // 			new Event('submit', { cancelable: true, bubbles: true })
  // 		)
  // 	}
  // }
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
          <AddListingForm onDrawerClose={onDrawerClose} />
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px">
          <Button variant="outline" mr={3} onClick={onDrawerClose}>
            Cancel
          </Button>
          {/* <Button colorScheme="blue" onClick={handleSubmit}>Submit</Button> */}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default memo(AddListingDrawer);
