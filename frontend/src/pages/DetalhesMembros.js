import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import EdicaoMembro from "./EdicaoMembro";
import "./DetalhesMembros.css";

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
    <div id="detalhes-membros-container" className="detalhes-membros-container">
      <h1 id="titulo-detalhes-membro" className="titulo">
        Detalhes de {membro.nome_completo}
      </h1>

      {editando ? (
        <div id="edicao-membro-container" className="edicao-membro-container">
          <EdicaoMembro membro={membro} setMembro={setMembro} />
        </div>
      ) : (
        <div id="detalhes-membro-info" className="detalhes-membro-info">
          <p id="nome-completo" className="info-item">
            Nome Completo: <span>{membro.nome_completo}</span>
          </p>
          <p id="cpf" className="info-item">
            CPF: <span>{membro.cpf}</span>
          </p>
          <p id="data-nascimento" className="info-item">
            Data de Nascimento: <span>{formatarData(membro.data_nascimento)}</span>
          </p>
          <p id="restricoes" className="info-item">
            Restrições: <span>{membro.restricoes}</span>
          </p>
          <p id="tipo-plano" className="info-item">
            Tipo de Plano: <span>{membro.tipo_plano}</span>
          </p>
          <p id="data-termino-plano" className="info-item">
            Data de Término do Plano: <span>{formatarData(membro.data_final)}</span>{" "}
            <button
              id="botao-renovar-assinatura"
              className="botao-renovar"
              onClick={handleRenovarAssinatura}
            >
              Renovar Assinatura
            </button>
          </p>

          <h3 id="titulo-categorias-treino" className="subtitulo">
            Categorias de Treino:
          </h3>
          <ul id="lista-categorias-treino" className="lista-categorias">
            {membro.plano_treino?.categorias?.map(
              (categoria, categoriaIndex) => (
                <li
                  key={categoriaIndex}
                  id={`categoria-${categoriaIndex}`}
                  className="categoria-item"
                >
                  <h4 className="nome-categoria">{categoria.nome_categoria}</h4>
                  <ul className="lista-exercicios">
                    {categoria.exercicios.map((exercicio, exercicioIndex) => (
                      <li
                        key={exercicioIndex}
                        id={`exercicio-${categoriaIndex}-${exercicioIndex}`}
                        className="exercicio-item"
                      >
                        <p className="exercicio-info">
                          <strong>Nome:</strong> {exercicio.nome_exercicio}
                        </p>
                        <p className="exercicio-info">
                          <strong>Séries:</strong> {exercicio.series}
                        </p>
                        <p className="exercicio-info">
                          <strong>Repetições:</strong> {exercicio.repeticoes}
                        </p>
                        <p className="exercicio-info">
                          <strong>Descanso (segundos):</strong>{" "}
                          {exercicio.descanso_segundos}
                        </p>
                        <p className="exercicio-info">
                          <strong>Observações:</strong> {exercicio.observacoes}
                        </p>
                      </li>
                    ))}
                  </ul>
                </li>
              )
            )}
          </ul>

          <button
            id="botao-editar"
            className="botao-editar"
            onClick={() => setEditando(true)}
          >
            Editar
          </button>
          <button
            id="botao-voltar"
            className="botao-voltar"
            onClick={handleVoltar}
          >
            Voltar
          </button>
        </div>
      )}
    </div>
  );
};

export default DetalhesMembros;
