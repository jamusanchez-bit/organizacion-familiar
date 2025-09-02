const http = require('http');
const url = require('url');

// Base de datos en memoria
const USERS = {
  javier: { id: 'javier', name: 'Javier', password: 'password123' },
  raquel: { id: 'raquel', name: 'Raquel', password: 'password456' },
  mario: { id: 'mario', name: 'Mario', password: 'password789' },
  alba: { id: 'alba', name: 'Alba', password: 'password000' },
  javi_administrador: { id: 'javi_administrador', name: 'Javi (Admin)', password: 'admin123' }
};

let activities = [];
let mealPlan = {};
let inventory = [
  { id: '1', name: 'Jamón', category: 'carne', shop: 'Carne internet', unit: 'paquetes', quantity: 2 },
  { id: '2', name: 'Salmón fresco', category: 'pescado', shop: 'Pescadería', unit: 'unidades', quantity: 1 },
  { id: '3', name: 'Ajo', category: 'verdura', shop: 'Del bancal a casa', unit: 'unidades', quantity: 5 },
  { id: '4', name: 'Aceite oliva', category: 'otros', shop: 'Alcampo', unit: 'litros', quantity: 1 },
  { id: '5', name: 'Pollo', category: 'carne', shop: 'Carne internet', unit: 'unidades', quantity: 3 },
  { id: '6', name: 'Tomate', category: 'verdura', shop: 'Del bancal a casa', unit: 'kg', quantity: 2 },
  { id: '7', name: 'Cebolla', category: 'verdura', shop: 'Del bancal a casa', unit: 'unidades', quantity: 4 },
  { id: '8', name: 'Arroz', category: 'otros', shop: 'Alcampo', unit: 'kg', quantity: 1 },
  { id: '9', name: 'Pasta', category: 'otros', shop: 'Alcampo', unit: 'paquetes', quantity: 3 },
  { id: '10', name: 'Leche', category: 'otros', shop: 'Alcampo', unit: 'litros', quantity: 2 }
];

let recipes = [
  { id: '1', name: 'Lubina sobre cama de verduras', category: 'comidas', ingredients: [{'Lubina': 1}, {'Ajo': 2}, {'Tomate': 1}], time: 0.5, servings: 4 },
  { id: '2', name: 'Salmón en papillote', category: 'comidas', ingredients: [{'Salmón fresco': 1}, {'Ajo': 1}], time: 0.75, servings: 4 },
  { id: '3', name: 'Pollo al ajillo', category: 'comidas', ingredients: [{'Pollo': 1}, {'Ajo': 3}], time: 0.5, servings: 4 },
  { id: '4', name: 'Pasta con tomate', category: 'cenas', ingredients: [{'Pasta': 1}, {'Tomate': 1}, {'Cebolla': 1}], time: 0.25, servings: 4 },
  { id: '5', name: 'Arroz con pollo', category: 'comidas', ingredients: [{'Arroz': 1}, {'Pollo': 1}, {'Cebolla': 1}], time: 1, servings: 6 }
];

let forumMessages = [];
let adminSuggestions = [];
let privateMessages = {};

