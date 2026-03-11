const TOTAL_STEPS = 8;
const LABELS = [
  'Dados Pessoais', 'Endereço', 'Documentos', 'Dependentes',
  'Escolaridade', 'Dados Bancários', 'Anexos', 'Revisão e Envio'
];

let stepAtual = 1;
let contadorDependentes = 0;

// Campos obrigatórios por step
const OBRIGATORIOS = {
  1: ['nome_completo', 'email', 'telefone', 'data_nascimento', 'sexo', 'estado_civil'],
  2: ['cep', 'endereco'],
  3: [], 4: [], 5: [], 6: [],
  7: ['foto_digital', 'carta_referencia', 'ctps_digital', 'documento_identidade', 'titulo_eleitor', 'comprovante_endereco'],
  8: []
};

// Configuração dos campos de anexo
const ANEXOS = [
  { name: 'foto_digital',          label: 'Foto Digital',                          obrigatorio: true,  maxCount: 1 },
  { name: 'carta_referencia',      label: 'Carta de Referência',                   obrigatorio: true,  maxCount: 3 },
  { name: 'ctps_digital',          label: 'CTPS Digital',                          obrigatorio: true,  maxCount: 2 },
  { name: 'documento_identidade',  label: 'Documento de Identidade',               obrigatorio: true,  maxCount: 2 },
  { name: 'titulo_eleitor',        label: 'Título de Eleitor',                     obrigatorio: true,  maxCount: 2 },
  { name: 'comprovante_endereco',  label: 'Comprovante de Endereço',               obrigatorio: true,  maxCount: 1 },
  { name: 'reservista',            label: 'Reservista',                            obrigatorio: false, maxCount: 2 },
  { name: 'cnh',                   label: 'Carteira de Habilitação (CNH)',          obrigatorio: false, maxCount: 2 },
  { name: 'certidao_casamento',    label: 'Certidão de Casamento/União Estável',   obrigatorio: false, maxCount: 2 },
  { name: 'doc_conjuge', label: 'Documento de Identidade do Cônjuge', obrigatorio: false, maxCount: 2 },
  { name: 'doc_filho', label: 'Documento de Identidade do Filho ou Certidão de Nascimento', obrigatorio: false, maxCount: 5 },
  { name: 'comprovante_faculdade', label: 'Comprovante de Faculdade',              obrigatorio: false, maxCount: 3 },
  { name: 'historico_escolar',     label: 'Histórico Escolar',                     obrigatorio: false, maxCount: 3 },
  { name: 'certificado_curso',     label: 'Certificado Técnico/Graduação/Pós',     obrigatorio: false, maxCount: 5 },
  { name: 'carta_aposentadoria',   label: 'Carta de Aposentadoria',                obrigatorio: false, maxCount: 2 },
];

// Armazena os arquivos selecionados por campo
const arquivosPorCampo = {};

