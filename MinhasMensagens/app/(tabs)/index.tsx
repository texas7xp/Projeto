import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import axios from "axios";

export default function App() {
  const [nome, setNome] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [mensagens, setMensagens] = useState([]);
  const flatListRef = useRef();

  // ⚠️ Coloque aqui o link do seu backend Render
  const API = "https://chat-backend-rfl9.onrender.com";

  // Buscar mensagens
  const buscarMensagens = async () => {
    try {
      const res = await axios.get(`${API}/mensagens`);
      let lista = res.data;

      // Padroniza o formato
      if (!Array.isArray(lista)) {
        if (lista.rows) lista = lista.rows;
        else if (lista.mensagens) lista = lista.mensagens;
        else lista = Object.values(lista);
      }

      const formatado = lista.map((item, idx) => ({
        id: item.id ?? idx,
        nome: item.nome ?? "Anônimo",
        mensagem: item.mensagem ?? item.texto ?? "",
      }));

      setMensagens(formatado);
    } catch (err) {
      console.error("Erro ao buscar mensagens:", err);
      Alert.alert("Erro", "Não foi possível buscar mensagens.");
    }
  };

  // Enviar mensagem
  const enviarMensagem = async () => {
    if (!nome.trim() || !mensagem.trim()) {
      Alert.alert("Aviso", "Preencha nome e mensagem!");
      return;
    }

    try {
      await axios.post(`${API}/mensagens`, { nome, mensagem });
      setMensagem("");
      buscarMensagens();
    } catch (err) {
      console.error("Erro ao enviar:", err);
      Alert.alert("Erro", "Não foi possível enviar a mensagem.");
    }
  };

  // Excluir mensagem com confirmação
  const excluirMensagem = (id) => {
    Alert.alert(
      "Confirmação",
      "Deseja realmente excluir esta mensagem?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API}/mensagens/${id}`);
              buscarMensagens();
            } catch (err) {
              console.error("Erro ao excluir:", err);
              Alert.alert("Erro", "Não foi possível excluir a mensagem.");
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    buscarMensagens();
    // Atualiza mensagens a cada 5 segundos
    const interval = setInterval(buscarMensagens, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>💬 Chat Online</Text>

      <TextInput
        style={styles.input}
        placeholder="Seu nome"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Digite sua mensagem..."
        value={mensagem}
        onChangeText={setMensagem}
        multiline
      />

      <Button title="Enviar" onPress={enviarMensagem} />

      <FlatList
        ref={flatListRef}
        data={mensagens}
        keyExtractor={(item, idx) => String(item.id ?? idx)}
        renderItem={({ item }) => (
          <View style={styles.mensagem}>
            <Text style={{ marginBottom: 5 }}>
              <Text style={{ fontWeight: "bold" }}>{item.nome}:</Text> {item.mensagem}
            </Text>
            <Button
              title="Excluir"
              color="red"
              onPress={() => excluirMensagem(item.id)}
            />
          </View>
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: "center", marginTop: 10 }}>Nenhuma mensagem ainda</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    padding: 20,
    paddingTop: 50,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  mensagem: {
    backgroundColor: "#fff",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
});
