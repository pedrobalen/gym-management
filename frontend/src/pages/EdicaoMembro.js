import React, { useState } from "react";
import axios from "axios";

const EdicaoMembro = ({ membro, setMembro }) => {
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

  // Função que atualiza o membro no banco de dados
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

  // Função que salva os dados básicos
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
    atualizarMembroNoBanco(membroAtualizado); // Atualiza o membro automaticamente no banco
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
        <option value="trimestral">Trimestral</option>
        <option value="semestral">Semestral</option>
      </select>

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
      <button onClick={handleAdicionarCategoria}>Adicionar Categoria</button>

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
          setNovoExercicio({ ...novoExercicio, nome_exercicio: e.target.value })
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
          setNovoExercicio({ ...novoExercicio, observacoes: e.target.value })
        }
      />

      <button onClick={handleAdicionarExercicio}>Adicionar Exercício</button>
    </div>
  );
};

export default EdicaoMembro;
