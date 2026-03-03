import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export  default async function DashboardPage() {
  const endpoints= await prisma.webhookEndpoint.findMany({
    orderBy: {
      createdAt: "desc"
    },
    include: {
      _count: {
        select: {
          events: true
        }
      }
    }
  });

  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
          <p className="text-muted-foreground mt-2">Manage your webhook endpoints and monitor events.</p>
        </div>
        <Button disabled>+ New Endpoint</Button> {/* Disabled for now, we'll build this later */}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {endpoints.map((endpoint) => (
          <Card key={endpoint.id} className="flex flex-col justify-between hover:border-primary/50 transition-colors shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge variant={endpoint.provider === 'none' ? 'secondary' : 'default'} className="uppercase text-[10px] tracking-wider">
                  {endpoint.provider}
                </Badge>
              </div>
              <CardTitle className="text-xl">{endpoint.description || "Unnamed Endpoint"}</CardTitle>
              <CardDescription className="truncate text-xs mt-1" title={endpoint.targetUrl}>
                Target: {endpoint.targetUrl}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between text-sm border-t pt-4">
                  <span className="text-muted-foreground">Total Events</span>
                  <span className="font-medium bg-secondary px-2 py-0.5 rounded-md">{endpoint._count.events}</span>
                </div>
                {/* We will build this detail page next */}
                <Link href={`/dashboard/${endpoint.id}`}>
                  <Button variant="secondary" className="w-full">
                    View Events
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}

        {endpoints.length === 0 && (
          <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
            No endpoints found. Run your seed script to create one!
          </div>
        )}
      </div>
    </div>
  );
}
