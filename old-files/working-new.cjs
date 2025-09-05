const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

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

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // Ruta de inglés - PRIMERA PRIORIDAD
  if (parsedUrl.pathname === '/english' || parsedUrl.pathname === '/english/') {
    const englishHTML = `<!DOCTYPE html>
<html>
<head>
  <title>Ca'mon English</title>
  <style>
    * { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; color: white; margin-bottom: 40px; }
    .card { background: white; border-radius: 12px; padding: 30px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .btn { background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px; margin: 10px; }
    .btn:hover { background: #5a67d8; }
    .level-badge { background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; }
    .exercise { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0; }
    input[type="text"] { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin: 5px 0; }
    .chat-area { height: 300px; overflow-y: auto; border: 1px solid #ddd; padding: 15px; background: #f9f9f9; border-radius: 8px; }
    .message { margin: 10px 0; padding: 10px; border-radius: 8px; }
    .user-message { background: #e3f2fd; text-align: right; }
    .ai-message { background: #f0f4f8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Ca'mon English</h1>
      <p>Aprende inglés de forma divertida y efectiva</p>
      <div id="user-info"></div>
    </div>
    
    <div class="card">
      <h2>📊 Tu Nivel Actual</h2>
      <p>Nivel: <span class="level-badge" id="current-level">A1</span></p>
      <button class="btn" onclick="startLevelTest()">🎯 Hacer Prueba de Nivel</button>
    </div>
    
    <div class="card">
      <h2>📚 Ejercicios Diarios</h2>
      <div class="exercise">
        <h3>Gramática: Presente Simple</h3>
        <p>Completa la frase:</p>
        <p id="grammar-question">I _____ a student.</p>
        <input type="text" id="grammar-answer" placeholder="Escribe tu respuesta">
        <button class="btn" onclick="checkGrammar()">Verificar</button>
        <div id="grammar-result"></div>
      </div>
      
      <div class="exercise">
        <h3>Comprensión Lectora</h3>
        <p id="reading-text"><strong>Texto:</strong> Hello, my name is Sarah. I am 25 years old and I live in London.</p>
        <p id="reading-question"><strong>Pregunta:</strong> How old is Sarah?</p>
        <div id="reading-options">
          <input type="radio" name="reading" value="23"> 23
          <input type="radio" name="reading" value="24"> 24
          <input type="radio" name="reading" value="25"> 25
          <input type="radio" name="reading" value="26"> 26
        </div>
        <button class="btn" onclick="checkReading()">Verificar</button>
        <div id="reading-result"></div>
      </div>
    </div>
    
    <div class="card">
      <h2>💬 Chat con Elizabeth (Tu Profesora)</h2>
      <div class="chat-area" id="chat-area">
        <div class="message ai-message">
          <strong>Elizabeth:</strong> Hello! I'm Elizabeth, your English teacher. How are you today?
        </div>
      </div>
      <div style="display: flex; gap: 10px; margin-top: 10px;">
        <input type="text" id="chat-input" placeholder="Escribe tu mensaje en inglés..." style="flex: 1;">
        <button class="btn" onclick="sendMessage()">Enviar</button>
      </div>
    </div>
    
    <div class="card">
      <h2>📈 Tu Progreso</h2>
      <p>Ejercicios completados hoy: <strong id="completed-today">0/2</strong></p>
      <p>Racha actual: <strong>1 día</strong></p>
      <p id="score-display">Puntuación promedio: <strong>--</strong></p>
    </div>
  </div>

  <script>
    const urlParams = new URLSearchParams(window.location.search);
    const userName = urlParams.get('user') || 'Usuario';
    document.getElementById('user-info').innerHTML = \`<p>Bienvenido, \${userName}!</p>\`;
    
    let score = 0;
    let totalQuestions = 0;
    let completedExercises = 0;
    
    const grammarQuestions = [
      {q: 'I _____ a student.', a: 'am'},
      {q: 'She _____ from Spain.', a: 'is'},
      {q: 'They _____ happy.', a: 'are'},
      {q: 'We _____ learning English.', a: 'are'},
      {q: 'He _____ a doctor.', a: 'is'}
    ];
    
    const readingTexts = [
      {
        text: 'Hello, my name is Sarah. I am 25 years old and I live in London.',
        q: 'How old is Sarah?',
        options: ['23', '24', '25', '26'],
        a: '25'
      },
      {
        text: 'John works in a hospital. He is a doctor. He helps sick people every day.',
        q: 'What is Johns job?',
        options: ['Teacher', 'Doctor', 'Engineer', 'Nurse'],
        a: 'Doctor'
      },
      {
        text: 'Maria likes to read books. She goes to the library every weekend.',
        q: 'When does Maria go to the library?',
        options: ['Every day', 'Every weekend', 'Every month', 'Never'],
        a: 'Every weekend'
      }
    ];
    
    let currentGrammarIndex = 0;
    let currentReadingIndex = 0;
    
    function startLevelTest() {
      const questions = [
        'What is your name?',
        'How old are you?',
        'Where do you live?',
        'What do you do for work?',
        'Tell me about your hobbies'
      ];
      
      let answers = [];
      let totalLength = 0;
      
      for (let i = 0; i < questions.length; i++) {
        const answer = prompt(questions[i]);
        if (answer && answer.trim()) {
          answers.push(answer);
          totalLength += answer.length;
        }
      }
      
      if (answers.length === 0) {
        alert('Por favor, responde al menos una pregunta.');
        return;
      }
      
      const avgLength = totalLength / answers.length;
      let level = 'A1';
      
      if (avgLength > 15) level = 'A2';
      if (avgLength > 30) level = 'B1';
      if (avgLength > 50) level = 'B2';
      if (avgLength > 80) level = 'C1';
      
      document.getElementById('current-level').textContent = level;
      alert(\`¡Prueba completada! Tu nivel estimado es: \${level}\`);
    }
    
    function checkGrammar() {
      const answer = document.getElementById('grammar-answer').value.toLowerCase().trim();
      const result = document.getElementById('grammar-result');
      const currentQ = grammarQuestions[currentGrammarIndex];
      
      totalQuestions++;
      
      if (answer === currentQ.a) {
        score++;
        result.innerHTML = '<p style="color: green;">✅ ¡Correcto!</p>';
      } else {
        result.innerHTML = \`<p style="color: red;">❌ Incorrecto. La respuesta correcta es "\${currentQ.a}".</p>\`;
      }
      
      updateProgress();
      
      setTimeout(() => {
        currentGrammarIndex = (currentGrammarIndex + 1) % grammarQuestions.length;
        const nextQ = grammarQuestions[currentGrammarIndex];
        document.getElementById('grammar-question').textContent = nextQ.q;
        document.getElementById('grammar-answer').value = '';
        result.innerHTML = '';
      }, 2000);
    }
    
    function checkReading() {
      const selected = document.querySelector('input[name="reading"]:checked');
      const result = document.getElementById('reading-result');
      const currentText = readingTexts[currentReadingIndex];
      
      if (!selected) {
        result.innerHTML = '<p style="color: orange;">⚠️ Por favor, selecciona una respuesta.</p>';
        return;
      }
      
      totalQuestions++;
      
      if (selected.value === currentText.a) {
        score++;
        result.innerHTML = '<p style="color: green;">✅ ¡Correcto!</p>';
      } else {
        result.innerHTML = \`<p style="color: red;">❌ Incorrecto. La respuesta correcta es "\${currentText.a}".</p>\`;
      }
      
      updateProgress();
      
      setTimeout(() => {
        currentReadingIndex = (currentReadingIndex + 1) % readingTexts.length;
        const nextText = readingTexts[currentReadingIndex];
        
        document.getElementById('reading-text').innerHTML = \`<strong>Texto:</strong> \${nextText.text}\`;
        document.getElementById('reading-question').innerHTML = \`<strong>Pregunta:</strong> \${nextText.q}\`;
        
        const optionsDiv = document.getElementById('reading-options');
        optionsDiv.innerHTML = nextText.options.map(opt => 
          \`<input type="radio" name="reading" value="\${opt}"> \${opt}\`
        ).join(' ');
        
        result.innerHTML = '';
      }, 2000);
    }
    
    function updateProgress() {
      const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
      document.getElementById('score-display').innerHTML = \`Puntuación promedio: <strong>\${percentage}%</strong>\`;
      
      if (totalQuestions % 2 === 0) {
        completedExercises = Math.min(2, Math.floor(totalQuestions / 2));
        document.getElementById('completed-today').textContent = \`\${completedExercises}/2\`;
      }
    }
    
    function sendMessage() {
      const input = document.getElementById('chat-input');
      const chatArea = document.getElementById('chat-area');
      const message = input.value.trim();
      
      if (!message) return;
      
      chatArea.innerHTML += \`
        <div class="message user-message">
          <strong>\${userName}:</strong> \${message}
        </div>
      \`;
      
      setTimeout(() => {
        const responses = [
          "That's great! Tell me more about it.",
          "Interesting! What do you think about that?",
          "I see. How does that make you feel?",
          "That sounds wonderful! What happened next?",
          "Really? That's quite fascinating!",
          "Excellent! Your English is improving.",
          "Good job! Keep practicing.",
          "That's a good point. Can you explain more?"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        chatArea.innerHTML += \`
          <div class="message ai-message">
            <strong>Elizabeth:</strong> \${randomResponse}
          </div>
        \`;
        chatArea.scrollTop = chatArea.scrollHeight;
      }, 1000);
      
      input.value = '';
      chatArea.scrollTop = chatArea.scrollHeight;
    }
    
    document.getElementById('chat-input').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  </script>
</body>
</html>`;
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(englishHTML);
    return;
  }
  
  // Resto del código igual...
  // [Aquí iría todo el resto del código del servidor original]
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});