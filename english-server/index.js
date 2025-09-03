const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Inicializar Gemini (opcional)
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('🤖 Gemini AI inicializado');
} else {
  console.log('⚠️ Gemini no configurado - usando sistema local');
}

const { query, transaction, initDatabase } = require('./database');
const { 
  validateAuth, 
  validateExerciseCompletion, 
  validateLevelTest, 
  validateConversation,
  sanitizeText,
  isValidLevel 
} = require('./validators');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Middleware de seguridad
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: { error: 'Demasiadas peticiones, intenta más tarde' }
});
app.use('/api/', limiter);

// Rate limiting más estricto para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos de login, intenta más tarde' }
});

// Inicializar base de datos
initDatabase().catch(() => {
  console.log('⚠️ Base de datos no disponible, usando modo demo');
});

// Middleware de autenticación mejorado
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('🔍 Token recibido:', token);
    
    if (!token) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    // Token demo para desarrollo
    if (token === 'demo_token') {
      req.user = { id: 1, username: 'Usuario', level: 'A1' };
      console.log('✅ Token demo aceptado para:', req.path);
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar que el usuario existe
    const userResult = await query('SELECT id, username, level FROM users WHERE id = $1', [decoded.id]);
    if (userResult.rows.length === 0) {
      return res.status(403).json({ error: 'Usuario no válido' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    console.error('❌ Error de autenticación:', error.message);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Ruta de auto-login para integración
app.post('/api/auto-login', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username requerido' });
    }

    // Verificar si el usuario existe
    let userResult = await query('SELECT * FROM users WHERE username = $1', [username]);
    let user;

    if (userResult.rows.length === 0) {
      // Crear usuario automáticamente
      const defaultPassword = 'auto_generated_' + username;
      const hashedPassword = await bcrypt.hash(defaultPassword, 12);
      
      const createResult = await query(
        'INSERT INTO users (username, password, level) VALUES ($1, $2, $3) RETURNING id, username, level',
        [username, hashedPassword, 'A1']
      );
      
      user = createResult.rows[0];
      console.log('✅ Usuario creado automáticamente:', username);
    } else {
      user = userResult.rows[0];
      console.log('✅ Usuario existente logueado:', username);
    }
    
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      success: true,
      token, 
      user: { id: user.id, username: user.username, level: user.level } 
    });
  } catch (error) {
    console.error('❌ Error en auto-login:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas de autenticación
app.post('/api/register', authLimiter, validateAuth, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = await query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, level',
      [username, hashedPassword]
    );
    
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    
    console.log('✅ Usuario registrado:', user.username);
    res.json({ token, user });
  } catch (error) {
    console.error('❌ Error en registro:', error.message);
    if (error.code === '23505') { // Duplicate key
      return res.status(400).json({ error: 'El usuario ya existe' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/login', authLimiter, validateAuth, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    
    console.log('✅ Usuario logueado:', user.username);
    res.json({ 
      token, 
      user: { id: user.id, username: user.username, level: user.level } 
    });
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas de ejercicios y progreso
// Banco de preguntas completo
const FILL_IN_QUESTIONS_BANK = [
  // A1 Level
  { sentence: 'My name _____ John.', answer: 'is', level: 'A1' },
  { sentence: 'She _____ from Spain.', answer: 'is', level: 'A1' },
  { sentence: 'I _____ a teacher.', answer: 'am', level: 'A1' },
  { sentence: 'They _____ happy today.', answer: 'are', level: 'A1' },
  { sentence: 'We _____ in London.', answer: 'are', level: 'A1' },
  { sentence: 'He _____ my brother.', answer: 'is', level: 'A1' },
  // A2 Level
  { sentence: 'I _____ lived here for two years.', answer: 'have', level: 'A2' },
  { sentence: 'We _____ going to the cinema tomorrow.', answer: 'are', level: 'A2' },
  { sentence: 'She _____ working right now.', answer: 'is', level: 'A2' },
  { sentence: 'They _____ finished their homework.', answer: 'have', level: 'A2' },
  { sentence: 'I _____ to the store yesterday.', answer: 'went', level: 'A2' },
  { sentence: 'He _____ playing football every Sunday.', answer: 'is', level: 'A2' },
  // B1 Level
  { sentence: 'If I _____ you, I would study harder.', answer: 'were', level: 'B1' },
  { sentence: 'The book _____ was written by Shakespeare is famous.', answer: 'that', level: 'B1' },
  { sentence: 'I wish I _____ speak French fluently.', answer: 'could', level: 'B1' },
  { sentence: 'She suggested _____ to the museum.', answer: 'going', level: 'B1' },
  { sentence: 'The house _____ we visited was beautiful.', answer: 'which', level: 'B1' },
  { sentence: 'I\'d rather _____ at home tonight.', answer: 'stay', level: 'B1' },
  // B2 Level
  { sentence: 'By the time you arrive, I _____ finished cooking.', answer: 'will have', level: 'B2' },
  { sentence: 'She wishes she _____ studied medicine instead of law.', answer: 'had', level: 'B2' },
  { sentence: 'The project _____ completed by next month.', answer: 'will be', level: 'B2' },
  { sentence: 'I _____ working here for five years by December.', answer: 'will have been', level: 'B2' },
  { sentence: 'If only I _____ listened to your advice.', answer: 'had', level: 'B2' },
  { sentence: 'The report _____ being reviewed by the committee.', answer: 'is', level: 'B2' },
  // C1 Level
  { sentence: 'The proposal was rejected _____ its innovative approach.', answer: 'despite', level: 'C1' },
  { sentence: '_____ the weather, the event will take place outdoors.', answer: 'Regardless of', level: 'C1' },
  { sentence: 'The research _____ significant implications for future studies.', answer: 'has', level: 'C1' },
  { sentence: '_____ his extensive experience, he struggled with the task.', answer: 'Notwithstanding', level: 'C1' },
  { sentence: 'The committee _____ deliberating for hours before reaching a decision.', answer: 'had been', level: 'C1' },
  { sentence: 'The phenomenon _____ extensively documented in recent literature.', answer: 'has been', level: 'C1' }
];

const MULTIPLE_CHOICE_QUESTIONS_BANK = [
  // A1 Level
  { question: 'What _____ your favorite color?', options: ['is', 'are', 'am', 'be'], correct: 0, level: 'A1' },
  { question: 'They _____ students at the university.', options: ['is', 'are', 'am', 'be'], correct: 1, level: 'A1' },
  { question: 'I _____ from Italy.', options: ['am', 'is', 'are', 'be'], correct: 0, level: 'A1' },
  { question: 'She _____ very tall.', options: ['am', 'is', 'are', 'be'], correct: 1, level: 'A1' },
  { question: 'We _____ friends.', options: ['am', 'is', 'are', 'be'], correct: 2, level: 'A1' },
  { question: 'The cat _____ sleeping.', options: ['am', 'is', 'are', 'be'], correct: 1, level: 'A1' },
  // A2 Level
  { question: 'I _____ to Paris last summer.', options: ['go', 'went', 'gone', 'going'], correct: 1, level: 'A2' },
  { question: 'She _____ English for three years.', options: ['study', 'studies', 'has studied', 'studied'], correct: 2, level: 'A2' },
  { question: 'They _____ watching TV when I arrived.', options: ['was', 'were', 'are', 'is'], correct: 1, level: 'A2' },
  { question: 'I _____ never been to Japan.', options: ['has', 'have', 'had', 'having'], correct: 1, level: 'A2' },
  { question: 'She _____ cooking dinner right now.', options: ['is', 'are', 'was', 'were'], correct: 0, level: 'A2' },
  { question: 'We _____ to the beach tomorrow.', options: ['go', 'goes', 'going', 'are going'], correct: 3, level: 'A2' },
  // B1 Level
  { question: 'If it _____ tomorrow, we will stay home.', options: ['rain', 'rains', 'rained', 'raining'], correct: 1, level: 'B1' },
  { question: 'The man _____ car was stolen called the police.', options: ['who', 'whose', 'which', 'that'], correct: 1, level: 'B1' },
  { question: 'I wish I _____ more time to study.', options: ['have', 'had', 'has', 'having'], correct: 1, level: 'B1' },
  { question: 'She suggested _____ a movie tonight.', options: ['watch', 'to watch', 'watching', 'watched'], correct: 2, level: 'B1' },
  { question: 'The book _____ I bought yesterday is excellent.', options: ['who', 'whose', 'which', 'where'], correct: 2, level: 'B1' },
  { question: 'I\'d rather _____ coffee than tea.', options: ['drink', 'drinking', 'to drink', 'drank'], correct: 0, level: 'B1' },
  // B2 Level
  { question: 'I would rather you _____ smoking in the house.', options: ['stop', 'stopped', 'stopping', 'to stop'], correct: 1, level: 'B2' },
  { question: 'The meeting _____ by the time I arrived.', options: ['finished', 'had finished', 'has finished', 'was finishing'], correct: 1, level: 'B2' },
  { question: 'She _____ have told me about the party.', options: ['should', 'would', 'could', 'might'], correct: 0, level: 'B2' },
  { question: 'If I _____ known about the traffic, I would have left earlier.', options: ['have', 'had', 'has', 'having'], correct: 1, level: 'B2' },
  { question: 'The project _____ completed by next Friday.', options: ['will be', 'will have been', 'would be', 'would have been'], correct: 0, level: 'B2' },
  { question: 'I _____ working here for ten years next month.', options: ['will be', 'will have been', 'would be', 'would have been'], correct: 1, level: 'B2' },
  // C1 Level
  { question: 'The research findings were _____ with previous studies.', options: ['consistent', 'consisting', 'consisted', 'consistency'], correct: 0, level: 'C1' },
  { question: '_____ the complexity of the issue, a simple solution was found.', options: ['Despite', 'Although', 'Notwithstanding', 'Regardless'], correct: 2, level: 'C1' },
  { question: 'The committee _____ deliberating for hours before reaching a consensus.', options: ['has been', 'had been', 'have been', 'having been'], correct: 1, level: 'C1' },
  { question: 'The phenomenon _____ extensively in recent academic literature.', options: ['documented', 'has documented', 'has been documented', 'documenting'], correct: 2, level: 'C1' },
  { question: '_____ his qualifications, he was not selected for the position.', options: ['Despite', 'Although', 'Notwithstanding', 'Regardless'], correct: 0, level: 'C1' },
  { question: 'The implications of this research _____ far-reaching.', options: ['is', 'are', 'has', 'have'], correct: 1, level: 'C1' }
];

// Función para mezclar array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Función para seleccionar preguntas aleatorias
function selectRandomQuestions(bank, count) {
  const shuffled = shuffleArray(bank);
  return shuffled.slice(0, count).map((q, index) => ({
    id: index + 1,
    ...q,
    level: undefined // Ocultar nivel
  }));
}

app.get('/api/level-test', authenticateToken, async (req, res) => {
  try {
    console.log('✅ Generando prueba de nivel aleatoria');
    
    const levelTest = {
      fillInQuestions: selectRandomQuestions(FILL_IN_QUESTIONS_BANK, 10),
      multipleChoiceQuestions: selectRandomQuestions(MULTIPLE_CHOICE_QUESTIONS_BANK, 10)
    };
    
    console.log('✅ Prueba de nivel enviada:', {
      fillIn: levelTest.fillInQuestions.length,
      multiple: levelTest.multipleChoiceQuestions.length
    });
    res.json(levelTest);
  } catch (error) {
    console.error('❌ Error obteniendo test de nivel:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/level-test/submit', authenticateToken, async (req, res) => {
  try {
    const { fillInAnswers, multipleChoiceAnswers, questionData } = req.body;
    
    let fillInScore = 0;
    let multipleScore = 0;
    
    // Calcular puntuación fill-in usando las respuestas correctas de cada pregunta
    if (questionData && questionData.fillInQuestions) {
      fillInAnswers.forEach((answer, index) => {
        const correctAnswer = questionData.fillInQuestions[index]?.answer;
        if (answer && correctAnswer && answer.toLowerCase().trim() === correctAnswer.toLowerCase()) {
          fillInScore++;
        }
      });
    }
    
    // Calcular puntuación multiple choice usando las respuestas correctas de cada pregunta
    if (questionData && questionData.multipleChoiceQuestions) {
      multipleChoiceAnswers.forEach((answer, index) => {
        const correctAnswer = questionData.multipleChoiceQuestions[index]?.correct;
        if (answer === correctAnswer) {
          multipleScore++;
        }
      });
    }
    
    const totalScore = fillInScore + multipleScore;
    
    // Determinar nivel basado en puntuación total (0-20)
    let level = 'A1';
    if (totalScore >= 18) level = 'C1';
    else if (totalScore >= 15) level = 'B2';
    else if (totalScore >= 12) level = 'B1';
    else if (totalScore >= 8) level = 'A2';
    else level = 'A1';
    
    console.log('✅ Prueba de nivel completada (modo demo):', { 
      user: req.user.username, 
      level, 
      fillInScore, 
      multipleScore, 
      totalScore 
    });
    
    res.json({ 
      level, 
      fillInScore, 
      multipleScore, 
      totalScore, 
      total: 20,
      breakdown: {
        fillIn: `${fillInScore}/10`,
        multipleChoice: `${multipleScore}/10`
      }
    });
  } catch (error) {
    console.error('❌ Error procesando prueba de nivel:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/daily-exercises', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Modo demo - usar nivel por defecto
    const level = req.user.level || 'A1';
    
    const exercises = generateDailyExercises(level, today);
    
    // Modo demo - progreso por defecto
    exercises.progress = {
      grammar_completed: false,
      reading_completed: false,
      grammar_score: 0,
      reading_score: 0,
      daily_average: 0
    };
    
    console.log('✅ Ejercicios diarios enviados para nivel:', level);
    res.json(exercises);
  } catch (error) {
    console.error('❌ Error obteniendo ejercicios:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/daily-exercises/complete', authenticateToken, validateExerciseCompletion, async (req, res) => {
  try {
    const { type, score, answers } = req.body;
    
    // Modo demo - solo simular completado
    console.log('✅ Ejercicio completado (modo demo):', { user: req.user.username, type, score });
    res.json({ success: true, score });
  } catch (error) {
    console.error('❌ Error completando ejercicio:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/user-evolution', authenticateToken, async (req, res) => {
  try {
    // Modo demo - datos de ejemplo
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const demoData = {
      dailyExercises: [
        {
          date: today.toISOString().split('T')[0],
          grammar_score: 8,
          reading_score: 7,
          daily_average: 7.5
        },
        {
          date: yesterday.toISOString().split('T')[0],
          grammar_score: 9,
          reading_score: 8,
          daily_average: 8.5
        }
      ],
      levelTests: []
    };
    
    console.log('✅ Evolución enviada (modo demo)');
    res.json(demoData);
  } catch (error) {
    console.error('❌ Error obteniendo evolución:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/conversation/save', authenticateToken, validateConversation, async (req, res) => {
  try {
    const { message, sender } = req.body;
    const sanitizedMessage = sanitizeText(message);
    
    await query(
      'INSERT INTO conversation_history (user_id, message, sender) VALUES ($1, $2, $3)',
      [req.user.id, sanitizedMessage, sender]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error guardando conversación:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/conversation/history', authenticateToken, async (req, res) => {
  try {
    // Modo demo - historial simulado
    const demoHistory = [
      { message: 'Hello! I\'m Elizabeth. How are you today?', sender: 'elizabeth', timestamp: new Date() },
      { message: 'Hi Elizabeth, I\'m doing well, thanks!', sender: 'user', timestamp: new Date() }
    ];
    
    console.log('✅ Historial enviado (modo demo)');
    res.json(demoHistory);
  } catch (error) {
    console.error('❌ Error obteniendo historial:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Nueva ruta para chat con Gemini
app.post('/api/chat/gemini', authenticateToken, async (req, res) => {
  try {
    const { message, userLevel, conversationHistory } = req.body;
    
    if (!genAI) {
      return res.status(503).json({ error: 'Gemini no disponible' });
    }
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Construir contexto de conversación
    let contextPrompt = `You are Elizabeth, a warm and encouraging English teacher from Cambridge. 
You're having a natural conversation with a student whose English level is ${userLevel}.

IMPORTANT GUIDELINES:
- Keep responses to 1-2 sentences maximum
- Be conversational and natural, like a real person
- Remember what was discussed before
- Ask follow-up questions to keep the conversation flowing
- Gently correct major grammar mistakes in a friendly way
- Adapt your vocabulary to the student's level

`;
    
    // Añadir historial de conversación
    if (conversationHistory && conversationHistory.length > 0) {
      contextPrompt += "Previous conversation:\n";
      conversationHistory.slice(-6).forEach(msg => {
        const speaker = msg.sender === 'user' ? 'Student' : 'Elizabeth';
        contextPrompt += `${speaker}: ${msg.message}\n`;
      });
      contextPrompt += "\n";
    }
    
    contextPrompt += `Student just said: "${message}"\n\nElizabeth's response:`;
    
    const result = await model.generateContent(contextPrompt);
    const response = result.response.text();
    
    console.log('✅ Respuesta de Gemini con contexto generada');
    res.json({ response });
  } catch (error) {
    console.error('❌ Error con Gemini:', error.message);
    res.status(500).json({ error: 'Error generando respuesta' });
  }
});

// Función auxiliar para generar ejercicios (mantenida igual)
function generateDailyExercises(level, date) {
  const grammarLessons = {
    A1: {
      lesson: 'Presente Simple del verbo "to be"',
      explanation: 'El verbo "to be" (ser/estar) es fundamental en inglés. Se conjuga: I am, You are, He/She/It is, We are, They are.',
      questions: [
        { sentence: 'I ___ a student.', answer: 'am' },
        { sentence: 'She ___ very happy today.', answer: 'is' },
        { sentence: 'They ___ from Spain.', answer: 'are' },
        { sentence: 'We ___ in the classroom.', answer: 'are' },
        { sentence: 'He ___ my brother.', answer: 'is' },
        { sentence: 'You ___ a good teacher.', answer: 'are' },
        { sentence: 'It ___ a beautiful day.', answer: 'is' },
        { sentence: 'The cats ___ sleeping.', answer: 'are' },
        { sentence: 'I ___ not tired.', answer: 'am' },
        { sentence: 'She ___ at home now.', answer: 'is' }
      ]
    },
    A2: {
      lesson: 'Presente Continuo',
      explanation: 'El presente continuo se forma con "to be" + verbo-ing. Se usa para acciones que ocurren ahora: I am reading, She is working.',
      questions: [
        { sentence: 'I ___ ___ a book right now.', answer: 'am reading' },
        { sentence: 'She ___ ___ to music.', answer: 'is listening' },
        { sentence: 'They ___ ___ football.', answer: 'are playing' },
        { sentence: 'We ___ ___ dinner.', answer: 'are having' },
        { sentence: 'He ___ ___ his homework.', answer: 'is doing' },
        { sentence: 'You ___ ___ very well today.', answer: 'are working' },
        { sentence: 'The dog ___ ___ in the garden.', answer: 'is running' },
        { sentence: 'I ___ ___ for the bus.', answer: 'am waiting' },
        { sentence: 'They ___ ___ a movie.', answer: 'are watching' },
        { sentence: 'She ___ ___ her teeth.', answer: 'is brushing' }
      ]
    },
    B1: {
      lesson: 'Presente Perfecto',
      explanation: 'El presente perfecto se forma con "have/has" + participio pasado. Se usa para experiencias o acciones que conectan el pasado con el presente.',
      questions: [
        { sentence: 'I ___ ___ to London twice.', answer: 'have been' },
        { sentence: 'She ___ ___ her homework already.', answer: 'has finished' },
        { sentence: 'They ___ never ___ sushi.', answer: 'have eaten' },
        { sentence: 'We ___ ___ here for two hours.', answer: 'have waited' },
        { sentence: 'He ___ just ___ from work.', answer: 'has arrived' },
        { sentence: 'You ___ ___ this movie before.', answer: 'have seen' },
        { sentence: 'I ___ ___ my keys somewhere.', answer: 'have lost' },
        { sentence: 'She ___ ___ three languages.', answer: 'has learned' },
        { sentence: 'They ___ ___ in Paris since 2010.', answer: 'have lived' },
        { sentence: 'We ___ ___ this problem many times.', answer: 'have discussed' }
      ]
    }
  };

  const readingTexts = {
    A1: {
      text: 'My name is Sarah and I am 25 years old. I live in London with my family. I work in a small office near my house. Every morning, I wake up at 7 o\'clock and have breakfast with my parents. Then I walk to work because it is only 10 minutes from my house. I like my job because my colleagues are very friendly. In the evening, I usually watch TV or read a book.',
      questions: [
        { question: 'How old is Sarah?', options: ['23', '24', '25', '26'], correct: 2 },
        { question: 'Where does Sarah live?', options: ['Paris', 'London', 'Madrid', 'Rome'], correct: 1 },
        { question: 'What time does she wake up?', options: ['6 o\'clock', '7 o\'clock', '8 o\'clock', '9 o\'clock'], correct: 1 },
        { question: 'How does she go to work?', options: ['By car', 'By bus', 'She walks', 'By train'], correct: 2 },
        { question: 'How long does it take to get to work?', options: ['5 minutes', '10 minutes', '15 minutes', '20 minutes'], correct: 1 },
        { question: 'Why does she like her job?', options: ['Good salary', 'Friendly colleagues', 'Near home', 'Easy work'], correct: 1 },
        { question: 'Who does she have breakfast with?', options: ['Friends', 'Colleagues', 'Parents', 'Alone'], correct: 2 },
        { question: 'What does she do in the evening?', options: ['Work', 'Exercise', 'Watch TV or read', 'Cook'], correct: 2 },
        { question: 'Where is her office?', options: ['Far from home', 'Near her house', 'In the city center', 'Unknown'], correct: 1 },
        { question: 'What does Sarah do for work?', options: ['Teacher', 'Doctor', 'Office worker', 'Student'], correct: 2 }
      ]
    }
  };

  return {
    date: date,
    grammar: grammarLessons[level] || grammarLessons['A1'],
    reading: readingTexts[level] || readingTexts['A1']
  };
}

// Función auxiliar para progresión de niveles (simplificada)
async function checkLevelProgression(userId, dailyScore) {
  try {
    // Obtener nivel actual del usuario
    const userResult = await query('SELECT level FROM users WHERE id = $1', [userId]);
    const currentLevel = userResult.rows[0]?.level || 'A1';
    
    // Lógica simple de progresión
    if (dailyScore >= 9 && currentLevel === 'A1') {
      await query('UPDATE users SET level = $2 WHERE id = $1', [userId, 'A2']);
      console.log('📈 Usuario promovido a A2');
    } else if (dailyScore >= 9 && currentLevel === 'A2') {
      await query('UPDATE users SET level = $2 WHERE id = $1', [userId, 'B1']);
      console.log('📈 Usuario promovido a B1');
    }
    
    console.log('📈 Verificando progresión de nivel:', { userId, dailyScore, currentLevel });
  } catch (error) {
    console.error('❌ Error en progresión de nivel:', error.message);
  }
}

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('❌ Error no manejado:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
});