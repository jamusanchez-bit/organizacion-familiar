const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/admin/cde789fgh012ijl345') {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(`<h1>FUNCIONA - NUEVA VERSION</h1>
<button onclick="alert('Crear actividad')">+ Añadir Actividad</button>
<button onclick="alert('Ver calendario')">Vista Calendario</button>`);
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('<h1>Organización Familiar</h1>');
  }
});

server.listen(process.env.PORT || 3000);