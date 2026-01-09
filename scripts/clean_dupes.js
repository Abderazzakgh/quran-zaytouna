
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

async function clean() {
    const { data, error } = await supabase.from('reciters').select('id, name, created_at');
    if (error) { console.error(error); return; }

    const nameMap = {};
    const toDelete = [];

    // Sort by created_at to keep the oldest one
    data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    data.forEach(r => {
        if (nameMap[r.name]) {
            toDelete.push(r.id);
        } else {
            nameMap[r.name] = r.id;
        }
    });

    if (toDelete.length === 0) {
        console.log("No duplicates to delete.");
        return;
    }

    console.log(`Deleting ${toDelete.length} duplicates...`);
    for (const id of toDelete) {
        const { error: delError } = await supabase.from('reciters').delete().eq('id', id);
        if (delError) console.error(`Error deleting ${id}:`, delError);
        else console.log(`Deleted: ${id}`);
    }
    console.log("Cleanup complete.");
}
clean();
