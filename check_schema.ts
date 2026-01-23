import { supabase } from "./src/lib/supabase";

async function checkSchema() {
    const { data, error } = await supabase.from('projects').select('*').limit(1);
    if (error) {
        console.error("Error fetching projects:", error);
    } else {
        console.log("Project columns:", Object.keys(data[0] || {}));
    }

    const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(1);
    if (pError) {
        console.log("No profiles table or error:", pError.message);
    } else {
        console.log("Profile columns:", Object.keys(profiles[0] || {}));
    }
}

checkSchema();
