const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Sistema de persistencia
const DATA_FILE = path.join(__dirname, 'data.json');

function saveData() {
  const data = {
    activities,
    groupMessages,
    adminMessages,
    privateChats,
    unreadMessages,
    mealPlan,
    mealStatus,
    inventoryByCategory,
    messageIdCounter
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      Object.assign(activities, data.activities || {});
      groupMessages.push(...(data.groupMessages || []));
      adminMessages.push(...(data.adminMessages || []));
      Object.assign(privateChats, data.privateChats || {});
      Object.assign(unreadMessages, data.unreadMessages || {});
      Object.assign(mealPlan, data.mealPlan || {});
      Object.assign(mealStatus, data.mealStatus || {});
      Object.assign(inventoryByCategory, data.inventoryByCategory || {});
      messageIdCounter = data.messageIdCounter || 1;
    } catch (e) {
      console.log('Error cargando datos:', e.message);
    }
  }
}

const USERS = {
  javier: { id: 'javier', name: 'Javier', token: 'jav_abc123xyz789def456', allowedIPs: [] },
  raquel: { id: 'raquel', name: 'Raquel', token: 'raq_uvw012rst345ghi678', allowedIPs: [] },
  mario: { id: 'mario', name: 'Mario', token: 'mar_jkl901mno234pqr567', allowedIPs: [] },
  alba: { id: 'alba', name: 'Alba', token: 'alb_stu890vwx123yzb456', allowedIPs: [] },
  javi_administrador: { id: 'javi_administrador', name: 'Administrador', token: 'adm_cde789fgh012ijl345', allowedIPs: [] }
};

const activities = {
  javier: [],
  raquel: [],
  mario: [],
  alba: []
};

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

const inventoryByCategory = {
  carnes: [
    { id: 1, name: 'Jamón', category: 'carnes', store: 'Carne internet', unit: 'paquetes', quantity: 0, minimum: 1 },
    { id: 2, name: 'Pollo (Muslo y contra muslo)', category: 'carnes', store: 'Carne internet', unit: 'unidades', quantity: 0, minimum: 1 }
  ],
  pescado: [
    { id: 6, name: 'Salmón fresco (filetes)', category: 'pescado', store: 'Pescadería', unit: 'unidades', quantity: 0, minimum: 1 }
  ],
  verduras: [
    { id: 12, name: 'Ajo', category: 'verduras', store: 'Del bancal a casa', unit: 'unidades', quantity: 0, minimum: 1 }
  ],
  otros: [
    { id: 27, name: 'Aceite', category: 'otros', store: 'Alcampo', unit: 'unidades', quantity: 0, minimum: 1 }
  ]
};

const mealPlan = {};
const mealStatus = {};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
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
      
      saveData();
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ success: true }));
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
        if (activity) {
          activity.completed = !activity.completed;
          
          saveData();
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
  
  // API para cambiar cantidad de inventario
  if (req.method === 'POST' && parsedUrl.pathname === '/api/change-quantity') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      const { productId, change } = data;
      
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
        
        saveData();
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ success: true, newQuantity }));
      } else {
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ success: false }));
      }
    });
    return;
  }
  
  // Acceso directo por token
  const pathMatch = parsedUrl.pathname.match(/^\\/(javier|raquel|mario|alba|admin)\\/([a-zA-Z0-9_]+)$/);
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
  
  // Página principal
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  res.end('<h1>Organización Familiar</h1>');
});

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
      </div>
    </div>
    <div class="main">
      <div class="top">
        <h1 style="font-size: 28px; font-weight: bold;">¡Hola, ${user.name}! 👋</h1>
      </div>
      <div class="content">
        ${getContent(section, user.id)}
      </div>
    </div>
  </div>
