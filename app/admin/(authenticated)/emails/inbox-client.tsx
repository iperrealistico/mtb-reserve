"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Mail, Phone, MapPin, Search, Trash2, CheckCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { deleteRequestAction, updateRequestStatusAction } from "./inbox-actions";

interface SignupRequest {
    id: string;
    organization: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string | null;
    message: string | null;
    status: string;
    createdAt: Date;
}

export function InboxClient({ requests: initialRequests }: { requests: SignupRequest[] }) {
    const [requests, setRequests] = useState(initialRequests);
    const [selectedRequest, setSelectedRequest] = useState<SignupRequest | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this request?")) return;
        const res = await deleteRequestAction(id);
        if (res.success) {
            setRequests(prev => prev.filter(r => r.id !== id));
            toast.success("Request deleted");
            if (selectedRequest?.id === id) setSelectedRequest(null);
        } else {
            toast.error(res.error);
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        const res = await updateRequestStatusAction(id, status);
        if (res.success) {
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
            if (selectedRequest?.id === id) setSelectedRequest(prev => prev ? { ...prev, status } : null);
            toast.success(`Request marked as ${status}`);
        } else {
            toast.error(res.error);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Organization</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {requests.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-neutral-500">
                                No requests found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        requests.map((req) => (
                            <TableRow key={req.id} className="cursor-pointer hover:bg-neutral-50" onClick={() => setSelectedRequest(req)}>
                                <TableCell className="font-medium">
                                    {req.organization}
                                    <div className="text-xs text-neutral-500 font-normal">{req.firstName} {req.lastName}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col text-sm">
                                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {req.email}</span>
                                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {req.phone}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={req.status === "PENDING" ? "outline" : req.status === "REPLIED" ? "default" : "secondary"}>
                                        {req.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-neutral-500 text-sm">
                                    {format(new Date(req.createdAt), "MMM d, yyyy")}
                                </TableCell>
                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(req.id)}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                <DialogContent className="max-w-2xl bg-white border-none rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold font-outfit">{selectedRequest?.organization}</DialogTitle>
                        <DialogDescription className="text-neutral-500">
                            Request received on {selectedRequest && format(new Date(selectedRequest.createdAt), "PPP p")}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-6 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-semibold text-neutral-900">Applicant</h4>
                                    <p className="text-neutral-600">{selectedRequest.firstName} {selectedRequest.lastName}</p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-semibold text-neutral-900">Location</h4>
                                    <p className="text-neutral-600 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> {selectedRequest.address || "N/A"}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-sm font-semibold text-neutral-900">Contacts</h4>
                                <div className="flex gap-4 text-neutral-600">
                                    <a href={`mailto:${selectedRequest.email}`} className="flex items-center gap-2 hover:text-blue-600">
                                        <Mail className="w-4 h-4" /> {selectedRequest.email}
                                    </a>
                                    <a href={`tel:${selectedRequest.phone}`} className="flex items-center gap-2 hover:text-blue-600">
                                        <Phone className="w-4 h-4" /> {selectedRequest.phone}
                                    </a>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-neutral-900">Fleet Details / Message</h4>
                                <div className="bg-neutral-50 p-4 rounded-lg text-neutral-700 text-sm leading-relaxed border border-neutral-100">
                                    {selectedRequest.message || "No message provided."}
                                </div>
                            </div>

                            <DialogFooter className="flex gap-2 sm:justify-between items-center border-t pt-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-neutral-500">Status:</span>
                                    <Badge variant={selectedRequest.status === "PENDING" ? "outline" : selectedRequest.status === "REPLIED" ? "default" : "secondary"}>
                                        {selectedRequest.status}
                                    </Badge>
                                </div>
                                <div className="flex gap-2">
                                    {selectedRequest.status !== "REPLIED" && (
                                        <Button onClick={() => handleStatusUpdate(selectedRequest.id, "REPLIED")}>
                                            <CheckCircle className="w-4 h-4 mr-2" /> Mark as Replied
                                        </Button>
                                    )}
                                    {selectedRequest.status !== "ARCHIVED" && (
                                        <Button variant="outline" onClick={() => handleStatusUpdate(selectedRequest.id, "ARCHIVED")}>
                                            Archive
                                        </Button>
                                    )}
                                    <Button variant="destructive" size="icon" onClick={() => {
                                        handleDelete(selectedRequest.id);
                                        setSelectedRequest(null);
                                    }}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
