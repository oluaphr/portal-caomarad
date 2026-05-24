import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const enviarWhatsApp = async (numero, mensagem) => {
  const response = await fetch(
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

  return response.text();
};

const formatarNumero = (numero) => {
  const limpo = String(numero || "").replace(/\D/g, "");
  return limpo.startsWith("55") ? limpo : `55${limpo}`;
};

export async function POST(req) {
  try {
    const { id, status } = await req.json();

    const { data: agendamento, error: buscarErro } = await supabase
      .from("agendamentos")
      .select("*")
      .eq("id", id)
      .single();

    if (buscarErro || !agendamento) {
      return Response.json({ error: "Agendamento não encontrado" }, { status: 404 });
    }

    const { error } = await supabase
      .from("agendamentos")
      .update({ status })
      .eq("id", id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const numero = formatarNumero(agendamento.whatsapp);
    const dataFormatada = agendamento.data?.split("-").reverse().join("/");

    if (status === "confirmado") {
      await enviarWhatsApp(
        numero,
        `✅ Agendamento confirmado!

🐾 Centro Veterinário Cãomarada

Olá, ${agendamento.nome}!

Confirmamos o agendamento do pet ${agendamento.pet}.

🏥 Especialidade: ${agendamento.especialidade}
📅 Data: ${dataFormatada}
🕐 Horário: ${agendamento.horario}

Esperamos vocês! 💙`
      );
    }

    if (status === "cancelado") {
      await enviarWhatsApp(
        numero,
        `❌ Agendamento cancelado

🐾 Centro Veterinário Cãomarada

Olá, ${agendamento.nome}.

Informamos que o agendamento do pet ${agendamento.pet} foi cancelado.

🏥 Especialidade: ${agendamento.especialidade}
📅 Data: ${dataFormatada}
🕐 Horário: ${agendamento.horario}

Caso deseje, você pode realizar um novo agendamento pelo portal.

Centro Veterinário Cãomarada 💙`
      );
    }

    return Response.json({ success: true });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}