import { useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { peticion } from '../api';
import { SesionContext } from '../sesion';
import { colores } from '../tema';

const CATEGORIAS_BASE = [
  'Todos',
  'Novelas',
  'Ciencia',
  'Historia',
  'Tecnologia',
  'Fantasía',
];

function PortadaLibro({ uri, estiloImagen, estiloPlaceholder }) {
  if (uri) {
    return <Image source={{ uri }} style={estiloImagen} resizeMode="cover" />;
  }
  return (
    <View style={estiloPlaceholder}>
      <Ionicons name="book-outline" size={28} color="#A38B78" />
    </View>
  );
}

export default function Libros({ navigation, favoritosIds = [], onToggleFavorito }) {
  const { usuario } = useContext(SesionContext);
  const [libros, setLibros] = useState([]);
  const [categorias, setCategorias] = useState(CATEGORIAS_BASE);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    const cargarDatos = async () => {
      setCargando(true);
      setError('');
      try {
        const [dataLibros, dataCats] = await Promise.all([
          peticion('/libros'),
          peticion('/categorias').catch(() => null),
        ]);
        if (!activo) return;
        setLibros(Array.isArray(dataLibros) ? dataLibros : []);
        if (Array.isArray(dataCats) && dataCats.length > 0) {
          const nombres = dataCats.map((c) => c.nombre).filter(Boolean);
          const combinadas = ['Todos'];
          for (const cat of [...CATEGORIAS_BASE.slice(1), ...nombres]) {
            if (!combinadas.includes(cat)) combinadas.push(cat);
          }
          setCategorias(combinadas);
        }
      } catch (e) {
        if (!activo) return;
        setError(e.message || 'No se pudieron cargar los libros');
      } finally {
        if (activo) setCargando(false);
      }
    };
    cargarDatos();
    return () => {
      activo = false;
    };
  }, []);

  const librosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return libros.filter((libro) => {
      const catLibro = (libro.categoria || '').toLowerCase();
      const coincideCat =
        categoriaActiva === 'Todos' ||
        catLibro === categoriaActiva.toLowerCase();
      const titulo = (libro.titulo || '').toLowerCase();
      const autor = (libro.autor || '').toLowerCase();
      const coincideTexto = !q || titulo.includes(q) || autor.includes(q);
      return coincideCat && coincideTexto;
    });
  }, [libros, categoriaActiva, busqueda]);

  const abrirDetalle = (libro) => {
    const idLibro = libro.id_libro ?? libro.id;
    const esFavorito = favoritosIds.includes(idLibro);
    navigation.navigate('DetalleLibro', { libro, idLibro, esFavorito });
  };

  const renderLibro = ({ item }) => {
    const uriPortada = item.portadaUrl || item.imagen_url || item.imagen || null;
    return (
      <TouchableOpacity
        style={styles.tarjetaGrid}
        activeOpacity={0.85}
        onPress={() => abrirDetalle(item)}
      >
        <PortadaLibro
          uri={uriPortada}
          estiloImagen={styles.portadaGrid}
          estiloPlaceholder={styles.placeholderGrid}
        />
        <Text style={styles.tituloLibro} numberOfLines={2}>
          {item.titulo || 'Sin título'}
        </Text>
        <Text style={styles.autorLibro} numberOfLines={1}>
          {item.autor || 'Autor por definir'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.contenedor}>
      {/* Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Inicio')}
          style={styles.botonIcono}
        >
          <Ionicons name="arrow-back" size={24} color={colores.texto} />
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>Libros</Text>
      </View>

      <View style={styles.cuerpo}>
        <FlatList
          data={librosFiltrados}
          keyExtractor={(item, idx) => String(item.id_libro ?? item.id ?? idx)}
          numColumns={2}
          columnWrapperStyle={styles.filaGrid}
          contentContainerStyle={styles.listaContenido}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>

              <View style={styles.buscadorCaja}>
                <Ionicons name="search" size={18} color="#8D7563" />
                <TextInput
                  style={styles.buscadorInput}
                  placeholder="Buscar libro..."
                  placeholderTextColor="#A68E7C"
                  value={busqueda}
                  onChangeText={setBusqueda}
                />
                {busqueda.length > 0 && (
                  <TouchableOpacity onPress={() => setBusqueda('')}>
                    <Ionicons name="close-circle" size={18} color="#8D7563" />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.seccionTitulo}>Categorias</Text>
              <View style={styles.chipsWrap}>
                {categorias.map((cat) => {
                  const activa = categoriaActiva === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.chip, activa && styles.chipActivo]}
                      onPress={() => setCategoriaActiva(cat)}
                    >
                      <Text style={[styles.chipTexto, activa && styles.chipTextoActivo]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.seccionTitulo}>Libros disponibles</Text>

              {cargando && (
                <View style={styles.estadoCentro}>
                  <ActivityIndicator size="small" color={colores.cafe} />
                  <Text style={styles.textoEstado}>Cargando libros...</Text>
                </View>
              )}

              {!cargando && error ? (
                <View style={styles.estadoCentro}>
                  <Text style={styles.textoError}>{error}</Text>
                </View>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            !cargando && !error ? (
              <View style={styles.estadoCentro}>
                <Text style={styles.textoEstado}>
                  No hay libros que coincidan con el filtro.
                </Text>
              </View>
            ) : null
          }
          renderItem={renderLibro}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#E7D4BC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: 18,
    backgroundColor: '#E7D4BC',
    gap: 12,
  },
  botonIcono: {
    padding: 4,
  },
  tituloHeader: {
    fontSize: 22,
    fontWeight: '700',
    color: colores.texto,
  },
  cuerpo: {
    flex: 1,
    backgroundColor: '#F7EFE4',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  listaContenido: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 28,
  },
  buscadorCaja: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EADBC8',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    marginBottom: 16,
  },
  buscadorInput: {
    flex: 1,
    fontSize: 15,
    color: colores.texto,
  },
  seccionTitulo: {
    fontSize: 17,
    fontWeight: '700',
    color: colores.texto,
    marginBottom: 10,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  chip: {
    backgroundColor: '#E9D9C6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  chipActivo: {
    backgroundColor: colores.cafe,
  },
  chipTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: colores.texto,
  },
  chipTextoActivo: {
    color: colores.blanco,
  },
  filaGrid: {
    justifyContent: 'space-between',
    gap: 14,
  },
  tarjetaGrid: {
    flex: 1,
    backgroundColor: colores.blanco,
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  portadaGrid: {
    width: 104,
    height: 142,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#EFE6DA',
  },
  placeholderGrid: {
    width: 104,
    height: 142,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#EFE6DA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tituloLibro: {
    fontSize: 15,
    fontWeight: '700',
    color: colores.texto,
    textAlign: 'center',
  },
  autorLibro: {
    fontSize: 12,
    color: '#7A6252',
    textAlign: 'center',
    marginTop: 2,
  },
  estadoCentro: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  textoEstado: {
    color: '#7A6252',
    fontSize: 14,
    textAlign: 'center',
  },
  textoError: {
    color: '#B33A2B',
    fontSize: 14,
    textAlign: 'center',
  },
});