</body>
</html>`;
}

function getContent(section, userId) {
  const isAdmin = userId === 'javi_administrador';
  
  if (section === 'actividades') {
    return getActivitiesContent(userId, isAdmin);
  } else if (section === 'inventario') {
    return getInventarioContent(userId, isAdmin);
  }
  
  return '<h2>Sección en desarrollo</h2>';
}

function getActivitiesContent(userId, isAdmin) {
  if (isAdmin) {
    return `
      <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 24px;">Actividades - Administración</h2>
      <div style="margin-bottom: 24px; display: flex; gap: 12px;">
        <button onclick="showView('daily')" id="daily-btn" style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">Vista Diaria</button>
        <button onclick="showView('weekly')" id="weekly-btn" style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">Vista Semanal</button>
        <button onclick="showView('calendar')" id="calendar-btn" style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">Vista Calendario</button>
      </div>
      
      <div id="daily-view">
        <button onclick="showAddActivity()" style="padding: 12px 24px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; margin-bottom: 24px;">+ Añadir Actividad</button>
        
        <div id="add-activity" style="display: none; background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 24px;">
          <h3 style="margin-bottom: 16px;">Nueva Actividad</h3>
          <form onsubmit="addActivity(event)">
            <div style="margin-bottom: 16px;">
              <label style="display: block; margin-bottom: 4px; font-weight: 500;">Usuarios:</label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
                <label><input type="checkbox" name="users" value="javier"> Javier</label>
                <label><input type="checkbox" name="users" value="raquel"> Raquel</label>
                <label><input type="checkbox" name="users" value="mario"> Mario</label>
                <label><input type="checkbox" name="users" value="alba"> Alba</label>
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
            <div style="display: flex; gap: 12px;">
              <button type="submit" style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">Guardar</button>
              <button type="button" onclick="hideAddActivity()" style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
            </div>
          </form>
        </div>
        
        ${['javier', 'raquel', 'mario', 'alba'].map(user => `
          <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 24px;">
            <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 16px; text-transform: capitalize;">${user}</h3>
            ${activities[user] && activities[user].length > 0 ? activities[user].map(activity => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 8px;">
                <div>
                  <strong>${activity.title}</strong><br>
                  <small style="color: #6b7280;">${activity.time} - ${activity.duration} min</small>
                </div>
                <span style="color: ${activity.completed ? '#10b981' : '#ef4444'};">${activity.completed ? '✓ Hecho' : '✗ Pendiente'}</span>
              </div>
            `).join('') : '<p style="color: #6b7280;">Sin actividades</p>'}
          </div>
        `).join('')}
      </div>
      
      <div id="weekly-view" style="display: none;">
        <h3>Vista Semanal - En desarrollo</h3>
      </div>
      
      <div id="calendar-view" style="display: none;">
        <h3 style="margin-bottom: 16px;">Calendario de Actividades</h3>
        ${['javier', 'raquel', 'mario', 'alba'].map(user => `
          <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 16px;">
            <h4 style="font-size: 18px; font-weight: bold; margin-bottom: 16px; text-transform: capitalize; color: #374151;">${user}</h4>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-bottom: 16px;">
              ${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => `<div style="text-align: center; font-weight: bold; padding: 8px; background: #f3f4f6; border-radius: 4px;">${day}</div>`).join('')}
            </div>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;">
              ${Array.from({length: 7}, (_, i) => `<div style="padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px; min-height: 60px; background: white;"><div style="font-weight: bold; font-size: 12px; margin-bottom: 4px;">${i + 1}</div></div>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      
      <script>
        function showView(view) {
          document.getElementById('daily-view').style.display = view === 'daily' ? 'block' : 'none';
          document.getElementById('weekly-view').style.display = view === 'weekly' ? 'block' : 'none';
          document.getElementById('calendar-view').style.display = view === 'calendar' ? 'block' : 'none';
          document.getElementById('daily-btn').style.background = view === 'daily' ? '#10b981' : '#6b7280';
          document.getElementById('weekly-btn').style.background = view === 'weekly' ? '#10b981' : '#6b7280';
          document.getElementById('calendar-btn').style.background = view === 'calendar' ? '#10b981' : '#6b7280';
        }
        
        function showAddActivity() { 
          document.getElementById('add-activity').style.display = 'block'; 
        }
        
        function hideAddActivity() { 
          document.getElementById('add-activity').style.display = 'none'; 
        }
        
        function addActivity(e) { 
          e.preventDefault(); 
          const selectedUsers = Array.from(document.querySelectorAll('input[name="users"]:checked')).map(cb => cb.value);
          if (selectedUsers.length === 0) {
            alert('Selecciona al menos un usuario');
            return;
          }
          
          const formData = new FormData(e.target);
          const activityData = {
            users: selectedUsers,
            title: formData.get('title'),
            time: formData.get('time'),
            duration: formData.get('duration'),
            repeat: 'daily',
            startDate: new Date().toISOString().split('T')[0]
          };
          
          fetch('/api/add-activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(activityData)
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              alert('Actividad creada correctamente');
              hideAddActivity();
              location.reload();
            } else {
              alert('Error al crear la actividad');
            }
          })
          .catch(error => {
            console.error('Error:', error);
            alert('Error de conexión');
          });
        }
      </script>
    `;
  } else {
    const userActivities = activities[userId] || [];
    return `
      <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 24px;">Mis Actividades</h2>
      <div style="margin-bottom: 24px; display: flex; gap: 12px;">
        <button onclick="showView('daily')" id="daily-btn" style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">Vista Diaria</button>
        <button onclick="showView('weekly')" id="weekly-btn" style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">Vista Semanal</button>
        <button onclick="showView('calendar')" id="calendar-btn" style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">Vista Calendario</button>
      </div>
      
      <div id="daily-view">
        ${userActivities.length > 0 ? userActivities.map(activity => `
          <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 16px; border-left: 4px solid ${activity.completed ? '#10b981' : '#6b7280'};">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h4 style="font-size: 18px; font-weight: bold; margin-bottom: 4px;">${activity.title}</h4>
                <p style="color: #6b7280;">${activity.time} - ${activity.duration} minutos</p>
              </div>
              <button onclick="toggleActivity(${activity.id})" style="padding: 12px 20px; background: ${activity.completed ? '#ef4444' : '#10b981'}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
                ${activity.completed ? 'Marcar Pendiente' : 'Marcar Hecho'}
              </button>
            </div>
          </div>
        `).join('') : '<p style="color: #6b7280; background: white; padding: 24px; border-radius: 8px;">No tienes actividades para hoy</p>'}
      </div>
      
      <div id="weekly-view" style="display: none;">
        <h3>Vista Semanal - En desarrollo</h3>
      </div>
      
      <div id="calendar-view" style="display: none;">
        <h3>Vista Calendario</h3>
        <p>Aquí podrás ver tu calendario de actividades.</p>
      </div>
      
      <script>
        function showView(view) {
          document.getElementById('daily-view').style.display = view === 'daily' ? 'block' : 'none';
          document.getElementById('weekly-view').style.display = view === 'weekly' ? 'block' : 'none';
          document.getElementById('calendar-view').style.display = view === 'calendar' ? 'block' : 'none';
          document.getElementById('daily-btn').style.background = view === 'daily' ? '#10b981' : '#6b7280';
          document.getElementById('weekly-btn').style.background = view === 'weekly' ? '#10b981' : '#6b7280';
          document.getElementById('calendar-btn').style.background = view === 'calendar' ? '#10b981' : '#6b7280';
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
      </script>
    `;
  }
}

