
  const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const LISTAS = {
    bandeiras: ["VISA","MASTERCARD","ELO","HIPERCARD","AMERICAN EXPRESS"],
    bancos: ["NUBANK","INTER","MERCADO PAGO","MERCADO LIVRE","PICPAY","C6 BANK","CAIXA","BANCO DO BRASIL","BRADESCO","ITAU","SANTANDER","BANCO DO NORDESTE","PAGBANK"],
    motivos: ["VALOR ERRADO NO CAIXA","DEFEITO RECORRENTE","PRODUTO INDISPONIVEL","DESISTENCIA (AUTORIZADO GERENCIA)"]
  };
  const $ = id => document.getElementById(id);
  const val = id => $(id).value.trim();
  const guarda = {
    get(k){ try { return localStorage.getItem("r7est_" + k); } catch(e){ return null; } },
    set(k, v){ try { localStorage.setItem("r7est_" + k, v); } catch(e){} }
  };
  let forma = "";       // "esp" | "pix" | "cartao" | "ted" | ""
  let tipoChave = "";

  // ---------- máscaras ----------
  function maiusculo(el){ const p = el.selectionStart; el.value = el.value.toUpperCase(); try { el.setSelectionRange(p, p); } catch(e){} }
  function mascDoc(el){
    let d = el.value.replace(/\D/g, "").slice(0, 14);
    if (d.length <= 11) d = d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    else d = d.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
    el.value = d;
  }
  // CPF ou CNPJ do cliente, conforme o botão escolhido (não passa do tamanho certo)
  let tipoDoc = "cpf";
  function mascCpf(el){
    el.value = el.value.replace(/\D/g, "").slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  function mascCnpj(el){
    el.value = el.value.replace(/\D/g, "").slice(0, 14).replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
  }
  function mascDocCliente(el){ (tipoDoc === "cnpj" ? mascCnpj : mascCpf)(el); }
  function escolheDoc(t){
    tipoDoc = t;
    $("chaveDoc").setAttribute("aria-checked", t === "cnpj");
    $("lblDoc").textContent = t === "cnpj" ? "CNPJ" : "CPF";
    $("cpf").placeholder = t === "cnpj" ? "00.000.000/0000-00" : "000.000.000-00";
    mascDocCliente($("cpf"));
  }
  function mascTel(el){
    let d = el.value.replace(/\D/g, "").slice(0, 11);
    if (d.length > 10) d = d.replace(/^(\d{2})(\d)(\d{4})(\d{0,4}).*/, "($1)$2 $3-$4");
    else if (d.length > 6) d = d.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1)$2-$3");
    else if (d.length > 2) d = d.replace(/^(\d{2})(\d*)/, "($1)$2");
    el.value = d;
  }
  function mascMoeda(el){
    let d = el.value.replace(/\D/g, "");
    if (!d) { el.value = ""; return; }
    let [i, c] = (parseInt(d, 10) / 100).toFixed(2).split(".");
    el.value = i.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + c;
  }
  function soNumero(el){ el.value = el.value.replace(/\D/g, ""); }
  // só letras (com acento) e espaço; o motivo aceita também ( ) / -
  function soLetras(el){ el.value = el.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ ]/g, "").replace(/ {2,}/g, " "); maiusculo(el); }
  function soLetrasMotivo(el){ el.value = el.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ ()\/-]/g, ""); maiusculo(el); }
  // data: só aceita dígitos que ainda possam formar uma data válida (e nunca no futuro)
  function prefixoValido(d){
    const n = d.length;
    if (n >= 1 && +d[0] > 3) return false;
    if (n >= 2) { const dia = +d.slice(0, 2); if (dia < 1 || dia > 31) return false; }
    if (n >= 3 && +d[2] > 1) return false;
    if (n >= 4) { const mes = +d.slice(2, 4); if (mes < 1 || mes > 12) return false;
      if (+d.slice(0, 2) > [31,29,31,30,31,30,31,31,30,31,30,31][mes - 1]) return false; }
    if (n >= 5 && d[4] !== "2") return false;
    if (n >= 6 && d[5] !== "0") return false;
    if (n === 8) { const dia = +d.slice(0, 2), mes = +d.slice(2, 4), ano = +d.slice(4);
      const dt = new Date(ano, mes - 1, dia);
      if (dt.getDate() !== dia || dt > new Date()) return false; }
    return true;
  }
  function mascData(el){
    let ok = "";
    for (const c of el.value.replace(/\D/g, "").slice(0, 8)) if (prefixoValido(ok + c)) ok += c;
    el.value = ok.replace(/(\d{2})(\d)/, "$1/$2").replace(/(\d{2})(\d)/, "$1/$2");
  }
  function dataOk(avisar){
    const el = $("dataVenda"), ok = el.value === "" || el.value.length === 10;
    el.classList.toggle("erro", !ok);
    if (!ok && avisar) { alert("A data da venda está incompleta. Use dd/mm/aaaa."); el.focus(); }
    return ok;
  }
  const MASCARAS = { telefone: mascTel, cpf: mascDocCliente, favDoc: mascDoc, vTotal: mascMoeda, vCanc: mascMoeda,
    dataVenda: mascData, codigo: soNumero, cartao: soNumero, ag: soNumero, nf: soNumero,
    cliente: soLetras, fav: soLetras, motivo: soLetrasMotivo };

  // ---------- folha A4 ----------
  function dataExtenso(){ const d = new Date(); return d.getDate() + " de " + MESES[d.getMonth()] + " de " + d.getFullYear(); }
  function dados(){
    const d = {};
    document.querySelectorAll(".campos input").forEach(i => d[i.id] = i.value.trim());
    d.pix = forma === "pix" ? d.pix : "";
    d.pixBancoTxt = forma === "pix" && d.pixBanco ? "BANCO: " + d.pixBanco : "";
    d.dataExt = dataExtenso();
    if (forma !== "ted") ["banco","ag","cc","fav","favDoc"].forEach(k => d[k] = "");
    return d;
  }
  function preenche(page, d){
    page.querySelectorAll("[data-f]").forEach(el => el.textContent = d[el.dataset.f] || "");
    page.querySelectorAll("[data-x]").forEach(el => el.textContent = el.dataset.x === forma ? "( X )" : "(   )");
    page.classList.toggle("com-ted", forma === "ted");
    page.classList.toggle("com-cartao", forma === "cartao");
  }
  function novaFolha(){ return $("modeloFolha").content.firstElementChild.cloneNode(true); }

  // versão sem prévia: a folha só é montada para imprimir e baixar
  function escala(){}

  function atualiza(){
    const d = dados();
    const t = parseFloat((d.vTotal || "0").replace(/\./g, "").replace(",", ".")) || 0;
    const c = parseFloat((d.vCanc || "0").replace(/\./g, "").replace(",", ".")) || 0;
    $("avisoValor").classList.toggle("on", t > 0 && c > t);
    const pronta = d.cliente && d.nf && d.dataVenda.length === 10 && d.vCanc && forma;
    $("status").textContent = pronta ? "Pronta" : "Preencha os dados";
    $("status").classList.toggle("pronta", !!pronta);
    $("nota").textContent = "Data da declaração: hoje, " + new Date().toLocaleDateString("pt-BR");
  }

  // ---------- eventos dos campos ----------
  document.querySelectorAll(".campos input").forEach(inp => {
    inp.addEventListener("input", () => {
      if (MASCARAS[inp.id]) MASCARAS[inp.id](inp);
      else if (inp.classList.contains("mai")) maiusculo(inp);
      if (inp.id === "dataVenda") inp.classList.remove("erro");
      if (inp.dataset.salvar) guarda.set(inp.dataset.salvar, inp.value);
      if (inp.id === "bandeira") marcaCartao();
      atualiza();
      requestAnimationFrame(escala);
    });
  });
  $("dataVenda").addEventListener("blur", () => setTimeout(() => dataOk(false), 150));

  // forma de devolução (escolhe uma; clicar de novo desmarca)
  document.querySelectorAll("[data-forma]").forEach(b => b.addEventListener("click", () => {
    escolheForma(forma === b.dataset.forma ? "" : b.dataset.forma);
    if (forma === "ted") $("banco").focus();
  }));
  // escolheu a bandeira do cartão: marca "Cartão" na forma de devolução sozinho
  function marcaCartao(){ if (val("bandeira") && forma !== "cartao") escolheForma("cartao"); }
  function escolheForma(f){
    if (forma === "pix" && f !== "pix") { $("pix").value = ""; $("pixBanco").value = ""; marcaChave(""); }
    if (forma === "ted" && f !== "ted") ["banco","ag","cc","fav","favDoc"].forEach(id => $(id).value = "");
    // Espécie, PIX ou TED: apaga os dados do cartão (bandeira e 4 últimos números)
    if (f === "esp" || f === "pix" || f === "ted") { $("bandeira").value = ""; $("cartao").value = ""; }
    forma = f;
    if (f) { document.querySelector('[aria-label="Forma de devolução"]').classList.remove("erro"); }
    document.querySelectorAll("[data-forma]").forEach(b => b.setAttribute("aria-pressed", b.dataset.forma === f));
    $("blocoPix").classList.toggle("on", f === "pix");
    $("blocoTed").classList.toggle("on", f === "ted");
    document.body.classList.toggle("forma-extra", f === "pix" || f === "ted");
    requestAnimationFrame(escala);
    $("msgPix").textContent = "";
    atualiza();
  }

  // tipo de chave PIX
  function marcaChave(t){
    tipoChave = t;
    document.querySelectorAll("[data-chave]").forEach(b => b.setAttribute("aria-pressed", b.dataset.chave === t));
  }
  document.querySelectorAll("[data-chave]").forEach(b => b.addEventListener("click", () => {
    const t = b.dataset.chave, pix = $("pix"), msg = $("msgPix");
    marcaChave(t); msg.textContent = "";
    const doc = val("cpf"), dig = doc.replace(/\D/g, "");
    if (t === "cpf") {
      pix.placeholder = "000.000.000-00";
      if (dig.length === 11) pix.value = doc; else { pix.value = ""; msg.textContent = dig ? "O CPF/CNPJ do cliente não é um CPF. Digite a chave aqui." : "Preencha o CPF do cliente no bloco 1 ou digite aqui."; pix.focus(); }
    } else if (t === "cnpj") {
      pix.placeholder = "00.000.000/0000-00";
      if (dig.length === 14) pix.value = doc; else { pix.value = ""; pix.focus(); }
    } else if (t === "tel") {
      pix.placeholder = "(85) 9 0000-0000";
      if (val("telefone")) pix.value = val("telefone"); else { pix.value = ""; msg.textContent = "Preencha o telefone do cliente no bloco 1 ou digite aqui."; pix.focus(); }
    } else {
      pix.placeholder = "email@exemplo.com"; pix.value = ""; pix.focus();
    }
    if (pix.value && !val("pixBanco")) $("pixBanco").focus();
    atualiza();
  }));
  $("pix").addEventListener("input", () => {
    const pix = $("pix");
    if (tipoChave === "cpf" || tipoChave === "cnpj") mascDoc(pix);
    else if (tipoChave === "tel") mascTel(pix);
    else if (tipoChave !== "email") maiusculo(pix);
    atualiza();
  }, true);

  // ---------- janelas ----------
  function abrir(id){ $(id).classList.add("aberto"); document.body.style.overflow = "hidden"; if (id === "confNovo") setTimeout(() => $("btSimNovo").focus(), 30); }
  function fechar(id){ $(id).classList.remove("aberto"); if (!document.querySelector(".fundo.aberto")) document.body.style.overflow = ""; }
  document.querySelectorAll(".fundo").forEach(f => f.addEventListener("click", e => { if (e.target === f || f.id === "zoom") fechar(f.id); }));
  document.addEventListener("keydown", e => { if (e.key === "Escape") document.querySelectorAll(".fundo.aberto").forEach(f => fechar(f.id)); });

  function limparTudo(){
    fechar("confNovo");
    document.querySelectorAll("input.limpa").forEach(i => { i.value = ""; i.classList.remove("erro"); });
    escolheForma(""); marcaChave(""); escolheDoc("cpf");
    document.querySelectorAll(".erro").forEach(e => e.classList.remove("erro"));
    window.scrollTo({ top: 0, behavior: "smooth" });
    $("cliente").focus();
    atualiza();
  }

  // ---------- imprimir (sempre 2 vias) ----------
  // as 2 vias ficam montadas desde o início (escondidas), assim a logo já está carregada na hora de imprimir
  const vias = [novaFolha(), novaFolha()];
  vias.forEach(f => $("impressao").appendChild(f));
  function montaImpressao(){ const d = dados(); vias.forEach(f => preenche(f, d)); }
  window.addEventListener("beforeprint", montaImpressao);
  // Ctrl+P também passa pela conferência dos campos (antes imprimia mesmo faltando dados)
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "P")) { e.preventDefault(); imprimir(); }
  });
  // ---------- campos obrigatórios: ao imprimir/baixar, o que faltar fica vermelho ----------
  function faltando(){
    const f = [];
    const req = (id, ok) => { if (!ok) f.push($(id)); };
    req("cliente", val("cliente").length >= 3);
    req("codigo", val("codigo"));
    req("telefone", val("telefone").replace(/\D/g, "").length >= 10);
    req("cpf", val("cpf").replace(/\D/g, "").length === (tipoDoc === "cnpj" ? 14 : 11));
    req("nf", val("nf"));
    req("dataVenda", val("dataVenda").length === 10);
    req("vTotal", val("vTotal"));
    req("vCanc", val("vCanc"));
    req("motivo", val("motivo"));
    if (forma === "cartao") { req("bandeira", val("bandeira")); req("cartao", val("cartao").length === 4); }
    if (forma === "pix") { req("pix", val("pix")); req("pixBanco", val("pixBanco")); }
    if (forma === "ted") ["banco","ag","cc","fav"].forEach(id => req(id, val(id))), req("favDoc", val("favDoc").replace(/\D/g, "").length >= 11);
    return f;
  }
  function confere(){
    document.querySelectorAll(".erro").forEach(e => e.classList.remove("erro"));
    const f = faltando();
    const grupo = document.querySelector('[aria-label="Forma de devolução"]');
    if (!forma) grupo.classList.add("erro");
    if (!f.length && forma) return true;
    f.forEach(i => i.classList.add("erro"));
    const primeiro = f[0] || grupo;
    primeiro.scrollIntoView({ behavior: "smooth", block: "center" });
    if (f[0]) setTimeout(() => f[0].focus({ preventScroll: true }), 250);
    return false;
  }
  // ao corrigir, o vermelho sai na hora
  document.addEventListener("input", e => {
    if (e.target.classList && e.target.classList.contains("erro")) { e.target.classList.remove("erro"); atualizaAviso(); }
  });
  function atualizaAviso(){}

  async function imprimir(){
    if (!confere()) return;
    montaImpressao();
    // espera as imagens (logo e marca d'água) estarem prontas antes de abrir a impressão
    const imgs = [...$("impressao").querySelectorAll("img")];
    await Promise.all(imgs.map(i => (i.complete ? (i.decode ? i.decode().catch(() => {}) : null) : new Promise(r => { i.onload = i.onerror = r; }))));
    setTimeout(() => window.print(), 50);
  }

  // ---------- baixar ----------
  function abrirBaixar(){ if (confere()) abrir("escBaixar"); }
  function nomeArquivo(ext){
    const nome = (val("cliente") || "cliente").replace(/[^A-Z0-9À-Ú ]/gi, "").replace(/\s+/g, "-");
    const nf = val("nf").replace(/[^0-9A-Za-z-]/g, "");
    return "estorno-" + nome + (nf ? "-" + nf : "") + "." + ext;
  }
  function carregaScript(src){
    return new Promise((ok, erro) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = erro; document.head.appendChild(s); });
  }
  function ocupado(sim){
    const b = $("btBaixar"); b.disabled = sim;
    b.querySelector("span").textContent = sim ? "Gerando..." : "Baixar PDF / Word";
  }
  async function baixarPDF(){
    ocupado(true);
    const caixa = document.createElement("div"); caixa.className = "exportando";
    const f = novaFolha(); preenche(f, dados()); caixa.appendChild(f); document.body.appendChild(caixa);
    try {
      if (!window.html2canvas) await carregaScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
      if (!window.jspdf) await carregaScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      const canvas = await html2canvas(f, { scale: 2, backgroundColor: "#ffffff", width: f.offsetWidth, height: f.offsetHeight });
      const pdf = new jspdf.jsPDF({ unit: "mm", format: "a4" });
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 210, 297);
      pdf.save(nomeArquivo("pdf"));
    } catch (e) {
      alert("Não foi possível gerar o PDF. Verifique a internet e tente de novo.");
    } finally { caixa.remove(); ocupado(false); }
  }
  async function baixarWord(){
    ocupado(true);
    try {
      if (!window.docx) await carregaScript("https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js");
      const D = window.docx, d = dados();
      const r = (t, o = {}) => new D.TextRun({ text: t, font: "Arial", size: o.size || 22, bold: o.bold, italics: o.italics, color: o.color });
      const borda = { style: D.BorderStyle.SINGLE, size: 8, color: "222222" };
      const bordas = { top: borda, bottom: borda, left: borda, right: borda };
      const linha = (rot, v, o = {}) => new D.TableRow({ children: [ new D.TableCell({ borders: bordas, margins: { top: 30, bottom: 30, left: 110, right: 110 },
        children: [ new D.Paragraph({ children: [ r(rot + " ", { bold: true, italics: o.it, size: o.size }), r(v || "", { bold: true, italics: o.it, size: o.size }) ] }) ] }) ] });
      const tabela = rows => new D.Table({ width: { size: 100, type: D.WidthType.PERCENTAGE }, rows });
      const x = k => forma === k ? "( X )" : "(   )";
      const src = document.querySelector("#modeloFolha").content.querySelector(".logo img").src;
      const bin = atob(src.split(",")[1]), bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const p = 19;
      const pag = [ linha(x("esp") + " ESPECIE", "", { size: p }),
        linha(x("pix") + " PIX :", d.pix + (d.pixBancoTxt ? "     " + d.pixBancoTxt : ""), { size: p }),
        linha(x("ted") + " TED / TRANSFERENCIA", "", { size: p }) ];
      if (forma === "cartao") pag.splice(2, 0, linha(x("cartao") + " CARTÃO DE CRÉDITO", "", { size: p }));
      if (forma === "ted") pag.push(linha("BANCO:", d.banco, { size: p }), linha("AG:", d.ag, { size: p }), linha("C/C:", d.cc, { size: p }),
        linha("FAVORECIDO:", d.fav, { size: p }), linha("CPF/CNPJ DO FAVORECIDO:", d.favDoc, { size: p }));
      const assin = (rot, nome) => {
        const ps = [ new D.Paragraph({ spacing: { before: 500 }, children: [ r(rot + " ", { size: 23 }), r("_".repeat(Math.max(20, 62 - rot.length)), { size: 23 }) ] }) ];
        if (nome) ps.push(new D.Paragraph({ alignment: D.AlignmentType.RIGHT, indent: { right: 1400 }, children: [ r(nome, { size: 16 }) ] }));
        return ps;
      };
      const doc = new D.Document({ sections: [{
        properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 600, bottom: 700, left: 1000, right: 1000, footer: 300 } } },
        footers: { default: new D.Footer({ children: [ new D.Paragraph({ alignment: D.AlignmentType.CENTER,
          children: [ new D.TextRun({ text: "Av. Bezerra de Menezes, 802 - São Gerardo", font: "Times New Roman", italics: true, size: 28 }) ] }) ] }) },
        children: [
          new D.Paragraph({ alignment: D.AlignmentType.CENTER, spacing: { after: 160 }, children: [ new D.ImageRun({ data: bytes, transformation: { width: 300, height: 76 } }) ] }),
          new D.Paragraph({ alignment: D.AlignmentType.CENTER, spacing: { after: 200 }, children: [ r("DECLARAÇÃO DE ESTORNO/REEMBOLSO", { bold: true }) ] }),
          new D.Paragraph({ alignment: D.AlignmentType.JUSTIFIED, spacing: { after: 160, line: 300 }, children: [
            r("Declaro para os devidos fins, que a Empresa "), r("R7 COMERCIO E SERVIÇOS DE INFORMATICA LTDA", { bold: true }),
            r(", inscrita no CNPJ. sob o nº. "), r("15.354.448/0001-80", { bold: true }), r(", efetuará no prazo de 72hrs, "),
            r("REEMBOLSO", { bold: true }), r(" ou "), r("CANCELAMENTO/ESTORNO", { bold: true }), r(", para o cliente conforme dados informados pelo mesmo, abaixo:") ] }),
          tabela([ linha("CLIENTE:", d.cliente, { it: true }), linha("CODIGO DE CLIENTE:", d.codigo, { it: true }), linha("TELEFONE:", d.telefone),
            linha("CPF/CNPJ:", d.cpf), linha("Nº DA NOTA FISCAL/PEDIDO:", d.nf), linha("4 ULTIMOS NÚMEROS DO CARTÃO:", d.cartao),
            linha("BANDEIRA DO CARTÃO:", d.bandeira), linha("DATA DA VENDA:", d.dataVenda), linha("VALOR TOTAL DA VENDA:", d.vTotal),
            linha("VALOR DO CANCELAMENTO:", d.vCanc), linha("MOTIVO DO CANCELAMENTO:", d.motivo) ]),
          new D.Paragraph({ spacing: { before: 160, after: 20 }, children: [ r("TIPOS DE PAGAMENTO E INFORMAÇÕES BANCARIAS (P/ PREENCHIMENTO NO CASO DE PIX OU TED)", { bold: true, size: 14 }) ] }),
          tabela(pag),
          new D.Paragraph({ alignment: D.AlignmentType.JUSTIFIED, spacing: { before: 300, after: 300 }, children: [
            r("Para maiores informações o cliente poderá entrar em contato com o setor financeiro através do número: 85 98772-7770.", { bold: true, color: "D32F2F", size: 20 }) ] }),
          new D.Paragraph({ alignment: D.AlignmentType.RIGHT, spacing: { after: 200 }, children: [ r("Fortaleza, " + d.dataExt, { size: 23 }) ] }),
          ...assin("ASSINATURA DO CLIENTE:", ""), ...assin("RESPONSAVEL PELA EMISSÃO:", d.resp), ...assin("GERENTE/LIDER DE SETOR:", d.gerente)
        ] }] });
      const blob = await D.Packer.toBlob(doc);
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = nomeArquivo("docx");
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch (e) {
      alert("Não foi possível gerar o arquivo do Word. Verifique a internet e tente de novo.");
    } finally { ocupado(false); }
  }

  // ---------- tema (mesma chave da Central de Garantias) ----------
  const ICONE_SOL = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
  const ICONE_LUA = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  function aplicarTema(escuro){
    document.body.classList.toggle("dark", escuro);
    $("darkIcon").innerHTML = escuro ? ICONE_SOL : ICONE_LUA;
    const t = escuro ? "Ativar modo claro" : "Ativar modo escuro";
    $("darkToggle").title = t; $("darkToggle").setAttribute("aria-label", t);
  }
  function trocaTema(){
    const escuro = !document.body.classList.contains("dark");
    aplicarTema(escuro);
    try { localStorage.setItem("darkMode", escuro ? "true" : "false"); } catch(e){}
  }

  // ---------- listas suspensas ----------
  const pop = document.createElement("div"); pop.className = "pop pop-lista"; document.body.appendChild(pop);
  let popInput = null, popSel = -1;
  function posiciona(el, alvo){
    const r = alvo.getBoundingClientRect();
    el.style.left = (r.left + window.scrollX) + "px";
    el.style.top = (r.bottom + window.scrollY + 4) + "px";
  }
  function abreLista(inp){
    const termo = inp.value.trim().toUpperCase();
    let itens = LISTAS[inp.dataset.lista] || [];
    const filtro = itens.filter(v => v.includes(termo));
    if (termo && filtro.length) itens = filtro;
    if (itens.length === 1 && itens[0] === termo) { fechaLista(); return; }
    popInput = inp; popSel = -1;
    pop.innerHTML = itens.map(v => '<div class="pop-item">' + v + '</div>').join("");
    pop.style.width = inp.offsetWidth + "px";
    posiciona(pop, inp); pop.classList.add("aberto");
  }
  function fechaLista(){ pop.classList.remove("aberto"); popInput = null; }
  function escolhe(item){
    const inp = popInput; if (!inp || !item) return;
    fechaLista(); inp.value = item.textContent; if (inp.id === "bandeira") marcaCartao(); atualiza(); inp.blur();
  }
  pop.addEventListener("mousedown", e => { e.preventDefault(); escolhe(e.target.closest(".pop-item")); });
  document.querySelectorAll("input[data-lista]").forEach(inp => {
    inp.addEventListener("focus", () => abreLista(inp));
    inp.addEventListener("click", () => { if (!pop.classList.contains("aberto")) abreLista(inp); });
    inp.addEventListener("input", () => { if (document.activeElement === inp) abreLista(inp); });
    inp.addEventListener("blur", () => setTimeout(() => { if (popInput === inp) fechaLista(); }, 120));
    inp.addEventListener("keydown", e => {
      if (!pop.classList.contains("aberto")) return;
      const itens = pop.querySelectorAll(".pop-item");
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        popSel = (popSel + (e.key === "ArrowDown" ? 1 : -1) + itens.length) % itens.length;
        itens.forEach((it, i) => it.classList.toggle("sel", i === popSel));
        itens[popSel].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter" && popSel >= 0) { e.preventDefault(); escolhe(itens[popSel]); }
      else if (e.key === "Escape") fechaLista();
    });
  });

  // ---------- calendário ----------
  const cal = document.createElement("div"); cal.className = "pop cal"; document.body.appendChild(cal);
  const dv = $("dataVenda");
  let calMes, calAno;
  function hoje0(){ const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function lerData(){ const m = dv.value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/); return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null; }
  function desenhaCal(){
    const h = hoje0(), esc = lerData();
    const primeiro = new Date(calAno, calMes, 1).getDay(), dias = new Date(calAno, calMes + 1, 0).getDate();
    const fim = calAno > h.getFullYear() || (calAno === h.getFullYear() && calMes >= h.getMonth());
    let html = '<div class="cal-cab"><button type="button" data-nav="-1" aria-label="Mês anterior">‹</button><b>' + MESES[calMes] + ' de ' + calAno +
      '</b><button type="button" data-nav="1" aria-label="Próximo mês"' + (fim ? " disabled" : "") + '>›</button></div><div class="cal-grade">';
    ["D","S","T","Q","Q","S","S"].forEach(s => html += '<div class="sem">' + s + '</div>');
    for (let i = 0; i < primeiro; i++) html += "<div></div>";
    for (let d = 1; d <= dias; d++) {
      const dt = new Date(calAno, calMes, d), cls = ["cal-dia"];
      if (+dt === +h) cls.push("hoje");
      if (esc && +dt === +esc) cls.push("escolhido");
      html += '<button type="button" class="' + cls.join(" ") + '" data-d="' + d + '"' + (dt > h ? " disabled" : "") + '>' + d + '</button>';
    }
    cal.innerHTML = html + '</div><div class="cal-rodape"><button type="button" data-hoje="1">Hoje</button></div>';
  }
  function abreCal(){ const b = lerData() || hoje0(); calMes = b.getMonth(); calAno = b.getFullYear(); desenhaCal(); posiciona(cal, dv); cal.classList.add("aberto"); }
  function fechaCal(){ cal.classList.remove("aberto"); }
  function pegaData(dt){
    const p = n => String(n).padStart(2, "0");
    dv.value = p(dt.getDate()) + "/" + p(dt.getMonth() + 1) + "/" + dt.getFullYear();
    dv.classList.remove("erro"); fechaCal(); dv.blur(); atualiza();
  }
  cal.addEventListener("mousedown", e => {
    e.preventDefault();
    const b = e.target.closest("button"); if (!b || b.disabled) return;
    if (b.dataset.nav) { calMes += +b.dataset.nav; if (calMes < 0) { calMes = 11; calAno--; } if (calMes > 11) { calMes = 0; calAno++; } desenhaCal(); }
    else if (b.dataset.d) pegaData(new Date(calAno, calMes, +b.dataset.d));
    else pegaData(hoje0());
  });
  dv.addEventListener("focus", abreCal);
  dv.addEventListener("click", () => { if (!cal.classList.contains("aberto")) abreCal(); });
  dv.addEventListener("input", () => { if (cal.classList.contains("aberto")) { const d = lerData(); if (d) { calMes = d.getMonth(); calAno = d.getFullYear(); } desenhaCal(); } });
  dv.addEventListener("blur", () => setTimeout(fechaCal, 120));
  dv.addEventListener("keydown", e => { if (e.key === "Escape") fechaCal(); });
  window.addEventListener("resize", () => { fechaCal(); fechaLista(); escala(); });

  // ---------- início ----------
  // gerente já vem preenchido (dá para trocar; o que você digitar fica salvo)
  const PADRAO = { gerente: "ANDERSON RODRIGUES" };
  document.querySelectorAll("[data-salvar]").forEach(i => { const v = guarda.get(i.dataset.salvar); i.value = v !== null ? v : (PADRAO[i.dataset.salvar] || ""); });
  $("chaveDoc").addEventListener("click", () => { $("cpf").value = ""; escolheDoc(tipoDoc === "cpf" ? "cnpj" : "cpf"); atualiza(); $("cpf").focus(); });
  try { aplicarTema(localStorage.getItem("darkMode") === "true"); } catch(e){ aplicarTema(false); }
  atualiza();
  escala();
  if (document.fonts) document.fonts.ready.then(escala);
