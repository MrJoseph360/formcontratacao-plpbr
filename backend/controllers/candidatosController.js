const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Anexos obrigatórios
const ANEXOS_OBRIGATORIOS = [
  'foto_digital',
  'carta_referencia',
  'ctps_digital',
  'documento_identidade',
  'titulo_eleitor',
  'comprovante_endereco'
];

exports.criar = async (req, res) => {
  try {
    const { dependentes, ...dadosCandidato } = req.body;

    // Valida anexos obrigatórios
    for (const campo of ANEXOS_OBRIGATORIOS) {
      if (!req.files || !req.files[campo]) {
        return res.status(400).json({ error: `Anexo obrigatório ausente: ${campo}` });
      }
    }

    // Insere candidato
    const { data: candidato, error: erroCandidato } = await supabase
      .from('candidatos')
      .insert([dadosCandidato])
      .select()
      .single();

    if (erroCandidato) throw erroCandidato;

    // Insere dependentes (se houver)
    if (dependentes && dependentes.length > 0) {
      const deps = dependentes.map(d => ({ ...d, candidato_id: candidato.id }));
      const { error: erroDeps } = await supabase.from('dependentes').insert(deps);
      if (erroDeps) throw erroDeps;
    }

    // Upload dos anexos
    for (const [campo, arquivos] of Object.entries(req.files)) {
      const arquivo = arquivos[0];
      const path = `${candidato.id}/${campo}-${Date.now()}`;
      const { error: erroUpload } = await supabase.storage
        .from('anexos-candidatos')
        .upload(path, arquivo.buffer, { contentType: arquivo.mimetype });
      if (erroUpload) throw erroUpload;
    }

    res.status(201).json({ message: 'Cadastro realizado com sucesso!', id: candidato.id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao processar cadastro.' });
  }
};
