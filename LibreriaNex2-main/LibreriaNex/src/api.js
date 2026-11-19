export const API = 'http://192.168.18.70:3000'; // cambia por tu IP

export async function peticion(ruta, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`${API}${ruta}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor');
  }
  const datos = await res.json();
  if (!res.ok) throw new Error(datos.error || 'Error del servidor');
  return datos;
}
