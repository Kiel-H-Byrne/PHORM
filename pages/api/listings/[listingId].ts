import { listingsFetch, listingUpdate } from "@/db/listings";
import { MAX_AGE } from "@/util/constants";
import { NextApiRequest, NextApiResponse } from "next";
import { IListing } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { listingId },
    method,
  } = req;

  // Validate listingId
  if (!listingId || typeof listingId !== "string") {
    return res.status(400).json({ error: "Invalid listing ID" });
  }

  switch (method) {
    case "GET":
      try {
        const listing = await listingsFetch(listingId);
        
        if (!listing) {
          return res.status(404).json({ error: "Listing not found" });
        }
        
        res.setHeader(
          "Cache-Control",
          `public, max-age=${MAX_AGE}, s-maxage=${2 * MAX_AGE}`
        );
        
        return res.status(200).json(listing);
      } catch (error) {
        console.error(`Error fetching listing ${listingId}:`, error);
        return res.status(500).json({ 
          error: "Failed to fetch listing",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
      break;

    case "PUT":
      try {
        // Check if listing exists
        const existingListing = await listingsFetch(listingId);
        
        if (!existingListing) {
          return res.status(404).json({ error: "Listing not found" });
        }
        
        // TODO: Add authentication check here
        // if (!req.user || req.user.uid !== existingListing.creator?.id) {
        //   return res.status(403).json({ error: "Not authorized to edit this listing" });
        // }
        
        // Parse and validate request body
        if (!req.body) {
          return res.status(400).json({ error: "Request body is required" });
        }
        
        const updateData = JSON.parse(req.body) as Partial<IListing>;
        
        // Add updated timestamp
        updateData.updated = new Date();
        
        // Update the listing
        const success = await listingUpdate(listingId, updateData);
        
        if (!success) {
          return res.status(500).json({ error: "Failed to update listing" });
        }
        
        // Return success response
        return res.status(200).json({ 
          success: true, 
          message: "Listing updated successfully",
          listingId
        });
      } catch (error) {
        console.error(`Error updating listing ${listingId}:`, error);
        return res.status(500).json({ 
          error: "Failed to update listing",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
      break;

    case "DELETE":
      try {
        // Check if listing exists
        const existingListing = await listingsFetch(listingId);
        
        if (!existingListing) {
          return res.status(404).json({ error: "Listing not found" });
        }
        
        // TODO: Add authentication check here
        // if (!req.user || req.user.uid !== existingListing.creator?.id) {
        //   return res.status(403).json({ error: "Not authorized to delete this listing" });
        // }
        
        // Mark listing as deleted (soft delete)
        const success = await listingUpdate(listingId, { 
          deleted: true,
          deletedAt: new Date()
        });
        
        if (!success) {
          return res.status(500).json({ error: "Failed to delete listing" });
        }
        
        // Return success response
        return res.status(200).json({ 
          success: true, 
          message: "Listing deleted successfully",
          listingId
        });
      } catch (error) {
        console.error(`Error deleting listing ${listingId}:`, error);
        return res.status(500).json({ 
          error: "Failed to delete listing",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
