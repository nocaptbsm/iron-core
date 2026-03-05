import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useGym } from "@/context/GymContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Building2, Search, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface GymInfo {
    user_id: string;
    email: string;
}

const SuperAdminDashboard = () => {
    const [gyms, setGyms] = useState<GymInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const { setSelectedGymId } = useGym();

    useEffect(() => {
        const fetchGyms = async () => {
            try {
                const { data, error } = await supabase.rpc('get_all_gyms');
                if (error) {
                    console.error("Error fetching gyms:", error);
                } else {
                    setGyms(data || []);
                }
            } catch (err) {
                console.error("Failed to fetch gyms:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchGyms();
    }, []);

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-4xl mx-auto w-full">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-primary" />
                        Super Admin Gateway
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Select a registered gym email to access their dashboard directly.
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
                        {gyms.map((gym, i) => (
                            <motion.div
                                key={gym.user_id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="p-4 hover:bg-secondary/50 transition-colors cursor-pointer group flex items-center justify-between"
                                onClick={() => setSelectedGymId(gym.user_id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <span className="font-bold text-primary text-lg">
                                            {gym.email.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-foreground text-lg">
                                            {gym.email}
                                        </h3>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
                                    <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline-block">
                                        Access Dashboard
                                    </span>
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </motion.div>
                        ))}

                        {gyms.length === 0 && !loading && (
                            <div className="py-12 text-center text-muted-foreground">
                                No registered gyms found in the system.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default SuperAdminDashboard;
