import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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

  return dataTermino;
};

const ListaMembros = () => {
  const [membros, setMembros] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [novoMembro, setNovoMembro] = useState({
    nome_completo: "",
    cpf: "",
    data_nascimento: "",
    restricoes: "",
    tipo_plano: "mensal",
    plano_treino: { categorias: [] },
  });

  useEffect(() => {
    const fetchMembros = async () => {
      try {
        const response = await axios.get("http://localhost:4000/membros");
        setMembros(response.data);
      } catch (error) {
        console.error("Erro ao buscar membros:", error);
      }
    };

    fetchMembros();
  }, []);

  const handleFiltroChange = (e) => {
    setFiltro(e.target.value);
  };

  const handleNovoMembroChange = (e) => {
    const { name, value } = e.target;
    setNovoMembro({ ...novoMembro, [name]: value });
  };

  const handleAdicionarMembro = async () => {
    try {
      if (
        !novoMembro.nome_completo ||
        !novoMembro.cpf ||
        !novoMembro.data_nascimento
      ) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
      }

      const response = await axios.post(
        "http://localhost:4000/membros",
        novoMembro
      );
      alert("Novo membro adicionado com sucesso!");
      setMembros([...membros, { id: response.data.id, ...novoMembro }]);
      setNovoMembro({
        nome_completo: "",
        cpf: "",
        data_nascimento: "",
        restricoes: "",
        tipo_plano: "mensal",
        plano_treino: { categorias: [] },
      });
    } catch (error) {
      console.error("Erro ao adicionar membro:", error);
      alert("Erro ao adicionar membro. Verifique os dados e tente novamente.");
    }
  };

  const membrosFiltrados = membros.filter(
    (membro) =>
      membro.nome_completo.toLowerCase().includes(filtro.toLowerCase()) ||
      membro.cpf.includes(filtro)
  );

  return (
    <div>
      <h1>Lista de Membros</h1>

      <h2>Adicionar Novo Membro</h2>
      <div>
        <label>Nome Completo:</label>
        <input
          type="text"
          name="nome_completo"
          value={novoMembro.nome_completo}
          onChange={handleNovoMembroChange}
        />

        <label>CPF:</label>
        <input
          type="text"
          name="cpf"
          value={novoMembro.cpf}
          onChange={handleNovoMembroChange}
        />

        <label>Data de Nascimento:</label>
        <input
          type="date"
          name="data_nascimento"
          value={novoMembro.data_nascimento}
          onChange={handleNovoMembroChange}
        />

        <label>Restrições:</label>
        <input
          type="text"
          name="restricoes"
          value={novoMembro.restricoes}
          onChange={handleNovoMembroChange}
        />

        <label>Tipo de Plano:</label>
        <select
          name="tipo_plano"
          value={novoMembro.tipo_plano}
          onChange={handleNovoMembroChange}
        >
          <option value="mensal">Mensal</option>
          <option value="3 meses">3 Meses</option>
          <option value="semestral">Semestral</option>
          <option value="anual">Anual</option>
        </select>

        <button onClick={handleAdicionarMembro}>Adicionar Membro</button>
      </div>

      <div>
        <input
          type="text"
          placeholder="Buscar por nome ou CPF"
          value={filtro}
          onChange={handleFiltroChange}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Nome Completo</th>
            <th>CPF</th>
            <th>Data de Nascimento</th>
            <th>Restrições</th>
            <th>Tipo de Plano</th>
            <th>Data de Registro</th>
            <th>Data de Término</th>
          </tr>
        </thead>
        <tbody>
          {membrosFiltrados.length > 0 ? (
            membrosFiltrados.map((membro) => (
              <tr key={membro.id}>
                <td>
                  <Link to={`/membros/${membro.id}`}>
                    {membro.nome_completo}
                  </Link>
                </td>
                <td>{membro.cpf}</td>
                <td>{formatarData(membro.data_nascimento)}</td>
                <td>{membro.restricoes}</td>
                <td>{membro.tipo_plano}</td>
                <td>{formatarData(membro.data_registro)}</td>
                <td>
                  {formatarData(
                    calcularDataTermino(membro.data_registro, membro.tipo_plano)
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">Nenhum membro encontrado</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ListaMembros;
