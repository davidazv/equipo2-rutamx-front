"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser, saveUser, getToken, changePassword } from "@/lib/auth";
import type { CurrentUser } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import { PasswordRequirements, passwordMeetsRequirements } from "@/components/ui/password-requirements";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export default function ConfiguracionPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.replace("/login"); return; }
    setUser(u);
    setFirstName(u.firstName);
    setLastName(u.lastName);
  }, [router]);

  async function handleProfileSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/admin/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ firstName, lastName, roleId: undefined }),
      });
      if (!res.ok) throw new Error("Error al guardar los cambios");
      const updated: CurrentUser = { ...user, firstName, lastName };
      saveUser(updated);
      setUser(updated);
      setProfileMsg({ type: "ok", text: "Perfil actualizado correctamente" });
    } catch (err) {
      setProfileMsg({ type: "err", text: err instanceof Error ? err.message : "Error inesperado" });
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setPassMsg(null);
    if (!currentPassword) {
      setPassMsg({ type: "err", text: "Ingresa tu contraseña actual" });
      return;
    }
    if (!passwordMeetsRequirements(newPassword)) {
      setPassMsg({ type: "err", text: "La nueva contraseña no cumple los requisitos de seguridad" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMsg({ type: "err", text: "Las contraseñas no coinciden" });
      return;
    }
    setPassLoading(true);
    try {
      await changePassword(user.email, currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPassMsg({ type: "ok", text: "Contraseña cambiada correctamente" });
    } catch (err) {
      setPassMsg({ type: "err", text: err instanceof Error ? err.message : "Error inesperado" });
    } finally {
      setPassLoading(false);
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label="Regresar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Perfil y configuración</h1>
            <p className="text-sm text-muted-foreground mt-1">Administra tu perfil y credenciales de acceso</p>
          </div>
        </div>

        {/* Información personal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información personal</CardTitle>
            <CardDescription>Actualiza tu nombre. El correo es asignado por el administrador y no puede modificarse.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Nombre
                  </label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={profileLoading}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Apellido
                  </label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={profileLoading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Correo electrónico
                </label>
                <Input value={user.email} disabled className="text-muted-foreground" />
              </div>

              {profileMsg && (
                <p className={`text-sm ${profileMsg.type === "ok" ? "text-green-600" : "text-red-600"}`} role="alert">
                  {profileMsg.text}
                </p>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={profileLoading}>
                  {profileLoading ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Cambiar contraseña */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cambiar contraseña</CardTitle>
            <CardDescription>Elige una contraseña segura que cumpla todos los requisitos.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Contraseña actual
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={passLoading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Nueva contraseña
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={passLoading}
                />
                <PasswordRequirements password={newPassword} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Confirmar contraseña
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={passLoading}
                />
              </div>

              {passMsg && (
                <p className={`text-sm ${passMsg.type === "ok" ? "text-green-600" : "text-red-600"}`} role="alert">
                  {passMsg.text}
                </p>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={passLoading || !passwordMeetsRequirements(newPassword)}>
                  {passLoading ? "Cambiando..." : "Cambiar contraseña"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
