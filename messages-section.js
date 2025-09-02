// Sección de mensajes para añadir al HTML de usuarios
const messagesSection = `
        <div id="mensajes" class="section">
          <h2 class="title" style="background: linear-gradient(to right, #8b5cf6, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Mensajes</h2>
          
          <div style="margin-bottom: 20px;">
            <button class="active" onclick="showMessageType('forum')">Esta semana quiero que hablemos de:</button>
            <button onclick="showMessageType('admin')">Sugerencias para el administrador</button>
            <button onclick="showMessageType('private')">Mensaje privado a:</button>
          </div>
          
          <div id="forum-messages" class="card">
            <h3>Foro Familiar</h3>
            <div id="forum-chat" style="background:#f9fafb; padding:16px; border-radius:8px; margin:16px 0; height:200px; overflow-y:auto">
              <p style="color:#6b7280">No hay mensajes aún</p>
            </div>
            <div style="display:flex; gap:8px">
              <input type="text" id="forum-input" placeholder="Escribe un mensaje para todos..." style="flex:1; padding:8px; border:1px solid #ddd; border-radius:4px">
              <button onclick="sendForumMessage()" style="padding:8px 16px; background:#10b981; color:white; border:none; border-radius:4px; cursor:pointer">Enviar</button>
            </div>
          </div>
          
          <div id="admin-messages" class="card" style="display:none">
            <h3>Sugerencias para Javier</h3>
            <div id="admin-chat" style="background:#f9fafb; padding:16px; border-radius:8px; margin:16px 0; height:200px; overflow-y:auto">
              <p style="color:#6b7280">No hay mensajes aún</p>
            </div>
            <div style="display:flex; gap:8px">
              <input type="text" id="admin-input" placeholder="Escribe una sugerencia para Javier..." style="flex:1; padding:8px; border:1px solid #ddd; border-radius:4px">
              <button onclick="sendAdminMessage()" style="padding:8px 16px; background:#10b981; color:white; border:none; border-radius:4px; cursor:pointer">Enviar</button>
            </div>
          </div>
          
          <div id="private-messages" class="card" style="display:none">
            <h3>Mensaje Privado</h3>
            <div style="margin-bottom: 16px;">
              <label>Enviar a:</label>
              <select id="private-to" style="margin-left: 10px; padding: 8px;">
                <option value="javier">Javier</option>
                <option value="raquel">Raquel</option>
                <option value="mario">Mario</option>
                <option value="alba">Alba</option>
              </select>
            </div>
            <div id="private-chat" style="background:#f9fafb; padding:16px; border-radius:8px; margin:16px 0; height:200px; overflow-y:auto">
              <p style="color:#6b7280">No hay mensajes aún</p>
            </div>
            <div style="display:flex; gap:8px">
              <input type="text" id="private-input" placeholder="Escribe un mensaje privado..." style="flex:1; padding:8px; border:1px solid #ddd; border-radius:4px">
              <button onclick="sendPrivateMessage()" style="padding:8px 16px; background:#10b981; color:white; border:none; border-radius:4px; cursor:pointer">Enviar</button>
            </div>
          </div>
        </div>`;

// Funciones JavaScript para mensajes
const messagesFunctions = `
    function loadMessages(data) {
      // Cargar foro
      updateChat('forum-chat', data.forumMessages);
      
      // Cargar sugerencias admin
      updateChat('admin-chat', data.adminSuggestions);
      
      // Cargar mensajes privados
      const to = document.getElementById('private-to') ? document.getElementById('private-to').value : 'javier';
      const key = [username, to].sort().join('-');
      const privateChats = data.privateMessages[key] || [];
      updateChat('private-chat', privateChats);
    }
    
    function updateChat(chatId, messages) {
      const chatDiv = document.getElementById(chatId);
      if (!chatDiv) return;
      
      if (messages.length === 0) {
        chatDiv.innerHTML = '<p style="color:#6b7280">No hay mensajes aún</p>';
      } else {
        chatDiv.innerHTML = messages.map(msg => 
          '<div style="margin-bottom:12px; padding:8px; background:white; border-radius:8px">' +
          '<div style="font-weight:500; color:#374151">' + msg.user + ' <span style="font-size:12px; color:#6b7280; font-weight:normal">' + msg.time + '</span></div>' +
          '<div style="margin-top:4px">' + msg.text + '</div>' +
          '</div>'
        ).join('');
        chatDiv.scrollTop = chatDiv.scrollHeight;
      }
    }
    
    function showMessageType(type) {
      document.querySelectorAll('#mensajes button').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');
      
      document.getElementById('forum-messages').style.display = type === 'forum' ? 'block' : 'none';
      document.getElementById('admin-messages').style.display = type === 'admin' ? 'block' : 'none';
      document.getElementById('private-messages').style.display = type === 'private' ? 'block' : 'none';
    }
    
    function sendForumMessage() {
      const input = document.getElementById('forum-input');
      const message = input.value.trim();
      if (message) {
        fetch('/api/message', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({type: 'forum', user: username, text: message})
        }).then(() => {
          input.value = '';
          loadData();
        });
      }
    }
    
    function sendAdminMessage() {
      const input = document.getElementById('admin-input');
      const message = input.value.trim();
      if (message) {
        fetch('/api/message', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({type: 'admin', user: username, text: message})
        }).then(() => {
          input.value = '';
          loadData();
        });
      }
    }
    
    function sendPrivateMessage() {
      const input = document.getElementById('private-input');
      const to = document.getElementById('private-to').value;
      const message = input.value.trim();
      if (message && to !== username) {
        fetch('/api/message', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({type: 'private', user: username, to: to, text: message})
        }).then(() => {
          input.value = '';
          loadData();
        });
      }
    }`;

module.exports = { messagesSection, messagesFunctions };