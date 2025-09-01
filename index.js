const http = require('http');
const url = require('url');

// Datos exactos del archivo original
const USERS = {
  javier: { id: 'javier', name: 'Javier', password: 'password123' },
  raquel: { id: 'raquel', name: 'Raquel', password: 'password456' },
  mario: { id: 'mario', name: 'Mario', password: 'password789' },
  alba: { id: 'alba', name: 'Alba', password: 'password000' },
  javi_administrador: { id: 'javi_administrador', name: 'Javi (Admin)', password: 'admin123' }
};

const recipes = [
  { id: '048b6745-b709-4ff5-bdd9-c3f2e1a14635', name: 'Lubina sobre cama de verduras', category: 'comidas', instructions: 'Lleva vino blanco, tomillo, aceite, sal y un poco de agua', preparationTime: 30, servings: 4 },
  { id: '16c802f4-c646-4196-acd4-72eb80ec52d9', name: 'Muslo y contra muslo de pollo con pimientos', category: 'comidas', instructions: 'Lleva 1 diente de ajo, tomillo, comino, pimienta, vinagre de Jerez, aceite y sal.', preparationTime: 30, servings: 4 },
  { id: '17b61b42-fda5-4f00-8002-0a54773e2e74', name: 'Marmitako de salmón', category: 'comidas', instructions: 'Lleva 4 dientes de ajo', preparationTime: 30, servings: 4 },
  { id: '1bb492e1-270b-433e-ab25-07ea9bb6c7b1', name: 'Crema de almendras con frutos rojos', category: 'desayunos', instructions: 'Lleva crema de almendras, macadamias y chocolate.', preparationTime: 30, servings: 4 },
  { id: '27d5a68c-84cb-4dac-bb6a-61fdca3abd92', name: 'Aguacate con salmón ahumado', category: 'cenas', instructions: 'Lleva aceitunas, un poco de cebolla, salsa tamari, aceite.', preparationTime: 30, servings: 4 },
  { id: '285aa1c6-ef84-485a-8b40-42d1c42d1180', name: 'Tostadas pan keto con aceite, lechuga, pepino, salmón marinado', category: 'desayunos', instructions: 'Sin instrucciones', preparationTime: 30, servings: 4 },
  { id: '2dcf433e-db93-4e41-94ef-47e9069b73f2', name: 'Zanahorias, olivas y nueces', category: 'desayunos', instructions: 'Sin instrucciones', preparationTime: 30, servings: 4 },
  { id: '2dff8318-2a5d-4ce1-806c-0b723f1bb078', name: 'Dorada sobre cama de verduras', category: 'comidas', instructions: 'Lleva vino blanco, tomillo, aceite, sal y un poco de agua', preparationTime: 30, servings: 4 },
  { id: '3442b6f0-85ec-4321-bb3b-6fa4c4591c1a', name: 'Alitas de pollo', category: 'comidas', instructions: 'Lleva 4 dientes de ajo, ajo en polvo, tomillo, aceite y sal', preparationTime: 30, servings: 4 },
  { id: '382fd115-1405-4551-992b-2f5ae732577e', name: 'Pechugas de pollo rellenas de jamón', category: 'comidas', instructions: 'Lleva ajo en polvo, aceite y sal.', preparationTime: 30, servings: 4 },
  { id: '3c2aa76d-91cf-480e-a489-9e66ddd04555', name: 'Bizcocho almendra', category: 'desayunos', instructions: 'Sin instrucciones', preparationTime: 30, servings: 4 },
  { id: '55397886-bea6-4f09-880e-ea56d96c25a3', name: 'Huevos a la plancha con jamón y aguacate', category: 'desayunos', instructions: 'Sin instrucciones', preparationTime: 30, servings: 4 },
  { id: '5c370221-b608-417f-a088-a6aa4d1771c8', name: 'Crema de calabacín con salchichas', category: 'cenas', instructions: 'Lleva aceite y sal', preparationTime: 30, servings: 4 },
  { id: '634a467a-4c17-4b07-a2c3-e985507e431d', name: 'Tortilla con crema de calabaza', category: 'cenas', instructions: 'Sin instrucciones', preparationTime: 30, servings: 4 },
  { id: '69184600-ddaf-4032-b80a-fd943d6fa7a4', name: 'Tostadas keto de ghee y erititrol', category: 'desayunos', instructions: 'Sin instrucciones', preparationTime: 30, servings: 4 },
  { id: '781a4874-58a7-40f0-825c-1a4cb3a73155', name: 'Bizcocho cacahuete', category: 'desayunos', instructions: 'Sin instrucciones', preparationTime: 30, servings: 4 },
  { id: '9c46ea6f-13d5-40dc-a5a5-059a4f1d15c7', name: 'Salmón en papillote', category: 'comidas', instructions: 'Lleva ajo en polvo, aceite y sal.', preparationTime: 30, servings: 4 },
  { id: '9f124919-1d5f-4bc2-afd8-7d93dc35ab05', name: 'Merluza con pimientos', category: 'comidas', instructions: 'Lleva aceite, sal, eneldo y vino blanco', preparationTime: 30, servings: 4 },
  { id: 'b1f8b0bc-798d-4686-b97b-4ea8432a9d0d', name: 'Kéfir con frutos rojos', category: 'desayunos', instructions: 'Lleva chocolate y macadamias', preparationTime: 30, servings: 4 },
  { id: 'b2372066-c3b4-4a74-82e5-45ee02a5b8f3', name: 'Muslo y contra muslo de pollo con setas', category: 'comidas', instructions: 'Lleva 4 dientes de ajo, tomillo, aceite y sal.', preparationTime: 30, servings: 4 },
  { id: 'ba979034-7786-4e58-8bf0-9e96b56b12c2', name: 'Caballa con mayonesa y brócoli al horno', category: 'cenas', instructions: 'Lleva aceite, 1 diente de ajo, limón y sal para la mayonesa', preparationTime: 30, servings: 4 },
  { id: 'bf483209-7d3d-4707-95c2-22f27babe3ac', name: 'Costillas de cordero', category: 'comidas', instructions: 'Lleva 4 dientes de ajo', preparationTime: 30, servings: 4 },
  { id: 'c7256abe-91b3-4cd8-83bc-0a4b57a09a1d', name: 'Bocadillo de pan keto con caballa', category: 'almuerzos', instructions: 'Sin instrucciones', preparationTime: 30, servings: 4 },
  { id: 'dd2c5a9b-25e6-4fd0-abb0-6d81b84e100e', name: 'Espinacas salteadas con gambas', category: 'cenas', instructions: 'Sin instrucciones', preparationTime: 30, servings: 4 },
  { id: 'fb36a8c7-8871-4717-9dd9-d2c44d3942ac', name: 'Paletillas de cordero', category: 'comidas', instructions: 'Lleva 4 dientes de ajo, romero, aceite y sal.', preparationTime: 30, servings: 4 }
];

