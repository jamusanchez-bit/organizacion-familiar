export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`<!DOCTYPE html>
<html><head><title>Admin</title></head><body>
<h1>ADMINISTRADOR - FUNCIONA</h1>
<button onclick="show('add')">+ Añadir Actividad</button>
<button onclick="show('calendar')">Vista Calendario</button>

<div id="add" style="display:none; margin:20px;">
<h3>Nueva Actividad</h3>
<input type="checkbox" value="javier"> Javier
<input type="checkbox" value="raquel"> Raquel<br>
<input type="text" placeholder="Título"><br>
<button onclick="alert('Guardado')">Guardar</button>
</div>

<div id="calendar" style="display:none;">
<h3>Vista Calendario</h3>
<p>Calendario funcionando</p>
</div>

<script>
function show(view) {
  document.getElementById('add').style.display = view === 'add' ? 'block' : 'none';
  document.getElementById('calendar').style.display = view === 'calendar' ? 'block' : 'none';
}
</script>
</body></html>`);
}