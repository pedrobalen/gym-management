const express = require("express");
const bodyParser = require("body-parser");
const db = require("./firebase");
const cors = require("cors");
const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post("/membros", async (req, res) => {
  try {
    console.log(
      "Dados recebidos no backend:",
      JSON.stringify(req.body, null, 2)
    );
    const {
      nome_completo,
      data_nascimento,
      cpf,
      restricoes,
      tipo_plano,
      plano_treino,
    } = req.body;

    const data_registro = new Date();
    let data_final;

    switch (tipo_plano.toLowerCase()) {
      case "mensal":
        data_final = new Date(data_registro);
        data_final.setMonth(data_final.getMonth() + 1);
        break;
      case "trimestral":
        data_final = new Date(data_registro);
        data_final.setMonth(data_final.getMonth() + 3);
        break;
      case "semestral":
        data_final = new Date(data_registro);
        data_final.setMonth(data_final.getMonth() + 6);
        break;
      default:
        return res.status(400).json({ error: "Tipo de plano inválido" });
    }

    const membro = {
      nome_completo,
      data_nascimento,
      cpf,
      restricoes,
      tipo_plano,
      data_registro: data_registro.toISOString(),
      data_final: data_final.toISOString(),
      plano_treino,
    };

    const docRef = await db.collection("membros").add(membro);
    res
      .status(200)
      .json({ message: "Membro adicionado com sucesso!", id: docRef.id });
  } catch (error) {
    console.error("Erro ao adicionar membro:", error);
    res.status(500).json({ error: "Erro ao adicionar membro." });
  }
});

app.get("/membros", async (req, res) => {
  try {
    const snapshot = await db.collection("membros").get();
    const membros = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(membros);
  } catch (error) {
    console.error("Erro ao buscar membros:", error);
    res.status(500).json({ error: "Erro ao buscar membros." });
  }
});

app.get("/membros/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("membros").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Membro não encontrado" });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Erro ao buscar membro:", error);
    res.status(500).json({ error: "Erro ao buscar membro." });
  }
});

app.get("/membros/nome/:nome_completo", async (req, res) => {
  try {
    const { nome_completo } = req.params;
    const snapshot = await db
      .collection("membros")
      .where("nome_completo", "==", nome_completo)
      .get();

    if (snapshot.empty) {
      return res
        .status(404)
        .json({ error: "Nenhum membro encontrado com esse nome." });
    }

    const membros = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(membros);
  } catch (error) {
    console.error("Erro ao buscar membros por nome:", error);
    res.status(500).json({ error: "Erro ao buscar membros." });
  }
});

app.get("/membros/cpf/:cpf", async (req, res) => {
  try {
    const { cpf } = req.params;
    const snapshot = await db
      .collection("membros")
      .where("cpf", "==", cpf)
      .get();

    if (snapshot.empty) {
      return res
        .status(404)
        .json({ error: "Nenhum membro encontrado com esse CPF." });
    }

    const membros = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(membros);
  } catch (error) {
    console.error("Erro ao buscar membros por CPF:", error);
    res.status(500).json({ error: "Erro ao buscar membros." });
  }
});

app.put("/membros/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    await db.collection("membros").doc(id).update(data);
    res.status(200).json({ message: "Membro atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar membro:", error);
    res.status(500).json({ error: "Erro ao atualizar membro." });
  }
});

app.put("/membros/nome/:nome_completo", async (req, res) => {
  try {
    const { nome_completo } = req.params;
    const snapshot = await db
      .collection("membros")
      .where("nome_completo", "==", nome_completo)
      .get();

    if (snapshot.empty) {
      return res
        .status(404)
        .json({ error: "Nenhum membro encontrado com esse nome." });
    }

    const dataAtualizada = req.body;

    const batch = db.batch();
    snapshot.forEach((doc) => {
      const membroRef = db.collection("membros").doc(doc.id);
      batch.update(membroRef, dataAtualizada);
    });

    await batch.commit();
    res.status(200).json({ message: "Membro(s) atualizado(s) com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar membro por nome completo:", error);
    res.status(500).json({ error: "Erro ao atualizar membro." });
  }
});

app.put("/membros/cpf/:cpf", async (req, res) => {
  try {
    const { cpf } = req.params;
    const snapshot = await db
      .collection("membros")
      .where("cpf", "==", cpf)
      .get();

    if (snapshot.empty) {
      return res
        .status(404)
        .json({ error: "Nenhum membro encontrado com esse CPF." });
    }

    const dataAtualizada = req.body;

    const batch = db.batch();
    snapshot.forEach((doc) => {
      const membroRef = db.collection("membros").doc(doc.id);
      batch.update(membroRef, dataAtualizada);
    });

    await batch.commit();
    res.status(200).json({ message: "Membro(s) atualizado(s) com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar membro por CPF:", error);
    res.status(500).json({ error: "Erro ao atualizar membro." });
  }
});

app.put("/membros/renovar/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo_plano } = req.body;
    const doc = await db.collection("membros").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Membro não encontrado" });
    }

    const membro = doc.data();
    const dataAtual = new Date(membro.data_final);
    let novaDataFinal;

    switch (tipo_plano.toLowerCase()) {
      case "mensal":
        novaDataFinal = new Date(dataAtual.setMonth(dataAtual.getMonth() + 1));
        break;
      case "trimestral":
        novaDataFinal = new Date(dataAtual.setMonth(dataAtual.getMonth() + 3));
        break;
      case "semestral":
        novaDataFinal = new Date(dataAtual.setMonth(dataAtual.getMonth() + 6));
        break;
      default:
        return res.status(400).json({ error: "Tipo de plano inválido" });
    }

    await db.collection("membros").doc(id).update({
      data_final: novaDataFinal.toISOString(),
      tipo_plano,
    });

    res.status(200).json({ message: "Assinatura renovada com sucesso!" });
  } catch (error) {
    console.error("Erro ao renovar assinatura:", error);
    res.status(500).json({ error: "Erro ao renovar assinatura." });
  }
});

app.delete("/membros/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("membros").doc(id).delete();
    res.status(200).json({ message: "Membro deletado com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar membro:", error);
    res.status(500).json({ error: "Erro ao deletar membro." });
  }
});

app.delete("/membros/nome/:nome_completo", async (req, res) => {
  try {
    const { nome_completo } = req.params;
    const snapshot = await db
      .collection("membros")
      .where("nome_completo", "==", nome_completo)
      .get();

    if (snapshot.empty) {
      return res
        .status(404)
        .json({ error: "Nenhum membro encontrado com esse nome." });
    }

    const batch = db.batch();
    snapshot.forEach((doc) => {
      const membroRef = db.collection("membros").doc(doc.id);
      batch.delete(membroRef);
    });

    await batch.commit();
    res.status(200).json({ message: "Membro(s) deletado(s) com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar membro por nome completo:", error);
    res.status(500).json({ error: "Erro ao deletar membro." });
  }
});

app.delete("/membros/cpf/:cpf", async (req, res) => {
  try {
    const { cpf } = req.params;
    const snapshot = await db
      .collection("membros")
      .where("cpf", "==", cpf)
      .get();

    if (snapshot.empty) {
      return res
        .status(404)
        .json({ error: "Nenhum membro encontrado com esse CPF." });
    }

    const batch = db.batch();
    snapshot.forEach((doc) => {
      const membroRef = db.collection("membros").doc(doc.id);
      batch.delete(membroRef);
    });

    await batch.commit();
    res.status(200).json({ message: "Membro(s) deletado(s) com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar membro por CPF:", error);
    res.status(500).json({ error: "Erro ao deletar membro." });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
