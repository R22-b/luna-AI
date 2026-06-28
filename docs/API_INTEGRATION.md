# 🔌 Luna AI API Integration Guide

This guide explains how to integrate Luna AI with external services and build custom applications.

---

## 📡 Luna AI API Overview

Luna AI exposes a local Express server on `127.0.0.1:3000` that you can use to integrate with external applications.

### Base URL

```
http://127.0.0.1:3000
```

### Authentication

Currently, Luna AI uses local-only access (no remote authentication). All requests must come from `localhost`.

---

## 🔑 Available Endpoints

### 1. Chat Endpoint

**Send a message to Luna AI**

```
POST /api/luna/chat
Content-Type: application/json

{
  "message": "What is the weather?",
  "threadId": "optional-thread-id"
}
```

**Response:**

```json
{
  "success": true,
  "response": "I'll check the weather for you...",
  "provider": "groq",
  "tokens_used": 245,
  "timestamp": "2026-06-28T10:30:00Z"
}
```

### 2. PC Control Endpoint

**Execute a system command**

```
POST /api/luna/pcControl
Content-Type: application/json

{
  "command": "open",
  "args": {
    "app": "Notepad"
  }
}
```

**Supported Commands:**

| Command | Args | Example |
|---------|------|---------|
| `open` | `app` | `{ "app": "Spotify" }` |
| `close` | `app` | `{ "app": "Chrome" }` |
| `setVolume` | `level` | `{ "level": 50 }` |
| `setBrightness` | `level` | `{ "level": 100 }` |
| `screenshot` | none | `{}` |
| `getSystemInfo` | none | `{}` |

**Response:**

```json
{
  "success": true,
  "result": "Notepad opened successfully",
  "timestamp": "2026-06-28T10:30:00Z"
}
```

### 3. Project Creation Endpoint

**Create a new project**

```
POST /api/luna/project
Content-Type: application/json

{
  "name": "my-react-app",
  "type": "react",
  "description": "A simple React app"
}
```

**Supported Project Types:**

- `react` - React + Vite
- `express` - Node.js + Express
- `nextjs` - Next.js
- `vue` - Vue 3
- `svelte` - Svelte

**Response:**

```json
{
  "success": true,
  "projectPath": "C:/Users/Ravi/Projects/my-react-app",
  "timestamp": "2026-06-28T10:30:00Z"
}
```

### 4. Memory Endpoint

**Retrieve stored memories**

```
GET /api/luna/memory?category=preferences
```

**Response:**

```json
{
  "success": true,
  "memories": [
    {
      "key": "favorite_language",
      "value": "JavaScript",
      "category": "preferences"
    }
  ]
}
```

**Save a memory**

```
POST /api/luna/memory
Content-Type: application/json

{
  "key": "favorite_color",
  "value": "purple",
  "category": "preferences"
}
```

---

## 💻 Code Examples

### JavaScript/Node.js

```javascript
// Send a message to Luna
async function chatWithLuna(message) {
  const response = await fetch('http://127.0.0.1:3000/api/luna/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: message,
      threadId: 'my-thread'
    })
  });

  const data = await response.json();
  console.log('Luna:', data.response);
  return data;
}

// Usage
chatWithLuna('Build a React component for a todo list');
```

### Python

```python
import requests
import json

def chat_with_luna(message):
    url = 'http://127.0.0.1:3000/api/luna/chat'
    payload = {
        'message': message,
        'threadId': 'my-thread'
    }
    
    response = requests.post(url, json=payload)
    data = response.json()
    
    print(f"Luna: {data['response']}")
    return data

# Usage
chat_with_luna('What is machine learning?')
```

### cURL

```bash
# Send a message
curl -X POST http://127.0.0.1:3000/api/luna/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello Luna!",
    "threadId": "my-thread"
  }'

# Open an app
curl -X POST http://127.0.0.1:3000/api/luna/pcControl \
  -H "Content-Type: application/json" \
  -d '{
    "command": "open",
    "args": {"app": "Spotify"}
  }'
```

---

## 🔐 Security Considerations

### Important

