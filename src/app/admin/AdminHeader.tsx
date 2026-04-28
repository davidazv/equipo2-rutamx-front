"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Shield, LogOut, User, Settings, LayoutDashboard, Map, Bus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();

  function handleSignOut() {
    signOut();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface">
      <div className="flex h-14 items-center px-6">
        <Link href="/admin" className="flex items-center mr-8">
          <span className="text-xl font-bold text-foreground">
            Ruta<span className="text-primary-light">MX</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 mr-8">
          <Shield className="h-5 w-5 text-primary-light" />
          <span className="font-semibold">Admin Panel</span>
        </div>
        <nav className="flex items-center gap-1">
          {[
            { href: "/admin",           label: "Panel de Administración", icon: Shield },
            { href: "/admin/dashboard", label: "Dashboard",               icon: LayoutDashboard },
            { href: "/admin/map",       label: "Mapa",                    icon: Map },
            { href: "/admin/fleet",     label: "Flota",                   icon: Bus },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-primary-light/10 text-primary-light"
                  : "text-text-secondary hover:text-foreground hover:bg-surface-light"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="relative h-10 w-10 rounded-full"
                variant="ghost"
              >
                <Avatar>
                  <AvatarImage alt="Usuario" src="" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 bg-background/50 backdrop-blur-md"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="font-medium text-sm leading-none">Usuario</p>
                  <p className="text-muted-foreground text-xs leading-none">
                    usuario@rutamx.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/configuracion">
                  <Settings />
                  Configuracion
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                <LogOut />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
