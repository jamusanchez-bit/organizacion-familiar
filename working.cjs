const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Cargar frases motivadoras
const phrasesContent = fs.readFileSync(path.join(__dirname, '.amazonq', 'rules', 'Frases_motivadoras_365.md'), 'utf8');
const allPhrases = phrasesContent.split('\n').filter(line => line.startsWith('Día')).map(line => line.substring(line.indexOf('.') + 2));

function getDayOfYear(date = new Date()) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = (date - start) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

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

let forumMessages = [];
let adminSuggestions = [];
let privateMessages = {};

// Función para generar páginas de usuario
function getUserPage(username) {
  const user = USERS[username];

  const now = new Date();
  const dayOfYear = getDayOfYear(now);
  const year = now.getFullYear();
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  let phraseIndex = dayOfYear - 1;

  if (isLeap && dayOfYear >= 60) {
      phraseIndex--;
  }
  if (phraseIndex < 0) phraseIndex = 0;
  if (phraseIndex >= allPhrases.length) phraseIndex = allPhrases.length - 1;

  const phrase = allPhrases[phraseIndex] || 'Frase no encontrada.';
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dateStr = `${days[now.getDay()]} ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
  const dailyPhraseHTML = `<div style="font-weight: bold; margin-bottom: 4px;">${dateStr}</div><div>${phrase}</div>`;

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
    .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px; }
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
        <button class="btn" onclick="showSection('recetas')">👨🍳 Recetas</button>
        <button class="btn" onclick="showSection('inventario')">📦 Inventario</button>
        <button class="btn" onclick="showSection('compras')">🛒 Lista de la compra</button>
        <button class="btn" onclick="showSection('mensajes')">💬 Mensajes</button>
        <button class="btn" onclick="window.location.href='/english?user=${user.name}'">🎓 Ca'mon</button>
      </div>
      <div style="padding: 12px; border-bottom: 1px solid #e5e7eb; margin-bottom: 16px;">
        <div id="daily-phrase" style="font-size: 11px; color: #6b7280; text-align: center; line-height: 1.3;">${dailyPhraseHTML}</div>
      </div>
      <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
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
          <h2 class="title">Mis Actividades</h2>
          <div class="card">
            <h3>Actividades de Hoy</h3>
            <p>Aquí se mostrarán las actividades.</p>
          </div>
        </div>
        
        <div id="comidas" class="section">
          <h2 class="title">Planificación de Comidas</h2>
          <div class="card">
            <h3>Planning Semanal</h3>
            <p>Aquí se mostrará el planning de comidas.</p>
          </div>
        </div>
        
        <div id="recetas" class="section">
          <h2 class="title">Recetas</h2>
          <div class="card">
            <h3>Mis Recetas</h3>
            <p>Aquí se mostrarán las recetas.</p>
          </div>
        </div>
        
        <div id="inventario" class="section">
          <h2 class="title">Inventario</h2>
          <div class="card">
            <h3>Control de Stock</h3>
            <p>Aquí se mostrará el inventario.</p>
          </div>
        </div>
        
        <div id="compras" class="section">
          <h2 class="title">Lista de la Compra</h2>
          <div class="card">
            <h3>Productos Necesarios</h3>
            <p>Aquí se mostrará la lista de la compra.</p>
          </div>
        </div>
        
        <div id="mensajes" class="section">
          <h2 class="title">Mensajes</h2>
          <div class="card">
            <h3>Chat Familiar</h3>
            <p>Aquí se mostrarán los mensajes.</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    function showSection(section) {
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
      document.getElementById(section).classList.add('active');
      event.target.classList.add('active');
    }
  </script>
</body>
</html>`;
}

