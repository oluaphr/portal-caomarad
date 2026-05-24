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
      body: JSON.stringify({
        number: numero,
        text: mensagem
      })
    }
  );
};

const formatarDataBR = (data) => data.split("-").reverse().join("/");

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    if (secret !== process.env.CRON_SECRET) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const hoje = new Date();
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);

    const dataAmanha = amanha.toISOString().split("T")[0];

    const { data: horarios, error: erroHorarios } = await supabase
      .from("horarios_disponiveis")
      .select("*")
      .eq("data", dataAmanha)
      .eq("ativo", true)
      .order("especialidade", { ascending: true })
      .order("horario", { ascending: true });

    if (erroHorarios) {
      return Response.json({ error: erroHorarios.message }, { status: 500 });
    }

    const { data: consultas, error: erroConsultas } = await supabase
      .from("agendamentos")
      .select("*")
      .eq("data", dataAmanha)
      .in("status", [
        "pendente",
        "confirmado",
        "aguardando_confirmacao",
        "remarcacao"
      ])
      .order("especialidade", { ascending: true })
      .order("horario", { ascending: true });

    if (erroConsultas) {
      return Response.json({ error: erroConsultas.message }, { status: 500 });
    }

    let mensagem = `📋 Agenda completa de amanhã - Centro Veterinário Cãomarada

Data: ${formatarDataBR(dataAmanha)}

`;

    if (!horarios || horarios.length === 0) {
      mensagem += `Nenhum horário liberado para amanhã.`;
    } else {
      const grupos = {};

      horarios.forEach((h) => {
        const esp = h.especialidade || "Sem especialidade";

        if (!grupos[esp]) {
          grupos[esp] = [];
        }

        grupos[esp].push(h);
      });

      let totalHorarios = 0;
      let totalOcupados = 0;
      let totalLivres = 0;

      Object.keys(grupos).forEach((especialidade) => {
        mensagem += `🩺 ${especialidade}\n`;

        grupos[especialidade].forEach((h) => {
          totalHorarios++;

          const consulta = consultas?.find(
            (c) =>
              c.especialidade === h.especialidade &&
              c.data === h.data &&
              c.horario === h.horario
          );

          if (consulta) {
            totalOcupados++;

            const infoConvenio =
  consulta.convenio === "Sim"
    ? `Convênio: Sim | CHIP: ${consulta.chip || "-"}`
    : "Convênio: Não";

mensagem += `🔴 ${h.horario} - OCUPADO | ${consulta.pet || "-"} | Tutor: ${consulta.nome || "-"} | WhatsApp: ${consulta.whatsapp || "-"} | ${infoConvenio} | Status: ${consulta.status || "-"}\n`;
          } else {
            totalLivres++;

            mensagem += `🟢 ${h.horario} - LIVRE\n`;
          }
        });

        mensagem += `\n`;
      });

      mensagem += `Resumo:
Total de horários: ${totalHorarios}
Ocupados: ${totalOcupados}
Livres: ${totalLivres}`;
    }

    await enviarWhatsApp(
      process.env.CLINICA_WHATSAPP,
      mensagem
    );

    return Response.json({
      success: true,
      enviados: 1,
      horarios: horarios?.length || 0,
      consultas: consultas?.length || 0
    });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}