const server = http.createServer((req, res) => {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const parsedUrl = url.parse(req.url, true);
  
  // Rutas de usuarios
  if (parsedUrl.pathname === '/javier/abc123xyz789def456') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(getUserPage('javier'));
    return;
  }
  if (parsedUrl.pathname === '/raquel/uvw012rst345ghi678') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(getUserPage('raquel'));
    return;
  }
  if (parsedUrl.pathname === '/mario/jkl901mno234pqr567') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(getUserPage('mario'));
    return;
  }
  if (parsedUrl.pathname === '/alba/stu890vwx123yzb456') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(getUserPage('alba'));
    return;
  }
  if (parsedUrl.pathname === '/admin/cde789fgh012ijl345') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(getAdminPage());
    return;
  }
  
  // APIs
  if (req.method === 'POST' && parsedUrl.pathname === '/api/activity') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      const activity = {
        id: Date.now(),
        user: data.user,
        title: data.title,
        time: data.time,
        duration: data.duration,
        repeat: data.repeat,
        repeatDays: data.repeatDays || [],
        date: data.date,
        completed: false
      };
      activities.push(activity);
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({success: true}));
    });
    return;
  }
  
  if (req.method === 'POST' && parsedUrl.pathname === '/api/complete-activity') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      const activity = activities.find(a => a.id === data.id);
      if (activity) {
        activity.completed = data.completed;
      }
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({success: true}));
    });
    return;
  }
  
  if (req.method === 'POST' && parsedUrl.pathname === '/api/inventory') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      if (data.action === 'update') {
        const item = inventory.find(i => i.id === data.id);
        if (item) {
          item.quantity = Math.max(0, item.quantity + data.change);
        }
      }
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
        id: Date.now(),
        user: data.user,
        text: data.text,
        time: new Date().toLocaleString('es-ES'),
        timestamp: Date.now()
      };
      
      if (data.type === 'forum') {
        forumMessages.push(message);
      } else if (data.type === 'admin') {
        adminSuggestions.push(message);
      } else if (data.type === 'private') {
        const key = [data.user, data.to].sort().join('-');
        if (!privateMessages[key]) privateMessages[key] = [];
        message.to = data.to;
        privateMessages[key].push(message);
      }
      
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({success: true}));
    });
    return;
  }
  
  if (parsedUrl.pathname === '/api/data') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({
      activities: activities,
      inventory: inventory,
      recipes: recipes,
      mealPlan: mealPlan,
      forumMessages: forumMessages,
      adminSuggestions: adminSuggestions,
      privateMessages: privateMessages
    }));
    return;
  }
  
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('<h1>Organización Familiar</h1><p>Accede con tu enlace personal</p>');
});

