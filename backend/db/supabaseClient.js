require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('Supabase credentials not configured.');
}

async function fetchData() {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase client not configured.' } };
  }

  const { data, error } = await supabase
    .from('teams')
    .select('*');

  if (error) {
    console.error('Error fetching data:', error);
    return { data: null, error };
  }

  console.log('Data:', data);
  return { data, error: null };
}
// fetchData();
module.exports = supabase;