import transporter from "./mailer";

class Mail {
  constructor() {
    this.mailOptions = {
      from: {
        address: process.env.EMAIL,
        name: "Yours Api",
      },
      context: {
        companyUrl: process.env.COMPANY_URL,
        companyName: process.env.COMPANY_NAME,
      },
    };
  }

  setCompany(company) {
    this.mailOptions.from.name = company;
  }

  setTo(receiver) {
    this.mailOptions.to = receiver;
  }

  setSubject(subject) {
    this.mailOptions.subject = subject;
  }

  setText(text) {
    this.mailOptions.text = text;
  }

  setHtml(html) {
    this.mailOptions.html = html;
  }

  setTemplate(template) {
    this.mailOptions.template = template;
  }

  setContext(context) {
    this.mailOptions.context = {
      ...this.mailOptions.context,
      ...context,
    };
  }

  async send() {
    try {
      const info = await transporter.sendMail(this.mailOptions);
      return info;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export default Mail;
