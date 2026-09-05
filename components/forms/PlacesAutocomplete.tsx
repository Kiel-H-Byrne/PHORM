import {
  Box,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";

interface PlacesAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  isInvalid?: boolean;
  errorMessage?: string;
  defaultValue?: string;
}

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = [
  "places",
];

const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  onPlaceSelect,
  isInvalid,
  errorMessage,
  defaultValue = "",
}) => {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [predictions, setPredictions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const autocompleteService =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!autocompleteService.current) {
      autocompleteService.current =
        new google.maps.places.AutocompleteService();

      // Create a dummy div for PlacesService (it requires a DOM element)
      const placesServiceDiv = document.createElement("div");
      placesServiceDiv.style.display = "none";
      document.body.appendChild(placesServiceDiv);

      placesService.current = new google.maps.places.PlacesService(
        placesServiceDiv
      );

      return () => {
        document.body.removeChild(placesServiceDiv);
      };
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.length > 2 && autocompleteService.current) {
      autocompleteService.current.getPlacePredictions(
        {
          input: value,
          componentRestrictions: { country: "us" }, // Restrict to US only
          types: ["address"], // Only return address results
        },
        (predictions, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setPredictions(predictions);
            setShowPredictions(true);
          } else {
            setPredictions([]);
            setShowPredictions(false);
          }
        }
      );
    } else {
      setPredictions([]);
      setShowPredictions(false);
    }
  };

  const handlePredictionClick = (placeId: string) => {
    if (placesService.current) {
      placesService.current.getDetails(
        {
          placeId,
          fields: [
            "address_components",
            "formatted_address",
            "geometry",
            "name",
            "place_id",
          ],
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            setInputValue(place.formatted_address || "");
            setPredictions([]);
            setShowPredictions(false);
            onPlaceSelect(place);
          }
        }
      );
    }
  };

  const handleBlur = () => {
    // Delay hiding predictions to allow for clicks
    setTimeout(() => {
      setShowPredictions(false);
    }, 200);
  };

  // if (!autocompleteService.current) {
  //   return (
  //     <FormControl isInvalid={isInvalid} mb={3} gridColumn={{ md: "span 2" }}>
  //       <FormLabel>Address</FormLabel>
  //       <Input placeholder="Loading Google Places..." disabled />
  //     </FormControl>
  //   );
  // }

  return (
    <FormControl
      isInvalid={isInvalid}
      mb={3}
      gridColumn={{ md: "span 2" }}
      position="relative"
    >
      <FormLabel>Address</FormLabel>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <FaMapMarkerAlt color="gray.300" />
        </InputLeftElement>
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={() => predictions.length > 0 && setShowPredictions(true)}
          placeholder="Enter a US address"
          autoComplete="off"
        />
      </InputGroup>
      {isInvalid && errorMessage && (
        <FormErrorMessage>{errorMessage}</FormErrorMessage>
      )}
      <FormHelperText>Start typing to search for a US address</FormHelperText>

      {/* Predictions dropdown */}
      {showPredictions && predictions.length > 0 && (
        <Box
          position="absolute"
          zIndex={10}
          width="100%"
          mt={1}
          bg="white"
          boxShadow="md"
          borderRadius="md"
          maxH="200px"
          overflowY="auto"
        >
          {predictions.map((prediction) => (
            <Box
              key={prediction.place_id}
              p={2}
              cursor="pointer"
              _hover={{ bg: "gray.100" }}
              onClick={() => handlePredictionClick(prediction.place_id)}
            >
              <Text fontSize="sm">{prediction.description}</Text>
            </Box>
          ))}
        </Box>
      )}
    </FormControl>
  );
};

export default PlacesAutocomplete;
