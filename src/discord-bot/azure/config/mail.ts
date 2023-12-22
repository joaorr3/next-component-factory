import { env } from "../../../env/server"


const config = {
    connect: {
        user: env.MAIL_USER || "",
        password: env.MAIL_PASSWORD || "",
        host: env.MAIL_HOST || "",
        port: env.MAIL_PORT || "",
        tls: env.MAIL_USE_TLS === "true" || false,
        markSeen: false,
        tlsOptions: {
            rejectUnauthorized: false
        }
    },
    validation: {
        azureAddress: env.MAIL_AZURE_ADDRESS || "",
    }
}

export default config