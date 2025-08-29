// Sistema de monitoreo de salud de la aplicación
const https = require('https');

const BASE_URL = 'https://organizacion-familiar.vercel.app';
const ENDPOINTS = [
  '/',
  '/javier/abc123xyz789def456',
  '/raquel/uvw012rst345ghi678',
  '/mario/jkl901mno234pqr567',
  '/alba/stu890vwx123yzb456',
  '/admin/cde789fgh012ijl345'
];

function checkEndpoint(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      resolve({
        url,
        status: res.statusCode,
        ok: res.statusCode === 200
      });
    });
    
    req.on('error', (error) => {
      resolve({
        url,
        status: 'ERROR',
        ok: false,
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        ok: false,
        error: 'Timeout'
      });
    });
  });
}

async function healthCheck() {
  console.log('🏥 Verificando salud de la aplicación...\n');
  
  const results = await Promise.all(
    ENDPOINTS.map(endpoint => checkEndpoint(BASE_URL + endpoint))
  );
  
  let allOk = true;
  
  results.forEach(result => {
    const status = result.ok ? '✅' : '❌';
    console.log(`${status} ${result.url} - ${result.status}`);
    if (!result.ok) {
      allOk = false;
      if (result.error) console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n' + '='.repeat(50));
  if (allOk) {
    console.log('✅ Todos los endpoints funcionan correctamente');
  } else {
    console.log('❌ Algunos endpoints tienen problemas');
    console.log('💡 Considera hacer rollback en Vercel si es necesario');
  }
  console.log('='.repeat(50));
}

if (require.main === module) {
  healthCheck();
}

module.exports = { healthCheck };