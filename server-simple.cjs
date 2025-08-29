const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Sessions
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Usuarios
const USERS = {
  javier: { id: 'javier', name: 'Javier', password: 'password123' },
  raquel: { id: 'raquel', name: 'Raquel', password: 'password456' },
  mario: { id: 'mario', name: 'Mario', password: 'password789' },
  alba: { id: 'alba', name: 'Alba', password: 'password000' },
  javi_administrador: { id: 'javi_administrador', name: 'Javi (Admin)', password: 'admin123' }
};

// Datos de ejemplo
const recipes = [
  { id: '1', name: 'Paella', category: 'comidas', instructions: 'Cocinar arroz con mariscos' },
  { id: '2', name: 'Tortilla', category: 'cenas', instructions: 'Batir huevos y hacer tortilla' }
];

const inventory = [
  { id: '1', name: 'Arroz', currentQuantity: '2', minimumQuantity: '1', unit: 'kg', category: 'otros' },
  { id: '2', name: 'Huevos', currentQuantity: '12', minimumQuantity: '6', unit: 'unidades', category: 'otros' }
];

// Auth routes
app.post('/api/simple-auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS[username];
  
  if (user && user.password === password) {
    req.session.user = {
      claims: {
        sub: user.id,
        email: `${user.id}@app.local`,
        firstName: user.name
      }
    };
    res.json({ success: true, user: { id: user.id, email: `${user.id}@app.local`, firstName: user.name } });
  } else {
    res.status(401).json({ message: 'Credenciales inválidas' });
  }
});

app.post('/api/simple-auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

app.get('/api/simple-auth/user', (req, res) => {
  if (req.session?.user?.claims?.sub) {
    const user = USERS[req.session.user.claims.sub];
    if (user) {
      return res.json({
        id: user.id,
        email: `${user.id}@app.local`,
        firstName: user.name
      });
    }
  }
  res.status(401).json({ message: 'Unauthorized' });
});

// API routes
app.get('/api/recipes', (req, res) => {
  if (!req.session?.user) return res.status(401).json({ message: 'Unauthorized' });
  res.json(recipes);
});

app.get('/api/inventory', (req, res) => {
  if (!req.session?.user) return res.status(401).json({ message: 'Unauthorized' });
  res.json(inventory);
});

// Simple HTML response
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Organización Familiar</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1>Servidor funcionando</h1>
      <p>Ve a <a href="http://localhost:5173">http://localhost:5173</a> para la aplicación</p>
    </body>
    </html>
  `);
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});