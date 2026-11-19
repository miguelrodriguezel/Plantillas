import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { peticion } from '../api';
import { colores } from '../tema';

export default function DetalleLibro({ route, navigation, favoritosIds = [], onToggleFavorito }) {
  const params = route?.params || {};
  const idLibro = params.idLibro ?? params.libro?.id_libro ?? params.libro?.id;
  const [libro, setLibro] = useState(params.libro || null);
  const [cargando, setCargando] = useState(!params.libro && !!idLibro);

  useEffect(() => {
    let activo = true;
    if (!idLibro) return;
    const refrescarDetalle = async () => {
      try {
        const datos = await peticion(`/libros/${idLibro}`);
        if (activo && datos && typeof datos === 'object') {
          setLibro((prev) => ({ ...(prev || {}), ...datos }));
        }
      } catch {
      } finally {
        if (activo) setCargando(false);
      }
    };
    refrescarDetalle();
    return () => {
      activo = false;
    };
  }, [idLibro]);

  const item = libro || {};
  const uriPortada = item.portadaUrl || item.imagen_url || item.imagen || null;
  const calificacion = Number(item.calificacion ?? item.rating ?? 0);
  const resenas = item.resenas ?? item.total_resenas ?? 0;
  const esFavorito = idLibro != null && favoritosIds.includes(idLibro);

  const renderEstrellas = () => {
    const llenas = Math.max(0, Math.min(5, Math.round(calificacion)));
    return (
      <View style={styles.filaEstrellas}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Ionicons
            key={n}
            name="star"
            size={22}
            color={n <= llenas ? '#E5A93C' : '#D4CFC8'}
          />
        ))}
        <Text style={styles.textoPuntuacion}>
          {calificacion ? calificacion.toFixed(1) : '0.0'} ({resenas} reseñas)
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Barra superior */}
        <View style={styles.barraSuperior}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botonAtras}>
            <Ionicons name="arrow-back" size={24} color={colores.texto} />
          </TouchableOpacity>

          {onToggleFavorito && idLibro != null && (
            <TouchableOpacity
              onPress={() => onToggleFavorito(item)}
              style={styles.botonAtras}
            >
              <Ionicons
                name={esFavorito ? 'heart' : 'heart-outline'}
                size={24}
                color={colores.cafe}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Portada */}
        <View style={styles.portadaWrap}>
          {uriPortada ? (
            <Image
              source={{ uri: uriPortada }}
              style={styles.portada}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderPortada}>
              {cargando ? (
                <ActivityIndicator size="small" color={colores.cafe} />
              ) : (
                <Ionicons name="book-outline" size={40} color="#A38B78" />
              )}
            </View>
          )}
        </View>

        <Text style={styles.titulo}>{item.titulo || 'Título del libro'}</Text>
        <Text style={styles.autor}>{item.autor || 'Autor por definir'}</Text>

        {renderEstrellas()}

        {item.categoria ? (
          <View style={styles.badgeCategoria}>
            <Text style={styles.textoBadge}>{item.categoria}</Text>
          </View>
        ) : null}
        {/* Descripción */}
        <Text style={styles.subtitulo}>Descripción</Text>
        <Text style={styles.descripcion}>
          {item.descripcion || 'Sin descripción registrada en la base de datos.'}
        </Text>

        <Text style={styles.tituloDetalles}>Detalles</Text>
        <View style={styles.cajaDetalles}>
          <View style={styles.filaDetalle}>
            <Text style={styles.etiquetaDetalle}>Autor</Text>
            <Text style={styles.valorDetalle}>{item.autor || '-'}</Text>
          </View>
          <View style={styles.filaDetalle}>
            <Text style={styles.etiquetaDetalle}>Editorial</Text>
            <Text style={styles.valorDetalle}>{item.editorial || '-'}</Text>
          </View>
          <View style={styles.filaDetalle}>
            <Text style={styles.etiquetaDetalle}>Páginas</Text>
            <Text style={styles.valorDetalle}>{item.paginas ?? '-'}</Text>
          </View>
          <View style={styles.filaDetalle}>
            <Text style={styles.etiquetaDetalle}>Idioma</Text>
            <Text style={styles.valorDetalle}>{item.idioma || '-'}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F7F2EB',
  },
  scroll: {
    paddingHorizontal: 22,
    paddingTop: 46,
    paddingBottom: 36,
  },
  barraSuperior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  botonAtras: {
    padding: 6,
  },
  portadaWrap: {
    alignItems: 'center',
    marginBottom: 18,
  },
  portada: {
    width: 175,
    height: 245,
    borderRadius: 16,
    backgroundColor: '#EFE6DA',
  },
  placeholderPortada: {
    width: 175,
    height: 245,
    borderRadius: 16,
    backgroundColor: '#EFE6DA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 26,
    fontWeight: '700',
    color: colores.texto,
    marginBottom: 4,
  },
  autor: {
    fontSize: 16,
    color: '#6E5646',
    marginBottom: 10,
  },
  filaEstrellas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 14,
  },
  textoPuntuacion: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: colores.texto,
  },
  badgeCategoria: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5D5C1',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 16,
    marginBottom: 18,
  },
  textoBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: colores.texto,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: colores.texto,
    marginBottom: 8,
  },
  descripcion: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4F3B2D',
    marginBottom: 22,
  },
  tituloDetalles: {
    fontSize: 15,
    fontWeight: '700',
    color: '#9C6244',
    textAlign: 'center',
    marginBottom: 10,
  },
  cajaDetalles: {
    borderWidth: 1,
    borderColor: '#DECBB4',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#FBF8F3',
    gap: 8,
  },
  filaDetalle: {
    flexDirection: 'row',
    gap: 20,
  },
  etiquetaDetalle: {
    width: 72,
    fontSize: 14,
    fontWeight: '700',
    color: colores.texto,
  },
  valorDetalle: {
    flex: 1,
    fontSize: 14,
    color: '#4F3B2D',
  },
});