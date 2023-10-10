FROM oven/bun
WORKDIR /app
COPY . .
RUN bun install
 
ARG PORT
EXPOSE ${PORT:-8000}
 
CMD ["bun", "src/discord-bot/startup.ts"]