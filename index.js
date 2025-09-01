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
  { id: '1', name: 'Jamón', category: 'carne', shop: 'Carne internet', unit: 'paquetes', quantity: 0 },
  { id: '2', name: 'Salmón fresco', category: 'pescado', shop: 'Pescadería', unit: 'unidades', quantity: 0 },
  { id: '3', name: 'Ajo', category: 'verdura', shop: 'Del bancal a casa', unit: 'unidades', quantity: 0 },
  { id: '4', name: 'Aceite oliva', category: 'otros', shop: 'Alcampo', unit: 'litros', quantity: 0 }
];

let recipes = [
  { id: '1', name: 'Lubina sobre cama de verduras', category: 'comidas', ingredients: [{'Lubina': 1}, {'Ajo': 2}], time: 0.5, servings: 4 },
  { id: '2', name: 'Salmón en papillote', category: 'comidas', ingredients: [{'Salmón fresco': 1}, {'Ajo': 1}], time: 0.75, servings: 4 }
];

let messages = [];

const server = http.createServer((req, res) => {
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
      } else if (data.action === 'add') {
        inventory.push({
          id: Date.now().toString(),
          name: data.name,
          category: data.category,
          shop: data.shop,
          unit: data.unit,
          quantity: data.quantity
        });
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
  
  if (req.method === 'POST' && parsedUrl.pathname === '/api/meal-plan') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      const key = `${data.week}-${data.day}-${data.meal}`;
      mealPlan[key] = data.content;
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({success: true}));
    });
    return;
  }
  
  if (req.method === 'POST' && parsedUrl.pathname === '/api/complete-meal') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      // Si es una receta, descontar ingredientes
      if (data.recipeId) {
        const recipe = recipes.find(r => r.id === data.recipeId);
        if (recipe) {
          recipe.ingredients.forEach(ing => {
            const ingredientName = Object.keys(ing)[0];
            const quantity = ing[ingredientName];
            const inventoryItem = inventory.find(i => i.name === ingredientName);
            if (inventoryItem) {
              inventoryItem.quantity = Math.max(0, inventoryItem.quantity - quantity);
            }
          });
        }
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
      messages: messages
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
    .user { position: absolute; bottom: 0; left: 0; right: 0; padding: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
    .section { display: none; }
    .section.active { display: block; }
    .activity-item { background: #f0f9ff; padding: 12px; margin: 8px 0; border-radius: 8px; border-left: 4px solid #0ea5e9; display: flex; justify-content: space-between; align-items: center; }
    .activity-item.completed { background: #f0fdf4; border-left-color: #22c55e; }
    .calendar-view { display: flex; gap: 10px; margin: 20px 0; }
    .calendar-view button { padding: 8px 16px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px; }
    .calendar-view button.active { background: #10b981; color: white; }
    .meal-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .meal-table th, .meal-table td { border: 1px solid #ddd; padding: 12px; text-align: center; }
    .meal-table th { background: #f9fafb; font-weight: bold; }
    .meal-table td { min-height: 60px; vertical-align: top; cursor: pointer; }
    .meal-table td:hover { background: #f0f9ff; }
    .meal-table .meal-label { background: #e5e7eb; font-weight: bold; text-align: left; }
    input, button, select { padding: 8px 12px; margin: 4px; border: 1px solid #ddd; border-radius: 4px; }
    button { background: #10b981; color: white; border: none; cursor: pointer; }
    button:hover { background: #059669; }
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
      </div>
      <div class="user">
        <span style="font-size: 12px; font-weight: 500;">${user.name}</span>
        <span>👤</span>
      </div>
    </div>
    <div class="main">
      <div class="top">
        <h1 style="font-size: 28px; font-weight: bold;">¡Hola, ${user.name}! 👋</h1>
      </div>
      <div class="content">
        <div id="actividades" class="section active">
          <h2 class="title" style="background: linear-gradient(to right, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Mis Actividades</h2>
          
          <div class="calendar-view">
            <button class="active" onclick="setView('daily')">Vista Diaria</button>
            <button onclick="setView('weekly')">Vista Semanal</button>
          </div>
          
          <div class="card">
            <h3>Actividades de Hoy</h3>
            <div id="my-activities">Cargando...</div>
          </div>
        </div>
        
        <div id="comidas" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #f59e0b, #d97706); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Planificación de Comidas</h2>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <button onclick="changeWeek(-1)">← Semana Anterior</button>
            <h3 id="current-week">Semana del 1 al 7 de Septiembre 2025</h3>
            <button onclick="changeWeek(1)">Semana Siguiente →</button>
          </div>
          
          <table class="meal-table" id="meal-table">
            <thead>
              <tr>
                <th></th>
                <th>Lunes</th>
                <th>Martes</th>
                <th>Miércoles</th>
                <th>Jueves</th>
                <th>Viernes</th>
                <th>Sábado</th>
                <th>Domingo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="meal-label">Desayuno Alba y Mario</td>
                <td onclick="markMealDone('desayuno-alba-mario', 'lunes')"></td>
                <td onclick="markMealDone('desayuno-alba-mario', 'martes')"></td>
                <td onclick="markMealDone('desayuno-alba-mario', 'miercoles')"></td>
                <td onclick="markMealDone('desayuno-alba-mario', 'jueves')"></td>
                <td onclick="markMealDone('desayuno-alba-mario', 'viernes')"></td>
                <td onclick="markMealDone('desayuno-alba-mario', 'sabado')"></td>
                <td onclick="markMealDone('desayuno-alba-mario', 'domingo')"></td>
              </tr>
              <tr>
                <td class="meal-label">Desayuno Raquel y Javier</td>
                <td onclick="markMealDone('desayuno-raquel-javier', 'lunes')"></td>
                <td onclick="markMealDone('desayuno-raquel-javier', 'martes')"></td>
                <td onclick="markMealDone('desayuno-raquel-javier', 'miercoles')"></td>
                <td onclick="markMealDone('desayuno-raquel-javier', 'jueves')"></td>
                <td onclick="markMealDone('desayuno-raquel-javier', 'viernes')"></td>
                <td onclick="markMealDone('desayuno-raquel-javier', 'sabado')"></td>
                <td onclick="markMealDone('desayuno-raquel-javier', 'domingo')"></td>
              </tr>
              <tr>
                <td class="meal-label">Comida</td>
                <td onclick="markMealDone('comida', 'lunes')"></td>
                <td onclick="markMealDone('comida', 'martes')"></td>
                <td onclick="markMealDone('comida', 'miercoles')"></td>
                <td onclick="markMealDone('comida', 'jueves')"></td>
                <td onclick="markMealDone('comida', 'viernes')"></td>
                <td onclick="markMealDone('comida', 'sabado')"></td>
                <td onclick="markMealDone('comida', 'domingo')"></td>
              </tr>
              <tr>
                <td class="meal-label">Cena</td>
                <td onclick="markMealDone('cena', 'lunes')"></td>
                <td onclick="markMealDone('cena', 'martes')"></td>
                <td onclick="markMealDone('cena', 'miercoles')"></td>
                <td onclick="markMealDone('cena', 'jueves')"></td>
                <td onclick="markMealDone('cena', 'viernes')"></td>
                <td onclick="markMealDone('cena', 'sabado')"></td>
                <td onclick="markMealDone('cena', 'domingo')"></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div id="recetas" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #dc2626, #ea580c); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Recetas</h2>
          
          <div style="margin-bottom: 20px;">
            <button class="active" onclick="showRecipeCategory('comidas')">Comidas</button>
            <button onclick="showRecipeCategory('cenas')">Cenas</button>
          </div>
          
          <div id="recipes-grid" class="grid"></div>
        </div>
        
        <div id="inventario" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #9333ea, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Inventario</h2>
          <div id="inventory-grid" class="grid"></div>
        </div>
        
        <div id="compras" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Lista de la Compra</h2>
          <div id="shopping-lists"></div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const username = '${username}';
    let currentWeek = 1;
    let currentView = 'daily';
    let currentRecipeCategory = 'comidas';
    
    function loadData() {
      fetch('/api/data')
        .then(r => r.json())
        .then(data => {
          loadActivities(data.activities);
          loadRecipes(data.recipes);
          loadInventory(data.inventory);
          loadShoppingList(data.inventory);
          loadMealPlan(data.mealPlan);
        });
    }
    
    function loadActivities(activities) {
      const today = new Date().toDateString();
      const myActivities = activities.filter(a => a.user === username && a.date === today);
      
      document.getElementById('my-activities').innerHTML = myActivities.length > 0 
        ? myActivities.map(a => 
            '<div class="activity-item' + (a.completed ? ' completed' : '') + '">' +
            '<div><strong>' + a.title + '</strong><br>' + a.time + ' (' + a.duration + ' min)</div>' +
            '<button onclick="toggleActivity(' + a.id + ', ' + !a.completed + ')">' + (a.completed ? '✓ Hecho' : 'Marcar') + '</button>' +
            '</div>'
          ).join('')
        : '<p style="color:#6b7280">No tienes actividades para hoy</p>';
    }
    
    function loadRecipes(recipes) {
      const filteredRecipes = recipes.filter(r => r.category === currentRecipeCategory);
      document.getElementById('recipes-grid').innerHTML = filteredRecipes.map(recipe => 
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
        '<button onclick="changeInventory(\\''+item.id+'\\', -1)" style="background: #dc2626;">-</button>' +
        '<button onclick="changeInventory(\\''+item.id+'\\', 1)" style="background: #059669;">+</button>' +
        '</div></div>'
      ).join('');
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
    
    function loadMealPlan(mealPlan) {
      // Cargar plan de comidas en la tabla
    }
    
    function toggleActivity(id, completed) {
      fetch('/api/complete-activity', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id, completed})
      }).then(() => loadData());
    }
    
    function changeInventory(id, change) {
      fetch('/api/inventory', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'update', id, change})
      }).then(() => loadData());
    }
    
    function setView(view) {
      currentView = view;
      document.querySelectorAll('.calendar-view button').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');
    }
    
    function changeWeek(direction) {
      currentWeek += direction;
      document.getElementById('current-week').textContent = 'Semana ' + currentWeek + ' de Septiembre 2025';
    }
    
    function showRecipeCategory(category) {
      currentRecipeCategory = category;
      document.querySelectorAll('#recetas button').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');
      loadData();
    }
    
    function markMealDone(meal, day) {
      if (confirm('¿Marcar como hecho?')) {
        fetch('/api/complete-meal', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({meal, day, week: currentWeek})
        }).then(() => {
          event.target.style.background = '#f0fdf4';
          event.target.innerHTML = '✓ Hecho';
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
    .user { position: absolute; bottom: 0; left: 0; right: 0; padding: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
    .section { display: none; }
    .section.active { display: block; }
    .form-group { margin: 15px 0; }
    .checkbox-group { display: flex; gap: 15px; flex-wrap: wrap; }
    input, button, select, textarea { padding: 8px 12px; margin: 4px; border: 1px solid #ddd; border-radius: 4px; }
    button { background: #10b981; color: white; border: none; cursor: pointer; }
    button:hover { background: #059669; }
    .hidden { display: none; }
    .meal-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .meal-table th, .meal-table td { border: 1px solid #ddd; padding: 12px; text-align: center; }
    .meal-table th { background: #f9fafb; font-weight: bold; }
    .meal-table td { min-height: 60px; vertical-align: top; cursor: pointer; }
    .meal-table td:hover { background: #f0f9ff; }
    .meal-table .meal-label { background: #e5e7eb; font-weight: bold; text-align: left; }
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
      </div>
      <div class="user">
        <span style="font-size: 12px; font-weight: 500;">Administrador</span>
        <span>🔧</span>
      </div>
    </div>
    <div class="main">
      <div class="top">
        <h1 style="font-size: 28px; font-weight: bold;">¡Hola, Administrador! 👋</h1>
      </div>
      <div class="content">
        <div id="actividades" class="section active">
          <h2 class="title" style="background: linear-gradient(to right, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Gestión de Actividades</h2>
          
          <div class="card">
            <h3>Crear Nueva Actividad</h3>
            <div class="form-group">
              <label>Usuario:</label>
              <select id="activity-user">
                <option value="javier">Javier</option>
                <option value="raquel">Raquel</option>
                <option value="mario">Mario</option>
                <option value="alba">Alba</option>
              </select>
            </div>
            <div class="form-group">
              <label>Actividad:</label>
              <input type="text" id="activity-title" placeholder="Ej: Gimnasio, Leer, Violín">
            </div>
            <div class="form-group">
              <label>Hora:</label>
              <input type="time" id="activity-time">
            </div>
            <div class="form-group">
              <label>Duración (minutos):</label>
              <input type="number" id="activity-duration" value="30" min="1">
            </div>
            <div class="form-group">
              <label>Repetir:</label>
              <select id="activity-repeat">
                <option value="none">No repetir</option>
                <option value="daily">Todos los días</option>
                <option value="custom">Días específicos</option>
              </select>
            </div>
            <div class="form-group" id="repeat-days" style="display: none;">
              <label>Días de la semana:</label>
              <div class="checkbox-group">
                <label><input type="checkbox" value="1"> Lunes</label>
                <label><input type="checkbox" value="2"> Martes</label>
                <label><input type="checkbox" value="3"> Miércoles</label>
                <label><input type="checkbox" value="4"> Jueves</label>
                <label><input type="checkbox" value="5"> Viernes</label>
                <label><input type="checkbox" value="6"> Sábado</label>
                <label><input type="checkbox" value="0"> Domingo</label>
              </div>
            </div>
            <button onclick="saveActivity()">💾 Crear Actividad</button>
          </div>
          
          <div class="grid" id="activities-overview">
            <div class="card">
              <h3>👨 Javier</h3>
              <div id="javier-activities">Cargando...</div>
            </div>
            <div class="card">
              <h3>👩 Raquel</h3>
              <div id="raquel-activities">Cargando...</div>
            </div>
            <div class="card">
              <h3>👦 Mario</h3>
              <div id="mario-activities">Cargando...</div>
            </div>
            <div class="card">
              <h3>👧 Alba</h3>
              <div id="alba-activities">Cargando...</div>
            </div>
          </div>
        </div>
        
        <div id="comidas" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #f59e0b, #d97706); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Planificación de Comidas</h2>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <button onclick="changeWeek(-1)">← Semana Anterior</button>
            <h3 id="current-week">Semana del 1 al 7 de Septiembre 2025</h3>
            <button onclick="changeWeek(1)">Semana Siguiente →</button>
          </div>
          
          <table class="meal-table" id="admin-meal-table">
            <thead>
              <tr>
                <th></th>
                <th>Lunes</th>
                <th>Martes</th>
                <th>Miércoles</th>
                <th>Jueves</th>
                <th>Viernes</th>
                <th>Sábado</th>
                <th>Domingo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="meal-label">Desayuno Alba y Mario</td>
                <td onclick="editMeal('desayuno-alba-mario', 'lunes')"></td>
                <td onclick="editMeal('desayuno-alba-mario', 'martes')"></td>
                <td onclick="editMeal('desayuno-alba-mario', 'miercoles')"></td>
                <td onclick="editMeal('desayuno-alba-mario', 'jueves')"></td>
                <td onclick="editMeal('desayuno-alba-mario', 'viernes')"></td>
                <td onclick="editMeal('desayuno-alba-mario', 'sabado')"></td>
                <td onclick="editMeal('desayuno-alba-mario', 'domingo')"></td>
              </tr>
              <tr>
                <td class="meal-label">Desayuno Raquel y Javier</td>
                <td onclick="editMeal('desayuno-raquel-javier', 'lunes')"></td>
                <td onclick="editMeal('desayuno-raquel-javier', 'martes')"></td>
                <td onclick="editMeal('desayuno-raquel-javier', 'miercoles')"></td>
                <td onclick="editMeal('desayuno-raquel-javier', 'jueves')"></td>
                <td onclick="editMeal('desayuno-raquel-javier', 'viernes')"></td>
                <td onclick="editMeal('desayuno-raquel-javier', 'sabado')"></td>
                <td onclick="editMeal('desayuno-raquel-javier', 'domingo')"></td>
              </tr>
              <tr>
                <td class="meal-label">Comida</td>
                <td onclick="editMeal('comida', 'lunes')"></td>
                <td onclick="editMeal('comida', 'martes')"></td>
                <td onclick="editMeal('comida', 'miercoles')"></td>
                <td onclick="editMeal('comida', 'jueves')"></td>
                <td onclick="editMeal('comida', 'viernes')"></td>
                <td onclick="editMeal('comida', 'sabado')"></td>
                <td onclick="editMeal('comida', 'domingo')"></td>
              </tr>
              <tr>
                <td class="meal-label">Cena</td>
                <td onclick="editMeal('cena', 'lunes')"></td>
                <td onclick="editMeal('cena', 'martes')"></td>
                <td onclick="editMeal('cena', 'miercoles')"></td>
                <td onclick="editMeal('cena', 'jueves')"></td>
                <td onclick="editMeal('cena', 'viernes')"></td>
                <td onclick="editMeal('cena', 'sabado')"></td>
                <td onclick="editMeal('cena', 'domingo')"></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div id="recetas" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #dc2626, #ea580c); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Gestión de Recetas</h2>
          
          <div class="card">
            <h3>Añadir Nueva Receta</h3>
            <div class="form-group">
              <label>Nombre:</label>
              <input type="text" id="recipe-name" placeholder="Nombre de la receta">
            </div>
            <div class="form-group">
              <label>Categoría:</label>
              <select id="recipe-category">
                <option value="comidas">Comidas</option>
                <option value="cenas">Cenas</option>
              </select>
            </div>
            <div class="form-group">
              <label>Tiempo (horas):</label>
              <input type="number" id="recipe-time" step="0.25" value="0.5">
            </div>
            <div class="form-group">
              <label>Porciones:</label>
              <input type="number" id="recipe-servings" value="4">
            </div>
            <div class="form-group">
              <label>Ingredientes:</label>
              <div id="ingredients-list">
                <div style="display: flex; gap: 10px; margin: 5px 0;">
                  <select id="ingredient-0">
                    <option value="">Seleccionar ingrediente</option>
                  </select>
                  <input type="number" id="quantity-0" placeholder="Cantidad" min="1" value="1">
                  <button onclick="addIngredient()" style="background: #059669;">+</button>
                </div>
              </div>
            </div>
            <button onclick="saveRecipe()">💾 Guardar Receta</button>
          </div>
          
          <div style="margin-top: 20px;">
            <button class="active" onclick="showRecipeCategory('comidas')">Comidas</button>
            <button onclick="showRecipeCategory('cenas')">Cenas</button>
          </div>
          
          <div id="recipes-grid" class="grid"></div>
        </div>
        
        <div id="inventario" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #9333ea, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Gestión de Inventario</h2>
          
          <div class="card">
            <h3>Añadir Nuevo Producto</h3>
            <div class="form-group">
              <label>Nombre:</label>
              <input type="text" id="product-name" placeholder="Nombre del producto">
            </div>
            <div class="form-group">
              <label>Categoría:</label>
              <select id="product-category">
                <option value="carne">Carne</option>
                <option value="pescado">Pescado</option>
                <option value="verdura">Verdura</option>
                <option value="fruta">Fruta</option>
                <option value="frutos secos">Frutos secos</option>
                <option value="productos de limpieza/hogar">Productos de limpieza/hogar</option>
                <option value="otros">Otros</option>
              </select>
            </div>
            <div class="form-group">
              <label>Se compra en:</label>
              <select id="product-shop">
                <option value="Carne internet">Carne internet</option>
                <option value="Pescadería">Pescadería</option>
                <option value="Del bancal a casa">Del bancal a casa</option>
                <option value="Alcampo">Alcampo</option>
                <option value="Internet">Internet</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
            <div class="form-group">
              <label>Medida:</label>
              <select id="product-unit">
                <option value="unidades">Unidades</option>
                <option value="litros">Litros</option>
                <option value="botes">Botes</option>
                <option value="tarros">Tarros</option>
                <option value="cartones">Cartones</option>
                <option value="latas">Latas</option>
              </select>
            </div>
            <div class="form-group">
              <label>Cantidad inicial:</label>
              <input type="number" id="product-quantity" value="0" min="0">
            </div>
            <button onclick="addProduct()">💾 Añadir Producto</button>
          </div>
          
          <div id="inventory-grid" class="grid"></div>
        </div>
        
        <div id="compras" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Lista de la Compra</h2>
          <div id="shopping-lists"></div>
        </div>
      </div>
    </div>
  </div>

  <script>
    let currentWeek = 1;
    let currentRecipeCategory = 'comidas';
    let ingredientCount = 1;
    
    function loadData() {
      fetch('/api/data')
        .then(r => r.json())
        .then(data => {
          loadActivitiesOverview(data.activities);
          loadRecipes(data.recipes);
          loadInventory(data.inventory);
          loadShoppingList(data.inventory);
          loadIngredientOptions(data.inventory);
        });
    }
    
    function loadActivitiesOverview(activities) {
      const today = new Date().toDateString();
      ['javier', 'raquel', 'mario', 'alba'].forEach(user => {
        const userActivities = activities.filter(a => a.user === user && a.date === today);
        document.getElementById(user + '-activities').innerHTML = userActivities.length > 0 
          ? userActivities.map(a => '<div style="margin: 5px 0; padding: 8px; background: ' + (a.completed ? '#f0fdf4' : '#f0f9ff') + '; border-radius: 4px;"><strong>' + a.title + '</strong><br>' + a.time + ' (' + a.duration + ' min) ' + (a.completed ? '✓' : '') + '</div>').join('')
          : 'Sin actividades para hoy';
      });
    }
    
    function loadRecipes(recipes) {
      const filteredRecipes = recipes.filter(r => r.category === currentRecipeCategory);
      document.getElementById('recipes-grid').innerHTML = filteredRecipes.map(recipe => 
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
        '<p><strong>Categoría:</strong> ' + item.category + '</p>' +
        '<p><strong>Se compra en:</strong> ' + item.shop + '</p>' +
        '<p style="font-size: 18px; font-weight: bold;">' + item.quantity + ' ' + item.unit + '</p>' +
        '<div style="margin-top: 12px;">' +
        '<button onclick="changeInventory(\\''+item.id+'\\', -1)" style="background: #dc2626;">-</button>' +
        '<button onclick="changeInventory(\\''+item.id+'\\', 1)" style="background: #059669;">+</button>' +
        '</div></div>'
      ).join('');
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
    
    function loadIngredientOptions(inventory) {
      const options = inventory.map(item => '<option value="' + item.name + '">' + item.name + '</option>').join('');
      document.getElementById('ingredient-0').innerHTML = '<option value="">Seleccionar ingrediente</option>' + options;
    }
    
    function saveActivity() {
      const user = document.getElementById('activity-user').value;
      const title = document.getElementById('activity-title').value.trim();
      const time = document.getElementById('activity-time').value;
      const duration = document.getElementById('activity-duration').value;
      const repeat = document.getElementById('activity-repeat').value;
      const repeatDays = repeat === 'custom' ? Array.from(document.querySelectorAll('#repeat-days input:checked')).map(cb => cb.value) : [];
      
      if (!title || !time) {
        alert('❌ Completa todos los campos');
        return;
      }
      
      fetch('/api/activity', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user, title, time, duration, repeat, repeatDays, date: new Date().toDateString()})
      }).then(() => {
        alert('✅ Actividad creada para ' + user);
        document.getElementById('activity-title').value = '';
        document.getElementById('activity-time').value = '';
        document.getElementById('activity-duration').value = '30';
        document.getElementById('activity-repeat').value = 'none';
        loadData();
      });
    }
    
    function addProduct() {
      const name = document.getElementById('product-name').value.trim();
      const category = document.getElementById('product-category').value;
      const shop = document.getElementById('product-shop').value;
      const unit = document.getElementById('product-unit').value;
      const quantity = parseInt(document.getElementById('product-quantity').value);
      
      if (!name) {
        alert('❌ Introduce el nombre del producto');
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
    
    function saveRecipe() {
      const name = document.getElementById('recipe-name').value.trim();
      const category = document.getElementById('recipe-category').value;
      const time = parseFloat(document.getElementById('recipe-time').value);
      const servings = parseInt(document.getElementById('recipe-servings').value);
      
      const ingredients = [];
      for (let i = 0; i < ingredientCount; i++) {
        const ingredientSelect = document.getElementById('ingredient-' + i);
        const quantityInput = document.getElementById('quantity-' + i);
        if (ingredientSelect && quantityInput && ingredientSelect.value && quantityInput.value) {
          const ingredient = {};
          ingredient[ingredientSelect.value] = parseInt(quantityInput.value);
          ingredients.push(ingredient);
        }
      }
      
      if (!name || ingredients.length === 0) {
        alert('❌ Completa todos los campos');
        return;
      }
      
      fetch('/api/recipe', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, category, ingredients, time, servings})
      }).then(() => {
        alert('✅ Receta guardada');
        document.getElementById('recipe-name').value = '';
        document.getElementById('recipe-time').value = '0.5';
        document.getElementById('recipe-servings').value = '4';
        loadData();
      });
    }
    
    function addIngredient() {
      const container = document.getElementById('ingredients-list');
      const newDiv = document.createElement('div');
      newDiv.style.cssText = 'display: flex; gap: 10px; margin: 5px 0;';
      newDiv.innerHTML = '<select id="ingredient-' + ingredientCount + '"><option value="">Seleccionar ingrediente</option></select><input type="number" id="quantity-' + ingredientCount + '" placeholder="Cantidad" min="1" value="1"><button onclick="removeIngredient(this)" style="background: #dc2626;">-</button>';
      container.appendChild(newDiv);
      
      // Cargar opciones
      fetch('/api/data').then(r => r.json()).then(data => {
        const options = data.inventory.map(item => '<option value="' + item.name + '">' + item.name + '</option>').join('');
        document.getElementById('ingredient-' + ingredientCount).innerHTML = '<option value="">Seleccionar ingrediente</option>' + options;
      });
      
      ingredientCount++;
    }
    
    function removeIngredient(button) {
      button.parentElement.remove();
    }
    
    function changeInventory(id, change) {
      fetch('/api/inventory', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'update', id, change})
      }).then(() => loadData());
    }
    
    function changeWeek(direction) {
      currentWeek += direction;
      document.getElementById('current-week').textContent = 'Semana ' + currentWeek + ' de Septiembre 2025';
    }
    
    function showRecipeCategory(category) {
      currentRecipeCategory = category;
      document.querySelectorAll('#recetas button').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');
      loadData();
    }
    
    function editMeal(meal, day) {
      const content = prompt('Introduce el contenido de la comida (o nombre de receta):');
      if (content) {
        fetch('/api/meal-plan', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({week: currentWeek, day, meal, content})
        }).then(() => {
          event.target.innerHTML = content;
        });
      }
    }
    
    function showSection(section) {
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
      document.getElementById(section).classList.add('active');
      event.target.classList.add('active');
    }
    
    // Mostrar/ocultar días de repetición
    document.getElementById('activity-repeat').addEventListener('change', function() {
      document.getElementById('repeat-days').style.display = this.value === 'custom' ? 'block' : 'none';
    });
    
    loadData();
    setInterval(loadData, 10000);
  </script>
</body>
</html>`;
}

server.listen(process.env.PORT || 3000);