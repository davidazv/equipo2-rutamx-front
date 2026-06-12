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
  KeyRound,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { getUsers, reinstateUser, exportUsersCsv } from '@/lib/api/users'
import type { User, Role, UserStatus } from '@/lib/api/users'

import { UserCreateForm } from './UserCreateForm'
import { UserEditModal } from './UserEditModal'
import { UserDeleteModal } from './UserDeleteModal'
import { UserSuspendModal } from './UserSuspendModal'
import { UserResetPasswordModal } from './UserResetPasswordModal'

// ── Types ──────────────────────────────────────────────────────────────────

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning'
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 10) : '—'
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

function RoleBadge({ role }: { readonly role: Role }) {
  return (
    <Badge variant={role === 'ADMIN' ? 'default' : 'secondary'}>
      {ROLE_LABELS[role]}
    </Badge>
  )
}

function StatusBadge({ status }: { readonly status: UserStatus }) {
  return (
    <Badge
      variant={status === 'ACTIVE' ? 'success' : 'warning'}
    >
      {STATUS_LABELS[status]}
    </Badge>
  )
}

function ToastItem({ toast, onDismiss }: { readonly toast: Toast; readonly onDismiss: (id: string) => void }) {
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

// ── Component ─────────────────────────────────────────────────────────────

export default function UsersTab() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [toasts, setToasts] = useState<Toast[]>([])

  const [createOpen, setCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [suspendTarget, setSuspendTarget] = useState<User | null>(null)
  const [resetPasswordTarget, setResetPasswordTarget] = useState<User | null>(null)

  useEffect(() => {
    getUsers().then(setUsers)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 4000)
  }, [removeToast])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

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

  async function handleReinstate(user: User) {
    try {
      const updated = await reinstateUser(user.id)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      addToast(`${updated.firstName} ${updated.lastName} ha sido reactivado/a.`)
    } catch {
      addToast('Ocurrió un error al reactivar el usuario.', 'error')
    }
  }

  const [exporting, setExporting] = useState(false)

  async function handleExportCsv() {
    setExporting(true)
    try {
      await exportUsersCsv()
      addToast('Lista de usuarios exportada correctamente.')
    } catch (err) {
      console.error('[HU25] exportUsersCsv error:', err)
      addToast('Ocurrió un error al exportar el CSV.', 'error')
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
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
          <Button
            variant="outline"
            size="default"
            className="gap-2"
            onClick={handleExportCsv}
            disabled={exporting}
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exportando...' : 'Exportar CSV'}
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingUser(user)}
                      title="Editar usuario"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setResetPasswordTarget(user)}
                      title="Restablecer contraseña"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <KeyRound className="h-4 w-4" />
                    </Button>

                    {user.status === 'ACTIVE' ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSuspendTarget(user)}
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

      {/* Modals */}
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
        onDeleted={(userId) =>
          setUsers((prev) => prev.filter((u) => u.id !== userId))
        }
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

      <UserResetPasswordModal
        user={resetPasswordTarget}
        onClose={() => setResetPasswordTarget(null)}
        addToast={addToast}
      />

      {/* Toast stack */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-80">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
          ))}
        </div>
      )}
    </>
  )
}
