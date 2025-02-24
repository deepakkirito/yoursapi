import Mail from "./layout";

export async function sendMail({ to, subject, text, html, template, context }) {
  const mail = new Mail();
  mail.setTo(to);
  mail.setSubject(subject);
  mail.setText(text);
  mail.setHtml(html);
  mail.setTemplate(template);
  mail.setContext(context);
  return mail.send();
}
