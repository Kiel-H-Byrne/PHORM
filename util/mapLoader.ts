// This file provides a centralized configuration for loading the Google Maps API
// to ensure consistent options are used throughout the application

import { Libraries } from "@react-google-maps/api";

// Define the libraries to use
export const mapLibraries = ["places", "geometry", "visualization"] as Libraries;

// Define the loader options
export const loaderOptions = {
  id: "google-map-script",
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
  libraries: mapLibraries,
};
