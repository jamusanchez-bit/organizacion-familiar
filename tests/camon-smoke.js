// tests/camon-smoke.js
// Smoke test con Puppeteer para Ca'mon: abre la página, captura console/page errors y hace clicks
const puppeteer = require('puppeteer');
(async ()=>{
  const out = { console: [], pageErrors: [], actions: [] };
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox']});
  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(15000);
    page.on('console', msg => {
      try { out.console.push({type: msg.type(), text: msg.text()}); } catch(e){ out.console.push({type:'unknown', text: String(msg)}); }
    });
    page.on('pageerror', err => { out.pageErrors.push(String(err)); });

    const url = 'http://127.0.0.1:10000/english?user=smoketest';
    out.actions.push('goto '+url);
    const resp = await page.goto(url, { waitUntil: 'networkidle2' });
    out.actions.push('status ' + (resp && resp.status ? resp.status() : 'no-response'));

    // small helper to click all elements matching a selector and wait
    function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }
    async function clickAll(selector, label){
      // count elements in page
      const count = await page.$$eval(selector, els => els.length).catch(()=>0);
      out.actions.push(`found ${count} for ${label}`);
      for (let i=0;i<count;i++){
        try {
          const clicked = await page.evaluate((sel, idx)=>{
            const els = Array.from(document.querySelectorAll(sel));
            if (!els[idx]) return false;
            try { els[idx].scrollIntoView({behavior:'auto', block:'center'}); } catch(e){}
            els[idx].click();
            return true;
          }, selector, i);
          if (clicked) out.actions.push(`clicked ${label} #${i}`);
          else out.actions.push(`no-element ${label} #${i}`);
          await sleep(250);
        } catch(e){ out.actions.push(`error clicking ${label} #${i}: ${String(e)}`); }
      }
    }


    // Click nav buttons (data-section) and inspect dynamic content in #camon-area
    const navCount = await page.$$eval('button[data-section]', els => els.length).catch(()=>0);
    out.actions.push('nav-count:'+navCount);
    for (let i=0;i<navCount;i++){
      try {
        const did = await page.evaluate((idx)=>{
          const els = Array.from(document.querySelectorAll('button[data-section]'));
          if (!els[idx]) return null;
          const s = els[idx].getAttribute('data-section') || '';
          els[idx].scrollIntoView({block:'center'});
          els[idx].click();
          return s;
        }, i);
        out.actions.push('clicked nav['+i+'] -> '+String(did));
  // small wait for dynamic content
  await sleep(300);
        // grab camon-area content length
        const camonHtml = await page.$eval('#camon-area', el => el.innerHTML).catch(()=>null);
        out.actions.push('camon-area-length-after-nav-'+i+':' + (camonHtml ? camonHtml.length : 0));
        // detect demo buttons inside camon-area
        const demoFound = await page.$eval('#camon-area', area => !!area.querySelector('button[data-demo], #start-level-test, button[data-demo="evolution"]')).catch(()=>false);
        out.actions.push('demo-present-after-nav-'+i+':' + demoFound);
      } catch (e){ out.actions.push('error during nav click #'+i+': '+String(e)); }
    }

    // After nav interactions, click any demo buttons found anywhere
    const demoCount = await page.$$eval('button[data-demo]', els => els.length).catch(()=>0);
    out.actions.push('demo-count:'+demoCount);
    for (let i=0;i<demoCount;i++){
      try {
        const ok = await page.evaluate((sel, idx)=>{ const els = Array.from(document.querySelectorAll(sel)); if (!els[idx]) return false; els[idx].scrollIntoView({block:'center'}); els[idx].click(); return true; }, 'button[data-demo]', i);
        out.actions.push('clicked demo['+i+']:'+ok);
  await sleep(200);
      } catch(e){ out.actions.push('error clicking demo['+i+']:'+String(e)); }
    }

    // Finally, attempt to click #start-level-test if present inside the DOM
    const hasStart = await page.$('#start-level-test');
    if (hasStart) {
      try {
        // schedule the click to avoid long-running handlers blocking the protocol
        const scheduled = await page.evaluate(()=>{
          const b = document.getElementById('start-level-test');
          if (!b) return null;
          setTimeout(()=>{ try { b.click(); } catch(e){} }, 0);
          return 'scheduled';
        });
        out.actions.push('scheduled start-level-test:'+String(scheduled));
        await sleep(300);
      } catch(e){ out.actions.push('error scheduling start-level-test:'+String(e)); }
    }

    // If there's a voice record button, attempt to call the public voice starter directly
    const hasRec = await page.$('#record-btn');
    if (hasRec) {
      try {
        // schedule voice starter so evaluate returns immediately and avoids CDP timeouts
        const scheduled = await page.evaluate(()=>{
          try {
            if (typeof window.startVoiceChat === 'function') { setTimeout(()=>{ try{ window.startVoiceChat(); }catch(e){} }, 0); return 'startVoiceChat-scheduled'; }
            if (typeof window.toggleRecording === 'function') { setTimeout(()=>{ try{ window.toggleRecording(); }catch(e){} }, 0); return 'toggleRecording-scheduled'; }
            if (typeof window.startRecording === 'function') { setTimeout(()=>{ try{ window.startRecording(); }catch(e){} }, 0); return 'startRecording-scheduled'; }
            return null;
          } catch(e){ return 'error:'+String(e); }
        });
        out.actions.push('invoked-voice-fn:'+String(scheduled));
        await sleep(500);
      } catch(e){ out.actions.push('error-invoking-voice:'+String(e)); }
    } else {
      out.actions.push('no-record-btn');
    }

    // Capture snapshot of camon-area HTML
    try { const html = await page.$eval('#camon-area', el => el.innerHTML); out.actions.push('camon-area-length-final:'+ (html?html.length:0)); } catch(e){ out.actions.push('no camon-area'); }

    // Probe for record button existence and voice functions on window
    try {
      const probe = await page.evaluate(()=>{
        return {
          hasGlobalRecordBtn: !!document.querySelector('#record-btn'),
          hasRecordInCamon: !!(document.querySelector('#camon-area') && document.querySelector('#camon-area').querySelector('#record-btn')),
          hasStartVoiceChat: typeof window.startVoiceChat === 'function',
          hasToggleRecording: typeof window.toggleRecording === 'function',
          hasStartRecording: typeof window.startRecording === 'function'
        };
      });
      out.actions.push('probe:'+JSON.stringify(probe));
    } catch(e){ out.actions.push('probe-error:'+String(e)); }

  // Wait a moment for any async logs
  await sleep(800);
  } catch (err) {
    out.pageErrors.push('test-runner-error: '+String(err));
  } finally {
    try { await browser.close(); } catch(e){}
    console.log(JSON.stringify(out, null, 2));
  }
})();
