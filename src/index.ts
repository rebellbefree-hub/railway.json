import express from 'express';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { ShopifyMcpServer } from "@shopify/mcp-server"; 
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

// 1. Initialize the internal Shopify MCP Server
const shopifyServer = new ShopifyMcpServer({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecret: process.env.SHOPIFY_API_SECRET!,
  adminApiAccessToken: process.env.SHOPIFY_ADMIN_TOKEN!,
  shopUrl: process.env.SHOPIFY_SHOP_URL!,
});

// 2. Create the SSE Transport Bridge
let transport: SSEServerTransport;

app.get("/sse", async (req, res) => {
  console.log("New Antigravity agent connecting via SSE...");
  transport = new SSEServerTransport("/messages", res);
  await shopifyServer.connect(transport);
});

app.post("/messages", async (req, res) => {
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send("No active SSE session found.");
  }
});

app.listen(port, () => {
  console.log(`Optimiz Shopify SSE Wrapper running on port ${port}`);
  console.log(`Endpoint: http://localhost:${port}/sse`);
});
