import { ChakraProvider } from "@chakra-ui/react";
import { render, screen } from "@testing-library/react";
import AppMap, { default_props } from "../AppMap";

// The Google Maps script never loads in jsdom; we only verify the loading
// state renders without crashing.
jest.mock("@/util/mapsLoader", () => ({
  useGoogleMaps: () => ({ isLoaded: false }),
}));

describe("AppMap", () => {
  it("shows a progress bar while Google Maps loads", () => {
    render(
      <ChakraProvider>
        <AppMap
          client_location={default_props.center}
          setMapInstance={() => undefined}
          mapInstance={null}
        />
      </ChakraProvider>
    );
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
