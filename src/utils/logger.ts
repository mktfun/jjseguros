/**
 * Logger Utility - Blindagem de Console
 * Silencia logs sensíveis em ambiente de produção para evitar vazamento de dados.
 */

const isDev = import.meta.env.DEV;

export const logger = {
  info: (message: string, ...args: any[]) => {
    if (isDev) console.log(`[INFO] ${message}`, ...args);
  },
  
  error: (message: string, ...args: any[]) => {
    // Erros críticos sempre são mostrados, mas sanitizados
    console.error(`[ERROR] ${message}`, ...args);
  },

  warn: (message: string, ...args: any[]) => {
    if (isDev) console.warn(`[WARN] ${message}`, ...args);
  },

  /**
   * Silencia o console globalmente se não estiver em desenvolvimento.
   * Deve ser chamado na entrada do app (main.tsx).
   */
  init: () => {
    if (!isDev) {
      const noop = () => {};
      (window as any).console.log = noop;
      (window as any).console.info = noop;
      (window as any).console.debug = noop;
      // Mantemos o warn e error para diagnósticos de emergência, 
      // mas sem detalhes de objetos se possível.
    }
  }
};
