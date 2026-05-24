import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: horarios, error: erroHorarios } = await supabase
      .from("horarios_disponiveis")
      .select("*")
      .order("data", { ascending: true })
      .order("especialidade", { ascending: true })
      .order("horario", { ascending: true });

    if (erroHorarios) {
      return Response.json({ error: erroHorarios.message }, { status: 500 });
    }

    const { data: agendamentos, error: erroAgendamentos } = await supabase
      .from("agendamentos")
      .select("*")
      .order("data", { ascending: true })
      .order("especialidade", { ascending: true })
      .order("horario", { ascending: true });

    if (erroAgendamentos) {
      return Response.json({ error: erroAgendamentos.message }, { status: 500 });
    }

    const linhas = (horarios || []).map((h) => {
      const agendamento = (agendamentos || []).find(
        (a) =>
          a.data === h.data &&
          a.horario === h.horario &&
          a.especialidade === h.especialidade &&
          a.status !== "cancelado"
      );

      return {
        data: h.data,
        especialidade: h.especialidade,
        horario: h.horario,
        horario_ativo: h.ativo ? "Sim" : "Não",
        situacao: agendamento ? "Ocupado" : "Livre",
        status: agendamento?.status || "",
        tutor: agendamento?.nome || "",
        cpf: agendamento?.cpf || "",
        whatsapp: agendamento?.whatsapp || "",
        pet: agendamento?.pet || "",
        especie: agendamento?.especie || "",
        raca: agendamento?.raca || "",
        idade: agendamento?.idade || "",
        convenio: agendamento?.convenio || "",
        nomeconvenio: agendamento?.nomeconvenio || "",
        chip: agendamento?.chip || ""
      };
    });

    return Response.json({
      success: true,
      total: linhas.length,
      linhas
    });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}