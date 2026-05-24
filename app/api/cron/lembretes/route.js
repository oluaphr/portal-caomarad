import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const enviarWhatsApp = async (numero, mensagem) => {
  await fetch(
    `${process.env.EVOLUTION_API_URL}/message/sendText/${process.env.EVOLUTION_INSTANCE_NAME}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.EVOLUTION_API_KEY
      },
      body: JSON.stringify({
        number: numero,
        text: mensagem
      })
    }
  );
};

const formatarNumero = (numero) => {
  const limpo = String(numero || "").replace(/\D/g, "");
  return limpo.startsWith("55") ? limpo : `55${limpo}`;
};

export async function GET(req) {
  const auth = req.headers.get("authorization");

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(hoje.getDate() + 1);

  const dataAmanha = amanha.toISOString().split("T")[0];

  const { data: consultas, error } = await supabase
    .from("agendamentos")
    .select("*")
    .eq("status", "confirmado")
    .eq("data", dataAmanha)
    .eq("lembrete_enviado", false);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  for (const consulta of consultas || []) {
    const numero = formatarNumero(consulta.whatsapp);
    const dataFormatada = consulta.data?.split("-").reverse().join("/");

    await enviarWhatsApp(
      numero,
      `🐾 Lembrete de consulta

Olá, ${consulta.nome}!

Estamos passando para lembrar da consulta do pet ${consulta.pet} amanhã.

🏥 Especialidade: ${consulta.especialidade}
📅 Data: ${dataFormatada}
🕐 Horário: ${consulta.horario}

Centro Veterinário Cãomarada 💙
Atendimento 24 horas`
    );

    await supabase
      .from("agendamentos")
      .update({ lembrete_enviado: true })
      .eq("id", consulta.id);
  }

  return Response.json({
    success: true,
    enviados: consultas?.length || 0
  });
}