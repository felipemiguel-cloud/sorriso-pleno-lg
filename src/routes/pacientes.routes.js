
const express = require('express');
const pool = require('../db');

const router = express.Router();

// Listar pacientes
router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT * FROM pacientes ORDER BY id DESC'
    );

    return res.status(200).json(resultado.rows);

  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      erro: 'Erro ao buscar pacientes.'
    });
  }
});

// Buscar paciente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      'SELECT * FROM pacientes WHERE id = $1',
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: 'Paciente não encontrado.'
      });
    }

    return res.status(200).json(resultado.rows[0]);

  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      erro: 'Erro ao buscar paciente.'
    });
  }
});

// Cadastrar paciente
router.post('/', async (req, res) => {
  try {
    const { nome, cpf, telefone } = req.body;

    if (!nome || !telefone) {
      return res.status(400).json({
        erro: 'Nome e telefone são obrigatórios.'
      });
    }

    const resultado = await pool.query(
      `INSERT INTO pacientes (nome, cpf, telefone)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nome.trim(), cpf || null, telefone.trim()]
    );

    return res.status(201).json({
      mensagem: 'Paciente cadastrado com sucesso!',
      paciente: resultado.rows[0]
    });

  } catch (error) {
    console.error(error.message);

    if (error.code === '23505') {
      return res.status(409).json({
        erro: 'CPF ou telefone já cadastrado.'
      });
    }

    return res.status(500).json({
      erro: 'Erro ao cadastrar paciente.'
    });
  }
});

// Atualizar paciente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cpf, telefone } = req.body;

    if (!nome || !telefone) {
      return res.status(400).json({
        erro: 'Nome e telefone são obrigatórios.'
      });
    }

    const resultado = await pool.query(
      `UPDATE pacientes
       SET nome = $1, cpf = $2, telefone = $3
       WHERE id = $4
       RETURNING *`,
      [nome.trim(), cpf || null, telefone.trim(), id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: 'Paciente não encontrado.'
      });
    }

    return res.status(200).json({
      mensagem: 'Paciente atualizado com sucesso!',
      paciente: resultado.rows[0]
    });

  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      erro: 'Erro ao atualizar paciente.'
    });
  }
});

 // Excluir paciente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      'DELETE FROM pacientes WHERE id = $1 RETURNING *',
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: 'Paciente não encontrado.'
      });
    }

    return res.status(200).json({
      mensagem: 'Paciente excluído com sucesso!'
    });

  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      erro: 'Erro ao excluir paciente.'
    });
  }
});

module.exports = router;
