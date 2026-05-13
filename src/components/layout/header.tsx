"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Map, Bus, Settings, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentRole, type DashboardRole } from "@/hooks/use-current-role";

const NAV_ITEMS = [
  { key: "/dashboard", label: "Tablero", icon: LayoutDashboard },
  { key: "/map",       label: "Mapa",    icon: Map },
  { key: "/fleet",     label: "Flota",   icon: Bus },
];

const NAV_ALLOWED_BY_ROLE: Record<DashboardRole, ReadonlySet<string>> = {
  ceo:   new Set(["/dashboard", "/map", "/fleet"]),
  coo:   new Set(["/dashboard", "/map", "/fleet"]),
  cmo:   new Set(["/dashboard", "/map"]),
  admin: new Set(["/dashboard", "/map", "/fleet"]),
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const role = useCurrentRole();

  function handleSignOut() {
    signOut();
    router.push("/login");
  }

  const allowedKeys = NAV_ALLOWED_BY_ROLE[role];
  const navItems = NAV_ITEMS.filter((item) => allowedKeys.has(item.key));

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80">
      <div className="flex h-16 items-center px-6">
        <Link href={`/${role}/dashboard`} className="flex items-center mr-8">
          <span className="text-xl font-bold text-foreground">
            Ruta<span className="text-primary-light">MX</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const href = `/${role}${item.key}`;
            const isActive = pathname === href || pathname.startsWith(href + "/");

            return (
              <Link
                key={item.key}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-light/10 text-primary-light"
                    : "text-text-secondary hover:text-foreground hover:bg-surface-light",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="relative h-10 w-10 rounded-full" variant="ghost">
                <Avatar>
                  <AvatarImage alt="Usuario" src="" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-background/50 backdrop-blur-md">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="font-medium text-sm leading-none">Usuario</p>
                  <p className="text-muted-foreground text-xs leading-none">usuario@rutamx.com</p>
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
