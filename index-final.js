const http = require('http');
const url = require('url');

const USERS = {
  javier: { id: 'javier', name: 'Javier' },
  raquel: { id: 'raquel', name: 'Raquel' },
  mario: { id: 'mario', name: 'Mario' },
  alba: { id: 'alba', name: 'Alba' }
};

let activities = [];
let inventory = [
  { id: '1', name: 'Jamón', quantity: 2, unit: 'paquetes', shop: 'Carne internet' },
  { id: '2', name: 'Salmón fresco', quantity: 1, unit: 'unidades', shop: 'Pescadería' },
  { id: '3', name: 'Ajo', quantity: 5, unit: 'unidades', shop: 'Del bancal a casa' },
  { id: '4', name: 'Pollo', quantity: 3, unit: 'unidades', shop: 'Carne internet' },
  { id: '5', name: 'Tomate', quantity: 2, unit: 'kg', shop: 'Del bancal a casa' }
];

let recipes = [
  { id: '1', name: 'Pollo al ajillo', ingredients: 'Pollo, Ajo', time: '30 min' },
  { id: '2', name: 'Salmón en papillote', ingredients: 'Salmón, Ajo', time: '45 min' }
];

let forumMessages = [];
let adminSuggestions = [];
let privateMessages = {};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const parsedUrl = url.parse(req.url, true);
  
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
  
  if (req.method === 'POST' && parsedUrl.pathname === '/api/inventory') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      const item = inventory.find(i => i.id === data.id);
      if (item) {
        item.quantity = Math.max(0, item.quantity + data.change);
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
        time: new Date().toLocaleString('es-ES')
      };
      
      if (data.type === 'forum') {
        forumMessages.push(message);
      } else if (data.type === 'admin') {
        adminSuggestions.push(message);
      } else if (data.type === 'private') {
        const key = [data.user, data.to].sort().join('-');
        if (!privateMessages[key]) privateMessages[key] = [];
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
      inventory: inventory,
      recipes: recipes,
      forumMessages: forumMessages,
      adminSuggestions: adminSuggestions,
      privateMessages: privateMessages
    }));
    return;
  }
  
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('<h1>Organización Familiar</h1>');
});

