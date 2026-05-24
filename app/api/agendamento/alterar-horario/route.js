import { createClient } from "@supabase/supabase-js";

const enviarWhatsApp = async (numero, mensagem) => {
  await fetch(
    `${process.env.EVOLUTION_API_URL}/message/sendText/${process.env.EVOLUTION_INSTANCE_NAME}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.EVOLUTION_API_KEY
      },
      body: JSON.stringify({ number: numero, text: mensagem })
    }
  );
};

const formatarNumero = (numero) => {
  const limpo = String(numero || "").replace(/\D/g, "");
  return limpo.startsWith("55") ? limpo : `55${limpo}`;
};

export async function POST(req) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { id, novaData, novoHorario } = await req.json();

    const { data: agendamento, error: erroBusca } = await supabase
      .from("agendamentos")
      .select("*")
      .eq("id", id)
      .single();

    if (erroBusca || !agendamento) {
      return Response.json({ error: "Agendamento não encontrado" }, { status: 404 });
    }

    const { error } = await supabase
      .from("agendamentos")
      .update({
        data: novaData,
        horario: novoHorario,
        status: "aguardando_confirmacao"
      })
      .eq("id", id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const dataFormatada = novaData.split("-").reverse().join("/");
    const numero = formatarNumero(agendamento.whatsapp);

    await enviarWhatsApp(
      numero,
      `🔁 Alteração de agendamento

Olá, ${agendamento.nome}!

Precisamos alterar o horário da consulta do pet ${agendamento.pet}.

🏥 Especialidade: ${agendamento.especialidade}
📅 Nova data: ${dataFormatada}
🕐 Novo horário: ${novoHorario}

Para confirmar, responda:
1 ou CONFIRMAR

Para cancelar, responda:
2 ou CANCELAR

Para solicitar nova remarcação, responda:
3 ou REMARCAR

Centro Veterinário Cãomarada 💙`
    );

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}