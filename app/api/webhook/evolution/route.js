import { createClient } from "@supabase/supabase-js";

const limparNumero = (numero) => String(numero || "").replace(/\D/g, "");

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

export async function POST(req) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const body = await req.json();

    const texto =
      body?.data?.message?.conversation ||
      body?.data?.message?.extendedTextMessage?.text ||
      "";

    const numero =
      body?.data?.key?.remoteJid?.replace("@s.whatsapp.net", "") || "";

    const resposta = texto.trim().toLowerCase();

    if (!numero || !texto) { 
      return Response.json({ ok: true });
    }

   if (resposta === "remarcar" || resposta === "3") {
  const { data: agendamentos } = await supabase
    .from("agendamentos")
    .select("*")
    .in("status", ["pendente", "confirmado"])
    .order("created_at", { ascending: false })
    .limit(30);

  const numeroFinal = limparNumero(numero).slice(-11);

  const agendamento = agendamentos?.find(
    (a) => limparNumero(a.whatsapp).slice(-11) === numeroFinal
  );

  if (agendamento) {
    await supabase
      .from("agendamentos")
      .update({ status: "remarcacao" })
      .eq("id", agendamento.id);
  }

  await enviarWhatsApp(
    numero,
    `🔁 Remarcação de consulta

Claro! Para remarcar, acesse novamente o portal e escolha uma nova data e horário disponível:

https://portal-caomarad.vercel.app

Se preferir, nossa equipe também pode ajudar por aqui.

Centro Veterinário Cãomarada 💙`
  );

  await enviarWhatsApp(
    process.env.CLINICA_WHATSAPP,
    `🔁 Cliente solicitou remarcação

Tutor: ${agendamento?.nome || "-"}
Pet: ${agendamento?.pet || "-"}
Especialidade: ${agendamento?.especialidade || "-"}
Data anterior: ${agendamento?.data || "-"}
Horário anterior: ${agendamento?.horario || "-"}
Número: ${numero}

Status alterado para: REMARCAÇÃO`
  );

  return Response.json({ ok: true });
}

if (!["confirmar", "1", "cancelar", "2"].includes(resposta)) {
  return Response.json({ ok: true });
}

    const { data: agendamentos } = await supabase
      .from("agendamentos")
      .select("*")
      .eq("status", "pendente")
      .order("created_at", { ascending: false })
      .limit(30);

    const numeroFinal = limparNumero(numero).slice(-11);

    const agendamento = agendamentos?.find(
      (a) => limparNumero(a.whatsapp).slice(-11) === numeroFinal
    );

    if (!agendamento) {
      return Response.json({
        ok: true,
        message: "Nenhum agendamento pendente encontrado."
      });
    }

    const novoStatus =
      resposta === "confirmar" || resposta === "1"
        ? "confirmado"
        : "cancelado";

    await supabase
      .from("agendamentos")
      .update({ status: novoStatus })
      .eq("id", agendamento.id);

    const dataFormatada = agendamento.data?.split("-").reverse().join("/");

    if (novoStatus === "confirmado") {
      await enviarWhatsApp(
        numero,
        `✅ Agendamento confirmado!

🐾 Centro Veterinário Cãomarada

Pet: ${agendamento.pet}
Especialidade: ${agendamento.especialidade}
Data: ${dataFormatada}
Horário: ${agendamento.horario}

Obrigado! 💙`
      );
    } else {
      await enviarWhatsApp(
        numero,
        `❌ Agendamento cancelado.

🐾 Centro Veterinário Cãomarada

Pet: ${agendamento.pet}
Data: ${dataFormatada}
Horário: ${agendamento.horario}

Se desejar, faça um novo agendamento pelo portal.`
      );
    }

    await enviarWhatsApp(
      process.env.CLINICA_WHATSAPP,
      `📢 Resposta do cliente

Tutor: ${agendamento.nome}
Pet: ${agendamento.pet}
Especialidade: ${agendamento.especialidade}
Data: ${dataFormatada}
Horário: ${agendamento.horario}

Novo status: ${novoStatus.toUpperCase()}`
    );

    return Response.json({ ok: true });

  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}