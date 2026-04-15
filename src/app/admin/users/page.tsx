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
  Eye,
  EyeOff,
  Users,
  Bus,
  AlertTriangle,
  X,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  suspendUser,
  reinstateUser,
} from '@/lib/api/users'
import type { User, Role, UserStatus } from '@/lib/api/users'

// ── Types ──────────────────────────────────────────────────────────────────

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning'
}

interface UserFormData {
  fullName: string
  email: string
  role: Role
  status: UserStatus
  password: string
  confirmPassword: string
}

const EMPTY_FORM: UserFormData = {
  fullName: '',
  email: '',
  role: 'ADMIN',
  status: 'ACTIVE',
  password: '',
  confirmPassword: '',
}

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

// ── Helpers ────────────────────────────────────────────────────────────────

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/)
  const firstName = parts[0] ?? ''
  const lastName = parts.slice(1).join(' ')
  return { firstName, lastName }
}

function formatDate(iso: string): string {
  return iso.slice(0, 10)
}

// ── Sub-components ─────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: Role }) {
  return (
    <Badge variant={role === 'ADMIN' ? 'default' : 'secondary'}>
      {ROLE_LABELS[role]}
    </Badge>
  )
}

function StatusBadge({ status }: { status: UserStatus }) {
  return (
    <Badge
      variant={status === 'ACTIVE' ? 'success' : 'warning'}
    >
      {STATUS_LABELS[status]}
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
  // ── State ──────────────────────────────────────────────────────────────
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [toasts, setToasts] = useState<Toast[]>([])

  // Dialog states
  const [userDialogMode, setUserDialogMode] = useState<'create' | 'edit' | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [suspendTarget, setSuspendTarget] = useState<User | null>(null)
  const [suspendReason, setSuspendReason] = useState('')

  // Form state
  const [form, setForm] = useState<UserFormData>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UserFormData, string>>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // ── Data loading ───────────────────────────────────────────────────────
  useEffect(() => {
    getUsers().then(setUsers)
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
    const q = search.toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    )
  }, [users, search])

  // ── Form validation ────────────────────────────────────────────────────
  function validateForm(isCreate: boolean): boolean {
    const errors: typeof formErrors = {}

    if (!form.fullName.trim()) {
      errors.fullName = 'El nombre es obligatorio.'
    }
    if (!form.email.trim()) {
      errors.email = 'El correo es obligatorio.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Ingresa un correo válido.'
    }

    if (isCreate) {
      if (!form.password) {
        errors.password = 'La contraseña es obligatoria.'
      } else if (form.password.length < 6) {
        errors.password = 'Mínimo 6 caracteres.'
      }
      if (form.password !== form.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden.'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ── Dialog openers ─────────────────────────────────────────────────────
  function openCreateDialog() {
    setForm(EMPTY_FORM)
    setFormErrors({})
    setShowPassword(false)
    setShowConfirmPassword(false)
    setEditingUser(null)
    setUserDialogMode('create')
  }

  function openEditDialog(user: User) {
    setForm({
      fullName: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      role: user.role,
      status: user.status,
      password: '',
      confirmPassword: '',
    })
    setFormErrors({})
    setEditingUser(user)
    setUserDialogMode('edit')
  }

  function closeUserDialog() {
    setUserDialogMode(null)
    setEditingUser(null)
  }

  // ── Submit: create ─────────────────────────────────────────────────────
  async function handleCreateSubmit() {
    if (!validateForm(true)) return
    setSubmitting(true)
    try {
      const { firstName, lastName } = splitFullName(form.fullName)
      const user = await createUser({
        firstName,
        lastName,
        email: form.email,
        role: form.role,
        status: form.status,
        password: form.password,
      })
      setUsers((prev) => [...prev, user])
      closeUserDialog()
      addToast(`Usuario ${user.firstName} ${user.lastName} creado correctamente.`)
    } catch (err) {
      if (err instanceof Error && err.message === 'EMAIL_TAKEN') {
        setFormErrors((prev) => ({
          ...prev,
          email: 'Este correo ya está registrado.',
        }))
      } else {
        addToast('Ocurrió un error al crear el usuario.', 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── Submit: edit ───────────────────────────────────────────────────────
  async function handleEditSubmit() {
    if (!editingUser) return
    if (!validateForm(false)) return
    setSubmitting(true)
    try {
      const { firstName, lastName } = splitFullName(form.fullName)
      const updated = await updateUser(editingUser.id, {
        firstName,
        lastName,
        email: form.email,
        role: form.role,
        status: form.status,
      })
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      closeUserDialog()
      addToast(
        `Los datos de ${updated.firstName} ${updated.lastName} han sido actualizados.`
      )
    } catch (err) {
      if (err instanceof Error && err.message === 'EMAIL_TAKEN') {
        setFormErrors((prev) => ({
          ...prev,
          email: 'Este correo ya está registrado.',
        }))
      } else {
        addToast('Ocurrió un error al actualizar el usuario.', 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────
  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setSubmitting(true)
    try {
      await deleteUser(deleteTarget.id)
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id))
      addToast(
        `Usuario ${deleteTarget.firstName} ${deleteTarget.lastName} eliminado.`,
        'warning'
      )
    } catch {
      addToast('Ocurrió un error al eliminar el usuario.', 'error')
    } finally {
      setSubmitting(false)
      setDeleteTarget(null)
    }
  }

  // ── Suspend ────────────────────────────────────────────────────────────
  async function handleSuspendConfirm() {
    if (!suspendTarget) return
    if (!suspendReason.trim()) return
    setSubmitting(true)
    try {
      const updated = await suspendUser(suspendTarget.id, suspendReason.trim())
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      addToast(
        `${updated.firstName} ${updated.lastName} ha sido suspendido/a.`,
        'warning'
      )
    } catch {
      addToast('Ocurrió un error al suspender el usuario.', 'error')
    } finally {
      setSubmitting(false)
      setSuspendTarget(null)
      setSuspendReason('')
    }
  }

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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="default" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
              <Button onClick={openCreateDialog} className="gap-2">
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
                    <TableCell
                      colSpan={6}
                      className="text-center text-text-muted py-12"
                    >
                      No se encontraron usuarios.
                    </TableCell>
                  </TableRow>
                )}
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={user.status} />
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {formatDate(user.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {/* Edit */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(user)}
                          title="Editar usuario"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        {/* Suspend / Reinstate */}
                        {user.status === 'ACTIVE' ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSuspendTarget(user)
                              setSuspendReason('')
                            }}
                            title="Suspender usuario"
                            className="text-warning hover:text-warning hover:bg-warning/10"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleReinstate(user)}
                            title="Reactivar usuario"
                            className="text-success hover:text-success hover:bg-success/10"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="icon"
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

        {/* ── Buses tab ──────────────────────────────────────────────────── */}
        <TabsContent value="buses">
          <div className="rounded-xl border border-border bg-surface shadow-border p-12 text-center text-text-muted">
            <Bus className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-body">Catálogo de Buses — próximamente</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Create / Edit User Dialog ──────────────────────────────────── */}
      <Dialog
        open={userDialogMode !== null}
        onOpenChange={(open) => { if (!open) closeUserDialog() }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {userDialogMode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-5 mt-2">
            {/* ── Información ────────────────────────────────────────────── */}
            <section className="flex flex-col gap-3">
              <p className="text-sm font-medium text-foreground">Información</p>

              {/* Nombre completo */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-text-secondary">
                  Nombre completo
                </label>
                <Input
                  placeholder="Nombre Apellido"
                  value={form.fullName}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, fullName: e.target.value }))
                    setFormErrors((fe) => ({ ...fe, fullName: undefined }))
                  }}
                />
                {formErrors.fullName && (
                  <p className="text-xs text-danger">{formErrors.fullName}</p>
                )}
              </div>

              {/* Correo */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-text-secondary">
                  Correo electrónico
                </label>
                <Input
                  type="email"
                  placeholder="correo@rutamx.com"
                  value={form.email}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, email: e.target.value }))
                    setFormErrors((fe) => ({ ...fe, email: undefined }))
                  }}
                />
                {formErrors.email && (
                  <p className="text-xs text-danger">{formErrors.email}</p>
                )}
              </div>
            </section>

            {/* ── Rol y Estado ───────────────────────────────────────────── */}
            <section className="flex flex-col gap-3 border-t border-border pt-4">
              <p className="text-sm font-medium text-foreground">Rol y Estado</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-text-secondary">Rol</label>
                  <Select
                    value={form.role}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, role: v as Role }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="CEO">CEO</SelectItem>
                      <SelectItem value="COO">COO</SelectItem>
                      <SelectItem value="CMO">CMO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-text-secondary">Estado</label>
                  <Select
                    value={form.status}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, status: v as UserStatus }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Activo</SelectItem>
                      <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* ── Contraseña (solo al crear) ─────────────────────────────── */}
            {userDialogMode === 'create' && (
              <section className="flex flex-col gap-3 border-t border-border pt-4">
                <p className="text-sm font-medium text-foreground">Contraseña</p>

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-text-secondary">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Contraseña"
                      value={form.password}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, password: e.target.value }))
                        setFormErrors((fe) => ({ ...fe, password: undefined }))
                      }}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition-colors"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-xs text-danger">{formErrors.password}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-text-secondary">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repetir contraseña"
                      value={form.confirmPassword}
                      onChange={(e) => {
                        setForm((f) => ({
                          ...f,
                          confirmPassword: e.target.value,
                        }))
                        setFormErrors((fe) => ({
                          ...fe,
                          confirmPassword: undefined,
                        }))
                      }}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition-colors"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="text-xs text-danger">
                      {formErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </section>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={closeUserDialog}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={
                userDialogMode === 'create'
                  ? handleCreateSubmit
                  : handleEditSubmit
              }
              disabled={submitting}
            >
              {userDialogMode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ─────────────────────────────────── */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex items-start gap-3 rounded-lg bg-danger/5 border border-danger/20 p-3">
              <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                ¿Estás seguro de que deseas eliminar a{' '}
                <strong>
                  {deleteTarget?.firstName} {deleteTarget?.lastName}
                </strong>
                ? El usuario será bloqueado de inmediato y su cuenta quedará
                inaccesible.
              </p>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={submitting}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Suspend Dialog ─────────────────────────────────────────────── */}
      <Dialog
        open={suspendTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSuspendTarget(null)
            setSuspendReason('')
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Suspender Usuario</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-2">
            <p className="text-sm text-text-secondary">
              Al suspender a{' '}
              <strong>
                {suspendTarget?.firstName} {suspendTarget?.lastName}
              </strong>
              , el acceso quedará bloqueado de inmediato. Indica el motivo:
            </p>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-text-secondary">
                Motivo de suspensión
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-border transition-[box-shadow,border-color] duration-150 placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-light focus-visible:border-primary-light resize-none"
                placeholder="Ej. Acceso no autorizado detectado."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSuspendTarget(null)
                setSuspendReason('')
              }}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspendConfirm}
              disabled={submitting || !suspendReason.trim()}
            >
              Suspender
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
