"use client";

import { useState } from "react";
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

    const { error } = await supabase
      .from("agendamentos")
      .insert([payload]);

    if (error) {
      setStatus("Erro: " + error.message);
    } else {
      setStatus("Agendamento realizado com sucesso!");
      setForm({
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
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "15px"
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#eef5fb",
        padding: "40px",
        fontFamily: "Arial"
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            marginBottom: "30px"
          }}
        >
          <h1 style={{ color: "#1565c0", fontSize: "32px" }}>
            🐾 Portal Cãomarada
          </h1>
          <p>Centro Veterinário Cãomarada • Atendimento 24 horas</p>
          <p>📍 Rua Coronel Gustavo Santiago, 77</p>
          <p>📱 (11) 99123-0407</p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "#fff",
            padding: "35px",
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
          }}
        >
          <h2 style={{ marginBottom: "25px" }}>Agendamento Online</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "18px"
            }}
          >
            <input
              style={inputStyle}
              name="nome"
              placeholder="Nome completo"
              value={form.nome}
              onChange={handleChange}
              required
            />

            <input
              style={inputStyle}
              name="cpf"
              placeholder="CPF"
              value={form.cpf}
              onChange={handleChange}
              required
            />

            <input
              style={inputStyle}
              name="whatsapp"
              placeholder="WhatsApp"
              value={form.whatsapp}
              onChange={handleChange}
              required
            />

            <input
              style={inputStyle}
              name="email"
              placeholder="E-mail"
              value={form.email}
              onChange={handleChange}
            />

            <input
              style={inputStyle}
              name="pet"
              placeholder="Nome do pet"
              value={form.pet}
              onChange={handleChange}
              required
            />

            <input
              style={inputStyle}
              name="especie"
              placeholder="Espécie"
              value={form.especie}
              onChange={handleChange}
            />

            <input
              style={inputStyle}
              name="raca"
              placeholder="Raça"
              value={form.raca}
              onChange={handleChange}
            />

            <input
              style={inputStyle}
              name="idade"
              placeholder="Idade"
              value={form.idade}
              onChange={handleChange}
            />

            <select
              style={inputStyle}
              name="convenio"
              value={form.convenio}
              onChange={handleChange}
            >
              <option>Convênio? Não</option>
              <option>Convênio? Sim</option>
            </select>

            {form.convenio.includes("Sim") && (
              <input
                style={inputStyle}
                name="nomeConvenio"
                placeholder="Nome do convênio"
                value={form.nomeConvenio}
                onChange={handleChange}
              />
            )}

            <input
              style={inputStyle}
              name="chip"
              placeholder="Número do CHIP"
              value={form.chip}
              onChange={handleChange}
            />

            <select
              style={inputStyle}
              name="especialidade"
              value={form.especialidade}
              onChange={handleChange}
              required
            >
              <option value="">Selecione a especialidade</option>
              {especialidades.map((esp) => (
                <option key={esp}>{esp}</option>
              ))}
            </select>

            <input
              style={inputStyle}
              type="date"
              name="data"
              value={form.data}
              onChange={handleChange}
              required
            />

            <input
              style={inputStyle}
              type="time"
              name="horario"
              value={form.horario}
              onChange={handleChange}
              required
            />
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
              borderRadius: "12px",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Solicitar Agendamento
          </button>

          <p style={{ marginTop: "20px", fontWeight: "bold" }}>{status}</p>
        </form>
      </div>
    </main>
  );
}