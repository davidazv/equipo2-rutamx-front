import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-h2 text-foreground border-b border-border pb-2">{title}</h2>
      <div className="flex flex-wrap gap-3 items-start">{children}</div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-12">
      <div>
        <p className="text-label text-text-muted mb-1">RutaMX Design System</p>
        <h1 className="text-display text-foreground">Component Library</h1>
        <p className="text-body text-text-secondary mt-2">
          All basic UI components with the RutaMX design system.
          Open Storybook at <code className="text-mono bg-surface-light px-1 rounded">localhost:6006</code> for interactive docs.
        </p>
      </div>

      <Section title="Buttons">
        <Button variant="default">Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
        <Button disabled>Disabled</Button>
      </Section>

      <Section title="Badges">
        <Badge variant="default">Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Error</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="success">Active</Badge>
        <Badge variant="warning">Pending</Badge>
      </Section>

      <Section title="Input">
        <div className="flex flex-col gap-2 w-64">
          <Input placeholder="Enter text..." />
          <Input type="email" placeholder="name@company.com" />
          <Input placeholder="Disabled" disabled />
        </div>
      </Section>

      <Section title="Avatars">
        <AvatarGroup>
          {["AL", "MX", "JR", "KA"].map((i) => (
            <Avatar key={i} className="border-2 border-surface">
              <AvatarFallback>{i}</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
        <Avatar size="sm"><AvatarFallback>SM</AvatarFallback></Avatar>
        <Avatar size="default"><AvatarFallback>MD</AvatarFallback></Avatar>
        <Avatar size="lg"><AvatarFallback>LG</AvatarFallback></Avatar>
      </Section>

      <Section title="Cards">
        <Card className="w-72">
          <CardHeader>
            <CardTitle>Fleet Overview</CardTitle>
            <CardDescription>Active buses this week</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">148</p>
            <p className="text-xs text-success mt-1">+12% vs last month</p>
          </CardContent>
          <CardFooter>
            <Button size="sm" variant="outline">View all</Button>
          </CardFooter>
        </Card>
      </Section>

      <Section title="Table">
        <div className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Route</TableHead>
                <TableHead className="text-right">Battery</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { id: "EB-001", model: "Yutong E12", route: "MB-1", battery: "92%" },
                { id: "EB-002", model: "BYD K9", route: "MB-3", battery: "41%" },
                { id: "EB-003", model: "Yutong E12", route: "MB-2", battery: "78%" },
              ].map((bus) => (
                <TableRow key={bus.id}>
                  <TableCell className="font-mono text-xs">{bus.id}</TableCell>
                  <TableCell>{bus.model}</TableCell>
                  <TableCell>{bus.route}</TableCell>
                  <TableCell className="text-right font-medium">{bus.battery}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      <Section title="Spinners">
        <Spinner size="sm" />
        <Spinner size="default" />
        <Spinner size="lg" />
        <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary">
          <Spinner variant="white" />
        </div>
      </Section>

      <Section title="Error State">
        <div className="border border-border rounded-xl w-full">
          <ErrorState
            title="Failed to load data"
            description="Could not connect to the server. Please check your connection."
            action={<Button size="sm" variant="outline">Retry</Button>}
          />
        </div>
      </Section>
    </main>
  );
}