const inventory = [
  { id: '1', name: 'Infusión tomillo', currentQuantity: '0', minimumQuantity: '1', unit: 'paquetes', category: 'bebidas' },
  { id: '2', name: 'Infusión roiboos', currentQuantity: '0', minimumQuantity: '1', unit: 'paquetes', category: 'bebidas' },
  { id: '3', name: 'Jamón', currentQuantity: '0', minimumQuantity: '1', unit: 'paquetes', category: 'carnes' },
  { id: '4', name: 'Salmón fresco (filetes)', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades', category: 'pescado' },
  { id: '5', name: 'Doradas', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades', category: 'pescado' },
  { id: '6', name: 'Lubina', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades', category: 'pescado' },
  { id: '7', name: 'Merluza (lomos)', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades', category: 'pescado' },
  { id: '8', name: 'Pulpo', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades', category: 'pescado' },
  { id: '9', name: 'Ajo', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades', category: 'verduras' },
  { id: '10', name: 'Cebollas', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades', category: 'verduras' },
  { id: '11', name: 'Coliflor', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades', category: 'verduras' },
  { id: '12', name: 'Brócoli', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades', category: 'verduras' },
  { id: '13', name: 'Pimientos', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades', category: 'verduras' },
  { id: '14', name: 'Pimiento italiano', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades', category: 'verduras' },
  { id: '15', name: 'Alcachofas (lata)', currentQuantity: '0', minimumQuantity: '1', unit: 'latas', category: 'verduras' },
  { id: '16', name: 'Alcachofas (frescas)', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades', category: 'verduras' },
  { id: '17', name: 'Sal', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades', category: 'condimentos' },
  { id: '18', name: 'Sal gorda', currentQuantity: '0', minimumQuantity: '1', unit: 'paquetes', category: 'condimentos' },
  { id: '19', name: 'Ajo en polvo', currentQuantity: '0', minimumQuantity: '1', unit: 'tarros', category: 'condimentos' },
  { id: '20', name: 'Champiñones (bandeja)', currentQuantity: '0', minimumQuantity: '1', unit: 'paquetes', category: 'verduras' }
];

let sessions = {};
let activities = [];
let messages = [];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // Rutas de usuarios individuales
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
  
  // Administrador
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
      activities.push({
        id: Date.now(),
        users: data.users,
        title: data.title,
        time: data.time,
        duration: data.duration,
        date: new Date().toDateString()
      });
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
      const item = inventory.find(i => i.id === data.id);
      if (item) {
        item.currentQuantity = Math.max(0, parseInt(item.currentQuantity) + data.change).toString();
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
      messages.push({
        id: Date.now(),
        user: data.user,
        text: data.text,
        time: new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})
      });
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
      messages: messages
    }));
    return;
  }
  
  // Página principal
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
    .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .user { position: absolute; bottom: 0; left: 0; right: 0; padding: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
    .section { display: none; }
    .section.active { display: block; }
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
        <span style="font-size: 12px; font-weight: 500;">${user.name}</span>
        <span>👤</span>
      </div>
    </div>
    <div class="main">
      <div class="top">
        <h1 style="font-size: 28px; font-weight: bold;">¡Hola, ${user.name}! 👋<br><small style="font-size: 14px; color: #6b7280; font-weight: normal;">Domingo, 1 de septiembre de 2025</small><br><small style="font-size: 12px; color: #9ca3af; font-weight: normal; font-style: italic;">"Tu mente es la semilla, tu vida es la cosecha. (Joe Dispenza)"</small></h1>
      </div>
      <div class="content">
        <div id="actividades" class="section active">
          <h2 class="title" style="background: linear-gradient(to right, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Actividades</h2>
          <div class="card">
            <h3>Mis Actividades de Hoy</h3>
            <div id="my-activities">Cargando...</div>
          </div>
        </div>
        <div id="recetas" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #dc2626, #ea580c); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Recetas</h2>
          <div id="recipes-grid" class="grid"></div>
        </div>
        <div id="inventario" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #9333ea, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Inventario</h2>
          <div id="inventory-grid" class="grid"></div>
        </div>
        <div id="comidas" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #f59e0b, #d97706); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Calendario de Comidas</h2>
          <div class="card">
            <p>Próximamente - Planificación semanal de comidas</p>
          </div>
        </div>
        <div id="compras" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Lista de Compra</h2>
          <div class="card">
            <h3>Productos con stock bajo:</h3>
            <div id="shopping-list">Cargando...</div>
          </div>
        </div>
        <div id="mensajes" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #8b5cf6, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Mensajes</h2>
          <div class="card">
            <h3>Chat Familiar</h3>
            <div id="chat-messages" style="background:#f9fafb; padding:16px; border-radius:8px; margin:16px 0; height:200px; overflow-y:auto">
              <p style="color:#6b7280">Cargando mensajes...</p>
            </div>
            <div style="display:flex; gap:8px">
              <input type="text" id="message-input" placeholder="Escribe un mensaje..." style="flex:1; padding:8px; border:1px solid #ddd; border-radius:4px">
              <button onclick="sendMessage()" style="padding:8px 16px; background:#10b981; color:white; border:none; border-radius:4px; cursor:pointer">Enviar</button>
            </div>
          </div>
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
          // Cargar mis actividades
          const myActivities = data.activities.filter(a => a.users.includes(username) && a.date === new Date().toDateString());
          document.getElementById('my-activities').innerHTML = myActivities.length > 0 
            ? myActivities.map(a => '<div style="margin:8px 0; padding:12px; background:#f0f9ff; border-radius:8px; border-left:4px solid #0ea5e9"><strong>' + a.title + '</strong><br>' + a.time + ' (' + a.duration + ' min)</div>').join('')
            : '<p style="color:#6b7280">No tienes actividades para hoy</p>';
          
          // Cargar recetas
          document.getElementById('recipes-grid').innerHTML = data.recipes.map(recipe => 
            '<div class="card"><h3 style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">' + recipe.name + '</h3><p style="color: #6b7280; margin-bottom: 16px;">' + recipe.instructions + '</p><div style="display: flex; gap: 16px; font-size: 14px; color: #6b7280;"><span>⏱️ ' + recipe.preparationTime + ' min</span><span>👥 ' + recipe.servings + ' personas</span></div></div>'
          ).join('');
          
          // Cargar inventario
          document.getElementById('inventory-grid').innerHTML = data.inventory.map(item => {
            const isLow = parseInt(item.currentQuantity) <= parseInt(item.minimumQuantity);
            const color = parseInt(item.currentQuantity) === 0 ? '#dc2626' : isLow ? '#ea580c' : '#059669';
            return '<div class="card"><h3 style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">' + item.name + '</h3><p style="font-size: 18px; font-weight: bold; color: ' + color + '; margin-bottom: 8px;">' + item.currentQuantity + ' ' + item.unit + '</p><p style="font-size: 14px; color: #6b7280;">Mínimo: ' + item.minimumQuantity + ' ' + item.unit + '</p></div>';
          }).join('');
          
          // Lista de compra
          const lowStock = data.inventory.filter(item => parseInt(item.currentQuantity) <= parseInt(item.minimumQuantity));
          document.getElementById('shopping-list').innerHTML = lowStock.length === 0 
            ? '<p style="color: #059669;">✅ Todo el inventario está bien abastecido</p>'
            : lowStock.map(item => '<div style="padding: 8px; margin: 4px 0; background: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px;"><strong>' + item.name + '</strong> - Necesitas ' + item.minimumQuantity + ' ' + item.unit + '</div>').join('');
          
          // Mensajes
          updateChat(data.messages);
        });
    }
    
    function updateChat(messages) {
      const chatDiv = document.getElementById('chat-messages');
      if (messages.length === 0) {
        chatDiv.innerHTML = '<p style="color:#6b7280">No hay mensajes aún</p>';
      } else {
        chatDiv.innerHTML = messages.map(msg => 
          '<div style="margin-bottom:12px; padding:8px; background:white; border-radius:8px"><div style="font-weight:500; color:#374151">' + msg.user + ' <span style="font-size:12px; color:#6b7280; font-weight:normal">' + msg.time + '</span></div><div style="margin-top:4px">' + msg.text + '</div></div>'
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
    
    function showSection(section) {
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
      document.getElementById(section).classList.add('active');
      event.target.classList.add('active');
    }
    
    loadData();
    setInterval(loadData, 5000);
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
    .checkbox-group { display: flex; gap: 15px; flex-wrap: wrap; }
    input, button, select { padding: 8px 12px; margin: 4px; border: 1px solid #ddd; border-radius: 4px; }
    button { background: #10b981; color: white; border: none; cursor: pointer; }
    button:hover { background: #059669; }
    .hidden { display: none; }
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
        <h1 style="font-size: 28px; font-weight: bold;">¡Hola, Administrador! 👋<br><small style="font-size: 14px; color: #6b7280; font-weight: normal;">Domingo, 1 de septiembre de 2025</small><br><small style="font-size: 12px; color: #9ca3af; font-weight: normal; font-style: italic;">"Tu mente es la semilla, tu vida es la cosecha. (Joe Dispenza)"</small></h1>
      </div>
      <div class="content">
        <div id="actividades" class="section active">
          <h2 class="title" style="background: linear-gradient(to right, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Gestión de Actividades</h2>
          
          <div style="margin-bottom: 24px;">
            <button onclick="toggleForm()" style="background: #10b981;">➕ Crear Nueva Actividad</button>
            <button onclick="showCalendar()" style="background: #6b7280; margin-left: 10px;">📅 Ver Calendario</button>
          </div>
          
          <div id="activity-form" class="card hidden">
            <h3>Nueva Actividad</h3>
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
              <input type="text" id="activity-title" placeholder="Ej: Gimnasio, Leer, Violín" style="width: 300px;">
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
            <button onclick="saveActivity()">💾 Guardar Actividad</button>
            <button onclick="toggleForm()" style="background: #6b7280;">Cancelar</button>
          </div>
          
          <div id="calendar-view" class="grid hidden">
            <div class="card">
              <h3>👨 Javier</h3>
              <div id="javier-activities">Sin actividades programadas</div>
            </div>
            <div class="card">
              <h3>👩 Raquel</h3>
              <div id="raquel-activities">Sin actividades programadas</div>
            </div>
            <div class="card">
              <h3>👦 Mario</h3>
              <div id="mario-activities">Sin actividades programadas</div>
            </div>
            <div class="card">
              <h3>👧 Alba</h3>
              <div id="alba-activities">Sin actividades programadas</div>
            </div>
          </div>
        </div>
        
        <div id="recetas" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #dc2626, #ea580c); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Recetas</h2>
          <div id="recipes-grid" class="grid"></div>
        </div>
        
        <div id="inventario" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #9333ea, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Inventario</h2>
          <div id="inventory-grid" class="grid"></div>
        </div>
        
        <div id="comidas" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #f59e0b, #d97706); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Calendario de Comidas</h2>
          <div class="card">
            <p>Próximamente - Planificación semanal de comidas</p>
          </div>
        </div>
        
        <div id="compras" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Lista de Compra</h2>
          <div class="card">
            <h3>Productos con stock bajo:</h3>
            <div id="shopping-list">Cargando...</div>
          </div>
        </div>
        
        <div id="mensajes" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #8b5cf6, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Mensajes</h2>
          <div class="card">
            <h3>Chat Familiar</h3>
            <div id="chat-messages" style="background:#f9fafb; padding:16px; border-radius:8px; margin:16px 0; height:200px; overflow-y:auto">
              <p style="color:#6b7280">Cargando mensajes...</p>
            </div>
            <div style="display:flex; gap:8px">
              <input type="text" id="message-input" placeholder="Escribe un mensaje..." style="flex:1; padding:8px; border:1px solid #ddd; border-radius:4px">
              <button onclick="sendMessage()" style="padding:8px 16px;">Enviar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    function loadData() {
      fetch('/api/data')
        .then(r => r.json())
        .then(data => {
          // Cargar calendario de actividades
          const today = new Date().toDateString();
          const todayActivities = data.activities.filter(a => a.date === today);
          
          ['javier', 'raquel', 'mario', 'alba'].forEach(user => {
            const userActivities = todayActivities.filter(a => a.users.includes(user));
            const container = document.getElementById(user + '-activities');
            container.innerHTML = userActivities.length > 0 
              ? userActivities.map(a => '<div style="margin: 5px 0; padding: 8px; background: #f0f9ff; border-radius: 4px; border-left: 4px solid #0ea5e9;"><strong>' + a.title + '</strong><br>' + a.time + ' (' + a.duration + ' min)</div>').join('')
              : 'Sin actividades programadas';
          });
          
          // Cargar recetas
          document.getElementById('recipes-grid').innerHTML = data.recipes.map(recipe => 
            '<div class="card"><h3 style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">' + recipe.name + '</h3><p style="color: #6b7280; margin-bottom: 16px;">' + recipe.instructions + '</p><div style="display: flex; gap: 16px; font-size: 14px; color: #6b7280;"><span>⏱️ ' + recipe.preparationTime + ' min</span><span>👥 ' + recipe.servings + ' personas</span></div></div>'
          ).join('');
          
          // Cargar inventario
          document.getElementById('inventory-grid').innerHTML = data.inventory.map(item => {
            const isLow = parseInt(item.currentQuantity) <= parseInt(item.minimumQuantity);
            const color = parseInt(item.currentQuantity) === 0 ? '#dc2626' : isLow ? '#ea580c' : '#059669';
            return '<div class="card"><h3 style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">' + item.name + '</h3><p style="font-size: 18px; font-weight: bold; color: ' + color + '; margin-bottom: 8px;">' + item.currentQuantity + ' ' + item.unit + '</p><p style="font-size: 14px; color: #6b7280;">Mínimo: ' + item.minimumQuantity + ' ' + item.unit + '</p><div style="margin-top: 12px;"><button onclick="changeInventory(\\''+item.id+'\\', -1)" style="background: #dc2626;">-</button><button onclick="changeInventory(\\''+item.id+'\\', 1)" style="background: #059669;">+</button></div></div>';
          }).join('');
          
          // Lista de compra
          const lowStock = data.inventory.filter(item => parseInt(item.currentQuantity) <= parseInt(item.minimumQuantity));
          document.getElementById('shopping-list').innerHTML = lowStock.length === 0 
            ? '<p style="color: #059669;">✅ Todo el inventario está bien abastecido</p>'
            : lowStock.map(item => '<div style="padding: 8px; margin: 4px 0; background: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px;"><strong>' + item.name + '</strong> - Necesitas ' + item.minimumQuantity + ' ' + item.unit + '</div>').join('');
          
          // Mensajes
          updateChat(data.messages);
        });
    }
    
    function toggleForm() {
      const form = document.getElementById('activity-form');
      const calendar = document.getElementById('calendar-view');
      form.classList.toggle('hidden');
      calendar.classList.add('hidden');
    }
    
    function showCalendar() {
      const form = document.getElementById('activity-form');
      const calendar = document.getElementById('calendar-view');
      form.classList.add('hidden');
      calendar.classList.toggle('hidden');
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
        toggleForm();
        showCalendar();
        loadData();
      });
    }
    
    function changeInventory(id, change) {
      fetch('/api/inventory', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id, change})
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
          '<div style="margin-bottom:12px; padding:8px; background:white; border-radius:8px"><div style="font-weight:500; color:#374151">' + msg.user + ' <span style="font-size:12px; color:#6b7280; font-weight:normal">' + msg.time + '</span></div><div style="margin-top:4px">' + msg.text + '</div></div>'
        ).join('');
        chatDiv.scrollTop = chatDiv.scrollHeight;
      }
    }
    
    function showSection(section) {
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
      document.getElementById(section).classList.add('active');
      event.target.classList.add('active');
    }
    
    loadData();
    setInterval(loadData, 5000);
  </script>
</body>
</html>`;
}

server.listen(process.env.PORT || 3000);