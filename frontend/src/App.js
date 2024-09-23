import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import ListaMembros from "./pages/ListaMembros";
import DetalhesMembros from "./pages/DetalhesMembros"; 

function Home() {
  return (
    <div>
      <h1>Bem-vindo ao Sistema de Gerenciamento de Academia</h1>
      <p>Escolha uma opção abaixo:</p>
      <ul>
        <li>
          <Link to="/membros">Ver Lista de Membros</Link>
        </li>
      </ul>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/membros" element={<ListaMembros />} />
        <Route path="/membros/:id" element={<DetalhesMembros />} />{" "}
      </Routes>
    </Router>
  );
}

export default App;
