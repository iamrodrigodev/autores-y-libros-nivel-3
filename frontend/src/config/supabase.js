import { createClient } from '@supabase/supabase-js';

// Forzar el recargado de las variables de entorno
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://xmdqkasisrixstmnktpz.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtZHFrYXNpc3JpeHN0bW5rdHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODU4NDcsImV4cCI6MjA2MzY2MTg0N30.dJEoYP1WpTBahDGoEDH_PoZ7ElOx_ALz-bRd0JDfI_8';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan las variables de entorno de Supabase');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseAnonKey ? '***' : 'No definida');
}

console.log('Inicializando Supabase con URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