1. **Local Only** - Luna API only accepts requests from `127.0.0.1`
2. **No Remote Access** - Cannot be accessed from other machines
3. **No Authentication** - Assumes trusted local environment
4. **Validate Input** - Always validate user input before sending to Luna
5. **Sensitive Data** - Don't log API responses containing sensitive info

### Best Practices

```javascript
// ✅ Good: Validate input
function sendMessage(message) {
  if (!message || typeof message !== 'string') {
    throw new Error('Invalid message');
  }
  return chatWithLuna(message);
}

// ❌ Bad: No validation
function sendMessage(message) {
  return chatWithLuna(message);
}
```

---

## 🚀 Advanced Usage

### Streaming Responses

For long-running operations, use Server-Sent Events (SSE):

```javascript
// Listen to streaming response
const eventSource = new EventSource('http://127.0.0.1:3000/api/luna/stream');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Chunk:', data.chunk);
};

eventSource.onerror = (error) => {
  console.error('Stream error:', error);
  eventSource.close();
};
```

### Batch Operations

Send multiple requests efficiently:

```javascript
async function batchChat(messages) {
  const promises = messages.map(msg => 
    chatWithLuna(msg)
  );
  
  const results = await Promise.all(promises);
  return results;
}

// Usage
const messages = [
  'What is AI?',
  'Explain machine learning',
  'What is deep learning?'
];

batchChat(messages).then(results => {
  results.forEach((result, i) => {
    console.log(`Q${i+1}: ${result.response}`);
  });
});
```

---

## 📊 Rate Limiting

Luna AI implements rate limiting to prevent abuse:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/luna/chat` | 100 requests | 1 minute |
| `/api/luna/pcControl` | 50 requests | 1 minute |
| `/api/luna/project` | 10 requests | 1 hour |
| `/api/luna/memory` | 200 requests | 1 minute |

**Response when rate limited:**

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

---

## 🐛 Error Handling

Always handle errors gracefully:

```javascript
async function chatWithLunaError(message) {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/luna/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error('Error:', error.message);
    // Handle error appropriately
    return null;
  }
}
```

---

## 📝 Webhook Integration

Luna AI can send webhooks for important events:

**Configure webhooks:**

```json
{
  "webhooks": [
    {
      "event": "message_received",
      "url": "https://example.com/webhooks/message"
    },
    {
      "event": "project_created",
      "url": "https://example.com/webhooks/project"
    }
  ]
}
```

**Webhook payload:**

```json
{
  "event": "message_received",
  "timestamp": "2026-06-28T10:30:00Z",
  "data": {
    "message": "Hello Luna",
    "response": "Hello! How can I help?",
    "provider": "groq"
  }
}
```

---

## 🔗 Third-Party Integrations

### IFTTT Integration

```javascript
// Trigger IFTTT when Luna completes a task
async function triggerIFTTT(event, value) {
  const webhookKey = 'YOUR_IFTTT_KEY';
  
  await fetch(`https://maker.ifttt.com/trigger/${event}/with/key/${webhookKey}`, {
    method: 'POST',
    body: JSON.stringify({ value1: value })
  });
}

// Usage
chatWithLuna('Send me a notification').then(() => {
  triggerIFTTT('luna_notification', 'Task completed!');
});
```

### Slack Integration

```javascript
// Send Luna's response to Slack
async function sendToSlack(message) {
  const webhookUrl = 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL';
  
  await fetch(webhookUrl, {
    method: 'POST',
    body: JSON.stringify({
      text: `Luna AI: ${message}`
    })
  });
}

// Usage
chatWithLuna('What should I work on?').then((result) => {
  sendToSlack(result.response);
});
```

---

## 📚 Resources

- [GitHub Repository](https://github.com/R22-b/luna-AI)
- [Architecture Guide](./ARCHITECTURE.md)
- [User Manual](../Luna_AI_2.0_User_Manual.md)
- [Contributing Guide](./CONTRIBUTING.md)

---

## 💬 Support

- **GitHub Issues** - Bug reports and questions
- **GitHub Discussions** - Feature requests and ideas
- **Discord** (coming soon) - Community chat

---

**Happy integrating!** 🚀
