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
    carteirinha: "",
    especialidade: especialidades[0],
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

    const { error } = await supabase.from("agendamentos").insert([
      {
        ...form,
        status: "pendente"
      }
    ]);

    if (error) {
  setStatus("Erro: " + error.message);
} else {
      setStatus("Agendamento realizado com sucesso!");
    }
  };

  return (
    <main style={{ padding: "30px", fontFamily: "Arial", background: "#f5fbff", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        <header style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "20px",
          boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
          marginBottom: "30px"
        }}>
          <h1 style={{ color: "#1565c0" }}>🐾 Portal Cãomarada</h1>
          <p>Centro Veterinário Cãomarada • Atendimento 24 horas</p>
          <p>📍 Rua Coronel Gustavo Santiago, 77</p>
          <p>📱 (11) 99123-0407</p>
        </header>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "20px",
            boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
            display: "grid",
            gap: "12px"
          }}
        >
          <h2>Agendamento Online</h2>

          <input name="nome" placeholder="Nome completo" onChange={handleChange} required />
          <input name="cpf" placeholder="CPF" onChange={handleChange} required />
          <input name="whatsapp" placeholder="WhatsApp" onChange={handleChange} required />
          <input name="email" placeholder="E-mail" onChange={handleChange} />
          <input name="pet" placeholder="Nome do pet" onChange={handleChange} required />
          <input name="especie" placeholder="Espécie" onChange={handleChange} />
          <input name="raca" placeholder="Raça" onChange={handleChange} />
          <input name="idade" placeholder="Idade" onChange={handleChange} />

          <select name="convenio" onChange={handleChange}>
            <option>Não</option>
            <option>Sim</option>
          </select>

          <input name="nomeConvenio" placeholder="Nome do convênio" onChange={handleChange} />
          <input name="carteirinha" placeholder="Número da carteirinha" onChange={handleChange} />

          <select name="especialidade" onChange={handleChange}>
            {especialidades.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <input type="date" name="data" onChange={handleChange} required />
          <input type="time" name="horario" onChange={handleChange} required />

          <button
            type="submit"
            style={{
              background: "#f9a825",
              color: "#fff",
              padding: "15px",
              border: "none",
              borderRadius: "12px",
              fontWeight: "bold",
              cursor: "pointer"
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