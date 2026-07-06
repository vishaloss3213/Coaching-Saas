import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const protectedRoutes = [
  '/dashboard',
  '/students',
  '/batches',
  '/attendance',
  '/fee-plans',
  '/invoices',
  '/reminders',
  '/reports',
  '/communication',
]
const authRoutes = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const { user, response } = await updateSession(request)

  const path = request.nextUrl.pathname
  const isProtected = protectedRoutes.some((route) => path.startsWith(route))
  const isAuthPage = authRoutes.some((route) => path.startsWith(route))

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return Response.redirect(url)
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return Response.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
