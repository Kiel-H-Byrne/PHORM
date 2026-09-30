import { useJsApiLoader } from "@react-google-maps/api";

// Every useJsApiLoader call must pass identical options, so share them here.
const LOADER_OPTIONS = {
  id: "google-map-script",
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
};

export const useGoogleMaps = () => useJsApiLoader(LOADER_OPTIONS);

/** Geocodes a free-form address with the Maps JS API (must be loaded). */
export function geocodeAddress(address: string) {
  return new Promise<{ lat: number; lng: number; place_id: string }>(
    (resolve, reject) => {
      if (!window.google?.maps) {
        return reject(new Error("Maps is still loading. Please try again."));
      }
      new google.maps.Geocoder().geocode({ address }, (results, status) => {
        const hit = results?.[0];
        if (status === "OK" && hit) {
          resolve({
            lat: hit.geometry.location.lat(),
            lng: hit.geometry.location.lng(),
            place_id: hit.place_id,
          });
        } else {
          reject(
            new Error(
              "We couldn't find that address. Please check the city, state and ZIP."
            )
          );
        }
      });
    }
  );
}
