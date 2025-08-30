require('dotenv').config();
const http = require('http');
const url = require('url');

const USERS = {
  javier: { id: 'javier', name: 'Javier', token: 'jav_abc123xyz789def456', allowedIPs: [] },
  raquel: { id: 'raquel', name: 'Raquel', token: 'raq_uvw012rst345ghi678', allowedIPs: [] },
  mario: { id: 'mario', name: 'Mario', token: 'mar_jkl901mno234pqr567', allowedIPs: [] },
  alba: { id: 'alba', name: 'Alba', token: 'alb_stu890vwx123yzb456', allowedIPs: [] },
  javi_administrador: { id: 'javi_administrador', name: 'Administrador', token: 'adm_cde789fgh012ijl345', allowedIPs: [] }
};

// Sistema de IPs desactivado por ahora

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // Manejar offset de semana
  if (parsedUrl.query.weekOffset) {
    currentWeekOffset = parseInt(parsedUrl.query.weekOffset) || 0;
  }
  
  // API para mensajes
  if (req.method === 'POST' && parsedUrl.pathname === '/api/send-message') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      const { type, message, from, to } = data;
      
      const newMessage = {
        id: messageIdCounter++,
        message: message.trim(),
        timestamp: getTimestamp(),
        user: from,
        from: from
      };
      
      if (type === 'group') {
        groupMessages.push(newMessage);
        addNotification(from, null, 'general');
      } else if (type === 'admin') {
        adminMessages.push(newMessage);
        // Solo notificar al administrador
        if (unreadMessages['javi_administrador']) {
          unreadMessages['javi_administrador'].total++;
        }
      } else if (type === 'private') {
        const chatKey = [from, to].sort().join('-');
        if (!privateChats[chatKey]) privateChats[chatKey] = [];
        newMessage.to = to;
        privateChats[chatKey].push(newMessage);
        addNotification(from, to, 'private');
      }
      
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ success: true, message: newMessage }));
    });
    return;
  }
  
  if (req.method === 'POST' && parsedUrl.pathname === '/api/delete-message') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      const { type, messageId, chatKey } = data;
      
      if (type === 'group') {
        const index = groupMessages.findIndex(m => m.id == messageId);
        if (index !== -1) groupMessages.splice(index, 1);
      } else if (type === 'admin') {
        const index = adminMessages.findIndex(m => m.id == messageId);
        if (index !== -1) adminMessages.splice(index, 1);
      } else if (type === 'private' && chatKey) {
        if (privateChats[chatKey]) {
          const index = privateChats[chatKey].findIndex(m => m.id == messageId);
          if (index !== -1) privateChats[chatKey].splice(index, 1);
        }
      }
      
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }
  
  if (req.method === 'GET' && parsedUrl.pathname === '/api/messages') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ 
      groupMessages, 
      adminMessages, 
      privateChats,
      unreadMessages
    }));
    return;
  }
  
  if (req.method === 'POST' && parsedUrl.pathname === '/api/mark-read') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      const { userId } = data;
      if (unreadMessages[userId] !== undefined) {
        unreadMessages[userId].total = 0;
        unreadMessages[userId].chats = {};
      }
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }
  
  // API para cambiar cantidad de inventario
  if (req.method === 'POST' && parsedUrl.pathname === '/api/change-quantity') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      const { productId, change } = data;
      
      // Buscar producto en inventario
      let product = null;
      for (const products of Object.values(inventoryByCategory)) {
        const found = products.find(p => p.id == productId);
        if (found) {
          product = found;
          break;
        }
      }
      
      if (product) {
        const newQuantity = Math.max(0, product.quantity + change);
        product.quantity = newQuantity;
        
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ success: true, newQuantity }));
      } else {
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ success: false }));
      }
    });
    return;
  }
  
  // API para añadir actividad
  if (req.method === 'POST' && parsedUrl.pathname === '/api/add-activity') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      const { users, title, time, duration, repeat, startDate, endDate, customDays } = data;
      
      let maxId = 0;
      Object.values(activities).forEach(userActivities => {
        userActivities.forEach(activity => {
          if (activity.id > maxId) maxId = activity.id;
        });
      });
      
      users.forEach(userId => {
        if (!activities[userId]) activities[userId] = [];
        activities[userId].push({
          id: ++maxId,
          title,
          time,
          duration: parseInt(duration),
          completed: false,
          repeat,
          startDate,
          endDate: endDate || null,
          customDays: customDays || null,
          streak: 0,
          lastCompleted: null,
          medals: { bronze: false, silver: false, gold: false },
          completedDates: []
        });
      });
      
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }
  
  // API para actualizar actividad
  if (req.method === 'POST' && parsedUrl.pathname === '/api/update-activity') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      const { id, users, title, time, duration, repeat, startDate, endDate, customDays } = data;
      
      // Eliminar actividad de todos los usuarios
      Object.keys(activities).forEach(userId => {
        activities[userId] = activities[userId].filter(a => a.id != id);
      });
      
      // Añadir actividad actualizada a los usuarios seleccionados
      users.forEach(userId => {
        if (!activities[userId]) activities[userId] = [];
        activities[userId].push({
          id: parseInt(id),
          title,
          time,
          duration: parseInt(duration),
          completed: false,
          repeat,
          startDate,
          endDate: endDate || null,
          customDays: customDays || null,
          streak: 0,
          lastCompleted: null,
          medals: { bronze: false, silver: false, gold: false },
          completedDates: []
        });
      });
      
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }
  
  // API para eliminar actividad
  if (req.method === 'POST' && parsedUrl.pathname === '/api/delete-activity') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      const { id, deleteType, specificDate } = data;
      
      if (deleteType === 'single' && specificDate) {
        // Eliminar solo una instancia específica
        Object.keys(activities).forEach(userId => {
          const activity = activities[userId].find(a => a.id == id);
          if (activity) {
            if (!activity.excludedDates) activity.excludedDates = [];
            if (!activity.excludedDates.includes(specificDate)) {
              activity.excludedDates.push(specificDate);
            }
          }
        });
      } else {
        // Eliminar toda la serie
        Object.keys(activities).forEach(userId => {
          activities[userId] = activities[userId].filter(a => a.id != id);
        });
      }
      
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }
  
  // API para toggle activity por fecha
  if (req.method === 'POST' && parsedUrl.pathname === '/api/toggle-activity-date') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      const { activityId, userId, date } = data;
      
      const userActivities = activities[userId];
      if (userActivities) {
        const activity = userActivities.find(a => a.id == activityId);
        if (activity) {
          if (!activity.completedDates) activity.completedDates = [];
          
          const dateIndex = activity.completedDates.indexOf(date);
          if (dateIndex > -1) {
            activity.completedDates.splice(dateIndex, 1);
          } else {
            activity.completedDates.push(date);
          }
          
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({ success: true }));
          return;
        }
      }
      
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ success: false }));
    });
    return;
  }
  
  // API para toggle activity
  if (req.method === 'POST' && parsedUrl.pathname === '/api/toggle-activity') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      const { activityId, userId } = data;
      
      const userActivities = activities[userId];
      if (userActivities) {
        const activity = userActivities.find(a => a.id == activityId);
        if (activity && canCompleteActivity(activity)) {
          activity.completed = !activity.completed;
          updateActivityStreak(activity, activity.completed, userId);
          
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({ success: true, activity }));
          return;
        }
      }
      
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ success: false }));
    });
    return;
  }
  
  // API para toggle meal status
  if (req.method === 'POST' && parsedUrl.pathname === '/api/toggle-meal') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      const { weekKey, mealId, day } = data;
      
      if (!mealStatus[weekKey]) {
        mealStatus[weekKey] = {};
      }
      if (!mealStatus[weekKey][mealId]) {
        mealStatus[weekKey][mealId] = {};
      }
      
      // Toggle status
      mealStatus[weekKey][mealId][day] = !mealStatus[weekKey][mealId][day];
      
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ success: true, completed: mealStatus[weekKey][mealId][day] }));
    });
    return;
  }
  
  // Acceso directo por token
  const pathMatch = parsedUrl.pathname.match(/^\/(javier|raquel|mario|alba|admin)\/([a-zA-Z0-9_]+)$/);
  if (pathMatch) {
    const [, userType, token] = pathMatch;
    
    const userId = userType === 'admin' ? 'javi_administrador' : userType;
    const user = USERS[userId];
    
    if (user && user.token === `${userType === 'admin' ? 'adm' : userId.substring(0,3)}_${token}`) {
      
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.end(getMainHTML(user, parsedUrl.query.section || 'actividades'));
      return;
    } else {
      res.writeHead(404, {'Content-Type': 'text/html'});
      res.end('<h1>Enlace no válido</h1>');
      return;
    }
  }
  
  // Página de enlaces de acceso
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  res.end(`<!DOCTYPE html>
<html>
<head>
  <title>Organización Familiar - Acceso</title>
  <style>
    * { font-family: Verdana, Geneva, sans-serif; margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div style="min-height: 100vh; background: linear-gradient(135deg, #fbbf24, #f59e0b, #dbeafe, #f3e8ff); display: flex; align-items: center; justify-content: center; padding: 16px;">
    <div style="background: rgba(255,255,255,0.95); border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 600px; width: 100%; backdrop-filter: blur(10px);">
      <h1 style="font-size: 32px; font-weight: bold; text-align: center; margin-bottom: 24px; background: linear-gradient(to right, #3b82f6, #9333ea); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Organización Familiar</h1>
      
      <div style="background: rgba(59, 130, 246, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 32px; border-left: 4px solid #3b82f6;">
        <p style="font-style: italic; text-align: center; color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 8px;">"Si vives con gratitud, estás reprogramando tu cerebro para la abundancia."</p>
        <p style="text-align: center; color: #6b7280; font-size: 14px;">— Joe Dispenza</p>
      </div>
      
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="font-size: 20px; margin-bottom: 16px; color: #374151;">Enlaces de Acceso Directo</h2>
        <p style="color: #6b7280; margin-bottom: 20px;">Guarda tu enlace personal en favoritos o como acceso directo:</p>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <strong style="color: #1e40af;">Javier:</strong><br>
          <code style="font-size: 12px; color: #6b7280; word-break: break-all;">https://organizacion-familiar-k6w9uxwy5-jamusanchez-bits-projects.vercel.app/javier/abc123xyz789def456</code>
        </div>
        <div style="padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #ec4899;">
          <strong style="color: #be185d;">Raquel:</strong><br>
          <code style="font-size: 12px; color: #6b7280; word-break: break-all;">https://organizacion-familiar-k6w9uxwy5-jamusanchez-bits-projects.vercel.app/raquel/uvw012rst345ghi678</code>
        </div>
        <div style="padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #10b981;">
          <strong style="color: #047857;">Mario:</strong><br>
          <code style="font-size: 12px; color: #6b7280; word-break: break-all;">https://organizacion-familiar-k6w9uxwy5-jamusanchez-bits-projects.vercel.app/mario/jkl901mno234pqr567</code>
        </div>
        <div style="padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <strong style="color: #d97706;">Alba:</strong><br>
          <code style="font-size: 12px; color: #6b7280; word-break: break-all;">https://organizacion-familiar-k6w9uxwy5-jamusanchez-bits-projects.vercel.app/alba/stu890vwx123yzb456</code>
        </div>
        <div style="padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #8b5cf6;">
          <strong style="color: #7c3aed;">Administrador:</strong><br>
          <code style="font-size: 12px; color: #6b7280; word-break: break-all;">https://organizacion-familiar-k6w9uxwy5-jamusanchez-bits-projects.vercel.app/admin/cde789fgh012ijl345</code>
        </div>
      </div>
      
      <div style="margin-top: 24px; padding: 16px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <p style="font-size: 14px; color: #92400e;"><strong>Importante:</strong> Cada enlace es personal y único. No lo compartas con otros.</p>
      </div>
    </div>
  </div>
</body>
</html>`);
function getMainHTML(user, section) {
  return `<!DOCTYPE html>
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
    .nav { margin-top: 16px; padding: 0 8px; }
    .btn { width: 100%; display: flex; align-items: center; padding: 12px 12px; margin-bottom: 8px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; text-decoration: none; }
    .btn.active { background: #10b981; color: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .btn:not(.active) { background: transparent; color: #374151; }
    .btn:hover:not(.active) { background: #f3f4f6; }
    .main { flex: 1; margin-left: 256px; }
    .top { min-height: 100px; padding: 16px 32px; border-bottom: 1px solid #f3f4f6; background: white; display: flex; align-items: center; }
    .content { padding: 32px; }
    .user { position: absolute; bottom: 0; left: 0; right: 0; padding: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
    .logout { padding: 4px; border: none; background: none; cursor: pointer; border-radius: 4px; }
    .logout:hover { background: #f3f4f6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="sidebar">
      <div class="header">
        <div class="icon">🏠</div>
      </div>
      <div class="nav">
        ${getNavigation(user.id, section, user.token)}
      </div>
      <div class="user">
        <span style="font-size: 12px; font-weight: 500;">${user.name}</span>
        <a href="/logout" class="logout">🚪</a>
      </div>
    </div>
    <div class="main">
      <div class="top">
        <h1 style="font-size: 28px; font-weight: bold;">¡Hola, ${user.name}! ${getUserMedalsDisplay(user.id)} 👋<br><small style="font-size: 14px; color: #6b7280; font-weight: normal;">${getTodayDate()}</small><br><small style="font-size: 12px; color: #9ca3af; font-weight: normal; font-style: italic;">"${getTodayQuote()}"</small></h1>
      </div>
      <div class="content">
        ${getContent(section, user.id)}
      </div>
    </div>
  </div>
  <script>
    function markMessagesAsRead() {
      fetch('/api/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: '${user.id}' })
      });
    }
  </script>
</body>
</html>`;
}
});

