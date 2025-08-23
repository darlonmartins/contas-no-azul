const axios = require('axios');

const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v20.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;
const DEFAULT_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;

if (!TOKEN) {
  console.warn('⚠️ WHATSAPP_TOKEN não definido. Envio de mensagens ficará indisponível.');
}
if (!DEFAULT_PHONE_NUMBER_ID) {
  console.warn('⚠️ WHATSAPP_PHONE_NUMBER_ID não definido (usará o recebido via webhook se for passado).');
}

function buildUrl(phoneNumberId) {
  const id = phoneNumberId || DEFAULT_PHONE_NUMBER_ID;
  if (!id) throw new Error('WhatsApp phone_number_id não definido.');
  return `${BASE_URL}/${id}/messages`;
}

function authHeaders() {
  if (!TOKEN) throw new Error('WHATSAPP_TOKEN não definido.');
  return {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  };
}

async function postMessage(url, payload) {
  try {
    const { data } = await axios.post(url, payload, { headers: authHeaders() });
    return data;
  } catch (err) {
    const detail = err?.response?.data || err.message;
    console.error('❌ Erro ao enviar mensagem WhatsApp:', JSON.stringify(detail));
    throw err;
  }
}

module.exports = {
  /**
   * Envia texto simples
   * @param {string} to - MSISDN do destinatário (ex: "5561999999999")
   * @param {string} text - Corpo do texto
   * @param {string} [phoneNumberId] - Opcional: sobrescreve o ID vindo do .env
   */
  async sendText(to, text, phoneNumberId) {
    const url = buildUrl(phoneNumberId);
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    };
    return postMessage(url, payload);
  },

  /**
   * Envia template (modelo aprovado pela Meta)
   * @param {string} to
   * @param {string} templateName - Nome do template (ex: "saldo_usuario")
   * @param {string} [languageCode="pt_BR"]
   * @param {Array} [components=[]] - Ex.: [{ type: 'body', parameters: [{ type:'text', text:'João' }] }]
   * @param {string} [phoneNumberId]
   */
  async sendTemplate(to, templateName, languageCode = 'pt_BR', components = [], phoneNumberId) {
    const url = buildUrl(phoneNumberId);
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        ...(components.length ? { components } : {}),
      },
    };
    return postMessage(url, payload);
  },

  /**
   * (Opcional) Enviar imagem por URL pública
   * @param {string} to
   * @param {string} imageUrl
   * @param {string} [caption]
   * @param {string} [phoneNumberId]
   */
  async sendImageUrl(to, imageUrl, caption = '', phoneNumberId) {
    const url = buildUrl(phoneNumberId);
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'image',
      image: { link: imageUrl, ...(caption ? { caption } : {}) },
    };
    return postMessage(url, payload);
  },

  /**
   * (Opcional) Enviar documento por URL pública (PDF, etc.)
   * @param {string} to
   * @param {string} docUrl
   * @param {string} [filename]
   * @param {string} [caption]
   * @param {string} [phoneNumberId]
   */
  async sendDocumentUrl(to, docUrl, filename = '', caption = '', phoneNumberId) {
    const url = buildUrl(phoneNumberId);
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'document',
      document: {
        link: docUrl,
        ...(filename ? { filename } : {}),
        ...(caption ? { caption } : {}),
      },
    };
    return postMessage(url, payload);
  },

  // --- ADICIONAR AO FINAL DO ARQUIVO ---

  /**
   * Envia botões interativos (Quick Replies)
   * @param {string} to
   * @param {object} opts
   *  - header?: { type: 'text', text: 'Título' }
   *  - body: 'Mensagem principal'
   *  - footer?: 'Rodapé'
   *  - buttons: Array<{ id: string, title: string }>
   * @param {string} [phoneNumberId]
   */
  async sendButtons(to, opts, phoneNumberId) {
    const url = buildUrl(phoneNumberId);
    const { header, body, footer, buttons } = opts;

    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        ...(header ? { header } : {}),
        body: { text: body },
        ...(footer ? { footer: { text: footer } } : {}),
        action: {
          buttons: buttons.map((b) => ({
            type: 'reply',
            reply: { id: b.id, title: b.title }
          }))
        }
      }
    };

    return postMessage(url, payload);
  },

  /**
   * Envia lista interativa (sections)
   * @param {string} to
   * @param {object} opts
   *  - header?: { type: 'text', text: 'Título' }
   *  - body: 'Mensagem principal'
   *  - footer?: 'Rodapé'
   *  - buttonText: 'Abrir menu'
   *  - sections: Array<{ title?: string, rows: Array<{ id: string, title: string, description?: string }> }>
   * @param {string} [phoneNumberId]
   */
  async sendList(to, opts, phoneNumberId) {
    const url = buildUrl(phoneNumberId);
    const { header, body, footer, buttonText, sections } = opts;

    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        ...(header ? { header } : {}),
        body: { text: body },
        ...(footer ? { footer: { text: footer } } : {}),
        action: {
          button: buttonText,
          sections: sections.map((s) => ({
            ...(s.title ? { title: s.title } : {}),
            rows: s.rows.map((r) => ({
              id: r.id,
              title: r.title,
              ...(r.description ? { description: r.description } : {})
            }))
          }))
        }
      }
    };

    return postMessage(url, payload);
  },

};

