import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useAdmin() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAdminStatus() {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setIsAdmin(false);
                    setLoading(false);
                    return;
                }

                const { data: profile, error } = await supabase
                    .from("profiles")
                    .select("is_admin")
                    .eq("id", user.id)
                    .single();

                if (error) {
                    console.error("Error fetching admin status:", error);
                    setIsAdmin(false);
                } else {
                    setIsAdmin(!!profile?.is_admin);
                }
            } catch (err) {
                console.error("Error in useAdmin:", err);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        }

        checkAdminStatus();
    }, []);

    return { isAdmin, loading };
}
