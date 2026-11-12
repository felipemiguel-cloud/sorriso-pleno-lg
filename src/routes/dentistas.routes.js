
const express = require('express');
const pool = require('../db');

const router = express.Router();

// Cadastrar dentista
router.post('/', async (req, res) => {
  try {
    const { nome, especialidade } = req.body;

    if (!nome || !especialidade) {
      return res.status(400).json({
        erro: 'Nome e especialidade são obrigatórios.'
      });
    }

    const resultado = await pool.query(
      `INSERT INTO dentistas (nome, especialidade)
       VALUES ($1, $2)
       RETURNING *`,
      [nome.trim(), especialidade.trim()]
    );

    return res.status(201).json({
      mensagem: 'Dentista cadastrado com sucesso!',
      dentista: resultado.rows[0]
    });

  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      erro: 'Erro ao cadastrar dentista.'
    });
  }
});

// Listar dentistas ativos
router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT * FROM dentistas WHERE ativo = TRUE ORDER BY id'
    );

    return res.status(200).json(resultado.rows);

  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      erro: 'Erro ao buscar dentistas.'
    });
  }
});

module.exports = router;
