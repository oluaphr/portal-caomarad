"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LoginAdmin() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@vetcaomarada.com.br");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const entrar = async (e) => {
    e.preventDefault();
    setErro("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    });

    if (error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }

    router.push("/admin");
  };

  return (
    <main style={{
      minHeight: "100vh",
      background: "#eef5fb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial"
    }}>
      <form onSubmit={entrar} style={{
        background: "#fff",
        padding: 40,
        borderRadius: 20,
        width: 420,
        boxShadow: "0 10px 30px rgba(0,0,0,.08)"
      }}>
        <h1 style={{ color: "#1565c0" }}>Login Admin</h1>
        <p>Portal Cãomarada</p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          style={{ width: "100%", padding: 14, marginTop: 20 }}
        />

        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Senha"
          style={{ width: "100%", padding: 14, marginTop: 12 }}
        />

        <button style={{
          width: "100%",
          padding: 15,
          marginTop: 20,
          background: "#1565c0",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          fontWeight: "bold"
        }}>
          Entrar
        </button>

        <p style={{ color: "red" }}>{erro}</p>
      </form>
    </main>
  );
}