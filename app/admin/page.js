"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Search, LogOut, MessageCircle, Eye, FileSpreadsheet, FileText } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const especialidades = [
  "Neurologista", "Ultrassom", "Dermatologista", "Gastro", "Oftalmologista",
  "Felinos", "Endócrino", "Cardiologista", "Hematologista (Particular)",
  "Oncologista", "Ortopedista", "Pneumologista", "Nefrologista"
];
const horariosPadrao = [
  "08:00","08:30","09:00","09:30",
  "10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30",
  "14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30",
  "18:00","18:30","19:00","19:30","20:00"
];
export default function AdminPage() {
  const router = useRouter();

  const [agendamentos, setAgendamentos] = useState([]);
  const [horariosAdmin, setHorariosAdmin] = useState([]);
  const [busca, setBusca] = useState("");
  const [especialidadeFiltro, setEspecialidadeFiltro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [dataFiltro, setDataFiltro] = useState("");
  const [detalhe, setDetalhe] = useState(null);
  const [msg, setMsg] = useState("");

 const [horarioForm, setHorarioForm] = useState({
  especialidade: "",
  data: "",
  horarios: []
});

  const card = {
    background: "#fff",
    padding: "20px",
    borderRadius: "18px",
    boxShadow: "0 8px 22px rgba(0,0,0,.08)"
  };

  const carregarAgendamentos = async () => {
    const { data } = await supabase
      .from("agendamentos")
      .select("*")
      .order("created_at", { ascending: false });

    setAgendamentos(data || []);
  };

  const carregarHorarios = async () => {
    const { data } = await supabase
      .from("horarios_disponiveis")
      .select("*")
      .order("data", { ascending: false })
      .order("horario", { ascending: true });

    setHorariosAdmin(data || []);
  };

  useEffect(() => {
    const verificarSessao = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/admin/login");
        return;
      }

      carregarAgendamentos();
      carregarHorarios();
    };

    verificarSessao();
  }, []);

const alterarStatus = async (id, novoStatus) => {
  const response = await fetch("/api/agendamento/status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id,
      status: novoStatus
    })
  });

  const result = await response.json();

  if (!response.ok) {
    setMsg("Erro: " + result.error);
  } else {
    setMsg("Status atualizado e WhatsApp enviado!");
    carregarAgendamentos();
  }

  setTimeout(() => setMsg(""), 3000);
};

const liberarHorario = async () => {
  if (
    !horarioForm.especialidade ||
    !horarioForm.data ||
    horarioForm.horarios.length === 0
  ) {
    setMsg("Selecione especialidade, data e pelo menos um horário.");
    return;
  }

  const payload = horarioForm.horarios.map((hora) => ({
    especialidade: horarioForm.especialidade,
    data: horarioForm.data,
    horario: hora,
    ativo: true
  }));

  const { error } = await supabase
    .from("horarios_disponiveis")
    .upsert(payload, {
      onConflict: "especialidade,data,horario",
      ignoreDuplicates: false
    });

  if (error) {
    setMsg("Erro: " + error.message);
  } else {
    setMsg("Horários liberados com sucesso!");
    setHorarioForm({
      especialidade: "",
      data: "",
      horarios: []
    });

    carregarHorarios();
  }

  setTimeout(() => setMsg(""), 3000);
};

  const alternarHorario = async (id, ativoAtual) => {
    await supabase.from("horarios_disponiveis").update({ ativo: !ativoAtual }).eq("id", id);
    carregarHorarios();
  };

  const filtrados = agendamentos.filter((item) => {
    const termo = busca.toLowerCase();

    const buscaOk =
      item.nome?.toLowerCase().includes(termo) ||
      item.pet?.toLowerCase().includes(termo) ||
      item.cpf?.toLowerCase().includes(termo);

    const espOk = especialidadeFiltro ? item.especialidade === especialidadeFiltro : true;
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
    const ws = XLSX.utils.json_to_sheet(filtrados);
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
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/admin/login");
            }}
            style={{
              background: "#d32f2f",
              color: "#fff",
              border: "none",
              padding: "12px 20px",
              borderRadius: 14,
              fontWeight: "bold",
              cursor: "pointer"
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

        <div style={{ ...card, marginBottom: 20 }}>
          <h2 style={{ color: "#1565c0" }}>Liberar Horários por Especialidade</h2>

        <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 15
  }}
>
            <select
              value={horarioForm.especialidade}
              onChange={(e) => setHorarioForm({ ...horarioForm, especialidade: e.target.value })}
              style={{ padding: 12 }}
            >
              <option value="">Especialidade</option>
              {especialidades.map((e) => <option key={e}>{e}</option>)}
            </select>

            <input
              type="date"
              value={horarioForm.data}
              onChange={(e) => setHorarioForm({ ...horarioForm, data: e.target.value })}
              style={{ padding: 12 }}
            />

           <div
  style={{
    gridColumn: "1 / -1",
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 10,
    marginTop: 10
  }}
>
  {horariosPadrao.map((hora) => (
    <label
      key={hora}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: 10,
        background: "#f5f9ff",
        borderRadius: 10
      }}
    >
      <input
        type="checkbox"
        checked={horarioForm.horarios.includes(hora)}
        onChange={(e) => {
          if (e.target.checked) {
            setHorarioForm({
              ...horarioForm,
              horarios: [...horarioForm.horarios, hora]
            });
          } else {
            setHorarioForm({
              ...horarioForm,
              horarios: horarioForm.horarios.filter((h) => h !== hora)
            });
          }
        }}
      />
      {hora}
    </label>
  ))}
</div>

         <button
  onClick={liberarHorario}
  style={{
    padding: "12px 18px",
    background: "#1565c0",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    gridColumn: "1 / -1"
  }}
>
  Liberar horários selecionados
</button>
          </div>

          <div style={{ marginTop: 20, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#eef5fb" }}>
                  <th>Especialidade</th>
                  <th>Data</th>
                  <th>Horário</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>

              <tbody>
                {horariosAdmin.map((h) => (
                  <tr key={h.id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td>{h.especialidade}</td>
                    <td>{h.data}</td>
                    <td>{h.horario}</td>
                    <td style={{ color: h.ativo ? "#2e7d32" : "#c62828", fontWeight: "bold" }}>
                      {h.ativo ? "Ativo" : "Bloqueado"}
                    </td>
                    <td>
                      <button
                        onClick={() => alternarHorario(h.id, h.ativo)}
                        style={{
                          padding: "8px 12px",
                          background: h.ativo ? "#c62828" : "#2e7d32",
                          color: "#fff",
                          border: "none",
                          borderRadius: 8
                        }}
                      >
                        {h.ativo ? "Bloquear" : "Ativar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
              <tr style={{ background: "#1565c0", color: "#fff" }}>
                <th>Tutor</th>
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
                  <td>{item.nome}</td>
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
                    <button onClick={() => setDetalhe(item)}>👁️</button>
                    <button onClick={() => abrirWhatsApp(item)}>💬</button>
                    <button onClick={() => alterarStatus(item.id, "confirmado")}>✅</button>
                    <button onClick={() => alterarStatus(item.id, "cancelado")}>❌</button>
                    <button onClick={() => alterarStatus(item.id, "finalizado")}>🏁</button>
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