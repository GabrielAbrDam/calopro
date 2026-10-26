import "server-only";

// Mails transactionnels. MVP : journalisés dans la console du serveur.
// Branchement Resend : remplacer le corps de sendMail par resend.emails.send(...).
// Règle : le code de la boîte à clés n'apparaît jamais dans un mail.

export async function sendMail(to: string, subject: string, text: string) {
  console.log(`\n[mail] À : ${to}\n[mail] Objet : ${subject}\n${text}\n`);
}

export function baseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
