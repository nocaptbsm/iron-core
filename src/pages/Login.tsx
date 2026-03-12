import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const Login = () => {
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/`,
                }
            });
            if (error) throw error;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.message || "Failed to sign in with Google");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-transparent p-4 relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                <div className="mb-10 text-center space-y-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-24 h-24 rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl shadow-primary/20 overflow-hidden border border-white/10 bg-black/40 backdrop-blur-md"
                    >
                        <img src="/logo.png" alt="IronCore Logo" className="w-full h-full object-cover" />
                    </motion.div>

                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-5xl font-display font-black tracking-tight text-white mb-3"
                        >
                            Iron<span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">Core</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-muted-foreground text-lg font-medium"
                        >
                            Gym Management System
                        </motion.p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                className="glass-panel-login rounded-[2rem] p-8 relative overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                >
                    {/* Inner elegant glow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="text-center mb-8">
                        <h2 className="text-xl font-semibold text-white mb-2">Welcome Back</h2>
                        <p className="text-sm text-muted-foreground">Sign in to access your dashboard</p>
                    </div>

                    <Button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full h-14 text-base font-semibold border-white/10 hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-3 rounded-xl shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5"
                        disabled={loading}
                        variant="outline"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        {loading ? "Connecting..." : "Continue with Google"}
                    </Button>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center text-xs text-muted-foreground mt-8"
                >
                    Secure access restricted to authorized admins only.
                </motion.p>
            </motion.div>
        </div>
    );
};

export default Login;
