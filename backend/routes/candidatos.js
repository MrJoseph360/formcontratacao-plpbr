const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { criar } = require('../controllers/candidatosController');

const camposAnexos = [
  { name: 'foto_digital', maxCount: 1 },
  { name: 'carta_referencia', maxCount: 3 },
  { name: 'ctps_digital', maxCount: 2 },
  { name: 'documento_identidade', maxCount: 2 },
  { name: 'titulo_eleitor', maxCount: 2 },
  { name: 'comprovante_endereco', maxCount: 1 },
  { name: 'reservista', maxCount: 2 },
  { name: 'cnh', maxCount: 2 },
  { name: 'certidao_casamento', maxCount: 2 },
  { name: 'doc_conjuge', maxCount: 2 },
  { name: 'doc_filho', maxCount: 5 },
  { name: 'comprovante_faculdade', maxCount: 3 },
  { name: 'historico_escolar', maxCount: 3 },
  { name: 'certificado_curso', maxCount: 5 },
  { name: 'carta_aposentadoria', maxCount: 2 }
];

router.post('/', upload.fields(camposAnexos), criar);

module.exports = router;