const recipesByCategory = {
  comidas: [
    { id: 1, name: 'Lubina sobre cama de verduras', ingredients: ['Lubina', 'Ajo', 'Aceite', 'Sal'], time: 0.5, servings: 4 },
    { id: 2, name: 'Muslo y contra muslo de pollo con pimientos', ingredients: ['Pollo (Muslo y contra muslo)', 'Pimientos', 'Ajo', 'Aceite', 'Sal'], time: 0.5, servings: 4 },
    { id: 3, name: 'Dorada sobre cama de verduras', ingredients: ['Doradas', 'Ajo', 'Aceite', 'Sal'], time: 0.5, servings: 4 },
    { id: 4, name: 'Alitas de pollo', ingredients: ['Pollo (alitas)', 'Ajo', 'Ajo en polvo', 'Aceite', 'Sal'], time: 0.5, servings: 4 },
    { id: 5, name: 'Salmón en papillote', ingredients: ['Salmón fresco (filetes)', 'Ajo en polvo', 'Aceite', 'Sal'], time: 0.5, servings: 4 }
  ],
  cenas: [
    { id: 6, name: 'Aguacate con salmón ahumado', ingredients: ['Aguacate', 'Salmón ahumado', 'Olivas', 'Cebollas', 'Aceite'], time: 0.5, servings: 4 },
    { id: 7, name: 'Crema de calabacín con salchichas', ingredients: ['Calabacín', 'Pollo (salchichas)', 'Aceite', 'Sal'], time: 0.5, servings: 4 },
    { id: 8, name: 'Caballa con mayonesa y brócoli al horno', ingredients: ['Caballa (lata)', 'Brócoli', 'Huevos', 'Aceite', 'Ajo', 'Sal'], time: 0.5, servings: 4 },
    { id: 9, name: 'Espinacas salteadas con gambas', ingredients: ['Espinacas', 'Gambas'], time: 0.25, servings: 4 }
  ]
};

// Mantener compatibilidad con el array anterior
const recipes = [...recipesByCategory.comidas, ...recipesByCategory.cenas];

