import { useContext, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Campo from '../componentes/Campo';
import { SesionContext } from '../sesion';
import { peticion } from '../api';
import { colores, estilos } from '../tema';

export default function Login({ navigation }) {
  const { setUsuario } = useContext(SesionContext);
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);

  const entrar = async () => {
    setCargando(true);
    try {
      const usuario = await peticion('/login', {
        method: 'POST',
        body: { correo, contrasena },
      });
      setUsuario(usuario);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={estilos.pantalla}>
      <View style={estilos.logo}>
        <Ionicons name="book-outline" size={80} color={colores.cafe} />
        <Text style={estilos.titulo}>LibreriaNex</Text>
      </View>

      <Campo icono="mail-outline" placeholder="Correo electronico"
        keyboardType="email-address" value={correo} onChangeText={setCorreo} />
      <Campo icono="lock-closed-outline" placeholder="Contraseña" secreto
        value={contrasena} onChangeText={setContrasena} />

      <TouchableOpacity style={estilos.boton} onPress={entrar} disabled={cargando}>
        <Text style={estilos.textoBoton}>{cargando ? 'Entrando...' : 'Inicio de sesion →'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={estilos.botonClaro} onPress={() => navigation.navigate('Registro')}>
        <Text style={estilos.textoBotonClaro}>Registrarse</Text>
      </TouchableOpacity>
    </View>
  );
}