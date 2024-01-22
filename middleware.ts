
export { default } from "next-auth/middleware";

import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/users')) {
    const token = await getToken({ req: request })
    if (!token) {
      return NextResponse.json({ success: false, message: 'auth fail' }, {
        status: 401
      })
    }
    // This logic is only applied to /api
  }
  if (request.nextUrl.pathname.startsWith('/api/listings')) {
    // This logic is only applied to /api/listings
    // IF not logged in, trim results down to <333
    // response body is flat arry of objects [{}, {}, {}, ...]
  }
}