function getUserPage(username) {
  const user = USERS[username];
  return `<!DOCTYPE html>
<html>
<head>
  <title>Organización Familiar - ${user.name}</title>
  <style>
    * { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    body { background: #f5f5f5; }
    .container { display: flex; min-height: 100vh; }
    .sidebar { width: 250px; background: white; padding: 20px; box-shadow: 2px 0 5px rgba(0,0,0,0.1); }
    .main { flex: 1; padding: 20px; }
    .btn { width: 100%; padding: 15px; margin: 5px 0; border: none; border-radius: 8px; cursor: pointer; background: #f0f0f0; }
    .btn.active { background: #007bff; color: white; }
    .section { display: none; }
    .section.active { display: block; }
    .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
    input, button { padding: 10px; margin: 5px; border: 1px solid #ddd; border-radius: 4px; }
    button { background: #007bff; color: white; border: none; cursor: pointer; }
    .quote { background: linear-gradient(45deg, #667eea, #764ba2); color: white; text-align: center; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .chat-btn { background: #e9ecef; color: #495057; padding: 8px 15px; border-radius: 20px; margin: 2px; }
    .chat-btn.active { background: #007bff; color: white; }
    .message { margin: 5px 0; padding: 10px; border-radius: 15px; max-width: 70%; }
    .message.own { background: #dcf8c6; margin-left: auto; text-align: right; }
    .message.other { background: #f1f1f1; margin-right: auto; }
  </style>
</head>
<body>
  <div class="container">
    <div class="sidebar">
      <h2>🏠 Organización</h2>
      <button class="btn active" onclick="showSection('actividades')">📅 Actividades</button>
      <button class="btn" onclick="showSection('recetas')">👨‍🍳 Recetas</button>
      <button class="btn" onclick="showSection('inventario')">📦 Inventario</button>
      <button class="btn" onclick="showSection('compras')">🛒 Compras</button>
      <button class="btn" onclick="showSection('mensajes')">💬 Mensajes</button>
      <div style="margin-top: 50px; text-align: center;">
        <strong>${user.name}</strong>
      </div>
    </div>
    
    <div class="main">
      <div id="actividades" class="section active">
        <div class="quote">
          <h3>"Cuando cambias la forma en que miras las cosas, las cosas que miras cambian" - Wayne Dyer</h3>
        </div>
        <h1>Mis Actividades</h1>
        <div class="card">
          <p>No tienes actividades para hoy</p>
        </div>
      </div>
      
      <div id="recetas" class="section">
        <h1>Recetas</h1>
        <div id="recipes-grid" class="grid"></div>
      </div>
      
      <div id="inventario" class="section">
        <h1>Inventario</h1>
        <div id="inventory-grid" class="grid"></div>
      </div>
      
      <div id="compras" class="section">
        <h1>Lista de la Compra</h1>
        <div id="shopping-lists"></div>
      </div>
      
      <div id="mensajes" class="section">
        <h1>Mensajes</h1>
        
        <div class="card">
          <h3>Chat de grupo</h3>
          <div id="forum-messages" style="height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin: 10px 0;"></div>
          <div>
            <input type="text" id="forum-input" placeholder="Escribe tu mensaje..." style="width: 70%;">
            <button onclick="sendMessage('forum')">Enviar</button>
          </div>
        </div>
        
        <div class="card">
          <h3>Chats privados</h3>
          <div style="margin: 10px 0;">
            <button onclick="selectPrivateChat('javier')" id="chat-javier" class="chat-btn">Javier</button>
            <button onclick="selectPrivateChat('raquel')" id="chat-raquel" class="chat-btn">Raquel</button>
            <button onclick="selectPrivateChat('mario')" id="chat-mario" class="chat-btn">Mario</button>
            <button onclick="selectPrivateChat('alba')" id="chat-alba" class="chat-btn">Alba</button>
          </div>
          <div id="private-messages" style="height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin: 10px 0;"></div>
          <div>
            <input type="text" id="private-input" placeholder="Selecciona un chat..." style="width: 70%;" disabled>
            <button onclick="sendMessage('private')" disabled id="private-send-btn">Enviar</button>
          </div>
        </div>
        
        <div class="card">
          <h3>Sugerencias para el administrador</h3>
          <div id="admin-messages" style="height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin: 10px 0;"></div>
          <div>
            <input type="text" id="admin-input" placeholder="Escribe tu sugerencia..." style="width: 70%;">
            <button onclick="sendMessage('admin')">Enviar</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const username = '${username}';
    let selectedPrivateChat = null;
    
    function loadData() {
      fetch('/api/data')
        .then(r => r.json())
        .then(data => {
          loadRecipes(data.recipes);
          loadInventory(data.inventory);
          loadShoppingList(data.inventory);
          loadMessages(data);
        });
    }
    
    function loadRecipes(recipes) {
      document.getElementById('recipes-grid').innerHTML = recipes.map(recipe => 
        '<div class="card"><h3>' + recipe.name + '</h3><p>' + recipe.ingredients + '</p><p>Tiempo: ' + recipe.time + '</p></div>'
      ).join('');
    }
    
    function loadInventory(inventory) {
      document.getElementById('inventory-grid').innerHTML = inventory.map(item => 
        '<div class="card"><h3>' + item.name + '</h3><p>' + item.quantity + ' ' + item.unit + '</p>' +
        '<button onclick="changeInventory(\'' + item.id + '\', -1)">-</button>' +
        '<button onclick="changeInventory(\'' + item.id + '\', 1)">+</button></div>'
      ).join('');
    }
    
    function loadShoppingList(inventory) {
      const outOfStock = inventory.filter(item => item.quantity === 0);
      const lowStock = inventory.filter(item => item.quantity === 1);
      
      let html = '';
      if (outOfStock.length > 0) {
        html += '<div class="card"><h3>Necesarios</h3>';
        outOfStock.forEach(item => html += '<p>' + item.name + '</p>');
        html += '</div>';
      }
      if (lowStock.length > 0) {
        html += '<div class="card"><h3>Sugerencias</h3>';
        lowStock.forEach(item => html += '<p>' + item.name + '</p>');
        html += '</div>';
      }
      
      document.getElementById('shopping-lists').innerHTML = html || '<div class="card"><p>No hay productos en la lista</p></div>';
    }
    
    function loadMessages(data) {
      // Chat de grupo
      document.getElementById('forum-messages').innerHTML = data.forumMessages.map(msg => 
        '<div class="message ' + (msg.user === username ? 'own' : 'other') + '">' +
        '<strong>' + msg.user + '</strong><br>' + msg.text + '<br><small>' + msg.time + '</small></div>'
      ).join('') || '<p>No hay mensajes</p>';
      
      // Sugerencias admin
      document.getElementById('admin-messages').innerHTML = data.adminSuggestions.map(msg => 
        '<div class="message ' + (msg.user === username ? 'own' : 'other') + '">' +
        '<strong>' + msg.user + '</strong><br>' + msg.text + '<br><small>' + msg.time + '</small></div>'
      ).join('') || '<p>No hay sugerencias</p>';
      
      // Chat privado
      if (selectedPrivateChat) {
        const key = [username, selectedPrivateChat].sort().join('-');
        const privateMessages = data.privateMessages[key] || [];
        document.getElementById('private-messages').innerHTML = privateMessages.map(msg => 
          '<div class="message ' + (msg.user === username ? 'own' : 'other') + '">' +
          '<strong>' + msg.user + '</strong><br>' + msg.text + '<br><small>' + msg.time + '</small></div>'
        ).join('') || '<p>No hay mensajes</p>';
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
        if (!to) return;
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
        body: JSON.stringify({id: id, change: change})
      }).then(() => loadData());
    }
    
    function showSection(section) {
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
      document.getElementById(section).classList.add('active');
      event.target.classList.add('active');
    }
    
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
  <title>Admin - Organización Familiar</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 50px; background: #f5f5f5; }
    .card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <div class="card">
    <h1>Panel de Administrador</h1>
    <p>Funcionalidades de administración</p>
  </div>
</body>
</html>`;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
});