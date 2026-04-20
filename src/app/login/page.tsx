"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { BubbleBackground } from "@/components/ui/bubble-background";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      <div className="w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-8">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900">Iniciar sesión</h1>
          </div>

          <form className="space-y-6">
            <div>
              <Input
                type="email"
                placeholder="Correo electrónico"
                className="h-14 px-4 text-base bg-white border-gray-300 rounded-xl"
              />
            </div>

            <div>
              <Input
                type="password"
                placeholder="Contraseña"
                className="h-14 px-4 text-base bg-white border-gray-300 rounded-xl"
              />
            </div>

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
            >
              Iniciar sesión
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
