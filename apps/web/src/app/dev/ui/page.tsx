import Link from "next/link";
import { ArrowRight, Shield, Trash2, Activity, Info } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "DiffAudit Design System — UI Playground",
};

const buttonVariantsList = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const;

const buttonSizesList = ["xs", "sm", "default", "lg"] as const;

const tokenSwatches: Array<{ name: string; className: string; label: string }> = [
  { name: "primary", className: "bg-primary text-primary-foreground", label: "brand blue" },
  { name: "secondary", className: "bg-secondary text-secondary-foreground", label: "neutral" },
  { name: "destructive", className: "bg-destructive text-destructive-foreground", label: "coral" },
  { name: "muted", className: "bg-muted text-muted-foreground", label: "muted" },
  { name: "accent", className: "bg-accent text-accent-foreground", label: "accent" },
  { name: "background", className: "border border-border bg-background text-foreground", label: "surface" },
  { name: "success", className: "bg-success text-success-foreground", label: "risk-low" },
  { name: "warning", className: "bg-warning text-warning-foreground", label: "risk-medium" },
  { name: "info", className: "bg-info text-info-foreground", label: "info" },
];

const radiusScale = [
  { name: "rounded-sm", px: "4px" },
  { name: "rounded-md", px: "6px" },
  { name: "rounded-lg", px: "8px" },
  { name: "rounded-xl", px: "12px" },
  { name: "rounded-2xl", px: "16px" },
  { name: "rounded-3xl", px: "24px" },
];

export default function DesignSystemPlaygroundPage() {
  return (
    <main className="min-h-screen bg-background px-8 py-10 text-foreground">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            DiffAudit · Design System
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            UI Playground
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
            Living acceptance criteria for the four-layer stack: Base UI for
            interaction & accessibility, shadcn grammar for composition,
            Tailwind v4 for tokens, Lucide for icons. If a surface here renders
            correctly, the contract holds everywhere.
          </p>
        </header>

        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold">Button · variants</h2>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-5">
            {buttonVariantsList.map((variant) => (
              <Button key={variant} variant={variant}>
                {variant}
              </Button>
            ))}
            <Button variant="default" disabled>
              disabled
            </Button>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold">Button · sizes</h2>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-5">
            {buttonSizesList.map((size) => (
              <Button key={size} size={size}>
                {size}
              </Button>
            ))}
            <Button size="icon" aria-label="action">
              <Shield strokeWidth={1.5} />
            </Button>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold">Button · with icon</h2>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-5">
            <Button>
              <ArrowRight strokeWidth={1.5} data-icon="inline-start" />
              Run audit
            </Button>
            <Button variant="destructive">
              <Trash2 strokeWidth={1.5} data-icon="inline-start" />
              Discard
            </Button>
            <Button variant="outline" size="icon-sm" aria-label="inspect">
              <Shield strokeWidth={1.5} />
            </Button>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold">buttonVariants · as link</h2>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-5">
            <Link className={cn(buttonVariants({ variant: "default" }))} href="/dev/ui">
              <ArrowRight strokeWidth={1.5} data-icon="inline-end" />
              Link styled as button
            </Link>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold">Badge · one component, all tones</h2>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-5">
            {(["default", "secondary", "destructive", "outline", "success", "warning", "info", "high", "medium", "low"] as const).map((variant) => (
              <Badge key={variant} variant={variant}>
                {variant}
              </Badge>
            ))}
            <Badge variant="success">
              <Activity strokeWidth={1.5} />
              connected
            </Badge>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold">Card · single frame grammar</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Audit summary</CardTitle>
                <CardDescription>
                  Membership-inference risk across the evaluated model assets.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">AUC</span>
                  <span className="font-mono font-medium">0.62</span>
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Risk</span>
                  <Badge variant="medium">medium</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Loading state</CardTitle>
                <CardDescription>Skeleton composes from one primitive.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-3/5" />
                <Skeleton className="mt-2 size-9 rounded-full" />
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold">Separator · accessible</h2>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 text-xs text-muted-foreground">
            <span>group a</span>
            <Separator orientation="vertical" className="h-5" />
            <span>group b</span>
            <Separator orientation="vertical" className="h-5" />
            <span>group c</span>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold">Overlays · Dialog, Dropdown, Tooltip</h2>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-5">
            <Dialog>
              <DialogTrigger render={<Button variant="outline">Open dialog</Button>} />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm discard</DialogTitle>
                  <DialogDescription>
                    This removes the draft audit configuration. The action is reversible from history.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="destructive">Discard</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline">Actions</Button>} />
              <DropdownMenuContent align="start">
                <DropdownMenuItem>
                  <Shield strokeWidth={1.5} />
                  Re-run audit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ArrowRight strokeWidth={1.5} />
                  Export report
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Trash2 strokeWidth={1.5} />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button variant="ghost" size="icon-sm" aria-label="AUC definition">
                      <Info strokeWidth={1.5} />
                    </Button>
                  }
                />
                <TooltipContent>Membership-inference AUC — area under the ROC curve.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold">Tabs · Base UI keyboard model</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="evidence">Evidence</TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="pt-4 text-xs text-muted-foreground">
                One page, one primary decision — understand current system state.
              </TabsContent>
              <TabsContent value="evidence" className="pt-4 text-xs text-muted-foreground">
                Every key metric sits next to its interpretation.
              </TabsContent>
              <TabsContent value="export" className="pt-4 text-xs text-muted-foreground">
                Report preparation — interpretation plus provenance.
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold">Breadcrumb · trail navigation</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Workspace</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Audits</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>audit-2026-0810</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold">Design tokens</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
            {tokenSwatches.map((swatch) => (
              <div
                key={swatch.name}
                className={cn(
                  "flex h-20 flex-col justify-between rounded-xl border border-border p-3 text-xs",
                  swatch.className,
                )}
              >
                <span className="font-medium">{swatch.name}</span>
                <span className="opacity-70">{swatch.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold">Radius scale (single source of truth)</h2>
          <div className="flex flex-wrap items-end gap-4 rounded-xl border border-border bg-card p-5">
            {radiusScale.map((r) => (
              <div key={r.name} className="flex flex-col items-center gap-2">
                <div
                  className={cn(r.name, "size-12 border border-border bg-accent")}
                />
                <span className="text-[11px] text-muted-foreground">{r.name}</span>
                <span className="text-[10px] text-muted-foreground/70">{r.px}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
