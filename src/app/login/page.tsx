"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { BubbleBackground } from "@/components/ui/bubble-background";
import Link from "next/link";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-8">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900">Iniciar sesión</h1>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Input
                type="email"
                placeholder="Correo electrónico"
                className="h-14 px-4 text-base bg-white border-gray-300 rounded-xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <Input
                type="password"
                placeholder="Contraseña"
                className="h-14 px-4 text-base bg-white border-gray-300 rounded-xl"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <label
                  htmlFor="remember"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  Recuérdame
                </label>
              </div>
              <Link
                href="/contact-admin"
                className="text-sm text-[#1e40af] hover:underline"
              >
                Contactar admin
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-[#1e40af] hover:bg-[#1e3a8a] text-white text-base font-semibold rounded-full"
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </div>
      </div>

      <div className="w-1/2 relative">
        <BubbleBackground interactive />
      </div>
    </div>
  );
}
