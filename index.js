const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/admin/cde789fgh012ijl345') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(`<!DOCTYPE html>
<html>
<head><title>Admin</title>
<style>
body{font-family:Arial;margin:20px}
button{padding:15px 25px;margin:10px;background:#007bff;color:white;border:none;border-radius:5px;cursor:pointer;font-size:16px}
button:hover{background:#0056b3}
.section{margin:20px 0;padding:20px;border:1px solid #ddd;border-radius:8px;background:#f9f9f9}
.hidden{display:none}
input,select{padding:8px;margin:5px;border:1px solid #ddd;border-radius:4px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:20px}
.card{background:white;padding:15px;border-radius:8px;border:1px solid #ddd}
.item{background:#e3f2fd;padding:8px;margin:5px 0;border-radius:4px;border-left:4px solid #2196f3}
</style>
</head>
<body>
<h1>🏠 ADMINISTRADOR</h1>

<button onclick="show('crear')">➕ CREAR ACTIVIDAD</button>
<button onclick="show('calendario')">📅 VER CALENDARIO</button>

<div id="crear" class="section hidden">
<h2>Nueva Actividad</h2>
<div>
<label>Usuarios:</label><br>
<label><input type="checkbox" value="javier"> Javier</label>
<label><input type="checkbox" value="raquel"> Raquel</label>
<label><input type="checkbox" value="mario"> Mario</label>
<label><input type="checkbox" value="alba"> Alba</label>
</div><br>

<label>Actividad:</label><br>
<input type="text" id="titulo" placeholder="Ej: Gimnasio, Leer, Violín" style="width:300px"><br><br>

<label>Hora:</label><br>
<input type="time" id="hora"><br><br>

<button onclick="save()" style="background:#28a745">💾 GUARDAR</button>
</div>

<div id="calendario" class="section hidden">
<h2>📅 Calendario</h2>
<div class="grid">
<div class="card"><h3>👨 Javier</h3><div id="javier">Sin actividades</div></div>
<div class="card"><h3>👩 Raquel</h3><div id="raquel">Sin actividades</div></div>
<div class="card"><h3>👦 Mario</h3><div id="mario">Sin actividades</div></div>
<div class="card"><h3>👧 Alba</h3><div id="alba">Sin actividades</div></div>
</div>
</div>

<script>
function show(s) {
document.getElementById('crear').classList.add('hidden');
document.getElementById('calendario').classList.add('hidden');
document.getElementById(s).classList.remove('hidden');
}

function save() {
const users = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
const titulo = document.getElementById('titulo').value.trim();
const hora = document.getElementById('hora').value;

if (users.length === 0) { alert('❌ Selecciona usuarios'); return; }
if (!titulo) { alert('❌ Escribe actividad'); return; }
if (!hora) { alert('❌ Selecciona hora'); return; }

users.forEach(user => {
const div = document.getElementById(user);
if (div.textContent === 'Sin actividades') div.innerHTML = '';
div.innerHTML += '<div class="item"><strong>' + titulo + '</strong><br>🕐 ' + hora + '</div>';
});

document.getElementById('titulo').value = '';
document.getElementById('hora').value = '';
document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

alert('✅ Actividad "' + titulo + '" creada para: ' + users.join(', '));
show('calendario');
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