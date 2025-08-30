const http = require('http');
const url = require('url');

const activities = { javier: [], raquel: [], mario: [], alba: [] };

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  if (parsedUrl.pathname === '/admin/cde789fgh012ijl345') {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(`<!DOCTYPE html>
<html><head><title>Admin</title></head><body>
<h1>Administrador</h1>
<button onclick="show('add')">+ Añadir Actividad</button>
<button onclick="show('calendar')">Vista Calendario</button>

<div id="add" style="display:none; margin:20px 0;">
<h3>Nueva Actividad</h3>
<input type="checkbox" value="javier"> Javier
<input type="checkbox" value="raquel"> Raquel<br>
<input type="text" id="title" placeholder="Título"><br>
<input type="time" id="time"><br>
<button onclick="save()">Guardar</button>
</div>

<div id="calendar" style="display:none;">
<h3>Calendario</h3>
<p>Vista de calendario funcionando</p>
</div>

<script>
function show(view) {
  document.getElementById('add').style.display = view === 'add' ? 'block' : 'none';
  document.getElementById('calendar').style.display = view === 'calendar' ? 'block' : 'none';
}
function save() { alert('Actividad guardada'); }
</script>
</body></html>`);
    return;
  }
  
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('<h1>Organización Familiar</h1>');
});

server.listen(process.env.PORT || 3000);