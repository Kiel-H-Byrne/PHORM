import {
  collection,
  doc,
  endAt,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  startAt,
  updateDoc,
  where,
} from "firebase/firestore";
import { distanceBetween, geohashQueryBounds } from "geofire-common";
import { IListing } from "../types";
import { appFsdb } from "./firebase";

const listingsRef = appFsdb ? collection(appFsdb, "listings") : undefined;

// == LISTINGS == //

/**
 * Create a new business listing in the database
 * @param data The listing data to create
 * @returns The document reference of the created listing
 */
const listingCreate = async function (data: IListing) {
  if (!listingsRef) return null;
  
  try {
    // Generate a new document reference
    const docRef = doc(listingsRef);
    
    // Add ID and creation timestamp if not provided
    const enhancedData = {
      ...data,
      id: docRef.id, // Use Firestore document ID as listing ID
      submitted: data.submitted || new Date(),
      updated: new Date(),
    };
    
    // Save the document
    await setDoc(docRef, enhancedData, { merge: true });
    
    console.log(`Created listing with ID: ${docRef.id}`);
    return docRef;
  } catch (error) {
    console.error('Error creating listing:', error);
    throw error;
  }
};

/**
 * Fetch all listings from the database
 * @returns Array of all listings
 */
const listingsFetchAll = async function () {
  if (!listingsRef) return [];
  console.log("Fetching all listings", new Date());

  try {
    const querySnapshot = await getDocs(listingsRef);
    const listings: IListing[] = [];
    
    querySnapshot?.forEach((doc) => {
      const data = doc.data() as IListing;
      listings.push({
        ...data,
        id: doc.id, // Ensure ID is always included
      });
    });
    
    return listings;
  } catch (error) {
    console.error('Error fetching all listings:', error);
    return [];
  }
};

/**
 * Fetch a single listing by ID
 * @param listingId The ID of the listing to fetch
 * @returns The listing data or null if not found
 */
const listingsFetch = async function (listingId: string) {
  if (!listingsRef) return null;

  try {
    const docRef = doc(listingsRef, listingId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        ...docSnap.data() as IListing,
        id: docSnap.id,
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching listing ${listingId}:`, error);
    return null;
  }
};

/**
 * Update an existing listing
 * @param listingId The ID of the listing to update
 * @param data The data to update
 * @returns True if successful, false otherwise
 */
const listingUpdate = async function (listingId: string, data: Partial<IListing>) {
  if (!listingsRef) return false;
  
  try {
    const docRef = doc(listingsRef, listingId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.error(`Listing ${listingId} not found`);
      return false;
    }
    
    // Add updated timestamp
    const updateData = {
      ...data,
      updated: new Date(),
    };
    
    await updateDoc(docRef, updateData);
    console.log(`Updated listing ${listingId}`);
    return true;
  } catch (error) {
    console.error(`Error updating listing ${listingId}:`, error);
    return false;
  }
};

/**
 * Get listings within a specified radius of a location
 * @param radiusInM Radius in meters
 * @param center Center coordinates [latitude, longitude]
 * @returns Array of listings within the radius
 */
const getListingsWithinRadius = async (
  radiusInM: number,
  center: [number, number]
) => {
  if (!listingsRef) return [];
  
  try {
    // Calculate geohash bounds for the given radius
    const bounds = geohashQueryBounds(center, radiusInM);
    const promises = [];

    // Query for each bound
    for (const bound of bounds) {
      const q = query(
        listingsRef,
        orderBy("geoHash"),
        startAt(bound[0]),
        endAt(bound[1])
      );
      promises.push(getDocs(q));
    }

    // Combine results from all queries
    const snapShots = await Promise.all(promises);
    const listings = snapShots
      .flatMap((snapShot) => snapShot.docs)
      .map((doc) => ({
        ...doc.data() as IListing,
        id: doc.id,
      }));

    // Filter by actual distance (geohash is an approximation)
    const filteredListings = listings.filter(({ lat, lng }) => {
      if (!lat || !lng) return false;
      const distanceInM = distanceBetween([lat, lng], center);
      return distanceInM <= radiusInM;
    });

    console.log(`Found ${filteredListings.length} listings within ${radiusInM}m radius`);
    return filteredListings;
  } catch (error) {
    console.error('Error getting listings within radius:', error);
    return [];
  }
};

/**
 * Delete a listing by ID
 * @param listingId The ID of the listing to delete
 * @returns True if successful, false otherwise
 */
const listingsDelete = async function (listingId: string) {
  if (!listingsRef) return false;
  
  try {
    const docRef = doc(listingsRef, listingId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.error(`Listing ${listingId} not found`);
      return false;
    }
    
    // Instead of deleting, mark as deleted
    await updateDoc(docRef, {
      deleted: true,
      deletedAt: new Date(),
    });
    
    console.log(`Marked listing ${listingId} as deleted`);
    return true;
  } catch (error) {
    console.error(`Error deleting listing ${listingId}:`, error);
    return false;
  }
};

/**
 * Search listings by name, description, or address
 * @param searchTerm The search term to look for
 * @param maxResults Maximum number of results to return
 * @returns Array of matching listings
 */
const searchListings = async function (searchTerm: string, maxResults: number = 20) {
  if (!listingsRef || !searchTerm) return [];
  
  try {
    // Get all listings (in a real app, you'd use a search index)
    const allListings = await listingsFetchAll();
    
    // Filter by search term
    const normalizedTerm = searchTerm.toLowerCase().trim();
    const results = allListings.filter(listing => 
      listing.name?.toLowerCase().includes(normalizedTerm) ||
      listing.description?.toLowerCase().includes(normalizedTerm) ||
      listing.address?.toLowerCase().includes(normalizedTerm)
    );
    
    // Limit results
    return results.slice(0, maxResults);
  } catch (error) {
    console.error('Error searching listings:', error);
    return [];
  }
};

export {
  getListingsWithinRadius,
  listingCreate,
  listingsDelete,
  listingsFetch,
  listingsFetchAll,
  listingUpdate,
  searchListings,
};
