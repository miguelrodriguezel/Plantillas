import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SesionContext } from './src/sesion';
import { peticion } from './src/api';
import Login from './src/pantalla/login';
import Registro from './src/pantallas/Registro';
import Libros from './src/pantallas/Libros';
import DetalleLibro from './src/pantallas/DetalleLibro';
import Favoritos from './src/pantallas/Favoritos';
import { colores } from './src/tema';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const Pendiente = ({ route }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colores.fondo }}>
    <Text style={{ color: colores.texto, fontSize: 18 }}>{route.name}</Text>
  </View>
);

function Tabs({ favoritos, favoritosIds, onToggleFavorito }) {
  const iconos = {
    Inicio: 'home-outline',
    Libros: 'book-outline',
    Favoritos: 'heart-outline',
    Perfil: 'person-circle-outline',
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colores.cafe,
        tabBarInactiveTintColor: colores.texto,
        tabBarStyle: { backgroundColor: colores.fondo },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={iconos[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Inicio" component={Pendiente} />
      <Tab.Screen name="Libros">
        {(props) => (
          <Libros
            {...props}
            favoritosIds={favoritosIds}
            onToggleFavorito={onToggleFavorito}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Favoritos">
        {(props) => (
          <Favoritos
            {...props}
            favoritos={favoritos}
            onToggleFavorito={onToggleFavorito}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Perfil" component={Pendiente} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [favoritos, setFavoritos] = useState([]);

  const idUsuario = usuario?.id_usuario ?? usuario?.id;

  useEffect(() => {
    let activo = true;
    if (!idUsuario) {
      setFavoritos([]);
      return;
    }
    const cargarFavoritos = async () => {
      try {
        const lista = await peticion(`/favoritos/${idUsuario}`);
        if (activo && Array.isArray(lista)) {
          setFavoritos(lista);
        }
      } catch {
        // Si aún no hay favoritos o el servidor no responde, mantiene lista local
      }
    };
    cargarFavoritos();
    return () => {
      activo = false;
    };
  }, [idUsuario]);

  const favoritosIds = favoritos.map((item) => item.id_libro ?? item.id);

  const toggleFavorito = async (libro) => {
    const idLibro = libro?.id_libro ?? libro?.id;
    if (idLibro == null) return;

    const yaExiste = favoritosIds.includes(idLibro);
    setFavoritos((prev) =>
      yaExiste
        ? prev.filter((item) => (item.id_libro ?? item.id) !== idLibro)
        : [libro, ...prev]
    );

    if (!idUsuario) return;
    try {
      if (yaExiste) {
        await peticion(`/favoritos/${idUsuario}/${idLibro}`, { method: 'DELETE' });
      } else {
        await peticion('/favoritos', {
          method: 'POST',
          body: { id_usuario: idUsuario, id_libro: idLibro },
        });
      }
    } catch {
      // Mantiene el cambio visual en la app si el endpoint aún está en pruebas
    }
  };

  return (
    <SesionContext.Provider value={{ usuario, setUsuario }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {usuario ? (
            <>
              <Stack.Screen name="Tabs">
                {(props) => (
                  <Tabs
                    {...props}
                    favoritos={favoritos}
                    favoritosIds={favoritosIds}
                    onToggleFavorito={toggleFavorito}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="DetalleLibro">
                {(props) => (
                  <DetalleLibro
                    {...props}
                    favoritosIds={favoritosIds}
                    onToggleFavorito={toggleFavorito}
                  />
                )}
              </Stack.Screen>
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Registro" component={Registro} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SesionContext.Provider>
  );
}