function getRecetasContent(userId, isAdmin) {
  if (isAdmin) {
    return `
      <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 24px; background: linear-gradient(to right, #dc2626, #ea580c); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Recetas - Administración</h2>
      
      <div style="margin-bottom: 32px;">
        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 16px; color: #dc2626;">Comidas</h3>
        <button onclick="showAddRecipe('comidas')" style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 16px;">+ Añadir Comida</button>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 16px;">
          ${recipesByCategory.comidas.map(recipe => `
            <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #dc2626;">
              <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 12px;">
                <h4 style="font-size: 16px; font-weight: bold; flex: 1;">${recipe.name}</h4>
                <div style="display: flex; gap: 8px;">
                  <button onclick="editRecipe(${recipe.id})" style="padding: 4px 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Editar</button>
                  <button onclick="deleteRecipe(${recipe.id})" style="padding: 4px 8px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Eliminar</button>
                </div>
              </div>
              <p style="color: #6b7280; margin-bottom: 8px; font-size: 14px;"><strong>Ingredientes:</strong> ${recipe.ingredients.join(', ')}</p>
              <div style="display: flex; gap: 16px; font-size: 14px; color: #6b7280;">
                <span>⏱️ ${recipe.time}h</span>
                <span>👥 ${recipe.servings} personas</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div style="margin-bottom: 32px;">
        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 16px; color: #ea580c;">Cenas</h3>
        <button onclick="showAddRecipe('cenas')" style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 16px;">+ Añadir Cena</button>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 16px;">
          ${recipesByCategory.cenas.map(recipe => `
            <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #ea580c;">
              <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 12px;">
                <h4 style="font-size: 16px; font-weight: bold; flex: 1;">${recipe.name}</h4>
                <div style="display: flex; gap: 8px;">
                  <button onclick="editRecipe(${recipe.id})" style="padding: 4px 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Editar</button>
                  <button onclick="deleteRecipe(${recipe.id})" style="padding: 4px 8px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Eliminar</button>
                </div>
              </div>
              <p style="color: #6b7280; margin-bottom: 8px; font-size: 14px;"><strong>Ingredientes:</strong> ${recipe.ingredients.join(', ')}</p>
              <div style="display: flex; gap: 16px; font-size: 14px; color: #6b7280;">
                <span>⏱️ ${recipe.time}h</span>
                <span>👥 ${recipe.servings} personas</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- Modal para añadir/editar receta -->
      <div id="recipe-modal" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 12px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 1000; width: 500px; max-width: 90vw; max-height: 80vh; overflow-y: auto;">
        <h3 id="modal-title" style="margin-bottom: 16px;">Añadir Receta</h3>
        <form onsubmit="saveRecipe(event)">
          <input type="hidden" id="recipe-id" name="id">
          <input type="hidden" id="recipe-category" name="category">
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Nombre:</label>
            <input type="text" id="recipe-name" name="name" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
          </div>
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Ingredientes:</label>
            <div id="ingredients-container" style="border: 1px solid #d1d5db; border-radius: 4px; padding: 8px; max-height: 200px; overflow-y: auto;">
              ${inventory.map(item => `
                <label style="display: block; margin-bottom: 4px; font-size: 14px;">
                  <input type="checkbox" name="ingredients" value="${item.name}" style="margin-right: 8px;">
                  ${item.name}
                </label>
              `).join('')}
            </div>
          </div>
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Tiempo (horas):</label>
            <input type="number" id="recipe-time" name="time" step="0.25" min="0.25" value="0.5" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
          </div>
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Porciones:</label>
            <input type="number" id="recipe-servings" name="servings" min="1" value="4" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
          </div>
          
          <div style="display: flex; gap: 12px;">
            <button type="submit" style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">Guardar</button>
            <button type="button" onclick="closeRecipeModal()" style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
          </div>
        </form>
      </div>
      <div id="recipe-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999;" onclick="closeRecipeModal()"></div>
      
      <script>
        const recipeData = ${JSON.stringify(recipesByCategory)};
        
        function showAddRecipe(category) {
          document.getElementById('modal-title').textContent = 'Añadir ' + (category === 'comidas' ? 'Comida' : 'Cena');
          document.getElementById('recipe-id').value = '';
          document.getElementById('recipe-category').value = category;
          document.getElementById('recipe-name').value = '';
          document.getElementById('recipe-time').value = '0.5';
          document.getElementById('recipe-servings').value = '4';
          
          // Limpiar ingredientes seleccionados
          document.querySelectorAll('input[name="ingredients"]').forEach(cb => cb.checked = false);
          
          document.getElementById('recipe-modal').style.display = 'block';
          document.getElementById('recipe-overlay').style.display = 'block';
        }
        
        function editRecipe(id) {
          // Buscar receta
          let recipe = null;
          let category = null;
          for (const [cat, recipes] of Object.entries(recipeData)) {
            const found = recipes.find(r => r.id === id);
            if (found) {
              recipe = found;
              category = cat;
              break;
            }
          }
          
          if (recipe) {
            document.getElementById('modal-title').textContent = 'Editar Receta';
            document.getElementById('recipe-id').value = recipe.id;
            document.getElementById('recipe-category').value = category;
            document.getElementById('recipe-name').value = recipe.name;
            document.getElementById('recipe-time').value = recipe.time;
            document.getElementById('recipe-servings').value = recipe.servings;
            
            // Marcar ingredientes
            document.querySelectorAll('input[name="ingredients"]').forEach(cb => {
              cb.checked = recipe.ingredients.includes(cb.value);
            });
            
            document.getElementById('recipe-modal').style.display = 'block';
            document.getElementById('recipe-overlay').style.display = 'block';
          }
        }
        
        function deleteRecipe(id) {
          if (confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
            alert('Funcionalidad de eliminar receta pendiente');
          }
        }
        
        function saveRecipe(e) {
          e.preventDefault();
          alert('Funcionalidad de guardar receta pendiente');
          closeRecipeModal();
        }
        
        function closeRecipeModal() {
          document.getElementById('recipe-modal').style.display = 'none';
          document.getElementById('recipe-overlay').style.display = 'none';
        }
      </script>
    `;
  } else {
    // Vista de solo lectura para usuarios normales
    return `
      <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 24px; background: linear-gradient(to right, #dc2626, #ea580c); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Recetas</h2>
      
      <div style="margin-bottom: 32px;">
        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 16px; color: #dc2626;">Comidas</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
          ${recipesByCategory.comidas.map(recipe => `
            <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #dc2626;">
              <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 12px;">${recipe.name}</h4>
              <p style="color: #6b7280; margin-bottom: 8px; font-size: 14px;"><strong>Ingredientes:</strong> ${recipe.ingredients.join(', ')}</p>
              <div style="display: flex; gap: 16px; font-size: 14px; color: #6b7280;">
                <span>⏱️ ${recipe.time}h</span>
                <span>👥 ${recipe.servings} personas</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div>
        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 16px; color: #ea580c;">Cenas</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
          ${recipesByCategory.cenas.map(recipe => `
            <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #ea580c;">
              <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 12px;">${recipe.name}</h4>
              <p style="color: #6b7280; margin-bottom: 8px; font-size: 14px;"><strong>Ingredientes:</strong> ${recipe.ingredients.join(', ')}</p>
              <div style="display: flex; gap: 16px; font-size: 14px; color: #6b7280;">
                <span>⏱️ ${recipe.time}h</span>
                <span>👥 ${recipe.servings} personas</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

const inventoryByCategory = {
  carnes: [
    { id: 1, name: 'Jamón', category: 'carnes', store: 'Carne internet', unit: 'paquetes', quantity: 0, minimum: 1 },
    { id: 2, name: 'Pollo (Muslo y contra muslo)', category: 'carnes', store: 'Carne internet', unit: 'unidades', quantity: 0, minimum: 1 },
    { id: 3, name: 'Pollo (filetes de pechuga)', category: 'carnes', store: 'Carne internet', unit: 'unidades', quantity: 0, minimum: 1 },
    { id: 4, name: 'Pollo (alitas)', category: 'carnes', store: 'Carne internet', unit: 'unidades', quantity: 0, minimum: 1 },
    { id: 5, name: 'Pollo (salchichas)', category: 'carnes', store: 'Carne internet', unit: 'unidades', quantity: 0, minimum: 1 }
  ],
  pescado: [
    { id: 6, name: 'Salmón fresco (filetes)', category: 'pescado', store: 'Pescadería', unit: 'unidades', quantity: 0, minimum: 1 },
    { id: 7, name: 'Doradas', category: 'pescado', store: 'Pescadería', unit: 'unidades', quantity: 0, minimum: 1 },
    { id: 8, name: 'Lubina', category: 'pescado', store: 'Pescadería', unit: 'unidades', quantity: 0, minimum: 1 },
    { id: 9, name: 'Merluza (lomos)', category: 'pescado', store: 'Pescadería', unit: 'unidades', quantity: 0, minimum: 1 },
    { id: 10, name: 'Caballa (lata)', category: 'pescado', store: 'Alcampo', unit: 'latas', quantity: 0, minimum: 1 },
    { id: 11, name: 'Gambas', category: 'pescado', store: 'Pescadería', unit: 'paquetes', quantity: 0, minimum: 1 }
  ],
  verduras: [
    { id: 12, name: 'Ajo', category: 'verduras', store: 'Del bancal a casa', unit: 'unidades', quantity: 0, minimum: 1 },
    { id: 13, name: 'Cebollas', category: 'verduras', store: 'Del bancal a casa', unit: 'unidades', quantity: 0, minimum: 1 },
    { id: 14, name: 'Pimientos', category: 'verduras', store: 'Del bancal a casa', unit: 'unidades', quantity: 0, minimum: 1 },
    { id: 15, name: 'Brócoli', category: 'verduras', store: 'Del bancal a casa', unit: 'unidades', quantity: 0, minimum: 1 },
    { id: 16, name: 'Espinacas', category: 'verduras', store: 'Del bancal a casa', unit: 'paquetes', quantity: 0, minimum: 1 },
    { id: 17, name: 'Calabacín', category: 'verduras', store: 'Del bancal a casa', unit: 'unidades', quantity: 0, minimum: 1 }
  ],
  frutas: [
    { id: 18, name: 'Aguacate', category: 'frutas', store: 'Alcampo', unit: 'unidades', quantity: 0, minimum: 1 },
    { id: 19, name: 'Arándanos', category: 'frutas', store: 'Alcampo', unit: 'paquetes', quantity: 0, minimum: 1 },
    { id: 20, name: 'Fresas', category: 'frutas', store: 'Alcampo', unit: 'paquetes', quantity: 0, minimum: 1 }
  ],
  frutos_secos: [
    { id: 21, name: 'Almendras', category: 'frutos_secos', store: 'Internet', unit: 'paquetes', quantity: 0, minimum: 1 },
    { id: 22, name: 'Nueces', category: 'frutos_secos', store: 'Internet', unit: 'paquetes', quantity: 0, minimum: 1 },
    { id: 23, name: 'Macadamias', category: 'frutos_secos', store: 'Internet', unit: 'paquetes', quantity: 0, minimum: 1 }
  ],
  limpieza_hogar: [
    { id: 24, name: 'Friegasuelos', category: 'limpieza_hogar', store: 'Alcampo', unit: 'unidades', quantity: 0, minimum: 1 },
    { id: 25, name: 'Detergente lavadora', category: 'limpieza_hogar', store: 'Alcampo', unit: 'unidades', quantity: 0, minimum: 1 },
    { id: 26, name: 'Papel higiénico', category: 'limpieza_hogar', store: 'Alcampo', unit: 'unidades', quantity: 0, minimum: 1 }
  ],
  otros: [
    { id: 27, name: 'Aceite', category: 'otros', store: 'Alcampo', unit: 'unidades', quantity: 0, minimum: 1 },
    { id: 28, name: 'Sal', category: 'otros', store: 'Alcampo', unit: 'unidades', quantity: 0, minimum: 1 },
    { id: 29, name: 'Huevos', category: 'otros', store: 'Del bancal a casa', unit: 'unidades', quantity: 0, minimum: 1 }
  ]
};

// Mantener compatibilidad con el array anterior
const inventory = Object.values(inventoryByCategory).flat();

function getInventarioContent(userId, isAdmin) {
  const categories = {
    carnes: { name: 'Carnes', color: '#dc2626' },
    pescado: { name: 'Pescado', color: '#0ea5e9' },
    verduras: { name: 'Verduras', color: '#16a34a' },
    frutas: { name: 'Frutas', color: '#ea580c' },
    frutos_secos: { name: 'Frutos Secos', color: '#a855f7' },
    limpieza_hogar: { name: 'Limpieza/Hogar', color: '#6b7280' },
    otros: { name: 'Otros', color: '#0891b2' }
  };
  
  if (isAdmin) {
    return `
      <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 24px; background: linear-gradient(to right, #9333ea, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Inventario - Administración</h2>
      
      <div style="margin-bottom: 24px;">
        <button onclick="showAddProduct()" style="padding: 12px 24px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">+ Añadir Producto</button>
      </div>
      
      ${Object.entries(inventoryByCategory).map(([categoryKey, products]) => `
        <div style="margin-bottom: 32px;">
          <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 16px; color: ${categories[categoryKey].color};">${categories[categoryKey].name}</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 16px;">
            ${products.map(product => `
              <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid ${categories[categoryKey].color};">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                  <h4 style="font-size: 16px; font-weight: bold; flex: 1;">${product.name}</h4>
                  <div style="display: flex; gap: 8px;">
                    <button onclick="editProduct(${product.id})" style="padding: 4px 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Editar</button>
                    <button onclick="deleteProduct(${product.id})" style="padding: 4px 8px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Eliminar</button>
                  </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 14px; color: #6b7280;">
                  <p><strong>Cantidad:</strong> <span style="color: ${product.quantity === 0 ? '#dc2626' : '#059669'}; font-weight: bold;">${product.quantity} ${product.unit}</span></p>
                  <p><strong>Mínimo:</strong> ${product.minimum} ${product.unit}</p>
                  <p><strong>Se compra en:</strong> ${product.store}</p>
                  <p><strong>Categoría:</strong> ${categories[categoryKey].name}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
      
      <!-- Modal para añadir/editar producto -->
      <div id="product-modal" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 12px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 1000; width: 500px; max-width: 90vw;">
        <h3 id="product-modal-title" style="margin-bottom: 16px;">Añadir Producto</h3>
        <form onsubmit="saveProduct(event)">
          <input type="hidden" id="product-id" name="id">
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Nombre:</label>
            <input type="text" id="product-name" name="name" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
          </div>
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Categoría:</label>
            <select id="product-category" name="category" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
              <option value="carnes">Carnes</option>
              <option value="pescado">Pescado</option>
              <option value="verduras">Verduras</option>
              <option value="frutas">Frutas</option>
              <option value="frutos_secos">Frutos Secos</option>
              <option value="limpieza_hogar">Limpieza/Hogar</option>
              <option value="otros">Otros</option>
            </select>
          </div>
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Se compra en:</label>
            <select id="product-store" name="store" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
              <option value="Carne internet">Carne internet</option>
              <option value="Pescadería">Pescadería</option>
              <option value="Del bancal a casa">Del bancal a casa</option>
              <option value="Alcampo">Alcampo</option>
              <option value="Internet">Internet</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Medida:</label>
            <select id="product-unit" name="unit" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
              <option value="unidades">Unidades</option>
              <option value="litros">Litros</option>
              <option value="botes">Botes</option>
              <option value="tarros">Tarros</option>
              <option value="cartones">Cartones</option>
              <option value="latas">Latas</option>
              <option value="paquetes">Paquetes</option>
            </select>
          </div>
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Cantidad actual:</label>
            <input type="number" id="product-quantity" name="quantity" min="0" value="0" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
          </div>
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Cantidad mínima:</label>
            <input type="number" id="product-minimum" name="minimum" min="0" value="1" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
          </div>
          
          <div style="display: flex; gap: 12px;">
            <button type="submit" style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">Guardar</button>
            <button type="button" onclick="closeProductModal()" style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
          </div>
        </form>
      </div>
      <div id="product-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999;" onclick="closeProductModal()"></div>
      
      <script>
        const inventoryData = ${JSON.stringify(inventoryByCategory)};
        
        function showAddProduct() {
          document.getElementById('product-modal-title').textContent = 'Añadir Producto';
          document.getElementById('product-id').value = '';
          document.getElementById('product-name').value = '';
          document.getElementById('product-category').value = 'otros';
          document.getElementById('product-store').value = 'Alcampo';
          document.getElementById('product-unit').value = 'unidades';
          document.getElementById('product-quantity').value = '0';
          document.getElementById('product-minimum').value = '1';
          
          document.getElementById('product-modal').style.display = 'block';
          document.getElementById('product-overlay').style.display = 'block';
        }
        
        function editProduct(id) {
          let product = null;
          for (const products of Object.values(inventoryData)) {
            const found = products.find(p => p.id === id);
            if (found) {
              product = found;
              break;
            }
          }
          
          if (product) {
            document.getElementById('product-modal-title').textContent = 'Editar Producto';
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-store').value = product.store;
            document.getElementById('product-unit').value = product.unit;
            document.getElementById('product-quantity').value = product.quantity;
            document.getElementById('product-minimum').value = product.minimum;
            
            document.getElementById('product-modal').style.display = 'block';
            document.getElementById('product-overlay').style.display = 'block';
          }
        }
        
        function deleteProduct(id) {
          if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            alert('Funcionalidad de eliminar producto pendiente');
          }
        }
        
        function saveProduct(e) {
          e.preventDefault();
          alert('Funcionalidad de guardar producto pendiente');
          closeProductModal();
        }
        
        function closeProductModal() {
          document.getElementById('product-modal').style.display = 'none';
          document.getElementById('product-overlay').style.display = 'none';
        }
      </script>
    `;
  } else {
    // Vista simplificada para usuarios normales
    return `
      <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 24px; background: linear-gradient(to right, #9333ea, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Inventario</h2>
      
      ${Object.entries(inventoryByCategory).map(([categoryKey, products]) => `
        <div style="margin-bottom: 32px;">
          <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 16px; color: ${categories[categoryKey].color};">${categories[categoryKey].name}</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
            ${products.map(product => `
              <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid ${categories[categoryKey].color};">
                <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 12px;">${product.name}</h4>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 18px; font-weight: bold; color: ${product.quantity === 0 ? '#dc2626' : '#059669'};">${product.quantity} ${product.unit}</span>
                  <div style="display: flex; gap: 8px; align-items: center;">
                    <button onclick="changeQuantity(${product.id}, -1)" style="width: 32px; height: 32px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 18px; font-weight: bold; display: flex; align-items: center; justify-content: center;">−</button>
                    <button onclick="changeQuantity(${product.id}, 1)" style="width: 32px; height: 32px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 18px; font-weight: bold; display: flex; align-items: center; justify-content: center;">+</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
      
      <script>
        function changeQuantity(productId, change) {
          fetch('/api/change-quantity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, change })
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              location.reload();
            }
          });
        }
      </script>
    `;
  }
}

const activities = {
  javier: [
    { id: 1, title: 'Ejercicio matutino', time: '07:00', duration: 30, completed: false, repeat: 'daily', streak: 0, lastCompleted: null, medals: { bronze: false, silver: false, gold: false }, completedDates: [], startDate: '2024-01-01' },
    { id: 2, title: 'Revisar emails', time: '09:00', duration: 15, completed: true, repeat: 'weekdays', streak: 0, lastCompleted: null, medals: { bronze: false, silver: false, gold: false }, completedDates: [], startDate: '2024-01-01' }
  ],
  raquel: [
    { id: 3, title: 'Yoga', time: '06:30', duration: 45, completed: false, repeat: 'daily', streak: 0, lastCompleted: null, medals: { bronze: false, silver: false, gold: false }, completedDates: [], startDate: '2024-01-01' },
    { id: 4, title: 'Planificar comidas', time: '19:00', duration: 20, completed: false, repeat: 'weekly', streak: 0, lastCompleted: null, medals: { bronze: false, silver: false, gold: false }, completedDates: [], startDate: '2024-01-01' }
  ],
  mario: [
    { id: 5, title: 'Estudiar', time: '16:00', duration: 60, completed: false, repeat: 'weekdays', streak: 0, lastCompleted: null, medals: { bronze: false, silver: false, gold: false }, completedDates: [], startDate: '2024-01-01' }
  ],
  alba: [
    { id: 6, title: 'Leer', time: '20:00', duration: 30, completed: true, repeat: 'daily', streak: 0, lastCompleted: null, medals: { bronze: false, silver: false, gold: false }, completedDates: [], startDate: '2024-01-01' }
  ]
};

// Sistema de medallas de usuarios
const userMedals = {
  javier: [],
  raquel: [],
  mario: [],
  alba: []
};

function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function canCompleteActivity(activity) {
  const today = getTodayDateString();
  if (activity.repeat === 'none') return true;
  if (activity.repeat === 'weekly') {
    const lastWeek = activity.lastCompleted ? new Date(activity.lastCompleted) : null;
    const thisWeek = new Date(today);
    if (!lastWeek) return true;
    const daysDiff = Math.floor((thisWeek - lastWeek) / (1000 * 60 * 60 * 24));
    return daysDiff >= 7;
  }
  if (activity.repeat === 'weekdays') {
    const dayOfWeek = new Date(today).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return false; // Domingo o sábado
  }
  return !activity.lastCompleted || activity.lastCompleted !== today;
}

function updateActivityStreak(activity, completed, userId) {
  const today = getTodayDateString();
  
  if (completed) {
    if (activity.lastCompleted) {
      const lastDate = new Date(activity.lastCompleted);
      const todayDate = new Date(today);
      
      // Calcular días válidos según el tipo de actividad
      let expectedDaysDiff = 1;
      if (activity.repeat === 'weekly') expectedDaysDiff = 7;
      else if (activity.repeat === 'weekdays') {
        // Contar solo días laborables
        let daysBetween = 0;
        let currentDate = new Date(lastDate);
        currentDate.setDate(currentDate.getDate() + 1);
        
        while (currentDate <= todayDate) {
          const dayOfWeek = currentDate.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) daysBetween++;
          currentDate.setDate(currentDate.getDate() + 1);
        }
        expectedDaysDiff = daysBetween;
      }
      
      const actualDays = Math.ceil((todayDate - lastDate) / (1000 * 60 * 60 * 24));
      
      if ((activity.repeat === 'weekdays' && expectedDaysDiff === 1) || 
          (activity.repeat !== 'weekdays' && actualDays === expectedDaysDiff)) {
        activity.streak++;
      } else {
        // Romper racha: resetear contadores según medallas conseguidas
        if (activity.medals.gold) {
          // Si ya tiene oro, mantener oro y plata, resetear solo el contador actual
          activity.streak = 1;
        } else if (activity.medals.silver) {
          // Si tiene plata, mantener plata y bronce, resetear contador de oro
          activity.streak = 1;
        } else if (activity.medals.bronze) {
          // Si tiene bronce, mantener bronce, resetear contador de plata
          activity.streak = 1;
        } else {
          activity.streak = 1;
        }
      }
    } else {
      activity.streak = 1;
    }
    
    // Verificar y otorgar medallas
    checkAndAwardMedals(activity, userId);
    activity.lastCompleted = today;
  } else {
    // Al desmarcar, resetear según medallas conseguidas
    if (activity.medals.gold) {
      activity.streak = Math.max(100, activity.streak - 1);
    } else if (activity.medals.silver) {
      activity.streak = Math.max(50, activity.streak - 1);
    } else if (activity.medals.bronze) {
      activity.streak = Math.max(21, activity.streak - 1);
    } else {
      activity.streak = Math.max(0, activity.streak - 1);
    }
    activity.lastCompleted = null;
  }
}

function checkAndAwardMedals(activity, userId) {
  // Medalla de bronce (21 días)
  if (activity.streak >= 21 && !activity.medals.bronze) {
    activity.medals.bronze = true;
    addUserMedal(userId, 'bronze', activity.title);
  }
  
  // Medalla de plata (50 días)
  if (activity.streak >= 50 && !activity.medals.silver) {
    activity.medals.silver = true;
    addUserMedal(userId, 'silver', activity.title);
  }
  
  // Medalla de oro (100 días)
  if (activity.streak >= 100 && !activity.medals.gold) {
    activity.medals.gold = true;
    addUserMedal(userId, 'gold', activity.title);
  }
}

function addUserMedal(userId, type, activityTitle) {
  if (!userMedals[userId]) userMedals[userId] = [];
  const medal = {
    type: type,
    activity: activityTitle,
    date: getTodayDateString(),
    emoji: type === 'gold' ? '🥇' : type === 'silver' ? '🥈' : '🥉'
  };
  userMedals[userId].push(medal);
}

function getStreakBadge(activity, level) {
  if (level === 100 && activity.medals.gold) return { text: 'Conseguido: Eres una leyenda', medal: '🥇' };
  if (level === 50 && activity.medals.silver) return { text: 'Conseguido: Eres un hacha', medal: '🥈' };
  if (level === 21 && activity.medals.bronze) return { text: 'Conseguido: Has cogido el hábito', medal: '🥉' };
  return null;
}

function getUserMedalsDisplay(userId) {
  const medals = userMedals[userId] || [];
  if (medals.length === 0) return '';
  
  return medals.map(medal => `${medal.emoji} ${medal.activity}`).join(' ');
}

function getActivitiesContent(userId, isAdmin) {
  if (isAdmin) {
    return `
      <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 24px; background: linear-gradient(to right, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Actividades - Administración</h2>
      <div style="margin-bottom: 24px;">
        <button onclick="showAddActivity()" style="padding: 12px 24px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">+ Añadir Actividad</button>
      </div>
      <div id="add-activity" style="display: none; background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 24px;">
        <h3 style="margin-bottom: 16px;">Nueva Actividad</h3>
        <form onsubmit="addActivity(event)">
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Usuarios:</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
              <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" name="users" value="javier"> Javier</label>
              <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" name="users" value="raquel"> Raquel</label>
              <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" name="users" value="mario"> Mario</label>
              <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" name="users" value="alba"> Alba</label>
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Título:</label>
            <input type="text" name="title" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Hora:</label>
            <input type="time" name="time" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Duración (minutos):</label>
            <input type="number" name="duration" required min="1" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Fecha de inicio:</label>
            <input type="date" name="startDate" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Fecha de fin:</label>
            <div style="display: flex; align-items: center; gap: 8px;">
              <input type="date" id="endDate" name="endDate" style="flex: 1; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
              <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" id="noEndDate" onchange="toggleEndDate()"> Sin fecha de fin</label>
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Repetir:</label>
            <select name="repeat" onchange="toggleCustomDays()" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
              <option value="none">No repetir</option>
              <option value="daily">Todos los días</option>
              <option value="weekdays">Días laborables</option>
              <option value="weekly">Semanalmente</option>
              <option value="custom">Personalizar días</option>
            </select>
          </div>
          <div id="customDays" style="display: none; margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Días de la semana:</label>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
              <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" name="weekdays" value="1"> Lunes</label>
              <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" name="weekdays" value="2"> Martes</label>
              <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" name="weekdays" value="3"> Miércoles</label>
              <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" name="weekdays" value="4"> Jueves</label>
              <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" name="weekdays" value="5"> Viernes</label>
              <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" name="weekdays" value="6"> Sábado</label>
              <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" name="weekdays" value="0"> Domingo</label>
            </div>
          </div>
          <div style="display: flex; gap: 12px;">
            <button type="submit" style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">Guardar</button>
            <button type="button" onclick="hideAddActivity()" style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
          </div>
        </form>
      </div>
      ${['javier', 'raquel', 'mario', 'alba'].map(user => `
        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 24px;">
          <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 16px; text-transform: capitalize;">${user}</h3>
          ${activities[user] ? activities[user].map(activity => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 8px;">
              <div>
                <strong>${activity.title}</strong><br>
                <small style="color: #6b7280;">${activity.time} - ${activity.duration} min - ${activity.repeat}</small>
              </div>
              <div style="display: flex; gap: 8px; align-items: center;">
                <span style="color: ${activity.completed ? '#10b981' : '#ef4444'};">${activity.completed ? '✓ Hecho' : '✗ Pendiente'}</span>
                <button onclick="editActivity(${activity.id})" style="padding: 4px 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Editar</button>
                <button onclick="deleteActivity(${activity.id})" style="padding: 4px 8px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Eliminar</button>
              </div>
            </div>
          `).join('') : '<p style="color: #6b7280;">Sin actividades</p>'}
        </div>
      `).join('')}
      <div id="edit-activity" style="display: none; background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 24px; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000; width: 400px; max-width: 90vw;">
        <h3 style="margin-bottom: 16px;">Editar Actividad</h3>
        <form onsubmit="updateActivity(event)">
          <input type="hidden" id="edit-id" name="id">
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Usuarios:</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
              <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" id="edit-user-javier" name="users" value="javier"> Javier</label>
              <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" id="edit-user-raquel" name="users" value="raquel"> Raquel</label>
              <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" id="edit-user-mario" name="users" value="mario"> Mario</label>
              <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" id="edit-user-alba" name="users" value="alba"> Alba</label>
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Título:</label>
            <input type="text" id="edit-title" name="title" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Hora:</label>
            <input type="time" id="edit-time" name="time" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Duración (minutos):</label>
            <input type="number" id="edit-duration" name="duration" required min="1" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Fecha de inicio:</label>
            <input type="date" id="edit-startDate" name="startDate" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Fecha de fin:</label>
            <div style="display: flex; align-items: center; gap: 8px;">
              <input type="date" id="edit-endDate" name="endDate" style="flex: 1; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
              <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" id="edit-noEndDate" onchange="toggleEditEndDate()"> Sin fecha de fin</label>
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Repetir:</label>
            <select id="edit-repeat" name="repeat" onchange="toggleEditCustomDays()" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
              <option value="none">No repetir</option>
              <option value="daily">Todos los días</option>
              <option value="weekdays">Días laborables</option>
              <option value="weekly">Semanalmente</option>
              <option value="custom">Personalizar días</option>
            </select>
          </div>
          <div id="edit-customDays" style="display: none; margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Días de la semana:</label>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
              <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" id="edit-day-1" name="weekdays" value="1"> Lunes</label>
              <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" id="edit-day-2" name="weekdays" value="2"> Martes</label>
              <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" id="edit-day-3" name="weekdays" value="3"> Miércoles</label>
              <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" id="edit-day-4" name="weekdays" value="4"> Jueves</label>
              <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" id="edit-day-5" name="weekdays" value="5"> Viernes</label>
              <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" id="edit-day-6" name="weekdays" value="6"> Sábado</label>
              <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" id="edit-day-0" name="weekdays" value="0"> Domingo</label>
            </div>
          </div>
          <div style="display: flex; gap: 12px;">
            <button type="submit" style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">Actualizar</button>
            <button type="button" onclick="hideEditActivity()" style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
          </div>
        </form>
      </div>
      <div id="overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999;" onclick="hideEditActivity()"></div>
      <script>
        const activitiesData = ${JSON.stringify(activities)};
        
        function showAddActivity() { document.getElementById('add-activity').style.display = 'block'; }
        function hideAddActivity() { document.getElementById('add-activity').style.display = 'none'; }
        function toggleEndDate() {
          const endDate = document.getElementById('endDate');
          const noEndDate = document.getElementById('noEndDate');
          endDate.disabled = noEndDate.checked;
          if (noEndDate.checked) endDate.value = '';
        }
        
        function toggleEditEndDate() {
          const endDate = document.getElementById('edit-endDate');
          const noEndDate = document.getElementById('edit-noEndDate');
          endDate.disabled = noEndDate.checked;
          if (noEndDate.checked) endDate.value = '';
        }
        
        function toggleCustomDays() {
          const repeat = document.querySelector('select[name="repeat"]').value;
          const customDays = document.getElementById('customDays');
          customDays.style.display = repeat === 'custom' ? 'block' : 'none';
        }
        
        function toggleEditCustomDays() {
          const repeat = document.getElementById('edit-repeat').value;
          const customDays = document.getElementById('edit-customDays');
          customDays.style.display = repeat === 'custom' ? 'block' : 'none';
        }
        
        function addActivity(e) { 
          e.preventDefault(); 
          const selectedUsers = Array.from(document.querySelectorAll('input[name="users"]:checked')).map(cb => cb.value);
          if (selectedUsers.length === 0) {
            alert('Selecciona al menos un usuario');
            return;
          }
          const repeat = document.querySelector('select[name="repeat"]').value;
          if (repeat === 'custom') {
            const selectedDays = Array.from(document.querySelectorAll('input[name="weekdays"]:checked')).map(cb => cb.value);
            if (selectedDays.length === 0) {
              alert('Selecciona al menos un día de la semana');
              return;
            }
          }
          
          const formData = new FormData(e.target);
          const activityData = {
            users: selectedUsers,
            title: formData.get('title'),
            time: formData.get('time'),
            duration: formData.get('duration'),
            repeat: repeat,
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            customDays: repeat === 'custom' ? Array.from(document.querySelectorAll('input[name="weekdays"]:checked')).map(cb => cb.value) : null
          };
          
          fetch('/api/add-activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(activityData)
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              location.reload();
            } else {
              alert('Error al crear la actividad');
            }
          });
        }
        
        function editActivity(id) {
          // Buscar la actividad en todos los usuarios
          let activity = null;
          let user = null;
          for (const [userId, userActivities] of Object.entries(activitiesData)) {
            const found = userActivities.find(a => a.id === id);
            if (found) {
              activity = found;
              user = userId;
              break;
            }
          }
          
          if (activity) {
            document.getElementById('edit-id').value = activity.id;
            // Marcar el usuario actual
            document.querySelectorAll('input[name="users"]').forEach(cb => cb.checked = false);
            document.getElementById('edit-user-' + user).checked = true;
            document.getElementById('edit-title').value = activity.title;
            document.getElementById('edit-time').value = activity.time;
            document.getElementById('edit-duration').value = activity.duration;
            document.getElementById('edit-repeat').value = activity.repeat;
            
            // Cargar fechas
            document.getElementById('edit-startDate').value = activity.startDate || '';
            document.getElementById('edit-endDate').value = activity.endDate || '';
            document.getElementById('edit-noEndDate').checked = !activity.endDate;
            toggleEditEndDate();
            
            // Cargar días personalizados
            if (activity.repeat === 'custom' && activity.customDays) {
              document.querySelectorAll('#edit-activity input[name="weekdays"]').forEach(cb => {
                cb.checked = activity.customDays.includes(cb.value);
              });
            }
            toggleEditCustomDays();
            document.getElementById('edit-activity').style.display = 'block';
            document.getElementById('overlay').style.display = 'block';
          }
        }
        
        function hideEditActivity() {
          document.getElementById('edit-activity').style.display = 'none';
          document.getElementById('overlay').style.display = 'none';
        }
        
        function updateActivity(e) {
          e.preventDefault();
          const selectedUsers = Array.from(document.querySelectorAll('#edit-activity input[name="users"]:checked')).map(cb => cb.value);
          if (selectedUsers.length === 0) {
            alert('Selecciona al menos un usuario');
            return;
          }
          const repeat = document.getElementById('edit-repeat').value;
          if (repeat === 'custom') {
            const selectedDays = Array.from(document.querySelectorAll('#edit-activity input[name="weekdays"]:checked')).map(cb => cb.value);
            if (selectedDays.length === 0) {
              alert('Selecciona al menos un día de la semana');
              return;
            }
          }
          
          const formData = new FormData(e.target);
          const activityData = {
            id: formData.get('id'),
            users: selectedUsers,
            title: formData.get('title'),
            time: formData.get('time'),
            duration: formData.get('duration'),
            repeat: repeat,
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            customDays: repeat === 'custom' ? Array.from(document.querySelectorAll('#edit-activity input[name="weekdays"]:checked')).map(cb => cb.value) : null
          };
          
          fetch('/api/update-activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(activityData)
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              location.reload();
            } else {
              alert('Error al actualizar la actividad');
            }
          });
        }
        
        function deleteActivity(id, specificDate = null) {
          let message = '¿Cómo quieres eliminar esta actividad?';
          let options = ['Cancelar', 'Solo este evento', 'Toda la serie'];
          
          if (specificDate) {
            let choice = confirm(message + '\n\nAceptar = Solo este evento\nCancelar = Toda la serie');
            if (choice === null) return;
            
            fetch('/api/delete-activity', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                id: id, 
                deleteType: choice ? 'single' : 'series',
                specificDate: specificDate 
              })
            })
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                location.reload();
              } else {
                alert('Error al eliminar la actividad');
              }
            });
          } else {
            if (confirm('¿Estás seguro de que quieres eliminar toda esta actividad?')) {
              fetch('/api/delete-activity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id, deleteType: 'series' })
              })
              .then(response => response.json())
              .then(data => {
                if (data.success) {
                  location.reload();
                } else {
                  alert('Error al eliminar la actividad');
                }
              });
            }
          }
        }
      </script>
    `;
  } else {
    const userActivities = activities[userId] || [];
    return `
      <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 24px; background: linear-gradient(to right, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Mis Actividades</h2>
      <div style="margin-bottom: 24px; display: flex; gap: 12px;">
        <button onclick="showView('daily')" id="daily-btn" class="view-btn" style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">Vista Diaria</button>
        <button onclick="showView('weekly')" id="weekly-btn" class="view-btn" style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">Vista Semanal</button>
        ${isAdmin ? '<button onclick="showView(\'calendar\')" id="calendar-btn" class="view-btn" style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">Vista Calendario</button>' : ''}
      </div>
      <div id="daily-view">
        <h3 style="margin-bottom: 16px;">Hoy - ${getTodayDate()}</h3>
        ${userActivities.length > 0 ? userActivities.map(activity => {
          const canComplete = canCompleteActivity(activity);
          const badge21 = getStreakBadge(activity, 21);
          const badge50 = getStreakBadge(activity, 50);
          const badge100 = getStreakBadge(activity, 100);
          
          return `
            <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 16px; border-left: 4px solid ${activity.completed ? '#10b981' : '#6b7280'};">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                <div style="flex: 1;">
                  <h4 style="font-size: 18px; font-weight: bold; margin-bottom: 4px;">${activity.title}</h4>
                  <p style="color: #6b7280; margin-bottom: 8px;">${activity.time} - ${activity.duration} minutos</p>
                  <div style="background: #f9fafb; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
                    <p style="font-weight: bold; margin-bottom: 8px; color: #374151;">Racha actual: ${activity.streak} días</p>
                    <div style="display: grid; grid-template-columns: 1fr; gap: 6px; font-size: 14px;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>Reto 21 días:</span>
                        ${badge21 ? `<span style="color: #10b981; font-weight: bold;">${badge21.text} ${badge21.medal}</span>` : `<span style="color: #6b7280;">${Math.max(0, 21 - activity.streak)} días restantes</span>`}
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>Reto 50 días:</span>
                        ${badge50 ? `<span style="color: #10b981; font-weight: bold;">${badge50.text} ${badge50.medal}</span>` : `<span style="color: #6b7280;">${Math.max(0, 50 - Math.max(activity.streak, activity.medals.bronze ? 21 : 0))} días restantes</span>`}
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>Reto 100 días:</span>
                        ${badge100 ? `<span style="color: #10b981; font-weight: bold;">${badge100.text} ${badge100.medal}</span>` : `<span style="color: #6b7280;">${Math.max(0, 100 - Math.max(activity.streak, activity.medals.silver ? 50 : activity.medals.bronze ? 21 : 0))} días restantes</span>`}
                      </div>
                    </div>
                  </div>
                </div>
                <button onclick="toggleActivity(${activity.id})" 
                        style="padding: 12px 20px; background: ${!canComplete ? '#9ca3af' : (activity.completed ? '#ef4444' : '#10b981')}; color: white; border: none; border-radius: 8px; cursor: ${!canComplete ? 'not-allowed' : 'pointer'}; font-weight: 500; margin-left: 16px;"
                        ${!canComplete ? 'disabled' : ''}>
                  ${activity.completed ? 'Marcar Pendiente' : 'Marcar Hecho'}
                </button>
              </div>
            </div>
          `;
        }).join('') : '<p style="color: #6b7280; background: white; padding: 24px; border-radius: 8px;">No tienes actividades para hoy</p>'}
      </div>
      <div id="weekly-view" style="display: none;">
        <h3 style="margin-bottom: 16px;">Vista Semanal</h3>
        <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="display: grid; grid-template-columns: 120px repeat(7, 1fr); gap: 8px; margin-bottom: 16px;">
            <div></div>
            ${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => {
              const date = getWeekDate(index);
              const isToday = isDateToday(date);
              return `<div style="text-align: center; font-weight: bold; padding: 8px; background: ${isToday ? '#fef3c7' : '#f3f4f6'}; border-radius: 4px;">${day}<br><small>${date.getDate()}/${date.getMonth() + 1}</small></div>`;
            }).join('')}
          </div>
          ${userActivities.map(activity => {
            return `
              <div style="display: grid; grid-template-columns: 120px repeat(7, 1fr); gap: 8px; margin-bottom: 8px; align-items: center;">
                <div style="font-size: 12px; font-weight: 500; padding: 8px;">${activity.title}</div>
                ${[0,1,2,3,4,5,6].map(dayIndex => {
                  const date = getWeekDate(dayIndex);
                  const canMarkToday = canMarkActivityOnDate(activity, date);
                  const isActivityDay = isActivityScheduledOnDate(activity, date);
                  
                  if (!isActivityDay) {
                    return '<div style="padding: 8px;"></div>';
                  }
                  
                  const dateStr = date.toISOString().split('T')[0];
                  const isCompleted = activity.completedDates && activity.completedDates.includes(dateStr);
                  
                  return `
                    <div style="padding: 8px; text-align: center;">
                      <button onclick="toggleActivityDate('${activity.id}', '${dateStr}')" 
                              style="width: 32px; height: 32px; border: none; border-radius: 50%; cursor: ${canMarkToday ? 'pointer' : 'not-allowed'}; background: ${isCompleted ? '#10b981' : (canMarkToday ? '#e5e7eb' : '#f3f4f6')}; color: ${isCompleted ? 'white' : '#374151'}; font-size: 12px;"
                              ${!canMarkToday ? 'disabled' : ''}>
                        ${isCompleted ? '✓' : '○'}
                      </button>
                    </div>
                  `;
                }).join('')}
              </div>
            `;
          }).join('')}
        </div>
      </div>
      
      ${isAdmin ? `
      <div id="calendar-view" style="display: none;">
        <h3 style="margin-bottom: 16px;">Calendario de Actividades</h3>
        ${['javier', 'raquel', 'mario', 'alba'].map(user => `
          <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 16px;">
            <h4 style="font-size: 18px; font-weight: bold; margin-bottom: 16px; text-transform: capitalize; color: #374151;">${user}</h4>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-bottom: 16px;">
              ${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => `<div style="text-align: center; font-weight: bold; padding: 8px; background: #f3f4f6; border-radius: 4px;">${day}</div>`).join('')}
            </div>
            <div id="calendar-${user}" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;"></div>
          </div>
        `).join('')}
      </div>
      ` : ''}
      <script>
        function showView(view) {
          document.getElementById('daily-view').style.display = view === 'daily' ? 'block' : 'none';
          document.getElementById('weekly-view').style.display = view === 'weekly' ? 'block' : 'none';
          ${isAdmin ? "document.getElementById('calendar-view').style.display = view === 'calendar' ? 'block' : 'none';" : ''}
          document.getElementById('daily-btn').style.background = view === 'daily' ? '#10b981' : '#6b7280';
          document.getElementById('weekly-btn').style.background = view === 'weekly' ? '#10b981' : '#6b7280';
          ${isAdmin ? "if (document.getElementById('calendar-btn')) document.getElementById('calendar-btn').style.background = view === 'calendar' ? '#10b981' : '#6b7280';" : ''}
          
          if (view === 'calendar') {
            loadCalendarView();
          }
        }
        
        function loadCalendarView() {
          // Generar calendario simple para cada usuario
          const today = new Date();
          const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
          const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          
          ['javier', 'raquel', 'mario', 'alba'].forEach(user => {
            const calendar = document.getElementById('calendar-' + user);
            if (!calendar) return;
            
            calendar.innerHTML = '';
            
            // Días vacíos al inicio
            const startDay = (firstDay.getDay() + 6) % 7; // Lunes = 0
            for (let i = 0; i < startDay; i++) {
              calendar.innerHTML += '<div></div>';
            }
            
            // Días del mes
            for (let day = 1; day <= lastDay.getDate(); day++) {
              const date = new Date(today.getFullYear(), today.getMonth(), day);
              const isToday = day === today.getDate();
              
              calendar.innerHTML += \`
                <div style="padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px; min-height: 60px; background: \${isToday ? '#fef3c7' : 'white'}; position: relative;">
                  <div style="font-weight: bold; font-size: 12px; margin-bottom: 4px;">\${day}</div>
                  <div id="activities-\${user}-\${day}" style="font-size: 10px;"></div>
                </div>
              \`;
            }
          });
        }
        
        function getWeekDate(dayIndex) {
          const today = new Date();
          const monday = new Date(today);
          monday.setDate(today.getDate() - (today.getDay() + 6) % 7);
          const targetDate = new Date(monday);
          targetDate.setDate(monday.getDate() + dayIndex);
          return targetDate;
        }
        
        function isDateToday(date) {
          const today = new Date();
          return date.toDateString() === today.toDateString();
        }
        
        function canMarkActivityOnDate(activity, date) {
          const today = new Date();
          return date <= today;
        }
        
        function isActivityScheduledOnDate(activity, date) {
          const dayOfWeek = date.getDay();
          
          if (activity.repeat === 'daily') return true;
          if (activity.repeat === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5;
          if (activity.repeat === 'weekly') {
            const startDate = new Date(activity.startDate || '2024-01-01');
            return dayOfWeek === startDate.getDay();
          }
          if (activity.repeat === 'custom' && activity.customDays) {
            return activity.customDays.includes(dayOfWeek.toString());
          }
          if (activity.repeat === 'none') {
            const activityDate = new Date(activity.startDate);
            return date.toDateString() === activityDate.toDateString();
          }
          return false;
        }
        
        function toggleActivity(id) {
          fetch('/api/toggle-activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activityId: id, userId: '${userId}' })
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              location.reload();
            }
          });
        }
        
        function toggleActivityDate(activityId, date) {
          fetch('/api/toggle-activity-date', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activityId: activityId, userId: '${userId}', date: date })
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              location.reload();
            }
          });
        }
      </script>
    `;
  }
}

const mealPlan = {
  '2024-09-02': { // Solo primera semana con ejemplos
    'desayuno-alba-mario': { lunes: '', martes: '', miercoles: '', jueves: '', viernes: '', sabado: '', domingo: '' },
    'desayuno-raquel-javier': { lunes: 'Tostadas con aguacate', martes: '', miercoles: '', jueves: '', viernes: '', sabado: '', domingo: '' },
    'almuerzo-alba-mario': { lunes: '', martes: '', miercoles: '', jueves: '', viernes: '', sabado: '', domingo: '' },
    'almuerzo-raquel-javier': { lunes: '', martes: '', miercoles: '', jueves: '', viernes: '', sabado: '', domingo: '' },
    'comida': { lunes: 'Lubina sobre cama de verduras', martes: '', miercoles: '', jueves: '', viernes: '', sabado: '', domingo: '' },
    'merienda-alba-mario': { lunes: '', martes: '', miercoles: '', jueves: '', viernes: '', sabado: '', domingo: '' },
    'merienda-raquel-javier': { lunes: '', martes: '', miercoles: '', jueves: '', viernes: '', sabado: '', domingo: '' },
    'cena': { lunes: '', martes: '', miercoles: '', jueves: '', viernes: '', sabado: '', domingo: '' }
  }
};

const mealStatus = {
  '2024-09-02': {
    'desayuno-alba-mario': { lunes: false, martes: false, miercoles: false, jueves: false, viernes: false, sabado: false, domingo: false },
    'desayuno-raquel-javier': { lunes: false, martes: false, miercoles: false, jueves: false, viernes: false, sabado: false, domingo: false },
    'almuerzo-alba-mario': { lunes: false, martes: false, miercoles: false, jueves: false, viernes: false, sabado: false, domingo: false },
    'almuerzo-raquel-javier': { lunes: false, martes: false, miercoles: false, jueves: false, viernes: false, sabado: false, domingo: false },
    'comida': { lunes: false, martes: false, miercoles: false, jueves: false, viernes: false, sabado: false, domingo: false },
    'merienda-alba-mario': { lunes: false, martes: false, miercoles: false, jueves: false, viernes: false, sabado: false, domingo: false },
    'merienda-raquel-javier': { lunes: false, martes: false, miercoles: false, jueves: false, viernes: false, sabado: false, domingo: false },
    'cena': { lunes: false, martes: false, miercoles: false, jueves: false, viernes: false, sabado: false, domingo: false }
  }
};

let currentWeekOffset = 0;

function getComidasContent(userId, isAdmin) {
  const baseDate = new Date('2024-09-02'); // Semana inicial
  const currentWeekDate = new Date(baseDate);
  currentWeekDate.setDate(baseDate.getDate() + (currentWeekOffset * 7));
  
  const weekKey = currentWeekDate.toISOString().split('T')[0];
  const weekData = mealPlan[weekKey] || {};
  const statusData = mealStatus[weekKey] || {};
  
  // Inicializar semana vacía si no existe
  if (!mealPlan[weekKey] && weekKey !== '2024-09-02') {
    mealPlan[weekKey] = {
      'desayuno-alba-mario': { lunes: '', martes: '', miercoles: '', jueves: '', viernes: '', sabado: '', domingo: '' },
      'desayuno-raquel-javier': { lunes: '', martes: '', miercoles: '', jueves: '', viernes: '', sabado: '', domingo: '' },
      'almuerzo-alba-mario': { lunes: '', martes: '', miercoles: '', jueves: '', viernes: '', sabado: '', domingo: '' },
      'almuerzo-raquel-javier': { lunes: '', martes: '', miercoles: '', jueves: '', viernes: '', sabado: '', domingo: '' },
      'comida': { lunes: '', martes: '', miercoles: '', jueves: '', viernes: '', sabado: '', domingo: '' },
      'merienda-alba-mario': { lunes: '', martes: '', miercoles: '', jueves: '', viernes: '', sabado: '', domingo: '' },
      'merienda-raquel-javier': { lunes: '', martes: '', miercoles: '', jueves: '', viernes: '', sabado: '', domingo: '' },
      'cena': { lunes: '', martes: '', miercoles: '', jueves: '', viernes: '', sabado: '', domingo: '' }
    };
    mealStatus[weekKey] = {
      'desayuno-alba-mario': { lunes: false, martes: false, miercoles: false, jueves: false, viernes: false, sabado: false, domingo: false },
      'desayuno-raquel-javier': { lunes: false, martes: false, miercoles: false, jueves: false, viernes: false, sabado: false, domingo: false },
      'almuerzo-alba-mario': { lunes: false, martes: false, miercoles: false, jueves: false, viernes: false, sabado: false, domingo: false },
      'almuerzo-raquel-javier': { lunes: false, martes: false, miercoles: false, jueves: false, viernes: false, sabado: false, domingo: false },
      'comida': { lunes: false, martes: false, miercoles: false, jueves: false, viernes: false, sabado: false, domingo: false },
      'merienda-alba-mario': { lunes: false, martes: false, miercoles: false, jueves: false, viernes: false, sabado: false, domingo: false },
      'merienda-raquel-javier': { lunes: false, martes: false, miercoles: false, jueves: false, viernes: false, sabado: false, domingo: false },
      'cena': { lunes: false, martes: false, miercoles: false, jueves: false, viernes: false, sabado: false, domingo: false }
    };
  }
  
  const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const meals = [
    { id: 'desayuno-alba-mario', name: 'Desayuno Alba y Mario' },
    { id: 'desayuno-raquel-javier', name: 'Desayuno Raquel y Javier' },
    { id: 'almuerzo-alba-mario', name: 'Almuerzo Alba y Mario' },
    { id: 'almuerzo-raquel-javier', name: 'Almuerzo Raquel y Javier' },
    { id: 'comida', name: 'Comida' },
    { id: 'merienda-alba-mario', name: 'Merienda Alba y Mario' },
    { id: 'merienda-raquel-javier', name: 'Merienda Raquel y Javier' },
    { id: 'cena', name: 'Cena' }
  ];
  
  function canUserMarkMeal(userId, mealId, day) {
    if (userId === 'mario' || userId === 'alba') return false;
    if (userId === 'javier') {
      if (mealId === 'cena' && ['lunes', 'martes', 'miercoles', 'jueves'].includes(day)) {
        return false;
      }
      return true;
    }
    if (userId === 'raquel') {
      return mealId === 'cena' && ['lunes', 'martes', 'miercoles', 'jueves'].includes(day);
    }
    return false;
  }
  
  const startDate = new Date(currentWeekDate);
  const endDate = new Date(currentWeekDate);
  endDate.setDate(startDate.getDate() + 6);
  
  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  };
  
  const weekTitle = `Semana del ${formatDate(startDate)} al ${formatDate(endDate)} ${currentWeekDate.getFullYear()}`;
  
  return `
    <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 24px; background: linear-gradient(to right, #f59e0b, #d97706); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Calendario de Comidas</h2>
    
    <div style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
      <button onclick="changeWeek(-1)" style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">← Semana Anterior</button>
      <h3 id="week-title">${weekTitle}</h3>
      <button onclick="changeWeek(1)" style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">Semana Siguiente →</button>
    </div>
    
    <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr>
            <th style="padding: 12px; border: 1px solid #e5e7eb; background: #f9fafb; width: 200px;"></th>
            ${dayNames.map(day => `<th style="padding: 12px; border: 1px solid #e5e7eb; background: #f9fafb; text-align: center; font-weight: 600;">${day}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${meals.map(meal => `
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: 600; font-size: 12px;">${meal.name}</td>
              ${days.map(day => {
                const content = weekData[meal.id]?.[day] || '';
                const isCompleted = statusData[meal.id]?.[day] || false;
                const cellId = `${meal.id}-${day}`;
                
                if (isAdmin) {
                  return `
                    <td style="padding: 8px; border: 1px solid #e5e7eb; position: relative; min-height: 60px; vertical-align: top;">
                      <div onclick="editMeal('${cellId}', '${meal.id}', '${day}')" style="cursor: pointer; min-height: 40px; padding: 4px; border-radius: 4px; background: ${isCompleted ? '#dcfce7' : 'transparent'}; border: 1px dashed #d1d5db;">
                        ${content || '<span style="color: #9ca3af;">Hacer clic para editar</span>'}
                      </div>
                      ${content && !isCompleted ? `<button onclick="toggleMealStatus('${meal.id}', '${day}')" style="position: absolute; top: 4px; right: 4px; padding: 2px 6px; background: #10b981; color: white; border: none; border-radius: 3px; font-size: 10px; cursor: pointer;">✓</button>` : ''}
                      ${content && isCompleted ? `<button onclick="toggleMealStatus('${meal.id}', '${day}')" style="position: absolute; top: 4px; right: 4px; padding: 2px 6px; background: #ef4444; color: white; border: none; border-radius: 3px; font-size: 10px; cursor: pointer;">✗</button>` : ''}
                    </td>
                  `;
                } else {
                  const canMark = canUserMarkMeal(userId, meal.id, day);
                  return `
                    <td style="padding: 8px; border: 1px solid #e5e7eb; position: relative; min-height: 60px; vertical-align: top; background: ${isCompleted ? '#dcfce7' : 'white'};">
                      <div style="min-height: 40px; padding: 4px;">
                        ${content || '<span style="color: #9ca3af;">-</span>'}
                      </div>
                      ${content && canMark && !isCompleted ? `<button onclick="toggleMealStatus('${meal.id}', '${day}')" style="position: absolute; top: 4px; right: 4px; padding: 2px 6px; background: #10b981; color: white; border: none; border-radius: 3px; font-size: 10px; cursor: pointer;">Hecho</button>` : ''}
                      ${content && canMark && isCompleted ? `<button onclick="toggleMealStatus('${meal.id}', '${day}')" style="position: absolute; top: 4px; right: 4px; padding: 2px 6px; background: #ef4444; color: white; border: none; border-radius: 3px; font-size: 10px; cursor: pointer;">No hecho</button>` : ''}
                    </td>
                  `;
                }
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    ${isAdmin ? `
      <div id="edit-meal-modal" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 12px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 1000; width: 400px; max-width: 90vw;">
        <h3 style="margin-bottom: 16px;">Editar Comida</h3>
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">Tipo:</label>
          <div style="display: flex; gap: 12px; margin-bottom: 16px;">
            <label style="display: flex; align-items: center; gap: 4px;">
              <input type="radio" name="meal-type" value="text" checked onchange="toggleMealType()"> Texto libre
            </label>
            <label style="display: flex; align-items: center; gap: 4px;">
              <input type="radio" name="meal-type" value="recipe" onchange="toggleMealType()"> Receta
            </label>
          </div>
        </div>
        <div id="text-input" style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 4px; font-weight: 500;">Descripción:</label>
          <textarea id="meal-text" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; resize: vertical;" rows="3"></textarea>
        </div>
        <div id="recipe-input" style="display: none; margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 4px; font-weight: 500;">Seleccionar Receta:</label>
          <select id="meal-recipe" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
            <option value="">Seleccionar...</option>
            ${recipes.map(recipe => `<option value="${recipe.name}">${recipe.name}</option>`).join('')}
          </select>
        </div>
        <div style="display: flex; gap: 12px;">
          <button onclick="saveMeal()" style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">Guardar</button>
          <button onclick="clearMeal()" style="padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">Limpiar</button>
          <button onclick="closeMealModal()" style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
        </div>
      </div>
      <div id="meal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999;" onclick="closeMealModal()"></div>
    ` : ''}
    
    <script>
      let currentMealCell = null;
      let currentMealId = null;
      let currentDay = null;
      
      function changeWeek(direction) {
        const url = new URL(window.location);
        const currentOffset = parseInt(url.searchParams.get('weekOffset') || '0');
        const newOffset = currentOffset + direction;
        url.searchParams.set('weekOffset', newOffset);
        window.location.href = url.toString();
      }
      
      function editMeal(cellId, mealId, day) {
        currentMealCell = cellId;
        currentMealId = mealId;
        currentDay = day;
        
        const currentContent = document.querySelector('[onclick*="' + cellId + '"]').textContent.trim();
        if (currentContent !== 'Hacer clic para editar') {
          document.getElementById('meal-text').value = currentContent;
        }
        
        document.getElementById('edit-meal-modal').style.display = 'block';
        document.getElementById('meal-overlay').style.display = 'block';
      }
      
      function toggleMealType() {
        const isText = document.querySelector('input[name="meal-type"]:checked').value === 'text';
        document.getElementById('text-input').style.display = isText ? 'block' : 'none';
        document.getElementById('recipe-input').style.display = isText ? 'none' : 'block';
      }
      
      function saveMeal() {
        alert('Funcionalidad de guardar comida pendiente');
        closeMealModal();
      }
      
      function clearMeal() {
        if (confirm('¿Estás seguro de que quieres limpiar esta comida?')) {
          alert('Funcionalidad de limpiar comida pendiente');
          closeMealModal();
        }
      }
      
      function closeMealModal() {
        document.getElementById('edit-meal-modal').style.display = 'none';
        document.getElementById('meal-overlay').style.display = 'none';
        currentMealCell = null;
        currentMealId = null;
        currentDay = null;
      }
      
      function toggleMealStatus(mealId, day) {
        const cell = event.target.parentElement;
        const cellContent = cell.querySelector('div').textContent.trim();
        const isRecipe = ${JSON.stringify(recipes.map(r => r.name))}.includes(cellContent);
        const isCurrentlyCompleted = event.target.textContent.trim() === 'No hecho';
        
        // Cambiar estado visual inmediatamente
        if (isCurrentlyCompleted) {
          // Desmarcar: fondo blanco, botón verde "Hecho"
          cell.style.background = 'white';
          event.target.style.background = '#10b981';
          event.target.textContent = 'Hecho';
          
          if (isRecipe) {
            alert('Receta desmarcada. Ingredientes devueltos al inventario.');
          } else {
            alert('Comida desmarcada.');
          }
        } else {
          // Marcar: fondo verde claro, botón rojo "No hecho"
          cell.style.background = '#dcfce7';
          event.target.style.background = '#ef4444';
          event.target.textContent = 'No hecho';
          
          if (isRecipe) {
            alert('Receta marcada como hecha. Ingredientes descontados del inventario.');
          } else {
            alert('Comida marcada como hecha.');
          }
        }
      }
    </script>
  `;
}

const shoppingList = {
  'Carne internet': [],
  'Pescadería': [],
  'Del bancal a casa': [],
  'Alcampo': [],
  'Internet': [],
  'Otros': []
};

// Sistema de mensajes mejorado
const groupMessages = [];
const adminMessages = [];
const privateChats = {};
const unreadMessages = {
  javier: { total: 0, chats: {} },
  raquel: { total: 0, chats: {} },
  mario: { total: 0, chats: {} },
  alba: { total: 0, chats: {} },
  javi_administrador: { total: 0, chats: {} }
};

let messageIdCounter = 1;

// Función para obtener timestamp
function getTimestamp() {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${day}/${month} ${hours}:${minutes}`;
}

// Función para incrementar notificaciones
function addNotification(excludeUser, targetUser = null, type = 'general') {
  if (type === 'private' && targetUser) {
    if (unreadMessages[targetUser]) {
      unreadMessages[targetUser].total++;
      if (!unreadMessages[targetUser].chats[excludeUser]) {
        unreadMessages[targetUser].chats[excludeUser] = 0;
      }
      unreadMessages[targetUser].chats[excludeUser]++;
    }
  } else {
    Object.keys(unreadMessages).forEach(user => {
      if (user !== excludeUser) {
        unreadMessages[user].total++;
      }
    });
  }
}

function getComprasContent(userId, isAdmin) {
  // Generar lista automática basada en inventario
  const autoList = {};
  const suggestions = [];
  
  Object.values(inventoryByCategory).flat().forEach(product => {
    if (product.quantity === 0) {
      if (!autoList[product.store]) autoList[product.store] = [];
      autoList[product.store].push({ ...product, auto: true });
    } else if (product.quantity === 1) {
      suggestions.push(product);
    }
  });
  
  const stores = ['Carne internet', 'Pescadería', 'Del bancal a casa', 'Alcampo', 'Internet', 'Otros'];
  
  return `
    <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 24px; background: linear-gradient(to right, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Lista de la Compra</h2>
    
    ${suggestions.length > 0 ? `
      <div style="background: #fef3c7; border-radius: 12px; padding: 16px; margin-bottom: 24px; border-left: 4px solid #f59e0b;">
        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 12px; color: #92400e;">Sugerencias (Cantidad: 1)</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${suggestions.map(product => `
            <button onclick="addToShoppingList('${product.store}', '${product.name}')" style="padding: 6px 12px; background: #f59e0b; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;">
              + ${product.name}
            </button>
          `).join('')}
        </div>
      </div>
    ` : ''}
    
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 12px;">Añadir producto:</h3>
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <select id="product-select" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; flex: 1; min-width: 200px;">
          <option value="">Seleccionar producto...</option>
          ${Object.values(inventoryByCategory).flat().map(product => `
            <option value="${product.store}|${product.name}">${product.name}</option>
          `).join('')}
        </select>
        <button onclick="addSelectedProduct()" style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">Añadir</button>
      </div>
    </div>
    
    ${stores.map(store => `
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 12px; color: #374151;">${store}</h3>
        <div style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); min-height: 60px;">
          ${autoList[store] ? autoList[store].map(product => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #f3f4f6; background: #fef2f2;">
              <span>${product.name} <small style="color: #ef4444;">(Sin stock)</small></span>
              <button onclick="removeFromShoppingList('${store}', '${product.name}')" style="padding: 4px 8px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Quitar</button>
            </div>
          `).join('') : '<p style="color: #9ca3af; text-align: center; padding: 20px;">No hay productos para comprar en ${store}</p>'}
        </div>
      </div>
    `).join('')}
    
    <script>
      function addToShoppingList(store, productName) {
        alert('Añadido ' + productName + ' a la lista de ' + store);
      }
      
      function addSelectedProduct() {
        const select = document.getElementById('product-select');
        if (select.value) {
          const [store, productName] = select.value.split('|');
          addToShoppingList(store, productName);
          select.value = '';
        }
      }
      
      function removeFromShoppingList(store, productName) {
        if (confirm('¿Quitar ' + productName + ' de la lista?')) {
          alert('Producto quitado de la lista');
        }
      }
    </script>
  `;
}

function getMensajesContent(userId, isAdmin) {
  const users = ['javier', 'raquel', 'mario', 'alba'];
  const userNames = { javier: 'Javier', raquel: 'Raquel', mario: 'Mario', alba: 'Alba' };
  const otherUsers = users.filter(u => u !== userId && u !== 'javi_administracion');
  
  return `
    <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 24px; background: linear-gradient(to right, #8b5cf6, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Mensajes</h2>
    
    <!-- Mensajes al grupo -->
    <div style="margin-bottom: 32px;">
      <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 16px; color: #7c3aed;">Mensajes al grupo</h3>
      <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div id="group-messages" style="max-height: 400px; overflow-y: auto; margin-bottom: 16px; background: #f9fafb; border-radius: 8px; padding: 12px;">
          ${groupMessages.length > 0 ? groupMessages.map(msg => `
            <div style="margin-bottom: 12px; padding: 8px; background: white; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <strong style="color: #7c3aed; font-size: 14px;">${userNames[msg.user]}</strong>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <small style="color: #6b7280; font-size: 12px;">${msg.timestamp}</small>
                  ${msg.user === userId ? `<button onclick="deleteMessage('group', ${msg.id})" style="padding: 2px 6px; background: #ef4444; color: white; border: none; border-radius: 3px; font-size: 10px; cursor: pointer;">Eliminar</button>` : ''}
                </div>
              </div>
              <p style="color: #374151; margin: 0; font-size: 14px;">${msg.message}</p>
            </div>
          `).join('') : '<p style="color: #6b7280; text-align: center; padding: 20px;">No hay mensajes aún. ¡Sé el primero en escribir!</p>'}
        </div>
        <div style="display: flex; gap: 12px;">
          <input type="text" id="group-input" placeholder="Escribe tu mensaje al grupo..." style="flex: 1; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" onkeypress="if(event.key==='Enter') sendGroupMessage()">
          <button onclick="sendGroupMessage()" style="padding: 12px 20px; background: #7c3aed; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">Enviar</button>
        </div>
      </div>
    </div>
    
    <!-- Chats personales -->
    <div style="margin-bottom: 32px;">
      <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 16px; color: #dc2626;">Chats personales</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
        ${otherUsers.map(targetUser => {
          const chatKey = [userId, targetUser].sort().join('-');
          const messages = privateChats[chatKey] || [];
          const lastMessage = messages[messages.length - 1];
          return `
            <div style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #dc2626;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h4 style="font-size: 16px; font-weight: bold; color: #dc2626; margin: 0;">${userNames[targetUser]}</h4>
                <span style="padding: 4px 8px; background: #f3f4f6; border-radius: 4px; font-size: 12px; color: #6b7280;" id="unread-${targetUser}">${unreadMessages[userId] && unreadMessages[userId].chats[targetUser] ? unreadMessages[userId].chats[targetUser] + ' nuevos' : ''}</span>
              </div>
              ${lastMessage ? `
                <div style="background: #f3f4f6; border-radius: 6px; padding: 8px; margin-bottom: 8px;">
                  <small style="color: #6b7280; font-size: 11px;">${lastMessage.from === userId ? 'Tú' : userNames[lastMessage.from]}: ${lastMessage.message.length > 30 ? lastMessage.message.substring(0, 30) + '...' : lastMessage.message}</small>
                </div>
              ` : '<p style="color: #9ca3af; font-size: 12px; margin: 0;">No hay mensajes</p>'}
              <div id="chat-${targetUser}" style="margin-top: 12px;">
                <div id="messages-${targetUser}" style="max-height: 200px; overflow-y: auto; margin-bottom: 12px; background: #f9fafb; border-radius: 6px; padding: 8px;">
                  ${messages.length > 0 ? messages.map(msg => `
                    <div style="margin-bottom: 8px; text-align: ${msg.from === userId ? 'right' : 'left'};">
                      <div style="display: inline-block; max-width: 80%; padding: 6px 10px; border-radius: 12px; background: ${msg.from === userId ? '#3b82f6' : '#e5e7eb'}; color: ${msg.from === userId ? 'white' : '#374151'}; font-size: 13px;">
                        <p style="margin: 0;">${msg.message}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px;">
                          <small style="opacity: 0.8; font-size: 10px;">${msg.timestamp}</small>
                          ${msg.from === userId ? `<button onclick="deleteMessage('private', ${msg.id}, '${targetUser}')" style="padding: 1px 4px; background: rgba(255,255,255,0.3); color: white; border: none; border-radius: 2px; font-size: 9px; cursor: pointer; margin-left: 4px;">×</button>` : ''}
                        </div>
                      </div>
                    </div>
                  `).join('') : '<p style="color: #6b7280; text-align: center; font-size: 12px;">No hay mensajes</p>'}
                </div>
                <div style="display: flex; gap: 8px;">
                  <input type="text" id="input-${targetUser}" placeholder="Escribe a ${userNames[targetUser]}..." style="flex: 1; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px;" onkeypress="if(event.key==='Enter') sendPrivateMessage('${targetUser}')">
                  <button onclick="sendPrivateMessage('${targetUser}')" style="padding: 8px 12px; background: #dc2626; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;">Enviar</button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
    
    <!-- Sugerencias para el administrador -->
    <div>
      <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 16px; color: #059669;">Sugerencias para el administrador</h3>
      <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div id="admin-messages" style="max-height: 300px; overflow-y: auto; margin-bottom: 16px; background: #f9fafb; border-radius: 8px; padding: 12px;">
          ${adminMessages.length > 0 ? adminMessages.map(msg => `
            <div style="margin-bottom: 12px; padding: 8px; background: white; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <strong style="color: #059669; font-size: 14px;">${userNames[msg.user]}</strong>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <small style="color: #6b7280; font-size: 12px;">${msg.timestamp}</small>
                  ${msg.user === userId ? `<button onclick="deleteMessage('admin', ${msg.id})" style="padding: 2px 6px; background: #ef4444; color: white; border: none; border-radius: 3px; font-size: 10px; cursor: pointer;">Eliminar</button>` : ''}
                </div>
              </div>
              <p style="color: #374151; margin: 0; font-size: 14px;">${msg.message}</p>
              ${msg.reply ? `<div style="margin-top: 8px; padding: 8px; background: #f0fdf4; border-radius: 4px; border-left: 3px solid #059669; font-size: 13px;"><strong>Javier:</strong> ${msg.reply}</div>` : ''}
            </div>
          `).join('') : '<p style="color: #6b7280; text-align: center; padding: 20px;">No hay sugerencias aún</p>'}
        </div>
        <div style="display: flex; gap: 12px;">
          <input type="text" id="admin-input" placeholder="Escribe tu sugerencia al Administrador..." style="flex: 1; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" onkeypress="if(event.key==='Enter') sendAdminMessage()">
          <button onclick="sendAdminMessage()" style="padding: 12px 20px; background: #059669; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">Enviar</button>
        </div>
      </div>
    </div>
    
    <script>
      const currentUser = '${userId}';
      const userNames = ${JSON.stringify(userNames)};
      
      // Marcar mensajes como leídos al entrar a la sección
      markMessagesAsRead();
      
      function markMessagesAsRead() {
        fetch('/api/mark-read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser })
        });
      }
      
      function sendGroupMessage() {
        const input = document.getElementById('group-input');
        if (input.value.trim()) {
          fetch('/api/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'group',
              message: input.value.trim(),
              from: currentUser
            })
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              addMessageToDOM('group-messages', data.message, 'group');
              // Agregar atributo para tracking
              const lastMessage = document.querySelector('#group-messages > div:last-child');
              if (lastMessage) lastMessage.setAttribute('data-message-id', data.message.id);
              input.value = '';
            }
          });
        }
      }
      
      function sendAdminMessage() {
        const input = document.getElementById('admin-input');
        if (input.value.trim()) {
          fetch('/api/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'admin',
              message: input.value.trim(),
              from: currentUser
            })
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              addMessageToDOM('admin-messages', data.message, 'admin');
              // Agregar atributo para tracking
              const lastMessage = document.querySelector('#admin-messages > div:last-child');
              if (lastMessage) lastMessage.setAttribute('data-message-id', data.message.id);
              input.value = '';
            }
          });
        }
      }
      
      // Auto-scroll y marcar como leído al hacer scroll
      document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('[id^="messages-"]').forEach(container => {
          container.scrollTop = container.scrollHeight;
          container.addEventListener('focus', function() {
            const targetUser = this.id.replace('messages-', '');
            const unreadSpan = document.getElementById('unread-' + targetUser);
            if (unreadSpan && unreadSpan.textContent) {
              unreadSpan.textContent = '';
              unreadSpan.style.background = '#f3f4f6';
              unreadSpan.style.color = '#6b7280';
            }
          });
        });
      });
      
      function sendPrivateMessage(targetUser) {
        const input = document.getElementById('input-' + targetUser);
        if (input.value.trim()) {
          fetch('/api/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'private',
              message: input.value.trim(),
              from: currentUser,
              to: targetUser
            })
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              addPrivateMessageToDOM(targetUser, data.message);
              // Agregar atributo para tracking
              const lastMessage = document.querySelector('#messages-' + targetUser + ' > div:last-child');
              if (lastMessage) lastMessage.setAttribute('data-message-id', data.message.id);
              input.value = '';
            }
          });
        }
      }
      
      function deleteMessage(type, messageId, targetUser = null) {
        if (confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
          const chatKey = targetUser ? [currentUser, targetUser].sort().join('-') : null;
          
          fetch('/api/delete-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, messageId, chatKey })
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              const button = event.target;
              const messageDiv = button.closest('div[style*="margin-bottom: 12px"], div[style*="margin-bottom: 8px"]');
              if (messageDiv) {
                messageDiv.remove();
                
                // Verificar si no quedan mensajes
                if (type === 'group') {
                  const container = document.getElementById('group-messages');
                  if (!container.innerHTML.trim() || container.children.length === 0) {
                    container.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 20px;">No hay mensajes aún. ¡Sé el primero en escribir!</p>';
                  }
                } else if (type === 'admin') {
                  const container = document.getElementById('admin-messages');
                  if (!container.innerHTML.trim() || container.children.length === 0) {
                    container.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 20px;">No hay sugerencias aún</p>';
                  }
                } else if (type === 'private' && targetUser) {
                  const container = document.getElementById('messages-' + targetUser);
                  if (!container.innerHTML.trim() || container.children.length === 0) {
                    container.innerHTML = '<p style="color: #6b7280; text-align: center; font-size: 12px;">No hay mensajes</p>';
                  }
                }
              }
            }
          });
        }
      }
      
      function addMessageToDOM(containerId, message, type) {
        const messagesDiv = document.getElementById(containerId);
        const color = type === 'group' ? '#7c3aed' : '#059669';
        const messageHtml = \`
          <div style="margin-bottom: 12px; padding: 8px; background: white; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong style="color: \${color}; font-size: 14px;">\${userNames[message.user]}</strong>
              <div style="display: flex; align-items: center; gap: 8px;">
                <small style="color: #6b7280; font-size: 12px;">\${message.timestamp}</small>
                \${message.user === currentUser ? \`<button onclick="deleteMessage('\${type}', \${message.id})" style="padding: 2px 6px; background: #ef4444; color: white; border: none; border-radius: 3px; font-size: 10px; cursor: pointer;">Eliminar</button>\` : ''}
              </div>
            </div>
            <p style="color: #374151; margin: 0; font-size: 14px;">\${message.message}</p>
          </div>
        \`;
        
        if (messagesDiv.innerHTML.includes('No hay mensajes') || messagesDiv.innerHTML.includes('No hay sugerencias')) {
          messagesDiv.innerHTML = messageHtml;
        } else {
          messagesDiv.innerHTML += messageHtml;
        }
        
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      }
      
      function addPrivateMessageToDOM(targetUser, message) {
        const messagesDiv = document.getElementById('messages-' + targetUser);
        const messageHtml = \`
          <div style="margin-bottom: 8px; text-align: right;" data-message-id="\${message.id}">
            <div style="display: inline-block; max-width: 80%; padding: 6px 10px; border-radius: 12px; background: #3b82f6; color: white; font-size: 13px;">
              <p style="margin: 0;">\${message.message}</p>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px;">
                <small style="opacity: 0.8; font-size: 10px;">\${message.timestamp}</small>
                <button onclick="deleteMessage('private', \${message.id}, '\${targetUser}')" style="padding: 1px 4px; background: rgba(255,255,255,0.3); color: white; border: none; border-radius: 2px; font-size: 9px; cursor: pointer; margin-left: 4px;">×</button>
              </div>
            </div>
          </div>
        \`;
        
        if (messagesDiv.innerHTML.includes('No hay mensajes')) {
          messagesDiv.innerHTML = messageHtml;
        } else {
          messagesDiv.innerHTML += messageHtml;
        }
        
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      }
      
      // Actualizar mensajes cada 3 segundos
      setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetch('/api/messages')
          .then(response => response.json())
          .then(data => {
            updateMessages(data);
          });
        }
      }, 3000);
      
      function updateMessages(data) {
        // Actualizar mensajes del grupo
        const groupContainer = document.getElementById('group-messages');
        if (groupContainer && data.groupMessages.length > 0) {
          const currentMessages = groupContainer.querySelectorAll('[data-message-id]').length;
          if (data.groupMessages.length > currentMessages) {
            // Hay mensajes nuevos
            const newMessages = data.groupMessages.slice(currentMessages);
            newMessages.forEach(msg => {
              if (msg.user !== currentUser) {
                addMessageToDOM('group-messages', msg, 'group');
              }
            });
          }
        }
        
        // Actualizar mensajes de admin
        const adminContainer = document.getElementById('admin-messages');
        if (adminContainer && data.adminMessages.length > 0) {
          const currentMessages = adminContainer.querySelectorAll('[data-message-id]').length;
          if (data.adminMessages.length > currentMessages) {
            const newMessages = data.adminMessages.slice(currentMessages);
            newMessages.forEach(msg => {
              if (msg.user !== currentUser) {
                addMessageToDOM('admin-messages', msg, 'admin');
              }
            });
          }
        }
        
        // Actualizar chats privados
        Object.keys(data.privateChats).forEach(chatKey => {
          const [user1, user2] = chatKey.split('-');
          const targetUser = user1 === currentUser ? user2 : user1;
          const messagesContainer = document.getElementById('messages-' + targetUser);
          
          if (messagesContainer) {
            const currentMessages = messagesContainer.querySelectorAll('[data-message-id]').length;
            const chatMessages = data.privateChats[chatKey] || [];
            
            if (chatMessages.length > currentMessages) {
              const newMessages = chatMessages.slice(currentMessages);
              newMessages.forEach(msg => {
                if (msg.from !== currentUser) {
                  addReceivedPrivateMessage(targetUser, msg);
                  // Actualizar contador
                  const unreadSpan = document.getElementById('unread-' + targetUser);
                  if (unreadSpan) {
                    const current = parseInt(unreadSpan.textContent) || 0;
                    unreadSpan.textContent = (current + 1) + ' nuevos';
                    unreadSpan.style.background = '#fef3c7';
                    unreadSpan.style.color = '#92400e';
                  }
                }
              });
            }
          }
        });
        
        // Actualizar notificaciones globales
        if (data.unreadMessages && data.unreadMessages[currentUser]) {
          const totalUnread = data.unreadMessages[currentUser].total;
          const badge = document.querySelector('a[href*="mensajes"] span');
          if (badge && totalUnread > 0) {
            badge.textContent = totalUnread;
          }
        }
      }
      
      function addReceivedPrivateMessage(fromUser, message) {
        const messagesDiv = document.getElementById('messages-' + fromUser);
        if (messagesDiv) {
          const messageHtml = \`
            <div style="margin-bottom: 8px; text-align: left;" data-message-id="\${message.id}">
              <div style="display: inline-block; max-width: 80%; padding: 6px 10px; border-radius: 12px; background: #e5e7eb; color: #374151; font-size: 13px;">
                <p style="margin: 0;">\${message.message}</p>
                <small style="opacity: 0.8; font-size: 10px;">\${message.timestamp}</small>
              </div>
            </div>
          \`;
          
          if (messagesDiv.innerHTML.includes('No hay mensajes')) {
            messagesDiv.innerHTML = messageHtml;
          } else {
            messagesDiv.innerHTML += messageHtml;
          }
          
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
      }
    </script>
  `;
}

