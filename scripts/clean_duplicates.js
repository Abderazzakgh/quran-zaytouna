
import { createClient } from '@supabase/supabase-client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY; // I might need service role for delete if RLS is on, but let's try with this or just check what we have.

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or Key missing in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanDuplicates() {
    console.log("Fetching reciters...");
    const { data: reciters, error } = await supabase
        .from('reciters')
        .select('id, name');

    if (error) {
        console.error("Error fetching reciters:", error);
        return;
    }

    const nameMap = new Map();
    const duplicates = [];

    reciters.forEach(reciter => {
        if (nameMap.has(reciter.name)) {
            duplicates.push(reciter);
        } else {
            nameMap.set(reciter.name, reciter.id);
        }
    });

    if (duplicates.length === 0) {
        console.log("No duplicates found.");
        return;
    }

    console.log(`Found ${duplicates.length} duplicates. Cleaning up...`);

    for (const dup of duplicates) {
        console.log(`Deleting duplicate: ${dup.name} (${dup.id})`);
        const { error: delError } = await supabase
            .from('reciters')
            .delete()
            .eq('id', dup.id);

        if (delError) {
            console.error(`Failed to delete ${dup.name}:`, delError);
        } else {
            console.log(`Successfully deleted ${dup.name}`);
        }
    }
}

cleanDuplicates();
