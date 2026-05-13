'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Search,
  Download,
  Plus,
  Pencil,
  Ban,
  CheckCircle2,
  Trash2,
  Users,
  Bus,
  X,
  Zap,
  Flame,
  Droplets,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { getUsers, reinstateUser } from '@/lib/api/users'
import type { User, Role, UserStatus } from '@/lib/api/users'

import { getBusModels } from '@/lib/api/bus-models'
import type { BusModel, FuelType } from '@/lib/api/bus-models'

import { UserCreateForm } from './components/UserCreateForm'
import { UserEditModal } from './components/UserEditModal'
import { UserDeleteModal } from './components/UserDeleteModal'
import { UserSuspendModal } from './components/UserSuspendModal'
import { BusModelCreateModal } from './components/BusModelCreateModal'
import { BusModelEditModal } from './components/BusModelEditModal'
import { BusModelDeleteModal } from './components/BusModelDeleteModal'

// ── Types ──────────────────────────────────────────────────────────────────

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning'
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return iso.slice(0, 10)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

// ── Sub-components ─────────────────────────────────────────────────────────

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin',
  CEO: 'CEO',
  COO: 'COO',
  CMO: 'CMO',
}

const STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: 'Activo',
  SUSPENDED: 'Suspendido',
}

const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  ELECTRIC: 'Eléctrico',
  HYBRID: 'Híbrido',
  HYDROGEN: 'Hidrógeno',
}

const FUEL_TYPE_ICONS: Record<FuelType, React.ReactNode> = {
  ELECTRIC: <Zap className="h-3 w-3" />,
  HYBRID: <Flame className="h-3 w-3" />,
  HYDROGEN: <Droplets className="h-3 w-3" />,
}

const FUEL_TYPE_VARIANT: Record<FuelType, 'success' | 'default' | 'secondary'> = {
  ELECTRIC: 'success',
  HYBRID: 'default',
  HYDROGEN: 'secondary',
}

function RoleBadge({ role }: { role: Role }) {
  return (
    <Badge variant={role === 'ADMIN' ? 'default' : 'secondary'}>
      {ROLE_LABELS[role]}
    </Badge>
  )
}

