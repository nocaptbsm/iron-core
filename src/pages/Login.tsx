import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lock, User, ShieldCheck, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useGym } from "@/context/GymContext";

const Login = () => {
    const [tab, setTab] = useState<"customer" | "admin">("customer");
    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { loginCustomer, loginAdmin } = useGym();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginId || !password) {
            toast.error("Please enter both Login ID and Password.");
            return;
        }

        setIsLoading(true);
        try {
            if (tab === "admin") {
                if (password === "1234") {
                    loginAdmin();
                    toast.success("Admin access granted");
                    navigate("/admin");
                } else {
                    toast.error("Invalid Admin password.");
                }
            } else {
                const success = await loginCustomer(loginId, password);
                if (success) {
                    toast.success("Login successful!");
                    navigate("/");
                } else {
                    toast.error("Invalid Login ID or Password.");
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred during login.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute top-3/4 -left-1/4 w-1/2 h-1/2 bg-accent/20 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl neon-glow">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <Dumbbell className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-3xl font-display font-bold text-foreground">Iron Core</h1>
                        <p className="text-muted-foreground mt-2 text-sm">Welcome back to the gym</p>
                    </div>

                    <div className="flex bg-secondary/30 p-1 rounded-lg mb-8">
                        <button
                            onClick={() => setTab("customer")}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${tab === "customer" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Member Login
                        </button>
                        <button
                            onClick={() => setTab("admin")}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${tab === "admin" ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Admin Portal
                        </button>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {tab === "customer" && (
                            <div className="space-y-2">
                                <Label htmlFor="loginId">Login ID</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="loginId"
                                        type="text"
                                        placeholder="Enter your gym ID"
                                        value={loginId}
                                        onChange={(e) => setLoginId(e.target.value)}
                                        className="pl-10 bg-secondary/30 border-border"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                {tab === "admin" ? (
                                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                ) : (
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                )}
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder={tab === "admin" ? "Enter admin password (1234)" : "Enter your password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 bg-secondary/30 border-border"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className={`w-full ${tab === "admin" ? "bg-foreground text-background hover:bg-foreground/90" : ""}`}
                            disabled={isLoading}
                        >
                            {isLoading ? "Authenticating..." : tab === "admin" ? "Access Admin Portal" : "Login to Dashboard"}
                        </Button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
