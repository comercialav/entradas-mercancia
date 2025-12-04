import nodemailer from 'nodemailer';

const requiredEnvVars = ['MAIL_HOST', 'MAIL_PORT', 'MAIL_USER', 'MAIL_PASS', 'MAIL_FROM'] as const;

requiredEnvVars.forEach((envKey) => {
    if (!process.env[envKey]) {
        console.warn(`[mail] Missing environment variable ${envKey}. Emails will fail until it is provided.`);
    }
});

const port = Number(process.env.MAIL_PORT ?? 465);

export const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port,
    secure: port === 465,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

interface SendMailOptions {
    to: string | string[];
    subject: string;
    html: string;
}

export async function sendMail(options: SendMailOptions) {
    if (!process.env.MAIL_FROM) {
        throw new Error('MAIL_FROM is not defined');
    }

    const info = await transporter.sendMail({
        from: process.env.MAIL_FROM,
        replyTo: process.env.MAIL_REPLY_TO ?? process.env.MAIL_FROM,
        ...options,
    });

    return info;
}

