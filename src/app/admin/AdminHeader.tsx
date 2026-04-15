'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, Settings, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function AdminHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-border h-14 flex items-center px-6">
      {/* Logo */}
      <Link href="/admin" className="flex items-center mr-8">
        <span className="text-xl font-bold text-foreground">Ruta</span>
        <span className="text-xl font-bold text-primary">MX</span>
      </Link>

      {/* Nav label */}
      <div className="flex items-center gap-2 text-foreground">
        <Shield className="h-5 w-5" />
        <span className="text-base font-semibold">Admin Panel</span>
      </div>

      {/* Right: user avatar */}
      <div className="ml-auto relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Menú de usuario"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-surface-light text-foreground font-medium text-sm">
              U
            </AvatarFallback>
          </Avatar>
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-11 z-50 w-56 rounded-lg border border-border bg-surface shadow-md overflow-hidden">
              <div className="px-3 py-2.5 border-b border-border">
                <p className="text-sm font-medium text-foreground">Usuario</p>
                <p className="text-xs text-text-muted">usuario@rutamx.com</p>
              </div>
              <div className="py-1">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-surface-light transition-colors">
                  <Settings className="h-4 w-4" />
                  Configuración
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-surface-light transition-colors">
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
