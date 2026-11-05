#!/usr/bin/env node
/**
 * Sincly Autonomous AI Marketing OS — Standalone MCP Stdio Bridge
 * Allows Claude Desktop, Cursor, and Windsurf to communicate with Sincly via stdio.
 */

const readline = require('readline');
const http = require('http');
const https = require('https');

const API_URL = process.env.SINCLY_API_URL || 'http://localhost:5000/api/mcp';

function sendJsonRpcToSincly(requestPayload) {
  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(API_URL);
      const isHttps = parsed.protocol === 'https:';
      const client = isHttps ? https : http;

      const bodyData = JSON.stringify(requestPayload);

      const req = client.request(
        {
          hostname: parsed.hostname,
          port: parsed.port || (isHttps ? 443 : 80),
          path: parsed.pathname + parsed.search,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(bodyData),
            'User-Agent': 'Sincly-MCP-Stdio-Bridge/1.0.0'
          },
          timeout: 10000
        },
        res => {
          let rawData = '';
          res.on('data', chunk => {
            rawData += chunk;
          });
          res.on('end', () => {
            try {
              if (rawData.trim()) {
                resolve(JSON.parse(rawData));
              } else {
                resolve(null);
              }
            } catch (err) {
              reject(new Error(`Failed to parse Sincly response: ${rawData}`));
            }
          });
        }
      );

      req.on('error', err => {
        reject(err);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Sincly server request timed out.'));
      });

      req.write(bodyData);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', async line => {
  const trimmed = line.trim();
  if (!trimmed) return;

  try {
    const rpcRequest = JSON.parse(trimmed);

    // If notifications, acknowledge without writing to stdout
    if (!rpcRequest.id && rpcRequest.method && rpcRequest.method.startsWith('notifications/')) {
      sendJsonRpcToSincly(rpcRequest).catch(() => {});
      return;
    }

    try {
      const response = await sendJsonRpcToSincly(rpcRequest);
      if (response) {
        process.stdout.write(JSON.stringify(response) + '\n');
      }
    } catch (err) {
      // Local fallback if server is offline or restarting
      if (rpcRequest.method === 'initialize') {
        const initFallback = {
          jsonrpc: '2.0',
          id: rpcRequest.id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: { listChanged: true } },
            serverInfo: {
              name: 'sincly-marketing-os-mcp',
              version: '1.0.0',
              description: 'Sincly Autonomous AI Marketing OS MCP Bridge (Offline Fallback)'
            }
          }
        };
        process.stdout.write(JSON.stringify(initFallback) + '\n');
      } else {
        const errorResponse = {
          jsonrpc: '2.0',
          id: rpcRequest.id || 1,
          error: {
            code: -32603,
            message: `Sincly MCP Bridge error: Cannot reach Sincly backend at ${API_URL}. Please ensure 'npm run dev' is running.`
          }
        };
        process.stdout.write(JSON.stringify(errorResponse) + '\n');
      }
    }
  } catch (err) {
    const parseError = {
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: 'Parse error: invalid JSON received.' }
    };
    process.stdout.write(JSON.stringify(parseError) + '\n');
  }
});
