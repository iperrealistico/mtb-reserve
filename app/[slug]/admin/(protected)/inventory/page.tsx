import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createBikeTypeAction, updateBikeTypeAction, deleteBikeTypeAction } from "./actions";
import { Trash2, Save, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DeleteBikeForm from "./delete-bike-form";

export default async function InventoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const bikeTypes = await db.bikeType.findMany({
        where: { tenantSlug: slug },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="space-y-6">
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Inventory Management
                    </h2>
                </div>
            </div>

            {bikeTypes.length === 0 ? (
                <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                    No bike types found. Add your first bike type below.
                </div>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bike Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Stock
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Broken / Maint.
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Calc Available
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Update</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {bikeTypes.map((bike: any) => (
                                <tr key={bike.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {bike.name}
                                    </td>
                                    {/* Form embedded in row for updates */}
                                    {/* Note: In React 19/Next 15 actions can be bound to forms, but multiple forms in a table might be messy.
                                         The provided code had individual forms per row. Let's keep that pattern but ensure it closes properly. 
                                         Wait, HTML <form> cannot be a child of <tr> directly. It must be inside <td> or the whole table inside form? 
                                         Actually, <form> is invalid directly under <tr> or <tbody>. 
                                         Next.js `action` on form is nice, but DOM nesting rules apply. 
                                         This might be why it's not showing! Browser removes invalid nodes.
                                     */}
                                    <td colSpan={4} className="p-0">
                                        {/* We'll use a trick: <td ...><form ...> content </form></td>? No that breaks columns.
                                         Correct way: Wrap inputs in form, but form cannot span multiple TDs easily.
                                         Alternatively, use `formAction` on button and wrap the whole row inputs? No, inputs must likely be inside form.
                                         
                                         Better approach: Make the `Update` button trigger the action, and use `form` attribute on inputs? 
                                         Or just wrap the specific cells?
                                         
                                         Let's try a single cell Form that mimics a row? No.
                                         
                                         Let's use the `form` attribute.
                                         <form id={`form-${bike.id}`} action={...}><input type="hidden" ... /></form>
                                         <input form={`form-${bike.id}`} ... />
                                         
                                         Refactoring to correct HTML structure.
                                         */}

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Re-rendering properly below with correct structure */}
                    <div className="bg-white divide-y divide-gray-200">
                        {bikeTypes.map((bike: any) => (
                            <div key={bike.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 group">
                                <div className="col-span-3">
                                    <div className="font-medium text-sm text-gray-900">{bike.name}</div>
                                    <div className="text-xs text-gray-400">ID: {bike.id}</div>
                                </div>
                                <div className="col-span-2">
                                    <form action={updateBikeTypeAction as any} className="flex flex-col gap-1">
                                        <input type="hidden" name="id" value={bike.id} />
                                        <input type="hidden" name="slug" value={slug} />
                                        <div className="flex items-center gap-2">
                                            <Input name="totalStock" type="number" defaultValue={bike.totalStock} className="h-8 w-16" min={0} />
                                            <span className="text-xs text-gray-400">Total</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Input name="brokenCount" type="number" defaultValue={bike.brokenCount} className="h-8 w-16" min={0} />
                                            <span className="text-xs text-gray-400">Broken</span>
                                        </div>
                                        <Button size="sm" type="submit" variant="ghost" className="h-7 text-xs w-full mt-1">
                                            <Save className="w-3 h-3 mr-1" /> Update
                                        </Button>
                                    </form>
                                </div>
                                <div className="col-span-2 text-sm text-gray-500 text-center">
                                    <div className="text-xs text-gray-400 mb-1">Available</div>
                                    <Badge variant={(bike.totalStock - bike.brokenCount) > 0 ? "outline" : "secondary"}>
                                        {Math.max(0, bike.totalStock - bike.brokenCount)}
                                    </Badge>
                                </div>
                                <div className="col-span-3 text-sm text-gray-500 italic px-2">
                                    {bike.notes || <span className="text-gray-300">No notes</span>}
                                </div>
                                <div className="col-span-2 text-right">
                                    <DeleteBikeForm id={bike.id} slug={slug} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Card className="max-w-md">
                <CardHeader>
                    <CardTitle>Add New Bike Type</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={createBikeTypeAction as unknown as (formData: FormData) => void} className="flex gap-4 items-end">
                        <input type="hidden" name="slug" value={slug} />
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <Input name="name" placeholder="e.g. E-Bike Pro" required />
                        </div>
                        <div className="w-24">
                            <label className="block text-sm font-medium text-gray-700">Stock</label>
                            <Input name="totalStock" type="number" defaultValue={1} min={1} required />
                        </div>
                        <Button type="submit">Add</Button>
                    </form>
                </CardContent>
            </Card>
        </div >
    );
}
