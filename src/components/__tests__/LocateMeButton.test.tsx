import LocateMeButton from "@components/LocateMeButton";
import { Map, initialize, mockInstances } from "@googlemaps/jest-mocks";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render } from "@testing-library/react";
import { SessionProvider } from "next-auth/react";

beforeEach(() => {
  initialize();
});

// Mock the necessary dependencies and props
// jest.mock('google.maps.Marker', () => jest.fn());
// jest.mock('google.maps.Circle', () => jest.fn());

const mockSetClientLocation = jest.fn(); // Mock the setClientLocation prop

describe("LocateMeButton", () => {
  it("should render the component correctly", () => {
    const { container } = render(
      <SessionProvider>
        <LocateMeButton
          mapInstance={mockInstances.get(Map)[0]}
          setClientLocation={mockSetClientLocation}
          clientLocation={null}
        />
      </SessionProvider>
    );

    expect(container).toMatchSnapshot();
  });

  it('should call handleClick when the "My Location" button is clicked', () => {
    const { getByLabelText } = render(
      <SessionProvider>
        <LocateMeButton
          mapInstance={mockInstances.get(Map)[0]}
          setClientLocation={mockSetClientLocation}
          clientLocation={null}
        />
      </SessionProvider>
    );

    const myLocationButton = getByLabelText("My Location");
    fireEvent.click(myLocationButton);

    // Add your assertions here to check if the necessary functions have been called
    expect(mockSetClientLocation).toHaveBeenCalledTimes(1);
    // ...
  });

  it('should call handleOpen when the "Add Listing" button is clicked', () => {
    const { getByLabelText } = render(
      <SessionProvider>
        <LocateMeButton
          mapInstance={mockInstances.get(Map)[0]}
          setClientLocation={mockSetClientLocation}
          clientLocation={null}
        />
      </SessionProvider>
    );

    const addListingButton = getByLabelText("Add Listing");
    fireEvent.click(addListingButton);

    // Add your assertions here to check if the necessary functions have been called
    // ...
  });
});
