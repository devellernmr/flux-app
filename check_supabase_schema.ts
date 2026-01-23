
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking projects table columns...');
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching project:', error);
        if (error.message.includes('column')) {
            console.log('Detected missing column or wrong name.');
        }
    } else {
        console.log('Successfully fetched project. Columns found:', Object.keys(data[0] || {}));
    }
}

checkSchema();
