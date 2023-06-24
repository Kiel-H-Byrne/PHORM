import { ListingsSchema } from "@/db/schemas";
import { Box, Button, FormLabel, Input, useToast } from "@chakra-ui/react";
import { zodResolver } from '@hookform/resolvers/zod';
import { geohashForLocation } from "geofire-common";
import { useEffect, useRef } from "react";
import { Form, useForm } from "react-hook-form";
import { IListing } from "../types";

export const AddListingForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    control,
    setValue
  } = useForm({
        resolver: zodResolver(ListingsSchema),
        mode: 'all'
        // defaultValues: {
        //   street: "33 Compass Lane",
        //   name: "The Square Club",
        //   city: "Luxe",
        //   state: "XX",
        //   zip: 12345
        // }
  });
  const getPlaceDetails =  async (address:string) => {
    //  const if all fields filled, make address, pass to geo, create lat/long
    const     geocoder = new google.maps.Geocoder();
    const locationDetails = await geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == 'OK' && results) {
        // map.setCenter(results[0].geometry.location);
        // var marker = new google.maps.Marker({
        //     map: map,
        //     position: results[0].geometry.location
        // });
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }})
      const {geometry: {location}, place_id  } = locationDetails.results[0]
      const {lat, lng} = location
      const geoHash = geohashForLocation([lat(),lng()])
      return {lat:lat(), lng:lng(), geoHash, place_id}
  }
  const submitData = async ({data}: {data: IListing}) => {
    //date data, transform, then send.
    const {city, state, zip, street} = data
    const address = `${street} ${city} ${state} ${zip} `
    const details = await getPlaceDetails(address)
    //combine
    const submitData = {...data, ...details}
    fetch("/api/listings", { method: 'POST', body: JSON.stringify(submitData) })
  };
useEffect(() => {
if (Object.keys(errors).length !== 0) {
  console.warn(errors)
}
},[errors])
  const handleErrors = (data: Object) => {
    console.log("errors");
    console.log(errors);
    if (errors.zip) {
      console.log(errors.zip.message as string)
    }
  };

const useHandleSuccess = () => { 
  reset();
  useToast({colorScheme: 'green', status: "success", title: "Form Submitted", description: `Successfully submitted form.`})
 }

const formRef = useRef()

const alertToast = useToast({colorScheme: 'red', status: "error", title: "Form Error", description: `Form Error`})
  return (
    <Box
      borderWidth="1px"
      rounded="lg"
      shadow="1px 1px 3px rgba(0,0,0,0.3)"
      maxWidth={800}
      p={6}
      m="10px auto"
    >
      <Form
        // action="/api/listings"
        onSubmit={submitData}
        // headers={{'Content-Type': 'application/json'}}
        encType={'application/json'}
        onSuccess={() =>  useHandleSuccess}
        onError={() => alertToast()}
        control={control}
      >
        <FormLabel htmlFor="name"> Name</FormLabel>
        {errors.name && (
          <span>{errors.name.message as string as string}</span>
        )}

        <Input
          id="name"
          autoComplete={"true"}
          {...register("name")}
          aria-invalid={errors.name ? "true" : "false"}
        />
        <FormLabel htmlFor="street"> Street</FormLabel>
        {errors.street && (
          <span>{errors.street.message as string}</span>
        )}

        <Input
          id="street"
          {...register("street")}
          aria-invalid={errors.street ? "true" : "false"}
        />
        <FormLabel htmlFor="city"> City</FormLabel>
        {errors.city && (
          <span>{errors.city.message as string}</span>
        )}

        <Input
          id="city"
          {...register("city")}
          aria-invalid={errors.city ? "true" : "false"}
        />
        <FormLabel htmlFor="zip"> Zip</FormLabel>
        {errors.zip && (
          <span>{errors.zip.message as string}</span>
        )}

        <Input
          id="zip"
          type="number"
          {...register("zip", {
            valueAsNumber: true,
          })}
          aria-invalid={errors.zip ? "true" : "false"}
        />
        <FormLabel htmlFor="state"> State</FormLabel>
        {errors.state && (
          <span>{errors.state.message as string}</span>
        )}

        <Input
          id="state"
          maxLength={2}
          autoComplete={"true"}
          {...register("state")}
          aria-invalid={errors.state ? "true" : "false"}
        />

        <Box justifyContent={"space-around"}>
                <Button type="reset" colorScheme="blue" variant={"outline"}>
          Reset
        </Button>
        <Button type="submit" colorScheme="blue" 
        // isDisabled={Object.keys(errors).length > 0}
         >
          Submit
        </Button>
        </Box>
      </Form>
    </Box>

  );
}
