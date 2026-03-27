import express from 'express';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { ShopifyMcpServer } from "@shopify/mcp-server"; 
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

// NEW 2026 AUTH: Exchange Client ID/Secret for a Token
async function getAccessToken() {
  const response = await axios.post(`https://${process.env.SHOPIFY_SHOP_URL}/admin/oauth/access_token`, {
    client_id: process.env.SHOPIFY_CLIENT_ID,
    client_secret: process.env.SHOPIFY_CLIENT_SECRET,
    grant_type: 'client_credentials'
  });
  return response.data.access_token;
}

const shopifyToken = await getAccessToken();

const shopifyServer = new ShopifyMcpServer({
  adminApiAccessToken: shopifyToken,
  shopUrl: process.env.SHOPIFY_SHOP_URL!,
});

let transport: SSEServerTransport;

app.get("/sse", async (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  await shopifyServer.connect(transport);
});

app.post("/messages", async (req, res) => {
  if (transport) await transport.handlePostMessage(req, res);
});

app.listen(port, () => console.log(`Optimiz Shopify MCP (2026 Mode) live on port ${port}`));
