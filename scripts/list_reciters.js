
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listReciters() {
    const { data, error } = await supabase
        .from('reciters')
        .select('id, name');

    if (error) {
        console.error("Error fetching reciters:", error);
        return;
    }

    console.log("Reciters in database:");
    console.log(JSON.stringify(data, null, 2));
}

listReciters();
