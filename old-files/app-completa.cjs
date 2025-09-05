const http = require('http');
const url = require('url');

// Datos
const USERS = {
  javier: { id: 'javier', name: 'Javier', password: 'password123' },
  raquel: { id: 'raquel', name: 'Raquel', password: 'password456' },
  mario: { id: 'mario', name: 'Mario', password: 'password789' },
  alba: { id: 'alba', name: 'Alba', password: 'password000' },
  javi_administrador: { id: 'javi_administrador', name: 'Javi (Admin)', password: 'admin123' }
};

const recipes = [
  { id: '048b6745-b709-4ff5-bdd9-c3f2e1a14635', name: 'Lubina sobre cama de verduras', category: 'comidas', instructions: 'Lleva vino blanco, tomillo, aceite, sal y un poco de agua', preparationTime: 30, servings: 4 },
  { id: '16c802f4-c646-4196-acd4-72eb80ec52d9', name: 'Muslo y contra muslo de pollo con pimientos', category: 'comidas', instructions: 'Lleva 1 diente de ajo, tomillo, comino, pimienta, vinagre de Jerez, aceite y sal.', preparationTime: 30, servings: 4 },
  { id: '17b61b42-fda5-4f00-8002-0a54773e2e74', name: 'Marmitako de salmón', category: 'comidas', instructions: 'Lleva 4 dientes de ajo', preparationTime: 30, servings: 4 },
  { id: '1bb492e1-270b-433e-ab25-07ea9bb6c7b1', name: 'Crema de almendras con frutos rojos', category: 'desayunos', instructions: 'Lleva crema de almendras, macadamias y chocolate.', preparationTime: 30, servings: 4 },
  { id: '27d5a68c-84cb-4dac-bb6a-61fdca3abd92', name: 'Aguacate con salmón ahumado', category: 'cenas', instructions: 'Lleva aceitunas, un poco de cebolla, salsa tamari, aceite.', preparationTime: 30, servings: 4 },
  { id: '285aa1c6-ef84-485a-8b40-42d1c42d1180', name: 'Tostadas pan keto con aceite, lechuga, pepino, salmón marinado', category: 'desayunos', instructions: 'Sin instrucciones', preparationTime: 30, servings: 4 },
  { id: '2dcf433e-db93-4e41-94ef-47e9069b73f2', name: 'Zanahorias, olivas y nueces', category: 'desayunos', instructions: 'Sin instrucciones', preparationTime: 30, servings: 4 },
  { id: '2dff8318-2a5d-4ce1-806c-0b723f1bb078', name: 'Dorada sobre cama de verduras', category: 'comidas', instructions: 'Lleva vino blanco, tomillo, aceite, sal y un poco de agua', preparationTime: 30, servings: 4 },
  { id: '3442b6f0-85ec-4321-bb3b-6fa4c4591c1a', name: 'Alitas de pollo', category: 'comidas', instructions: 'Lleva 4 dientes de ajo, ajo en polvo, tomillo, aceite y sal', preparationTime: 30, servings: 4 },
  { id: '382fd115-1405-4551-992b-2f5ae732577e', name: 'Pechugas de pollo rellenas de jamón', category: 'comidas', instructions: 'Lleva ajo en polvo, aceite y sal.', preparationTime: 30, servings: 4 },
  { id: '3c2aa76d-91cf-480e-a489-9e66ddd04555', name: 'Bizcocho almendra', category: 'desayunos', instructions: 'Sin instrucciones', preparationTime: 30, servings: 4 },
  { id: '55397886-bea6-4f09-880e-ea56d96c25a3', name: 'Huevos a la plancha con jamón y aguacate', category: 'desayunos', instructions: 'Sin instrucciones', preparationTime: 30, servings: 4 },
  { id: '5c370221-b608-417f-a088-a6aa4d1771c8', name: 'Crema de calabacín con salchichas', category: 'cenas', instructions: 'Lleva aceite y sal', preparationTime: 30, servings: 4 },
  { id: '634a467a-4c17-4b07-a2c3-e985507e431d', name: 'Tortilla con crema de calabaza', category: 'cenas', instructions: 'Sin instrucciones', preparationTime: 30, servings: 4 },
  { id: '69184600-ddaf-4032-b80a-fd943d6fa7a4', name: 'Tostadas keto de ghee y erititrol', category: 'desayunos', instructions: 'Sin instrucciones', preparationTime: 30, servings: 4 },
  { id: '781a4874-58a7-40f0-825c-1a4cb3a73155', name: 'Bizcocho cacahuete', category: 'desayunos', instructions: 'Sin instrucciones', preparationTime: 30, servings: 4 },
  { id: '9c46ea6f-13d5-40dc-a5a5-059a4f1d15c7', name: 'Salmón en papillote', category: 'comidas', instructions: 'Lleva ajo en polvo, aceite y sal.', preparationTime: 30, servings: 4 },
  { id: '9f124919-1d5f-4bc2-afd8-7d93dc35ab05', name: 'Merluza con pimientos', category: 'comidas', instructions: 'Lleva aceite, sal, eneldo y vino blanco', preparationTime: 30, servings: 4 },
  { id: 'b1f8b0bc-798d-4686-b97b-4ea8432a9d0d', name: 'Kéfir con frutos rojos', category: 'desayunos', instructions: 'Lleva chocolate y macadamias', preparationTime: 30, servings: 4 },
  { id: 'b2372066-c3b4-4a74-82e5-45ee02a5b8f3', name: 'Muslo y contra muslo de pollo con setas', category: 'comidas', instructions: 'Lleva 4 dientes de ajo, tomillo, aceite y sal.', preparationTime: 30, servings: 4 },
  { id: 'ba979034-7786-4e58-8bf0-9e96b56b12c2', name: 'Caballa con mayonesa y brócoli al horno', category: 'cenas', instructions: 'Lleva aceite, 1 diente de ajo, limón y sal para la mayonesa', preparationTime: 30, servings: 4 },
  { id: 'bf483209-7d3d-4707-95c2-22f27babe3ac', name: 'Costillas de cordero', category: 'comidas', instructions: 'Lleva 4 dientes de ajo', preparationTime: 30, servings: 4 },
  { id: 'c7256abe-91b3-4cd8-83bc-0a4b57a09a1d', name: 'Bocadillo de pan keto con caballa', category: 'almuerzos', instructions: 'Sin instrucciones', preparationTime: 30, servings: 4 },
  { id: 'dd2c5a9b-25e6-4fd0-abb0-6d81b84e100e', name: 'Espinacas salteadas con gambas', category: 'cenas', instructions: 'Sin instrucciones', preparationTime: 30, servings: 4 },
  { id: 'fb36a8c7-8871-4717-9dd9-d2c44d3942ac', name: 'Paletillas de cordero', category: 'comidas', instructions: 'Lleva 4 dientes de ajo, romero, aceite y sal.', preparationTime: 30, servings: 4 }
];

