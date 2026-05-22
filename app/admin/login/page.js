"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginAdmin() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const router = useRouter();

  const entrar = (e) => {
    e.preventDefault();

    if (usuario === "admin" && senha === "rada3033") {
      localStorage.setItem("adminLogado", "true");
      router.push("/admin");
    } else {
      setErro("Usuário ou senha inválidos.");
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#eef5fb",
        fontFamily: "Arial"
      }}
    >
      <form
        onSubmit={entrar}
        style={{
          background: "#fff",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          width: "420px"
        }}
      >
        <h1 style={{ color: "#1565c0" }}>Admin Portal Cãomarada</h1>

        <input
          placeholder="Usuário"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginTop: "20px",
            borderRadius: "10px",
            border: "1px solid #ddd"
          }}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginTop: "12px",
            borderRadius: "10px",
            border: "1px solid #ddd"
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            marginTop: "20px",
            padding: "15px",
            background: "#1565c0",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            fontWeight: "bold"
          }}
        >
          Entrar
        </button>

        <p style={{ color: "red", marginTop: "15px" }}>{erro}</p>
      </form>
    </main>
  );
}