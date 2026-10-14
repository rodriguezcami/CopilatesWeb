/* Conexión a Supabase. Este es el ÚNICO archivo donde se pegan los datos del proyecto. */
/* ================= CONFIGURACIÓN =================
   Pegá acá los datos de tu Supabase NUEVO
   (Project Settings > API). Usá la clave "anon" / "publishable".
   NUNCA pegues la clave "service_role". */
const CONFIG={
 SUPABASE_URL:'https://TU-PROYECTO.supabase.co',
 SUPABASE_ANON_KEY:'TU-CLAVE-ANON'
};
const db=(window.supabase&&!CONFIG.SUPABASE_URL.includes('TU-PROYECTO'))
 ?window.supabase.createClient(CONFIG.SUPABASE_URL,CONFIG.SUPABASE_ANON_KEY):null;
