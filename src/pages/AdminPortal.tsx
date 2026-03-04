import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useGym } from "@/context/GymContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { KeyRound, Copy } from "lucide-react";
import { Navigate } from "react-router-dom";

const AdminPortal = () => {
    const { customers, isAdmin } = useGym();
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [generatedCreds, setGeneratedCreds] = useState<{ id: string; pass: string } | null>(null);

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomerId || !loginId || !password) {
            toast.error("Please select a customer and provide both ID and password.");
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from("customer_credentials")
                .insert([{
                    customer_id: selectedCustomerId,
                    login_id: loginId,
                    password: password
                }]);

            if (error) {
                if (error.code === '23505') { // Unique constraint violation
                    toast.error("This Login ID is already taken. Please choose another.");
                } else {
                    toast.error(error.message || "Failed to generate credentials.");
                }
                return;
            }

            toast.success("Credentials generated successfully!");
            setGeneratedCreds({ id: loginId, pass: password });
            setSelectedCustomerId("");
            setLoginId("");
            setPassword("");
        } catch (err) {
            console.error(err);
            toast.error("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-2xl mx-auto">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground flex items-center gap-3">
                        <KeyRound className="h-8 w-8 text-primary" />
                        Admin Portal
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Generate login credentials for your gym members.</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <form onSubmit={handleGenerate} className="space-y-5">
                        <div className="space-y-2">
                            <Label>Select Customer</Label>
                            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                                <SelectTrigger className="bg-secondary/50 border-border">
                                    <SelectValue placeholder="Choose a member" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.fullName} — {c.phone}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label>Setup Login ID</Label>
                                <Input
                                    placeholder="e.g. john_doe"
                                    value={loginId}
                                    onChange={(e) => setLoginId(e.target.value)}
                                    className="bg-secondary/50 border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Setup Password</Label>
                                <Input
                                    placeholder="Secret password"
                                    type="text"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-secondary/50 border-border"
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Generating..." : "Generate Access Credentials"}
                        </Button>
                    </form>

                    {generatedCreds && (
                        <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                            <h3 className="text-sm font-semibold text-primary mb-3">Recently Generated Credentials</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center bg-background p-2 rounded border border-border">
                                    <span className="text-muted-foreground">Login ID:</span>
                                    <span className="font-mono text-foreground font-medium flex items-center gap-2">
                                        {generatedCreds.id}
                                        <button onClick={() => copyToClipboard(generatedCreds.id)} className="text-muted-foreground hover:text-foreground"><Copy className="w-3 h-3" /></button>
                                    </span>
                                </div>
                                <div className="flex justify-between items-center bg-background p-2 rounded border border-border">
                                    <span className="text-muted-foreground">Password:</span>
                                    <span className="font-mono text-foreground font-medium flex items-center gap-2">
                                        {generatedCreds.pass}
                                        <button onClick={() => copyToClipboard(generatedCreds.pass)} className="text-muted-foreground hover:text-foreground"><Copy className="w-3 h-3" /></button>
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminPortal;
