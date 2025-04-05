import { createClient } from "@supabase/supabase-js";

// ❗ MOVE THESE TO ENVIRONMENT VARIABLES LATER
const SUPABASE_URL="https://xaendmayyngdohqpvila.supabase.co";
const SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhZW5kbWF5eW5nZG9ocXB2aWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NzczODksImV4cCI6MjA1OTI1MzM4OX0.mKdf6oX2kvsHjRnbvzaLb9weemKqPvOt3MiYLcwbYqc"  

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
