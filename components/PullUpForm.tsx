import { useRef, useState } from "react";
// import { useFormik } from "formik";
import { useForm } from "react-hook-form";
import { mutate } from "swr";
// import axios from "axios";
import { Accordion, AccordionButton, AccordionItem, AccordionPanel, Box, Button, CircularProgress, Flex, Text, Textarea } from "@chakra-ui/react";
import { signin, useSession } from "next-auth/react";
import { GLocation } from "../types";

interface Props {
  onClose: () => void;
  locationData: GLocation;
  uid: string;
  userName: string;
}

export const PullUpForm = ({ onClose, locationData, uid, userName }: Props) => {
  const [session, loading] = useSession();
  const [allowRecord, setAllowRecord] = useState(false);
  const formRef = useRef(null);

  const { handleSubmit, register, errors } = useForm();



  const onSubmit = async (values) => {
    // get geoPoint, place on map with message metadata
    // show x or check, if wrong, get accurate point. if right, show modal
    // load modal w/ form
    // on form submit, place pin on map, pan to new pin, wait, pan back to user's location
    // upload and get URL for video blob
    // set url to form values and submit

    const apiUri = `api/pullups?lat=${locationData.lat}&lng=${locationData.lng}`;
    let mediaInfo;


    const submit_data = {
      ...values,
      userName,
      uid,
      location: {
        lng: locationData.lng,
        lat: locationData.lat,
      },
      timestamp: new Date().toISOString(),
      ...(mediaInfo && mediaInfo),
    };

    mutate(apiUri, submit_data, false);
    mutate(apiUri, await fetch(apiUri, { method: "POST", body: JSON.stringify(submit_data) }));

    onClose();
  };

  return (
    <Box marginInline="3">
      {!loading ? (
        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data" ref={formRef}>
          <Accordion defaultIndex={[0]} allowMultiple>
            <AccordionItem>
              <AccordionButton textAlign="center">
                <Flex m={"0 auto"}>COMMENT</Flex>
              </AccordionButton>
              <AccordionPanel>
                <Textarea rows={2} id="message" name="message" ref={register({ minLength: 5, required: true })} />
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <AccordionButton onClick={() => setAllowRecord(true)}>
                <Flex m={"0 auto"}>RECORD</Flex>
              </AccordionButton>
              <AccordionPanel>

              </AccordionPanel>
            </AccordionItem>
          </Accordion>
          {errors.message && (
            <Text as="p" color="red" textAlign="center">
              {errors.message.type === "minLength"
                ? "Let's say a bit more..."
                : "Cannot be blank"}
            </Text>
          )}
          {session ? (
            <Button type="submit">Post</Button>
          ) : (
            <Button onClick={() => signin()}>Login to Pull Up!</Button>
          )}
        </form>
      ) : (
        <CircularProgress isIndeterminate />
      )}
    </Box>
  );
};
