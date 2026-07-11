import { createClient } from '@supabase/supabase-js';

// Substitua Pelas suas chaves reais do painel do Supabase
const supabaseUrl = 'https://bvnsqatmqhqrjmxmjrrj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bnNxYXRtcWhxcmpteG1qcnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2OTM2ODMsImV4cCI6MjA5NzI2OTY4M30.kaqT0GCl0zpGugQP6rxJ0x7Zfx_SMCYjdBaONs6xjbc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);