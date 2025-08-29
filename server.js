require('dotenv').config();
const http = require('http');
const url = require('url');
const { Pool } = require('pg');

// Configuración de base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/organizacion_familiar',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Inicializar base de datos
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        token VARCHAR(100) UNIQUE NOT NULL,
        allowed_ips TEXT[]
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20) NOT NULL,
        user_id VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        timestamp VARCHAR(20) NOT NULL,
        chat_key VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        title VARCHAR(200) NOT NULL,
        time VARCHAR(10) NOT NULL,
        duration INTEGER NOT NULL,
        repeat_type VARCHAR(20) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        streak INTEGER DEFAULT 0,
        last_completed DATE
      );
    `);
    
    // Insertar usuarios iniciales
    const users = [
      ['javier', 'Javier', 'jav_abc123xyz789def456'],
      ['raquel', 'Raquel', 'raq_uvw012rst345ghi678'],
      ['mario', 'Mario', 'mar_jkl901mno234pqr567'],
      ['alba', 'Alba', 'alb_stu890vwx123yzb456'],
      ['javi_administrador', 'Administrador', 'adm_cde789fgh012ijl345']
    ];
    
    for (const [id, name, token] of users) {
      await pool.query(
        'INSERT INTO users (id, name, token, allowed_ips) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
        [id, name, token, []]
      );
    }
    
    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error inicializando base de datos:', error);
  }
}

const USERS = {};
const suspiciousIPs = new Set();
const ipAttempts = {};
const unreadMessages = { javier: 0, raquel: 0, mario: 0, alba: 0 };
let messageIdCounter = 1;

// Cargar usuarios desde BD
async function loadUsers() {
  try {
    const result = await pool.query('SELECT * FROM users');
    result.rows.forEach(user => {
      USERS[user.id] = {
        id: user.id,
        name: user.name,
        token: user.token,
        allowedIPs: user.allowed_ips || []
      };
    });
  } catch (error) {
    console.error('Error cargando usuarios:', error);
  }
}

function getClientIP(req) {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || '127.0.0.1';
}

function isIPBlocked(ip) {
  return suspiciousIPs.has(ip);
}

function recordFailedAttempt(ip) {
  if (!ipAttempts[ip]) ipAttempts[ip] = 0;
  ipAttempts[ip]++;
  
  if (ipAttempts[ip] >= 3) {
    suspiciousIPs.add(ip);
    console.log(`IP bloqueada por actividad sospechosa: ${ip}`);
  }
}

async function recordSuccessfulAccess(userId, ip) {
  const user = USERS[userId];
  if (user && !user.allowedIPs.includes(ip)) {
    user.allowedIPs.push(ip);
    try {
      await pool.query('UPDATE users SET allowed_ips = $1 WHERE id = $2', [user.allowedIPs, userId]);
      console.log(`Nueva IP autorizada para ${userId}: ${ip}`);
    } catch (error) {
      console.error('Error actualizando IP:', error);
    }
  }
  delete ipAttempts[ip];
}

function getTimestamp() {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${day}/${month} ${hours}:${minutes}`;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // API para mensajes
  if (req.method === 'POST' && parsedUrl.pathname === '/api/send-message') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { type, message, from, to } = data;
        
        const result = await pool.query(
          'INSERT INTO messages (type, user_id, message, timestamp, chat_key) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [type, from, message.trim(), getTimestamp(), to ? [from, to].sort().join('-') : null]
        );
        
        const newMessage = {
          id: result.rows[0].id,
          message: message.trim(),
          timestamp: getTimestamp(),
          user: from,
          from: from
        };
        
        if (to) newMessage.to = to;
        
        // Incrementar notificaciones
        Object.keys(unreadMessages).forEach(user => {
          if (user !== from) unreadMessages[user]++;
        });
        
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ success: true, message: newMessage }));
      } catch (error) {
        console.error('Error enviando mensaje:', error);
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ success: false }));
      }
    });
    return;
  }
  
  // Acceso directo por token
  const pathMatch = parsedUrl.pathname.match(/^\/(javier|raquel|mario|alba|admin)\/([a-zA-Z0-9_]+)$/);
  if (pathMatch) {
    const [, userType, token] = pathMatch;
    const clientIP = getClientIP(req);
    
    if (isIPBlocked(clientIP)) {
      res.writeHead(403, {'Content-Type': 'text/html'});
      res.end('<h1>Acceso bloqueado</h1><p>Tu IP ha sido bloqueada por actividad sospechosa.</p>');
      return;
    }
    
    const userId = userType === 'admin' ? 'javi_administrador' : userType;
    const user = USERS[userId];
    
    if (user && user.token === `${userType === 'admin' ? 'adm' : userId.substring(0,3)}_${token}`) {
      if (user.allowedIPs.length > 0 && !user.allowedIPs.includes(clientIP)) {
        recordFailedAttempt(clientIP);
        res.writeHead(403, {'Content-Type': 'text/html'});
        res.end('<h1>Acceso denegado</h1><p>Esta IP no está autorizada para este usuario.</p>');
        return;
      }
      
      await recordSuccessfulAccess(userId, clientIP);
      
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.end(getMainHTML(user, parsedUrl.query.section || 'actividades'));
      return;
    } else {
      recordFailedAttempt(clientIP);
      res.writeHead(404, {'Content-Type': 'text/html'});
      res.end('<h1>Enlace no válido</h1>');
      return;
    }
  }
  
  // Página principal con enlaces
  const baseUrl = process.env.NODE_ENV === 'production' ? 'https://organizacion-familiar.vercel.app' : 'http://192.168.100.122:7777';
  
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
      
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="font-size: 20px; margin-bottom: 16px; color: #374151;">Enlaces de Acceso Directo</h2>
        <p style="color: #6b7280; margin-bottom: 20px;">Guarda tu enlace personal en favoritos:</p>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <strong style="color: #1e40af;">Javier:</strong><br>
          <code style="font-size: 12px; color: #6b7280; word-break: break-all;">${baseUrl}/javier/abc123xyz789def456</code>
        </div>
        <div style="padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #ec4899;">
          <strong style="color: #be185d;">Raquel:</strong><br>
          <code style="font-size: 12px; color: #6b7280; word-break: break-all;">${baseUrl}/raquel/uvw012rst345ghi678</code>
        </div>
        <div style="padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #10b981;">
          <strong style="color: #047857;">Mario:</strong><br>
          <code style="font-size: 12px; color: #6b7280; word-break: break-all;">${baseUrl}/mario/jkl901mno234pqr567</code>
        </div>
        <div style="padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <strong style="color: #d97706;">Alba:</strong><br>
          <code style="font-size: 12px; color: #6b7280; word-break: break-all;">${baseUrl}/alba/stu890vwx123yzb456</code>
        </div>
        <div style="padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #8b5cf6;">
          <strong style="color: #7c3aed;">Administrador:</strong><br>
          <code style="font-size: 12px; color: #6b7280; word-break: break-all;">${baseUrl}/admin/cde789fgh012ijl345</code>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`);
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
    .main { flex: 1; margin-left: 256px; }
    .content { padding: 32px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="sidebar">
      <div style="padding: 16px;">
        <h3>${user.name}</h3>
      </div>
    </div>
    <div class="main">
      <div class="content">
        <h1>¡Hola, ${user.name}!</h1>
        <p>Sistema funcionando con base de datos PostgreSQL</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// Inicializar y arrancar servidor
async function start() {
  await initDB();
  await loadUsers();
  
  const port = process.env.PORT || 7777;
  server.listen(port, '0.0.0.0', () => {
    console.log(`Servidor funcionando en puerto ${port}`);
  });
}

start();