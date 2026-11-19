import { useContext, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Campo from '../componentes/Campo';
import { SesionContext } from '../sesion';
import { peticion } from '../api';
import { colores, estilos } from '../tema';

export default function Registro({ navigation }) {
  const { setUsuario } = useContext(SesionContext);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [cargando, setCargando] = useState(false);

  const registrar = async () => {
    if (!nombre || !correo || !contrasena) return Alert.alert('Completa todos los campos');
    if (contrasena.length < 6) return Alert.alert('La contraseña debe tener al menos 6 caracteres');
    if (contrasena !== confirmar) return Alert.alert('Las contraseñas no coinciden');

    setCargando(true);
    try {
      const usuario = await peticion('/registro', {
        method: 'POST',
        body: { nombre, correo, contrasena },
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
        <Ionicons name="book-outline" size={64} color={colores.cafe} />
        <Text style={estilos.titulo}>Crear cuenta</Text>
        <Text style={estilos.subtitulo}>Unete a nuestra libreria</Text>
      </View>

      <Campo icono="person-outline" placeholder="Nombre completo"
        autoCapitalize="words" value={nombre} onChangeText={setNombre} />
      <Campo icono="mail-outline" placeholder="Correo electronico"
        keyboardType="email-address" value={correo} onChangeText={setCorreo} />
      <Campo icono="lock-closed-outline" placeholder="Contraseña" secreto
        value={contrasena} onChangeText={setContrasena} />
      <Campo icono="lock-closed-outline" placeholder="Confirmar contraseña" secreto
        value={confirmar} onChangeText={setConfirmar} />

      <TouchableOpacity style={estilos.boton} onPress={registrar} disabled={cargando}>
        <Text style={estilos.textoBoton}>{cargando ? 'Creando...' : 'Registrarse →'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={estilos.enlace}>¿Ya tienes una cuenta? Iniciar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}