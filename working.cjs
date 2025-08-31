const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  if (parsedUrl.pathname === '/admin/cde789fgh012ijl345') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(`<!DOCTYPE html>
<html>
<head>
  <title>Administrador</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    button { padding: 10px 20px; margin: 10px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
    .section { margin: 20px 0; padding: 20px; border: 1px solid #ccc; border-radius: 5px; }
    .hidden { display: none; }
  </style>
</head>
<body>
  <h1>Panel de Administrador</h1>
  
  <div>
    <button onclick="showSection('activities')">Gestionar Actividades</button>
    <button onclick="showSection('calendar')">Vista Calendario</button>
  </div>
  
  <div id="activities" class="section hidden">
    <h2>Añadir Nueva Actividad</h2>
    <div>
      <label>Usuarios:</label><br>
      <input type="checkbox" id="javier" value="javier"> Javier
      <input type="checkbox" id="raquel" value="raquel"> Raquel
      <input type="checkbox" id="mario" value="mario"> Mario
      <input type="checkbox" id="alba" value="alba"> Alba
    </div><br>
    
    <div>
      <label>Título:</label><br>
      <input type="text" id="title" style="width: 300px;" placeholder="Ej: Gimnasio, Leer, Violín">
    </div><br>
    
    <div>
      <label>Hora:</label><br>
      <input type="time" id="time">
    </div><br>
    
    <div>
      <label>Duración (minutos):</label><br>
      <input type="number" id="duration" value="30" min="1">
    </div><br>
    
    <button onclick="saveActivity()">Guardar Actividad</button>
  </div>
  
  <div id="calendar" class="section hidden">
    <h2>Vista Calendario</h2>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
      <div>
        <h3>Javier</h3>
        <div id="javier-activities">Sin actividades</div>
      </div>
      <div>
        <h3>Raquel</h3>
        <div id="raquel-activities">Sin actividades</div>
      </div>
      <div>
        <h3>Mario</h3>
        <div id="mario-activities">Sin actividades</div>
      </div>
      <div>
        <h3>Alba</h3>
        <div id="alba-activities">Sin actividades</div>
      </div>
    </div>
  </div>
  
  <script>
    function showSection(section) {
      document.getElementById('activities').classList.add('hidden');
      document.getElementById('calendar').classList.add('hidden');
      document.getElementById(section).classList.remove('hidden');
    }
    
    function saveActivity() {
      const users = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
      const title = document.getElementById('title').value;
      const time = document.getElementById('time').value;
      const duration = document.getElementById('duration').value;
      
      if (users.length === 0) {
        alert('Selecciona al menos un usuario');
        return;
      }
      
      if (!title || !time) {
        alert('Completa título y hora');
        return;
      }
      
      // Simular guardado
      alert('Actividad "' + title + '" creada para: ' + users.join(', '));
      
      // Limpiar formulario
      document.getElementById('title').value = '';
      document.getElementById('time').value = '';
      document.getElementById('duration').value = '30';
      document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
      
      // Mostrar en calendario
      users.forEach(user => {
        const userDiv = document.getElementById(user + '-activities');
        if (userDiv.textContent === 'Sin actividades') {
          userDiv.innerHTML = '';
        }
        userDiv.innerHTML += '<div style="margin: 5px 0; padding: 5px; background: #f0f0f0; border-radius: 3px;">' + title + ' - ' + time + '</div>';
      });
    }
  </script>
</body>
</html>`);
    return;
  }
  
  // Página principal
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  res.end('<h1>Organización Familiar</h1><p>Accede con tu enlace personal</p>');
});

const port = process.env.PORT || 7777;
server.listen(port, () => {
  console.log('Servidor funcionando en puerto', port);
});