function StatusBadge({ status }: { status: UserStatus }) {
  return (
    <Badge variant={status === 'ACTIVE' ? 'success' : 'warning'}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}

function FuelTypeBadge({ fuelType }: { fuelType: FuelType }) {
  return (
    <Badge variant={FUEL_TYPE_VARIANT[fuelType]} className="gap-1">
      {FUEL_TYPE_ICONS[fuelType]}
      {FUEL_TYPE_LABELS[fuelType]}
    </Badge>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const colours: Record<Toast['type'], string> = {
    success: 'bg-surface border-success/30 text-success',
    error: 'bg-surface border-danger/30 text-danger',
    warning: 'bg-surface border-warning/30 text-warning',
  }
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-md text-sm font-medium ${colours[toast.type]}`}
    >
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Cerrar notificación"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function UsersPage() {
  // ── State – Users ──────────────────────────────────────────────────────
  const [users, setUsers] = useState<User[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [suspendTarget, setSuspendTarget] = useState<User | null>(null)

  // ── State – Bus models ─────────────────────────────────────────────────
  const [busModels, setBusModels] = useState<BusModel[]>([])
  const [busSearch, setBusSearch] = useState('')
  const [busCreateOpen, setBusCreateOpen] = useState(false)
  const [editingBusModel, setEditingBusModel] = useState<BusModel | null>(null)
  const [deleteBusTarget, setDeleteBusTarget] = useState<BusModel | null>(null)

  // ── State – Shared ─────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([])

  // ── Data loading ───────────────────────────────────────────────────────
  useEffect(() => {
    getUsers().then(setUsers)
    getBusModels().then(setBusModels)
  }, [])

  // ── Toast helpers ──────────────────────────────────────────────────────
  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // ── Filtered users ─────────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    )
  }, [users, userSearch])

  // ── Filtered bus models ────────────────────────────────────────────────
  const filteredBusModels = useMemo(() => {
    const q = busSearch.toLowerCase()
    if (!q) return busModels
    return busModels.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.manufacturer.toLowerCase().includes(q) ||
        m.fuel_type.toLowerCase().includes(q)
    )
  }, [busModels, busSearch])

  // ── Reinstate ──────────────────────────────────────────────────────────
  async function handleReinstate(user: User) {
    try {
      const updated = await reinstateUser(user.id)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      addToast(`${updated.firstName} ${updated.lastName} ha sido reactivado/a.`)
    } catch {
      addToast('Ocurrió un error al reactivar el usuario.', 'error')
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="px-6 lg:px-24 py-8 flex flex-col gap-6">
      {/* Page heading */}
      <div>
        <h1 className="text-h1 text-foreground">Panel de Administración</h1>
        <p className="text-body text-text-secondary mt-1">
          Gestión de usuarios y catálogo de buses
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="usuarios">
        <TabsList>
          <TabsTrigger value="usuarios" className="gap-1.5">
            <Users className="h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="buses" className="gap-1.5">
            <Bus className="h-4 w-4" />
            Catálogo de Buses
          </TabsTrigger>
        </TabsList>

        {/* ── Usuarios tab ───────────────────────────────────────────────── */}
        <TabsContent value="usuarios">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
              <Input
                placeholder="Buscar usuarios..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="default" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
              <Button onClick={() => setCreateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Usuario
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border bg-surface shadow-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Última Actualización</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-text-muted py-12">
                      No se encontraron usuarios.
                    </TableCell>
                  </TableRow>
                )}
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell className="text-text-secondary">{user.email}</TableCell>
                    <TableCell><RoleBadge role={user.role} /></TableCell>
                    <TableCell><StatusBadge status={user.status} /></TableCell>
                    <TableCell className="text-text-secondary">{formatDate(user.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setEditingUser(user)} title="Editar usuario">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {user.status === 'ACTIVE' ? (
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => setSuspendTarget(user)}
                            title="Suspender usuario"
                            className="text-warning hover:text-warning hover:bg-warning/10"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => handleReinstate(user)}
                            title="Reactivar usuario"
                            className="text-success hover:text-success hover:bg-success/10"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => setDeleteTarget(user)}
                          title="Eliminar usuario"
                          className="text-danger hover:text-danger hover:bg-danger/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── Catálogo de Buses tab ──────────────────────────────────────── */}
        <TabsContent value="buses">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
              <Input
                placeholder="Buscar modelos..."
                value={busSearch}
                onChange={(e) => setBusSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => setBusCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Agregar Modelo
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border bg-surface shadow-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Fabricante</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Autonomía (km)</TableHead>
                  <TableHead className="text-right">Pasajeros</TableHead>
                  <TableHead className="text-right">Batería (kWh)</TableHead>
                  <TableHead className="text-right">Vel. Máx. (km/h)</TableHead>
                  <TableHead className="text-right">Costo (USD)</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBusModels.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-text-muted py-12">
                      No se encontraron modelos.
                    </TableCell>
                  </TableRow>
                )}
                {filteredBusModels.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-medium">{model.name}</TableCell>
                    <TableCell className="text-text-secondary">{model.manufacturer}</TableCell>
                    <TableCell><FuelTypeBadge fuelType={model.fuel_type} /></TableCell>
                    <TableCell className="text-right font-mono text-sm">{model.autonomy_km}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{model.passenger_capacity}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{model.battery_capacity_kwh}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{model.max_speed_kmh}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{formatCurrency(model.unit_cost_usd)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => setEditingBusModel(model)}
                          title="Editar modelo"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => setDeleteBusTarget(model)}
                          title="Eliminar modelo"
                          className="text-danger hover:text-danger hover:bg-danger/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Modals – Usuarios ──────────────────────────────────────────── */}
      <UserCreateForm
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(user) => setUsers((prev) => [...prev, user])}
        addToast={addToast}
      />
      <UserEditModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onUpdated={(updated) =>
          setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
        }
        addToast={addToast}
      />
      <UserDeleteModal
        user={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={(userId) => setUsers((prev) => prev.filter((u) => u.id !== userId))}
        addToast={addToast}
      />
      <UserSuspendModal
        user={suspendTarget}
        onClose={() => setSuspendTarget(null)}
        onSuspended={(updated) =>
          setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
        }
        addToast={addToast}
      />

      {/* ── Modals – Catálogo de Buses ─────────────────────────────────── */}
      <BusModelCreateModal
        open={busCreateOpen}
        onClose={() => setBusCreateOpen(false)}
        onCreated={(model) => setBusModels((prev) => [...prev, model])}
        addToast={addToast}
      />
      <BusModelEditModal
        model={editingBusModel}
        onClose={() => setEditingBusModel(null)}
        onUpdated={(updated) =>
          setBusModels((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
        }
        addToast={addToast}
      />
      <BusModelDeleteModal
        model={deleteBusTarget}
        onClose={() => setDeleteBusTarget(null)}
        onDeleted={(modelId) => setBusModels((prev) => prev.filter((m) => m.id !== modelId))}
        addToast={addToast}
      />

      {/* ── Toast stack ────────────────────────────────────────────────── */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-80">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
          ))}
        </div>
      )}
    </div>
  )
}
