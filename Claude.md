@AGENTS.md

---

## Storybook — Guía para agregar componentes

Los stories viven en `src/stories/<component>.stories.tsx`. Ubicar el archivo junto al componente o en esa carpeta.

### Estructura base

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Component } from "@/components/ui/component";

const meta = {
  title: "UI/Component",
  component: Component,
  tags: ["autodocs"],
  argTypes: {
    // solo para props que quieran controles interactivos
    variant: { control: "select", options: ["default", "outline"] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;
```

### Reglas de estados

**Cubrir TODOS los estados posibles** del componente en stories separadas:

1. **Default** — estado base sin props extra
2. **Cada variante** — una story por `variant` / `color` / `type`
3. **Cada tamaño** — una story por `size` si aplica
4. **Disabled** — estado deshabilitado
5. **Con valor** — componente con `defaultValue` o contenido
6. **Error / validación** — borde rojo + mensaje de error si aplica
7. **Con icono** — si el componente acepta iconos
8. **Agrupación** — múltiples instancias juntas (lista, grupo)

### Dos formas de definir una story

**Args (simple):** cuando el componente se controla solo con props.
```tsx
export const Destructive: Story = {
  args: { variant: "destructive", children: "Delete" },
};
```

**Render (composición):** cuando se necesita layout, hooks, o múltiples componentes.
```tsx
export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {/* ... */}
      </Dialog>
    );
  },
};
```

Usar `render` cuando:
- Se necesita `useState` (componentes controlados)
- Se envuelve en layout con labels, mensajes de error, etc.
- Se muestran múltiples variantes juntas (story "All Variants")

### Convenciones

- `tags: ["autodocs"]` siempre en el meta
- `argTypes` solo para props que aporten valor como control en el panel; no agregar para `children`, `className`, `onClick`
- Para layouts especiales usar `parameters: { layout: "padded" }` en vez del default "centered"
- Texto en español en los ejemplos si el proyecto lo requiere, sino inglés
- Importar sub-componentes individualmente: `{ Dialog, DialogContent, DialogHeader }`
