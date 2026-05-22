import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase env vars missing");
}

const supabase = createClient(supabaseUrl, supabaseKey);
export async function POST(req) {
  try {
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

    await resend.emails.send({
      from: "Portal Cãomarada <noreply@vetcaomarada.com.br>",
      to: ["atendimento@vetcaomarada.com.br"],
      subject: "Novo agendamento - Portal Cãomarada",
      html: `
        <h2>Novo Agendamento</h2>
        <p><strong>Tutor:</strong> ${body.nome}</p>
        <p><strong>CPF:</strong> ${body.cpf}</p>
        <p><strong>WhatsApp:</strong> ${body.whatsapp}</p>
        <p><strong>Pet:</strong> ${body.pet}</p>
        <p><strong>Espécie:</strong> ${body.especie}</p>
        <p><strong>Raça:</strong> ${body.raca}</p>
        <p><strong>Idade:</strong> ${body.idade}</p>
        <p><strong>Convênio:</strong> ${body.convenio}</p>
        <p><strong>Nome Convênio:</strong> ${body.nomeconvenio || "-"}</p>
        <p><strong>CHIP:</strong> ${body.chip || "-"}</p>
        <p><strong>Especialidade:</strong> ${body.especialidade}</p>
        <p><strong>Data:</strong> ${body.data}</p>
        <p><strong>Horário:</strong> ${body.horario}</p>
      `
    });

    return Response.json({ success: true });

  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}