function getUserPage(username) {
  const user = USERS[username];
  return `<!DOCTYPE html>
<html>
<head>
  <title>Organización Familiar - ${user.name}</title>
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
    .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px; }
    .section { display: none; }
    .section.active { display: block; }
    input, button, select { padding: 8px 12px; margin: 4px; border: 1px solid #ddd; border-radius: 4px; }
    button { background: #10b981; color: white; border: none; cursor: pointer; }
    button:hover { background: #059669; }
    .chat-btn { background: #f3f4f6; color: #374151; padding: 8px 16px; border: 1px solid #d1d5db; border-radius: 20px; cursor: pointer; }
    .chat-btn.active { background: #10b981; color: white; }
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
        <button class="btn" onclick="showSection('recetas')">👨🍳 Recetas</button>
        <button class="btn" onclick="showSection('inventario')">📦 Inventario</button>
        <button class="btn" onclick="showSection('compras')">🛒 Lista de la compra</button>
        <button class="btn" onclick="showSection('mensajes')">💬 Mensajes</button>
      </div>
    </div>
    <div class="main">
      <div class="top">
        <h1>¡Hola, ${user.name}! 👋</h1>
      </div>
      <div class="content">
        <div id="actividades" class="section active">
          <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; margin-bottom: 20px;">
            <h3 id="daily-quote">"Cuando cambias la forma en que miras las cosas, las cosas que miras cambian" - Wayne Dyer</h3>
          </div>
          <h2 class="title">Mis Actividades</h2>
          <div class="card">
            <div id="my-activities">Cargando...</div>
          </div>
        </div>
        
        <div id="comidas" class="section">
          <h2 class="title">Planificación de Comidas</h2>
          <div class="card"><p>Sección de comidas</p></div>
        </div>
        
        <div id="recetas" class="section">
          <h2 class="title">Recetas</h2>
          <div id="recipes-grid" class="grid"></div>
        </div>
        
        <div id="inventario" class="section">
          <h2 class="title">Inventario</h2>
          <div id="inventory-grid" class="grid"></div>
        </div>
        
        <div id="compras" class="section">
          <h2 class="title">Lista de la Compra</h2>
          <div id="shopping-lists"></div>
        </div>
        
        <div id="mensajes" class="section">
          <h2 class="title">Mensajes</h2>
          
          <div class="card">
            <h3>Chat de grupo</h3>
            <div id="forum-messages" style="max-height: 300px; overflow-y: auto; margin: 15px 0; border: 1px solid #e5e7eb; padding: 10px; border-radius: 8px;"></div>
            <div style="display: flex; gap: 10px;">
              <input type="text" id="forum-input" placeholder="Escribe tu mensaje..." style="flex: 1;">
              <button onclick="sendMessage('forum')">Enviar</button>
            </div>
          </div>
          
          <div class="card">
            <h3>Chats privados</h3>
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
              <button onclick="selectPrivateChat('javier')" id="chat-javier" class="chat-btn">Javier</button>
              <button onclick="selectPrivateChat('raquel')" id="chat-raquel" class="chat-btn">Raquel</button>
              <button onclick="selectPrivateChat('mario')" id="chat-mario" class="chat-btn">Mario</button>
              <button onclick="selectPrivateChat('alba')" id="chat-alba" class="chat-btn">Alba</button>
            </div>
            <div id="private-messages" style="max-height: 300px; overflow-y: auto; margin: 15px 0; border: 1px solid #e5e7eb; padding: 10px; border-radius: 8px;"></div>
            <div style="display: flex; gap: 10px;">
              <input type="text" id="private-input" placeholder="Selecciona un chat..." style="flex: 1;" disabled>
              <button onclick="sendMessage('private')" disabled id="private-send-btn">Enviar</button>
            </div>
          </div>
          
          <div class="card">
            <h3>Sugerencias para el administrador</h3>
            <div id="admin-messages" style="max-height: 300px; overflow-y: auto; margin: 15px 0; border: 1px solid #e5e7eb; padding: 10px; border-radius: 8px;"></div>
            <div style="display: flex; gap: 10px;">
              <input type="text" id="admin-input" placeholder="Escribe tu sugerencia..." style="flex: 1;">
              <button onclick="sendMessage('admin')">Enviar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const username = '${username}';
    let selectedPrivateChat = null;
    
    const quotes = [
      '"Cuando cambias la forma en que miras las cosas, las cosas que miras cambian" - Wayne Dyer',
      '"El éxito es la suma de pequeños esfuerzos repetidos día tras día" - Robert Collier',
      '"No esperes por el momento perfecto, toma el momento y hazlo perfecto" - Zoey Sayward',
      '"La disciplina es el puente entre metas y logros" - Jim Rohn',
      '"Cada día es una nueva oportunidad para cambiar tu vida" - Anónimo'
    ];
    
    function updateDailyQuote() {
      const today = new Date().getDate();
      const quoteIndex = today % quotes.length;
      document.getElementById('daily-quote').textContent = quotes[quoteIndex];
    }
    
    function loadData() {
      fetch('/api/data')
        .then(r => r.json())
        .then(data => {
          loadActivities(data.activities);
          loadRecipes(data.recipes);
          loadInventory(data.inventory);
          loadShoppingList(data.inventory);
          loadMessages(data);
        });
    }
    
    function loadActivities(activities) {
      const today = new Date().toDateString();
      const myActivities = activities.filter(a => a.user === username && a.date === today);
      
      document.getElementById('my-activities').innerHTML = myActivities.length > 0 
        ? myActivities.map(a => 
            '<div style="background: #f0f9ff; padding: 12px; margin: 8px 0; border-radius: 8px;">' +
            '<strong>' + a.title + '</strong><br>' + a.time + ' (' + a.duration + ' min)' +
            '</div>'
          ).join('')
        : '<p>No tienes actividades para hoy</p>';
    }
    
    function loadRecipes(recipes) {
      document.getElementById('recipes-grid').innerHTML = recipes.map(recipe => 
        '<div class="card">' +
        '<h3>' + recipe.name + '</h3>' +
        '<p><strong>Ingredientes:</strong> ' + recipe.ingredients.map(ing => Object.keys(ing)[0] + ' (' + Object.values(ing)[0] + ')').join(', ') + '</p>' +
        '<p><strong>Tiempo:</strong> ' + recipe.time + ' horas</p>' +
        '<p><strong>Porciones:</strong> ' + recipe.servings + '</p>' +
        '</div>'
      ).join('');
    }
    
    function loadInventory(inventory) {
      document.getElementById('inventory-grid').innerHTML = inventory.map(item => 
        '<div class="card">' +
        '<h3>' + item.name + '</h3>' +
        '<p style="font-size: 18px; font-weight: bold;">' + item.quantity + ' ' + item.unit + '</p>' +
        '<div style="margin-top: 12px;">' +
        '<button onclick="changeInventory(\\'' + item.id + '\\', -1)" style="background: #dc2626;">-</button>' +
        '<button onclick="changeInventory(\\'' + item.id + '\\', 1)" style="background: #059669;">+</button>' +
        '</div></div>'
      ).join('');
    }
    
    function loadShoppingList(inventory) {
      const shops = ['Carne internet', 'Pescadería', 'Del bancal a casa', 'Alcampo'];
      const outOfStock = inventory.filter(item => item.quantity === 0);
      const lowStock = inventory.filter(item => item.quantity === 1);
      
      let html = '';
      shops.forEach(shop => {
        const shopItems = outOfStock.filter(item => item.shop === shop);
        const shopSuggestions = lowStock.filter(item => item.shop === shop);
        
        if (shopItems.length > 0 || shopSuggestions.length > 0) {
          html += '<div class="card"><h3>' + shop + '</h3>';
          
          if (shopItems.length > 0) {
            html += '<h4>Necesarios:</h4>';
            shopItems.forEach(item => {
              html += '<div style="padding: 4px; background: #fef2f2; margin: 2px 0; border-radius: 4px;">' + item.name + '</div>';
            });
          }
          
          if (shopSuggestions.length > 0) {
            html += '<h4>Sugerencias:</h4>';
            shopSuggestions.forEach(item => {
              html += '<div style="padding: 4px; background: #fef3c7; margin: 2px 0; border-radius: 4px;">' + item.name + '</div>';
            });
          }
          
          html += '</div>';
        }
      });
      
      document.getElementById('shopping-lists').innerHTML = html || '<div class="card"><p>No hay productos en la lista de compra</p></div>';
    }
    
    function loadMessages(data) {
      // Chat de grupo
      document.getElementById('forum-messages').innerHTML = data.forumMessages.map(msg => 
        '<div style="margin: 5px 0; padding: 8px 12px; border-radius: 12px; max-width: 70%; word-wrap: break-word; ' + 
        (msg.user === username ? 'background: #dcf8c6; margin-left: auto; text-align: right;' : 'background: #f1f1f1; margin-right: auto;') + '">' +
        '<div><strong>' + msg.user + '</strong></div>' +
        '<div>' + msg.text + '</div>' +
        '<div style="font-size: 11px; color: #666; margin-top: 2px;">' + msg.time + '</div>' +
        '</div>'
      ).join('') || '<p>No hay mensajes aún</p>';
      
      // Sugerencias admin
      document.getElementById('admin-messages').innerHTML = data.adminSuggestions.map(msg => 
        '<div style="margin: 5px 0; padding: 8px 12px; border-radius: 12px; max-width: 70%; word-wrap: break-word; ' + 
        (msg.user === username ? 'background: #dcf8c6; margin-left: auto; text-align: right;' : 'background: #f1f1f1; margin-right: auto;') + '">' +
        '<div><strong>' + msg.user + '</strong></div>' +
        '<div>' + msg.text + '</div>' +
        '<div style="font-size: 11px; color: #666; margin-top: 2px;">' + msg.time + '</div>' +
        '</div>'
      ).join('') || '<p>No hay sugerencias aún</p>';
      
      // Chat privado
      if (selectedPrivateChat) {
        const key = [username, selectedPrivateChat].sort().join('-');
        const privateMessages = data.privateMessages[key] || [];
        document.getElementById('private-messages').innerHTML = privateMessages.map(msg => 
          '<div style="margin: 5px 0; padding: 8px 12px; border-radius: 12px; max-width: 70%; word-wrap: break-word; ' + 
          (msg.user === username ? 'background: #dcf8c6; margin-left: auto; text-align: right;' : 'background: #f1f1f1; margin-right: auto;') + '">' +
          '<div><strong>' + msg.user + '</strong></div>' +
          '<div>' + msg.text + '</div>' +
          '<div style="font-size: 11px; color: #666; margin-top: 2px;">' + msg.time + '</div>' +
          '</div>'
        ).join('') || '<p>No hay mensajes aún</p>';
      }
    }
    
    function selectPrivateChat(user) {
      selectedPrivateChat = user;
      document.querySelectorAll('.chat-btn').forEach(btn => btn.classList.remove('active'));
      document.getElementById('chat-' + user).classList.add('active');
      document.getElementById('private-input').disabled = false;
      document.getElementById('private-input').placeholder = 'Escribe a ' + user + '...';
      document.getElementById('private-send-btn').disabled = false;
      loadData();
    }
    
    function sendMessage(type) {
      let text, to;
      
      if (type === 'forum') {
        text = document.getElementById('forum-input').value.trim();
        document.getElementById('forum-input').value = '';
      } else if (type === 'admin') {
        text = document.getElementById('admin-input').value.trim();
        document.getElementById('admin-input').value = '';
      } else if (type === 'private') {
        text = document.getElementById('private-input').value.trim();
        to = selectedPrivateChat;
        if (!to) {
          alert('Selecciona un chat');
          return;
        }
        document.getElementById('private-input').value = '';
      }
      
      if (!text) return;
      
      fetch('/api/message', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({type: type, user: username, text: text, to: to})
      }).then(() => loadData());
    }
    
    function changeInventory(id, change) {
      fetch('/api/inventory', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'update', id: id, change: change})
      }).then(() => loadData());
    }
    
    function showSection(section) {
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
      document.getElementById(section).classList.add('active');
      event.target.classList.add('active');
    }
    
    updateDailyQuote();
    loadData();
    setInterval(loadData, 10000);
  </script>
</body>
</html>`;
}

function getAdminPage() {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Administrador - Organización Familiar</title>
  <style>
    * { font-family: Verdana, Geneva, sans-serif; margin: 0; padding: 0; }
    body { background: #f9fafb; }
    .container { display: flex; min-height: 100vh; }
    .sidebar { width: 256px; background: #f9fafb; border-right: 1px solid #e5e7eb; position: fixed; height: 100vh; z-index: 10; }
    .main { flex: 1; margin-left: 256px; }
    .content { padding: 32px; }
    .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="sidebar">
      <div style="padding: 20px;">
        <h3>Admin Panel</h3>
      </div>
    </div>
    <div class="main">
      <div class="content">
        <div class="card">
          <h2>Panel de Administrador</h2>
          <p>Funcionalidades de administración</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
  console.log(`📱 App disponible en: http://localhost:${PORT}`);
  console.log(`🔗 Enlaces de usuarios:`);
  console.log(`   Javier: /javier/abc123xyz789def456`);
  console.log(`   Raquel: /raquel/uvw012rst345ghi678`);
  console.log(`   Mario: /mario/jkl901mno234pqr567`);
  console.log(`   Alba: /alba/stu890vwx123yzb456`);
  console.log(`   Admin: /admin/cde789fgh012ijl345`);
});