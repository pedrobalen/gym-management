import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import EdicaoMembro from "./EdicaoMembro";

const formatarData = (data) => {
  const dataObj = new Date(data);
  const dia = String(dataObj.getDate()).padStart(2, "0");
  const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
  const ano = String(dataObj.getFullYear()).slice(-2);
  return `${dia}/${mes}/${ano}`;
};

const DetalhesMembros = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [membro, setMembro] = useState(null);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    const fetchMembro = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/membros/${id}`);
        const data = response.data;

        if (!data.plano_treino) {
          data.plano_treino = { categorias: [] };
        } else if (!data.plano_treino.categorias) {
          data.plano_treino.categorias = [];
        }

        setMembro(data);
      } catch (error) {
        console.error("Erro ao buscar membro:", error);
      }
    };

    fetchMembro();
  }, [id]);

  const handleRenovarAssinatura = async () => {
    const tipoPlano = prompt(
      "Digite o novo tipo de plano (mensal, trimestral, semestral):"
    ).toLowerCase();

    if (!["mensal", "trimestral", "semestral"].includes(tipoPlano)) {
      alert("Tipo de plano inválido.");
      return;
    }

    try {
      await axios.put(`http://localhost:4000/membros/renovar/${id}`, {
        tipo_plano: tipoPlano,
      });
      alert("Assinatura renovada com sucesso!");

      const response = await axios.get(`http://localhost:4000/membros/${id}`);
      setMembro(response.data);
    } catch (error) {
      console.error("Erro ao renovar assinatura:", error);
      alert("Erro ao renovar assinatura. Tente novamente.");
    }
  };

  const handleVoltar = () => {
    navigate(-1);
  };

  if (!membro) return <div>Carregando...</div>;

  return (
    <div>
      <h1>Detalhes de {membro.nome_completo}</h1>

      {editando ? (
        <EdicaoMembro membro={membro} setMembro={setMembro} />
      ) : (
        <div>
          <p>Nome Completo: {membro.nome_completo}</p>
          <p>CPF: {membro.cpf}</p>
          <p>Data de Nascimento: {formatarData(membro.data_nascimento)}</p>
          <p>Restrições: {membro.restricoes}</p>
          <p>Tipo de Plano: {membro.tipo_plano}</p>
          <p>
            Data de Término do Plano: {formatarData(membro.data_final)}{" "}
            <button onClick={handleRenovarAssinatura}>
              Renovar Assinatura
            </button>
          </p>

          <h3>Categorias de Treino:</h3>
          <ul>
            {membro.plano_treino?.categorias?.map(
              (categoria, categoriaIndex) => (
                <li key={categoriaIndex}>
                  <h4>{categoria.nome_categoria}</h4>
                  <ul>
                    {categoria.exercicios.map((exercicio, exercicioIndex) => (
                      <li key={exercicioIndex}>
                        <p>
                          <strong>Nome:</strong> {exercicio.nome_exercicio}
                        </p>
                        <p>
                          <strong>Séries:</strong> {exercicio.series}
                        </p>
                        <p>
                          <strong>Repetições:</strong> {exercicio.repeticoes}
                        </p>
                        <p>
                          <strong>Descanso (segundos):</strong>{" "}
                          {exercicio.descanso_segundos}
                        </p>
                        <p>
                          <strong>Observações:</strong> {exercicio.observacoes}
                        </p>
                      </li>
                    ))}
                  </ul>
                </li>
              )
            )}
          </ul>

          <button onClick={() => setEditando(true)}>Editar</button>
          <button onClick={handleVoltar}>Voltar</button>
        </div>
      )}
    </div>
  );
};

export default DetalhesMembros;
