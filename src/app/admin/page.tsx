'use client'

import { Users, Bus, Upload } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

import UsersTab from './_components/UsersTab'
import BusModelsTab from './_components/BusModelsTab'
import UploadTab from './_components/UploadTab'

export default function AdminPage() {
  return (
    <div className="px-6 lg:px-24 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-h1 text-foreground">Panel de Administración</h1>
        <p className="text-body text-text-secondary mt-1">
          Gestión de usuarios y catálogo de buses
        </p>
      </div>

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
          <TabsTrigger value="upload" className="gap-1.5">
            <Upload className="h-4 w-4" />
            Carga de Datos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios">
          <UsersTab />
        </TabsContent>

        <TabsContent value="buses">
          <BusModelsTab />
        </TabsContent>

        <TabsContent value="upload">
          <UploadTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
