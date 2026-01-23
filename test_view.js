
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wdybtosjzpexycvgreph.supabase.co';
const supabaseKey = 'sb_publishable_KN1FtDdblts8B2ARCbJoHQ_wEx9QDuw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testViews() {
    console.log('Testing team_members_with_email...');
    const { data, error } = await supabase
        .from('team_members_with_email')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error (view):', error.message);
    } else {
        console.log('Success (view)! Columns:', Object.keys(data[0] || {}));
    }
}

testViews();
