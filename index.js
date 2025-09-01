const http = require('http');
const url = require('url');

// Base de datos en memoria
const users = {
  javier: { name: 'Javier', activities: [], streaks: {}, messages: [] },
  raquel: { name: 'Raquel', activities: [], streaks: {}, messages: [] },
  mario: { name: 'Mario', activities: [], streaks: {}, messages: [] },
  alba: { name: 'Alba', activities: [], streaks: {}, messages: [] }
};

const globalMessages = [];
const inventory = [
  {name: 'Jamon', qty: 0, min: 1, unit: 'paquetes'},
  {name: 'Salmon fresco', qty: 0, min: 1, unit: 'filetes'},
  {name: 'Doradas', qty: 0, min: 1, unit: 'unidades'},
  {name: 'Lubina', qty: 0, min: 1, unit: 'unidades'},
  {name: 'Merluza', qty: 0, min: 1, unit: 'lomos'},
  {name: 'Ajo', qty: 0, min: 1, unit: 'unidades'},
  {name: 'Cebollas', qty: 0, min: 1, unit: 'unidades'},
  {name: 'Pimientos', qty: 0, min: 1, unit: 'unidades'},
  {name: 'Sal', qty: 0, min: 1, unit: 'paquetes'},
  {name: 'Ajo en polvo', qty: 0, min: 1, unit: 'tarros'}
];

const recipes = [
  {name: 'Lubina sobre cama de verduras', desc: 'Vino blanco, tomillo, aceite, sal', time: 30, people: 4},
  {name: 'Pollo con pimientos', desc: 'Ajo, tomillo, comino, pimienta, vinagre', time: 30, people: 4},
  {name: 'Salmon en papillote', desc: 'Ajo en polvo, aceite y sal', time: 30, people: 4},
  {name: 'Merluza con pimientos', desc: 'Aceite, sal, eneldo y vino blanco', time: 30, people: 4},
  {name: 'Alitas de pollo', desc: '4 dientes de ajo, ajo en polvo, tomillo', time: 30, people: 4}
];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // API endpoints
  if (req.method === 'POST' && parsedUrl.pathname === '/api/inventory') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      const item = inventory.find(i => i.name === data.name);
      if (item) {
        item.qty = Math.max(0, item.qty + data.change);
      }
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({success: true}));
    });
    return;
  }
  
  if (req.method === 'POST' && parsedUrl.pathname === '/api/activity') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      data.users.forEach(username => {
        if (users[username]) {
          users[username].activities.push({
            title: data.title,
            time: data.time,
            duration: data.duration,
            date: new Date().toDateString(),
            completed: false
          });
        }
      });
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({success: true}));
    });
    return;
  }
  
  if (req.method === 'POST' && parsedUrl.pathname === '/api/message') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      const message = {
        text: data.text,
        user: data.user,
        time: new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'}),
        timestamp: Date.now()
      };
      globalMessages.push(message);
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({success: true}));
    });
    return;
  }
  
  if (parsedUrl.pathname === '/api/data') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({
      users: users,
      inventory: inventory,
      recipes: recipes,
      messages: globalMessages
    }));
    return;
  }
  
  // Rutas de usuarios
  const userRoutes = {
    '/javier/abc123xyz789def456': 'javier',
    '/raquel/uvw012rst345ghi678': 'raquel', 
    '/mario/jkl901mno234pqr567': 'mario',
    '/alba/stu890vwx123yzb456': 'alba'
  };
  
  const currentUser = userRoutes[parsedUrl.pathname];
  
  if (currentUser) {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(getUserPage(currentUser));
    return;
  }
  
  // Administrador
  if (parsedUrl.pathname === '/admin/cde789fgh012ijl345') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(getAdminPage());
    return;
  }
  
  // Página principal
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('<h1>Organizacion Familiar</h1><p>Accede con tu enlace personal</p>');
});

