import {
  Box,
  Button,
  FormLabel,
  Input,
  Select,
  useToast,
} from "@chakra-ui/react";
import { ListingsSchema } from "@db/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { StandaloneSearchBox } from "@react-google-maps/api";
import { IListing, StatesEnum } from "@util/index";
import { geohashForLocation } from "geofire-common";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Form, useForm } from "react-hook-form";

const AddListingForm = ({ onDrawerClose }: { onDrawerClose: () => void }) => {
  const {
    register,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    control,
  } = useForm({
    resolver: zodResolver(ListingsSchema),
    mode: "all",
    // defaultValues: {
    //   street: "33 Compass Lane",
    //   name: "The Square Club",
    //   city: "Luxe",
    //   state: "XX",
    //   zip: 12345
    // }
  });
  type Place = {
    place_id: string;
    formatted_address: string;
    geometry: { location: { lat: () => string; lng: () => string } };
  };
  const [places, setPlaces] = useState<Place[]>([]);

  const submitToast = useToast({
    colorScheme: "yellow",
    status: "info",
    title: "Submitting",
    description: `Submitting information...`,
  });

  const successToast = useToast({
    colorScheme: "green",
    status: "success",
    title: "Form Submitted",
    description: `Successfully submitted form.`,
  });

  const alertToast = useToast({
    colorScheme: "red",
    status: "error",
    title: "Form Error",
    description: `Form Error`,
  });

  const formRef = useRef();
  const searchBoxRef = useRef<StandaloneSearchBox>();
  const getPlaceDetails = useCallback(async (address: string) => {
    //  const if all fields filled, make address, pass to geo, create lat/long
    const geocoder = new google.maps.Geocoder();
    const locationDetails = await geocoder.geocode(
      { address: address },
      function (results, status) {
        if (status == "OK" && results) {
          // map.setCenter(results[0].geometry.location);
          // var marker = new google.maps.Marker({
          //     map: map,
          //     position: results[0].geometry.location
          // });
        } else {
          alert(
            "Geocode was not successful for the following reason: " + status
          );
        }
      }
    );
    const {
      geometry: { location },
      place_id,
    } = locationDetails.results[0];
    const { lat, lng } = location;
    const geoHash = geohashForLocation([lat(), lng()]);
    return { lat: lat(), lng: lng(), geoHash, place_id };
  }, []);

  const submitData = useCallback(
    async ({ data }: { data: IListing }) => {
      //date data, transform, then send.
      const { city, state, zip, street } = data;
      const address = `${street} ${city} ${state} ${zip} `;
      const details = await getPlaceDetails(address);
      //combine
      const submitData = { ...data, ...details };
      await fetch("/api/listings", {
        method: "POST",
        body: JSON.stringify(submitData),
      });
    },
    [getPlaceDetails]
  );
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox>();

  useEffect(() => {
    isSubmitting && Object.keys(errors).length !== 0 && submitToast();
    if (isSubmitSuccessful) {
      reset();
      onDrawerClose();
      successToast();
    }
  }, [
    isSubmitSuccessful,
    isSubmitting,
    submitToast,
    reset,
    onDrawerClose,
    successToast,
    errors,
  ]);
  const handlePlacesChanged = () => {
    console.log(searchBox?.getPlaces());
    setPlaces(places);
  };
  const handleSearchTextChange = (e: any) => {
    const text = e.target.value;
    // const places = searchBoxRef.current?.state.searchBox?.getPlaces();

    console.log(text, searchBox?.getPlaces());
  };
  const USBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(25.82, -124.39),
    new google.maps.LatLng(49.38, -66.94)
  );
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
        onSubmit={submitData}
        encType={"application/json"}
        onSuccess={() => console.log("Firing at all?")}
        onError={() => alertToast()}
        control={control}
      >
        <FormLabel htmlFor="name"> Name</FormLabel>
        {errors.name && <span>{errors.name.message as string as string}</span>}

        <StandaloneSearchBox
          ref={(ref) => {
            if (ref) {
              searchBoxRef.current = ref;
            }
          }}
          onPlacesChanged={handlePlacesChanged}
          onLoad={(sb) => setSearchBox(sb)}
          bounds={USBounds}
        >
          <Input
            id="search_box"
            autoComplete={"true"}
            {...register("search_box")}
            onChange={handleSearchTextChange}
            aria-invalid={errors.search_box ? "true" : "false"}
          />
        </StandaloneSearchBox>
        <ol>
          {places.map(
            ({ place_id, formatted_address, geometry: { location } }) => (
              <li key={place_id}>
                {formatted_address}
                {" at "}({location.lat()}, {location.lng()})
              </li>
            )
          )}
        </ol>
        <Input
          id="name"
          autoComplete={"true"}
          {...register("name")}
          aria-invalid={errors.name ? "true" : "false"}
        />

        <FormLabel htmlFor="street"> Street</FormLabel>
        {errors.street && <span>{errors.street.message as string}</span>}
        <Input
          id="street"
          {...register("street")}
          aria-invalid={errors.street ? "true" : "false"}
        />

        <FormLabel htmlFor="city"> City</FormLabel>
        {errors.city && <span>{errors.city.message as string}</span>}
        <Input
          id="city"
          {...register("city")}
          aria-invalid={errors.city ? "true" : "false"}
        />

        <FormLabel htmlFor="state"> State</FormLabel>
        {errors.state && <span>{errors.state.message as string}</span>}
        <Select
          id="state"
          maxLength={2}
          autoComplete={"true"}
          {...register("state")}
          aria-invalid={errors.state ? "true" : "false"}
        >
          {StatesEnum.options.map((state) => (
            <option value={state} key={state}>
              {state}
            </option>
          ))}
        </Select>

        <FormLabel htmlFor="zip"> Zip</FormLabel>
        {errors.zip && <span>{errors.zip.message as string}</span>}

        <Input
          id="zip"
          type="number"
          {...register("zip", {
            valueAsNumber: true,
          })}
          aria-invalid={errors.zip ? "true" : "false"}
        />

        <Box justifyContent={"space-around"}>
          <Button type="reset" colorScheme="blue" variant={"outline"}>
            Reset
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            isDisabled={Object.keys(errors).length > 0}
          >
            Submit
          </Button>
        </Box>
      </Form>
    </Box>
  );
};

export default memo(AddListingForm);
