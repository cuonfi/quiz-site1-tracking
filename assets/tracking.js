/* ===================================================================
   TTKPay — Back-Redirect (compartilhado por todas as páginas)
   Back-Redirect: ao apertar "voltar", envia o usuário para /back/
   preservando a query string. Não dispara na própria /back/.
   =================================================================== */
(function () {
  'use strict';

  // Domínio principal do funil.
  var BACK_REDIRECT_URL = '/back/index.html';

  // Pula o back-redirect genérico se:
  //  - a página já tem seu próprio handler popstate (flag __TTK_HAS_BACKREDIRECT), ou
  //  - estamos na própria /back/ (evita loop).
  if (window.__TTK_HAS_BACKREDIRECT) return;
  if (location.pathname.indexOf('/back') !== -1) return;

  (function setBackRedirect(url) {
    var dest = url.trim() +
      (url.indexOf('?') > 0 ? '&' : '?') +
      document.location.search.replace('?', '').toString();

    history.pushState({}, '', location.href);
    history.pushState({}, '', location.href);
    history.pushState({}, '', location.href);

    window.addEventListener('popstate', function () {
      setTimeout(function () {
        location.href = dest;
      }, 1);
    });
  })(BACK_REDIRECT_URL);
})();
