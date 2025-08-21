import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  // Skip middleware for public routes and assets
  if (request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)) {
    return NextResponse.next();
  }

  // Skip middleware for public paths
  const publicPaths = ['/sign-in', '/api', '/_next', '/assets'];
  if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Basic rate limiting using headers
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'anonymous';
  const rateLimit = request.headers.get('x-ratelimit-remaining');
  if (rateLimit === '0') {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  return NextResponse.next();
}

// Specify which paths middleware should run on
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api (API routes)
     * 2. /_next (Next.js internals)
     * 3. /static (static files)
     * 4. /sign-in (auth pages)
     * 5. all files in /public
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sign-in|assets).*)',
  ],
};