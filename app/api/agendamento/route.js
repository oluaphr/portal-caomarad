import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendKey = process.env.RESEND_API_KEY;

    if (!supabaseUrl || !supabaseKey || !resendKey) {
      return Response.json(
        { error: "Variáveis de ambiente ausentes" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendKey);

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