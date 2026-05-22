"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminPage() {
  const router = useRouter();
  const [agendamentos, setAgendamentos] = useState([]);
  const [busca, setBusca] = useState("");
  const [especialidadeFiltro, setEspecialidadeFiltro] = useState("");

  const carregarAgendamentos = async () => {
    let query = supabase
      .from("agendamentos")
      .select("*")
      .order("created_at", { ascending: false });

    if (especialidadeFiltro) {
      query = query.ilike("especialidade", `%${especialidadeFiltro}%`);
    }

    const { data } = await query;
    setAgendamentos(data || []);
  };

  useEffect(() => {
    const logado = localStorage.getItem("adminLogado");

    if (!logado) {
      router.push("/admin/login");
      return;
    }

    carregarAgendamentos();
  }, [especialidadeFiltro]);

  const alterarStatus = async (id, novoStatus) => {
    await supabase
      .from("agendamentos")
      .update({ status: novoStatus })
      .eq("id", id);

    carregarAgendamentos();
  };

  const filtrados = agendamentos.filter((item) => {
    const termo = busca.toLowerCase();

    return (
      item.nome?.toLowerCase().includes(termo) ||
      item.pet?.toLowerCase().includes(termo) ||
      item.cpf?.toLowerCase().includes(termo)
    );
  });

  const pendentes = agendamentos.filter(a => a.status === "pendente").length;
  const confirmados = agendamentos.filter(a => a.status === "confirmado").length;
  const cancelados = agendamentos.filter(a => a.status === "cancelado").length;
  const finalizados = agendamentos.filter(a => a.status === "finalizado").length;
  const total = agendamentos.length;

  const card = {
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
  };

  const botao = (cor) => ({
    padding: "8px 12px",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
    background: cor
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#eef5fb",
        padding: "30px",
        fontFamily: "Arial"
      }}
    >
      <div style={{ maxWidth: "1500px", margin: "0 auto" }}>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "15px",
            marginBottom: "20px"
          }}
        >
          <div style={card}><h3>📊 Total</h3><h1>{total}</h1></div>
          <div style={card}><h3>🟡 Pendentes</h3><h1>{pendentes}</h1></div>
          <div style={card}><h3>🟢 Confirmados</h3><h1>{confirmados}</h1></div>
          <div style={card}><h3>🔴 Cancelados</h3><h1>{cancelados}</h1></div>
          <div style={card}><h3>🔵 Finalizados</h3><h1>{finalizados}</h1></div>
        </div>

        <div style={card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <h1 style={{ color: "#1565c0" }}>Painel Administrativo</h1>
              <p>Portal Cãomarada</p>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem("adminLogado");
                router.push("/admin/login");
              }}
              style={{
                padding: "10px 16px",
                background: "#d32f2f",
                color: "#fff",
                border: "none",
                borderRadius: "10px"
              }}
            >
              Sair
            </button>
          </div>
        </div>

        <div
          style={{
            ...card,
            marginTop: "20px",
            display: "grid",
            gridTemplateColumns: "1fr 300px",
            gap: "20px"
          }}
        >
          <input
            placeholder="Buscar tutor / pet / CPF"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ padding: "12px" }}
          />

          <input
            placeholder="Filtrar especialidade"
            value={especialidadeFiltro}
            onChange={(e) => setEspecialidadeFiltro(e.target.value)}
            style={{ padding: "12px" }}
          />
        </div>

        <div style={{ ...card, marginTop: "20px", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th>Tutor</th>
                <th>Pet</th>
                <th>Especialidade</th>
                <th>Data</th>
                <th>Horário</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td>{item.nome}</td>
                  <td>{item.pet}</td>
                  <td>{item.especialidade}</td>
                  <td>{item.data}</td>
                  <td>{item.horario}</td>
                  <td>{item.status}</td>

                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        style={botao("#2e7d32")}
                        onClick={() => alterarStatus(item.id, "confirmado")}
                      >
                        Confirmar
                      </button>

                      <button
                        style={botao("#c62828")}
                        onClick={() => alterarStatus(item.id, "cancelado")}
                      >
                        Cancelar
                      </button>

                      <button
                        style={botao("#1565c0")}
                        onClick={() => alterarStatus(item.id, "finalizado")}
                      >
                        Finalizar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}