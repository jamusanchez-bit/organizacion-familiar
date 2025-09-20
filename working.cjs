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

// --- Helpers para el Calendario de Comidas ---
function getAdminPage(query) {
  return getUserPage('javi_administrador', query);
}

// --- Storage for Ca'mon test results (server-side memory + disk) ---
const CAMON_SERVER_RESULTS = {};
const CAMON_PROMOTIONS = {};
const CAMON_RESULTS_FILE = path.join(__dirname, 'backups', 'camon-results.json');
const CAMON_SECRET = process.env.CAMON_SECRET || null;
// Simple rate limit: per-user last submit timestamp
const CAMON_LAST_SUBMIT = {};
const CAMON_MIN_SUBMIT_INTERVAL_MS = 30 * 1000; // 30 seconds

function loadCamonResultsFromDisk() {
  try {
    if (fs.existsSync(CAMON_RESULTS_FILE)) {
      const raw = fs.readFileSync(CAMON_RESULTS_FILE, 'utf8');
      const data = JSON.parse(raw || '{}');
      if (data && data.results && data.promotions) {
        Object.assign(CAMON_SERVER_RESULTS, data.results || {});
        Object.assign(CAMON_PROMOTIONS, data.promotions || {});
      } else {
        // old format: direct map of user->results
        Object.assign(CAMON_SERVER_RESULTS, data || {});
      }
    }
  } catch (e) {
    console.error('Error loading CAMON results from disk:', e.message);
  }
}

