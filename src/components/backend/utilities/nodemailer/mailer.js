import nodemailer from "nodemailer";
import { resolve } from "path";
import { cwd } from "process";
import hbs from "nodemailer-express-handlebars";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587, // Use 587 for TLS (recommended) or 465 for SSL
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

// Configure Handlebars template engine
const handlebarOptions = {
  viewEngine: {
    extname: ".hbs",
    partialsDir: resolve(
      cwd(),
      "src/components/backend/utilities/nodemailer/views/"
    ), // Use process.cwd() for Next.js compatibility
    defaultLayout: false,
  },
  viewPath: resolve(
    cwd(),
    "src/components/backend/utilities/nodemailer/views/"
  ),
  extName: ".hbs",
};

transporter.use("compile", hbs(handlebarOptions));

export default transporter;
