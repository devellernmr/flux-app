// ==========================================
// Tracking & Pixels Utility (Meta Ads & GA4)
// ==========================================

export type FbqFunction = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: FbqFunction;
    _fbq?: unknown;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

// Configurações lidas do ambiente (.env.local) ou padrões
export const TRACKING_CONFIG = {
  META_PIXEL_ID: import.meta.env.VITE_META_PIXEL_ID || "",
  GA_MEASUREMENT_ID: import.meta.env.VITE_GA_MEASUREMENT_ID || "",
  GTM_ID: import.meta.env.VITE_GTM_ID || "",
};

/**
 * Inicializa scripts dos pixels no documento
 */
export function initTracking() {
  if (typeof window === "undefined") return;

  // 1. Meta Pixel (Facebook)
  if (TRACKING_CONFIG.META_PIXEL_ID && !window.fbq) {
    const f = window;
    const d = document;

    const fbqHandler: FbqFunction = Object.assign(
      function (...args: unknown[]) {
        if (fbqHandler.callMethod) {
          fbqHandler.callMethod(...args);
        } else {
          fbqHandler.queue = fbqHandler.queue || [];
          fbqHandler.queue.push(args);
        }
      },
      {
        queue: [] as unknown[],
        loaded: true,
        version: "2.0",
      }
    );

    f.fbq = fbqHandler;
    if (!f._fbq) f._fbq = fbqHandler;

    const script = d.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    const firstScript = d.getElementsByTagName("script")[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      d.head.appendChild(script);
    }

    fbqHandler("init", TRACKING_CONFIG.META_PIXEL_ID);
    fbqHandler("track", "PageView");
  }

  // 2. Google Analytics 4 (GA4)
  if (TRACKING_CONFIG.GA_MEASUREMENT_ID && !window.gtag) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${TRACKING_CONFIG.GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", TRACKING_CONFIG.GA_MEASUREMENT_ID, {
      send_page_view: true,
    });
  }
}

/**
 * Dispara visualização de página para pixels
 */
export function trackPageView(path: string, title?: string) {
  if (typeof window === "undefined") return;

  // Meta Pixel
  if (window.fbq) {
    window.fbq("track", "PageView");
  }

  // Google Analytics
  if (window.gtag && TRACKING_CONFIG.GA_MEASUREMENT_ID) {
    window.gtag("event", "page_view", {
      page_path: path,
      page_title: title || document.title,
    });
  }
}

/**
 * Rastreia evento genérico de conversão ou interação
 */
export function trackEvent(
  eventName: string,
  params: Record<string, unknown> = {}
) {
  if (typeof window === "undefined") return;

  // Meta Pixel
  if (window.fbq) {
    window.fbq("trackCustom", eventName, params);
  }

  // Google Analytics
  if (window.gtag) {
    window.gtag("event", eventName, params);
  }
}

/**
 * Eventos Padronizados de Anúncios / Conversão
 */
export const track = {
  // Novo cadastro concluído
  completeRegistration: (method: string = "email") => {
    if (window.fbq) {
      window.fbq("track", "CompleteRegistration", { content_name: method });
    }
    if (window.gtag) {
      window.gtag("event", "sign_up", { method });
    }
  },

  // Lead gerado (ex: formulário de contato, demonstração)
  lead: (formName: string = "contact_form", value?: number) => {
    if (window.fbq) {
      window.fbq("track", "Lead", {
        content_name: formName,
        currency: "BRL",
        value: value || 0,
      });
    }
    if (window.gtag) {
      window.gtag("event", "generate_lead", {
        form_name: formName,
        value: value || 0,
        currency: "BRL",
      });
    }
  },

  // Início de checkout (clique para assinar plano)
  initiateCheckout: (planId: string, value: number) => {
    if (window.fbq) {
      window.fbq("track", "InitiateCheckout", {
        content_name: planId,
        currency: "BRL",
        value,
      });
    }
    if (window.gtag) {
      window.gtag("event", "begin_checkout", {
        items: [{ item_name: planId, price: value }],
        value,
        currency: "BRL",
      });
    }
  },

  // Compra / Assinatura confirmada
  purchase: (planId: string, value: number, transactionId?: string) => {
    if (window.fbq) {
      window.fbq("track", "Purchase", {
        content_name: planId,
        currency: "BRL",
        value,
      });
    }
    if (window.gtag) {
      window.gtag("event", "purchase", {
        transaction_id: transactionId || String(Date.now()),
        value,
        currency: "BRL",
        items: [{ item_name: planId, price: value }],
      });
    }
  },

  // Clique em botão de contato (WhatsApp / Instagram / Email)
  contact: (channel: "whatsapp" | "email" | "instagram") => {
    if (window.fbq) {
      window.fbq("track", "Contact", { channel });
    }
    if (window.gtag) {
      window.gtag("event", "contact", { channel });
    }
  },
};