function getAdminPage() {
  return getUserPage('javi_administrador');
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // Ruta de inglés - CA'MON COMPLETO
  if (parsedUrl.pathname === '/english' || parsedUrl.pathname === '/english/') {
    const user = parsedUrl.query.user || 'Usuario';
    
    const englishHTML = `<!DOCTYPE html>
<html>
<head>
  <title>Ca'mon English - ${user}</title>
  <style>
    * { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; color: white; margin-bottom: 40px; }
    .card { background: white; border-radius: 12px; padding: 30px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .btn { background: #667eea; color: white; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; font-size: 16px; margin: 10px; transition: all 0.3s; }
    .btn:hover { background: #5a67d8; transform: translateY(-2px); }
    .level-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 16px; font-weight: bold; }
    .exercise { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0; }
    .chat-area { height: 400px; overflow-y: auto; border: 1px solid #ddd; padding: 20px; background: #f9f9f9; border-radius: 8px; }
    .message { margin: 15px 0; padding: 12px; border-radius: 8px; }
    .user-message { background: #e3f2fd; text-align: right; }
    .ai-message { background: #f0f4f8; }
    .timer { font-size: 24px; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0; }
    .voice-btn { background: #dc2626; }
    .voice-btn.recording { background: #10b981; animation: pulse 1s infinite; }
    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
    .section { display: none; }
    .section.active { display: block; }
    .nav-buttons { display: flex; gap: 10px; justify-content: center; margin: 20px 0; flex-wrap: wrap; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Ca'mon English</h1>
      <p>Bienvenido, <strong>${user}</strong>! Aprende inglés de forma personalizada</p>
    </div>
    
    <div class="nav-buttons">
      <button class="btn" onclick="showSection('level')">📊 Tu Nivel</button>
      <button class="btn" onclick="showSection('test')">🎯 Prueba Inicial</button>
      <button class="btn" onclick="showSection('exercises')">📚 Ejercicios Diarios</button>
      <button class="btn" onclick="showSection('chat')">💬 Chat con Elizabeth</button>
      <button class="btn" onclick="showSection('progress')">📈 Mi Evolución</button>
    </div>
    
    <!-- SECCIÓN: TU NIVEL -->
    <div id="level" class="section active">
      <div class="card">
        <h2>📊 Tu Nivel Actual</h2>
        <p style="text-align: center; margin: 20px 0;">
          Nivel: <span class="level-badge" id="current-level">A1.1</span>
        </p>
        <div style="text-align: center;">
          <p>¡Perfecto para empezar tu aventura en inglés!</p>
          <button class="btn" onclick="showSection('test')">🎯 Hacer Prueba de Nivel</button>
          <button class="btn" onclick="showSection('exercises')">📚 Comenzar Ejercicios</button>
        </div>
      </div>
    </div>
    
    <!-- SECCIÓN: PRUEBA INICIAL -->
    <div id="test" class="section">
      <div class="card">
        <h2>🎯 Prueba de Nivel Cambridge</h2>
        <p>Esta prueba tiene 25 preguntas para determinar tu nivel exacto (A1.1 - C2.5)</p>
        <div id="test-content">
          <div style="text-align: center; margin: 30px 0;">
            <button class="btn" onclick="startLevelTest()">Comenzar Prueba</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- SECCIÓN: EJERCICIOS DIARIOS -->
    <div id="exercises" class="section">
      <div class="card">
        <h2>📚 Ejercicios Diarios</h2>
        <p>Completa los 3 ejercicios para marcar el día como completado:</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 30px 0;">
          <div class="exercise">
            <h3>📝 Gramática</h3>
            <p>Ejercicios de escritura adaptados a tu nivel</p>
            <button class="btn" onclick="startGrammar()">Comenzar</button>
          </div>
          
          <div class="exercise">
            <h3>📖 Reading</h3>
            <p>Comprensión lectora con textos Cambridge</p>
            <button class="btn" onclick="startReading()">Comenzar</button>
          </div>
          
          <div class="exercise">
            <h3>🗣️ Chat con Elizabeth</h3>
            <p>Conversación de voz mínimo 10 minutos</p>
            <button class="btn" onclick="showSection('chat')">Comenzar</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- SECCIÓN: CHAT CON ELIZABETH -->
    <div id="chat" class="section">
      <div class="card">
        <h2>💬 Chat con Elizabeth - Tu Profesora Personal</h2>
        <div class="timer" id="chat-timer">⏱️ 00:00</div>
        
        <div class="chat-area" id="chat-area">
          <div class="message ai-message">
            <strong>Elizabeth:</strong> Hello! I'm Elizabeth, your personal English teacher. I'm here to help you practice and improve your English. How are you feeling today?
          </div>
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: center; margin: 20px 0;">
          <button class="btn voice-btn" id="record-btn" onclick="toggleRecording()">🎤 Mantén para Hablar</button>
          <button class="btn" onclick="toggleTextInput()">💬 Escribir</button>
        </div>
        
        <input type="text" id="chat-input" placeholder="Escribe tu mensaje en inglés..." style="display: none; width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px;">
      </div>
    </div>
    
    <!-- SECCIÓN: MI EVOLUCIÓN -->
    <div id="progress" class="section">
      <div class="card">
        <h2>📈 Mi Evolución</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
          <div class="exercise">
            <h3>📊 Estadísticas</h3>
            <p><strong>Nivel actual:</strong> A1.1</p>
            <p><strong>Días completados:</strong> 0</p>
            <p><strong>Racha actual:</strong> 0 días</p>
            <p><strong>Promedio:</strong> --</p>
          </div>
          
          <div class="exercise">
            <h3>📅 Historial Reciente</h3>
            <p style="color: #6b7280;">Completa tus primeros ejercicios para ver tu progreso aquí</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const userName = '${user}';
    let chatTimer = 0;
    let chatInterval = null;
    let isRecording = false;
    let recognition = null;
    
    // Inicializar reconocimiento de voz
    if ('webkitSpeechRecognition' in window) {
      recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        sendVoiceMessage(transcript);
      };
      
      recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        stopRecording();
      };
      
      recognition.onend = function() {
        stopRecording();
      };
    }
    
    function showSection(section) {
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById(section).classList.add('active');
      
      if (section === 'chat') {
        startChatTimer();
      } else {
        stopChatTimer();
      }
    }
    
    function startChatTimer() {
      if (chatInterval) return;
      chatInterval = setInterval(() => {
        chatTimer++;
        const minutes = Math.floor(chatTimer / 60);
        const seconds = chatTimer % 60;
        document.getElementById('chat-timer').textContent = 'Timer: ' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
      }, 1000);
    }
    
    function stopChatTimer() {
      if (chatInterval) {
        clearInterval(chatInterval);
        chatInterval = null;
      }
    }
    
    async function toggleRecording() {
      if (!recognition) {
        alert('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Safari.');
        return;
      }
      
      // Solicitar permisos de micrófono
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (error) {
        alert('Necesitas dar permisos de micrófono para usar esta función. Revisa la configuración de tu navegador.');
        return;
      }
      
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
    
    function startRecording() {
      isRecording = true;
      document.getElementById('record-btn').textContent = '🔴 Grabando...';
      document.getElementById('record-btn').classList.add('recording');
      recognition.start();
    }
    
    function stopRecording() {
      isRecording = false;
      document.getElementById('record-btn').textContent = '🎤 Mantén para Hablar';
      document.getElementById('record-btn').classList.remove('recording');
      if (recognition) {
        recognition.stop();
      }
    }
    
    function toggleTextInput() {
      const input = document.getElementById('chat-input');
      if (input.style.display === 'none') {
        input.style.display = 'block';
        input.focus();
      } else {
        sendTextMessage();
      }
    }
    
    function sendVoiceMessage(transcript) {
      const chatArea = document.getElementById('chat-area');
      
      chatArea.innerHTML += '<div class="message user-message"><strong>' + userName + ':</strong> ' + transcript + '</div>';
      
      sendToOpenAI(transcript);
      chatArea.scrollTop = chatArea.scrollHeight;
    }
    
    function sendTextMessage() {
      const input = document.getElementById('chat-input');
      const message = input.value.trim();
      if (!message) return;
      
      const chatArea = document.getElementById('chat-area');
      chatArea.innerHTML += '<div class="message user-message"><strong>' + userName + ':</strong> ' + message + '</div>';
      
      sendToOpenAI(message);
      input.value = '';
      input.style.display = 'none';
      chatArea.scrollTop = chatArea.scrollHeight;
    }
    
    async function sendToOpenAI(message) {
      const chatArea = document.getElementById('chat-area');
      
      try {
        const response = await fetch('/api/chat-elizabeth', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            user: userName,
            message: message,
            level: 'A1.1'
          })
        });
        
        const data = await response.json();
        
        chatArea.innerHTML += '<div class="message ai-message"><strong>Elizabeth:</strong> ' + data.response + '</div>';
        
        // Reproducir respuesta de voz
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(data.response);
          utterance.lang = 'en-US';
          utterance.rate = 0.9;
          speechSynthesis.speak(utterance);
        }
        
      } catch (error) {
        console.error('Error:', error);
        chatArea.innerHTML += '<div class="message ai-message"><strong>Elizabeth:</strong> I\'m sorry, I\'m having trouble connecting right now. Please try again.</div>';
      }
      
      chatArea.scrollTop = chatArea.scrollHeight;
    }
    
    function startLevelTest() {
      alert('Iniciando prueba de nivel Cambridge. Esta funcionalidad se completará próximamente con 25 preguntas personalizadas.');
    }
    
    function startGrammar() {
      alert('Iniciando ejercicios de gramática adaptados a tu nivel A1.1');
    }
    
    function startReading() {
      alert('Iniciando ejercicios de comprensión lectora con contenido Cambridge');
    }
    
    // Event listeners
    document.getElementById('chat-input').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendTextMessage();
      }
    });
    
    // Inicializar
    showSection('level');
  </script>
</body>
</html>`;
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(englishHTML);
    return;
  }
  
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
  
  // API Chat con Elizabeth (OpenAI)
  if (req.method === 'POST' && parsedUrl.pathname === '/api/chat-elizabeth') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { user, message, level } = data;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: `You are Elizabeth, a warm, enthusiastic, and genuinely caring English teacher who loves helping people learn. You're chatting with ${user} (level ${level}) like a supportive friend who happens to be great at English. Be conversational, use natural expressions, ask follow-up questions, share personal touches, and show real interest in what they're saying. Correct mistakes very gently and naturally, like a friend would. Use contractions, casual phrases, and sound completely human and relatable.`
              },
              {
                role: 'user',
                content: message
              }
            ],
            max_tokens: 200,
            temperature: 0.9
          })
        });
        
        const openaiData = await response.json();
        
        if (openaiData.choices && openaiData.choices[0]) {
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({
            response: openaiData.choices[0].message.content,
            audio: true
          }));
        } else {
          throw new Error('Invalid OpenAI response');
        }
        
      } catch (error) {
        console.error('OpenAI Error:', error);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({
          response: "I'm sorry, I'm having some technical difficulties right now. Could you please try again?",
          audio: false
        }));
      }
    });
    return;
  }
  
  if (parsedUrl.pathname === '/auth-bridge.js') {
    const fs = require('fs');
    const path = require('path');
    try {
      const filePath = path.join(__dirname, 'auth-bridge.js');
      const content = fs.readFileSync(filePath, 'utf8');
      res.writeHead(200, {'Content-Type': 'application/javascript'});
      res.end(content);
    } catch (error) {
      res.writeHead(404);
      res.end('File not found');
    }
    return;
  }
  
  if (parsedUrl.pathname.startsWith('/english/api/')) {
    // Proxy a la API de inglés (por ahora devolver 404)
    res.writeHead(404, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: 'English API not implemented yet'}));
    return;
  }
  
  if (parsedUrl.pathname.startsWith('/english/')) {
    const filePath = path.join(__dirname, 'public', parsedUrl.pathname);
    try {
      const content = fs.readFileSync(filePath);
      const ext = path.extname(filePath);
      const contentType = {
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.html': 'text/html',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
      }[ext] || 'text/plain';
      
      res.writeHead(200, {'Content-Type': contentType});
      res.end(content);
    } catch (error) {
      res.writeHead(404);
      res.end('File not found');
    }
    return;
  }
  
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  res.end('<h1>Organización Familiar</h1><p>Accede con tu enlace personal</p>');
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT} - ACTUALIZADO ${new Date().toISOString()}`);
});