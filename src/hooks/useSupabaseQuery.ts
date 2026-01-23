import { useState, useCallback } from "react";
import { toast } from "sonner";
import { PostgrestError } from "@supabase/supabase-js";

interface UseSupabaseQueryResult<T> {
    data: T | null;
    error: PostgrestError | Error | null;
    loading: boolean;
    execute: (...args: any[]) => Promise<T | null>;
}

/**
 * Hook centralizado para chamadas ao Supabase com tratamento de erro e loading.
 */
export function useSupabaseQuery<T>(
    queryFn: (...args: any[]) => Promise<{ data: T | null; error: PostgrestError | null }>,
    options: {
        successMessage?: string;
        errorMessage?: string;
        showToast?: boolean;
    } = { showToast: true }
): UseSupabaseQueryResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<PostgrestError | Error | null>(null);
    const [loading, setLoading] = useState(false);

    const execute = useCallback(
        async (...args: any[]) => {
            setLoading(true);
            setError(null);

            try {
                const { data, error } = await queryFn(...args);

                if (error) {
                    throw error;
                }

                setData(data);
                if (options.showToast && options.successMessage) {
                    toast.success(options.successMessage);
                }
                return data;
            } catch (err: any) {
                const finalError = err instanceof Error ? err : new Error(err.message || "Erro desconhecido");
                setError(finalError);

                console.error("Supabase Query Error:", {
                    message: finalError.message,
                    details: err.details,
                    hint: err.hint,
                    code: err.code
                });

                if (options.showToast) {
                    toast.error(options.errorMessage || finalError.message || "Erro ao processar requisição");
                }
                return null;
            } finally {
                setLoading(false);
            }
        },
        [queryFn, options]
    );

    return { data, error, loading, execute };
}
