require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3001;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.use(cors());
app.use(express.json());

const createTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS eventos (
      id SERIAL PRIMARY KEY,
      titulo VARCHAR(255) NOT NULL,
      data_inicio TIMESTAMPTZ NOT NULL, -- TIMESTAMPTZ armazena data, hora e fuso horário
      data_fim TIMESTAMPTZ NOT NULL
    );
  `;
    await pool.query(query);
    console.log("Tabela 'eventos' pronta para uso.");
};

app.get('/api/eventos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM eventos ORDER BY data_inicio ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/eventos', async (req, res) => {
    const { titulo, data_inicio, data_fim } = req.body;
    if (!titulo || !data_inicio || !data_fim) {
        return res.status(400).json({ error: 'Dados incompletos para criar evento.' });
    }
    const result = await pool.query(
        'INSERT INTO eventos (titulo, data_inicio, data_fim) VALUES ($1, $2, $3) RETURNING *',
        [titulo, data_inicio, data_fim]
    );
    res.status(201).json(result.rows[0]);
});

app.delete('/api/eventos/:id', async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM eventos WHERE id = $1', [id]);
    res.status(204).send();
});

app.listen(port, () => {
    createTable();
    console.log(`Backend rodando na porta ${port}`);
});