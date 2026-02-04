import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createBikeTypeAction, updateBikeTypeAction } from "./actions";

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

            <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
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
                                            Broken / Maintenance
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Available (Calc)
                                        </th>
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">Update</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {bikeTypes.map((bike: any) => (
                                        <tr key={bike.id}>
                                            <form action={updateBikeTypeAction as unknown as (formData: FormData) => void} className="contents">
                                                <input type="hidden" name="id" value={bike.id} />
                                                <input type="hidden" name="slug" value={slug} />

                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {bike.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <Input name="totalStock" type="number" defaultValue={bike.totalStock} className="w-20" min={0} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <Input name="brokenCount" type="number" defaultValue={bike.brokenCount} className="w-20" min={0} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {Math.max(0, bike.totalStock - bike.brokenCount)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Button size="sm" type="submit">Update</Button>
                                                </td>
                                            </form>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

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
        </div>
    );
}
