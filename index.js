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
        <h1 style="font-size: 28px; font-weight: bold; color: red;">🔥 NUEVA VERSION FUNCIONANDO 🔥<br><small style="font-size: 14px; color: #6b7280; font-weight: normal;">Sábado, 31 de agosto de 2025</small><br><small style="font-size: 12px; color: #9ca3af; font-weight: normal; font-style: italic;">"Tu mente es la semilla, tu vida es la cosecha. (Joe Dispenza)"</small></h1>
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
          <div class="grid">
            <div class="card">
              <h3 style="margin-bottom: 16px;">🌅 Desayunos</h3>
              <div style="color: #6b7280;">• Crema de almendras con frutos rojos<br>• Tostadas pan keto con salmón<br>• Huevos a la plancha con jamón</div>
            </div>
            <div class="card">
              <h3 style="margin-bottom: 16px;">🍽️ Comidas</h3>
              <div style="color: #6b7280;">• Lubina sobre cama de verduras<br>• Pollo con pimientos<br>• Salmón en papillote</div>
            </div>
            <div class="card">
              <h3 style="margin-bottom: 16px;">🌙 Cenas</h3>
              <div style="color: #6b7280;">• Aguacate con salmón ahumado<br>• Crema de calabacín<br>• Espinacas con gambas</div>
            </div>
          </div>
        </div>
        
        <div id="mensajes" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #8b5cf6, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Mensajes</h2>
          <div class="card">
            <h3 style="margin-bottom: 16px;">Chat Familiar</h3>
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 16px; height: 200px; overflow-y: auto;" id="chat-messages">
              <p style="color: #6b7280;">No hay mensajes aún</p>
            </div>
            <div style="display: flex; gap: 8px;">
              <input type="text" id="message-input" placeholder="Escribe un mensaje..." style="flex: 1; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
              <button onclick="sendMessage()" class="btn-primary">Enviar</button>
            </div>
          </div>
        </div>
        
        <div id="compras" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Lista de Compra</h2>
          <div class="card">
            <h3 style="margin-bottom: 16px;">Productos con stock bajo:</h3>
            <div id="shopping-list">Cargando...</div>
          </div>
        </div>
        
        <div id="inventario" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #9333ea, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Inventario</h2>
          <div id="inventory-grid" class="grid"></div>
        </div>
        
        <div id="recetas" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #dc2626, #ea580c); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Recetas</h2>
          <div id="recipes-grid" class="grid"></div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Datos
    const recipes = [
      { name: 'Lubina sobre cama de verduras', instructions: 'Lleva vino blanco, tomillo, aceite, sal y un poco de agua', preparationTime: 30, servings: 4 },
      { name: 'Muslo y contra muslo de pollo con pimientos', instructions: 'Lleva 1 diente de ajo, tomillo, comino, pimienta, vinagre de Jerez, aceite y sal.', preparationTime: 30, servings: 4 },
      { name: 'Marmitako de salmón', instructions: 'Lleva 4 dientes de ajo', preparationTime: 30, servings: 4 },
      { name: 'Crema de almendras con frutos rojos', instructions: 'Lleva crema de almendras, macadamias y chocolate.', preparationTime: 30, servings: 4 },
      { name: 'Aguacate con salmón ahumado', instructions: 'Lleva aceitunas, un poco de cebolla, salsa tamari, aceite.', preparationTime: 30, servings: 4 },
      { name: 'Dorada sobre cama de verduras', instructions: 'Lleva vino blanco, tomillo, aceite, sal y un poco de agua', preparationTime: 30, servings: 4 },
      { name: 'Alitas de pollo', instructions: 'Lleva 4 dientes de ajo, ajo en polvo, tomillo, aceite y sal', preparationTime: 30, servings: 4 },
      { name: 'Pechugas de pollo rellenas de jamón', instructions: 'Lleva ajo en polvo, aceite y sal.', preparationTime: 30, servings: 4 },
      { name: 'Salmón en papillote', instructions: 'Lleva ajo en polvo, aceite y sal.', preparationTime: 30, servings: 4 },
      { name: 'Merluza con pimientos', instructions: 'Lleva aceite, sal, eneldo y vino blanco', preparationTime: 30, servings: 4 }
    ];
    
    const inventory = [
      { name: 'Jamón', currentQuantity: '0', minimumQuantity: '1', unit: 'paquetes' },
      { name: 'Salmón fresco (filetes)', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades' },
      { name: 'Doradas', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades' },
      { name: 'Lubina', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades' },
      { name: 'Merluza (lomos)', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades' },
      { name: 'Ajo', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades' },
      { name: 'Cebollas', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades' },
      { name: 'Coliflor', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades' },
      { name: 'Brócoli', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades' },
      { name: 'Pimientos', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades' },
      { name: 'Sal', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades' },
      { name: 'Ajo en polvo', currentQuantity: '0', minimumQuantity: '1', unit: 'tarros' }
    ];
    
    // Cargar datos al inicio
    loadData();
    
    function loadData() {
      // Cargar recetas
      document.getElementById('recipes-grid').innerHTML = recipes.map(recipe => `
        <div class="card">
          <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">${recipe.name}</h3>
          <p style="color: #6b7280; margin-bottom: 16px;">${recipe.instructions}</p>
          <div style="display: flex; gap: 16px; font-size: 14px; color: #6b7280;">
            <span>⏱️ ${recipe.preparationTime} min</span>
            <span>👥 ${recipe.servings} personas</span>
          </div>
        </div>
      `).join('');
      
      // Cargar inventario
      document.getElementById('inventory-grid').innerHTML = inventory.map(item => {
        const isLow = parseFloat(item.currentQuantity) <= parseFloat(item.minimumQuantity);
        const color = parseFloat(item.currentQuantity) === 0 ? '#dc2626' : isLow ? '#ea580c' : '#059669';
        return `
          <div class="card">
            <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">${item.name}</h3>
            <p style="font-size: 18px; font-weight: bold; color: ${color}; margin-bottom: 8px;">${item.currentQuantity} ${item.unit}</p>
            <p style="font-size: 14px; color: #6b7280;">Mínimo: ${item.minimumQuantity} ${item.unit}</p>
            <div style="display: flex; gap: 8px; margin-top: 12px;">
              <button onclick="updateQuantity('${item.name}', -1)" style="background: #dc2626; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer;">-</button>
              <button onclick="updateQuantity('${item.name}', 1)" style="background: #059669; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer;">+</button>
            </div>
          </div>
        `;
      }).join('');
      
      updateShoppingList();
      updateChat();
    }
    
    function updateQuantity(itemName, change) {
      const item = inventory.find(i => i.name === itemName);
      if (item) {
        const newQuantity = Math.max(0, parseInt(item.currentQuantity) + change);
        item.currentQuantity = newQuantity.toString();
        loadData();
        updateShoppingList();
      }
    }
    
    function updateShoppingList() {
      const lowStock = inventory.filter(item => parseInt(item.currentQuantity) <= parseInt(item.minimumQuantity));
      const shoppingList = document.getElementById('shopping-list');
      
      if (lowStock.length === 0) {
        shoppingList.innerHTML = '<p style="color: #059669;">✅ Todo el inventario está bien abastecido</p>';
      } else {
        shoppingList.innerHTML = lowStock.map(item => 
          `<div style="padding: 8px; margin: 4px 0; background: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px;">
            <strong>${item.name}</strong> - Necesitas ${item.minimumQuantity} ${item.unit}
          </div>`
        ).join('');
      }
    }
    
    const messages = [];
    
    function sendMessage() {
      const input = document.getElementById('message-input');
      const message = input.value.trim();
      
      if (message) {
        const now = new Date();
        const time = now.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'});
        
        messages.push({
          text: message,
          time: time,
          user: 'Administrador'
        });
        
        input.value = '';
        updateChat();
      }
    }
    
    function updateChat() {
      const chatDiv = document.getElementById('chat-messages');
      
      if (messages.length === 0) {
        chatDiv.innerHTML = '<p style="color: #6b7280;">No hay mensajes aún</p>';
      } else {
        chatDiv.innerHTML = messages.map(msg => 
          `<div style="margin-bottom: 12px; padding: 8px; background: white; border-radius: 8px;">
            <div style="font-weight: 500; color: #374151;">${msg.user} <span style="font-size: 12px; color: #6b7280; font-weight: normal;">${msg.time}</span></div>
            <div style="margin-top: 4px;">${msg.text}</div>
          </div>`
        ).join('');
        
        chatDiv.scrollTop = chatDiv.scrollHeight;
      }
    }
    
    function showSection(section) {
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
      document.getElementById(section).classList.add('active');
      event.target.classList.add('active');
      
      // Hide forms when switching sections
      if (document.getElementById('activity-form')) {
        document.getElementById('activity-form').style.display = 'none';
        document.getElementById('calendar-view').style.display = 'none';
      }
      
      // Permitir Enter en el chat
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