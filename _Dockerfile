FROM oven/bun
WORKDIR /app
COPY . .
RUN bun install
RUN bunx prisma generate
 
ARG PORT
EXPOSE ${PORT:-8000}
 
CMD ["bun", "src/discord-bot/startup.ts"]