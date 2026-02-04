import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function PlaygroundPage() {
    return (
        <div className="container mx-auto p-12 space-y-12">
            <div>
                <h1 className="text-4xl font-heading font-bold mb-4">UI Playground</h1>
                <p className="text-muted-foreground text-lg">Visual verification of Design System components.</p>
            </div>

            {/* Typography */}
            <section className="space-y-4">
                <h2 className="text-2xl font-heading font-semibold">Typography (Outfit & Inter)</h2>
                <div className="space-y-2 border p-4 rounded-xl">
                    <h1 className="text-4xl font-heading font-bold">Heading 1 (Outfit Bold 4xl inside helper)</h1>
                    <h2 className="text-3xl font-heading font-bold">Heading 2 (Outfit Bold 3xl inside helper)</h2>
                    <h3 className="text-2xl font-heading font-semibold">Heading 3 (Outfit Semibold 2xl)</h3>
                    <p className="text-lg">Body Large (Inter Text-lg)</p>
                    <p className="text-base">Body Default (Inter Text-base)</p>
                    <p className="text-sm text-muted-foreground">Caption / Muted (Inter Text-sm)</p>
                </div>
            </section>

            {/* Buttons */}
            <section className="space-y-4">
                <h2 className="text-2xl font-heading font-semibold">Buttons</h2>
                <div className="flex flex-wrap gap-4 items-center">
                    <Button>Primary Button</Button>
                    <Button size="lg">Large Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                </div>
                <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">Admin Huge Button</h3>
                    <div className="grid grid-cols-2 max-w-lg gap-4">
                        <Button variant="admin-huge" size="admin-huge">
                            <span>Admin Action</span>
                            <span className="text-xs font-normal text-gray-500">Subtitle specific</span>
                        </Button>
                        <Button variant="admin-huge" size="admin-huge" className="border-green-200 bg-green-50 text-green-900">
                            <span>Hand Over</span>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Badges */}
            <section className="space-y-4">
                <h2 className="text-2xl font-heading font-semibold">Badges</h2>
                <div className="flex gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="info">Info</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                </div>
            </section>

            {/* Inputs & Forms */}
            <section className="space-y-4">
                <h2 className="text-2xl font-heading font-semibold">Inputs & Cards</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Public Card</CardTitle>
                            <CardDescription>Soft shadow, no border, rounded-2xl</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input placeholder="Public Input (Rounded)" />
                            <Button className="w-full">Submit Action</Button>
                        </CardContent>
                    </Card>

                    <Card className="border-2 shadow-lg rounded-lg">
                        <CardHeader>
                            <CardTitle>Admin Card</CardTitle>
                            <CardDescription>High contrast, border, rounded-lg</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input className="h-14 text-lg border-2 border-gray-400" placeholder="Admin Input (Grandma-proof)" />
                            <Button variant="default" className="w-full h-12 text-lg rounded-lg">Admin Submit</Button>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}
