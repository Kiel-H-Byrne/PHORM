import { useAuth } from "@/contexts/AuthContext";
import authFetch from "@/util/authFetch";
import { geocodeAddress } from "@/util/mapsLoader";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import useSWR from "swr";
import { EditListingForm } from "../";

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockMutate = jest.fn();
jest.mock("swr", () => ({
  __esModule: true,
  default: jest.fn(),
  useSWRConfig: () => ({ mutate: mockMutate }),
}));

jest.mock("@/util/authFetch", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/util/mapsLoader", () => ({
  useGoogleMaps: () => ({ isLoaded: true }),
  geocodeAddress: jest.fn(),
}));

const listingId = "listing-1";
const listing = {
  id: listingId,
  name: "Test Business",
  description: "This is a test business",
  street: "123 Test St",
  city: "Washington",
  state: "DC",
  zip: "20001",
  phone: "202-555-0100",
  url: "https://example.com",
  lat: 38.9,
  lng: -77.03,
  categories: ["Construction", "plumbing"],
  creator: { id: "owner-id", name: "Owner" },
};

describe("EditListingForm", () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: { uid: "owner-id" } });
    (useSWR as jest.Mock).mockReturnValue({ data: listing, isLoading: false });
    (authFetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ ...listing }),
    });
    (geocodeAddress as jest.Mock).mockResolvedValue({
      lat: 1,
      lng: 2,
      place_id: "p",
    });
  });

  it("loads the listing from the API and fills the form", async () => {
    render(<EditListingForm listingId={listingId} onClose={onClose} />);
    expect(useSWR).toHaveBeenCalledWith(`/api/listings/${listingId}`);
    expect(
      await screen.findByDisplayValue("Test Business")
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toHaveValue("Construction");
    expect(screen.getByLabelText(/search keywords/i)).toHaveValue("plumbing");
    expect(screen.getByLabelText(/^city/i)).toHaveValue("Washington");
  });

  it("shows a loading state", () => {
    (useSWR as jest.Mock).mockReturnValue({ data: undefined, isLoading: true });
    render(<EditListingForm listingId={listingId} onClose={onClose} />);
    expect(screen.queryByLabelText(/business name/i)).not.toBeInTheDocument();
  });

  it("shows not found when the listing doesn't exist", () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
    });
    render(<EditListingForm listingId={listingId} onClose={onClose} />);
    expect(screen.getByText("Listing not found.")).toBeInTheDocument();
  });

  it("blocks users who don't own the listing", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { uid: "someone-else" } });
    render(<EditListingForm listingId={listingId} onClose={onClose} />);
    expect(
      screen.getByText("Only the owner of this listing can edit it.")
    ).toBeInTheDocument();
  });

  it("saves changes with an authenticated PUT without re-geocoding", async () => {
    render(<EditListingForm listingId={listingId} onClose={onClose} />);
    const name = await screen.findByDisplayValue("Test Business");
    fireEvent.change(name, { target: { value: "Renamed Business" } });

    const save = screen.getByRole("button", { name: /save changes/i });
    await waitFor(() => expect(save).toBeEnabled());
    fireEvent.click(save);

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(geocodeAddress).not.toHaveBeenCalled();
    expect(authFetch).toHaveBeenCalledWith(
      `/api/listings/${listingId}`,
      expect.objectContaining({ method: "PUT" })
    );
    const body = JSON.parse((authFetch as jest.Mock).mock.calls[0][1].body);
    expect(body).toMatchObject({
      name: "Renamed Business",
      categories: ["Construction", "plumbing"],
    });
    expect(mockMutate).toHaveBeenCalled();
  });

  it("re-geocodes when the address changes", async () => {
    render(<EditListingForm listingId={listingId} onClose={onClose} />);
    const city = await screen.findByDisplayValue("Washington");
    fireEvent.change(city, { target: { value: "Silver Spring" } });
    fireEvent.change(screen.getByLabelText(/^state/i), {
      target: { value: "MD" },
    });
    fireEvent.change(screen.getByLabelText(/^zip/i), {
      target: { value: "20910" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(geocodeAddress).toHaveBeenCalledWith(
      "123 Test St, Silver Spring, MD 20910"
    );
    const body = JSON.parse((authFetch as jest.Mock).mock.calls[0][1].body);
    expect(body).toMatchObject({ lat: 1, lng: 2 });
  });
});
