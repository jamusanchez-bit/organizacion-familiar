const http = require('http');
const url = require('url');

const USERS = {
  javier: { id: 'javier', name: 'Javier', password: 'password123' },
  raquel: { id: 'raquel', name: 'Raquel', password: 'password456' },
  mario: { id: 'mario', name: 'Mario', password: 'password789' },
  alba: { id: 'alba', name: 'Alba', password: 'password000' },
  javi_administrador: { id: 'javi_administrador', name: 'Javi (Admin)', password: 'admin123' }
};

let sessions = {};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  if (req.method === 'POST' && parsedUrl.pathname === '/login') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = new URLSearchParams(body);
      const username = data.get('username');
      const user = USERS[username];
      if (user) {
        const sessionId = Math.random().toString(36);
        sessions[sessionId] = user;
        res.writeHead(302, {'Location': '/dashboard', 'Set-Cookie': `session=${sessionId}`});
        res.end();
      } else {
        res.writeHead(302, {'Location': '/?error=1'});
        res.end();
      }
    });
    return;
  }
  
  if (parsedUrl.pathname === '/dashboard') {
    const cookies = req.headers.cookie || '';
    const sessionId = cookies.split('session=')[1]?.split(';')[0];
    const user = sessions[sessionId];
    if (!user) {
      res.writeHead(302, {'Location': '/'});
      res.end();
      return;
    }
    
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(`<!DOCTYPE html>
<html>
<head><title>Dashboard</title></head>
<body>
  <h1>¡Hola, ${user.name}!</h1>
  <p>Dashboard funcionando</p>
  <a href="/">Logout</a>
</body>
</html>`);
    return;
  }
  
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  res.end(`<!DOCTYPE html>
<html>
<head><title>Login</title></head>
<body>
  <h1>Organización Familiar</h1>
  <form method="POST" action="/login">
    <button type="submit" name="username" value="javier">Javier</button><br><br>
    <button type="submit" name="username" value="raquel">Raquel</button><br><br>
    <button type="submit" name="username" value="mario">Mario</button><br><br>
    <button type="submit" name="username" value="alba">Alba</button><br><br>
    <button type="submit" name="username" value="javi_administrador">Javi (Admin)</button>
  </form>
</body>
</html>`);
});

server.listen(8888, () => {
  console.log('Simple login en http://localhost:8888');
});