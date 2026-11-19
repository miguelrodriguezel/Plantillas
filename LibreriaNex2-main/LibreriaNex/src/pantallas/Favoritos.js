import { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../tema';

export default function Favoritos({
  navigation,
  favoritos = [],
  onToggleFavorito,
}) {
  const [busqueda, setBusqueda] = useState('');

  const listaFiltrada = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return favoritos;
    return favoritos.filter((item) => {
      const titulo = (item.titulo || '').toLowerCase();
      const autor = (item.autor || '').toLowerCase();
      const categoria = (item.categoria || '').toLowerCase();
      return titulo.includes(q) || autor.includes(q) || categoria.includes(q);
    });
  }, [favoritos, busqueda]);

  const abrirDetalle = (item) => {
    const idLibro = item.id_libro ?? item.id;
    navigation.navigate('DetalleLibro', { libro: item, idLibro, esFavorito: true });
  };

  const renderFavorito = ({ item }) => {
    const uriPortada = item.portadaUrl || item.imagen_url || item.imagen || null;
    return (
      <TouchableOpacity
        style={styles.tarjeta}
        activeOpacity={0.85}
        onPress={() => abrirDetalle(item)}
      >
        {uriPortada ? (
          <Image source={{ uri: uriPortada }} style={styles.portada} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderPortada}>
            <Ionicons name="book-outline" size={24} color="#A38B78" />
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.tituloLibro} numberOfLines={2}>
            {item.titulo || 'Sin título'}
          </Text>
          <Text style={styles.autorLibro} numberOfLines={1}>
            {item.autor || 'Autor por definir'}
          </Text>
          {item.categoria ? (
            <View style={styles.chipCategoria}>
              <Text style={styles.textoChip}>{item.categoria}</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={() => onToggleFavorito && onToggleFavorito(item)}
          style={styles.botonCorazon}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="heart" size={32} color="#8E583C" />
        </TouchableOpacity>
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
        <Text style={styles.tituloHeader}>Favoritos</Text>
        <Ionicons name="heart-outline" size={24} color="#8E583C" />
      </View>

      <View style={styles.cuerpo}>
        {/* Buscador */}
        <View style={styles.buscadorCaja}>
          <Ionicons name="search" size={18} color="#8D7563" />
          <TextInput
            style={styles.buscadorInput}
            placeholder="Buscar en favoritos.."
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

        <FlatList
          data={listaFiltrada}
          keyExtractor={(item, idx) => String(item.id_libro ?? item.id ?? idx)}
          contentContainerStyle={styles.listaContenido}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.vacio}>
              <Text style={styles.textoVacio}>
                Aún no tienes libros guardados en favoritos.
              </Text>
            </View>
          }
          renderItem={renderFavorito}
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
    gap: 10,
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
    paddingTop: 18,
    overflow: 'hidden',
  },
  buscadorCaja: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.blanco,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 18,
    marginBottom: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  buscadorInput: {
    flex: 1,
    fontSize: 15,
    color: colores.texto,
  },
  listaContenido: {
    paddingHorizontal: 18,
    paddingBottom: 28,
    gap: 14,
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.blanco,
    borderRadius: 18,
    padding: 12,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  portada: {
    width: 66,
    height: 92,
    borderRadius: 10,
    backgroundColor: '#EFE6DA',
  },
  placeholderPortada: {
    width: 66,
    height: 92,
    borderRadius: 10,
    backgroundColor: '#EFE6DA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  tituloLibro: {
    fontSize: 16,
    fontWeight: '700',
    color: colores.texto,
  },
  autorLibro: {
    fontSize: 13,
    color: '#6E5646',
    marginTop: 2,
    marginBottom: 8,
  },
  chipCategoria: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5D5C1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  textoChip: {
    fontSize: 12,
    fontWeight: '600',
    color: colores.texto,
  },
  botonCorazon: {
    padding: 4,
  },
  vacio: {
    paddingTop: 40,
    alignItems: 'center',
  },
  textoVacio: {
    color: '#7A6252',
    fontSize: 15,
    textAlign: 'center',
  },
});