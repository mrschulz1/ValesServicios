// Configuración global de Supabase
const SUPABASE_URL = "https://okkydrwdexacxvfbtopb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ra3lkcndkZXhhY3h2ZmJ0b3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMjU0MzgsImV4cCI6MjA5OTcwMTQzOH0.ekbFeG6r176fbanPDUin0O_jwDcnmRRUVrJL3ohgXeE";

// Instancia global de Supabase
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  db: { schema: 'public' }
});

// Alias local para que funcionen client.auth sin errores
const client = window.supabaseClient;

// 1. Inyectar el Modal de Login en el DOM si no existe
function inyectarModalLogin() {
  if (document.getElementById('globalLoginModal')) return;

  const modalHTML = `
    <div id="globalLoginModal" class="hidden fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full border border-slate-200">
        <div class="text-center mb-6">
          <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl">🔑</div>
          <h2 class="text-lg font-bold text-slate-900">Alineaciones Bustamante</h2>
          <p class="text-xs text-slate-500 mt-1">Ingresa credenciales para acceder al sistema</p>
        </div>
        
        <form id="globalLoginForm" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase">Correo Electrónico</label>
            <input type="email" id="globalLoginEmail" required class="mt-1 w-full rounded-lg border-slate-300 p-2.5 border text-sm focus:ring-indigo-500" placeholder="usuario@taller.cl">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase">Contraseña</label>
            <input type="password" id="globalLoginPassword" required class="mt-1 w-full rounded-lg border-slate-300 p-2.5 border text-sm focus:ring-indigo-500" placeholder="••••••••">
          </div>
          <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm transition shadow-sm">
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Evento de submit del formulario de login
  document.getElementById('globalLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('globalLoginEmail').value;
    const password = document.getElementById('globalLoginPassword').value;

    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      alert('Error de acceso: ' + error.message);
    } else {
      document.getElementById('globalLoginModal').classList.add('hidden');
    }
  });
}

// 2. Control de sesión y escucha en tiempo real
async function gestionarSesion() {
  inyectarModalLogin();

  const modal = document.getElementById('globalLoginModal');
  const { data: { session } } = await client.auth.getSession();

  if (!session) {
    modal.classList.remove('hidden');
  }

  // Escuchar cambios de estado (login / logout)
  client.auth.onAuthStateChange((event, session) => {
    if (session) {
      modal.classList.add('hidden');
    } else {
      modal.classList.remove('hidden');
    }
  });
}

// 3. Función global de Cierre de Sesión
async function cerrarSesion() {
  await client.auth.signOut();
  window.location.reload();
}

// Ejecutar automáticamente al cargar cualquier HTML
document.addEventListener('DOMContentLoaded', gestionarSesion);