function getUserPage(username) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Organizacion Familiar - ${users[username].name}</title>
  <style>
    * { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    body { background: #f9fafb; }
    .container { display: flex; min-height: 100vh; }
    .sidebar { width: 256px; background: #f9fafb; border-right: 1px solid #e5e7eb; position: fixed; height: 100vh; }
    .header { height: 48px; padding: 0 16px; display: flex; align-items: center; }
    .icon { width: 28px; height: 28px; background: linear-gradient(135deg, #10b981, #3b82f6); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; }
    .nav { margin-top: 16px; padding: 0 12px; }
    .btn { width: 100%; display: flex; align-items: center; padding: 12px 16px; margin-bottom: 8px; border: none; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 500; }
    .btn.active { background: #10b981; color: white; }
    .btn:not(.active) { background: transparent; color: #374151; }
    .main { flex: 1; margin-left: 256px; }
    .top { height: 64px; padding: 0 32px; background: white; display: flex; align-items: center; }
    .content { padding: 32px; }
    .section { display: none; }
    .section.active { display: block; }
    .card { background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
    .activity-item { background: #f0f9ff; padding: 12px; margin: 8px 0; border-radius: 8px; border-left: 4px solid #0ea5e9; display: flex; justify-content: space-between; align-items: center; }
    .streak { background: #fef3c7; padding: 8px 16px; border-radius: 20px; font-weight: bold; color: #92400e; }
    input, button, select { padding: 8px 12px; margin: 4px; border: 1px solid #ddd; border-radius: 4px; }
    button { background: #10b981; color: white; border: none; cursor: pointer; }
    button:hover { background: #059669; }
    .user { position: absolute; bottom: 0; left: 0; right: 0; padding: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="sidebar">
      <div class="header">
        <div class="icon">🏠</div>
      </div>
      <div class="nav">
        <button class="btn active" onclick="showSection('actividades')">📅 Mis Actividades</button>
        <button class="btn" onclick="showSection('mensajes')">💬 Mensajes</button>
        <button class="btn" onclick="showSection('comidas')">🍽️ Comidas</button>
        <button class="btn" onclick="showSection('recetas')">👨‍🍳 Recetas</button>
      </div>
      <div class="user">
        <span style="font-size: 12px; font-weight: 500;">${users[username].name}</span>
        <span>👤</span>
      </div>
    </div>
    
    <div class="main">
      <div class="top">
        <h1>¡Hola, ${users[username].name}! 👋</h1>
      </div>
      
      <div class="content">
        <div id="actividades" class="section active">
          <h2 style="background: linear-gradient(to right, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px; font-weight: bold; margin-bottom: 24px;">Mis Actividades y Retos</h2>
          
          <div class="grid">
            <div class="card">
              <h3>Actividades de Hoy</h3>
              <div id="today-activities">Cargando...</div>
            </div>
            <div class="card">
              <h3>Mis Rachas</h3>
              <div id="streaks">
                <div class="streak">🔥 Gimnasio: 5 días</div>
                <div class="streak">📚 Lectura: 12 días</div>
                <div class="streak">🎵 Violín: 3 días</div>
              </div>
            </div>
          </div>
        </div>
        
        <div id="mensajes" class="section">
          <h2 style="background: linear-gradient(to right, #8b5cf6, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px; font-weight: bold; margin-bottom: 24px;">Mensajes</h2>
          <div class="card">
            <h3>Chat Familiar</h3>
            <div id="chat-messages" style="background:#f9fafb; padding:16px; border-radius:8px; margin:16px 0; height:200px; overflow-y:auto">
              <p style="color:#6b7280">Cargando mensajes...</p>
            </div>
            <div style="display:flex; gap:8px">
              <input type="text" id="message-input" placeholder="Escribe un mensaje..." style="flex:1">
              <button onclick="sendMessage()">Enviar</button>
            </div>
          </div>
        </div>
        
        <div id="comidas" class="section">
          <h2 style="background: linear-gradient(to right, #f59e0b, #d97706); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px; font-weight: bold; margin-bottom: 24px;">Comidas de Hoy</h2>
          <div class="grid">
            <div class="card">
              <h3>🌅 Desayuno</h3>
              <p>Tostadas keto con salmón</p>
            </div>
            <div class="card">
              <h3>🍽️ Comida</h3>
              <p>Lubina sobre cama de verduras</p>
            </div>
            <div class="card">
              <h3>🌙 Cena</h3>
              <p>Aguacate con salmón ahumado</p>
            </div>
          </div>
        </div>
        
        <div id="recetas" class="section">
          <h2 style="background: linear-gradient(to right, #dc2626, #ea580c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px; font-weight: bold; margin-bottom: 24px;">Recetas</h2>
          <div class="grid" id="recipes-list">Cargando...</div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const username = '${username}';
    
    function loadData() {
      fetch('/api/data')
        .then(r => r.json())
        .then(data => {
          // Cargar actividades
          const userActivities = data.users[username].activities || [];
          const today = new Date().toDateString();
          const todayActivities = userActivities.filter(a => a.date === today);
          
          document.getElementById('today-activities').innerHTML = todayActivities.length > 0 
            ? todayActivities.map(a => 
                '<div class="activity-item">' +
                '<div><strong>' + a.title + '</strong><br>' + a.time + ' (' + a.duration + ' min)</div>' +
                '<button onclick="completeActivity(\\''+a.title+'\\')">✓</button>' +
                '</div>'
              ).join('')
            : '<p style="color:#6b7280">No hay actividades para hoy</p>';
          
          // Cargar recetas
          document.getElementById('recipes-list').innerHTML = data.recipes.map(r => 
            '<div class="card">' +
            '<h3>' + r.name + '</h3>' +
            '<p style="color: #6b7280; margin-bottom: 16px;">' + r.desc + '</p>' +
            '<div style="display: flex; gap: 16px; font-size: 14px; color: #6b7280;">' +
            '<span>⏱️ ' + r.time + ' min</span>' +
            '<span>👥 ' + r.people + ' personas</span>' +
            '</div></div>'
          ).join('');
          
          // Cargar mensajes
          updateChat(data.messages);
        });
    }
    
    function updateChat(messages) {
      const chatDiv = document.getElementById('chat-messages');
      if (messages.length === 0) {
        chatDiv.innerHTML = '<p style="color:#6b7280">No hay mensajes aún</p>';
      } else {
        chatDiv.innerHTML = messages.map(msg => 
          '<div style="margin-bottom:12px; padding:8px; background:white; border-radius:8px">' +
          '<div style="font-weight:500; color:#374151">' + msg.user + ' <span style="font-size:12px; color:#6b7280; font-weight:normal">' + msg.time + '</span></div>' +
          '<div style="margin-top:4px">' + msg.text + '</div>' +
          '</div>'
        ).join('');
        chatDiv.scrollTop = chatDiv.scrollHeight;
      }
    }
    
    function sendMessage() {
      const input = document.getElementById('message-input');
      const message = input.value.trim();
      
      if (message) {
        fetch('/api/message', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({text: message, user: username})
        }).then(() => {
          input.value = '';
          loadData();
        });
      }
    }
    
    function completeActivity(title) {
      alert('¡Actividad "' + title + '" completada! 🎉');
    }
    
    function showSection(section) {
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
      document.getElementById(section).classList.add('active');
      event.target.classList.add('active');
      
      if (section === 'mensajes') {
        setTimeout(() => {
          const input = document.getElementById('message-input');
          if (input) {
            input.addEventListener('keypress', function(e) {
              if (e.key === 'Enter') {
                sendMessage();
              }
            });
          }
        }, 100);
      }
    }
    
    loadData();
    setInterval(loadData, 5000); // Actualizar cada 5 segundos
  </script>
</body>
</html>`;
}

function getAdminPage() {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Administrador - Organizacion Familiar</title>
  <style>
    * { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    body { background: #f9fafb; }
    .container { display: flex; min-height: 100vh; }
    .sidebar { width: 256px; background: #f9fafb; border-right: 1px solid #e5e7eb; position: fixed; height: 100vh; }
    .header { height: 48px; padding: 0 16px; display: flex; align-items: center; }
    .icon { width: 28px; height: 28px; background: linear-gradient(135deg, #10b981, #3b82f6); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; }
    .nav { margin-top: 16px; padding: 0 12px; }
    .btn { width: 100%; display: flex; align-items: center; padding: 12px 16px; margin-bottom: 8px; border: none; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 500; }
    .btn.active { background: #10b981; color: white; }
    .btn:not(.active) { background: transparent; color: #374151; }
    .main { flex: 1; margin-left: 256px; }
    .top { height: 64px; padding: 0 32px; background: white; display: flex; align-items: center; }
    .content { padding: 32px; }
    .section { display: none; }
    .section.active { display: block; }
    .card { background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
    input, button, select { padding: 8px 12px; margin: 4px; border: 1px solid #ddd; border-radius: 4px; }
    button { background: #10b981; color: white; border: none; cursor: pointer; }
    button:hover { background: #059669; }
    .user { position: absolute; bottom: 0; left: 0; right: 0; padding: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
    .form-group { margin: 15px 0; }
    .checkbox-group { display: flex; gap: 15px; flex-wrap: wrap; }
  </style>
</head>
<body>
  <div class="container">
    <div class="sidebar">
      <div class="header">
        <div class="icon">🏠</div>
      </div>
      <div class="nav">
        <button class="btn active" onclick="showSection('actividades')">📅 Gestionar Actividades</button>
        <button class="btn" onclick="showSection('usuarios')">👥 Ver Usuarios</button>
        <button class="btn" onclick="showSection('inventario')">📦 Inventario</button>
        <button class="btn" onclick="showSection('mensajes')">💬 Mensajes</button>
        <button class="btn" onclick="showSection('recetas')">👨‍🍳 Recetas</button>
      </div>
      <div class="user">
        <span style="font-size: 12px; font-weight: 500;">Administrador</span>
        <span>🔧</span>
      </div>
    </div>
    
    <div class="main">
      <div class="top">
        <h1>¡Hola, Administrador! 👋<br><small style="font-size: 14px; color: #6b7280; font-weight: normal;">Panel de Control</small></h1>
      </div>
      
      <div class="content">
        <div id="actividades" class="section active">
          <h2 style="background: linear-gradient(to right, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px; font-weight: bold; margin-bottom: 24px;">Gestión de Actividades</h2>
          
          <div class="card">
            <h3>Crear Nueva Actividad</h3>
            <div class="form-group">
              <label>Usuarios:</label><br>
              <div class="checkbox-group">
                <label><input type="checkbox" value="javier"> Javier</label>
                <label><input type="checkbox" value="raquel"> Raquel</label>
                <label><input type="checkbox" value="mario"> Mario</label>
                <label><input type="checkbox" value="alba"> Alba</label>
              </div>
            </div>
            <div class="form-group">
              <label>Actividad:</label><br>
              <input type="text" id="activity-title" placeholder="Ej: Gimnasio, Leer, Violín">
            </div>
            <div class="form-group">
              <label>Hora:</label><br>
              <input type="time" id="activity-time">
            </div>
            <div class="form-group">
              <label>Duración:</label><br>
              <select id="activity-duration">
                <option value="15">15 minutos</option>
                <option value="30" selected>30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">1 hora</option>
                <option value="90">1.5 horas</option>
                <option value="120">2 horas</option>
              </select>
            </div>
            <button onclick="saveActivity()">💾 Crear Actividad</button>
          </div>
        </div>
        
        <div id="usuarios" class="section">
          <h2 style="background: linear-gradient(to right, #8b5cf6, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px; font-weight: bold; margin-bottom: 24px;">Estado de Usuarios</h2>
          <div class="grid" id="users-grid">Cargando...</div>
        </div>
        
        <div id="inventario" class="section">
          <h2 style="background: linear-gradient(to right, #9333ea, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px; font-weight: bold; margin-bottom: 24px;">Inventario</h2>
          <div class="grid" id="inventory-list">Cargando...</div>
        </div>
        
        <div id="mensajes" class="section">
          <h2 style="background: linear-gradient(to right, #8b5cf6, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px; font-weight: bold; margin-bottom: 24px;">Mensajes</h2>
          <div class="card">
            <h3>Chat Familiar</h3>
            <div id="chat-messages" style="background:#f9fafb; padding:16px; border-radius:8px; margin:16px 0; height:200px; overflow-y:auto">
              <p style="color:#6b7280">Cargando mensajes...</p>
            </div>
            <div style="display:flex; gap:8px">
              <input type="text" id="message-input" placeholder="Escribe un mensaje..." style="flex:1">
              <button onclick="sendMessage()">Enviar</button>
            </div>
          </div>
        </div>
        
        <div id="recetas" class="section">
          <h2 style="background: linear-gradient(to right, #dc2626, #ea580c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px; font-weight: bold; margin-bottom: 24px;">Recetas</h2>
          <div class="grid" id="recipes-list">Cargando...</div>
        </div>
      </div>
    </div>
  </div>

  <script>
    function loadData() {
      fetch('/api/data')
        .then(r => r.json())
        .then(data => {
          // Cargar usuarios
          document.getElementById('users-grid').innerHTML = Object.keys(data.users).map(username => {
            const user = data.users[username];
            const todayActivities = user.activities.filter(a => a.date === new Date().toDateString());
            return '<div class="card">' +
              '<h3>👤 ' + user.name + '</h3>' +
              '<p><strong>Actividades hoy:</strong> ' + todayActivities.length + '</p>' +
              '<p><strong>Total actividades:</strong> ' + user.activities.length + '</p>' +
              '<div style="margin-top: 12px;">' +
              todayActivities.map(a => '<div style="background:#f0f9ff; padding:4px 8px; margin:2px 0; border-radius:4px; font-size:12px">' + a.title + ' - ' + a.time + '</div>').join('') +
              '</div>' +
              '</div>';
          }).join('');
          
          // Cargar inventario
          document.getElementById('inventory-list').innerHTML = data.inventory.map((item, index) => {
            const color = item.qty === 0 ? '#dc2626' : item.qty <= item.min ? '#ea580c' : '#059669';
            return '<div class="card">' +
              '<h3>' + item.name + '</h3>' +
              '<p style="font-size: 18px; font-weight: bold; color: ' + color + ';">' + item.qty + ' ' + item.unit + '</p>' +
              '<p style="font-size: 14px; color: #6b7280;">Mínimo: ' + item.min + ' ' + item.unit + '</p>' +
              '<div style="margin-top: 12px;">' +
              '<button onclick="changeInventory(' + index + ', -1)" style="background: #dc2626;">-</button>' +
              '<button onclick="changeInventory(' + index + ', 1)" style="background: #059669;">+</button>' +
              '</div></div>';
          }).join('');
          
          // Cargar recetas
          document.getElementById('recipes-list').innerHTML = data.recipes.map(r => 
            '<div class="card">' +
            '<h3>' + r.name + '</h3>' +
            '<p style="color: #6b7280; margin-bottom: 16px;">' + r.desc + '</p>' +
            '<div style="display: flex; gap: 16px; font-size: 14px; color: #6b7280;">' +
            '<span>⏱️ ' + r.time + ' min</span>' +
            '<span>👥 ' + r.people + ' personas</span>' +
            '</div></div>'
          ).join('');
          
          // Cargar mensajes
          updateChat(data.messages);
        });
    }
    
    function saveActivity() {
      const users = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
      const title = document.getElementById('activity-title').value.trim();
      const time = document.getElementById('activity-time').value;
      const duration = document.getElementById('activity-duration').value;
      
      if (users.length === 0 || !title || !time) {
        alert('❌ Completa todos los campos');
        return;
      }
      
      fetch('/api/activity', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({users, title, time, duration})
      }).then(() => {
        alert('✅ Actividad "' + title + '" creada para: ' + users.join(', '));
        document.getElementById('activity-title').value = '';
        document.getElementById('activity-time').value = '';
        document.getElementById('activity-duration').value = '30';
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        loadData();
      });
    }
    
    function changeInventory(index, change) {
      fetch('/api/inventory', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: inventory[index].name, change})
      }).then(() => loadData());
    }
    
    function sendMessage() {
      const input = document.getElementById('message-input');
      const message = input.value.trim();
      
      if (message) {
        fetch('/api/message', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({text: message, user: 'Administrador'})
        }).then(() => {
          input.value = '';
          loadData();
        });
      }
    }
    
    function updateChat(messages) {
      const chatDiv = document.getElementById('chat-messages');
      if (messages.length === 0) {
        chatDiv.innerHTML = '<p style="color:#6b7280">No hay mensajes aún</p>';
      } else {
        chatDiv.innerHTML = messages.map(msg => 
          '<div style="margin-bottom:12px; padding:8px; background:white; border-radius:8px">' +
          '<div style="font-weight:500; color:#374151">' + msg.user + ' <span style="font-size:12px; color:#6b7280; font-weight:normal">' + msg.time + '</span></div>' +
          '<div style="margin-top:4px">' + msg.text + '</div>' +
          '</div>'
        ).join('');
        chatDiv.scrollTop = chatDiv.scrollHeight;
      }
    }
    
    function showSection(section) {
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
      document.getElementById(section).classList.add('active');
      event.target.classList.add('active');
      
      if (section === 'mensajes') {
        setTimeout(() => {
          const input = document.getElementById('message-input');
          if (input) {
            input.addEventListener('keypress', function(e) {
              if (e.key === 'Enter') {
                sendMessage();
              }
            });
          }
        }, 100);
      }
    }
    
    let inventory = [];
    loadData();
    setInterval(loadData, 5000);
  </script>
</body>
</html>`;
}

server.listen(process.env.PORT || 3000);