// Formata tamanho do arquivo
function formatarTamanho(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Ícone por tipo de arquivo
function iconeArquivo(tipo) {
  if (tipo.startsWith('image/')) return '🖼️';
  if (tipo === 'application/pdf') return '📄';
  return '📎';
}

// Renderiza a lista de arquivos de um campo
function renderizarLista(name) {
  const lista = document.getElementById(`lista-${name}`);
  const contador = document.getElementById(`contador-${name}`);
  const area = document.getElementById(`area-${name}`);
  const arquivos = arquivosPorCampo[name] || [];

  lista.innerHTML = arquivos.map((arq, idx) => `
    <div class="upload-arquivo-item">
      <span>${iconeArquivo(arq.type)}</span>
      <span title="${arq.name}">${arq.name}</span>
      <button type="button" class="upload-arquivo-remover" onclick="removerArquivo('${name}', ${idx})">✕</button>
    </div>
  `).join('');

  const total = arquivos.length;
  const config = ANEXOS.find(a => a.name === name);

  contador.textContent = total > 0 ? `${total}/${config.maxCount}` : '';
  contador.className = `upload-contador ${total > 0 ? 'tem-arquivos' : ''}`;

  area.classList.toggle('tem-arquivo', total > 0);

  if (total > 0) {
    area.classList.remove('invalido');
    const aviso = document.getElementById(`aviso-${name}`);
    if (aviso) aviso.style.display = 'none';
  }
}


// Remove arquivo individual
function removerArquivo(name, idx) {
  arquivosPorCampo[name].splice(idx, 1);
  renderizarLista(name);
}

// Inicializa os campos de upload dinamicamente
function inicializarUploads() {
  const container = document.getElementById('containerAnexos');
  if (!container) return;

  // Separa obrigatórios e opcionais
  const obrigatorios = ANEXOS.filter(a => a.obrigatorio);
  const opcionais = ANEXOS.filter(a => !a.obrigatorio);

  let html = `<p class="secao-label">Obrigatórios</p>`;
  html += obrigatorios.map(a => criarCampoUpload(a)).join('');
  html += `<p class="secao-label" style="margin-top:8px;">Opcionais</p>`;
  html += opcionais.map(a => criarCampoUpload(a)).join('');

  container.innerHTML = html;

  // Adiciona eventos
  ANEXOS.forEach(({ name, maxCount }) => {
    arquivosPorCampo[name] = [];
    const input = document.getElementById(`input-${name}`);
    const area = document.getElementById(`area-${name}`);

    input.addEventListener('change', (e) => {
      const novos = Array.from(e.target.files);
      const atuais = arquivosPorCampo[name];
      const disponiveis = maxCount - atuais.length;

      if (disponiveis <= 0) {
        alert(`Limite de ${maxCount} arquivo(s) atingido para este campo.`);
        input.value = '';
        return;
      }

      const adicionados = novos.slice(0, disponiveis);
      arquivosPorCampo[name] = [...atuais, ...adicionados];
      renderizarLista(name);
      input.value = '';
    });

    // Drag and drop
    area.addEventListener('dragover', (e) => { e.preventDefault(); area.classList.add('drag-over'); });
    area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
    area.addEventListener('drop', (e) => {
      e.preventDefault();
      area.classList.remove('drag-over');
      const novos = Array.from(e.dataTransfer.files);
      const atuais = arquivosPorCampo[name];
      const disponiveis = maxCount - atuais.length;
      arquivosPorCampo[name] = [...atuais, ...novos.slice(0, disponiveis)];
      renderizarLista(name);
    });
  });
}

function criarCampoUpload({ name, label, obrigatorio, maxCount }) {
  return `
    <div class="upload-card" id="area-${name}">
      <input type="file" id="input-${name}" accept=".pdf,.jpg,.jpeg,.png,.webp" multiple />
      <div class="upload-card-info">
        <div class="upload-card-label">
          ${label} ${obrigatorio ? '<span class="obrigatorio">*</span>' : ''}
        </div>
        <div class="upload-card-sub" id="sub-${name}">PDF, JPG ou PNG${maxCount > 1 ? ` · máx. ${maxCount} arquivos` : ''}</div>
        <div class="upload-card-arquivos" id="lista-${name}"></div>
        <span class="upload-obrigatorio-aviso" id="aviso-${name}">Campo obrigatório</span>
      </div>
      <div class="upload-card-acoes">
        <button type="button" class="upload-btn-card" onclick="document.getElementById('input-${name}').click()">
          ↑ Upload
        </button>
        <span class="upload-contador" id="contador-${name}"></span>
      </div>
    </div>
  `;
}


// ===== PROGRESSO =====
function atualizarProgresso() {
  document.getElementById('stepAtual').textContent = `Etapa ${stepAtual} de ${TOTAL_STEPS}`;
  document.getElementById('progressoLabel').textContent = LABELS[stepAtual - 1];

  const dots = document.getElementById('stepsDots');
  dots.innerHTML = Array.from({ length: TOTAL_STEPS }, (_, i) => {
    const n = i + 1;
    let cls = 'dot';
    if (n < stepAtual) cls += ' concluido';
    else if (n === stepAtual) cls += ' ativo';
    return `<div class="${cls}">${n < stepAtual ? '✓' : n}</div>`;
  }).join('');
}

// ===== STEPS =====
function mostrarStep(num) {
  document.querySelectorAll('.step').forEach(s => s.style.display = 'none');
  document.querySelector(`[data-step="${num}"]`).style.display = 'block';

  document.getElementById('btnAnterior').style.display = num === 1 ? 'none' : 'block';
  document.getElementById('btnProximo').style.display = num === TOTAL_STEPS ? 'none' : 'block';
  document.getElementById('btnEnviar').style.display = num === TOTAL_STEPS ? 'block' : 'none';

  if (num === TOTAL_STEPS) gerarResumo();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  atualizarProgresso();
}

// ===== VALIDAÇÃO =====
function validarStep(num) {
  let valido = true;

  document.querySelectorAll('.invalido').forEach(el => el.classList.remove('invalido'));
  document.querySelectorAll('.erro-campo').forEach(el => el.remove());
  document.querySelectorAll('.upload-obrigatorio-aviso').forEach(el => el.style.display = 'none');

  // Campos de texto/select
  const campos = OBRIGATORIOS[num] || [];
  campos.forEach(nome => {
    const el = document.querySelector(`[name="${nome}"]`);
    if (!el) return;
    const vazio = !el.value.trim();
    if (vazio) {
      el.classList.add('invalido');
      const erro = document.createElement('span');
      erro.className = 'erro-campo';
      erro.textContent = 'Campo obrigatório';
      el.parentNode.appendChild(erro);
      valido = false;
    }
  });

  // Validação de anexos obrigatórios no step 7
  if (num === 7) {
    ANEXOS.filter(a => a.obrigatorio).forEach(({ name }) => {
      if (!arquivosPorCampo[name] || arquivosPorCampo[name].length === 0) {
        const area = document.getElementById(`area-${name}`);
        const aviso = document.getElementById(`aviso-${name}`);
        if (area) area.classList.add('invalido');
        if (aviso) aviso.style.display = 'block';
        valido = false;
      }
    });
  }

  // LGPD no step 8
// LGPD no step 8
if (num === 8) {
  const lgpd = document.getElementById('confirmaLGPD');
  if (!lgpd || !lgpd.checked) {
    if (lgpd) lgpd.parentNode.style.color = '#ef4444';
    valido = false;
  }
}
if (!valido) {
    const primeiro = document.querySelector('.invalido');
    if (primeiro) primeiro.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return valido;
}

// ===== RESUMO =====
function gerarResumo() {
  const form = document.getElementById('formContratacao');
  const data = new FormData(form);
  const resumo = document.getElementById('resumoDados');

  const grupos = [
    { titulo: 'Dados Pessoais', campos: [
      ['Nome', 'nome_completo'], ['E-mail', 'email'], ['Telefone', 'telefone'],
      ['Nascimento', 'data_nascimento'], ['Sexo', 'sexo'], ['Estado Civil', 'estado_civil'],
      ['Cônjuge', 'nome_conjuge'], ['Tipo Sanguíneo', 'tipo_sanguineo'], ['Fator RH', 'fator_rh']
    ]},
    { titulo: 'Endereço', campos: [
      ['CEP', 'cep'], ['Endereço', 'endereco'], ['Número', 'numero'],
      ['Bairro', 'bairro'], ['Cidade', 'cidade'], ['Estado', 'estado']
    ]},
    { titulo: 'Documentos', campos: [
      ['RG', 'rg_numero'], ['Título de Eleitor', 'titulo_eleitor_numero'], ['Reservista', 'reservista_numero']
    ]},
    { titulo: 'Dados Bancários', campos: [
      ['Banco', 'banco'], ['Agência', 'agencia'], ['Conta', 'numero_conta'],
      ['Dígito', 'digito_conta'], ['Tipo', 'tipo_conta']
    ]}
  ];

  // Resumo de dados
  let htmlResumo = grupos.map(g => {
    const itens = g.campos.map(([label, name]) => {
      const val = data.get(name);
      if (!val) return '';
      return `<div class="resumo-item"><span>${label}</span><span>${val}</span></div>`;
    }).filter(Boolean).join('');
    if (!itens) return '';
    return `<div class="resumo-grupo"><h4>${g.titulo}</h4>${itens}</div>`;
  }).join('');

  // Resumo de anexos
  const anexosResumo = ANEXOS.map(({ name, label }) => {
    const qtd = (arquivosPorCampo[name] || []).length;
    if (!qtd) return '';
    return `<div class="resumo-item"><span>${label}</span><span>${qtd} arquivo${qtd > 1 ? 's' : ''}</span></div>`;
  }).filter(Boolean).join('');

  if (anexosResumo) {
    htmlResumo += `<div class="resumo-grupo"><h4>Anexos</h4>${anexosResumo}</div>`;
  }

  resumo.innerHTML = htmlResumo;
}

// ===== NAVEGAÇÃO =====
document.getElementById('btnProximo').addEventListener('click', () => {
  if (!validarStep(stepAtual)) return;
  stepAtual++;
  mostrarStep(stepAtual);
});

document.getElementById('btnAnterior').addEventListener('click', () => {
  stepAtual--;
  mostrarStep(stepAtual);
});

// ===== ESTADO CIVIL → CÔNJUGE =====
document.getElementById('estadoCivil').addEventListener('change', function () {
  const campo = document.getElementById('campoConjuge');
  campo.style.display = ['Casado(a)', 'União Estável'].includes(this.value) ? 'flex' : 'none';
});

// ===== DEPENDENTES =====
document.getElementById('btnAdicionarDependente').addEventListener('click', () => {
  contadorDependentes++;
  const lista = document.getElementById('listaDependentes');
  const div = document.createElement('div');
  div.className = 'dependente-item';
  div.id = `dep-${contadorDependentes}`;
  div.innerHTML = `
    <h4>Dependente ${contadorDependentes}</h4>
    <button type="button" class="btn-remover" onclick="removerDependente(${contadorDependentes})">Remover</button>
    <div style="display:flex;flex-direction:column;gap:12px;margin-top:8px;">
      <div class="campo">
        <label>Nome</label>
        <input type="text" name="dependentes[${contadorDependentes}][nome]" />
      </div>
      <div class="campo">
        <label>Grau de Parentesco</label>
        <select name="dependentes[${contadorDependentes}][grau_parentesco]">
          <option value="">Selecione...</option>
          <option>Filho(a)</option><option>Cônjuge</option>
          <option>Pai/Mãe</option><option>Irmão/Irmã</option><option>Outro</option>
        </select>
      </div>
      <div class="campo">
        <label>Data de Nascimento</label>
        <input type="date" name="dependentes[${contadorDependentes}][data_nascimento]" />
      </div>
    </div>
  `;
  lista.appendChild(div);
});

function removerDependente(id) {
  document.getElementById(`dep-${id}`)?.remove();
}

// ===== MÁSCARAS =====
document.querySelector('[name="cep"]').addEventListener('input', function () {
  this.value = this.value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);
});


// ===== VIA CEP =====
document.querySelector('[name="cep"]').addEventListener('blur', async function () {
  const cep = this.value.replace(/\D/g, '');
  if (cep.length !== 8) return;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();

    if (data.erro) {
      alert('CEP não encontrado.');
      return;
    }

    document.querySelector('[name="endereco"]').value = data.logradouro || '';
    document.querySelector('[name="bairro"]').value = data.bairro || '';
    document.querySelector('[name="cidade"]').value = data.localidade || '';
    document.querySelector('[name="estado"]').value = data.uf || '';

    document.querySelector('[name="numero"]').focus();

  } catch {
    console.warn('Erro ao buscar CEP.');
  }
});

