import type { Metadata } from 'next'
import AdminHeader from './AdminHeader'

// Swap this constant with a real auth context when auth is implemented.
export const mockCurrentRole = 'ADMIN'

export const metadata: Metadata = {
  title: 'Admin Panel — RutaMX',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main>{children}</main>
    </div>
  )
}
