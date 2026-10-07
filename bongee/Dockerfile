FROM node:22-slim
WORKDIR /app
COPY bongee/package*.json ./bongee/
COPY bongee/build-session.mjs ./bongee/
COPY v3/@claude-flow/cli/src/mcp-tools/agent-execute-core.ts ./v3/@claude-flow/cli/src/mcp-tools/
COPY v3/@claude-flow/cli/src/mcp-tools/cli-session-provider.ts ./v3/@claude-flow/cli/src/mcp-tools/
RUN cd bongee && npm ci --omit=dev
COPY bongee/ ./bongee/
WORKDIR /app/bongee
CMD ["node", "gateway.mjs"]