document.querySelector('[name="telefone"]').addEventListener('input', function () {
  this.value = this.value.replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
});


document.querySelector('[name="telefone_adicional"]').addEventListener('input', function () {
  this.value = this.value.replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
});




// ===== SUBMIT =====
document.getElementById('formContratacao').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validarStep(8)) return;

  const btn = document.getElementById('btnEnviar');
  const mensagem = document.getElementById('mensagem');
  btn.disabled = true;
  btn.textContent = 'Enviando...';
  mensagem.style.display = 'none';

  try {
    const formData = new FormData(e.target);

    // Injeta os arquivos dos uploads customizados
    ANEXOS.forEach(({ name }) => {
      (arquivosPorCampo[name] || []).forEach(file => {
        formData.append(name, file);
      });
    });

    const response = await fetch('https://plpbr-formcontratacao.onrender.com/api/candidatos', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (response.ok) {
      mensagem.className = 'mensagem sucesso';
      mensagem.textContent = '✅ Cadastro realizado com sucesso! Entraremos em contato em breve.';
      e.target.reset();
      document.getElementById('listaDependentes').innerHTML = '';
      ANEXOS.forEach(({ name }) => { arquivosPorCampo[name] = []; renderizarLista(name); });
      stepAtual = 1;
      mostrarStep(1);
    } else {
      mensagem.className = 'mensagem erro';
      mensagem.textContent = `❌ Erro: ${result.error}`;
    }
  } catch {
    mensagem.className = 'mensagem erro';
    mensagem.textContent = '❌ Erro de conexão. Tente novamente.';
  } finally {
    mensagem.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Enviar Cadastro ✓';
    mensagem.scrollIntoView({ behavior: 'smooth' });
  }
});

// ===== INIT =====
mostrarStep(1);
inicializarUploads();
