/**
 * Sistema de cache em memória simples
 * Para produção, considere usar Redis
 */

class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Armazenar valor no cache
   * @param {string} key - Chave do cache
   * @param {*} value - Valor a ser armazenado
   * @param {number} ttl - Time to live em milissegundos (padrão: 1 hora)
   */
  set(key, value, ttl = 60 * 60 * 1000) {
    // Limpar timer anterior se existir
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Armazenar valor
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl
    });

    // Configurar timer para remoção automática
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);

    this.timers.set(key, timer);
  }

  /**
   * Obter valor do cache
   * @param {string} key - Chave do cache
   * @returns {*|null} Valor armazenado ou null se não existir/expirado
   */
  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Verificar se expirou
    if (Date.now() > item.expiresAt) {
      this.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Verificar se chave existe no cache
   * @param {string} key - Chave do cache
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Deletar valor do cache
   * @param {string} key - Chave do cache
   */
  delete(key) {
    this.cache.delete(key);
    
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  /**
   * Limpar todo o cache
   */
  clear() {
    // Limpar todos os timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.cache.clear();
  }

  /**
   * Obter todas as chaves do cache
   * @returns {string[]}
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**
   * Obter tamanho do cache
   * @returns {number}
   */
  size() {
    return this.cache.size;
  }

  /**
   * Limpar itens expirados
   */
  cleanExpired() {
    const now = Date.now();
    const keysToDelete = [];

    this.cache.forEach((item, key) => {
      if (now > item.expiresAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.delete(key));
  }
}

// Instância singleton
const cache = new MemoryCache();

// Limpar itens expirados a cada 10 minutos
setInterval(() => {
  cache.cleanExpired();
}, 10 * 60 * 1000);

module.exports = cache;

