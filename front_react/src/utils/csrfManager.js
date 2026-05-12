// src/utils/csrfManager.js

class CsrfManager {
  constructor() {
    this.token = null;
    this.isInitialized = false;
    this.pendingRequests = [];
  }

  async initialize() {
    if (this.isInitialized) {
      return this.token;
    }

    console.log('🔄 Inicializando CSRF Manager...');
    
    try {
      // Faz a requisição para obter o cookie CSRF
      const response = await fetch('http://localhost:8000/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include', // IMPORTANTE: envia cookies
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Falha ao obter CSRF: ${response.status}`);
      }

      // Extrai o token do cookie XSRF-TOKEN
      const cookies = document.cookie.split(';');
      const xsrfCookie = cookies.find(cookie => 
        cookie.trim().startsWith('XSRF-TOKEN=')
      );

      if (xsrfCookie) {
        this.token = decodeURIComponent(xsrfCookie.split('=')[1]);
        console.log('✅ CSRF Token obtido:', this.token ? 'Sim' : 'Não');
      }

      this.isInitialized = true;
      console.log('✅ CSRF Manager inicializado');

      return this.token;
    } catch (error) {
      console.error('❌ Erro ao inicializar CSRF:', error);
      throw error;
    }
  }

  getToken() {
    return this.token;
  }

  setToken(token) {
    this.token = token;
    this.isInitialized = true;
  }

  clear() {
    this.token = null;
    this.isInitialized = false;
    console.log('🧹 CSRF Manager limpo');
  }

  // Para debug
  debug() {
    console.log('🔍 CSRF Debug:', {
      token: this.token,
      isInitialized: this.isInitialized,
      cookies: document.cookie,
    });
  }
}

// Exporta uma instância singleton
export const csrfManager = new CsrfManager();