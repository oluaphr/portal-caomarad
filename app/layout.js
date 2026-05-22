export const metadata = {
  title: "Portal Cãomarada",
  description: "Agendamento Online - Centro Veterinário Cãomarada 24 Horas",
  icons: {
    icon: "/favicon.png"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}