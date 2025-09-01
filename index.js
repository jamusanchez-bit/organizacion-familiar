const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/admin/cde789fgh012ijl345') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(`<!DOCTYPE html>
<html>
<head>
  <title>Administrador</title>
  <style>
    * { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    body { background: #f9fafb; }
    .container { display: flex; min-height: 100vh; }
    .sidebar { width: 256px; background: #f9fafb; border-right: 1px solid #e5e7eb; position: fixed; height: 100vh; }
    .nav { margin-top: 16px; padding: 0 12px; }
    .btn { width: 100%; display: flex; align-items: center; padding: 12px 16px; margin-bottom: 8px; border: none; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 500; }
    .btn.active { background: #10b981; color: white; }
    .btn:not(.active) { background: transparent; color: #374151; }
    .main { flex: 1; margin-left: 256px; }
    .top { height: 64px; padding: 0 32px; background: white; display: flex; align-items: center; }
    .content { padding: 32px; }
    .section { display: none; }
    .section.active { display: block; }
    .card { background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="sidebar">
      <div class="nav">
        <button class="btn active" onclick="showSection('actividades')">Actividades</button>
        <button class="btn" onclick="showSection('recetas')">Recetas</button>
        <button class="btn" onclick="showSection('inventario')">Inventario</button>
        <button class="btn" onclick="showSection('mensajes')">Mensajes</button>
      </div>
    </div>
    
    <div class="main">
      <div class="top">
        <h1>ADMINISTRADOR FUNCIONANDO</h1>
      </div>
      
      <div class="content">
        <div id="actividades" class="section active">
          <h2>Actividades</h2>
          <div class="card">
            <button onclick="alert('Crear actividad')">Crear Actividad</button>
            <button onclick="alert('Ver calendario')">Ver Calendario</button>
          </div>
        </div>
        
        <div id="recetas" class="section">
          <h2>Recetas</h2>
          <div class="grid">
            <div class="card">
              <h3>Lubina sobre cama de verduras</h3>
              <p>Lleva vino blanco, tomillo, aceite, sal y un poco de agua</p>
            </div>
            <div class="card">
              <h3>Pollo con pimientos</h3>
              <p>Lleva ajo, tomillo, comino, pimienta, vinagre, aceite y sal</p>
            </div>
            <div class="card">
              <h3>Salmon en papillote</h3>
              <p>Lleva ajo en polvo, aceite y sal</p>
            </div>
          </div>
        </div>
        
        <div id="inventario" class="section">
          <h2>Inventario</h2>
          <div class="grid">
            <div class="card">
              <h3>Jamon</h3>
              <p>0 paquetes</p>
              <button onclick="alert('Funciona')">+</button>
            </div>
            <div class="card">
              <h3>Salmon fresco</h3>
              <p>0 unidades</p>
              <button onclick="alert('Funciona')">+</button>
            </div>
          </div>
        </div>
        
        <div id="mensajes" class="section">
          <h2>Mensajes</h2>
          <div class="card">
            <p>Chat familiar funcionando</p>
            <input type="text" placeholder="Escribe mensaje">
            <button onclick="alert('Mensaje enviado')">Enviar</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    function showSection(section) {
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
      document.getElementById(section).classList.add('active');
      event.target.classList.add('active');
    }
  </script>
</body>
</html>`);
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('<h1>Organizacion Familiar</h1>');
  }
});

server.listen(process.env.PORT || 3000);