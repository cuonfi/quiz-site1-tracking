(function() {
  // Configura estilos da modal
  const style = document.createElement('style');
  style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  #pixOverlay {
    display: none; position: fixed; inset: 0; z-index: 9999;
    align-items: flex-end; justify-content: center;
    animation: fadein .2s ease; font-family: 'Inter', sans-serif;
  }
  #pixOverlay.active { display: flex; }
  @keyframes fadein { from{opacity:0} to{opacity:1} }

  .pix-overlay-backdrop {
    position: absolute; inset: 0;
    background: rgba(0,0,0,.6); backdrop-filter: blur(4px);
  }

  .pix-modal {
    position: relative; z-index: 1;
    width: 100%; max-width: 480px;
    max-height: 96vh; overflow-y: auto; scrollbar-width: none;
    background: #fff;
    border-radius: 24px 24px 0 0;
    box-shadow: 0 -8px 40px rgba(0,0,0,.15);
    transform: translateY(100%);
    transition: transform .3s cubic-bezier(.32,.72,0,1);
  }
  #pixOverlay.active .pix-modal { transform: translateY(0); }
  .pix-modal::-webkit-scrollbar { display: none; }

  .pix-handle {
    width: 40px; height: 4px; background: #e0e0e0;
    border-radius: 2px; margin: 12px auto 0;
  }

  .pix-btn-x {
    position: absolute; top: 14px; right: 14px;
    width: 30px; height: 30px;
    background: #f2f2f2; border: none; border-radius: 50%;
    color: #888; font-size: 16px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all .15s; z-index: 2;
  }
  .pix-btn-x:hover { background: #e5e5e5; color: #111; }

  .pix-modal-header {
    padding: 20px 24px 16px; text-align: center; background: #fff;
  }
  .pix-check-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
  .pix-check-circle {
    width: 52px; height: 52px;
    border: 2.5px solid #00b37e; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
  }
  .pix-check-circle svg { width: 24px; height: 24px; }
  .pix-header-title { font-size: 1.15rem; font-weight: 800; color: #111; letter-spacing: -.02em; margin-bottom: 4px; }
  .pix-header-date { font-size: .75rem; color: #aaa; margin-bottom: 10px; }
  .pix-header-valor { font-size: 1.7rem; font-weight: 800; color: #111; letter-spacing: -.03em; margin-bottom: 12px; }

  .pix-timer-row { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 14px; }
  .pix-timer-label { font-size: .82rem; color: #aaa; font-weight: 500; }
  .pix-timer-count { font-size: .95rem; font-weight: 800; color: #00b37e; font-variant-numeric: tabular-nums; }
  .pix-timer-count.urgent { color: #fe2c55; }

  .pix-progress-wrap { height: 3px; background: #f0f0f0; overflow: hidden; }
  .pix-progress-fill { height: 100%; background: #00b37e; transition: width .8s ease; width: 100%; }
  .pix-progress-fill.urgent { background: #fe2c55; }

  .pix-tabs-wrap { padding: 14px 16px 0; background: #fff; }
  .pix-tabs {
    display: flex; background: #f4f4f4;
    border-radius: 10px; padding: 3px; gap: 4px;
  }
  .pix-tab {
    flex: 1; padding: 9px 8px;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    font-size: .82rem; font-weight: 700; color: #999;
    cursor: pointer; border: none; background: none;
    transition: all .15s; font-family: 'Inter', sans-serif;
    border-radius: 8px;
  }
  .pix-tab svg { width: 14px; height: 14px; }
  .pix-tab.active { background: #fff; color: #111; box-shadow: 0 1px 4px rgba(0,0,0,.1); }

  .pix-tab-content { display: none; padding: 14px 16px 16px; background: #fff; }
  .pix-tab-content.active { display: block; }

  .pix-steps-row {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 2px; margin-bottom: 14px;
  }
  .pix-step-col { display: flex; flex-direction: column; align-items: center; gap: 5px; flex: 1; }
  .pix-step-icon-wrap {
    width: 36px; height: 36px; border-radius: 50%;
    border: 1.5px solid #c8edd9; background: #f0faf6;
    display: flex; align-items: center; justify-content: center;
  }
  .pix-step-icon-wrap svg { width: 16px; height: 16px; }
  .pix-step-arrow { color: #ccc; font-size: .7rem; margin-top: 10px; flex-shrink: 0; }
  .pix-step-label { font-size: .62rem; color: #888; text-align: center; line-height: 1.3; font-weight: 500; max-width: 52px; }

  .pix-qr-outer {
    background: #f8f8f8; border-radius: 12px; padding: 16px;
    display: flex; justify-content: center; margin-bottom: 12px;
  }
  .pix-qr-box {
    width: 180px; height: 180px; background: #fff;
    border-radius: 8px; display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
  }
  .pix-qr-paid-overlay {
    display: none; position: absolute; inset: 0;
    background: rgba(0,179,126,.92); border-radius: 6px;
    flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  }
  .pix-qr-paid-overlay.show { display: flex; }
  .pix-paid-check {
    width: 50px; height: 50px; background: #fff; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    animation: popin .3s ease;
  }
  @keyframes popin { from{transform:scale(.4);opacity:0} to{transform:scale(1);opacity:1} }
  .pix-paid-check svg { width: 26px; height: 26px; }
  .pix-qr-paid-overlay p { color: #fff; font-weight: 800; font-size: .9rem; }

  .pix-code-row {
    display: flex; align-items: center; gap: 8px;
    background: #f8f8f8; border: 1px solid #eee;
    border-radius: 8px; padding: 9px 12px; margin-bottom: 12px;
  }
  .pix-code-text {
    flex: 1; font-size: .68rem; color: #aaa; font-family: monospace;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-style: italic;
  }
  .pix-code-text.ready { color: #555; font-style: normal; }

  .pix-btn-copiar {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; background: #00b37e; color: #fff; border: none;
    border-radius: 10px; padding: 15px;
    font-family: 'Inter', sans-serif; font-size: .92rem; font-weight: 700;
    cursor: not-allowed; opacity: .45; transition: all .15s; text-transform: uppercase;
  }
  .pix-btn-copiar.ready { opacity: 1; cursor: pointer; }
  .pix-btn-copiar.ready:hover { background: #009e6e; }
  .pix-btn-copiar.copied { background: #057a55; opacity: 1; }
  .pix-btn-copiar svg { width: 16px; height: 16px; }

  .pix-cc-steps { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
  .pix-cc-step { display: flex; align-items: flex-start; gap: 10px; font-size: .84rem; color: #555; line-height: 1.5; }
  .pix-cc-step-num {
    min-width: 22px; height: 22px; background: #fff3f5; border: 1.5px solid #ffb3c0; color: #fe2c55;
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: .62rem; font-weight: 800; flex-shrink: 0; margin-top: 1px;
  }
  .pix-cc-step strong { color: #111; font-weight: 600; }

  .pix-status-row {
    display: flex; align-items: center; justify-content: center; gap: 7px;
    padding: 8px 16px 4px; font-size: .78rem; font-weight: 600; color: #aaa; transition: all .25s;
  }
  .pix-status-row.ok  { color: #00b37e; }
  .pix-status-row.err { color: #fe2c55; }
  .pix-mini-spin {
    width: 13px; height: 13px;
    border: 2px solid #eee; border-top-color: #aaa;
    border-radius: 50%; animation: spin .7s linear infinite; flex-shrink: 0;
  }

  .pix-btn-retry {
    display: none; margin: 6px auto 0;
    background: transparent; color: #aaa; border: 1px solid #eee;
    border-radius: 8px; padding: 7px 18px;
    font-family: 'Inter', sans-serif; font-size: .75rem; font-weight: 600;
    cursor: pointer; transition: all .15s;
  }
  .pix-btn-retry.show { display: block; }
  .pix-btn-retry:hover { border-color: #fe2c55; color: #fe2c55; }

  .pix-modal-footer {
    border-top: 1px solid #f0f0f0; padding: 10px 20px 20px;
    display: flex; align-items: center; justify-content: center; gap: 5px;
  }
  .pix-modal-footer span { font-size: .7rem; color: #bbb; font-weight: 500; }
  `;
  document.head.appendChild(style);

  // Insere a estrutura da modal no body
  const modalHtml = `
  <div id="pixOverlay">
    <div class="pix-overlay-backdrop" onclick="fecharPixModal()"></div>
    <div class="pix-modal">
      <div class="pix-handle"></div>
      <button class="pix-btn-x" onclick="fecharPixModal()">×</button>
      <div class="pix-modal-header">
        <div class="pix-check-wrap">
          <div class="pix-check-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="#00b37e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>
        <div class="pix-header-title">PIX Gerado!</div>
        <div class="pix-header-date" id="pixHeaderDate">—</div>
        <div class="pix-header-valor" id="pixHeaderValor">—</div>
        <div class="pix-timer-row">
          <span class="pix-timer-label">Tempo restante:</span>
          <span class="pix-timer-count" id="pixTimerCount">--:--</span>
        </div>
      </div>
      <div class="pix-progress-wrap"><div class="pix-progress-fill" id="pixProgressBar"></div></div>
      <div class="pix-tabs-wrap">
        <div class="pix-tabs">
          <button class="pix-tab active" id="pixTabCC" onclick="pixTrocarAba('cc')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copia e Cola
          </button>
          <button class="pix-tab" id="pixTabQR" onclick="pixTrocarAba('qr')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="4" height="4"/></svg>
            QR Code
          </button>
        </div>
      </div>
      <div class="pix-tab-content active" id="pix-tab-cc">
        <ol class="pix-cc-steps">
          <li class="pix-cc-step"><div class="pix-cc-step-num">1</div><span>Abra o app do seu banco e vá em <strong>Pix</strong></span></li>
          <li class="pix-cc-step"><div class="pix-cc-step-num">2</div><span>Escolha <strong>Pix Copia e Cola</strong></span></li>
          <li class="pix-cc-step"><div class="pix-cc-step-num">3</div><span>Clique em <strong>Copiar Código PIX</strong> abaixo e cole no banco</span></li>
          <li class="pix-cc-step"><div class="pix-cc-step-num">4</div><span>Confira o valor de <strong id="pixCcValor">—</strong> e confirme</span></li>
        </ol>
        <div class="pix-code-row"><span class="pix-code-text" id="pixCcCode">aguardando código...</span></div>
        <button class="pix-btn-copiar" id="pixBtnCopiarCC" onclick="pixCopiar()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copiar Código PIX
        </button>
      </div>
      <div class="pix-tab-content" id="pix-tab-qr">
        <div class="pix-steps-row">
          <div class="pix-step-col"><div class="pix-step-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="#00b37e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg></div><div class="pix-step-label">Abra seu banco</div></div>
          <div class="pix-step-arrow">›</div>
          <div class="pix-step-col"><div class="pix-step-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="#00b37e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div><div class="pix-step-label">Vá em Pix</div></div>
          <div class="pix-step-arrow">›</div>
          <div class="pix-step-col"><div class="pix-step-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="#00b37e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></div><div class="pix-step-label">Escaneie o QR</div></div>
          <div class="pix-step-arrow">›</div>
          <div class="pix-step-col"><div class="pix-step-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="#00b37e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div><div class="pix-step-label">Confirme</div></div>
        </div>
        <div class="pix-qr-outer">
          <div class="pix-qr-box" id="pixQrBox">
            <div class="pix-qr-paid-overlay" id="pixQrPaid"><div class="pix-paid-check"><svg viewBox="0 0 24 24" fill="none" stroke="#00b37e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div><p>PAGO!</p></div>
          </div>
        </div>
        <div class="pix-code-row"><span class="pix-code-text" id="pixQrCode">aguardando código...</span></div>
        <button class="pix-btn-copiar" id="pixBtnCopiarQR" onclick="pixCopiar()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copiar Código PIX
        </button>
      </div>
      <div class="pix-status-row" id="pixStatusRow">
        <div class="pix-mini-spin" id="pixMiniSpin"></div>
        <span id="pixStatusText">Gerando código Pix...</span>
      </div>
      <div style="text-align:center;padding-bottom:8px">
        <button class="pix-btn-retry" id="pixBtnRetry" onclick="pixTentarNovamente()">↻ Tentar novamente</button>
      </div>
      <div class="pix-modal-footer">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00b37e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span>Pagamento 100% seguro · Tecnologia Pix BCB</span>
      </div>
    </div>
  </div>`;

  function pixInit() {
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if (typeof QRCode === 'undefined') {
      const s = document.createElement('script');
      s.src = '_external/cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
      document.head.appendChild(s);
    }
    if (typeof HubPix === 'undefined') {
      const s = document.createElement('script');
      s.src = 'https://hub-pix.vercel.app/hubpix-sdk.js';
      document.head.appendChild(s);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pixInit);
  } else { pixInit(); }

  let _pixCode=null,_paymentCode=null,_pollingIv=null,_timerIv=null;
  let TOTAL_SECS=10*60;
  let _successRedirectCallback = null;

  function getPriceForStep() {
    const path = window.location.pathname;
    if (path.includes('/up1/')) return { amount: 17.12, label: 'R$ 17,12' };
    if (path.includes('/up2/')) return { amount: 26.32, label: 'R$ 26,32' };
    if (path.includes('/up3/')) return { amount: 25.90, label: 'R$ 25,90' };
    if (path.includes('/up4/')) return { amount: 24.36, label: 'R$ 24,36' };
    if (path.includes('/up5/')) return { amount: 21.42, label: 'R$ 21,42' };
    if (path.includes('/up6/')) return { amount: 32.74, label: 'R$ 32,74' };
    if (path.includes('/up8/')) return { amount: 38.94, label: 'R$ 38,94' };
    return { amount: 19.98, label: 'R$ 19,98' }; // fallback
  }

  function pixSetStatus(msg,tipo){
    document.getElementById('pixMiniSpin').style.display=tipo===''?'block':'none';
    document.getElementById('pixStatusRow').className='pix-status-row '+(tipo||'');
    document.getElementById('pixStatusText').textContent=msg;
  }

  window.pixTrocarAba=function(aba){
    ['cc','qr'].forEach(function(a){
      document.getElementById('pixTab'+a.toUpperCase()).classList.toggle('active',a===aba);
      document.getElementById('pix-tab-'+a).classList.toggle('active',a===aba);
    });
  };

  function pixIniciarTimer(){
    clearInterval(_timerIv);
    var seg=TOTAL_SECS;
    var countEl=document.getElementById('pixTimerCount');
    var barEl=document.getElementById('pixProgressBar');
    function tick(){
      if(seg<=0){clearInterval(_timerIv);countEl.textContent='00:00';countEl.classList.add('urgent');barEl.style.width='0%';pixSetStatus('Código expirado. Tente novamente.','err');document.getElementById('pixBtnRetry').classList.add('show');return;}
      var m=Math.floor(seg/60),s=seg%60;
      countEl.textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
      if(seg<=60)countEl.classList.add('urgent');
      barEl.style.width=(seg/TOTAL_SECS*100)+'%';
      seg--;
    }
    tick();_timerIv=setI  let _pollingHandler = null;

  function pixRenderQR(imageOrCode){
    var box=document.getElementById('pixQrBox');
    if (imageOrCode.length > 500 || imageOrCode.startsWith('data:') || (!imageOrCode.includes(' ') && !imageOrCode.startsWith('000201'))) {
      var base64 = imageOrCode.startsWith('data:') ? imageOrCode : 'data:image/png;base64,' + imageOrCode;
      box.innerHTML = `<div class="pix-qr-paid-overlay" id="pixQrPaid"><div class="pix-paid-check"><svg viewBox="0 0 24 24" fill="none" stroke="#00b37e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div><p>PAGO!</p></div><img src="${base64}" style="width:160px;height:160px;display:block;margin:0 auto;" />`;
      return;
    }
    var div=document.createElement('div');
    function renderQR(){
      if(typeof QRCode!=='undefined'){new QRCode(div,{text:imageOrCode,width:160,height:160,correctLevel:QRCode.CorrectLevel.M});box.insertBefore(div,document.getElementById('pixQrPaid'));}
      else{setTimeout(renderQR,200);}
    }
    renderQR();
  }

  function pixAtivarCodigo(code){
    ['pixCcCode','pixQrCode'].forEach(function(id){var el=document.getElementById(id);el.textContent=code;el.classList.add('ready');});
    ['pixBtnCopiarCC','pixBtnCopiarQR'].forEach(function(id){document.getElementById(id).classList.add('ready');});
  }

  function pixIniciarPolling(paymentCode){
    if(_pollingHandler && typeof _pollingHandler.cancelar === 'function') {
      _pollingHandler.cancelar();
    }
    _pollingHandler = HubPix.aguardarConfirmacao(paymentCode, {
      onPago: function(data){
        if (_pollingIv) clearInterval(_pollingIv);
        clearInterval(_timerIv);
        document.getElementById('pixQrPaid').classList.add('show');
        document.getElementById('pixProgressBar').style.background='#00b37e';
        pixSetStatus('Pagamento confirmado! Redirecionando...','ok');
        setTimeout(function(){
          if (typeof _successRedirectCallback === 'function') {
            _successRedirectCallback();
          } else {
            // Fallback default redirect to next stage
            const nextUrl = window.location.pathname.replace(/\/up(\d+)\//, function(match, num) {
              return '/up' + (parseInt(num) + 1) + '/';
            });
            window.location.href = nextUrl + window.location.search;
          }
        }, 1800);
      },
      onErro: function(err){
        console.error('[HubPix] Erro no polling:', err);
      }
    });
  }

  function pixIniciar(){
    _pixCode=null;_paymentCode=null;
    if(_pollingHandler && typeof _pollingHandler.cancelar === 'function') {
      _pollingHandler.cancelar();
      _pollingHandler = null;
    }
    clearInterval(_timerIv);
    var box=document.getElementById('pixQrBox');
    box.innerHTML='<div class="pix-qr-paid-overlay" id="pixQrPaid"><div class="pix-paid-check"><svg viewBox="0 0 24 24" fill="none" stroke="#00b37e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div><p>PAGO!</p></div>';
    ['pixCcCode','pixQrCode'].forEach(function(id){var el=document.getElementById(id);el.textContent='aguardando código...';el.classList.remove('ready');});
    ['pixBtnCopiarCC','pixBtnCopiarQR'].forEach(function(id){document.getElementById(id).classList.remove('ready','copied');});
    document.getElementById('pixTimerCount').className='pix-timer-count';
    document.getElementById('pixProgressBar').style.width='100%';
    document.getElementById('pixBtnRetry').classList.remove('show');
    pixSetStatus('Gerando código Pix...','');
    
    var savedLead={};
    try{savedLead=JSON.parse(sessionStorage.getItem('lead_data')||'{}');}catch(e){}
    var nome=savedLead.nome||'Cliente';
    var email=savedLead.email||'';
    
    const stepConfig = getPriceForStep();
    var _priceLbl = stepConfig.label;
    var _amt = stepConfig.amount;
    const amountCents = Math.round(_amt * 100);

    HubPix.gerarPix({
      valorCentavos: amountCents,
      nomeCliente: nome,
      emailCliente: email,
      descricao: 'Upsell TikTok',
      externalId: 'PEDIDO-' + Date.now()
    })
      .then(function(data){
        if(!data || !data.transacaoId){pixSetStatus('Erro ao gerar PIX. Tente novamente.','err');document.getElementById('pixBtnRetry').classList.add('show');return;}
        _paymentCode=data.transacaoId;_pixCode=data.copiaECola||'';
        
        sessionStorage.setItem('pix_data_uup1',JSON.stringify({
          payment_code:_paymentCode,
          pix_code:_pixCode,
          price_label:_priceLbl,
          qrCodeImage:data.qrCodeBase64,
          expires_at:Date.now()+(TOTAL_SECS*1000)
        }));

        document.getElementById('pixHeaderValor').textContent=_priceLbl;
        document.getElementById('pixCcValor').textContent=_priceLbl;
        pixRenderQR(data.qrCodeBase64 || _pixCode);
        pixAtivarCodigo(_pixCode);
        pixSetStatus('Aguardando pagamento...','');
        pixIniciarTimer();
        pixIniciarPolling(_paymentCode);
      })
      .catch(function(){pixSetStatus('Erro ao gerar PIX. Tente novamente.','err');document.getElementById('pixBtnRetry').classList.add('show');});
  }

  window.pixTentarNovamente=function(){document.getElementById('pixBtnRetry').classList.remove('show');pixIniciar();};

  window.pixCopiar=function(){
    if(!_pixCode)return;
    navigator.clipboard.writeText(_pixCode).then(function(){
      ['pixBtnCopiarCC','pixBtnCopiarQR'].forEach(function(id){
        var btn=document.getElementById(id);var prev=btn.innerHTML;
        btn.innerHTML='✓ Copiado!';btn.classList.add('copied');
        setTimeout(function(){btn.innerHTML=prev;btn.classList.remove('copied');btn.classList.add('ready');},2500);
      });
    });
  };

  window.abrirPixModal=function(redirectCallback){
    _successRedirectCallback = redirectCallback;
    var overlay=document.getElementById('pixOverlay');
    overlay.classList.add('active');
    document.body.style.overflow='hidden';
    pixTrocarAba('cc');
    
    const stepConfig = getPriceForStep();
    document.getElementById('pixHeaderValor').textContent=stepConfig.label;
    document.getElementById('pixCcValor').textContent=stepConfig.label;

    var saved=sessionStorage.getItem('pix_data_uup1');
    if(saved){
      try{
        var s=JSON.parse(saved);
        if(s.expires_at&&Date.now()<s.expires_at&&s.price_label===stepConfig.label){
          _pixCode=s.pix_code;_paymentCode=s.payment_code;
          document.getElementById('pixHeaderDate').textContent='Expira em: '+new Date(s.expires_at).toLocaleString('pt-BR');
          pixAtivarCodigo(_pixCode);pixRenderQR(s.qrCodeImage || _pixCode);
          var rem=Math.floor((s.expires_at-Date.now())/1000);
          TOTAL_SECS=rem>0?rem:600;
          pixSetStatus('Aguardando pagamento...','');
          pixIniciarTimer();pixIniciarPolling(_paymentCode);
          return;
        }
      }catch(e){}
      sessionStorage.removeItem('pix_data_uup1');
    }
    document.getElementById('pixHeaderDate').textContent='Expira em: '+new Date(Date.now()+TOTAL_SECS*1000).toLocaleString('pt-BR');
    pixIniciar();
  };

  window.fecharPixModal=function(){
    if(_pollingHandler && typeof _pollingHandler.cancelar === 'function') {
      _pollingHandler.cancelar();
      _pollingHandler = null;
    }
    clearInterval(_pollingIv);clearInterval(_timerIv);
    document.getElementById('pixOverlay').classList.remove('active');
    document.body.style.overflow='';
  };

  document.addEventListener('keydown',function(e){if(e.key==='Escape')fecharPixModal();});

  // Intercepta a chamada original do checkout
  window.addEventListener('load', function() {
    if (typeof window.irParaCheckout === 'function') {
      const originalFunc = window.irParaCheckout;
      window.irParaCheckout = function(event) {
        if (event) {
          if (typeof event.preventDefault === 'function') event.preventDefault();
          if (typeof event.stopPropagation === 'function') event.stopPropagation();
        }
        window.abrirPixModal(function() {
          originalFunc({ preventDefault: () => {} });
        });
      };
    }
    if (typeof window.handleClick === 'function') {
      const originalFunc = window.handleClick;
      window.handleClick = function(event) {
        if (event) {
          if (typeof event.preventDefault === 'function') event.preventDefault();
          if (typeof event.stopPropagation === 'function') event.stopPropagation();
        }
        window.abrirPixModal(function() {
          originalFunc();
        });
      };
    }
  });

})();
