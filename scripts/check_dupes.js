
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim().replace(/['"]/g, '');
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.from('reciters').select('id, name');
    if (error) { console.error(error); return; }

    const counts = {};
    data.forEach(r => {
        counts[r.name] = (counts[r.name] || 0) + 1;
    });

    console.log("--- DUPLICATE CHECK ---");
    Object.entries(counts).forEach(([name, count]) => {
        if (count > 1) {
            console.log(`DUPE|${count}|${Buffer.from(name).toString('base64')}`);
        } else {
            console.log(`OK|${Buffer.from(name).toString('base64')}`);
        }
    });
}
check();
