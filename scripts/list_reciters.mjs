
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = "https://hdbszjfwlrpedetyhjsb.supabase.co";
const supabaseKey = "sb_publishable_b2ApvO--uwqYqV4K9CITvA_QSioqisf";

const supabase = createClient(supabaseUrl, supabaseKey);

async function listReciters() {
    const { data, error } = await supabase
        .from('reciters')
        .select('id, name')
        .order('name');

    if (error) {
        fs.writeFileSync('reciters_list.json', JSON.stringify(error, null, 2));
        return;
    }

    fs.writeFileSync('reciters_list.json', JSON.stringify(data, null, 2));
}

listReciters();
