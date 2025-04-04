import { getListingsWithinRadius, listingCreate, listingsFetchAll } from "@/db/listings";
import { MAX_AGE } from "@/util/constants";
import { NextApiRequest, NextApiResponse } from "next";
import { IListing } from "../../../types";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { by, limit = '20', lat, lng, page = '1', search, category },
    method,
  } = req;

  // Parse pagination parameters
  const pageNumber = parseInt(page as string, 10) || 1;
  const pageSize = parseInt(limit as string, 10) || 20;
  const offset = (pageNumber - 1) * pageSize;

  switch (method) {
    case "GET":
      try {
        let listings: IListing[] = [];

        // Get listings based on location if lat/lng provided
        if (lat && lng) {
          const radius = 15000; // 15km radius
          listings = await getListingsWithinRadius(
            radius,
            [Number(lat), Number(lng)]
          ) || [];
        } else {
          // Otherwise get all listings
          listings = await listingsFetchAll() || [];
        }

        // Filter by search term if provided
        if (search) {
          const searchTerm = (search as string).toLowerCase();
          listings = listings.filter(listing =>
            listing.name?.toLowerCase().includes(searchTerm) ||
            listing.description?.toLowerCase().includes(searchTerm) ||
            listing.address?.toLowerCase().includes(searchTerm)
          );
        }

        // Filter by category if provided
        if (category) {
          listings = listings.filter(listing =>
            listing.categories?.includes(category as string)
          );
        }

        // Get total count before pagination
        const totalCount = listings.length;

        // Apply pagination
        const paginatedListings = listings.slice(offset, offset + pageSize);

        // Set cache headers
        res.setHeader(
          "Cache-Control",
          `public, max-age=${MAX_AGE}, s-maxage=${2 * MAX_AGE}`
        );

        // Return paginated results with metadata
        res.status(200).json({
          listings: paginatedListings,
          pagination: {
            total: totalCount,
            page: pageNumber,
            pageSize,
            totalPages: Math.ceil(totalCount / pageSize),
          }
        });
      } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ error: 'Failed to fetch listings' });
      }
      break;
    case "POST":
      try {
        // Check authentication (uncomment when auth is fully implemented)
        // if (!req.user) {
        //   return res.status(401).json({ error: 'Authentication required' });
        // }

        console.log("Received POST request to create listing");

        // Validate request body
        if (!req.body) {
          return res.status(400).json({ error: "Request body is required" });
        }

        // Parse and create the listing
        const listingData = JSON.parse(req.body) as IListing;

        // Add timestamp if not provided
        if (!listingData.submitted) {
          listingData.submitted = new Date();
        }

        // Create the listing
        await listingCreate(listingData);

        // Return success response
        return res.status(201).json({
          success: true,
          message: "Listing created successfully",
          listing: listingData
        });
      } catch (error) {
        console.error('Error creating listing:', error);
        return res.status(500).json({
          error: 'Failed to create listing',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;