function getInventarioContent(userId, isAdmin) {
  const categories = {
    carnes: { name: 'Carnes', color: '#dc2626' },
    pescado: { name: 'Pescado', color: '#0ea5e9' },
    verduras: { name: 'Verduras', color: '#16a34a' },
    otros: { name: 'Otros', color: '#0891b2' }
  };
  
  return `
    <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 24px;">Inventario</h2>
    
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
                  <button onclick="changeQuantity(${product.id}, -1)" style="width: 32px; height: 32px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 18px; font-weight: bold;">−</button>
                  <button onclick="changeQuantity(${product.id}, 1)" style="width: 32px; height: 32px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 18px; font-weight: bold;">+</button>
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

function getNavigation(userId, currentSection, userToken) {
  const sections = {
    actividades: { icon: '📅', name: 'Actividades' },
    inventario: { icon: '📦', name: 'Inventario' }
  };
  
  const userType = userId === 'javi_administrador' ? 'admin' : userId;
  const baseUrl = `/${userType}/${userToken.split('_')[1]}`;
  
  return Object.keys(sections).map(sectionId => {
    const section = sections[sectionId];
    const isActive = currentSection === sectionId;
    return `<a href="${baseUrl}?section=${sectionId}" class="btn ${isActive ? 'active' : ''}">${section.icon} ${section.name}</a>`;
  }).join('');
}

// Cargar datos al iniciar
loadData();

server.listen(7777, '0.0.0.0', () => {
  console.log('App funcionando en:');
  console.log('- Local: http://localhost:7777');
  console.log('- Red: http://192.168.100.122:7777');
  console.log('\\nEnlaces de acceso directo:');
  console.log('- Javier: http://192.168.100.122:7777/javier/abc123xyz789def456');
  console.log('- Raquel: http://192.168.100.122:7777/raquel/uvw012rst345ghi678');
  console.log('- Mario: http://192.168.100.122:7777/mario/jkl901mno234pqr567');
  console.log('- Alba: http://192.168.100.122:7777/alba/stu890vwx123yzb456');
  console.log('- Administrador: http://192.168.100.122:7777/admin/cde789fgh012ijl345');
});