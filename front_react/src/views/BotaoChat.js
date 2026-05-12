import { useState, useEffect } from "react";
import { MessageCircle, X } from "react-feather";
import ChatPrivado from "./ChatPrivado";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";

/**
 * BotaoChat — botão flutuante de mensagens privadas
 * Adicionar no fundo de PainelProfessor e PainelAluno:
 * <BotaoChat />
 */
const BotaoChat = () => {
  const { user }  = useAuth();
  const [aberto,    setAberto]    = useState(false);
  const [naoLidas,  setNaoLidas]  = useState(0);

  // Verificar mensagens não lidas periodicamente
  useEffect(() => {
    verificarNaoLidas();
    const intervalo = setInterval(verificarNaoLidas, 15000); // cada 15s
    return () => clearInterval(intervalo);
  }, []);

  const verificarNaoLidas = async () => {
    try {
      const { data } = await api.get("/mensagens/nao-lidas");
      setNaoLidas(data.nao_lidas || 0);
    } catch (_) {}
  };

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setAberto(!aberto)}
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: aberto ? "#128c7e" : "#075e54",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(7,94,84,0.4)",
          zIndex: 1040,
          transition: "all 0.3s",
          transform: aberto ? "scale(0.95)" : "scale(1)",
        }}
        title="Mensagens privadas"
      >
        {aberto
          ? <X size={24} color="white" />
          : <MessageCircle size={24} color="white" />
        }

        {/* Badge de não lidas */}
        {!aberto && naoLidas > 0 && (
          <div style={{
            position: "absolute",
            top: "-4px",
            right: "-4px",
            backgroundColor: "#f5365c",
            color: "white",
            borderRadius: "50%",
            width: "22px",
            height: "22px",
            fontSize: "0.7rem",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid white",
          }}>
            {naoLidas > 9 ? "9+" : naoLidas}
          </div>
        )}
      </button>

      {/* Modal de chat privado */}
      <ChatPrivado
        isOpen={aberto}
        toggle={() => setAberto(false)}
        onMensagemLida={verificarNaoLidas}
      />
    </>
  );
};

export default BotaoChat;
