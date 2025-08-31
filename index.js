const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/admin/cde789fgh012ijl345') {
    res.writeHead(200, {'Content-Type': 'text/html'});
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
  <h1>ADMINISTRADOR ACTUALIZADO</h1>
  
  <div>
    <button onclick="showSection('activities')">+ Añadir Actividad</button>
    <button onclick="showSection('calendar')">Vista Calendario</button>
  </div>
  
  <div id="activities" class="section hidden">
    <h2>Nueva Actividad</h2>
    <div>
      <label>Usuarios:</label><br>
      <input type="checkbox" value="javier"> Javier
      <input type="checkbox" value="raquel"> Raquel
      <input type="checkbox" value="mario"> Mario
      <input type="checkbox" value="alba"> Alba
    </div><br>
    
    <div>
      <label>Título:</label><br>
      <input type="text" id="title" style="width: 300px;" placeholder="Ej: Gimnasio, Leer, Violín">
    </div><br>
    
    <div>
      <label>Hora:</label><br>
      <input type="time" id="time">
    </div><br>
    
    <button onclick="saveActivity()">Guardar</button>
  </div>
  
  <div id="calendar" class="section hidden">
    <h2>Vista Calendario</h2>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
      <div><h3>Javier</h3><div id="javier-activities">Sin actividades</div></div>
      <div><h3>Raquel</h3><div id="raquel-activities">Sin actividades</div></div>
      <div><h3>Mario</h3><div id="mario-activities">Sin actividades</div></div>
      <div><h3>Alba</h3><div id="alba-activities">Sin actividades</div></div>
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
      
      if (users.length === 0 || !title || !time) {
        alert('Completa todos los campos');
        return;
      }
      
      alert('Actividad "' + title + '" creada para: ' + users.join(', '));
      
      // Mostrar en calendario
      users.forEach(user => {
        const userDiv = document.getElementById(user + '-activities');
        if (userDiv.textContent === 'Sin actividades') userDiv.innerHTML = '';
        userDiv.innerHTML += '<div style="margin: 5px 0; padding: 5px; background: #f0f0f0; border-radius: 3px;">' + title + ' - ' + time + '</div>';
      });
      
      // Limpiar
      document.getElementById('title').value = '';
      document.getElementById('time').value = '';
      document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    }
  </script>
</body>
</html>`);
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('<h1>Organización Familiar</h1>');
  }
});

server.listen(process.env.PORT || 3000);