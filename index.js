const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/admin/cde789fgh012ijl345') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(`<!DOCTYPE html>
<html>
<head>
  <title>Administrador</title>
  <style>
    * { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    body { background: #f9fafb; }
    .container { display: flex; min-height: 100vh; }
    .sidebar { width: 256px; background: #f9fafb; border-right: 1px solid #e5e7eb; position: fixed; height: 100vh; }
    .header { height: 48px; padding: 0 16px; display: flex; align-items: center; }
    .icon { width: 28px; height: 28px; background: linear-gradient(135deg, #10b981, #3b82f6); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; }
    .user { position: absolute; bottom: 0; left: 0; right: 0; padding: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
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
    input, button { padding: 8px 12px; margin: 4px; border: 1px solid #ddd; border-radius: 4px; }
    button { background: #10b981; color: white; border: none; cursor: pointer; }
    button:hover { background: #059669; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
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
        <button class="btn" onclick="showSection('compras')">🛍️ Lista de la compra</button>
        <button class="btn" onclick="showSection('inventario')">📦 Inventario</button>
        <button class="btn" onclick="showSection('recetas')">👨‍🍳 Recetas</button>
      </div>
      <div class="user">
        <span style="font-size: 12px; font-weight: 500;">Administrador</span>
        <span>🔧</span>
      </div>
    </div>
    
    <div class="main">
      <div class="top">
        <h1 style="font-size: 28px; font-weight: bold;">¡Hola, Administrador! 👋<br><small style="font-size: 14px; color: #6b7280; font-weight: normal;">Domingo, 1 de septiembre de 2025</small><br><small style="font-size: 12px; color: #9ca3af; font-weight: normal; font-style: italic;">"Tu mente es la semilla, tu vida es la cosecha. (Joe Dispenza)"</small></h1>
      </div>
      
      <div class="content">
        <div id="actividades" class="section active">
          <h2 style="background: linear-gradient(to right, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px; font-weight: bold; margin-bottom: 24px;">Gestion de Actividades</h2>
          <div class="card">
            <button onclick="showForm()">Crear Actividad</button>
            <button onclick="showCalendar()">Ver Calendario</button>
          </div>
          
          <div id="activity-form" class="card" style="display:none">
            <h3>Nueva Actividad</h3>
            <div>
              <label>Usuarios:</label><br>
              <input type="checkbox" value="javier"> Javier
              <input type="checkbox" value="raquel"> Raquel
              <input type="checkbox" value="mario"> Mario
              <input type="checkbox" value="alba"> Alba
            </div><br>
            <div>
              <label>Actividad:</label><br>
              <input type="text" id="activity-title" placeholder="Ej: Gimnasio, Leer, Violin">
            </div><br>
            <div>
              <label>Hora:</label><br>
              <input type="time" id="activity-time">
            </div><br>
            <div>
              <label>Duracion:</label><br>
              <select id="activity-duration">
                <option value="15">15 minutos</option>
                <option value="30" selected>30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">1 hora</option>
                <option value="90">1.5 horas</option>
                <option value="120">2 horas</option>
              </select>
            </div><br>
            <button onclick="saveActivity()">Guardar</button>
            <button onclick="hideForm()">Cancelar</button>
          </div>
          
          <div id="calendar-view" class="grid" style="display:none">
            <div class="card">
              <h3>Javier</h3>
              <div id="javier-activities">Sin actividades</div>
            </div>
            <div class="card">
              <h3>Raquel</h3>
              <div id="raquel-activities">Sin actividades</div>
            </div>
            <div class="card">
              <h3>Mario</h3>
              <div id="mario-activities">Sin actividades</div>
            </div>
            <div class="card">
              <h3>Alba</h3>
              <div id="alba-activities">Sin actividades</div>
            </div>
          </div>
        </div>
        
        <div id="recetas" class="section">
          <h2 style="background: linear-gradient(to right, #dc2626, #ea580c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px; font-weight: bold; margin-bottom: 24px;">Recetas</h2>
          <div class="grid" id="recipes-list"></div>
        </div>
        
        <div id="inventario" class="section">
          <h2 style="background: linear-gradient(to right, #9333ea, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px; font-weight: bold; margin-bottom: 24px;">Inventario</h2>
          <div class="grid" id="inventory-list"></div>
        </div>
        
        <div id="comidas" class="section">
          <h2 style="background: linear-gradient(to right, #f59e0b, #d97706); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px; font-weight: bold; margin-bottom: 24px;">Calendario de Comidas</h2>
          <div class="grid">
            <div class="card">
              <h3>Desayunos</h3>
              <p>• Crema de almendras con frutos rojos<br>• Tostadas keto con salmon<br>• Huevos con jamon y aguacate</p>
            </div>
            <div class="card">
              <h3>Comidas</h3>
              <p>• Lubina sobre verduras<br>• Pollo con pimientos<br>• Salmon en papillote</p>
            </div>
            <div class="card">
              <h3>Cenas</h3>
              <p>• Aguacate con salmon ahumado<br>• Crema de calabacin<br>• Espinacas con gambas</p>
            </div>
          </div>
        </div>
        
        <div id="mensajes" class="section">
          <h2 style="background: linear-gradient(to right, #8b5cf6, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px; font-weight: bold; margin-bottom: 24px;">Mensajes</h2>
          <div class="card">
            <h3>Chat Familiar</h3>
            <div id="chat-messages" style="background:#f9fafb; padding:16px; border-radius:8px; margin:16px 0; height:200px; overflow-y:auto">
              <p style="color:#6b7280">No hay mensajes aun</p>
            </div>
            <div style="display:flex; gap:8px">
              <input type="text" id="message-input" placeholder="Escribe un mensaje..." style="flex:1">
              <button onclick="sendMessage()">Enviar</button>
            </div>
          </div>
        </div>
        
        <div id="compras" class="section">
          <h2 style="background: linear-gradient(to right, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px; font-weight: bold; margin-bottom: 24px;">Lista de Compra</h2>
          <div class="card">
            <h3>Productos con stock bajo:</h3>
            <div id="shopping-list">Cargando...</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const recipes = [
      {name: 'Lubina sobre cama de verduras', desc: 'Vino blanco, tomillo, aceite, sal y agua', time: 30, people: 4},
      {name: 'Pollo con pimientos', desc: 'Ajo, tomillo, comino, pimienta, vinagre de Jerez', time: 30, people: 4},
      {name: 'Marmitako de salmon', desc: 'Lleva 4 dientes de ajo', time: 30, people: 4},
      {name: 'Crema de almendras con frutos rojos', desc: 'Crema de almendras, macadamias y chocolate', time: 30, people: 4},
      {name: 'Aguacate con salmon ahumado', desc: 'Aceitunas, cebolla, salsa tamari, aceite', time: 30, people: 4},
      {name: 'Dorada sobre verduras', desc: 'Vino blanco, tomillo, aceite, sal y agua', time: 30, people: 4},
      {name: 'Alitas de pollo', desc: '4 dientes de ajo, ajo en polvo, tomillo, aceite y sal', time: 30, people: 4},
      {name: 'Pechugas rellenas de jamon', desc: 'Ajo en polvo, aceite y sal', time: 30, people: 4},
      {name: 'Salmon en papillote', desc: 'Ajo en polvo, aceite y sal', time: 30, people: 4},
      {name: 'Merluza con pimientos', desc: 'Aceite, sal, eneldo y vino blanco', time: 30, people: 4},
      {name: 'Costillas de cordero', desc: 'Lleva 4 dientes de ajo', time: 30, people: 4},
      {name: 'Paletillas de cordero', desc: '4 dientes de ajo, romero, aceite y sal', time: 30, people: 4}
    ];
    
    const inventory = [
      {name: 'Infusion tomillo', qty: 0, unit: 'paquetes'},
      {name: 'Infusion roiboos', qty: 0, unit: 'paquetes'},
      {name: 'Jamon', qty: 0, unit: 'paquetes'},
      {name: 'Salmon fresco', qty: 0, unit: 'filetes'},
      {name: 'Doradas', qty: 0, unit: 'unidades'},
      {name: 'Lubina', qty: 0, unit: 'unidades'},
      {name: 'Merluza', qty: 0, unit: 'lomos'},
      {name: 'Pulpo', qty: 0, unit: 'unidades'},
      {name: 'Ajo', qty: 0, unit: 'unidades'},
      {name: 'Cebollas', qty: 0, unit: 'unidades'},
      {name: 'Coliflor', qty: 0, unit: 'unidades'},
      {name: 'Brocoli', qty: 0, unit: 'unidades'},
      {name: 'Pimientos', qty: 0, unit: 'unidades'},
      {name: 'Alcachofas lata', qty: 0, unit: 'latas'},
      {name: 'Sal', qty: 0, unit: 'paquetes'},
      {name: 'Ajo en polvo', qty: 0, unit: 'tarros'},
      {name: 'Champinones', qty: 0, unit: 'bandejas'}
    ];
    
    function loadData() {
      document.getElementById('recipes-list').innerHTML = recipes.map(r => 
        '<div class="card"><h3 style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">' + r.name + '</h3>' +
        '<p style="color: #6b7280; margin-bottom: 16px;">' + r.desc + '</p>' +
        '<div style="display: flex; gap: 16px; font-size: 14px; color: #6b7280;">' +
        '<span>⏱️ ' + r.time + ' min</span>' +
        '<span>👥 ' + r.people + ' personas</span>' +
        '</div></div>'
      ).join('');
      
      document.getElementById('inventory-list').innerHTML = inventory.map((item, index) => 
        '<div class="card"><h3>' + item.name + '</h3><p>' + item.qty + ' ' + item.unit + '</p>' +
        '<button onclick="changeQty(' + index + ', 1)">+</button> ' +
        '<button onclick="changeQty(' + index + ', -1)">-</button></div>'
      ).join('');
    }
    
    function changeQty(index, change) {
      if (inventory[index]) {
        inventory[index].qty = Math.max(0, inventory[index].qty + change);
        loadData();
        updateShoppingList();
      }
    }
    
    function updateShoppingList() {
      const lowStock = inventory.filter(item => item.qty === 0);
      const shoppingList = document.getElementById('shopping-list');
      
      if (lowStock.length === 0) {
        shoppingList.innerHTML = '<p style="color:#059669">Todo el inventario esta bien abastecido</p>';
      } else {
        shoppingList.innerHTML = lowStock.map(item => 
          '<div style="padding:8px; margin:4px 0; background:#fef2f2; border-left:4px solid #dc2626; border-radius:4px">' +
          '<strong>' + item.name + '</strong> - Necesitas ' + item.unit +
          '</div>'
        ).join('');
      }
    }
    
    function showForm() {
      document.getElementById('activity-form').style.display = 'block';
      document.getElementById('calendar-view').style.display = 'none';
    }
    
    function hideForm() {
      document.getElementById('activity-form').style.display = 'none';
    }
    
    function showCalendar() {
      document.getElementById('activity-form').style.display = 'none';
      document.getElementById('calendar-view').style.display = 'grid';
    }
    
    function saveActivity() {
      const users = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
      const title = document.getElementById('activity-title').value;
      const time = document.getElementById('activity-time').value;
      const duration = document.getElementById('activity-duration').value;
      
      if (users.length === 0 || !title || !time) {
        alert('Completa todos los campos');
        return;
      }
      
      users.forEach(user => {
        const div = document.getElementById(user + '-activities');
        if (div.textContent === 'Sin actividades') div.innerHTML = '';
        div.innerHTML += '<div style="margin:5px 0; padding:8px; background:#f0f9ff; border-radius:4px"><strong>' + title + '</strong><br>' + time + ' (' + duration + ' min)</div>';
      });
      
      document.getElementById('activity-title').value = '';
      document.getElementById('activity-time').value = '';
      document.getElementById('activity-duration').value = '30';
      document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
      
      alert('Actividad creada para: ' + users.join(', '));
      hideForm();
      showCalendar();
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
        chatDiv.innerHTML = '<p style="color:#6b7280">No hay mensajes aun</p>';
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
    
    loadData();
    
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
  </script>
</body>
</html>`);
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('<h1>Organizacion Familiar</h1>');
  }
});

server.listen(process.env.PORT || 3000);