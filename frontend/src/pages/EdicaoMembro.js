import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./EdicaoMembro.css";

const EdicaoMembro = ({ membro, setMembro }) => {
  const navigate = useNavigate();
  const [novaCategoria, setNovaCategoria] = useState("");
  const [novoExercicio, setNovoExercicio] = useState({
    nome_exercicio: "",
    series: "",
    repeticoes: "",
    descanso_segundos: "",
    observacoes: "",
  });
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setMembro({ ...membro, [name]: value });
  };

  const atualizarMembroNoBanco = async (membroAtualizado) => {
    try {
      await axios.put(
        `http://localhost:4000/membros/${membro.id}`,
        membroAtualizado
      );
      alert("Atualização automática realizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar automaticamente o membro:", error);
    }
  };

  const salvarDadosBasicos = async () => {
    try {
      await axios.put(`http://localhost:4000/membros/${membro.id}`, membro);
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

  return (
    <div id="edicao-membro-container" className="edicao-membro-container">
      <h1 className="titulo-edicao">Edição de Membro</h1>

      <div className="dados-basicos">
        <label htmlFor="nome_completo">Nome Completo:</label>
        <input
          type="text"
          id="nome_completo"
          className="input-nome-completo"
          name="nome_completo"
          value={membro.nome_completo}
          onChange={handleInputChange}
        />

        <label htmlFor="cpf">CPF:</label>
        <input
          type="text"
          id="cpf"
          className="input-cpf"
          name="cpf"
          value={membro.cpf}
          onChange={handleInputChange}
        />

        <label htmlFor="data_nascimento">Data de Nascimento:</label>
        <input
          type="date"
          id="data_nascimento"
          className="input-data-nascimento"
          name="data_nascimento"
          value={new Date(membro.data_nascimento).toISOString().slice(0, 10)}
          onChange={handleInputChange}
        />

        <label htmlFor="restricoes">Restrições:</label>
        <input
          type="text"
          id="restricoes"
          className="input-restricoes"
          name="restricoes"
          value={membro.restricoes}
          onChange={handleInputChange}
        />

        <label htmlFor="tipo_plano">Tipo de Plano:</label>
        <select
          id="tipo_plano"
          className="select-tipo-plano"
          name="tipo_plano"
          value={membro.tipo_plano}
          onChange={handleInputChange}
        >
          <option value="mensal">Mensal</option>
          <option value="trimestral">Trimestral</option>
          <option value="semestral">Semestral</option>
        </select>

        <button
          id="botao-salvar-basicos"
          className="botao-salvar"
          onClick={salvarDadosBasicos}
        >
          Salvar
        </button>
      </div>

      <h3 className="titulo-categorias">Categorias de Treino:</h3>
      {membro.plano_treino?.categorias?.map((categoria, categoriaIndex) => (
        <div
          key={categoriaIndex}
          id={`categoria-${categoriaIndex}`}
          className="categoria-container"
        >
          <h4 className="nome-categoria">{categoria.nome_categoria}</h4>
          <button
            id={`botao-excluir-categoria-${categoriaIndex}`}
            className="botao-excluir"
            onClick={() => handleExcluirCategoria(categoriaIndex)}
          >
            Excluir Categoria
          </button>

          {categoria.exercicios.map((exercicio, exercicioIndex) => (
            <div
              key={exercicioIndex}
              id={`exercicio-${categoriaIndex}-${exercicioIndex}`}
              className="exercicio-container"
            >
              <label>Nome do Exercício:</label>
              <input
                type="text"
                className="input-nome-exercicio"
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
                className="input-series"
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
                className="input-repeticoes"
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
                className="input-descanso"
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
                className="input-observacoes"
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
                id={`botao-excluir-exercicio-${categoriaIndex}-${exercicioIndex}`}
                className="botao-excluir"
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

      <h3 className="titulo-adicionar-categoria">Adicionar Nova Categoria:</h3>
      <input
        type="text"
        id="nova-categoria"
        className="input-nova-categoria"
        value={novaCategoria}
        placeholder="Nome da nova categoria"
        onChange={(e) => setNovaCategoria(e.target.value)}
      />
      <button
        id="botao-adicionar-categoria"
        className="botao-adicionar"
        onClick={handleAdicionarCategoria}
      >
        Adicionar Categoria
      </button>

      <h3 className="titulo-adicionar-exercicio">
        Adicionar Novo Exercício à Categoria:
      </h3>
      <select
        id="select-categoria"
        className="select-categoria"
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
        id="nome-exercicio"
        className="input-nome-exercicio"
        value={novoExercicio.nome_exercicio}
        onChange={(e) =>
          setNovoExercicio({ ...novoExercicio, nome_exercicio: e.target.value })
        }
      />

      <label>Séries:</label>
      <input
        type="number"
        id="series"
        className="input-series"
        value={novoExercicio.series}
        onChange={(e) =>
          setNovoExercicio({ ...novoExercicio, series: e.target.value })
        }
      />

      <label>Repetições:</label>
      <input
        type="number"
        id="repeticoes"
        className="input-repeticoes"
        value={novoExercicio.repeticoes}
        onChange={(e) =>
          setNovoExercicio({ ...novoExercicio, repeticoes: e.target.value })
        }
      />

      <label>Descanso (segundos):</label>
      <input
        type="number"
        id="descanso-segundos"
        className="input-descanso"
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
        id="observacoes"
        className="input-observacoes"
        value={novoExercicio.observacoes}
        onChange={(e) =>
          setNovoExercicio({ ...novoExercicio, observacoes: e.target.value })
        }
      />

      <button
        id="botao-adicionar-exercicio"
        className="botao-adicionar"
        onClick={handleAdicionarExercicio}
      >
        Adicionar Exercício
      </button>
      <button onClick={() => navigate(-1)} className="botao-voltar">
        Voltar
      </button>
    </div>
  );
};

export default EdicaoMembro;
