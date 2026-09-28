import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://tzzrxmzfsjafrgfhbyqa.supabase.co";

const SUPABASE_KEY = "sb_publishable_lFC7C2sqGOab9Q297MuQvg_YTsMZCVw";

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

window.supabaseClient = supabaseClient;
