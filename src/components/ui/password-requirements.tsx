import { Check, X } from "lucide-react";

const RULES = [
  { label: "Mínimo 10 caracteres", test: (p: string) => p.length >= 10 },
  { label: "Al menos una mayúscula", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Al menos una minúscula", test: (p: string) => /[a-z]/.test(p) },
  { label: "Al menos un número", test: (p: string) => /\d/.test(p) },
  {
    label: "Al menos un carácter especial (!@#$%^&*...)",
    test: (p: string) => /[!@#$%^&*()\-_=+[\]{};':"\\|,.<>/?`~]/.test(p),
  },
];

export function passwordMeetsRequirements(password: string): boolean {
  return RULES.every((r) => r.test(password));
}

export function PasswordRequirements({ password }: { readonly password: string }) {
  if (!password) return null;
  return (
    <ul className="mt-2 space-y-1">
      {RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <li
            key={rule.label}
            className={`flex items-center gap-1.5 text-xs ${met ? "text-green-600" : "text-red-500"}`}
          >
            {met ? (
              <Check className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <X className="h-3.5 w-3.5 shrink-0" />
            )}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
