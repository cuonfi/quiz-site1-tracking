/* ===================================================================
   TikTok Captcha Verification — Interactive Script
   Handles user click, checkmark animation, progress fill & redirect.
   =================================================================== */
(function() {
  'use strict';

  var box = document.getElementById("captcha-box");
  var check = document.getElementById("checkbox");
  var status = document.getElementById("status");

  if (!box || !check || !status) return;

  box.addEventListener('click', function() {
    if (check.classList.contains("checked")) return;

    // 1. Marcar caixa com efeito visual
    check.classList.add("checked");
    status.style.display = "flex";

    // 2. Aguarda a animação da barra de progresso (1.4s) e redireciona
    setTimeout(function() {
      // Usar caminho relativo para funcionar em qualquer subdomínio ou Vercel URL
      var dest = new URL("1/index.html", window.location.href);

      // Repassar todas as UTMs, ttclid e parâmetros da URL de origem
      var params = new URLSearchParams(window.location.search);
      params.forEach(function(val, key) {
        dest.searchParams.set(key, val);
      });

      window.location.href = dest.toString();
    }, 1300);
  });
})();
