const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  if (parsedUrl.pathname === '/admin/cde789fgh012ijl345') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(`<!DOCTYPE html>
<html>
<head>
  <title>Organización Familiar</title>
  <style>
    * { font-family: Verdana, Geneva, sans-serif; margin: 0; padding: 0; }
    body { background: #f9fafb; }
    .container { display: flex; min-height: 100vh; }
    .sidebar { width: 256px; background: #f9fafb; border-right: 1px solid #e5e7eb; position: fixed; height: 100vh; z-index: 10; }
    .header { height: 48px; padding: 0 16px; display: flex; align-items: center; }
    .icon { width: 28px; height: 28px; background: linear-gradient(135deg, #10b981, #3b82f6); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; }
    .nav { margin-top: 16px; padding: 0 12px; }
    .btn { width: 100%; display: flex; align-items: center; padding: 12px 16px; margin-bottom: 8px; border: none; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; }
    .btn.active { background: #10b981; color: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .btn:not(.active) { background: transparent; color: #374151; }
    .btn:hover:not(.active) { background: #f3f4f6; }
    .main { flex: 1; margin-left: 256px; }
    .top { height: 64px; padding: 0 32px; border-bottom: 1px solid #f3f4f6; background: white; display: flex; align-items: center; }
    .content { padding: 32px; }
    .title { font-size: 24px; font-weight: bold; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
    .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .user { position: absolute; bottom: 0; left: 0; right: 0; padding: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
    .section { display: none; }
    .section.active { display: block; }
    .form-group { margin: 15px 0; }
    .form-group label { display: block; font-weight: 500; margin-bottom: 5px; }
    .form-group input, .form-group select { width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; }
    .checkbox-group { display: flex; gap: 15px; flex-wrap: wrap; }
    .checkbox-group label { display: flex; align-items: center; gap: 5px; font-weight: normal; }
    .btn-primary { background: #10b981; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .btn-primary:hover { background: #059669; }
    .activity-item { background: #f0f9ff; padding: 12px; margin: 8px 0; border-radius: 8px; border-left: 4px solid #0ea5e9; }
    .user-column { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .user-column h3 { margin-bottom: 15px; color: #374151; }
  </style>
</head>
<body>
  <div class="container">
    <div class="sidebar">
      <div class="header">
        <div class="icon">🏠</div>
      </div>
      <div class="nav">
        <button class="btn active" onclick="showSection('actividades')">📅 Actividades</button>
        <button class="btn" onclick="showSection('comidas')">🍽️ Comidas</button>
        <button class="btn" onclick="showSection('mensajes')">💬 Mensajes</button>
        <button class="btn" onclick="showSection('compras')">🛒 Lista de la compra</button>
        <button class="btn" onclick="showSection('inventario')">📦 Inventario</button>
        <button class="btn" onclick="showSection('recetas')">👨🍳 Recetas</button>
      </div>
      <div class="user">
        <span style="font-size: 12px; font-weight: 500;">Administrador</span>
        <span>🔧</span>
      </div>
    </div>
    
    <div class="main">
      <div class="top">
        <h1 style="font-size: 28px; font-weight: bold;">¡Hola, Administrador! 👋<br><small style="font-size: 14px; color: #6b7280; font-weight: normal;">Sábado, 31 de agosto de 2025</small><br><small style="font-size: 12px; color: #9ca3af; font-weight: normal; font-style: italic;">"Tu mente es la semilla, tu vida es la cosecha. (Joe Dispenza)"</small></h1>
      </div>
      
      <div class="content">
        <div id="actividades" class="section active">
          <h2 class="title" style="background: linear-gradient(to right, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Gestión de Actividades</h2>
          
          <div style="margin-bottom: 24px;">
            <button class="btn-primary" onclick="toggleForm()">➕ Crear Nueva Actividad</button>
            <button class="btn" onclick="showCalendar()" style="margin-left: 10px; background: #6b7280; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer;">📅 Ver Calendario</button>
          </div>
          
          <div id="activity-form" class="card" style="display: none;">
            <h3 style="margin-bottom: 20px;">Nueva Actividad</h3>
            
            <div class="form-group">
              <label>Usuarios:</label>
              <div class="checkbox-group">
                <label><input type="checkbox" value="javier"> Javier</label>
                <label><input type="checkbox" value="raquel"> Raquel</label>
                <label><input type="checkbox" value="mario"> Mario</label>
                <label><input type="checkbox" value="alba"> Alba</label>
              </div>
            </div>
            
            <div class="form-group">
              <label>Actividad:</label>
              <input type="text" id="activity-title" placeholder="Ej: Gimnasio, Leer, Violín, Estudiar">
            </div>
            
            <div class="form-group">
              <label>Hora:</label>
              <input type="time" id="activity-time">
            </div>
            
            <div class="form-group">
              <label>Duración:</label>
              <select id="activity-duration">
                <option value="15">15 minutos</option>
                <option value="30" selected>30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">1 hora</option>
                <option value="90">1.5 horas</option>
                <option value="120">2 horas</option>
              </select>
            </div>
            
            <div style="display: flex; gap: 10px;">
              <button class="btn-primary" onclick="saveActivity()">💾 Guardar Actividad</button>
              <button class="btn" onclick="toggleForm()" style="background: #6b7280; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer;">Cancelar</button>
            </div>
          </div>
          
          <div id="calendar-view" class="grid" style="display: none;">
            <div class="user-column">
              <h3>👨 Javier</h3>
              <div id="javier-activities">Sin actividades programadas</div>
            </div>
            <div class="user-column">
              <h3>👩 Raquel</h3>
              <div id="raquel-activities">Sin actividades programadas</div>
            </div>
            <div class="user-column">
              <h3>👦 Mario</h3>
              <div id="mario-activities">Sin actividades programadas</div>
            </div>
            <div class="user-column">
              <h3>👧 Alba</h3>
              <div id="alba-activities">Sin actividades programadas</div>
            </div>
          </div>
        </div>
        
        <div id="comidas" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #f59e0b, #d97706); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Calendario de Comidas</h2>
          <div class="card">
            <p>Próximamente - Planificación semanal de comidas</p>
          </div>
        </div>
        
        <div id="mensajes" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #8b5cf6, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Mensajes</h2>
          <div class="card">
            <p>Próximamente - Sistema de mensajes familiares</p>
          </div>
        </div>
        
        <div id="compras" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Lista de Compra</h2>
          <div class="card">
            <p>Próximamente - Lista de compras inteligente</p>
          </div>
        </div>
        
        <div id="inventario" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #9333ea, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Inventario</h2>
          <div class="card">
            <p>Próximamente - Control de stock con botones +/-</p>
          </div>
        </div>
        
        <div id="recetas" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #dc2626, #ea580c); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Recetas</h2>
          <div class="card">
            <p>Próximamente - Gestión de recetas familiares</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    function showSection(section) {
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
      document.getElementById(section).classList.add('active');
      event.target.classList.add('active');
      
      // Hide forms when switching sections
      document.getElementById('activity-form').style.display = 'none';
      document.getElementById('calendar-view').style.display = 'none';
    }
    
    function toggleForm() {
      const form = document.getElementById('activity-form');
      const calendar = document.getElementById('calendar-view');
      form.style.display = form.style.display === 'none' ? 'block' : 'none';
      calendar.style.display = 'none';
    }
    
    function showCalendar() {
      const form = document.getElementById('activity-form');
      const calendar = document.getElementById('calendar-view');
      form.style.display = 'none';
      calendar.style.display = calendar.style.display === 'none' ? 'grid' : 'none';
    }
    
    function saveActivity() {
      const users = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
      const title = document.getElementById('activity-title').value.trim();
      const time = document.getElementById('activity-time').value;
      const duration = document.getElementById('activity-duration').value;
      
      if (users.length === 0) {
        alert('❌ Selecciona al menos un usuario');
        return;
      }
      
      if (!title) {
        alert('❌ Escribe el nombre de la actividad');
        return;
      }
      
      if (!time) {
        alert('❌ Selecciona una hora');
        return;
      }
      
      // Guardar actividad
      users.forEach(user => {
        const container = document.getElementById(user + '-activities');
        if (container.textContent.includes('Sin actividades')) {
          container.innerHTML = '';
        }
        
        const activityHTML = \`
          <div class="activity-item">
            <strong>\${title}</strong><br>
            🕐 \${time} (\${duration} min)
          </div>
        \`;
        container.innerHTML += activityHTML;
      });
      
      // Limpiar formulario
      document.getElementById('activity-title').value = '';
      document.getElementById('activity-time').value = '';
      document.getElementById('activity-duration').value = '30';
      document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
      
      // Mostrar confirmación y calendario
      alert(\`✅ Actividad "\${title}" creada para: \${users.join(', ')}\`);
      toggleForm();
      showCalendar();
    }
  </script>
</body>
</html>`);
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('<h1>Organización Familiar</h1><p>Accede con tu enlace personal</p>');
  }
});

server.listen(process.env.PORT || 3000);