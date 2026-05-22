"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Search,
  LogOut,
  MessageCircle,
  Eye,
  FileSpreadsheet,
  FileText
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const especialidades = [
  "Neurologista",
  "Ultrassom",
  "Dermatologista",
  "Gastro",
  "Oftalmologista",
  "Felinos",
  "Endócrino",
  "Cardiologista",
  "Hematologista (Particular)",
  "Oncologista",
  "Ortopedista",
  "Pneumologista",
  "Nefrologista"
];

export default function AdminPage() {
  const router = useRouter();

  const [agendamentos, setAgendamentos] = useState([]);
  const [busca, setBusca] = useState("");
  const [especialidadeFiltro, setEspecialidadeFiltro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [dataFiltro, setDataFiltro] = useState("");
  const [detalhe, setDetalhe] = useState(null);
  const [msg, setMsg] = useState("");

  const carregarAgendamentos = async () => {
    let query = supabase
      .from("agendamentos")
      .select("*")
      .order("created_at", { ascending: false });

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
  }, []);

  const alterarStatus = async (id, novoStatus) => {
    await supabase
      .from("agendamentos")
      .update({ status: novoStatus })
      .eq("id", id);

    setMsg("Status atualizado com sucesso!");
    carregarAgendamentos();

    setTimeout(() => setMsg(""), 3000);
  };

  const filtrados = agendamentos.filter((item) => {
    const termo = busca.toLowerCase();

    const buscaOk =
      item.nome?.toLowerCase().includes(termo) ||
      item.pet?.toLowerCase().includes(termo) ||
      item.cpf?.toLowerCase().includes(termo);

    const espOk = especialidadeFiltro
      ? item.especialidade === especialidadeFiltro
      : true;

    const statusOk = statusFiltro ? item.status === statusFiltro : true;

    const dataOk = dataFiltro ? item.data === dataFiltro : true;

    return buscaOk && espOk && statusOk && dataOk;
  });

  const total = agendamentos.length;
  const pendentes = agendamentos.filter((a) => a.status === "pendente").length;
  const confirmados = agendamentos.filter((a) => a.status === "confirmado").length;
  const cancelados = agendamentos.filter((a) => a.status === "cancelado").length;
  const finalizados = agendamentos.filter((a) => a.status === "finalizado").length;

  const exportarExcel = () => {
    const dados = filtrados.map((a) => ({
      Tutor: a.nome,
      CPF: a.cpf,
      WhatsApp: a.whatsapp,
      Pet: a.pet,
      Espécie: a.especie,
      Raça: a.raca,
      Idade: a.idade,
      Convênio: a.convenio,
      Nome_Convênio: a.nomeconvenio,
      CHIP: a.chip,
      Especialidade: a.especialidade,
      Data: a.data,
      Horário: a.horario,
      Status: a.status
    }));

    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Agendamentos");
    XLSX.writeFile(wb, "agendamentos-caomarada.xlsx");
  };

  const exportarPDF = () => {
    const doc = new jsPDF();

    doc.text("Portal Cãomarada - Agendamentos", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["Tutor", "Pet", "Especialidade", "Data", "Hora", "Status"]],
      body: filtrados.map((a) => [
        a.nome,
        a.pet,
        a.especialidade,
        a.data,
        a.horario,
        a.status
      ])
    });

    doc.save("agendamentos-caomarada.pdf");
  };

  const abrirWhatsApp = (item) => {
    const numero = String(item.whatsapp || "").replace(/\D/g, "");
    const texto = `Olá ${item.nome}, aqui é do Centro Veterinário Cãomarada. Sobre o agendamento do pet ${item.pet} em ${item.data} às ${item.horario}.`;
    window.open(`https://wa.me/55${numero}?text=${encodeURIComponent(texto)}`, "_blank");
  };

  const badge = (status) => {
    const cores = {
      pendente: "#f9a825",
      confirmado: "#2e7d32",
      cancelado: "#c62828",
      finalizado: "#1565c0"
    };

    return {
      background: cores[status] || "#777",
      color: "#fff",
      padding: "6px 10px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "bold"
    };
  };

  const card = {
    background: "#fff",
    padding: "20px",
    borderRadius: "18px",
    boxShadow: "0 8px 22px rgba(0,0,0,.08)"
  };

  return (
    <main style={{ minHeight: "100vh", background: "#eef5fb", padding: 30, fontFamily: "Arial" }}>
      <div style={{ maxWidth: 1600, margin: "0 auto" }}>

        {msg && (
          <div style={{ background: "#2e7d32", color: "#fff", padding: 14, borderRadius: 12, marginBottom: 20 }}>
            {msg}
          </div>
        )}

        <div style={{ ...card, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
  background: "#d32f2f",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: 14,
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 6px 14px rgba(211,47,47,.25)"
}}
          >
            <LogOut size={16} /> Sair
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 15, marginBottom: 20 }}>
          <div style={card}><h3>📊 Total</h3><h1>{total}</h1></div>
          <div style={card}><h3>🟡 Pendentes</h3><h1>{pendentes}</h1></div>
          <div style={card}><h3>🟢 Confirmados</h3><h1>{confirmados}</h1></div>
          <div style={card}><h3>🔴 Cancelados</h3><h1>{cancelados}</h1></div>
          <div style={card}><h3>🔵 Finalizados</h3><h1>{finalizados}</h1></div>
        </div>

        <div style={{ ...card, marginBottom: 20, display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Search size={18} />
            <input
              placeholder="Buscar tutor, pet ou CPF"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{ width: "100%", padding: 12 }}
            />
          </div>

          <select value={especialidadeFiltro} onChange={(e) => setEspecialidadeFiltro(e.target.value)} style={{ padding: 12 }}>
            <option value="">Todas especialidades</option>
            {especialidades.map((e) => <option key={e}>{e}</option>)}
          </select>

          <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)} style={{ padding: 12 }}>
            <option value="">Todos status</option>
            <option value="pendente">Pendente</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
            <option value="finalizado">Finalizado</option>
          </select>

          <input type="date" value={dataFiltro} onChange={(e) => setDataFiltro(e.target.value)} style={{ padding: 12 }} />
        </div>

        <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
          <button onClick={exportarExcel} style={{ padding: 12, borderRadius: 10 }}>
            <FileSpreadsheet size={16} /> Exportar Excel
          </button>

          <button onClick={exportarPDF} style={{ padding: 12, borderRadius: 10 }}>
            <FileText size={16} /> Exportar PDF
          </button>
        </div>

        <div style={{ ...card, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1200px" }}>
            <thead>
              <tr style={{ background: "#1565c0", color: "#fff", position: "sticky", top: 0, zIndex: 2 }}>
                <th style={{ padding: 12 }}>Tutor</th>
                <th>CPF</th>
                <th>WhatsApp</th>
                <th>Pet</th>
                <th>Especialidade</th>
                <th>Data</th>
                <th>Hora</th>
                <th>Convênio</th>
                <th>CHIP</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map((item, index) => (
                <tr key={item.id} style={{ background: index % 2 === 0 ? "#fff" : "#f7fbff", borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: 10 }}>{item.nome}</td>
                  <td>{item.cpf}</td>
                  <td>{item.whatsapp}</td>
                  <td>{item.pet}</td>
                  <td>{item.especialidade}</td>
                  <td>{item.data}</td>
                  <td>{item.horario}</td>
                  <td>{item.nomeconvenio || item.convenio || "-"}</td>
                  <td>{item.chip || "-"}</td>
                  <td><span style={badge(item.status)}>{item.status}</span></td>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                     <button title="Ver detalhes" onClick={() => setDetalhe(item)}>👁️</button>
<button title="WhatsApp" onClick={() => abrirWhatsApp(item)}>💬</button>
<button title="Confirmar" onClick={() => alterarStatus(item.id, "confirmado")}>✅</button>
<button title="Cancelar" onClick={() => alterarStatus(item.id, "cancelado")}>❌</button>
<button title="Finalizar" onClick={() => alterarStatus(item.id, "finalizado")}>🏁</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {detalhe && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <div style={{ background: "#fff", padding: 30, borderRadius: 20, width: 500 }}>
              <h2>Detalhes do Agendamento</h2>
              <p><b>Tutor:</b> {detalhe.nome}</p>
              <p><b>CPF:</b> {detalhe.cpf}</p>
              <p><b>WhatsApp:</b> {detalhe.whatsapp}</p>
              <p><b>Pet:</b> {detalhe.pet}</p>
              <p><b>Espécie:</b> {detalhe.especie}</p>
              <p><b>Raça:</b> {detalhe.raca}</p>
              <p><b>Idade:</b> {detalhe.idade}</p>
              <p><b>Convênio:</b> {detalhe.nomeconvenio || detalhe.convenio}</p>
              <p><b>CHIP:</b> {detalhe.chip || "-"}</p>
              <p><b>Especialidade:</b> {detalhe.especialidade}</p>
              <p><b>Data:</b> {detalhe.data}</p>
              <p><b>Horário:</b> {detalhe.horario}</p>
              <p><b>Status:</b> {detalhe.status}</p>

              <button onClick={() => setDetalhe(null)} style={{ marginTop: 15, padding: 12 }}>
                Fechar
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}