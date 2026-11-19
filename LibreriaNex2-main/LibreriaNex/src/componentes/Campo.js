import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../tema';

export default function Campo({ icono, secreto, ...props }) {
  const [oculto, setOculto] = useState(!!secreto);
  return (
    <View style={styles.caja}>
      <Ionicons name={icono} size={18} color={colores.texto} />
      <TextInput
        style={styles.input}
        placeholderTextColor="#8a7566"
        secureTextEntry={oculto}
        autoCapitalize="none"
        {...props}
      />
      {secreto && (
        <TouchableOpacity onPress={() => setOculto(!oculto)}>
          <Ionicons name={oculto ? 'eye-off-outline' : 'eye-outline'} size={18} color={colores.texto} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  caja: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colores.blanco, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 12, marginTop: 12,
  },
  input: { flex: 1, color: colores.texto },
});
