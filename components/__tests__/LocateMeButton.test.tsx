import { fireEvent, render, screen } from "@testing-library/react";
import FloatingButtons from "../LocateMeButton";

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

const mapInstance = { panTo: jest.fn(), setZoom: jest.fn() } as any;

describe("LocateMeButton", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the add-business and locate buttons", () => {
    render(
      <FloatingButtons
        mapInstance={mapInstance}
        setClientLocation={jest.fn()}
        clientLocation={null}
      />
    );
    expect(screen.getAllByRole("button").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Find My Location")).toBeInTheDocument();
  });

  it("clears the location and doesn't crash when permission is denied", () => {
    const setClientLocation = jest.fn();
    (navigator as any).geolocation = {
      watchPosition: jest.fn((_ok, fail) => {
        fail({ code: 1, message: "denied" });
        return 1;
      }),
      clearWatch: jest.fn(),
    };
    render(
      <FloatingButtons
        mapInstance={mapInstance}
        setClientLocation={setClientLocation}
        clientLocation={null}
      />
    );
    // The locate button is the second floating button.
    fireEvent.click(screen.getAllByRole("button")[1]);
    expect(setClientLocation).toHaveBeenCalledWith(null);
  });

  it("asks signed-out users to sign in before adding a business", () => {
    render(
      <FloatingButtons
        mapInstance={mapInstance}
        setClientLocation={jest.fn()}
        clientLocation={null}
      />
    );
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(
      screen.getByText("Sign In to Add Your Business")
    ).toBeInTheDocument();
  });
});