function saveCamonResultsToDisk() {
  try {
    fs.mkdirSync(path.dirname(CAMON_RESULTS_FILE), { recursive: true });
    const out = { results: CAMON_SERVER_RESULTS, promotions: CAMON_PROMOTIONS };
    fs.writeFileSync(CAMON_RESULTS_FILE, JSON.stringify(out, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving CAMON results to disk:', e.message);
  }
}

function buildCamonSublevels() {
  const letters = ['A1','A2','B1','B2','C1','C2'];
  const arr = [];
  letters.forEach(l => { for (let i = 1; i <= 5; i++) arr.push(l + '.' + i); });
  return arr.slice(0,25);
}

const SERVER_CAMON_SUBLEVELS = buildCamonSublevels();

function computeAssignedLevel(score, total) {
  // Map score/total proportionally into sublevels [0..n-1]
  if (!total || total <= 0) return SERVER_CAMON_SUBLEVELS[0];
  const ratio = Math.max(0, Math.min(1, score / total));
  const idx = Math.round(ratio * (SERVER_CAMON_SUBLEVELS.length - 1));
  return SERVER_CAMON_SUBLEVELS[Math.min(SERVER_CAMON_SUBLEVELS.length - 1, Math.max(0, idx))];
}

loadCamonResultsFromDisk();

// --- Simple in-memory data used by legacy handlers and dev UI ---
// Ensure these exist so the various /api/* endpoints and front-end components work
var activities = [];
var meals = [];
var inventory = [
  { id: 'inv_1', name: 'Leche', category: 'lacteos', shop: 'Mercado', unit: 'L', quantity: 2, minimum: 1 },
  { id: 'inv_2', name: 'Huevos', category: 'otros', shop: 'Mercado', unit: 'uds', quantity: 12, minimum: 6 },
  { id: 'inv_3', name: 'Pan', category: 'otros', shop: 'Panaderia', unit: 'uds', quantity: 4, minimum: 2 }
];
var recipes = [
  { id: 'rec_1', name: 'Tortilla', category: 'desayuno', ingredients: [{ 'Huevos': 3 }], time: 15 }
];
var mealPlan = {};
var forumMessages = [ { id: 'm1', user: 'javier', text: '¿Quién cocina mañana?', time: new Date().toLocaleString('es-ES'), timestamp: Date.now() } ];
var adminSuggestions = [ ];
var privateMessages = {};
var shoppingList = [ { id: 's1', name: 'Tomates', qty: 6 } ];



const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const query = parsedUrl.query;

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
      <button class="btn" data-section="level">📊 Tu Nivel</button>
      <button class="btn" data-section="test">🎯 Prueba Inicial</button>
      <button class="btn" data-section="exercises">📚 Ejercicios Diarios</button>
      <button class="btn" data-section="chat">💬 Chat con Elizabeth</button>
      <button class="btn" data-section="progress">📈 Mi Evolución</button>
    </div>
    
    <!-- SECCIÓN: TU NIVEL -->
    <div id="level" class="section active">
      <div class="card">
        <h2>📊 Tu Nivel Actual</h2>
        <p style="text-align: center; margin: 20px 0;">
          Nivel: <span class="level-badge" id="current-level">A1.1</span>
        </p>
        <!-- Container where the Ca'mon client will render its interactive UI -->
        <div id="camon-area" style="margin-top:16px"></div>
        <script>window.CAMON_USERNAME = ${JSON.stringify(user)};</script>
        <script>window.CAMON_SECRET = ${CAMON_SECRET ? JSON.stringify(CAMON_SECRET) : 'null'};</script>
        <script src="/camon.js"></script>
          <button class="btn" data-section="test">🎯 Hacer Prueba de Nivel</button>
          <button class="btn" data-section="exercises">📚 Comenzar Ejercicios</button>
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
            <button class="btn" id="start-level-test">Comenzar Prueba</button>
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
            <button class="btn" id="start-grammar">Comenzar</button>
          </div>
          
          <div class="exercise">
            <h3>📖 Reading</h3>
            <p>Comprensión lectora con textos Cambridge</p>
            <button class="btn" id="start-reading">Comenzar</button>
          </div>
          
          <div class="exercise">
            <h3>🗣️ Chat con Elizabeth</h3>
            <p>Conversación de voz mínimo 10 minutos</p>
            <button class="btn" data-section="chat">Comenzar</button>
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
          <button class="btn voice-btn" id="record-btn">🎤 Mantén para Hablar</button>
          <button class="btn" id="toggle-text-input">💬 Escribir</button>
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
  chatArea.innerHTML += "<div class='message ai-message'><strong>Elizabeth:</strong> I'm sorry, I'm having trouble connecting right now. Please try again.</div>";
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
    // Ca'mon UI
    function showCamonPanel(panel) {
      const area = document.getElementById('camon-area');
      if (panel === 'level') {
        area.innerHTML = '<div>' +
          '<h4>Prueba inicial (demo)</h4>' +
          '<p>Se seleccionar\u00e1n 25 preguntas aleatorias (demo con datos simulados).</p>' +
          '<button data-demo="level" style="padding:8px 12px; background:#3b82f6; color:white; border:none; border-radius:8px;">Empezar prueba</button>' +
          '</div>';
      } else if (panel === 'daily') {
        area.innerHTML = '<div>' +
          '<h4>Ejercicios diarios</h4>' +
          '<p>Gram\u00e1tica (10 preguntas), Reading (10 preguntas) y Chat con Elizabeth (voz) \u2014 demo.</p>' +
          '<button data-demo="grammar" style="padding:8px 12px; background:#10b981; color:white; border:none; border-radius:8px;">Gram\u00e1tica</button>' +
          '<button data-demo="reading" style="padding:8px 12px; background:#06b6d4; color:white; border:none; border-radius:8px; margin-left:8px;">Reading</button>' +
          '<button data-demo="chat" style="padding:8px 12px; background:#8b5cf6; color:white; border:none; border-radius:8px; margin-left:8px;">Chat por voz</button>' +
          '<div id="camon-daily-area" style="margin-top:12px;"></div>' +
          '</div>';
      } else if (panel === 'evolution') {
        area.innerHTML = '<div>' +
          '<h4>Mi evoluci\u00f3n</h4>' +
          '<div id="camon-evolution-area">Cargando historial...</div>' +
          '</div>';
        // fetch history from server
        try {
          fetch('/api/camon/history?user=' + encodeURIComponent(CAMON_USERNAME))
            .then(function(res){ return res.json(); })
            .then(function(data){
              var out = '<div style="background:#fff;padding:12px;border-radius:8px;">';
              var promo = data.promotions;
              if (promo && promo.level) {
                out += '<p>Nivel actual: <strong>' + promo.level + '</strong></p>';
                if (promo.history && promo.history.length) {
                  out += '<h4>Promociones</h4><ul>';
                  promo.history.forEach(function(p){ out += '<li>' + p.date + ': ' + p.from + ' → ' + p.to + '</li>'; });
                  out += '</ul>';
                }
              } else {
                // mostrar último resultado como nivel
                if (data.results && data.results.length) {
                  var last = data.results[data.results.length -1];
                  out += '<p>Nivel asignado (último): <strong>' + last.assignedLevel + '</strong></p>';
                } else {
                  out += '<p>No hay datos de pruebas todavía.</p>';
                }
              }

              if (data.results && data.results.length) {
                out += '<h4>Historial de Pruebas</h4>';
                out += '<table style="width:100%;border-collapse:collapse;"><thead><tr><th style="text-align:left;padding:6px;border-bottom:1px solid #eee">Fecha</th><th style="text-align:left;padding:6px;border-bottom:1px solid #eee">Puntuación</th><th style="text-align:left;padding:6px;border-bottom:1px solid #eee">Nivel asignado</th></tr></thead><tbody>';
                data.results.forEach(function(r){
                  out += '<tr><td style="padding:6px;border-bottom:1px solid #f3f3f3">' + r.date + '</td><td style="padding:6px;border-bottom:1px solid #f3f3f3">' + r.score + '/' + r.total + '</td><td style="padding:6px;border-bottom:1px solid #f3f3f3">' + (r.assignedLevel || '-') + '</td></tr>';
                });
                out += '</tbody></table>';
              }

              out += '</div>';
              var evo = document.getElementById('camon-evolution-area');
              if (evo) evo.innerHTML = out;
            }).catch(function(){
              var evo = document.getElementById('camon-evolution-area');
              if (evo) evo.innerHTML = '<div style="background:#fff;padding:12px;border-radius:8px;color:#666;">Error al cargar historial.</div>';
            });
        } catch (e) {
          var evo = document.getElementById('camon-evolution-area');
          if (evo) evo.innerHTML = '<div style="background:#fff;padding:12px;border-radius:8px;color:#666;">Error al solicitar historial.</div>';
        }
      }
    }

    // --- Prueba Inicial (demo con 25 preguntas: 10 rellenar, 15 opción múltiple) ---
    const CAMON_SUBLEVELS = (function(){
      const letters = ['A1','A2','B1','B2','C1','C2'];
      const arr = [];
      letters.forEach(l => {
        for(let i=1;i<=5;i++) arr.push(l + '.' + i);
      });
      return arr; // length 30? Actually 6*5=30. We only need 25; we'll slice first 25.
    })().slice(0,25);

    // Generar preguntas simuladas (una por subnivel)
    const CAMON_QUESTIONS = CAMON_SUBLEVELS.map(function(sub, idx) {
      var isFill = idx < 10;
      if (isFill) {
        return { id: idx, sublevel: sub, type: 'fill', prompt: '(' + sub + ') Fill: I ____ football every Sunday.', answer: 'play' };
      } else {
        return { id: idx, sublevel: sub, type: 'choice', prompt: '(' + sub + ') Choose: She ____ to school yesterday.', options: ['go','went','gone','goes'], answer: 'went' };
      }
    });

    // Almacenamiento temporal de resultados por usuario (en window)
    var CAMON_TEST_RESULTS = window.CAMON_TEST_RESULTS || {};
    window.CAMON_TEST_RESULTS = CAMON_TEST_RESULTS;

    // nombre de usuario en cliente
    var CAMON_USERNAME = '${user.name}';

    function startDemoLevelTest() {
      var area = document.getElementById('camon-area');
      var questions = CAMON_QUESTIONS.slice().sort(function(){ return Math.random() - 0.5; });
      var html = '<form id="level-form"><div style="display:flex;flex-direction:column;gap:12px;">';
      questions.forEach(function(q, i){
        if (q.type === 'fill') {
          html += '<div><label><strong>Pregunta ' + (i+1) + ':</strong> ' + q.prompt.replace('(' + q.sublevel + ') ','') + '</label><br><input type="text" name="q_' + i + '" data-ans="' + q.answer + '" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;margin-top:6px;"></div>';
        } else {
          html += '<div><label><strong>Pregunta ' + (i+1) + ':</strong> ' + q.prompt.replace('(' + q.sublevel + ') ','') + '</label><br>';
          q.options.forEach(function(opt){
            html += '<label style="margin-right:8px;"><input type="radio" name="q_' + i + '" value="' + opt + '"> ' + opt + '</label>';
          });
          html += '</div>';
        }
      });
      html += '<div style="margin-top:12px;"><button type="submit" style="padding:10px 14px;background:#3b82f6;color:#fff;border:none;border-radius:8px;">Enviar prueba</button></div></div></form>';
      area.innerHTML = '<h4>Prueba inicial (25 preguntas)</h4>' + html;

      document.getElementById('level-form').addEventListener('submit', function(e){
        e.preventDefault();
        var form = e.target;
        var formData = new FormData(form);
        var results = [];
        questions.forEach(function(q, i){
          var key = 'q_' + i;
          var userVal = formData.get(key);
          var correct = false;
          if (q.type === 'fill') {
            if (userVal && userVal.trim().toLowerCase() === q.answer.toLowerCase()) correct = true;
          } else {
            if (userVal && userVal === q.answer) correct = true;
          }
          results.push({ index: i, sublevel: q.sublevel, correct: correct });
        });

        var correctIndices = results.filter(function(r){ return r.correct; }).map(function(r){ return CAMON_SUBLEVELS.indexOf(r.sublevel); }).sort(function(a,b){return a-b;});
        var assignedLevel = CAMON_SUBLEVELS[0];
        if (correctIndices.length === 0) {
          assignedLevel = CAMON_SUBLEVELS[0];
        } else {
          var mid = Math.floor((correctIndices.length - 1) / 2);
          var medianIdx = correctIndices[mid];
          assignedLevel = CAMON_SUBLEVELS[medianIdx] || CAMON_SUBLEVELS[CAMON_SUBLEVELS.length-1];
        }

        var score = results.filter(function(r){ return r.correct; }).length;
        var now = new Date().toISOString();
        var username = CAMON_USERNAME;
        if (!CAMON_TEST_RESULTS[username]) CAMON_TEST_RESULTS[username] = [];
        CAMON_TEST_RESULTS[username].push({ date: now, score: score, total: results.length, assignedLevel: assignedLevel });
        // enviar al servidor para persistencia temporal
        try {
          fetch('/api/camon/result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: username, date: now, score: score, total: results.length, assignedLevel: assignedLevel })
          }).then(()=>{/* ok */}).catch(()=>{/* ignore */});
        } catch (e) {
          // ignore fetch errors in demo
        }

  area.innerHTML = '<div style="background:#fff;padding:12px;border-radius:8px;"><h4>Resultado</h4><p>Puntuación: ' + score + '/' + results.length + '</p><p>Nivel asignado: <strong>' + assignedLevel + '</strong></p><button data-demo="evolution" style="padding:8px 12px;background:#10b981;color:#fff;border:none;border-radius:8px;">Ver evolución</button></div>';
      });
    }

    function startDemoGrammar() {
      const area = document.getElementById('camon-daily-area');
      area.innerHTML = '<div style="background:#fff;padding:12px;border-radius:8px;">Demo: 10 preguntas de gramática (escribe la respuesta). [Implementación parcial]</div>';
    }

    function startDemoReading() {
      const area = document.getElementById('camon-daily-area');
      area.innerHTML = '<div style="background:#fff;padding:12px;border-radius:8px;">Demo: Reading con 10 preguntas de opción múltiple. [Implementación parcial]</div>';
    }

    function startDemoChat() {
      const area = document.getElementById('camon-daily-area');
      area.innerHTML = '<div style="background:#fff;padding:12px;border-radius:8px;">' +
        '<p>Chat por voz con Elizabeth (demo): pulsa y habla.</p>' +
        '<button id="record-btn" onmousedown="startRecording()" onmouseup="stopRecording()" style="padding:10px 14px;border-radius:8px;background:#ef4444;color:white;border:none;">🎤 Mantén para hablar</button>' +
        '<div id="chat-area" style="margin-top:8px;height:160px;overflow:auto;border:1px solid #eee;padding:8px;border-radius:6px;background:#fafafa"></div>' +
        '<input id="chat-input" style="display:none;margin-top:8px;width:100%;padding:8px;border-radius:6px;border:1px solid #ddd;" placeholder="(demo)" />' +
        '</div>';
      // Inicializar reconocimiento si está disponible
      if ('webkitSpeechRecognition' in globalThis || 'SpeechRecognition' in globalThis) {
        // ya se maneja en el bloque superior donde se crea recognition variable
      } else {
        const chatArea = document.getElementById('chat-area');
        chatArea.innerHTML += '<div style="color:#666;">Reconocimiento de voz no soportado en este navegador (usa Chrome).</div>';
      }
    }
    
    // Inicializar
    showSection('level');
    // Exponer funciones importantes en window para que los handlers inline o el rebind las encuentren
    try {
      window.showSection = showSection;
      window.startLevelTest = startLevelTest;
      window.startGrammar = startGrammar;
      window.startReading = startReading;
      window.toggleRecording = toggleRecording;
      window.toggleTextInput = toggleTextInput;
      window.sendTextMessage = sendTextMessage;
      window.startRecording = startRecording;
      window.stopRecording = stopRecording;
      window.showCamonPanel = showCamonPanel;
      window.startDemoLevelTest = startDemoLevelTest;
      window.startDemoGrammar = startDemoGrammar;
      window.startDemoReading = startDemoReading;
      window.startDemoChat = startDemoChat;
    } catch (e) {
      // ignore if window isn't available in some environments
    }
  </script>
  <script>
  // Ensure inline 'onclick' attributes call the intended global functions even if
  // some scripts are executed in a different order or closure. This replaces
  // simple inline callers like "showSection('test')" with proper event listeners.
    document.addEventListener('DOMContentLoaded', function(){
      try {
        document.querySelectorAll('[onclick]').forEach(function(el){
          var code = el.getAttribute('onclick');
          if (!code) return;
          // match patterns like fnName('arg') or fnName()
          var m = code.match(/^\s*([a-zA-Z0-9_$.]+)\s*\(\s*('([^']*)'|"([^"]*)")?\s*\)\s*;?\s*$/);
          if (!m) return;
          var fnName = m[1];
          var arg = (m[3] !== undefined) ? m[3] : (m[4] !== undefined ? m[4] : null);
          // remove inline attribute to avoid double-calls
          el.removeAttribute('onclick');
          el.addEventListener('click', function(e){
            try {
              var fn = window[fnName];
              if (typeof fn === 'function') {
                if (arg !== null) fn(arg);
                else fn();
              } else {
                console.warn('Function not found on window:', fnName);
              }
            } catch (err) {
              console.error('Error invoking handler', fnName, err);
            }
          });
        });
      } catch (e) {
        console.error('onclick-rebind error', e && e.message ? e.message : e);
      }
    });
  </script>
</body>
</html>`;
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(englishHTML);
    return;
  }
  // Servir cliente Ca'mon externo
  if (parsedUrl.pathname === '/camon.js') {
    try {
      const camonPath = path.join(__dirname, 'public', 'camon.js');
      const camonContent = fs.readFileSync(camonPath, 'utf8');
      res.writeHead(200, {'Content-Type': 'application/javascript'});
      res.end(camonContent);
    } catch (e) {
      res.writeHead(404);
      res.end('// camon.js not found');
    }
    return;
  }
  
  // Rutas de usuarios por query (?user=...)
  if (parsedUrl.pathname === '/' && query.user && USERS[query.user]) {
    if (query.user === 'javi_administrador') {
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.end(getAdminPage(query));
      return;
    } else {
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.end(getUserPage(query.user, query));
      return;
    }
  }
  // Rutas antiguas personalizadas
  if (parsedUrl.pathname === '/javier/abc123xyz789def456') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(getUserPage('javier', query));
    return;
  }
  if (parsedUrl.pathname === '/raquel/uvw012rst345ghi678') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(getUserPage('raquel', query));
    return;
  }
  if (parsedUrl.pathname === '/mario/jkl901mno234pqr567') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(getUserPage('mario', query));
    return;
  }
  if (parsedUrl.pathname === '/alba/stu890vwx123yzb456') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(getUserPage('alba', query));
    return;
  }
  if (parsedUrl.pathname === '/admin/cde789fgh012ijl345') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(getAdminPage(query));
    return;
  }
  
  // APIs
  if (req.method === 'POST' && parsedUrl.pathname === '/api/camon/result') {
    // If server-side CAMON_SECRET is configured, require header X-CAMON-SECRET
    if (CAMON_SECRET) {
      const provided = req.headers['x-camon-secret'];
      if (!provided || provided !== CAMON_SECRET) {
        res.writeHead(403, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ error: 'forbidden' }));
        return;
      }
    }
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const user = data.user || 'unknown';
        // rate limit
        const now = Date.now();
        const last = CAMON_LAST_SUBMIT[user] || 0;
        if (now - last < CAMON_MIN_SUBMIT_INTERVAL_MS) {
          res.writeHead(429, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({ error: 'too_many_requests' }));
          return;
        }
        CAMON_LAST_SUBMIT[user] = now;
        const score = parseInt(data.score || 0, 10);
        const total = parseInt(data.total || 0, 10);
        let assignedLevel = data.assignedLevel;
        if (!assignedLevel) {
          assignedLevel = computeAssignedLevel(score, total);
        }
        if (!CAMON_SERVER_RESULTS[user]) CAMON_SERVER_RESULTS[user] = [];
        CAMON_SERVER_RESULTS[user].push({ date: data.date || new Date().toISOString(), score: score, total: total, assignedLevel: assignedLevel });
        // Reglas de promoción: si en las 3 últimas pruebas el porcentaje >= 0.9, subir 1 subnivel
        try {
          const history = CAMON_SERVER_RESULTS[user].slice(-5); // revisar últimas hasta 5
          const recent = CAMON_SERVER_RESULTS[user].slice(-3);
          const passedThree = recent.length === 3 && recent.every(r => (r.total>0) && (r.score / r.total) >= 0.9);
          if (passedThree) {
            const current = CAMON_PROMOTIONS[user] && CAMON_PROMOTIONS[user].level ? CAMON_PROMOTIONS[user].level : assignedLevel;
            const idx = SERVER_CAMON_SUBLEVELS.indexOf(current);
            const next = SERVER_CAMON_SUBLEVELS[Math.min(SERVER_CAMON_SUBLEVELS.length -1, idx + 1)];
            CAMON_PROMOTIONS[user] = CAMON_PROMOTIONS[user] || { history: [] };
            CAMON_PROMOTIONS[user].level = next;
            CAMON_PROMOTIONS[user].history = CAMON_PROMOTIONS[user].history || [];
            CAMON_PROMOTIONS[user].history.push({ date: new Date().toISOString(), from: current, to: next });
          }
        } catch (e) {
          console.error('Promotion check error', e.message);
        }
        // persistir en disco
        saveCamonResultsToDisk();
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }
  // DEBUG: obtener resultados almacenados en servidor
  if (req.method === 'GET' && parsedUrl.pathname === '/api/camon/debug') {
    // proteger debug con secreto si está configurado
    if (CAMON_SECRET) {
      const provided = parsedUrl.query && parsedUrl.query.secret;
      if (!provided || provided !== CAMON_SECRET) {
        res.writeHead(403, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ error: 'forbidden' }));
        return;
      }
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(CAMON_SERVER_RESULTS));
    return;
  }
  // GET history + promotions por usuario
  if (req.method === 'GET' && parsedUrl.pathname === '/api/camon/history') {
    const u = parsedUrl.query && parsedUrl.query.user ? parsedUrl.query.user : null;
    if (!u) {
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ error: 'user required' }));
      return;
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ results: CAMON_SERVER_RESULTS[u] || [], promotions: CAMON_PROMOTIONS[u] || null }));
    return;
  }
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
        status: 'pendiente'
      };
      activities.push(activity);
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({success: true}));
    });
    return;
  }
  
  if (req.method === 'POST' && parsedUrl.pathname === '/api/activity/status') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      const activity = activities.find(a => a.id === data.id);
      if (activity) {
        activity.status = data.status;
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({success: true}));
      } else {
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({success: false, message: 'Activity not found'}));
      }
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
      const { weekKey, cellKey, type, content, recipeId } = data;
      if (!mealPlan[weekKey]) {
          mealPlan[weekKey] = {};
      }
      mealPlan[weekKey][cellKey] = { type, content, recipeId, done: false };
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({success: true}));
    });
    return;
  }
  
  if (req.method === 'POST' && parsedUrl.pathname === '/api/meal-plan/mark-done') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        const { weekKey, cellKey, done } = JSON.parse(body);

        if (mealPlan[weekKey] && mealPlan[weekKey][cellKey]) {
            const meal = mealPlan[weekKey][cellKey];
            meal.done = done;

            if (done && meal.type === 'recipe') {
                const recipe = recipes.find(r => r.id === meal.recipeId);
                if (recipe && recipe.ingredients) {
                    recipe.ingredients.forEach(ingObj => {
                        const ingName = Object.keys(ingObj)[0];
                        const ingQuantity = ingObj[ingName];
                        const inventoryItem = inventory.find(i => i.name === ingName);
                        if (inventoryItem) {
                            inventoryItem.quantity = Math.max(0, inventoryItem.quantity - ingQuantity);
                        }
                    });
                }
            }
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ success: true }));
        } else {
            res.writeHead(404, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ success: false, message: 'Comida no encontrada.' }));
        }
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

  // Dev logging endpoint (simple collector for client pings)
  if (req.method === 'POST' && parsedUrl.pathname === '/api/dev/log') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        console.log('DEV LOG:', body);
      } catch (e) {}
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ ok: true }));
    });
    return;
  }

  // Dev simple-auth endpoints to ease frontend testing (no real auth)
  if (parsedUrl.pathname === '/api/simple-auth/user') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ id: 'javier', email: 'javier@app.local', firstName: 'Javier' }));
    return;
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/api/simple-auth/login') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      // echo back a simple user object
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ ok: true, user: { id: 'javier', email: 'javier@app.local', firstName: 'Javier' } }));
    });
    return;
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/api/simple-auth/logout') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ ok: true }));
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
          const textResp = openaiData.choices[0].message.content;
          // If API_KEY present, try to generate TTS audio (MP3) and return base64
          let audioBase64 = null;
          if (process.env.API_KEY) {
            try {
              const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.API_KEY}`,
                  'Content-Type': 'application/json',
                  'Accept': 'audio/mpeg'
                },
                body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice: 'alloy', input: textResp })
              });

              if (ttsRes && ttsRes.ok) {
                const ab = await ttsRes.arrayBuffer();
                const buf = Buffer.from(ab);
                audioBase64 = buf.toString('base64');
              }
            } catch (e) {
              console.error('TTS generation failed:', e && e.message ? e.message : e);
            }
          }

          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({
            response: textResp,
            audioBase64: audioBase64
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
