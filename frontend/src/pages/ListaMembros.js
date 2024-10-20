import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import "./ListaMembros.css";

const formatarData = (data) => {
  if (!data) return "Data inválida";
  const dataObj = new Date(data);
  if (isNaN(dataObj.getTime())) return "Data inválida";

  const dia = String(dataObj.getDate()).padStart(2, "0");
  const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
  const ano = String(dataObj.getFullYear()).slice(-2);
  return `${dia}/${mes}/${ano}`;
};

const ListaMembros = () => {
  const navigate = useNavigate();

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
      console.log(
        "Dados que serão enviados:",
        JSON.stringify(novoMembro, null, 2)
      );

      console.log("Dados do novo membro:", novoMembro);

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
      console.error(
        "Erro ao adicionar membro:",
        error.response ? error.response.data : error.message
      );
      alert("Erro ao adicionar membro. Verifique os dados e tente novamente.");
    }
  };

  const membrosFiltrados = membros.filter(
    (membro) =>
      membro.nome_completo.toLowerCase().includes(filtro.toLowerCase()) ||
      membro.cpf.includes(filtro)
  );

  return (
    <div id="lista-membros-container">
      <h1 className="titulo">Lista de Membros</h1>

      <h2 className="subtitulo">Adicionar Novo Membro</h2>
      <div id="adicionar-membro-form">
        <label htmlFor="nome_completo">Nome Completo:</label>
        <input
          id="nome_completo"
          type="text"
          name="nome_completo"
          value={novoMembro.nome_completo}
          onChange={handleNovoMembroChange}
          className="input-form"
        />

        <label htmlFor="cpf">CPF:</label>
        <input
          id="cpf"
          type="text"
          name="cpf"
          value={novoMembro.cpf}
          onChange={handleNovoMembroChange}
          className="input-form"
        />

        <label htmlFor="data_nascimento">Data de Nascimento:</label>
        <input
          id="data_nascimento"
          type="date"
          name="data_nascimento"
          value={novoMembro.data_nascimento}
          onChange={handleNovoMembroChange}
          className="input-form"
        />

        <label htmlFor="restricoes">Restrições:</label>
        <input
          id="restricoes"
          type="text"
          name="restricoes"
          value={novoMembro.restricoes}
          onChange={handleNovoMembroChange}
          className="input-form"
        />

        <label htmlFor="tipo_plano">Tipo de Plano:</label>
        <select
          id="tipo_plano"
          name="tipo_plano"
          value={novoMembro.tipo_plano}
          onChange={handleNovoMembroChange}
          className="select-form"
        >
          <option value="mensal">Mensal</option>
          <option value="trimestral">Trimestral</option>
          <option value="semestral">Semestral</option>
        </select>

        <button id="botao-adicionar-membro" onClick={handleAdicionarMembro} className="button">
          Adicionar Membro
        </button>

        <button id="botao-voltar" onClick={() => navigate(-1)} className="button button-secondary">
          Voltar
        </button>
      </div>

      <div id="filtro-container">
        <input
          id="filtro"
          type="text"
          placeholder="Buscar por nome ou CPF"
          value={filtro}
          onChange={handleFiltroChange}
          className="input-filtro"
        />
      </div>

      <table id="tabela-membros" className="tabela-membros">
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
                  <Link to={`/membros/${membro.id}`} className="link-membro">
                    {membro.nome_completo}
                  </Link>
                </td>
                <td>{membro.cpf}</td>
                <td>{formatarData(membro.data_nascimento)}</td>
                <td>{membro.restricoes}</td>
                <td>{membro.tipo_plano}</td>
                <td>{formatarData(membro.data_registro)}</td>
                <td>{formatarData(membro.data_final)}</td>
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
