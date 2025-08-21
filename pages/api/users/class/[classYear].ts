import { findUsersByClassYear } from "@/db/users";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { classYear },
    method,
  } = req;

  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  if (!classYear || typeof classYear !== "string") {
    return res.status(400).json({ error: "Class year is required" });
  }

  const classYearNumber = parseInt(classYear, 10);
  if (isNaN(classYearNumber)) {
    return res.status(400).json({ error: "Invalid class year" });
  }

  try {
    const users = await findUsersByClassYear(classYearNumber);
    
    // Set cache headers (cache for 1 hour)
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );
    
    return res.status(200).json({ users });
  } catch (error) {
    console.error(`Error fetching users for class year ${classYear}:`, error);
    return res.status(500).json({
      error: "Failed to fetch users",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
