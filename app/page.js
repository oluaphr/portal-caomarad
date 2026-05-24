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
  const [datasDisponiveis, setDatasDisponiveis] = useState([]);

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
  const buscarDatas = async () => {
    if (!form.especialidade) {
      setDatasDisponiveis([]);
      return;
    }

  const { data, error } = await supabase
  .from("horarios_disponiveis")
  .select("data, especialidade, ativo")
  .ilike("especialidade", form.especialidade)
  .eq("ativo", true)
  .order("data", { ascending: true });

if (error) {
  console.log("Erro ao buscar datas:", error.message);
}

    const datasUnicas = [...new Set((data || []).map((item) => item.data))];

    setDatasDisponiveis(datasUnicas);
  };

  buscarDatas();
}, [form.especialidade]);

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
const obterDiaSemana = (data) => {
  if (!data) return "";

  const dias = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado"
  ];

  const [ano, mes, dia] = data.split("-");
  const dt = new Date(ano, mes - 1, dia);

  return dias[dt.getDay()];
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

            <select
  style={inputStyle}
  name="especialidade"
  value={form.especialidade}
  onChange={(e) =>
    setForm({
      ...form,
      especialidade: e.target.value,
      data: "",
      horario: ""
    })
  }
  required
>
              <option value="">Selecione a especialidade</option>
              {especialidades.map((esp) => (
                <option key={esp}>{esp}</option>
              ))}
            </select>
    <select
  style={inputStyle}
  name="data"
  value={form.data}
  onChange={(e) =>
    setForm({
      ...form,
      data: e.target.value,
      horario: ""
    })
  }
  required
  disabled={!form.especialidade}
>
  <option value="">
    {!form.especialidade
      ? "Selecione uma especialidade primeiro"
      : datasDisponiveis.length === 0
      ? "Nenhuma data disponível"
      : "Selecione a data"}
  </option>

{datasDisponiveis.map((data) => (
  <option key={data} value={data}>
    {data.split("-").reverse().join("/")} - {obterDiaSemana(data)}
  </option>
))}
</select>

          <select
  style={inputStyle}
  name="horario"
  value={form.horario}
  onChange={handleChange}
  required
  disabled={!form.data}
>
  <option value="">
    {!form.data
      ? "Selecione uma data primeiro"
      : horariosLiberados.length === 0
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

                 </form>
      </div>
    </main>
  );
}