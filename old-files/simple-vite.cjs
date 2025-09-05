const express = require('express');
const path = require('path');

const app = express();

// Serve static files from src
app.use(express.static('src'));
app.use('/node_modules', express.static('node_modules'));

// Simple HTML with React
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Organización Familiar</title>
  <meta charset="utf-8">
  <script type="module">
    import { createRoot } from '/node_modules/react-dom/client.js';
    import { createElement } from '/node_modules/react/index.js';
    
    const App = () => createElement('div', null, 'Hola desde React!');
    
    const root = createRoot(document.getElementById('root'));
    root.render(createElement(App));
  </script>
</head>
<body>
  <div id="root">Cargando...</div>
</body>
</html>
  `);
});

const port = 5173;
app.listen(port, () => {
  console.log(`Frontend running on http://localhost:${port}`);
});