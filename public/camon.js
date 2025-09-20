// public/camon.js - Ca'mon client behavior (loaded from /camon.js)
(function(){
  // Load initial data from DOM if present
  var CAMON_SUBLEVELS = window.CAMON_SUBLEVELS || [
    'A1.1','A1.2','A1.3','A1.4','A1.5',
    'A2.1','A2.2','A2.3','A2.4','A2.5',
    'B1.1','B1.2','B1.3','B1.4','B1.5',
    'B2.1','B2.2','B2.3','B2.4','B2.5',
    'C1.1','C1.2','C1.3','C1.4','C1.5'
  ];

  var CAMON_QUESTIONS = window.CAMON_QUESTIONS || [];
  var CAMON_TEST_RESULTS = window.CAMON_TEST_RESULTS || {};
  window.CAMON_TEST_RESULTS = CAMON_TEST_RESULTS;
  var CAMON_USERNAME = window.CAMON_USERNAME || 'unknown';

  function noop(){}
  window.showCamonPanel = window.showCamonPanel || function(panel){
    // existing server-side function will also call this; keep safe fallback
    var area = document.getElementById('camon-area');
    if (!area) return;
    if (panel === 'level') {
      area.innerHTML = '<div><h4>Prueba inicial (demo)</h4><p>Pulsa para empezar.</p><button id="camon-start-test">Empezar prueba</button></div>';
      document.getElementById('camon-start-test').addEventListener('click', startDemoLevelTest);
    } else if (panel === 'daily') {
      area.innerHTML = '<div><h4>Ejercicios diarios</h4><p>Selecciona una actividad.</p></div>';
    } else if (panel === 'evolution') {
      // fetch history
      area.innerHTML = '<div><h4>Mi evolución</h4><div id="camon-evolution-area">Cargando historial...</div></div>';
      fetch('/api/camon/history?user=' + encodeURIComponent(CAMON_USERNAME)).then(function(r){return r.json()}).then(function(data){
        var out = '<div style="background:#fff;padding:12px;border-radius:8px;">';
        var promo = data.promotions;
        if (promo && promo.level) {
          out += '<p>Nivel actual: <strong>' + promo.level + '</strong></p>';
          if (promo.history && promo.history.length) {
            out += '<h4>Promociones</h4><ul>';
            promo.history.forEach(function(p){ out += '<li>' + p.date + ': ' + p.from + ' → ' + p.to + '</li>'; });
            out += '</ul>';
          }
        } else {
          if (data.results && data.results.length) {
            var last = data.results[data.results.length -1];
            out += '<p>Nivel asignado (último): <strong>' + last.assignedLevel + '</strong></p>';
          } else {
            out += '<p>No hay datos de pruebas todavía.</p>';
          }
        }
        if (data.results && data.results.length) {
          out += '<h4>Historial de Pruebas</h4>';
          out += '<table style="width:100%;border-collapse:collapse;"><thead><tr><th style="text-align:left;padding:6px;border-bottom:1px solid #eee">Fecha</th><th style="text-align:left;padding:6px;border-bottom:1px solid #eee">Puntuación</th><th style="text-align:left;padding:6px;border-bottom:1px solid #eee">Nivel asignado</th></tr></thead><tbody>';
          data.results.forEach(function(r){
            out += '<tr><td style="padding:6px;border-bottom:1px solid #f3f3f3">' + r.date + '</td><td style="padding:6px;border-bottom:1px solid #f3f3f3">' + r.score + '/' + r.total + '</td><td style="padding:6px;border-bottom:1px solid #f3f3f3">' + (r.assignedLevel || '-') + '</td></tr>';
          });
          out += '</tbody></table>';
        }
        out += '</div>';
        var evo = document.getElementById('camon-evolution-area'); if (evo) evo.innerHTML = out;
      }).catch(function(){ var evo = document.getElementById('camon-evolution-area'); if (evo) evo.innerHTML = '<div style="background:#fff;padding:12px;border-radius:8px;color:#666;">Error al cargar historial.</div>'; });
    }
  };

  // --- Prueba Inicial completa en cliente (25 preguntas: 10 fill + 15 choice) ---
  function buildSublevels(){
    return CAMON_SUBLEVELS.slice(0,25);
  }

  function buildQuestions(){
    const subs = buildSublevels();
    const qs = subs.map(function(sub, idx){
      if (idx < 10) {
        return { id: idx, sublevel: sub, type: 'fill', prompt: '('+sub+') Fill: I ____ football every Sunday.', answer: 'play' };
      }
      // simple choice templates
      const choices = [ ['go','went','gone','goes'], ['is','are','was','were'], ['have','has','had','having'], ['eat','eats','ate','eaten'] ];
      const opts = choices[(idx-10) % choices.length];
      return { id: idx, sublevel: sub, type: 'choice', prompt: '('+sub+') Choose: She ____ to school yesterday.', options: opts, answer: opts[1] };
    });
    return qs;
  }

  function renderLevelTest(area){
    const questions = buildQuestions().slice();
    // shuffle
    for (let i = questions.length -1; i>0; i--) {
      const j = Math.floor(Math.random() * (i+1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }
  var html = '<div id="camon-progress" style="margin-bottom:8px;color:#374151">Respuestas: 0/'+questions.length+'</div>';
  html += '<form id="camon-level-form"><div style="display:flex;flex-direction:column;gap:14px;">';
    questions.forEach(function(q,i){
      html += '<div style="background:#fff;padding:10px;border-radius:8px;border:1px solid #eee"><label><strong>Pregunta '+(i+1)+"</strong> <small style='color:#666;margin-left:8px'>"+q.sublevel+"</small></label><div style=\"margin-top:8px\">";
      if (q.type === 'fill') {
        html += '<input type="text" name="q_'+i+'" data-ans="'+q.answer+'" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">';
      } else {
        q.options.forEach(function(opt){
          html += '<label style="margin-right:8px;"><input type="radio" name="q_'+i+'" value="'+opt+'"> '+opt+'</label>';
        });
      }
      html += '</div></div>';
    });
    html += '<div style="text-align:center;margin-top:12px"><button type="submit" style="padding:10px 14px;background:#3b82f6;color:#fff;border:none;border-radius:8px">Enviar prueba</button></div></div></form>';
    area.innerHTML = '<h4>Prueba inicial (25 preguntas)</h4>'+html;

    // attach live progress counting
    setTimeout(function(){
      const progressEl = document.getElementById('camon-progress');
      const form = document.getElementById('camon-level-form');
      function updateProgress(){
        let answered = 0;
        questions.forEach(function(q, idx){
          const name = 'q_'+idx;
          const el = form.querySelector('[name="'+name+'"]');
          if (!el) return;
          if (el.type === 'text') {
            if (el.value && el.value.trim()!=='') answered++;
          } else {
            // radio group
            const any = form.querySelector('[name="'+name+'"]:checked');
            if (any) answered++;
          }
        });
        if (progressEl) progressEl.textContent = 'Respuestas: '+answered+'/'+questions.length;
      }
      // delegate input events
      form.addEventListener('input', updateProgress);
      updateProgress();
    }, 30);

    document.getElementById('camon-level-form').addEventListener('submit', function(e){
      e.preventDefault();
      const fd = new FormData(e.target);
      const results = [];
      questions.forEach(function(q, idx){
        const key = 'q_'+idx;
        const val = fd.get(key);
        let correct = false;
        if (q.type === 'fill') {
          correct = val && val.trim().toLowerCase() === q.answer.toLowerCase();
        } else {
          correct = val && val === q.answer;
        }
        results.push({ index: idx, sublevel: q.sublevel, correct: correct });
      });
      const score = results.filter(r => r.correct).length;
      const total = results.length;
      // assigned level heuristic: median of correct indices
      const correctIndices = results.map((r,i)=> r.correct ? i : -1).filter(i=> i>=0).sort((a,b)=>a-b);
      let assignedLevel = CAMON_SUBLEVELS[0];
      if (correctIndices.length) {
        const mid = Math.floor((correctIndices.length-1)/2);
        assignedLevel = CAMON_SUBLEVELS[ correctIndices[mid] ] || CAMON_SUBLEVELS[CAMON_SUBLEVELS.length-1];
      }
      const payload = { user: CAMON_USERNAME, date: new Date().toISOString(), score: score, total: total, assignedLevel: assignedLevel };

      // save locally first
      if (!CAMON_TEST_RESULTS[CAMON_USERNAME]) CAMON_TEST_RESULTS[CAMON_USERNAME] = [];
      CAMON_TEST_RESULTS[CAMON_USERNAME].push({ date: payload.date, score: score, total: total, assignedLevel: assignedLevel });

  // Disable submit button to avoid duplicates
  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Enviando...'; }

  // POST to server (include secret header if present)
  var headers = {'Content-Type':'application/json'};
  if (window.CAMON_SECRET) headers['X-CAMON-SECRET'] = window.CAMON_SECRET;
      fetch('/api/camon/result', { method:'POST', headers: headers, body: JSON.stringify(payload)}).then(function(r){
        if (r.status === 403) throw new Error('forbidden');
        if (r.status === 429) throw new Error('rate_limited');
        return r.json().catch(()=>({ok:true}));
      }).then(function(){
        area.innerHTML = '<div style="background:#fff;padding:12px;border-radius:8px;"><h4>Resultado</h4><p>Puntuación: '+score+'/'+total+'</p><p>Nivel asignado: <strong>'+assignedLevel+'</strong></p><div style="margin-top:10px"><button id="camon-view-evo" style="padding:8px 12px;background:#10b981;color:#fff;border:none;border-radius:8px">Ver mi evolución</button></div></div>';
        var btn = document.getElementById('camon-view-evo'); if (btn) btn.addEventListener('click', function(){ window.showCamonPanel('evolution'); });
      }).catch(function(err){
        if (err && err.message === 'forbidden') {
          area.innerHTML = '<div style="background:#fff;padding:12px;border-radius:8px;color:#b91c1c;">Acceso denegado al guardar resultados. Token inválido.</div>';
        } else if (err && err.message === 'rate_limited') {
          area.innerHTML = '<div style="background:#fff;padding:12px;border-radius:8px;color:#b91c1c;">Has enviado resultados demasiado rápido. Espera unos segundos e inténtalo de nuevo.</div>';
        } else {
          area.innerHTML = '<div style="background:#fff;padding:12px;border-radius:8px;color:#b91c1c;">Error al enviar resultados. Comprueba tu conexión.</div>';
        }
      });
    });
  }

  // Provide the function only if not present
  if (!window.startDemoLevelTest) {
    window.startDemoLevelTest = function(){
      var area = document.getElementById('camon-area'); if (!area) return; renderLevelTest(area);
    };
  }

  // also expose a convenience to open the panel
  var oldShow = window.showCamonPanel;
  window.showCamonPanel = function(panel){
    if (oldShow) oldShow(panel);
    var area = document.getElementById('camon-area'); if (!area) return;
    if (panel === 'level') renderLevelTest(area);
    else if (panel === 'daily') { area.innerHTML = '<div><h4>Ejercicios diarios</h4><p>En construcción (demo)</p></div>'; }
    else if (panel === 'evolution') {
      // reuse existing evolution fetch logic
      fetch('/api/camon/history?user=' + encodeURIComponent(CAMON_USERNAME)).then(function(r){return r.json()}).then(function(data){
        var out = '<div style="background:#fff;padding:12px;border-radius:8px;">';
        if (data.promotions && data.promotions.level) {
          out += '<p>Nivel actual: <strong>'+data.promotions.level+'</strong></p>';
        } else if (data.results && data.results.length) {
          var last = data.results[data.results.length-1]; out += '<p>Nivel asignado (último): <strong>'+last.assignedLevel+'</strong></p>';
        } else out += '<p>No hay datos de pruebas todavía.</p>';
        if (data.results && data.results.length) {
          out += '<h4>Historial de Pruebas</h4><ul>';
          data.results.forEach(function(r){ out += '<li>'+r.date+': '+r.score+'/'+r.total+' → '+(r.assignedLevel||'-')+'</li>'; });
          out += '</ul>';
        }
        out += '</div>'; var evo = document.getElementById('camon-area'); if (evo) evo.innerHTML = out;
      }).catch(function(){ var evo = document.getElementById('camon-area'); if (evo) evo.innerHTML = '<div style="background:#fff;padding:12px;border-radius:8px;color:#666">Error al cargar historial.</div>'; });
    }
  };

  // Voice chat UI: opens a minimal voice-only chat with Elizabeth
  function startVoiceChat() {
    var area = document.getElementById('camon-area'); if (!area) return;
    // Dev ping: notify server that voice chat UI started (helps debug headless/client issues)
    try {
      fetch('/api/dev/log', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ event: 'voice-started', user: CAMON_USERNAME }) }).catch(function(){});
    } catch(e){}
    area.innerHTML = '<div style="background:#fff;padding:12px;border-radius:8px;"><h4>Chat por voz con Elizabeth</h4><div id="voice-chat-area" style="height:180px;overflow:auto;border:1px solid #eee;padding:8px;border-radius:6px;background:#fafafa;margin-bottom:8px"></div><div style="text-align:center"><button id="vc-record" style="padding:10px 14px;background:#ef4444;color:white;border:none;border-radius:8px">🎤 Mantén para hablar</button></div></div>';
    const chatArea = document.getElementById('voice-chat-area');

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      chatArea.innerHTML += '<div style="color:#666">Reconocimiento de voz no soportado en este navegador. Usa Chrome.</div>';
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR(); recognition.lang = 'en-US'; recognition.interimResults = false; recognition.continuous = false;

    function appendUser(msg) { chatArea.innerHTML += '<div style="text-align:right;color:#0b5394;margin:6px 0"><strong>'+CAMON_USERNAME+':</strong> '+msg+'</div>'; chatArea.scrollTop = chatArea.scrollHeight; }
    function appendAI(msg) { chatArea.innerHTML += '<div style="text-align:left;color:#333;margin:6px 0"><strong>Elizabeth:</strong> '+msg+'</div>'; chatArea.scrollTop = chatArea.scrollHeight; }

    recognition.addEventListener('result', function(e){
      const text = e.results[0][0].transcript;
      appendUser(text);
      // send to server
      fetch('/api/chat-elizabeth', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ user: CAMON_USERNAME, message: text, level: 'A1.1' }) }).then(function(r){ return r.json(); }).then(function(data){
        const resp = data.response || '(no response)';
        appendAI(resp);
        if (data.audioBase64) {
          try {
            const audioSrc = 'data:audio/mpeg;base64,' + data.audioBase64;
            const audio = new Audio(audioSrc);
            audio.play().catch(function(){ /* ignore autoplay restrictions */ });
          } catch (e) {
            if ('speechSynthesis' in window && resp) {
              const u = new SpeechSynthesisUtterance(resp); u.lang = 'en-US'; u.rate = 0.95; window.speechSynthesis.speak(u);
            }
          }
        } else {
          if ('speechSynthesis' in window && resp) {
            const u = new SpeechSynthesisUtterance(resp); u.lang = 'en-US'; u.rate = 0.95; window.speechSynthesis.speak(u);
          }
        }
      }).catch(function(){ appendAI('Error al conectar con el servidor.'); });
    });

    recognition.addEventListener('error', function(e){ appendAI('Error de reconocimiento: '+(e.error||e.message)); });

    const recBtn = document.getElementById('vc-record');
    recBtn.addEventListener('mousedown', function(){
      try { recognition.start(); recBtn.textContent = '🔴 Grabando...'; recBtn.style.background='#10b981'; } catch(e){ console.warn(e); }
    });
    recBtn.addEventListener('mouseup', function(){ try { recognition.stop(); recBtn.textContent = '🎤 Mantén para hablar'; recBtn.style.background='#ef4444'; } catch(e){} });
  }

  // expose voice chat starter
  window.startVoiceChat = startVoiceChat;

  // programmatic bindings for server-rendered attributes
  function bindServerButtons() {
    try {
      document.querySelectorAll('button[data-section]').forEach(function(btn){
        if (btn.__camon_bound) return; btn.__camon_bound = true;
        btn.addEventListener('click', function(){
          var s = btn.getAttribute('data-section');
          if (s && typeof window.showSection === 'function') {
            try { window.showSection(s); } catch(e){}
          }
          if (s === 'level' || s === 'test') window.showCamonPanel && window.showCamonPanel('level');
          if (s === 'exercises') window.showCamonPanel && window.showCamonPanel('daily');
          if (s === 'progress') window.showCamonPanel && window.showCamonPanel('evolution');
          if (s === 'chat') window.startVoiceChat && window.startVoiceChat();
        });
      });

      document.querySelectorAll('button[data-demo]').forEach(function(btn){
        if (btn.__camon_bound) return; btn.__camon_bound = true;
        btn.addEventListener('click', function(){
          var d = btn.getAttribute('data-demo');
          if (d === 'level' && window.startDemoLevelTest) window.startDemoLevelTest();
          if (d === 'grammar' && window.startDemoGrammar) window.startDemoGrammar();
          if (d === 'reading' && window.startDemoReading) window.startDemoReading();
          if (d === 'chat' && window.startDemoChat) window.startDemoChat();
        });
      });

  var sStart = document.getElementById('start-level-test'); if (sStart && !sStart.__camon_bound) { sStart.__camon_bound=true; sStart.addEventListener('click', function(){ if (window.startLevelTest) window.startLevelTest(); if (window.startDemoLevelTest) window.startDemoLevelTest(); }); }
      var gStart = document.getElementById('start-grammar'); if (gStart && !gStart.__camon_bound) { gStart.__camon_bound=true; gStart.addEventListener('click', function(){ if (window.startGrammar) window.startGrammar(); if (window.startDemoGrammar) window.startDemoGrammar(); }); }
      var rStart = document.getElementById('start-reading'); if (rStart && !rStart.__camon_bound) { rStart.__camon_bound=true; rStart.addEventListener('click', function(){ if (window.startReading) window.startReading(); if (window.startDemoReading) window.startDemoReading(); }); }

      var txtToggle = document.getElementById('toggle-text-input'); if (txtToggle && !txtToggle.__camon_bound) { txtToggle.__camon_bound=true; txtToggle.addEventListener('click', function(){ if (window.toggleTextInput) window.toggleTextInput(); }); }

      // Bind the main record button: try mousedown/up -> call startRecording/stopRecording or toggleRecording/startVoiceChat
      var recBtn = document.getElementById('record-btn');
      if (recBtn && !recBtn.__camon_bound) {
        recBtn.__camon_bound = true;
        recBtn.addEventListener('mousedown', function(){
          if (typeof window.startRecording === 'function') return window.startRecording();
          if (typeof window.toggleRecording === 'function') return window.toggleRecording();
          if (typeof window.startVoiceChat === 'function') return window.startVoiceChat();
          console.warn('Ca\'mon: no voice start function available');
        });
        recBtn.addEventListener('mouseup', function(){
          if (typeof window.stopRecording === 'function') return window.stopRecording();
          if (typeof window.toggleRecording === 'function') return window.toggleRecording();
        });
      }
    } catch (e) { console.warn('Camon bindServerButtons error', e); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindServerButtons); else bindServerButtons();
  // expose for mutation-observer rebinds
  window.__camon_bindServerButtons = bindServerButtons;

})();

