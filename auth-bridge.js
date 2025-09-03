// auth-bridge.js - Sistema de autenticación unificado
const createEnglishUser = async (username) => {
  try {
    const response = await fetch('/english/api/auto-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('english_token', data.token);
      localStorage.setItem('english_user', JSON.stringify(data.user));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error creando usuario de inglés:', error);
    return false;
  }
};

const accessEnglishApp = async (currentUser) => {
  const userMapping = {
    'Javier': 'javier',
    'Raquel': 'raquel', 
    'Mario': 'mario',
    'Alba': 'alba'
  };
  
  const englishUsername = userMapping[currentUser];
  
  if (!englishUsername) {
    alert('Usuario no autorizado para la app de inglés');
    return;
  }
  
  const success = await createEnglishUser(englishUsername);
  
  if (success) {
    window.open('/english', '_blank');
  } else {
    alert('Error accediendo a la app de inglés');
  }
};

window.accessEnglishApp = accessEnglishApp;