const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/portadas', express.static(path.join(__dirname, 'portadas')));

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Manzana1809*89',
  database: 'LibreriaNex',
  charset: 'utf8mb4',
});

const conPortada = (req, rows) => {
  const base = `${req.protocol}://${req.get('host')}`;
  return rows.map((r) => ({
    ...r,
    portadaUrl: r.portada ? `${base}/portadas/${r.portada}` : null,
  }));
};

const SELECT_LIBROS = `
  SELECT l.*, c.nombre AS categoria
  FROM libros l
  LEFT JOIN categorias c ON c.id_categoria = l.id_categoria`;


app.get('/categorias', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categorias ORDER BY id_categoria');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/libros', async (req, res) => {
  try {
    const { categoria, buscar, destacados } = req.query;
    const filtros = [];
    const valores = [];
    if (categoria) { filtros.push('c.nombre = ?'); valores.push(categoria); }
    if (buscar) {
      filtros.push('(l.titulo LIKE ? OR l.autor LIKE ?)');
      valores.push(`%${buscar}%`, `%${buscar}%`);
    }
    if (destacados) filtros.push('l.destacado = 1');
    const where = filtros.length ? 'WHERE ' + filtros.join(' AND ') : '';
    const [rows] = await db.query(`${SELECT_LIBROS} ${where} ORDER BY l.id_libro`, valores);
    res.json(conPortada(req, rows));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/registro', async (req, res) => {
  const { nombre, correo, contrasena } = req.body;
  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  try {
    const hash = await bcrypt.hash(contrasena, 10);
    const [r] = await db.query(
      'INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)',
      [nombre, correo, hash]
    );
    res.status(201).json({ id_usuario: r.insertId, nombre, correo });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ese correo ya está registrado' });
    }
    res.status(500).json({ error: e.message });
  }
});

app.post('/login', async (req, res) => {
  const { correo, contrasena } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    const u = rows[0];
    if (!u || !(await bcrypt.compare(contrasena || '', u.contrasena))) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }
    res.json({ id_usuario: u.id_usuario, nombre: u.nombre, correo: u.correo });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/favoritos/:idUsuario', async (req, res) => {
  try {
    const [rows] = await db.query(
      `${SELECT_LIBROS}
       JOIN favoritos f ON f.id_libro = l.id_libro
       WHERE f.id_usuario = ?`,
      [req.params.idUsuario]
    );
    res.json(conPortada(req, rows));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/favoritos', async (req, res) => {
  try {
    const { id_usuario, id_libro } = req.body;
    await db.query(
      'INSERT IGNORE INTO favoritos (id_usuario, id_libro) VALUES (?, ?)',
      [id_usuario, id_libro]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/favoritos/:idUsuario/:idLibro', async (req, res) => {
  try {
    await db.query(
      'DELETE FROM favoritos WHERE id_usuario = ? AND id_libro = ?',
      [req.params.idUsuario, req.params.idLibro]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, '0.0.0.0', () => console.log('API lista en el puerto 3000'));