function getContent(section, userId) {
  const isAdmin = userId === 'javi_administrador';
  switch(section) {
    case 'actividades':
      return getActivitiesContent(userId, isAdmin);
    case 'comidas':
      return getComidasContent(userId, isAdmin);
    case 'compras':
      return getComprasContent(userId, isAdmin);
    case 'mensajes':
      return getMensajesContent(userId, isAdmin);
    case 'inventario':
      return getInventarioContent(userId, isAdmin);
    case 'recetas':
      return getRecetasContent(userId, isAdmin);
    default:
      return '<h2 style="font-size: 24px; font-weight: bold; margin-bottom: 24px; background: linear-gradient(to right, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Actividades</h2><div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"><p>Próximamente - Gestión de actividades familiares</p></div>';
  }
}

function getTodayDate() {
  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = today.toLocaleDateString('es-ES', options);
  return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
}

function getNavigation(userId, currentSection, userToken) {
  const permissions = {
    javier: ['actividades', 'comidas', 'recetas', 'inventario', 'compras', 'mensajes'],
    raquel: ['actividades', 'comidas', 'recetas', 'inventario', 'compras', 'mensajes'],
    mario: ['actividades', 'comidas', 'inventario', 'compras', 'mensajes'],
    alba: ['actividades', 'comidas', 'inventario', 'compras', 'mensajes'],
    javi_administrador: ['actividades', 'comidas', 'mensajes', 'compras', 'inventario', 'recetas']
  };
  
  const sections = {
    actividades: { icon: '📅', name: 'Actividades' },
    comidas: { icon: '🍽️', name: 'Comidas' },
    mensajes: { icon: '💬', name: 'Mensajes' },
    compras: { icon: '🛒', name: 'Lista de la compra' },
    inventario: { icon: '📦', name: 'Inventario' },
    recetas: { icon: '👨🍳', name: 'Recetas' }
  };
  
  const userSections = permissions[userId] || [];
  const userUnread = unreadMessages[userId] ? unreadMessages[userId].total : 0;
  const userType = userId === 'javi_administrador' ? 'admin' : userId;
  const baseUrl = `/${userType}/${userToken.split('_')[1]}`;
  
  return userSections.map(sectionId => {
    const section = sections[sectionId];
    const isActive = currentSection === sectionId;
    const notification = sectionId === 'mensajes' && userUnread > 0 ? ` <span style="background: #ef4444; color: white; border-radius: 50%; padding: 2px 6px; font-size: 10px; font-weight: bold; min-width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center;">${userUnread}</span>` : '';
    return `<a href="${baseUrl}?section=${sectionId}" class="btn ${isActive ? 'active' : ''}" ${sectionId === 'mensajes' ? 'onclick="markMessagesAsRead()"' : ''}>${section.icon} ${section.name}${notification}</a>`;
  }).join('');
}

function getTodayQuote() {
  const quotes = [
    "Cuando eliges pensamientos de amor, todo tu mundo se ordena. (Wayne Dyer)",
    "Tu mente es la semilla, tu vida es la cosecha. (Joe Dispenza)",
    "Nada real puede ser amenazado; nada irreal existe. (Un curso de milagros)",
    "El dinero es energía, y se mueve hacia quien le da dirección. (Raimón Samsó)",
    "El futuro no está escrito, se crea en tu mente. (Wayne Dyer)"
  ];
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  return quotes[(dayOfYear - 1) % quotes.length];
}

const port = process.env.PORT || 7777;
server.listen(port, '0.0.0.0', () => {
  console.log(`Servidor funcionando en puerto ${port}`);
});