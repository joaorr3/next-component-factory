import * as dotenv from 'dotenv'
dotenv.config({
    path: `.env.${process.env.NODE_ENV || "local"}`,
});

const config = {
    connect: {
        user: process.env.MAIL_USER || "",
        password: process.env.MAIL_PASSWORD || "",
        host: process.env.MAIL_HOST || "",
        port: process.env.MAIL_PORT || "",
        tls: process.env.MAIL_USE_TLS === "true" || false,
        markSeen: false,
        tlsOptions: {
            rejectUnauthorized: false
        }
    },
    validation: {
        azureAddress: process.env.MAIL_AZURE_ADDRESS || "",
    }
}

export default config