const express = require('express');
const pool = require('../db');

const router = express.Router();

// Cadastrar agendamento
router.post('/', async (req, res) => {
  try {
    const {
      paciente_id,
      dentista_id,
      procedimento,
      data_consulta,
      hora_consulta
    } = req.body;

    if (
      !paciente_id ||
      !dentista_id ||
      !procedimento ||
      !data_consulta ||
      !hora_consulta
    ) {
      return res.status(400).json({
        erro: 'Todos os campos são obrigatórios.'
      });
    }

    const resultado = await pool.query(
      `INSERT INTO agendamentos
       (paciente_id, dentista_id, procedimento,
        data_consulta, hora_consulta)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        paciente_id,
        dentista_id,
        procedimento,
        data_consulta,
        hora_consulta
      ]
    );

    return res.status(201).json({
      mensagem: 'Agendamento realizado com sucesso!',
      agendamento: resultado.rows[0]
    });

  } catch (error) {
    console.error(error.message);

    if (error.code === '23505') {
      return res.status(409).json({
        erro: 'Este dentista já possui um agendamento nesse horário.'
      });
    }

    if (error.code === '23503') {
      return res.status(400).json({
        erro: 'Paciente ou dentista não encontrado.'
      });
    }

    return res.status(500).json({
      erro: 'Erro ao realizar agendamento.'
    });
  }
});

// Listar agendamentos
router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query(
    `SELECT
        a.id,
        a.paciente_id,
        a.dentista_id,
        p.nome AS paciente,
        d.nome AS dentista,
        d.especialidade,
        a.procedimento,
        a.data_consulta,
        a.hora_consulta,
        a.status
       FROM agendamentos a
       JOIN pacientes p ON a.paciente_id = p.id
       JOIN dentistas d ON a.dentista_id = d.id
       ORDER BY a.data_consulta, a.hora_consulta`
    );

    return res.status(200).json(resultado.rows);

  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      erro: 'Erro ao buscar agendamentos.'
    });
  }
});

// Cancelar agendamento
router.patch('/:id/cancelar', async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `UPDATE agendamentos
       SET status = 'CANCELADO'
       WHERE id = $1 AND status <> 'CANCELADO'
       RETURNING *`,
      [id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        erro: 'Agendamento não encontrado ou já cancelado.'
      });
    }

    return res.status(200).json({
      mensagem: 'Agendamento cancelado com sucesso!',
      agendamento: resultado.rows[0]
    });

  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      erro: 'Erro ao cancelar agendamento.'
    });
  }
});

module.exports = router;