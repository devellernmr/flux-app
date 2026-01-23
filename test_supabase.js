
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wdybtosjzpexycvgreph.supabase.co';
const supabaseKey = 'sb_publishable_KN1FtDdblts8B2ARCbJoHQ_wEx9QDuw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
    console.log('Testing query on projects table...');
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Success! Columns:', Object.keys(data[0] || {}));
    }
}

testQuery();
