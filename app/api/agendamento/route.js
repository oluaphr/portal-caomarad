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

  const result = await response.text();

  if (!response.ok) {
    throw new Error(result);
  }

  return result;
};
export async function POST(req) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const body = await req.json();

    const { error } = await supabase
      .from("agendamentos")
      .insert([body]);

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const numeroCliente = String(body.whatsapp || "").replace(/\D/g, "");
    const numeroClienteFinal = numeroCliente.startsWith("55")
      ? numeroCliente
      : `55${numeroCliente}`;

    const numeroClinica = process.env.CLINICA_WHATSAPP;

    const dataFormatada = body.data
      ? body.data.split("-").reverse().join("/")
      : "";

    const mensagemClinica = `🐾 NOVO AGENDAMENTO - CÃOMARADA

Tutor: ${body.nome}
CPF: ${body.cpf}
WhatsApp: ${body.whatsapp}

Pet: ${body.pet}
Espécie: ${body.especie || "-"}
Raça: ${body.raca || "-"}
Idade: ${body.idade || "-"}
CHIP: ${body.chip || "-"}

Convênio: ${body.convenio || "-"}
Nome convênio: ${body.nomeconvenio || "-"}

Especialidade: ${body.especialidade}
Data: ${dataFormatada}
Horário: ${body.horario}

Status: Pendente`;

    const mensagemCliente = `🐾 Centro Veterinário Cãomarada

Olá, ${body.nome}!

Recebemos seu pedido de agendamento:

🐶 Pet: ${body.pet}
🏥 Especialidade: ${body.especialidade}
📅 Data: ${dataFormatada}
🕐 Horário: ${body.horario}

Para confirmar este agendamento, responda:

1 ou CONFIRMAR

Para cancelar, responda:

2 ou CANCELAR

Para remarcar, responda:

3 ou REMARCAR

Centro Veterinário Cãomarada 💙
Atendimento 24 horas`;

let whatsappErro = null;

try {
  await enviarWhatsApp(numeroClinica, mensagemClinica);
  await enviarWhatsApp(numeroClienteFinal, mensagemCliente);
} catch (erro) {
  whatsappErro = erro.message;
}

return Response.json({
  success: true,
  whatsappErro
});

  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}