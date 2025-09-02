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
  { id: '1', name: 'Jamón', category: 'carne', shop: 'Carne internet', unit: 'unidades', quantity: 2 },
  { id: '2', name: 'Salmón fresco', category: 'pescado', shop: 'Pescadería', unit: 'unidades', quantity: 1 },
  { id: '3', name: 'Ajo', category: 'verdura', shop: 'Del bancal a casa', unit: 'unidades', quantity: 5 },
  { id: '4', name: 'Pollo', category: 'carne', shop: 'Carne internet', unit: 'unidades', quantity: 3 },
  { id: '5', name: 'Tomate', category: 'verdura', shop: 'Del bancal a casa', unit: 'unidades', quantity: 0 },
  { id: '6', name: 'Cebolla', category: 'verdura', shop: 'Del bancal a casa', unit: 'unidades', quantity: 1 },
  { id: '7', name: 'Arroz', category: 'otros', shop: 'Alcampo', unit: 'unidades', quantity: 2 },
  { id: '8', name: 'Aceite', category: 'otros', shop: 'Alcampo', unit: 'litros', quantity: 1 }
];

let recipes = [
  { id: '1', name: 'Pollo al ajillo', category: 'comidas', ingredients: ['Pollo', 'Ajo'], time: 0.5, servings: 4 },
  { id: '2', name: 'Salmón en papillote', category: 'comidas', ingredients: ['Salmón fresco', 'Ajo'], time: 0.75, servings: 4 },
  { id: '3', name: 'Pasta con tomate', category: 'cenas', ingredients: ['Tomate', 'Cebolla'], time: 0.25, servings: 4 }
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
      if (data.action === 'update') {
        const item = inventory.find(i => i.id === data.id);
        if (item) {
          item.quantity = Math.max(0, item.quantity + data.change);
        }
      } else if (data.action === 'add') {
        inventory.push({
          id: Date.now().toString(),
          name: data.name,
          category: data.category,
          shop: data.shop,
          unit: data.unit,
          quantity: data.quantity
        });
      } else if (data.action === 'delete') {
        const index = inventory.findIndex(i => i.id === data.id);
        if (index !== -1) inventory.splice(index, 1);
      }
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({success: true}));
    });
    return;
  }
  
  if (req.method === 'POST' && parsedUrl.pathname === '/api/recipe') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      recipes.push({
        id: Date.now().toString(),
        name: data.name,
        category: data.category,
        ingredients: data.ingredients,
        time: data.time,
        servings: data.servings || 4
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
      activities: activities,
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
      
      <div style="text-align: center; margin: 20px 0; padding: 15px; background: linear-gradient(45deg, #667eea, #764ba2); color: white; border-radius: 8px;">
        <div id="current-date" style="font-size: 16px; font-weight: bold; margin-bottom: 10px;"></div>
        <div id="daily-quote-text" style="font-size: 14px; line-height: 1.4;"></div>
      </div>
      
      <button class="btn active" onclick="showSection('inicio')">🏠 Inicio</button>
      <button class="btn" onclick="showSection('actividades')">📅 Actividades</button>
      <button class="btn" onclick="showSection('comidas')">🍽️ Comidas</button>
      <button class="btn" onclick="showSection('recetas')">👨🍳 Recetas</button>
      <button class="btn" onclick="showSection('inventario')">📦 Inventario</button>
      <button class="btn" onclick="showSection('compras')">🛒 Compras</button>
      <button class="btn" onclick="showSection('mensajes')">💬 Mensajes</button>
      <div style="margin-top: 50px; text-align: center;">
        <strong>${user.name}</strong>
      </div>
    </div>
    
    <div class="main">
      <div id="inicio" class="section active">
        <h1>Inicio</h1>
        

        
        <div class="card">
          <h3>Resumen del Día</h3>
          <div id="daily-summary">
            <p>Bienvenido a tu organización familiar</p>
          </div>
        </div>
      </div>
      
      <div id="actividades" class="section">
        <div class="quote">
          <h3>"Cuando cambias la forma en que miras las cosas, las cosas que miras cambian" - Wayne Dyer</h3>
        </div>
        <h1>Mis Actividades</h1>
        
        <div style="margin: 20px 0;">
          <button onclick="setView('daily')">Vista Diaria</button>
          <button onclick="setView('weekly')">Vista Semanal</button>
        </div>
        
        <div class="card">
          <h3>Actividades de Hoy</h3>
          <div id="my-activities">No tienes actividades para hoy</div>
        </div>
      </div>
      
      <div id="comidas" class="section">
        <h1>Planificación de Comidas</h1>
        
        <div style="display: flex; justify-content: space-between; margin: 20px 0;">
          <button onclick="changeWeek(-1)">← Semana Anterior</button>
          <h3 id="current-week">Semana del 1 al 7 de Septiembre 2025</h3>
          <button onclick="changeWeek(1)">Semana Siguiente →</button>
        </div>
        
        <div class="card">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <th style="border: 1px solid #ddd; padding: 12px; text-align: left;"></th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Lunes</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Martes</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Miércoles</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Jueves</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Viernes</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Sábado</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Domingo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px; background: #e3f2fd; font-weight: bold; text-align: left;">Desayuno Alba y Mario</td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px; background: #f3e5f5; font-weight: bold; text-align: left;">Desayuno Raquel y Javier</td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px; background: #fff3e0; font-weight: bold; text-align: left;">Almuerzo Alba y Mario</td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px; background: #e8f5e8; font-weight: bold; text-align: left;">Almuerzo Raquel y Javier</td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px; background: #fce4ec; font-weight: bold; text-align: left;">Comida</td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px; background: #f1f8e9; font-weight: bold; text-align: left;">Merienda Alba y Mario</td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px; background: #fff8e1; font-weight: bold; text-align: left;">Merienda Raquel y Javier</td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px; background: #e1f5fe; font-weight: bold; text-align: left;">Cena</td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
                <td style="border: 1px solid #ddd; padding: 12px; cursor: pointer; min-height: 50px; vertical-align: top;" onclick="markMealDone()"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div id="recetas" class="section">
        <h1>Recetas</h1>
        
        <div style="margin: 20px 0;">
          <button class="btn" onclick="showRecipeCategory('comidas')" id="recipe-comidas">Comidas</button>
          <button class="btn" onclick="showRecipeCategory('cenas')" id="recipe-cenas">Cenas</button>
        </div>
        
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
    let currentWeek = 1;
    let currentRecipeCategory = 'comidas';
    
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
      const filteredRecipes = recipes.filter(r => r.category === currentRecipeCategory);
      document.getElementById('recipes-grid').innerHTML = filteredRecipes.map(recipe => 
        '<div class="card">' +
        '<h3>' + recipe.name + '</h3>' +
        '<p><strong>Ingredientes:</strong> ' + recipe.ingredients.join(', ') + '</p>' +
        '<p><strong>Tiempo:</strong> ' + recipe.time + ' horas</p>' +
        '<p><strong>Porciones:</strong> ' + recipe.servings + '</p>' +
        '</div>'
      ).join('');
    }
    
    function loadInventory(inventory) {
      const categories = ['carne', 'pescado', 'verdura', 'fruta', 'frutos secos', 'productos de limpieza/hogar', 'otros'];
      let html = '';
      
      categories.forEach(category => {
        const categoryItems = inventory.filter(item => item.category === category);
        if (categoryItems.length > 0) {
          html += '<div class="card"><h3>' + category.charAt(0).toUpperCase() + category.slice(1) + '</h3>';
          categoryItems.forEach(item => {
            html += '<div style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 5px;">';
            html += '<div><strong>' + item.name + '</strong><br>' + item.quantity + ' ' + item.unit + '</div>';
            html += '<div>';
            html += '<button onclick="changeInventory(\\'' + item.id + '\\', -1)" style="background: #dc2626; margin: 2px;">-</button>';
            html += '<button onclick="changeInventory(\\'' + item.id + '\\', 1)" style="background: #059669; margin: 2px;">+</button>';
            html += '</div></div>';
          });
          html += '</div>';
        }
      });
      
      document.getElementById('inventory-grid').innerHTML = html;
    }
    
    function loadShoppingList(inventory) {
      const shops = ['Carne internet', 'Pescadería', 'Del bancal a casa', 'Alcampo', 'Internet', 'Otros'];
      const outOfStock = inventory.filter(item => item.quantity === 0);
      const lowStock = inventory.filter(item => item.quantity === 1);
      
      let html = '';
      shops.forEach(shop => {
        const shopItems = outOfStock.filter(item => item.shop === shop);
        const shopSuggestions = lowStock.filter(item => item.shop === shop);
        
        if (shopItems.length > 0 || shopSuggestions.length > 0) {
          html += '<div class="card"><h3>' + shop + '</h3>';
          
          if (shopItems.length > 0) {
            html += '<h4 style="color: #dc2626;">Necesarios:</h4>';
            shopItems.forEach(item => {
              html += '<div style="padding: 8px; background: #fef2f2; margin: 4px 0; border-radius: 4px; border-left: 4px solid #dc2626;">' + item.name + '</div>';
            });
          }
          
          if (shopSuggestions.length > 0) {
            html += '<h4 style="color: #f59e0b;">Sugerencias:</h4>';
            shopSuggestions.forEach(item => {
              html += '<div style="padding: 8px; background: #fef3c7; margin: 4px 0; border-radius: 4px; border-left: 4px solid #f59e0b;">' + item.name + '</div>';
            });
          }
          
          html += '</div>';
        }
      });
      
      document.getElementById('shopping-lists').innerHTML = html || '<div class="card"><p>No hay productos en la lista de compra</p></div>';
    }
    
    function loadMessages(data) {
      document.getElementById('forum-messages').innerHTML = data.forumMessages.map(msg => 
        '<div class="message ' + (msg.user === username ? 'own' : 'other') + '">' +
        '<strong>' + msg.user + '</strong><br>' + msg.text + '<br><small>' + msg.time + '</small></div>'
      ).join('') || '<p>No hay mensajes</p>';
      
      document.getElementById('admin-messages').innerHTML = data.adminSuggestions.map(msg => 
        '<div class="message ' + (msg.user === username ? 'own' : 'other') + '">' +
        '<strong>' + msg.user + '</strong><br>' + msg.text + '<br><small>' + msg.time + '</small></div>'
      ).join('') || '<p>No hay sugerencias</p>';
      
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
        body: JSON.stringify({action: 'update', id: id, change: change})
      }).then(() => loadData());
    }
    
    function showRecipeCategory(category) {
      currentRecipeCategory = category;
      document.querySelectorAll('#recipe-comidas, #recipe-cenas').forEach(b => b.classList.remove('active'));
      document.getElementById('recipe-' + category).classList.add('active');
      loadData();
    }
    
    function showSection(section) {
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
      document.getElementById(section).classList.add('active');
      event.target.classList.add('active');
    }
    
    function setView(view) {
      console.log('Vista cambiada a: ' + view);
    }
    
    function changeWeek(direction) {
      currentWeek += direction;
      document.getElementById('current-week').textContent = 'Semana ' + currentWeek + ' de Septiembre 2025';
    }
    
    function markMealDone() {
      if (confirm('¿Marcar como hecho?')) {
        event.target.style.background = '#d4edda';
        event.target.innerHTML = '✓ Hecho';
      }
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
    input, button, select { padding: 10px; margin: 5px; border: 1px solid #ddd; border-radius: 4px; }
    button { background: #007bff; color: white; border: none; cursor: pointer; }
    .form-group { margin: 15px 0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="sidebar">
      <h2>🔧 Admin Panel</h2>
      <button class="btn active" onclick="showSection('inventario')">📦 Inventario</button>
      <button class="btn" onclick="showSection('recetas')">👨🍳 Recetas</button>
      <button class="btn" onclick="showSection('mensajes')">💬 Mensajes</button>
      <div style="margin-top: 50px; text-align: center;">
        <strong>Javi (Admin)</strong>
      </div>
    </div>
    
    <div class="main">
      <div id="inventario" class="section active">
        <h1>Gestionar Inventario</h1>
        
        <div class="card">
          <h3>Añadir Nuevo Producto</h3>
          <div class="form-group">
            <input type="text" id="product-name" placeholder="Nombre del producto">
            <select id="product-category">
              <option value="carne">Carne</option>
              <option value="pescado">Pescado</option>
              <option value="verdura">Verdura</option>
              <option value="fruta">Fruta</option>
              <option value="frutos secos">Frutos secos</option>
              <option value="productos de limpieza/hogar">Productos de limpieza/hogar</option>
              <option value="otros">Otros</option>
            </select>
            <select id="product-shop">
              <option value="Carne internet">Carne internet</option>
              <option value="Pescadería">Pescadería</option>
              <option value="Del bancal a casa">Del bancal a casa</option>
              <option value="Alcampo">Alcampo</option>
              <option value="Internet">Internet</option>
              <option value="Otros">Otros</option>
            </select>
            <select id="product-unit">
              <option value="unidades">Unidades</option>
              <option value="litros">Litros</option>
              <option value="botes">Botes</option>
              <option value="tarros">Tarros</option>
              <option value="cartones">Cartones</option>
              <option value="latas">Latas</option>
            </select>
            <input type="number" id="product-quantity" placeholder="Cantidad" value="0">
            <button onclick="saveProduct()">💾 Añadir Producto</button>
          </div>
        </div>
        
        <div id="inventory-admin-grid" class="grid"></div>
      </div>
      
      <div id="recetas" class="section">
        <h1>Gestionar Recetas</h1>
        
        <div class="card">
          <h3>Añadir Nueva Receta</h3>
          <div class="form-group">
            <input type="text" id="recipe-name" placeholder="Nombre de la receta">
            <select id="recipe-category">
              <option value="comidas">Comidas</option>
              <option value="cenas">Cenas</option>
            </select>
            <input type="number" id="recipe-time" placeholder="Tiempo (horas)" step="0.25" value="0.5">
            <input type="number" id="recipe-servings" placeholder="Porciones" value="4">
            <div id="recipe-ingredients">
              <h4>Ingredientes:</h4>
              <div id="ingredients-list"></div>
              <select id="ingredient-select">
                <option value="">Seleccionar ingrediente</option>
              </select>
              <button type="button" onclick="addIngredient()">➕ Añadir Ingrediente</button>
            </div>
            <button onclick="saveRecipe()">💾 Crear Receta</button>
          </div>
        </div>
        
        <div id="recipes-admin-grid" class="grid"></div>
      </div>
      
      <div id="mensajes" class="section">
        <h1>Mensajes Recibidos</h1>
        <div class="card">
          <h3>Sugerencias de usuarios</h3>
          <div id="admin-messages" style="height: 300px; overflow-y: auto; border: 1px solid #ddd; padding: 10px;"></div>
        </div>
      </div>
    </div>
  </div>

  <script>
    let selectedIngredients = [];
    
    function loadData() {
      fetch('/api/data')
        .then(r => r.json())
        .then(data => {
          loadAdminInventory(data.inventory);
          loadAdminRecipes(data.recipes);
          loadAdminMessages(data.adminSuggestions);
          loadIngredientOptions(data.inventory);
        });
    }
    
    function loadAdminInventory(inventory) {
      document.getElementById('inventory-admin-grid').innerHTML = inventory.map(item => 
        '<div class="card">' +
        '<h3>' + item.name + '</h3>' +
        '<p><strong>Categoría:</strong> ' + item.category + '</p>' +
        '<p><strong>Tienda:</strong> ' + item.shop + '</p>' +
        '<p><strong>Cantidad:</strong> ' + item.quantity + ' ' + item.unit + '</p>' +
        '<button onclick="deleteProduct(\\'' + item.id + '\\')" style="background: #dc2626;">🗑️ Eliminar</button>' +
        '</div>'
      ).join('');
    }
    
    function loadAdminRecipes(recipes) {
      document.getElementById('recipes-admin-grid').innerHTML = recipes.map(recipe => 
        '<div class="card">' +
        '<h3>' + recipe.name + '</h3>' +
        '<p><strong>Categoría:</strong> ' + recipe.category + '</p>' +
        '<p><strong>Ingredientes:</strong> ' + recipe.ingredients.join(', ') + '</p>' +
        '<p><strong>Tiempo:</strong> ' + recipe.time + ' horas</p>' +
        '<p><strong>Porciones:</strong> ' + recipe.servings + '</p>' +
        '</div>'
      ).join('');
    }
    
    function loadAdminMessages(messages) {
      document.getElementById('admin-messages').innerHTML = messages.map(msg => 
        '<div style="background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 5px;"><strong>' + msg.user + '</strong> (' + msg.time + '):<br>' + msg.text + '</div>'
      ).join('') || '<p>No hay sugerencias</p>';
    }
    
    function loadIngredientOptions(inventory) {
      const select = document.getElementById('ingredient-select');
      select.innerHTML = '<option value="">Seleccionar ingrediente</option>' +
        inventory.map(item => '<option value="' + item.name + '">' + item.name + '</option>').join('');
    }
    
    function saveProduct() {
      const name = document.getElementById('product-name').value.trim();
      const category = document.getElementById('product-category').value;
      const shop = document.getElementById('product-shop').value;
      const unit = document.getElementById('product-unit').value;
      const quantity = parseInt(document.getElementById('product-quantity').value);
      
      if (!name) {
        alert('❌ Completa el nombre del producto');
        return;
      }
      
      fetch('/api/inventory', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'add', name, category, shop, unit, quantity})
      }).then(() => {
        alert('✅ Producto añadido');
        document.getElementById('product-name').value = '';
        document.getElementById('product-quantity').value = '0';
        loadData();
      });
    }
    
    function deleteProduct(id) {
      if (confirm('¿Eliminar producto?')) {
        fetch('/api/inventory', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({action: 'delete', id: id})
        }).then(() => {
          alert('✅ Producto eliminado');
          loadData();
        });
      }
    }
    
    function addIngredient() {
      const select = document.getElementById('ingredient-select');
      const ingredient = select.value;
      if (ingredient && !selectedIngredients.includes(ingredient)) {
        selectedIngredients.push(ingredient);
        updateIngredientsList();
      }
    }
    
    function updateIngredientsList() {
      document.getElementById('ingredients-list').innerHTML = selectedIngredients.map(ing => 
        '<span style="background: #e3f2fd; padding: 5px 10px; margin: 2px; border-radius: 15px; display: inline-block;">' +
        ing + ' <span onclick="removeIngredient(\\'' + ing + '\\')" style="cursor: pointer; color: #dc2626;">×</span></span>'
      ).join('');
    }
    
    function removeIngredient(ingredient) {
      selectedIngredients = selectedIngredients.filter(ing => ing !== ingredient);
      updateIngredientsList();
    }
    
    function saveRecipe() {
      const name = document.getElementById('recipe-name').value.trim();
      const category = document.getElementById('recipe-category').value;
      const time = parseFloat(document.getElementById('recipe-time').value);
      const servings = parseInt(document.getElementById('recipe-servings').value);
      
      if (!name || selectedIngredients.length === 0) {
        alert('❌ Completa todos los campos');
        return;
      }
      
      fetch('/api/recipe', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, category, ingredients: selectedIngredients, time, servings})
      }).then(() => {
        alert('✅ Receta creada');
        document.getElementById('recipe-name').value = '';
        document.getElementById('recipe-time').value = '0.5';
        document.getElementById('recipe-servings').value = '4';
        selectedIngredients = [];
        updateIngredientsList();
        loadData();
      });
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
});