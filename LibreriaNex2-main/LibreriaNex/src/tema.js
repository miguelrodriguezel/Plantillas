import { StyleSheet } from 'react-native';

export const colores = {
  fondo: '#F3E6D3',
  cafe: '#A9694A',
  texto: '#5A3E2B',
  blanco: '#FFFFFF',
};

export const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo, paddingHorizontal: 24, justifyContent: 'center' },
  logo: { alignItems: 'center', marginBottom: 24 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: colores.texto, marginTop: 8 },
  subtitulo: { color: colores.texto, marginBottom: 8 },
  boton: { backgroundColor: colores.cafe, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  textoBoton: { color: colores.blanco, fontSize: 16, fontWeight: '600' },
  botonClaro: { borderWidth: 1, borderColor: colores.cafe, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  textoBotonClaro: { color: colores.cafe, fontSize: 16, fontWeight: '600' },
  enlace: { color: colores.cafe, textAlign: 'center', marginTop: 16 },
});