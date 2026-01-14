import { supabase } from './src/lib/supabase';

async function check() {
  const { data, error } = await supabase.from('files').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Sample Data:', data);
    console.log('Keys:', data.length > 0 ? Object.keys(data[0]) : 'No data');
  }
}

check();
