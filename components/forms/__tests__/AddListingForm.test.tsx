import { useAuth } from "@/contexts/AuthContext";
import authFetch from "@/util/authFetch";
import { geocodeAddress } from "@/util/mapsLoader";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AddListingForm } from "../";

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/util/authFetch", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/util/mapsLoader", () => ({
  useGoogleMaps: () => ({ isLoaded: true }),
  geocodeAddress: jest.fn(),
}));

const change = (label: RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

const clickNext = () =>
  fireEvent.click(screen.getByRole("button", { name: "Next" }));

async function completeStepOne() {
  change(/business name/i, "Hiram's Plumbing");
  change(/category/i, "Construction");
  clickNext();
  await screen.findByText("Step 2 of 3");
}

describe("AddListingForm", () => {
  const onDrawerClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: "test-user-id", displayName: "Test User" },
    });
    (geocodeAddress as jest.Mock).mockResolvedValue({
      lat: 38.9,
      lng: -77.03,
      place_id: "place-1",
    });
    (authFetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: "new-id", name: "Hiram's Plumbing" }),
    });
  });

  it("starts on step 1 with the business fields", () => {
    render(<AddListingForm onDrawerClose={onDrawerClose} />);
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    expect(screen.getByLabelText(/business name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/what do you do/i)).toBeInTheDocument();
  });

  it("asks signed-out users to sign in", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    render(<AddListingForm onDrawerClose={onDrawerClose} />);
    expect(
      screen.getByText("Sign in to add your business")
    ).toBeInTheDocument();
  });

  it("doesn't advance past step 1 without a name and category", async () => {
    render(<AddListingForm onDrawerClose={onDrawerClose} />);
    clickNext();
    expect(
      await screen.findByText("Business name is required")
    ).toBeInTheDocument();
    expect(screen.getByText("Choose a category")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
  });

  it("requires at least one contact method on step 2", async () => {
    render(<AddListingForm onDrawerClose={onDrawerClose} />);
    await completeStepOne();
    change(/city/i, "Washington");
    change(/state/i, "DC");
    clickNext();
    expect(
      await screen.findByText("Add at least one way to contact the business")
    ).toBeInTheDocument();
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
  });

  it("geocodes, posts the listing and shows the success screen", async () => {
    render(<AddListingForm onDrawerClose={onDrawerClose} />);
    await completeStepOne();
    change(/city/i, "Washington");
    change(/state/i, "DC");
    change(/phone/i, "202-555-0100");
    clickNext();
    await screen.findByText("Step 3 of 3");
    change(/search keywords/i, "plumbing, HVAC");

    fireEvent.click(screen.getByRole("button", { name: /publish listing/i }));

    expect(await screen.findByText(/is live!/)).toBeInTheDocument();
    expect((geocodeAddress as jest.Mock).mock.calls[0][0].trim()).toBe(
      "Washington, DC"
    );
    expect(authFetch).toHaveBeenCalledWith(
      "/api/listings",
      expect.objectContaining({ method: "POST" })
    );
    const body = JSON.parse((authFetch as jest.Mock).mock.calls[0][1].body);
    expect(body).toMatchObject({
      name: "Hiram's Plumbing",
      city: "Washington",
      state: "DC",
      phone: "202-555-0100",
      lat: 38.9,
      lng: -77.03,
      categories: ["Construction", "plumbing", "HVAC"],
    });
    expect(
      screen.getByRole("link", { name: /view your listing/i })
    ).toHaveAttribute("href", "/listing/new-id");
  });

  it("shows the server's error message when saving fails", async () => {
    (authFetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: "ZIP must be 5 digits" }),
    });
    render(<AddListingForm onDrawerClose={onDrawerClose} />);
    await completeStepOne();
    change(/city/i, "Washington");
    change(/state/i, "DC");
    change(/email/i, "owner@example.com");
    clickNext();
    await screen.findByText("Step 3 of 3");
    fireEvent.click(screen.getByRole("button", { name: /publish listing/i }));

    expect(await screen.findByText("ZIP must be 5 digits")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText(/is live!/)).not.toBeInTheDocument()
    );
  });
});
