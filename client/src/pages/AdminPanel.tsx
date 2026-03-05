
import { Navbar } from "@/components/Navbar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Donor } from "@shared/schema";
import { type User } from "@shared/models/auth";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type DonorWithUser = Donor & { user: User };

export default function AdminPanel() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Redirect if not admin? 
    // Ideally handled by router or component check.
    if (user?.role !== "admin") {
        return <div className="p-8">Access Denied</div>;
    }

    const { data: donors, isLoading } = useQuery<DonorWithUser[]>({
        queryKey: ["/api/admin/donors"],
        queryFn: async () => {
            const res = await fetch("/api/admin/donors");
            if (!res.ok) throw new Error("Failed to fetch");
            return res.json();
        }
    });

    const approveMutation = useMutation({
        mutationFn: async (userId: string) => {
            const res = await fetch(`/api/admin/users/${userId}/approve`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to approve");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/donors"] });
            toast({ title: "User Approved" });
        }
    });

    const rejectMutation = useMutation({
        mutationFn: async (userId: string) => {
            const res = await fetch(`/api/admin/users/${userId}/reject`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to reject");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/donors"] });
            toast({ title: "User Rejected" });
        }
    });

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

    const pendingDonors = donors?.filter(d => d.user.status === "pending") || [];
    const approvedDonors = donors?.filter(d => d.user.status === "approved") || [];
    const rejectedDonors = donors?.filter(d => d.user.status === "rejected") || [];

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navbar />
            <main className="container mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

                <div className="grid gap-4 md:grid-cols-3 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pendingDonors.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Active Donors</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{approvedDonors.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected/Suspended</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{rejectedDonors.length}</div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="pending">
                    <TabsList>
                        <TabsTrigger value="pending">Pending ({pendingDonors.length})</TabsTrigger>
                        <TabsTrigger value="approved">Approved</TabsTrigger>
                        <TabsTrigger value="rejected">Rejected</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending">
                        <DonorTable donors={pendingDonors} onApprove={approveMutation.mutate} onReject={rejectMutation.mutate} showActions />
                    </TabsContent>

                    <TabsContent value="approved">
                        <DonorTable donors={approvedDonors} onReject={rejectMutation.mutate} showRejectOnly />
                    </TabsContent>

                    <TabsContent value="rejected">
                        <DonorTable donors={rejectedDonors} onApprove={approveMutation.mutate} showApproveOnly />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}

function DonorTable({ donors, onApprove, onReject, showActions, showRejectOnly, showApproveOnly }: any) {
    if (donors.length === 0) return <div className="p-8 text-center text-muted-foreground">No records found.</div>;

    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Blood Group</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {donors.map((d: any) => (
                        <TableRow key={d.id}>
                            <TableCell className="font-medium">
                                <div>{d.name}</div>
                                <div className="text-xs text-muted-foreground">{d.user.email}</div>
                            </TableCell>
                            <TableCell><Badge variant="outline">{d.bloodGroup}</Badge></TableCell>
                            <TableCell>{d.city}</TableCell>
                            <TableCell>{d.contactNumber}</TableCell>
                            <TableCell>{new Date(d.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right space-x-2">
                                {(showActions || showApproveOnly) && (
                                    <Button size="sm" onClick={() => onApprove(d.user.id)} className="bg-green-600 hover:bg-green-700">
                                        <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                    </Button>
                                )}
                                {(showActions || showRejectOnly) && (
                                    <Button size="sm" variant="destructive" onClick={() => onReject(d.user.id)}>
                                        <XCircle className="w-4 h-4 mr-1" /> Reject
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}