const inventory = [
  { id: '1', name: 'Infusión tomillo', currentQuantity: '0', minimumQuantity: '1', unit: 'paquetes', category: 'bebidas' },
  { id: '2', name: 'Infusión roiboos', currentQuantity: '0', minimumQuantity: '1', unit: 'paquetes', category: 'bebidas' },
  { id: '3', name: 'Jamón', currentQuantity: '0', minimumQuantity: '1', unit: 'paquetes', category: 'carnes' },
  { id: '4', name: 'Salmón fresco (filetes)', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades', category: 'pescado' },
  { id: '5', name: 'Doradas', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades', category: 'pescado' },
  { id: '6', name: 'Lubina', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades', category: 'pescado' },
  { id: '7', name: 'Merluza (lomos)', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades', category: 'pescado' },
  { id: '8', name: 'Pulpo', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades', category: 'pescado' },
  { id: '9', name: 'Ajo', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades', category: 'verduras' },
  { id: '10', name: 'Cebollas', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades', category: 'verduras' },
  { id: '11', name: 'Coliflor', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades', category: 'verduras' },
  { id: '12', name: 'Brócoli', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades', category: 'verduras' },
  { id: '13', name: 'Pimientos', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades', category: 'verduras' },
  { id: '14', name: 'Pimiento italiano', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades', category: 'verduras' },
  { id: '15', name: 'Alcachofas (lata)', currentQuantity: '0', minimumQuantity: '1', unit: 'latas', category: 'verduras' },
  { id: '16', name: 'Alcachofas (frescas)', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades', category: 'verduras' },
  { id: '17', name: 'Sal', currentQuantity: '0', minimumQuantity: '1', unit: 'unidades', category: 'condimentos' },
  { id: '18', name: 'Sal gorda', currentQuantity: '0', minimumQuantity: '1', unit: 'paquetes', category: 'condimentos' },
  { id: '19', name: 'Ajo en polvo', currentQuantity: '0', minimumQuantity: '1', unit: 'tarros', category: 'condimentos' },
  { id: '20', name: 'Champiñones (bandeja)', currentQuantity: '0', minimumQuantity: '1', unit: 'paquetes', category: 'verduras' }
];

let sessions = {};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // Simple Login
  if (req.method === 'POST' && parsedUrl.pathname === '/api/login-simple') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = new URLSearchParams(body);
      const username = data.get('username');
      const user = USERS[username];
      if (user) {
        const sessionId = Math.random().toString(36);
        sessions[sessionId] = user;
        res.writeHead(302, {'Location': '/', 'Set-Cookie': `session=${sessionId}`});
        res.end();
      } else {
        res.writeHead(302, {'Location': '/?error=1'});
        res.end();
      }
    });
    return;
  }
  
  // API Login
  if (req.method === 'POST' && parsedUrl.pathname === '/api/login') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      const user = USERS[data.username];
      if (user && user.password === data.password) {
        const sessionId = Math.random().toString(36);
        sessions[sessionId] = user;
        res.writeHead(200, {'Content-Type': 'application/json', 'Set-Cookie': `session=${sessionId}`});
        res.end(JSON.stringify({success: true, user}));
      } else {
        res.writeHead(401, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'Invalid credentials'}));
      }
    });
    return;
  }
  
  // API Logout
  if (req.method === 'POST' && parsedUrl.pathname === '/api/logout') {
    const cookies = req.headers.cookie || '';
    const sessionId = cookies.split('session=')[1]?.split(';')[0];
    if (sessionId) delete sessions[sessionId];
    res.writeHead(200, {'Content-Type': 'application/json', 'Set-Cookie': 'session=; Max-Age=0'});
    res.end(JSON.stringify({success: true}));
    return;
  }
  
  // API User
  if (parsedUrl.pathname === '/api/user') {
    const cookies = req.headers.cookie || '';
    const sessionId = cookies.split('session=')[1]?.split(';')[0];
    const user = sessions[sessionId];
    if (user) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(user));
    } else {
      res.writeHead(401, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({error: 'Not authenticated'}));
    }
    return;
  }
  
  // API Recipes
  if (parsedUrl.pathname === '/api/recipes') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(recipes));
    return;
  }
  
  // API Inventory
  if (parsedUrl.pathname === '/api/inventory') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(inventory));
    return;
  }
  
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  res.end(`<!DOCTYPE html>
<html>
<head>
  <title>Organización Familiar</title>
  <style>
    * { font-family: Verdana, Geneva, sans-serif; margin: 0; padding: 0; }
    body { background: #f9fafb; }
    .container { display: flex; min-height: 100vh; }
    .sidebar { width: 256px; background: #f9fafb; border-right: 1px solid #e5e7eb; position: fixed; height: 100vh; z-index: 10; }
    .header { height: 48px; padding: 0 16px; display: flex; align-items: center; }
    .icon { width: 28px; height: 28px; background: linear-gradient(135deg, #10b981, #3b82f6); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; }
    .nav { margin-top: 16px; padding: 0 12px; }
    .btn { width: 100%; display: flex; align-items: center; padding: 12px 16px; margin-bottom: 8px; border: none; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; }
    .btn.active { background: #10b981; color: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .btn:not(.active) { background: transparent; color: #374151; }
    .btn:hover:not(.active) { background: #f3f4f6; }
    .main { flex: 1; margin-left: 256px; }
    .top { height: 64px; padding: 0 32px; border-bottom: 1px solid #f3f4f6; background: white; display: flex; align-items: center; }
    .content { padding: 32px; }
    .title { font-size: 24px; font-weight: bold; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
    .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .user { position: absolute; bottom: 0; left: 0; right: 0; padding: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
    .logout { padding: 4px; border: none; background: none; cursor: pointer; border-radius: 4px; }
    .logout:hover { background: #f3f4f6; }
  </style>
</head>
<body>
  <div id="app">
    <div class="container">
      <div class="sidebar">
        <div class="header">
          <div class="icon">🏠</div>
        </div>
        <div class="nav">
          <button class="btn active" onclick="showSection('actividades')">📅 Actividades</button>
          <button class="btn" onclick="showSection('comidas')">🍽️ Comidas</button>
          <button class="btn" onclick="showSection('mensajes')">💬 Mensajes</button>
          <button class="btn" onclick="showSection('compras')">🛒 Lista de la compra</button>
          <button class="btn" onclick="showSection('inventario')">📦 Inventario</button>
          <button class="btn" onclick="showSection('recetas')">👨🍳 Recetas</button>
        </div>
        <div class="user">
          <span id="username" style="font-size: 12px; font-weight: 500;"></span>
          <button class="logout" onclick="logout()">🚪</button>
        </div>
      </div>
      <div class="main">
        <div class="top">
          <h1 id="greeting" style="font-size: 28px; font-weight: bold;"></h1>
        </div>
        <div class="content">
          <div id="actividades" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Actividades</h2>
          <div class="card">
            <p>Próximamente - Gestión de actividades familiares</p>
          </div>
        </div>
        <div id="recetas" class="section" style="display: none;">
            <h2 class="title" style="background: linear-gradient(to right, #dc2626, #ea580c); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Recetas</h2>
            <div id="recipes-grid" class="grid"></div>
          </div>
          <div id="inventario" class="section" style="display: none;">
            <h2 class="title" style="background: linear-gradient(to right, #9333ea, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Inventario</h2>
            <div id="inventory-grid" class="grid"></div>
          </div>
          <div id="actividades" class="section" style="display: none;">
            <h2 class="title" style="background: linear-gradient(to right, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Actividades</h2>
            <div class="card">
              <p>Próximamente - Gestión de actividades familiares</p>
            </div>
          </div>
          <div id="comidas" class="section" style="display: none;">
            <h2 class="title" style="background: linear-gradient(to right, #f59e0b, #d97706); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Calendario de Comidas</h2>
            <div class="card">
              <p>Próximamente - Planificación semanal de comidas</p>
            </div>
          </div>
          <div id="compras" class="section" style="display: none;">
            <h2 class="title" style="background: linear-gradient(to right, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Lista de Compra</h2>
            <div class="card">
              <p>Próximamente - Lista de compras inteligente</p>
            </div>
          </div>
          <div id="mensajes" class="section" style="display: none;">
            <h2 class="title" style="background: linear-gradient(to right, #8b5cf6, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Mensajes</h2>
            <div class="card">
              <p>Próximamente - Sistema de mensajes familiares</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    let currentUser = null;
    
    // Frases motivadoras para cada día del año
    const dailyQuotes = [
      "Cuando eliges pensamientos de amor, todo tu mundo se ordena. (Wayne Dyer)",
      "Tu mente es la semilla, tu vida es la cosecha. (Joe Dispenza)",
      "Nada real puede ser amenazado; nada irreal existe. (Un curso de milagros)",
      "El dinero es energía, y se mueve hacia quien le da dirección. (Raimón Samsó)",
      "El futuro no está escrito, se crea en tu mente. (Wayne Dyer)",
      "Eres aquello en lo que piensas la mayor parte del tiempo. (Joe Dispenza)",
      "La abundancia se manifiesta cuando dejas de temer perder. (Un curso de milagros)",
      "El milagro no cambia el mundo, cambia tu percepción. (Raimón Samsó)",
      "La verdadera riqueza comienza en la mente abierta. (Wayne Dyer)",
      "Donde colocas tu atención, colocas tu energía. (Joe Dispenza)",
      "Cada pensamiento es una orden al universo. (Un curso de milagros)",
      "El éxito es la consecuencia de vivir con propósito. (Raimón Samsó)",
      "El perdón es la medicina del alma. (Wayne Dyer)",
      "La prosperidad se construye con hábitos diarios. (Joe Dispenza)",
      "Si puedes imaginarlo, puedes crearlo. (Un curso de milagros)",
      "El amor nunca exige, solo ofrece. (Raimón Samsó)",
      "Tu energía crea tu biología. (Wayne Dyer)",
      "Ser útil es la mejor forma de ser próspero. (Joe Dispenza)",
      "El miedo limita, la fe expande. (Un curso de milagros)",
      "El milagro es ver inocencia en lugar de culpa. (Raimón Samsó)",
      "Cuanto más agradeces, más recibes. (Wayne Dyer)",
      "La mente entrenada crea abundancia. (Joe Dispenza)",
      "Tu propósito es mayor que tus excusas. (Un curso de milagros)",
      "Cada instante es una nueva oportunidad. (Raimón Samsó)",
      "El dinero fluye hacia quienes generan valor. (Wayne Dyer)",
      "El tiempo es una ilusión, lo único real es el presente. (Joe Dispenza)",
      "Tu cuerpo refleja lo que tu mente sostiene. (Un curso de milagros)",
      "Invertir en ti es la inversión más rentable. (Raimón Samsó)",
      "La gratitud es la llave de la abundancia. (Wayne Dyer)",
      "Lo que piensas con emoción intensa se materializa. (Joe Dispenza)",
      "El perdón abre las puertas del cielo. (Un curso de milagros)",
      "La riqueza interior siempre precede a la exterior. (Raimón Samsó)",
      "El universo responde a tu vibración, no a tus palabras. (Wayne Dyer)",
      "Tus pensamientos son imanes de experiencias. (Joe Dispenza)",
      "Todo encuentro es una oportunidad de sanar. (Un curso de milagros)",
      "El milagro comienza cuando eliges de nuevo. (Raimón Samsó)",
      "Tu atención es la moneda más valiosa de tu vida. (Wayne Dyer)",
      "La abundancia llega cuando te alineas con tu propósito. (Joe Dispenza)",
      "La mente crea la química del cuerpo. (Un curso de milagros)",
      "El amor es tu estado natural, todo lo demás es ilusión. (Raimón Samsó)",
      "La libertad financiera comienza en la mente. (Wayne Dyer)",
      "Cada emoción que eliges abre o cierra puertas. (Joe Dispenza)",
      "El ego fabrica miedo, el espíritu ofrece paz. (Un curso de milagros)",
      "Tus hábitos construyen tu destino. (Raimón Samsó)",
      "El dinero es un sirviente, no un amo. (Wayne Dyer)",
      "Cada día es un nuevo comienzo. (Joe Dispenza)",
      "La fe es la certeza de lo invisible. (Un curso de milagros)",
      "El milagro es soltar lo falso y aceptar lo verdadero. (Raimón Samsó)",
      "La abundancia no es un lugar, es un camino. (Wayne Dyer)",
      "El éxito interior atrae éxito exterior. (Joe Dispenza)",
      "El universo es mental: piensa alto. (Un curso de milagros)",
      "El amor cura lo que el miedo destruye. (Raimón Samsó)",
      "Eres creador, no víctima de tu realidad. (Wayne Dyer)",
      "La riqueza es una forma de conciencia. (Joe Dispenza)",
      "Nada externo tiene poder sobre ti. (Un curso de milagros)",
      "La energía sigue a la atención. (Raimón Samsó)",
      "El milagro está en tu decisión de ver distinto. (Wayne Dyer)",
      "La abundancia se comparte o se pierde. (Joe Dispenza)",
      "Tu mente es más poderosa de lo que crees. (Un curso de milagros)",
      "Cada pensamiento crea tu mañana. (Raimón Samsó)",
      "El perdón es libertad. (Wayne Dyer)",
      "La prosperidad no llega con esfuerzo, sino con conciencia. (Joe Dispenza)",
      "El amor nunca falla. (Un curso de milagros)",
      "Tu cerebro aprende lo que repites. (Raimón Samsó)",
      "La riqueza empieza con una idea convertida en acción. (Wayne Dyer)",
      "El milagro es un cambio de percepción. (Joe Dispenza)",
      "La gratitud transforma la carencia en abundancia. (Un curso de milagros)",
      "Donde está tu enfoque, allí está tu poder. (Raimón Samsó)",
      "La confianza abre caminos invisibles. (Wayne Dyer)",
      "Cada día puedes crear una versión más elevada de ti. (Joe Dispenza)",
      "La paz interior es el mayor de los logros. (Un curso de milagros)",
      "El dinero sigue a tu claridad mental. (Raimón Samsó)",
      "Lo que das, regresa multiplicado. (Wayne Dyer)",
      "Tu mente puede sanar tu cuerpo. (Joe Dispenza)",
      "El milagro es recordar quién eres. (Un curso de milagros)",
      "La abundancia es tu estado natural. (Raimón Samsó)",
      "Eres lo que eliges pensar hoy. (Wayne Dyer)",
      "La vida responde a tu fe, no a tu miedo. (Joe Dispenza)",
      "El universo premia la coherencia. (Un curso de milagros)",
      "La prosperidad fluye donde hay propósito. (Raimón Samsó)",
      "Cada emoción que eliges es una creación. (Wayne Dyer)",
      "El amor es la respuesta en todo. (Joe Dispenza)",
      "Tus pensamientos son decretos. (Un curso de milagros)",
      "El éxito es la consecuencia de tu vibración. (Raimón Samsó)",
      "Tu espíritu nunca carece, solo tu mente cree que sí. (Wayne Dyer)",
      "El milagro ocurre al soltar el control. (Joe Dispenza)",
      "La riqueza es libertad de ser. (Un curso de milagros)",
      "Cada instante es una nueva oportunidad de elegir. (Raimón Samsó)",
      "Lo que sostienes en tu mente, se sostiene en tu vida. (Wayne Dyer)",
      "La gratitud te conecta con la fuente. (Joe Dispenza)",
      "El dinero es neutro, tú le das el significado. (Un curso de milagros)",
      "Nada te limita salvo tus pensamientos. (Raimón Samsó)",
      "La fe mueve energía y crea resultados. (Wayne Dyer)",
      "La abundancia llega a los corazones abiertos. (Joe Dispenza)",
      "Cada creencia crea una realidad. (Un curso de milagros)",
      "El amor disuelve toda ilusión. (Raimón Samsó)",
      "El milagro está en tu decisión. (Wayne Dyer)",
      "Eres ilimitado en esencia, limitado solo en creencias. (Joe Dispenza)",
      "El éxito se mide en paz interior. (Un curso de milagros)",
      "Tu vida es un espejo de tu mente. (Raimón Samsó)",
      "Cuando eliges pensamientos de amor, todo tu mundo se ordena. (Reflexión 101) (Wayne Dyer)",
      "Tu mente es la semilla, tu vida es la cosecha. (Reflexión 102) (Joe Dispenza)",
      "Nada real puede ser amenazado; nada irreal existe. (Reflexión 103) (Un curso de milagros)",
      "El dinero es energía, y se mueve hacia quien le da dirección. (Reflexión 104) (Raimón Samsó)",
      "El futuro no está escrito, se crea en tu mente. (Reflexión 105) (Wayne Dyer)",
      "Eres aquello en lo que piensas la mayor parte del tiempo. (Reflexión 106) (Joe Dispenza)",
      "La abundancia se manifiesta cuando dejas de temer perder. (Reflexión 107) (Un curso de milagros)",
      "El milagro no cambia el mundo, cambia tu percepción. (Reflexión 108) (Raimón Samsó)",
      "La verdadera riqueza comienza en la mente abierta. (Reflexión 109) (Wayne Dyer)",
      "Donde colocas tu atención, colocas tu energía. (Reflexión 110) (Joe Dispenza)",
      "Cada pensamiento es una orden al universo. (Reflexión 111) (Un curso de milagros)",
      "El éxito es la consecuencia de vivir con propósito. (Reflexión 112) (Raimón Samsó)",
      "El perdón es la medicina del alma. (Reflexión 113) (Wayne Dyer)",
      "La prosperidad se construye con hábitos diarios. (Reflexión 114) (Joe Dispenza)",
      "Si puedes imaginarlo, puedes crearlo. (Reflexión 115) (Un curso de milagros)",
      "El amor nunca exige, solo ofrece. (Reflexión 116) (Raimón Samsó)",
      "Tu energía crea tu biología. (Reflexión 117) (Wayne Dyer)",
      "Ser útil es la mejor forma de ser próspero. (Reflexión 118) (Joe Dispenza)",
      "El miedo limita, la fe expande. (Reflexión 119) (Un curso de milagros)",
      "El milagro es ver inocencia en lugar de culpa. (Reflexión 120) (Raimón Samsó)",
      "Cuanto más agradeces, más recibes. (Reflexión 121) (Wayne Dyer)",
      "La mente entrenada crea abundancia. (Reflexión 122) (Joe Dispenza)",
      "Tu propósito es mayor que tus excusas. (Reflexión 123) (Un curso de milagros)",
      "Cada instante es una nueva oportunidad. (Reflexión 124) (Raimón Samsó)",
      "El dinero fluye hacia quienes generan valor. (Reflexión 125) (Wayne Dyer)",
      "El tiempo es una ilusión, lo único real es el presente. (Reflexión 126) (Joe Dispenza)",
      "Tu cuerpo refleja lo que tu mente sostiene. (Reflexión 127) (Un curso de milagros)",
      "Invertir en ti es la inversión más rentable. (Reflexión 128) (Raimón Samsó)",
      "La gratitud es la llave de la abundancia. (Reflexión 129) (Wayne Dyer)",
      "Lo que piensas con emoción intensa se materializa. (Reflexión 130) (Joe Dispenza)",
      "El perdón abre las puertas del cielo. (Reflexión 131) (Un curso de milagros)",
      "La riqueza interior siempre precede a la exterior. (Reflexión 132) (Raimón Samsó)",
      "El universo responde a tu vibración, no a tus palabras. (Reflexión 133) (Wayne Dyer)",
      "Tus pensamientos son imanes de experiencias. (Reflexión 134) (Joe Dispenza)",
      "Todo encuentro es una oportunidad de sanar. (Reflexión 135) (Un curso de milagros)",
      "El milagro comienza cuando eliges de nuevo. (Reflexión 136) (Raimón Samsó)",
      "Tu atención es la moneda más valiosa de tu vida. (Reflexión 137) (Wayne Dyer)",
      "La abundancia llega cuando te alineas con tu propósito. (Reflexión 138) (Joe Dispenza)",
      "La mente crea la química del cuerpo. (Reflexión 139) (Un curso de milagros)",
      "El amor es tu estado natural, todo lo demás es ilusión. (Reflexión 140) (Raimón Samsó)",
      "La libertad financiera comienza en la mente. (Reflexión 141) (Wayne Dyer)",
      "Cada emoción que eliges abre o cierra puertas. (Reflexión 142) (Joe Dispenza)",
      "El ego fabrica miedo, el espíritu ofrece paz. (Reflexión 143) (Un curso de milagros)",
      "Tus hábitos construyen tu destino. (Reflexión 144) (Raimón Samsó)",
      "El dinero es un sirviente, no un amo. (Reflexión 145) (Wayne Dyer)",
      "Cada día es un nuevo comienzo. (Reflexión 146) (Joe Dispenza)",
      "La fe es la certeza de lo invisible. (Reflexión 147) (Un curso de milagros)",
      "El milagro es soltar lo falso y aceptar lo verdadero. (Reflexión 148) (Raimón Samsó)",
      "La abundancia no es un lugar, es un camino. (Reflexión 149) (Wayne Dyer)",
      "El éxito interior atrae éxito exterior. (Reflexión 150) (Joe Dispenza)",
      "El universo es mental: piensa alto. (Reflexión 151) (Un curso de milagros)",
      "El amor cura lo que el miedo destruye. (Reflexión 152) (Raimón Samsó)",
      "Eres creador, no víctima de tu realidad. (Reflexión 153) (Wayne Dyer)",
      "La riqueza es una forma de conciencia. (Reflexión 154) (Joe Dispenza)",
      "Nada externo tiene poder sobre ti. (Reflexión 155) (Un curso de milagros)",
      "La energía sigue a la atención. (Reflexión 156) (Raimón Samsó)",
      "El milagro está en tu decisión de ver distinto. (Reflexión 157) (Wayne Dyer)",
      "La abundancia se comparte o se pierde. (Reflexión 158) (Joe Dispenza)",
      "Tu mente es más poderosa de lo que crees. (Reflexión 159) (Un curso de milagros)",
      "Cada pensamiento crea tu mañana. (Reflexión 160) (Raimón Samsó)",
      "El perdón es libertad. (Reflexión 161) (Wayne Dyer)",
      "La prosperidad no llega con esfuerzo, sino con conciencia. (Reflexión 162) (Joe Dispenza)",
      "El amor nunca falla. (Reflexión 163) (Un curso de milagros)",
      "Tu cerebro aprende lo que repites. (Reflexión 164) (Raimón Samsó)",
      "La riqueza empieza con una idea convertida en acción. (Reflexión 165) (Wayne Dyer)",
      "El milagro es un cambio de percepción. (Reflexión 166) (Joe Dispenza)",
      "La gratitud transforma la carencia en abundancia. (Reflexión 167) (Un curso de milagros)",
      "Donde está tu enfoque, allí está tu poder. (Reflexión 168) (Raimón Samsó)",
      "La confianza abre caminos invisibles. (Reflexión 169) (Wayne Dyer)",
      "Cada día puedes crear una versión más elevada de ti. (Reflexión 170) (Joe Dispenza)",
      "La paz interior es el mayor de los logros. (Reflexión 171) (Un curso de milagros)",
      "El dinero sigue a tu claridad mental. (Reflexión 172) (Raimón Samsó)",
      "Lo que das, regresa multiplicado. (Reflexión 173) (Wayne Dyer)",
      "Tu mente puede sanar tu cuerpo. (Reflexión 174) (Joe Dispenza)",
      "El milagro es recordar quién eres. (Reflexión 175) (Un curso de milagros)",
      "La abundancia es tu estado natural. (Reflexión 176) (Raimón Samsó)",
      "Eres lo que eliges pensar hoy. (Reflexión 177) (Wayne Dyer)",
      "La vida responde a tu fe, no a tu miedo. (Reflexión 178) (Joe Dispenza)",
      "El universo premia la coherencia. (Reflexión 179) (Un curso de milagros)",
      "La prosperidad fluye donde hay propósito. (Reflexión 180) (Raimón Samsó)",
      "Cada emoción que eliges es una creación. (Reflexión 181) (Wayne Dyer)",
      "El amor es la respuesta en todo. (Reflexión 182) (Joe Dispenza)",
      "Tus pensamientos son decretos. (Reflexión 183) (Un curso de milagros)",
      "El éxito es la consecuencia de tu vibración. (Reflexión 184) (Raimón Samsó)",
      "Tu espíritu nunca carece, solo tu mente cree que sí. (Reflexión 185) (Wayne Dyer)",
      "El milagro ocurre al soltar el control. (Reflexión 186) (Joe Dispenza)",
      "La riqueza es libertad de ser. (Reflexión 187) (Un curso de milagros)",
      "Cada instante es una nueva oportunidad de elegir. (Reflexión 188) (Raimón Samsó)",
      "Lo que sostienes en tu mente, se sostiene en tu vida. (Reflexión 189) (Wayne Dyer)",
      "La gratitud te conecta con la fuente. (Reflexión 190) (Joe Dispenza)",
      "El dinero es neutro, tú le das el significado. (Reflexión 191) (Un curso de milagros)",
      "Nada te limita salvo tus pensamientos. (Reflexión 192) (Raimón Samsó)",
      "La fe mueve energía y crea resultados. (Reflexión 193) (Wayne Dyer)",
      "La abundancia llega a los corazones abiertos. (Reflexión 194) (Joe Dispenza)",
      "Cada creencia crea una realidad. (Reflexión 195) (Un curso de milagros)",
      "El amor disuelve toda ilusión. (Reflexión 196) (Raimón Samsó)",
      "El milagro está en tu decisión. (Reflexión 197) (Wayne Dyer)",
      "Eres ilimitado en esencia, limitado solo en creencias. (Reflexión 198) (Joe Dispenza)",
      "El éxito se mide en paz interior. (Reflexión 199) (Un curso de milagros)",
      "Tu vida es un espejo de tu mente. (Reflexión 200) (Raimón Samsó)",
      "Cuando eliges pensamientos de amor, todo tu mundo se ordena. (Reflexión 201) (Wayne Dyer)",
      "Tu mente es la semilla, tu vida es la cosecha. (Reflexión 202) (Joe Dispenza)",
      "Nada real puede ser amenazado; nada irreal existe. (Reflexión 203) (Un curso de milagros)",
      "El dinero es energía, y se mueve hacia quien le da dirección. (Reflexión 204) (Raimón Samsó)",
      "El futuro no está escrito, se crea en tu mente. (Reflexión 205) (Wayne Dyer)",
      "Eres aquello en lo que piensas la mayor parte del tiempo. (Reflexión 206) (Joe Dispenza)",
      "La abundancia se manifiesta cuando dejas de temer perder. (Reflexión 207) (Un curso de milagros)",
      "El milagro no cambia el mundo, cambia tu percepción. (Reflexión 208) (Raimón Samsó)",
      "La verdadera riqueza comienza en la mente abierta. (Reflexión 209) (Wayne Dyer)",
      "Donde colocas tu atención, colocas tu energía. (Reflexión 210) (Joe Dispenza)",
      "Cada pensamiento es una orden al universo. (Reflexión 211) (Un curso de milagros)",
      "El éxito es la consecuencia de vivir con propósito. (Reflexión 212) (Raimón Samsó)",
      "El perdón es la medicina del alma. (Reflexión 213) (Wayne Dyer)",
      "La prosperidad se construye con hábitos diarios. (Reflexión 214) (Joe Dispenza)",
      "Si puedes imaginarlo, puedes crearlo. (Reflexión 215) (Un curso de milagros)",
      "El amor nunca exige, solo ofrece. (Reflexión 216) (Raimón Samsó)",
      "Tu energía crea tu biología. (Reflexión 217) (Wayne Dyer)",
      "Ser útil es la mejor forma de ser próspero. (Reflexión 218) (Joe Dispenza)",
      "El miedo limita, la fe expande. (Reflexión 219) (Un curso de milagros)",
      "El milagro es ver inocencia en lugar de culpa. (Reflexión 220) (Raimón Samsó)",
      "Cuanto más agradeces, más recibes. (Reflexión 221) (Wayne Dyer)",
      "La mente entrenada crea abundancia. (Reflexión 222) (Joe Dispenza)",
      "Tu propósito es mayor que tus excusas. (Reflexión 223) (Un curso de milagros)",
      "Cada instante es una nueva oportunidad. (Reflexión 224) (Raimón Samsó)",
      "El dinero fluye hacia quienes generan valor. (Reflexión 225) (Wayne Dyer)",
      "El tiempo es una ilusión, lo único real es el presente. (Reflexión 226) (Joe Dispenza)",
      "Tu cuerpo refleja lo que tu mente sostiene. (Reflexión 227) (Un curso de milagros)",
      "Invertir en ti es la inversión más rentable. (Reflexión 228) (Raimón Samsó)",
      "La gratitud es la llave de la abundancia. (Reflexión 229) (Wayne Dyer)",
      "Lo que piensas con emoción intensa se materializa. (Reflexión 230) (Joe Dispenza)",
      "El perdón abre las puertas del cielo. (Reflexión 231) (Un curso de milagros)",
      "La riqueza interior siempre precede a la exterior. (Reflexión 232) (Raimón Samsó)",
      "El universo responde a tu vibración, no a tus palabras. (Reflexión 233) (Wayne Dyer)",
      "Tus pensamientos son imanes de experiencias. (Reflexión 234) (Joe Dispenza)",
      "Todo encuentro es una oportunidad de sanar. (Reflexión 235) (Un curso de milagros)",
      "El milagro comienza cuando eliges de nuevo. (Reflexión 236) (Raimón Samsó)",
      "Tu atención es la moneda más valiosa de tu vida. (Reflexión 237) (Wayne Dyer)",
      "La abundancia llega cuando te alineas con tu propósito. (Reflexión 238) (Joe Dispenza)",
      "La mente crea la química del cuerpo. (Reflexión 239) (Un curso de milagros)",
      "El amor es tu estado natural, todo lo demás es ilusión. (Reflexión 240) (Raimón Samsó)",
      "La libertad financiera comienza en la mente. (Reflexión 241) (Wayne Dyer)",
      "Cada emoción que eliges abre o cierra puertas. (Reflexión 242) (Joe Dispenza)",
      "El ego fabrica miedo, el espíritu ofrece paz. (Reflexión 243) (Un curso de milagros)",
      "Tus hábitos construyen tu destino. (Reflexión 244) (Raimón Samsó)",
      "El dinero es un sirviente, no un amo. (Reflexión 245) (Wayne Dyer)",
      "Cada día es un nuevo comienzo. (Reflexión 246) (Joe Dispenza)",
      "La fe es la certeza de lo invisible. (Reflexión 247) (Un curso de milagros)",
      "El milagro es soltar lo falso y aceptar lo verdadero. (Reflexión 248) (Raimón Samsó)",
      "La abundancia no es un lugar, es un camino. (Reflexión 249) (Wayne Dyer)",
      "El éxito interior atrae éxito exterior. (Reflexión 250) (Joe Dispenza)",
      "El universo es mental: piensa alto. (Reflexión 251) (Un curso de milagros)",
      "El amor cura lo que el miedo destruye. (Reflexión 252) (Raimón Samsó)",
      "Eres creador, no víctima de tu realidad. (Reflexión 253) (Wayne Dyer)",
      "La riqueza es una forma de conciencia. (Reflexión 254) (Joe Dispenza)",
      "Nada externo tiene poder sobre ti. (Reflexión 255) (Un curso de milagros)",
      "La energía sigue a la atención. (Reflexión 256) (Raimón Samsó)",
      "El milagro está en tu decisión de ver distinto. (Reflexión 257) (Wayne Dyer)",
      "La abundancia se comparte o se pierde. (Reflexión 258) (Joe Dispenza)",
      "Tu mente es más poderosa de lo que crees. (Reflexión 259) (Un curso de milagros)",
      "Cada pensamiento crea tu mañana. (Reflexión 260) (Raimón Samsó)",
      "El perdón es libertad. (Reflexión 261) (Wayne Dyer)",
      "La prosperidad no llega con esfuerzo, sino con conciencia. (Reflexión 262) (Joe Dispenza)",
      "El amor nunca falla. (Reflexión 263) (Un curso de milagros)",
      "Tu cerebro aprende lo que repites. (Reflexión 264) (Raimón Samsó)",
      "La riqueza empieza con una idea convertida en acción. (Reflexión 265) (Wayne Dyer)",
      "El milagro es un cambio de percepción. (Reflexión 266) (Joe Dispenza)",
      "La gratitud transforma la carencia en abundancia. (Reflexión 267) (Un curso de milagros)",
      "Donde está tu enfoque, allí está tu poder. (Reflexión 268) (Raimón Samsó)",
      "La confianza abre caminos invisibles. (Reflexión 269) (Wayne Dyer)",
      "Cada día puedes crear una versión más elevada de ti. (Reflexión 270) (Joe Dispenza)",
      "La paz interior es el mayor de los logros. (Reflexión 271) (Un curso de milagros)",
      "El dinero sigue a tu claridad mental. (Reflexión 272) (Raimón Samsó)",
      "Lo que das, regresa multiplicado. (Reflexión 273) (Wayne Dyer)",
      "Tu mente puede sanar tu cuerpo. (Reflexión 274) (Joe Dispenza)",
      "El milagro es recordar quién eres. (Reflexión 275) (Un curso de milagros)",
      "La abundancia es tu estado natural. (Reflexión 276) (Raimón Samsó)",
      "Eres lo que eliges pensar hoy. (Reflexión 277) (Wayne Dyer)",
      "La vida responde a tu fe, no a tu miedo. (Reflexión 278) (Joe Dispenza)",
      "El universo premia la coherencia. (Reflexión 279) (Un curso de milagros)",
      "La prosperidad fluye donde hay propósito. (Reflexión 280) (Raimón Samsó)",
      "Cada emoción que eliges es una creación. (Reflexión 281) (Wayne Dyer)",
      "El amor es la respuesta en todo. (Reflexión 282) (Joe Dispenza)",
      "Tus pensamientos son decretos. (Reflexión 283) (Un curso de milagros)",
      "El éxito es la consecuencia de tu vibración. (Reflexión 284) (Raimón Samsó)",
      "Tu espíritu nunca carece, solo tu mente cree que sí. (Reflexión 285) (Wayne Dyer)",
      "El milagro ocurre al soltar el control. (Reflexión 286) (Joe Dispenza)",
      "La riqueza es libertad de ser. (Reflexión 287) (Un curso de milagros)",
      "Cada instante es una nueva oportunidad de elegir. (Reflexión 288) (Raimón Samsó)",
      "Lo que sostienes en tu mente, se sostiene en tu vida. (Reflexión 289) (Wayne Dyer)",
      "La gratitud te conecta con la fuente. (Reflexión 290) (Joe Dispenza)",
      "El dinero es neutro, tú le das el significado. (Reflexión 291) (Un curso de milagros)",
      "Nada te limita salvo tus pensamientos. (Reflexión 292) (Raimón Samsó)",
      "La fe mueve energía y crea resultados. (Reflexión 293) (Wayne Dyer)",
      "La abundancia llega a los corazones abiertos. (Reflexión 294) (Joe Dispenza)",
      "Cada creencia crea una realidad. (Reflexión 295) (Un curso de milagros)",
      "El amor disuelve toda ilusión. (Reflexión 296) (Raimón Samsó)",
      "El milagro está en tu decisión. (Reflexión 297) (Wayne Dyer)",
      "Eres ilimitado en esencia, limitado solo en creencias. (Reflexión 298) (Joe Dispenza)",
      "El éxito se mide en paz interior. (Reflexión 299) (Un curso de milagros)",
      "Tu vida es un espejo de tu mente. (Reflexión 300) (Raimón Samsó)",
      "Cuando eliges pensamientos de amor, todo tu mundo se ordena. (Reflexión 301) (Wayne Dyer)",
      "Tu mente es la semilla, tu vida es la cosecha. (Reflexión 302) (Joe Dispenza)",
      "Nada real puede ser amenazado; nada irreal existe. (Reflexión 303) (Un curso de milagros)",
      "El dinero es energía, y se mueve hacia quien le da dirección. (Reflexión 304) (Raimón Samsó)",
      "El futuro no está escrito, se crea en tu mente. (Reflexión 305) (Wayne Dyer)",
      "Eres aquello en lo que piensas la mayor parte del tiempo. (Reflexión 306) (Joe Dispenza)",
      "La abundancia se manifiesta cuando dejas de temer perder. (Reflexión 307) (Un curso de milagros)",
      "El milagro no cambia el mundo, cambia tu percepción. (Reflexión 308) (Raimón Samsó)",
      "La verdadera riqueza comienza en la mente abierta. (Reflexión 309) (Wayne Dyer)",
      "Donde colocas tu atención, colocas tu energía. (Reflexión 310) (Joe Dispenza)",
      "Cada pensamiento es una orden al universo. (Reflexión 311) (Un curso de milagros)",
      "El éxito es la consecuencia de vivir con propósito. (Reflexión 312) (Raimón Samsó)",
      "El perdón es la medicina del alma. (Reflexión 313) (Wayne Dyer)",
      "La prosperidad se construye con hábitos diarios. (Reflexión 314) (Joe Dispenza)",
      "Si puedes imaginarlo, puedes crearlo. (Reflexión 315) (Un curso de milagros)",
      "El amor nunca exige, solo ofrece. (Reflexión 316) (Raimón Samsó)",
      "Tu energía crea tu biología. (Reflexión 317) (Wayne Dyer)",
      "Ser útil es la mejor forma de ser próspero. (Reflexión 318) (Joe Dispenza)",
      "El miedo limita, la fe expande. (Reflexión 319) (Un curso de milagros)",
      "El milagro es ver inocencia en lugar de culpa. (Reflexión 320) (Raimón Samsó)",
      "Cuanto más agradeces, más recibes. (Reflexión 321) (Wayne Dyer)",
      "La mente entrenada crea abundancia. (Reflexión 322) (Joe Dispenza)",
      "Tu propósito es mayor que tus excusas. (Reflexión 323) (Un curso de milagros)",
      "Cada instante es una nueva oportunidad. (Reflexión 324) (Raimón Samsó)",
      "El dinero fluye hacia quienes generan valor. (Reflexión 325) (Wayne Dyer)",
      "El tiempo es una ilusión, lo único real es el presente. (Reflexión 326) (Joe Dispenza)",
      "Tu cuerpo refleja lo que tu mente sostiene. (Reflexión 327) (Un curso de milagros)",
      "Invertir en ti es la inversión más rentable. (Reflexión 328) (Raimón Samsó)",
      "La gratitud es la llave de la abundancia. (Reflexión 329) (Wayne Dyer)",
      "Lo que piensas con emoción intensa se materializa. (Reflexión 330) (Joe Dispenza)",
      "El perdón abre las puertas del cielo. (Reflexión 331) (Un curso de milagros)",
      "La riqueza interior siempre precede a la exterior. (Reflexión 332) (Raimón Samsó)",
      "El universo responde a tu vibración, no a tus palabras. (Reflexión 333) (Wayne Dyer)",
      "Tus pensamientos son imanes de experiencias. (Reflexión 334) (Joe Dispenza)",
      "Todo encuentro es una oportunidad de sanar. (Reflexión 335) (Un curso de milagros)",
      "El milagro comienza cuando eliges de nuevo. (Reflexión 336) (Raimón Samsó)",
      "Tu atención es la moneda más valiosa de tu vida. (Reflexión 337) (Wayne Dyer)",
      "La abundancia llega cuando te alineas con tu propósito. (Reflexión 338) (Joe Dispenza)",
      "La mente crea la química del cuerpo. (Reflexión 339) (Un curso de milagros)",
      "El amor es tu estado natural, todo lo demás es ilusión. (Reflexión 340) (Raimón Samsó)",
      "La libertad financiera comienza en la mente. (Reflexión 341) (Wayne Dyer)",
      "Cada emoción que eliges abre o cierra puertas. (Reflexión 342) (Joe Dispenza)",
      "El ego fabrica miedo, el espíritu ofrece paz. (Reflexión 343) (Un curso de milagros)",
      "Tus hábitos construyen tu destino. (Reflexión 344) (Raimón Samsó)",
      "El dinero es un sirviente, no un amo. (Reflexión 345) (Wayne Dyer)",
      "Cada día es un nuevo comienzo. (Reflexión 346) (Joe Dispenza)",
      "La fe es la certeza de lo invisible. (Reflexión 347) (Un curso de milagros)",
      "El milagro es soltar lo falso y aceptar lo verdadero. (Reflexión 348) (Raimón Samsó)",
      "La abundancia no es un lugar, es un camino. (Reflexión 349) (Wayne Dyer)",
      "El éxito interior atrae éxito exterior. (Reflexión 350) (Joe Dispenza)",
      "El universo es mental: piensa alto. (Reflexión 351) (Un curso de milagros)",
      "El amor cura lo que el miedo destruye. (Reflexión 352) (Raimón Samsó)",
      "Eres creador, no víctima de tu realidad. (Reflexión 353) (Wayne Dyer)",
      "La riqueza es una forma de conciencia. (Reflexión 354) (Joe Dispenza)",
      "Nada externo tiene poder sobre ti. (Reflexión 355) (Un curso de milagros)",
      "La energía sigue a la atención. (Reflexión 356) (Raimón Samsó)",
      "El milagro está en tu decisión de ver distinto. (Reflexión 357) (Wayne Dyer)",
      "La abundancia se comparte o se pierde. (Reflexión 358) (Joe Dispenza)",
      "Tu mente es más poderosa de lo que crees. (Reflexión 359) (Un curso de milagros)",
      "Cada pensamiento crea tu mañana. (Reflexión 360) (Raimón Samsó)",
      "El perdón es libertad. (Reflexión 361) (Wayne Dyer)",
      "La prosperidad no llega con esfuerzo, sino con conciencia. (Reflexión 362) (Joe Dispenza)",
      "El amor nunca falla. (Reflexión 363) (Un curso de milagros)",
      "Tu cerebro aprende lo que repites. (Reflexión 364) (Raimón Samsó)",
      "La riqueza empieza con una idea convertida en acción. (Reflexión 365) (Wayne Dyer)"
    ];
    
    function getTodayInfo() {
      const today = new Date();
      const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const dateStr = today.toLocaleDateString('es-ES', options);
      return {
        date: dateStr.charAt(0).toUpperCase() + dateStr.slice(1),
        quote: dailyQuotes[dayOfYear - 1] || dailyQuotes[0]
      };
    }
    
    // Check if logged in
    const cookies = document.cookie || '';
    const sessionId = cookies.split('session=')[1]?.split(';')[0];
    
    if (sessionId) {
      fetch('/api/user')
        .then(r => r.ok ? r.json() : null)
        .then(user => {
          if (user) {
            currentUser = user;
            document.getElementById('username').textContent = user.name;
            const todayInfo = getTodayInfo();
            document.getElementById('greeting').innerHTML = '¡Hola, ' + user.name + '! 👋<br><small style="font-size: 14px; color: #6b7280; font-weight: normal;">' + todayInfo.date + '</small><br><small style="font-size: 12px; color: #9ca3af; font-weight: normal; font-style: italic;">"' + todayInfo.quote + '"</small>';
            showSection('actividades');
            loadData();
          } else {
            showLogin();
          }
        })
        .catch(() => showLogin());
    } else {
      showLogin();
    }
    
    function showLogin() {
      document.body.innerHTML = \`
        <div style="min-height: 100vh; background: linear-gradient(135deg, #fbbf24, #f59e0b, #dbeafe, #f3e8ff); position: relative; display: flex; align-items: center; justify-content: center; padding: 16px;">
          <div style="position: absolute; top: 10%; left: 50%; transform: translateX(-50%); z-index: 1;">
            <div style="width: 120px; height: 120px; background: radial-gradient(circle, #fbbf24, #f59e0b); border-radius: 50%; box-shadow: 0 0 40px rgba(251, 191, 36, 0.6);"></div>
            <div style="width: 100%; height: 2px; background: linear-gradient(to right, transparent, #f59e0b, transparent); margin-top: 20px;"></div>
          </div>
          
          <div style="background: rgba(255,255,255,0.95); border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 500px; width: 100%; z-index: 2; backdrop-filter: blur(10px);">
            <h1 style="font-size: 32px; font-weight: bold; text-align: center; margin-bottom: 24px; background: linear-gradient(to right, #3b82f6, #9333ea); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-family: Verdana;">Organización Familiar</h1>
            
            <div style="background: rgba(59, 130, 246, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 32px; border-left: 4px solid #3b82f6;">
              <p style="font-style: italic; text-align: center; color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 8px; font-family: Verdana;">\"Si vives con gratitud, estás reprogramando tu cerebro para la abundancia.\"</p>
              <p style="text-align: center; color: #6b7280; font-size: 14px; font-family: Verdana;">— Joe Dispenza</p>
            </div>
            
            <form method="POST" action="/api/login-simple" style="display: flex; flex-direction: column; gap: 16px;">
              <button type="submit" name="username" value="javier" style="width: 100%; padding: 16px; background: linear-gradient(to right, #3b82f6, #9333ea); color: white; border: none; border-radius: 12px; font-family: Verdana; font-weight: 500; cursor: pointer;">Javier</button>
              <button type="submit" name="username" value="raquel" style="width: 100%; padding: 16px; background: linear-gradient(to right, #3b82f6, #9333ea); color: white; border: none; border-radius: 12px; font-family: Verdana; font-weight: 500; cursor: pointer;">Raquel</button>
              <button type="submit" name="username" value="mario" style="width: 100%; padding: 16px; background: linear-gradient(to right, #3b82f6, #9333ea); color: white; border: none; border-radius: 12px; font-family: Verdana; font-weight: 500; cursor: pointer;">Mario</button>
              <button type="submit" name="username" value="alba" style="width: 100%; padding: 16px; background: linear-gradient(to right, #3b82f6, #9333ea); color: white; border: none; border-radius: 12px; font-family: Verdana; font-weight: 500; cursor: pointer;">Alba</button>
              <button type="submit" name="username" value="javi_administrador" style="width: 100%; padding: 16px; background: linear-gradient(to right, #3b82f6, #9333ea); color: white; border: none; border-radius: 12px; font-family: Verdana; font-weight: 500; cursor: pointer;">Javi (Admin)</button>
            </form>
          </div>
        </div>
      \`;
    }
    
    window.login = function(username) {
      const passwords = {javier: 'password123', raquel: 'password456', mario: 'password789', alba: 'password000', javi_administrador: 'admin123'};
      fetch('/api/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password: passwords[username]})
      })
      .then(response => {
        if (!response.ok) throw new Error('Network error');
        return response.json();
      })
      .then(data => {
        if (data.success) {
          location.reload();
        } else {
          alert('Error de login');
        }
      })
      .catch(err => {
        console.error('Login error:', err);
        alert('Error de conexión: ' + err.message);
      });
    }
    
    function logout() {
      fetch('/api/logout', {method: 'POST'}).then(() => location.reload());
    }
    
    function loadData() {
      // Load recipes
      fetch('/api/recipes').then(r => r.json()).then(recipes => {
        document.getElementById('recipes-grid').innerHTML = recipes.map(recipe => \`
          <div class="card">
            <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">\${recipe.name}</h3>
            <p style="color: #6b7280; margin-bottom: 16px;">\${recipe.instructions}</p>
            <div style="display: flex; gap: 16px; font-size: 14px; color: #6b7280;">
              <span>⏱️ \${recipe.preparationTime} min</span>
              <span>👥 \${recipe.servings} personas</span>
            </div>
          </div>
        \`).join('');
      });
      
      // Load inventory
      fetch('/api/inventory').then(r => r.json()).then(inventory => {
        document.getElementById('inventory-grid').innerHTML = inventory.map(item => {
          const isLow = parseFloat(item.currentQuantity) <= parseFloat(item.minimumQuantity);
          const color = parseFloat(item.currentQuantity) === 0 ? '#dc2626' : isLow ? '#ea580c' : '#059669';
          return \`
            <div class="card">
              <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">\${item.name}</h3>
              <p style="font-size: 18px; font-weight: bold; color: \${color}; margin-bottom: 8px;">\${item.currentQuantity} \${item.unit}</p>
              <p style="font-size: 14px; color: #6b7280;">Mínimo: \${item.minimumQuantity} \${item.unit}</p>
            </div>
          \`;
        }).join('');
      });
    }
    
    function showSection(section) {
      document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
      document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
      document.getElementById(section).style.display = 'block';
      event.target.classList.add('active');
    }
  </script>
</body>
</html>`);
});

server.listen(9090, () => {
  console.log('App completa funcionando en http://localhost:9090');
});