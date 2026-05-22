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

const horariosDisponiveis = [
  "08:00","08:30","09:00","09:30","10:00","10:30",
  "11:00","11:30","12:00","12:30","13:00","13:30",
  "14:00","14:30","15:00","15:30","16:00","16:30",
  "17:00","17:30","18:00","18:30","19:00","19:30","20:00"
];

export default function Home() {
  const [status, setStatus] = useState("");
  const [horariosOcupados, setHorariosOcupados] = useState([]);

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
        setHorariosOcupados([]);
        return;
      }

      const { data } = await supabase
        .from("agendamentos")
        .select("horario")
        .eq("data", form.data)
        .eq("especialidade", form.especialidade)
        .neq("status", "cancelado");

      setHorariosOcupados(data?.map((item) => item.horario) || []);
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

    const { error } = await supabase
      .from("agendamentos")
      .insert([payload]);

    if (error) {
      setStatus("Erro: " + error.message);
    } else {
      setStatus("Agendamento realizado com sucesso!");
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
            borderRadius: "20px"
          }}
        >
          <h2>Agendamento Online</h2>

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
              <option value="">Selecione o horário</option>
              {horariosDisponiveis.map((hora) => (
                <option
                  key={hora}
                  value={hora}
                  disabled={horariosOcupados.includes(hora)}
                >
                  {horariosOcupados.includes(hora) ? `${hora} (ocupado)` : hora}
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
              background: "#f39c12",
              color: "#fff",
              border: "none",
              borderRadius: "12px"
            }}
          >
            Solicitar Agendamento
          </button>

          <p>{status}</p>
        </form>
      </div>
    </main>
  );
}