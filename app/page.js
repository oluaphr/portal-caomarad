"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
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


export default function Home() {
  const [status, setStatus] = useState("");
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [horariosLiberados, setHorariosLiberados] = useState([]);
  const [mostrarWhatsapp, setMostrarWhatsapp] = useState(false);


  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    whatsapp: "",
    email: "",
    pet: "",
    especie: "",
    raca: "",
    idade: "",
    convenio: "Não",
    nomeConvenio: "",
    chip: "",
    especialidade: "",
    data: "",
    horario: ""
  });

  useEffect(() => {
  const buscarHorarios = async () => {
    if (!form.data || !form.especialidade) {
      setHorariosLiberados([]);
      setHorariosOcupados([]);
      return;
    }

    const { data: liberados } = await supabase
      .from("horarios_disponiveis")
      .select("horario")
      .eq("data", form.data)
      .eq("especialidade", form.especialidade)
      .eq("ativo", true)
      .order("horario", { ascending: true });

    const { data: ocupados } = await supabase
      .from("agendamentos")
      .select("horario")
      .eq("data", form.data)
      .eq("especialidade", form.especialidade)
      .neq("status", "cancelado");

    setHorariosLiberados(liberados?.map((item) => item.horario) || []);
    setHorariosOcupados(ocupados?.map((item) => item.horario) || []);
  };

  buscarHorarios();
}, [form.data, form.especialidade]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  setStatus("Enviando agendamento...");

  const payload = {
    nome: form.nome,
    cpf: form.cpf,
    whatsapp: form.whatsapp,
    email: form.email,
    pet: form.pet,
    especie: form.especie,
    raca: form.raca,
    idade: form.idade,
    convenio: form.convenio,
    nomeconvenio: form.nomeConvenio,
    chip: form.chip,
    especialidade: form.especialidade,
    data: form.data,
    horario: form.horario,
    status: "pendente"
  };

  const response = await fetch("/api/agendamento", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  if (!response.ok) {
    setStatus("Erro: " + result.error);
  } else {
    setStatus("Agendamento realizado com sucesso!");
    setMostrarWhatsapp(true);
  }
};
  const inputStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #ddd"
  };

  return (
    <main style={{ minHeight: "100vh", background: "#eef5fb", padding: "40px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <form
          onSubmit={handleSubmit}
         style={{
  background: "#fff",
  padding: "35px",
  borderRadius: "24px",
  boxShadow: "0 12px 30px rgba(0,0,0,.08)"
}}
        >
<div
  style={{
    background: "#fff",
    padding: "25px",
    borderRadius: "20px",
    marginBottom: "25px",
    textAlign: "center",
    boxShadow: "0 8px 22px rgba(0,0,0,.08)"
  }}
>
  <img
    src="/logo-caomarada.png"
    alt="Centro Veterinário Cãomarada"
    style={{
      maxWidth: "420px",
      width: "100%",
      height: "auto"
    }}
  />

  <p
    style={{
      fontWeight: "bold",
      color: "#1565c0",
      marginTop: "10px"
    }}
  >
    Agendamento Online • Atendimento 24 horas
  </p>
</div>
        

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "18px"
            }}
          >
            <input style={inputStyle} name="nome" placeholder="Nome completo" onChange={handleChange} required />
            <input style={inputStyle} name="cpf" placeholder="CPF" onChange={handleChange} required />
            <input style={inputStyle} name="whatsapp" placeholder="WhatsApp" onChange={handleChange} required />
            <input style={inputStyle} name="email" placeholder="E-mail" onChange={handleChange} />
            <input style={inputStyle} name="pet" placeholder="Nome do pet" onChange={handleChange} required />
            <input style={inputStyle} name="especie" placeholder="Espécie" onChange={handleChange} />
            <input style={inputStyle} name="raca" placeholder="Raça" onChange={handleChange} />
            <input style={inputStyle} name="idade" placeholder="Idade" onChange={handleChange} />

            <select style={inputStyle} name="convenio" value={form.convenio} onChange={handleChange}>
              <option value="Não">Convênio? Não</option>
              <option value="Sim">Convênio? Sim</option>
            </select>

            {form.convenio === "Sim" && (
              <input
                style={inputStyle}
                name="nomeConvenio"
                placeholder="Nome do convênio"
                onChange={handleChange}
              />
            )}

            <input style={inputStyle} name="chip" placeholder="Número do CHIP" onChange={handleChange} />

            <select style={inputStyle} name="especialidade" onChange={handleChange} required>
              <option value="">Selecione a especialidade</option>
              {especialidades.map((esp) => (
                <option key={esp}>{esp}</option>
              ))}
            </select>

            <input style={inputStyle} type="date" name="data" onChange={handleChange} required />

          <select style={inputStyle} name="horario" onChange={handleChange} required>
  <option value="">
    {horariosLiberados.length === 0
      ? "Nenhum horário liberado"
      : "Selecione o horário"}
  </option>

  {horariosLiberados.map((hora) => (
    <option
      key={hora}
      value={hora}
      disabled={horariosOcupados.includes(hora)}
    >
      {horariosOcupados.includes(hora)
        ? `${hora} (ocupado)`
        : hora}
    </option>
  ))}
</select>
          </div>

          <button
            type="submit"
            style={{
  marginTop: "30px",
  width: "100%",
  padding: "16px",
  background: "linear-gradient(135deg, #1565c0, #42a5f5)",
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer"
}}
          >
            Solicitar Agendamento
          </button>

          <p>{status}</p>
{mostrarWhatsapp && (
  <a
    href={`https://wa.me/5511991230407?text=${encodeURIComponent(
      "Olá! Acabei de solicitar um agendamento no Portal Cãomarada."
    )}`}
    target="_blank"
    style={{
      display: "block",
      marginTop: "20px",
      padding: "16px",
      textAlign: "center",
      background: "#25D366",
      color: "#fff",
      borderRadius: "12px",
      textDecoration: "none",
      fontWeight: "bold"
    }}
  >
    📱 Confirmar no WhatsApp
  </a>
)}
        </form>
      </div>
    </main>
  );
}