// --- Robust inline onclick binder (runs in client, avoids server template fragility) ---
(function(){
  function rebindInline() {
    try {
      document.querySelectorAll('[onclick]').forEach(function(el){
        var code = el.getAttribute('onclick');
        if (!code) return;
        var m = code.match(/^\s*([a-zA-Z0-9_$.]+)\s*\(\s*('([^']*)'|"([^"]*)")?\s*\)\s*;?\s*$/);
        if (!m) return;
        var fnName = m[1];
        var arg = (m[3] !== undefined) ? m[3] : (m[4] !== undefined ? m[4] : null);
        // avoid rebinding same element
        if (el.__camon_rebound) return;
        var fn = window[fnName];
        if (typeof fn !== 'function') {
          // function not available yet; skip removing attribute so native inline handler can run later
          return;
        }
        el.__camon_rebound = true;
        el.removeAttribute('onclick');
        el.addEventListener('click', function(e){
          try {
            var fn = window[fnName];
            if (typeof fn === 'function') {
              if (arg !== null) fn(arg);
              else fn();
            } else {
              console.warn('Ca\'mon: function not found on window:', fnName);
            }
          } catch (err) {
            console.error('Ca\'mon handler error', fnName, err);
          }
        });
      });
    } catch (e) {
      console.error('Ca\'mon rebind error', e && e.message ? e.message : e);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', rebindInline);
  else rebindInline();

  // Observe DOM changes and attempt to bind newly-added inline handlers
  try {
    var mo = new MutationObserver(function(){ rebindInline(); });
    mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
  } catch (e) {
    // ignore in very old browsers
  }
})();
