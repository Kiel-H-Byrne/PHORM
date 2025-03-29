import { IListing } from "@/types";
import { z } from "zod";

// Define StatesEnum
const StatesEnum = z.enum(["MD", "DC", "VA"]);

// Define UserSchema and ClaimSchema if needed
const UserSchema = z.object({
  // Define UserSchema properties here
});

const ClaimSchema = z.object({
  // Define ClaimSchema properties here
});

// Function to generate a random integer within a range
function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to generate a random business
function generateRandomBusiness(): any {
  const cityOptions = [
    "Baltimore",
    "Washington",
    "Arlington",
    "Alexandria",
    "Silver Spring",
  ];
  const stateOptions = ["MD", "DC", "VA"];
  const streetOptions = [
    "Main St",
    "Broadway",
    "Washington St",
    "Market St",
    "Elm St",
  ];
  const nameOptions = [
    "ABC Company",
    "XYZ Corporation",
    "123 Enterprises",
    "Smith & Sons",
    "Johnson LLC",
  ];
  const descriptionOptions = [
    "Best in town",
    "Quality products",
    "Excellent service",
    "Family-owned",
    "Eco-friendly",
  ];

  const randomCity = cityOptions[getRandomInt(0, cityOptions.length - 1)];
  const randomState = stateOptions[getRandomInt(0, stateOptions.length - 1)];
  const randomStreet = `${getRandomInt(100, 999)} ${streetOptions[getRandomInt(0, streetOptions.length - 1)]
    }`;
  const randomName = nameOptions[getRandomInt(0, nameOptions.length - 1)];
  const randomDescription =
    descriptionOptions[getRandomInt(0, descriptionOptions.length - 1)];

  return {
    name: randomName + getRandomInt(100, 999),
    address: `${randomStreet}, ${randomCity}, ${randomState}`,
    street: randomStreet,
    city: randomCity,
    state: randomState,
    lat: Math.random() * (39.0 - 38.0) + 38.0, // Rough latitude range for the MD/DC/VA area
    lng: Math.random() * (-76.0 - -78.0) - 78.0, // Rough longitude range for the MD/DC/VA area
    submitted: new Date(),
    place_id: `${getRandomInt(1000, 9999)}-${getRandomInt(1000, 9999)}`,
    claims: [],
    claimsCount: getRandomInt(0, 10),
    imageUri: "https://picsum.photos/seed/357/100/100", // Placeholder image URL
    creator: {}, // Placeholder for user object
    zip: getRandomInt(20000, 29999), // Rough zip code range for the MD/DC/VA area
    description: randomDescription,
  };
}

// Function to generate an array of random businesses
function generateRandomBusinesses(count: number): IListing[] {
  const businesses: any[] = [];
  for (let i = 0; i < count; i++) {
    businesses.push(generateRandomBusiness());
  }
  return businesses;
}

export { generateRandomBusinesses };
