import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const formatarData = (data) => {
  const dataObj = new Date(data);
  const dia = String(dataObj.getDate()).padStart(2, "0");
  const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
  const ano = String(dataObj.getFullYear()).slice(-2);
  return `${dia}/${mes}/${ano}`;
};

const calcularDataTermino = (dataRegistro, tipoPlano) => {
  const dataInicio = new Date(dataRegistro);
  let dataTermino;

  switch (tipoPlano.toLowerCase()) {
    case "mensal":
      dataTermino = new Date(dataInicio.setMonth(dataInicio.getMonth() + 1));
      break;
    case "3 meses":
      dataTermino = new Date(dataInicio.setMonth(dataInicio.getMonth() + 3));
      break;
    case "semestral":
      dataTermino = new Date(dataInicio.setMonth(dataInicio.getMonth() + 6));
      break;
    case "anual":
      dataTermino = new Date(
        dataInicio.setFullYear(dataInicio.getFullYear() + 1)
      );
      break;
    default:
      return "Plano desconhecido";
  }

  return formatarData(dataTermino);
};

const DetalhesMembros = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [membro, setMembro] = useState(null);
  const [editando, setEditando] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [novoExercicio, setNovoExercicio] = useState({
    nome_exercicio: "",
    series: "",
    repeticoes: "",
    descanso_segundos: "",
    observacoes: "",
  });
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

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

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setMembro({ ...membro, [name]: value });
  };

  const atualizarMembroNoBanco = async (membroAtualizado) => {
    try {
      await axios.put(`http://localhost:4000/membros/${id}`, membroAtualizado);
      alert("Atualização automática realizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar automaticamente o membro:", error);
    }
  };

  const salvarDadosBasicos = async () => {
    try {
      await axios.put(`http://localhost:4000/membros/${id}`, membro);
      alert("Dados básicos atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar dados básicos:", error);
    }
  };

  const handleExercicioChange = (
    categoriaIndex,
    exercicioIndex,
    field,
    value
  ) => {
    const novasCategorias = [...membro.plano_treino.categorias];
    novasCategorias[categoriaIndex].exercicios[exercicioIndex] = {
      ...novasCategorias[categoriaIndex].exercicios[exercicioIndex],
      [field]: value,
    };

    const membroAtualizado = {
      ...membro,
      plano_treino: { ...membro.plano_treino, categorias: novasCategorias },
    };

    setMembro(membroAtualizado);
    atualizarMembroNoBanco(membroAtualizado);
  };

  const handleAdicionarExercicio = () => {
    if (categoriaSelecionada === null) return;

    const novasCategorias = [...membro.plano_treino.categorias];
    novasCategorias[categoriaSelecionada].exercicios.push(novoExercicio);

    const membroAtualizado = {
      ...membro,
      plano_treino: { ...membro.plano_treino, categorias: novasCategorias },
    };

    setMembro(membroAtualizado);
    atualizarMembroNoBanco(membroAtualizado);

    setNovoExercicio({
      nome_exercicio: "",
      series: "",
      repeticoes: "",
      descanso_segundos: "",
      observacoes: "",
    });
  };

  const handleAdicionarCategoria = () => {
    const novasCategorias = [
      ...membro.plano_treino.categorias,
      { nome_categoria: novaCategoria, exercicios: [] },
    ];

    const membroAtualizado = {
      ...membro,
      plano_treino: { ...membro.plano_treino, categorias: novasCategorias },
    };

    setMembro(membroAtualizado);
    atualizarMembroNoBanco(membroAtualizado);

    setNovaCategoria("");
  };

  const handleExcluirCategoria = (categoriaIndex) => {
    const novasCategorias = membro.plano_treino.categorias.filter(
      (_, index) => index !== categoriaIndex
    );

    const membroAtualizado = {
      ...membro,
      plano_treino: { ...membro.plano_treino, categorias: novasCategorias },
    };

    setMembro(membroAtualizado);
    atualizarMembroNoBanco(membroAtualizado);
  };

  const handleExcluirExercicio = (categoriaIndex, exercicioIndex) => {
    const novasCategorias = [...membro.plano_treino.categorias];
    novasCategorias[categoriaIndex].exercicios = novasCategorias[
      categoriaIndex
    ].exercicios.filter((_, index) => index !== exercicioIndex);

    const membroAtualizado = {
      ...membro,
      plano_treino: { ...membro.plano_treino, categorias: novasCategorias },
    };

    setMembro(membroAtualizado);
    atualizarMembroNoBanco(membroAtualizado);
  };

  const handleVoltar = () => {
    navigate(-1);
  };

  if (!membro) return <div>Carregando...</div>;

  const dataTermino = calcularDataTermino(
    membro.data_registro,
    membro.tipo_plano
  );

  return (
    <div>
      <h1>Detalhes de {membro.nome_completo}</h1>

      {editando ? (
        <div>
          <label>Nome Completo:</label>
          <input
            type="text"
            name="nome_completo"
            value={membro.nome_completo}
            onChange={handleInputChange}
          />

          <label>CPF:</label>
          <input
            type="text"
            name="cpf"
            value={membro.cpf}
            onChange={handleInputChange}
          />

          <label>Data de Nascimento:</label>
          <input
            type="date"
            name="data_nascimento"
            value={new Date(membro.data_nascimento).toISOString().slice(0, 10)}
            onChange={handleInputChange}
          />

          <label>Restrições:</label>
          <input
            type="text"
            name="restricoes"
            value={membro.restricoes}
            onChange={handleInputChange}
          />

          <label>Tipo de Plano:</label>
          <select
            name="tipo_plano"
            value={membro.tipo_plano}
            onChange={handleInputChange}
          >
            <option value="mensal">Mensal</option>
            <option value="3 meses">3 Meses</option>
            <option value="semestral">Semestral</option>
            <option value="anual">Anual</option>
          </select>

          <label>Objetivo do Plano de Treino:</label>
          <input
            type="text"
            name="plano_treino_objetivo"
            value={membro.plano_treino?.objetivo || ""}
            onChange={(e) =>
              setMembro({
                ...membro,
                plano_treino: {
                  ...membro.plano_treino,
                  objetivo: e.target.value,
                },
              })
            }
          />
          <button onClick={salvarDadosBasicos}>Salvar</button>

          <h3>Categorias de Treino:</h3>
          {membro.plano_treino?.categorias?.map((categoria, categoriaIndex) => (
            <div key={categoriaIndex}>
              <h4>{categoria.nome_categoria}</h4>
              <button onClick={() => handleExcluirCategoria(categoriaIndex)}>
                Excluir Categoria
              </button>

              {categoria.exercicios.map((exercicio, exercicioIndex) => (
                <div key={exercicioIndex}>
                  <label>Nome do Exercício:</label>
                  <input
                    type="text"
                    value={exercicio.nome_exercicio}
                    onChange={(e) =>
                      handleExercicioChange(
                        categoriaIndex,
                        exercicioIndex,
                        "nome_exercicio",
                        e.target.value
                      )
                    }
                  />

                  <label>Séries:</label>
                  <input
                    type="number"
                    value={exercicio.series}
                    onChange={(e) =>
                      handleExercicioChange(
                        categoriaIndex,
                        exercicioIndex,
                        "series",
                        e.target.value
                      )
                    }
                  />

                  <label>Repetições:</label>
                  <input
                    type="number"
                    value={exercicio.repeticoes}
                    onChange={(e) =>
                      handleExercicioChange(
                        categoriaIndex,
                        exercicioIndex,
                        "repeticoes",
                        e.target.value
                      )
                    }
                  />

                  <label>Descanso (segundos):</label>
                  <input
                    type="number"
                    value={exercicio.descanso_segundos}
                    onChange={(e) =>
                      handleExercicioChange(
                        categoriaIndex,
                        exercicioIndex,
                        "descanso_segundos",
                        e.target.value
                      )
                    }
                  />

                  <label>Observações:</label>
                  <input
                    type="text"
                    value={exercicio.observacoes}
                    onChange={(e) =>
                      handleExercicioChange(
                        categoriaIndex,
                        exercicioIndex,
                        "observacoes",
                        e.target.value
                      )
                    }
                  />

                  <button
                    onClick={() =>
                      handleExcluirExercicio(categoriaIndex, exercicioIndex)
                    }
                  >
                    Excluir Exercício
                  </button>
                </div>
              ))}
            </div>
          ))}

          <h3>Adicionar Nova Categoria:</h3>
          <input
            type="text"
            value={novaCategoria}
            placeholder="Nome da nova categoria"
            onChange={(e) => setNovaCategoria(e.target.value)}
          />
          <button onClick={handleAdicionarCategoria}>
            Adicionar Categoria
          </button>

          <h3>Adicionar Novo Exercício à Categoria:</h3>
          <select
            value={categoriaSelecionada}
            onChange={(e) => setCategoriaSelecionada(e.target.value)}
          >
            <option value="">Selecione uma categoria</option>
            {membro.plano_treino?.categorias?.map((categoria, index) => (
              <option key={index} value={index}>
                {categoria.nome_categoria}
              </option>
            ))}
          </select>

          <label>Nome do Exercício:</label>
          <input
            type="text"
            value={novoExercicio.nome_exercicio}
            onChange={(e) =>
              setNovoExercicio({
                ...novoExercicio,
                nome_exercicio: e.target.value,
              })
            }
          />

          <label>Séries:</label>
          <input
            type="number"
            value={novoExercicio.series}
            onChange={(e) =>
              setNovoExercicio({ ...novoExercicio, series: e.target.value })
            }
          />

          <label>Repetições:</label>
          <input
            type="number"
            value={novoExercicio.repeticoes}
            onChange={(e) =>
              setNovoExercicio({ ...novoExercicio, repeticoes: e.target.value })
            }
          />

          <label>Descanso (segundos):</label>
          <input
            type="number"
            value={novoExercicio.descanso_segundos}
            onChange={(e) =>
              setNovoExercicio({
                ...novoExercicio,
                descanso_segundos: e.target.value,
              })
            }
          />

          <label>Observações:</label>
          <input
            type="text"
            value={novoExercicio.observacoes}
            onChange={(e) =>
              setNovoExercicio({
                ...novoExercicio,
                observacoes: e.target.value,
              })
            }
          />

          <button onClick={handleAdicionarExercicio}>
            Adicionar Exercício
          </button>

          <button onClick={handleVoltar}>Voltar</button>
        </div>
      ) : (
        <div>
          <p>Nome Completo: {membro.nome_completo}</p>
          <p>CPF: {membro.cpf}</p>
          <p>Data de Nascimento: {formatarData(membro.data_nascimento)}</p>
          <p>Restrições: {membro.restricoes}</p>
          <p>Tipo de Plano: {membro.tipo_plano}</p>
          <p>Data de Registro: {formatarData(membro.data_registro)}</p>
          <p>Data de Término do Plano: {dataTermino}</p>
          <p>
            Objetivo do Plano de Treino:{" "}
            {membro.plano_treino?.objetivo || "Nenhum objetivo definido"}
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
