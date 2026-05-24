import { createClient } from "@supabase/supabase-js";

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
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { id, novaData, novoHorario } = await req.json();

    if (!id || !novaData || !novoHorario) {
      return Response.json(
        { error: "ID, nova data e novo horário são obrigatórios." },
        { status: 400 }
      );
    }

    const { data: agendamento, error: erroBusca } = await supabase
      .from("agendamentos")
      .select("*")
      .eq("id", id)
      .single();

    if (erroBusca || !agendamento) {
      return Response.json(
        { error: "Agendamento não encontrado." },
        { status: 404 }
      );
    }

    const dataAntiga = agendamento.data;
    const horarioAntigo = agendamento.horario;

    await supabase
      .from("horarios_disponiveis")
      .upsert(
        [
          {
            especialidade: agendamento.especialidade,
            data: novaData,
            horario: novoHorario,
            ativo: true
          }
        ],
        {
          onConflict: "especialidade,data,horario",
          ignoreDuplicates: false
        }
      );

    const { error: erroUpdate } = await supabase
      .from("agendamentos")
      .update({
        data: novaData,
        horario: novoHorario,
        status: "aguardando_confirmacao",
        lembrete_enviado: false
      })
      .eq("id", id);

    if (erroUpdate) {
      return Response.json(
        { error: erroUpdate.message },
        { status: 500 }
      );
    }

    const dataNovaFormatada = novaData.split("-").reverse().join("/");
    const dataAntigaFormatada = dataAntiga
      ? dataAntiga.split("-").reverse().join("/")
      : "-";

    const numeroCliente = formatarNumero(agendamento.whatsapp);

    await enviarWhatsApp(
      numeroCliente,
      `🔁 Alteração de agendamento

Olá, ${agendamento.nome}!

Precisamos alterar o horário da consulta do pet ${agendamento.pet}.

🏥 Especialidade: ${agendamento.especialidade}

Horário anterior:
📅 ${dataAntigaFormatada}
🕐 ${horarioAntigo}

Novo horário:
📅 ${dataNovaFormatada}
🕐 ${novoHorario}

Para confirmar o novo horário, responda:
1 ou CONFIRMAR

Para cancelar, responda:
2 ou CANCELAR

Para solicitar outra remarcação, responda:
3 ou REMARCAR

Centro Veterinário Cãomarada 💙`
    );

    await enviarWhatsApp(
      process.env.CLINICA_WHATSAPP,
      `🔁 Alteração enviada ao cliente

Tutor: ${agendamento.nome}
Pet: ${agendamento.pet}
Especialidade: ${agendamento.especialidade}

Horário anterior:
${dataAntigaFormatada} às ${horarioAntigo}

Novo horário:
${dataNovaFormatada} às ${novoHorario}

Status: AGUARDANDO CONFIRMAÇÃO`
    );

    return Response.json({
      success: true,
      antigo: {
        data: dataAntiga,
        horario: horarioAntigo
      },
      novo: {
        data: novaData,
        horario: novoHorario
      }
    });
  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}