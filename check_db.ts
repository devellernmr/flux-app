import { supabase } from "./src/lib/supabase";

async function checkSchema() {
  try {
    const { data: members, error: membersError } = await supabase
      .from('team_members_with_email')
      .select('*')
      .limit(1);
    
    if (membersError) {
      console.log('Error fetching from team_members_with_email:', membersError.message);
    } else if (members && members.length > 0) {
      console.log('Columns in team_members_with_email:', Object.keys(members[0]));
      console.log('Sample data:', members[0]);
    } else {
      console.log('No data in team_members_with_email');
    }
  } catch (err: any) {
    console.log('Unexpected error:', err.message);
  }
}

checkSchema();
