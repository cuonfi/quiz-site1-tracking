/**
 * XTracky - Tracking Config Mode
 * Script para modo de configuração visual de tracking
 *
 * Uso: Adicionar ?xtracky_config=PRODUCT_ID na URL
 */
(function() {
  'use strict';

  // Detectar modo configuração
  const url = new URL(window.location.href);
  const configToken = url.searchParams.get('xtracky_config');

  if (!configToken) {
    return; // Não está em modo configuração
  }

  console.log('[XTracky Config] Modo configuração ativado para produto:', configToken);

  let currentHighlight = null;
  let selectedElements = [];

  // Detectar se está em iframe ou popup e obter referência do painel
  function getParentWindow() {
    // Primeiro tenta iframe (window.parent diferente de window)
    if (window.parent && window.parent !== window) {
      return window.parent;
    }
    // Depois tenta popup (window.opener)
    if (window.opener) {
      return window.opener;
    }
    return null;
  }

  const parentWindow = getParentWindow();
  const isInIframe = window.parent && window.parent !== window;
  console.log('[XTracky Config] Modo:', isInIframe ? 'iframe' : (window.opener ? 'popup' : 'standalone'));

  // Modo de interação: 'select' ou 'navigate' (persistente via window)
  if (typeof window.__xtrackyMode === 'undefined') {
    window.__xtrackyMode = 'select';
  }

  function getMode() {
    return window.__xtrackyMode;
  }

  function setMode(mode) {
    window.__xtrackyMode = mode;
    console.log('[XTracky Config] Modo alterado para:', mode);
  }

  // Monitorar mudanças de URL (para SPAs)
  let lastUrl = window.location.href;
  let lastPath = window.location.pathname;

  function getCurrentPath() {
    return window.location.pathname;
  }

  function notifyUrlChange() {
    const currentUrl = window.location.href;
    const currentPath = window.location.pathname;

    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      lastPath = currentPath;

      if (parentWindow) {
        parentWindow.postMessage({
          type: 'XTRACKY_URL_CHANGE',
          payload: {
            url: currentUrl,
            path: currentPath,
            hostname: window.location.hostname
          }
        }, '*');
        console.log('[XTracky Config] URL alterada:', currentPath);
      }
    }
  }

  function setupUrlMonitoring() {
    // Detectar navegação via History API (SPAs)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      setTimeout(notifyUrlChange, 0);
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      setTimeout(notifyUrlChange, 0);
    };

    // Detectar navegação via popstate (botão voltar/avançar)
    window.addEventListener('popstate', notifyUrlChange);

    // Detectar mudanças de hash
    window.addEventListener('hashchange', notifyUrlChange);

    // Polling como fallback para frameworks que não usam History API padrão
    setInterval(notifyUrlChange, 500);
  }

  // Injetar estilos (apenas highlight e tooltip, sem toolbar)
  function injectStyles() {
    const style = document.createElement('style');
    style.id = 'xtracky-config-styles';
    style.textContent = `
      .xtracky-highlight {
        outline: 3px solid #3B82F6 !important;
        outline-offset: 2px !important;
        cursor: crosshair !important;
        background-color: rgba(59, 130, 246, 0.1) !important;
      }
      .xtracky-selected {
        outline: 3px solid #10B981 !important;
        outline-offset: 2px !important;
        background-color: rgba(16, 185, 129, 0.1) !important;
      }
      /* Tooltip de elemento */
      .xtracky-tooltip {
        position: fixed;
        background: #1F2937;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-family: monospace;
        z-index: 2147483646;
        pointer-events: none;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        max-width: 400px;
        word-break: break-all;
      }
      .xtracky-tooltip::before {
        content: '';
        position: absolute;
        top: -6px;
        left: 20px;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-bottom: 6px solid #1F2937;
      }
    `;
    document.head.appendChild(style);
  }

  // Criar tooltip
  let tooltip = null;
  function createTooltip() {
    tooltip = document.createElement('div');
    tooltip.className = 'xtracky-tooltip';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);
  }

  function showTooltip(element, e) {
    const selector = generateSelector(element);
    tooltip.textContent = selector;
    tooltip.style.display = 'block';
    tooltip.style.left = e.pageX + 'px';
    tooltip.style.top = (e.pageY + 20) + 'px';
  }

  function hideTooltip() {
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }

  // Gerar seletor CSS único
  function generateSelector(element) {
    // 1. ID único
    if (element.id && document.querySelectorAll('#' + CSS.escape(element.id)).length === 1) {
      return '#' + element.id;
    }

    // 2. Data attributes
    const dataAttrs = ['data-action', 'data-id', 'data-button', 'data-testid', 'data-product'];
    for (const attr of dataAttrs) {
      if (element.hasAttribute(attr)) {
        const selector = '[' + attr + '="' + element.getAttribute(attr) + '"]';
        if (document.querySelectorAll(selector).length === 1) {
          return selector;
        }
      }
    }

    // 3. Classes únicas (não genéricas)
    const classes = Array.from(element.classList)
      .filter(c => !isGenericClass(c) && !c.startsWith('xtracky'));

    if (classes.length > 0) {
      const classSelector = '.' + classes.slice(0, 2).join('.');
      if (document.querySelectorAll(classSelector).length === 1) {
        return classSelector;
      }
    }

    // 4. Tag + classes
    if (classes.length > 0) {
      const tagWithClasses = element.tagName.toLowerCase() + '.' + classes.slice(0, 2).join('.');
      if (document.querySelectorAll(tagWithClasses).length === 1) {
        return tagWithClasses;
      }
    }

    // 5. Path completo
    return generateFullPath(element);
  }

  function isGenericClass(className) {
    const genericPatterns = [
      /^(w|h|p|m|text|bg|flex|grid|col|row|gap|space|border|rounded|shadow|opacity|transition|duration|ease|transform|scale|rotate|translate|skew|origin|cursor|pointer|select|resize|scroll|overflow|z|inset|top|right|bottom|left|float|clear|object|aspect|container|mx|my|px|py|mt|mr|mb|ml|pt|pr|pb|pl)-/,
      /^(container|wrapper|inner|outer|content|main|header|footer|sidebar|nav|menu|list|item|row|col|section|article|aside|figure|figcaption)$/,
      /^(active|disabled|hidden|visible|show|hide|open|close|collapsed|expanded|selected|checked|focused|hover|focus|visited|loading|loaded|error|success|warning|info|primary|secondary|tertiary|default|light|dark)$/,
      /^(sm|md|lg|xl|2xl|xs):/,
    ];
    return genericPatterns.some(p => p.test(className));
  }

  function generateFullPath(element) {
    const path = [];
    let current = element;

    while (current && current !== document.body && current !== document.documentElement) {
      let selector = current.tagName.toLowerCase();

      if (current.id) {
        selector = '#' + CSS.escape(current.id);
        path.unshift(selector);
        break;
      }

      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(c => c.tagName === current.tagName);
        if (siblings.length > 1) {
          const index = siblings.indexOf(current) + 1;
          selector += ':nth-of-type(' + index + ')';
        }
      }

      path.unshift(selector);
      current = current.parentElement;
    }

    return path.join(' > ');
  }

  // Highlight de elementos
  function enableHighlight() {
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('mousemove', handleMouseMove, true);
  }

  function handleMouseOver(e) {
    const target = e.target;

    // Ignorar elementos do XTracky
    if (target.closest('.xtracky-tooltip')) {
      return;
    }

    // Não mostrar highlight em modo navegação
    if (getMode() === 'navigate') {
      return;
    }

    // Remover highlight anterior
    if (currentHighlight && currentHighlight !== target) {
      currentHighlight.classList.remove('xtracky-highlight');
    }

    // Não adicionar highlight se já está selecionado
    if (!target.classList.contains('xtracky-selected')) {
      target.classList.add('xtracky-highlight');
    }
    currentHighlight = target;
  }

  function handleMouseOut(e) {
    const target = e.target;
    if (target.classList) {
      target.classList.remove('xtracky-highlight');
    }
    hideTooltip();
  }

  function handleMouseMove(e) {
    const target = e.target;
    if (target.closest('.xtracky-tooltip')) {
      hideTooltip();
      return;
    }
    // Não mostrar tooltip em modo navegação
    if (getMode() === 'navigate') {
      hideTooltip();
      return;
    }
    showTooltip(target, e);
  }

  function handleClick(e) {
    const target = e.target;

    // Ignorar elementos do XTracky
    if (target.closest('.xtracky-tooltip')) {
      return;
    }

    // Se está em modo navegação, deixar o clique passar normalmente
    if (getMode() === 'navigate') {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    // Toggle seleção
    if (target.classList.contains('xtracky-selected')) {
      // Remover da lista
      target.classList.remove('xtracky-selected');

      // Encontrar elemento para obter info antes de remover
      const removedElement = selectedElements.find(el => el.element === target);
      selectedElements = selectedElements.filter(el => el.element !== target);

      // Notificar painel sobre desseleção
      if (removedElement && parentWindow) {
        parentWindow.postMessage({
          type: 'XTRACKY_ELEMENT_DESELECTED',
          payload: {
            selector: removedElement.selector,
            path: removedElement.path,
            tagName: removedElement.tagName,
          }
        }, '*');
        console.log('[XTracky Config] Elemento desselecionado:', removedElement.path + ':' + removedElement.selector);
      }

      notifySelectionUpdate();
    } else {
      // Adicionar à lista
      target.classList.remove('xtracky-highlight');
      target.classList.add('xtracky-selected');

      const selector = generateSelector(target);
      const newElement = {
        element: target,
        selector: selector,
        path: getCurrentPath(),
        tagName: target.tagName.toLowerCase(),
        text: (target.textContent || '').trim().slice(0, 50),
        classes: Array.from(target.classList).filter(c => !c.startsWith('xtracky')),
        id: target.id || null,
      };
      selectedElements.push(newElement);

      // Notificar painel sobre seleção
      notifySelectionUpdate();
      sendElementToPanel(newElement);
    }
  }

  // Notificar painel sobre mudanças na seleção
  function notifySelectionUpdate() {
    if (parentWindow) {
      parentWindow.postMessage({
        type: 'XTRACKY_SELECTION_UPDATE',
        payload: {
          count: selectedElements.length,
          elements: selectedElements.map(el => ({
            selector: el.selector,
            path: el.path,
            tagName: el.tagName,
            text: el.text,
            id: el.id
          }))
        }
      }, '*');
    }
  }

  // Limpar todas as seleções
  function clearAllSelections() {
    selectedElements.forEach(el => el.element.classList.remove('xtracky-selected'));
    selectedElements = [];
    notifySelectionUpdate();
    console.log('[XTracky Config] Seleções limpas');
  }

  // Comunicação com o painel
  function sendElementToPanel(elementInfo) {
    if (!elementInfo) return;

    if (parentWindow) {
      parentWindow.postMessage({
        type: 'XTRACKY_ELEMENT_SELECTED',
        payload: {
          selector: elementInfo.selector,
          path: elementInfo.path,
          tagName: elementInfo.tagName,
          text: elementInfo.text,
          classes: elementInfo.classes,
          id: elementInfo.id,
        }
      }, '*');
      console.log('[XTracky Config] Elemento enviado para o painel:', elementInfo.path + ':' + elementInfo.selector);
    } else {
      console.log('[XTracky Config] Elemento selecionado (sem painel):', elementInfo);
    }
  }

  function sendToPanel() {
    const elements = selectedElements.map(el => ({
      selector: el.selector,
      path: el.path,
      tagName: el.tagName,
      text: el.text,
      classes: el.classes,
      id: el.id,
    }));

    if (parentWindow) {
      parentWindow.postMessage({
        type: 'XTRACKY_CONFIG_COMPLETE',
        payload: {
          productId: configToken,
          elements: elements
        }
      }, '*');
      console.log('[XTracky Config] Configuração enviada para o painel');
      if (!isInIframe) {
        alert('Configuração enviada! Você pode fechar esta janela.');
      }
    } else {
      console.log('[XTracky Config] Configuração (sem painel):', elements);
      alert('Elementos selecionados:\n\n' + elements.map(e => e.selector).join('\n'));
    }
  }

  // Escutar mensagens do painel
  function setupMessageListener() {
    window.addEventListener('message', function(event) {
      const { type, payload } = event.data || {};

      switch (type) {
        case 'XTRACKY_PING':
          if (parentWindow) {
            parentWindow.postMessage({
              type: 'XTRACKY_PONG',
              payload: { token: configToken }
            }, '*');
            console.log('[XTracky Config] PONG enviado');
          }
          break;

        case 'XTRACKY_HIGHLIGHT_SELECTOR':
          if (payload && payload.selector) {
            const el = document.querySelector(payload.selector);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.classList.add('xtracky-highlight');
              setTimeout(() => el.classList.remove('xtracky-highlight'), 2000);
            }
          }
          break;

        case 'XTRACKY_SET_MODE':
          if (payload && payload.mode) {
            setMode(payload.mode);
          }
          break;

        case 'XTRACKY_CLEAR':
          clearAllSelections();
          break;

        case 'XTRACKY_REMOVE_SELECTION':
          if (payload && payload.selector) {
            // Encontrar e remover a seleção do elemento
            const elementToRemove = selectedElements.find(el => el.selector === payload.selector);
            if (elementToRemove && elementToRemove.element) {
              elementToRemove.element.classList.remove('xtracky-selected');
              selectedElements = selectedElements.filter(el => el.selector !== payload.selector);
              console.log('[XTracky Config] Seleção removida pelo painel:', payload.selector);
            }
          }
          break;

        case 'XTRACKY_SAVE':
          sendToPanel();
          break;
      }
    });
  }

  // Cleanup
  function cleanup() {
    document.removeEventListener('mouseover', handleMouseOver, true);
    document.removeEventListener('mouseout', handleMouseOut, true);
    document.removeEventListener('click', handleClick, true);
    document.removeEventListener('mousemove', handleMouseMove, true);

    const styles = document.getElementById('xtracky-config-styles');
    if (styles) styles.remove();

    if (tooltip) tooltip.remove();

    document.querySelectorAll('.xtracky-highlight, .xtracky-selected').forEach(el => {
      el.classList.remove('xtracky-highlight', 'xtracky-selected');
    });
  }

  // Inicialização
  function init() {
    // Esperar DOM estar pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup);
    } else {
      setup();
    }
  }

  function setup() {
    console.log('[XTracky Config] Inicializando modo configuração...');
    injectStyles();
    createTooltip();
    enableHighlight();
    setupMessageListener();
    setupUrlMonitoring();

    // Notificar painel que está pronto
    if (parentWindow) {
      parentWindow.postMessage({
        type: 'XTRACKY_READY',
        payload: {
          token: configToken,
          url: window.location.href,
          path: window.location.pathname,
          hostname: window.location.hostname
        }
      }, '*');
      console.log('[XTracky Config] READY enviado para o painel');
    }

    console.log('[XTracky Config] Pronto! Clique nos elementos para selecioná-los.');
  }

  init();

})();
