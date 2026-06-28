# 🔒 Luna AI Security Architecture

Luna AI is built with security as a core principle. This document explains the security measures in place.

---

## 🛡️ 5-Layer Security Model

Luna AI implements a comprehensive 5-layer security architecture:

```
┌─────────────────────────────────────────────────┐
│           Layer 1: IPC Validation               │
│  All messages validated before processing       │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│        Layer 2: Permission System (3-Tier)      │
│  Safe / Dangerous / Restricted operations       │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│      Layer 3: Data Encryption & Storage         │
│  API keys encrypted, local-only storage         │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│      Layer 4: Process Isolation & Sandboxing    │
│  Renderer sandboxed, Main process restricted   │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│       Layer 5: Audit Logging & Monitoring       │
│  All operations logged, suspicious activity     │
└─────────────────────────────────────────────────┘
```

---

## Layer 1: IPC Validation

### Message Validation

All Inter-Process Communication (IPC) messages are validated:

```javascript
// Validate message structure
const validateMessage = (message) => {
  if (!message || typeof message !== 'object') {
    throw new Error('Invalid message format');
  }
  
  if (!message.type || typeof message.type !== 'string') {
    throw new Error('Missing message type');
  }
  
  if (!allowedTypes.includes(message.type)) {
    throw new Error('Unauthorized message type');
  }
  
  return true;
};

// Sanitize input
const sanitizeInput = (input) => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .slice(0, 10000);     // Limit length
};
```

### Type Checking

```javascript
// Strict type validation
const messageSchema = {
  type: 'string',
  payload: 'object',
  timestamp: 'number'
};

const validateSchema = (message, schema) => {
  for (const [key, expectedType] of Object.entries(schema)) {
    if (typeof message[key] !== expectedType) {
      throw new TypeError(`Invalid type for ${key}`);
    }
  }
};
```

---

## Layer 2: Permission System (3-Tier)

### Safe Operations (No Popup)

These operations are considered safe and don't require user approval:

```javascript
const SAFE_OPERATIONS = [
  'openApp',           // Open applications
  'adjustVolume',      // Change volume
  'adjustBrightness',  // Change brightness
  'takeScreenshot',    // Capture screen
  'getSystemInfo',     // Read system info
  'typeText',          // Type text
  'mouseClick',        // Mouse click
  'generateCode',      // Generate code
  'createDocument',    // Create document
  'generateImage'      // Generate image
];
```

### Dangerous Operations (Popup Required)

These operations require explicit user confirmation:

```javascript
const DANGEROUS_OPERATIONS = [
  'runScript',         // Execute scripts
  'createFile',        // Create files
  'deleteFile',        // Delete files
  'modifyRegistry',    // Modify registry (Windows)
  'installSoftware',   // Install programs
  'modifySettings',    // Change system settings
  'accessNetwork',     // Network operations
  'readPrivateData'    // Access private files
];

// User confirmation popup
const requestPermission = async (operation) => {
  return new Promise((resolve) => {
    mainWindow.webContents.send('request-permission', {
      operation: operation,
      timestamp: Date.now()
    });
    
    ipcMain.once('permission-response', (event, allowed) => {
      resolve(allowed);
    });
  });
};
```

### Restricted Operations (Never Allowed)

These operations are **never** allowed, even with user permission:

```javascript
const RESTRICTED_OPERATIONS = [
  'deleteSystemFiles',      // Delete Windows/System32
  'formatDrive',            // Format hard drive
  'disableAntivirus',       // Disable security
  'createMalware',          // Create malicious code
  'accessOtherUserData',    // Access other users
  'modifyKernel',           // Modify OS kernel
  'disableFirewall',        // Disable firewall
  'rootAccess'              // Gain root/admin
];

// Blocked keywords
const BLOCKED_KEYWORDS = [
  'system32', 'windows', 'kernel', 'malware',
  'virus', 'trojan', 'ransomware', 'worm',
  'delete /s', 'format c:', 'rm -rf /',
  'sudo', 'admin', 'root'
];
```

---

## Layer 3: Data Encryption & Storage

### API Key Encryption

```javascript
const crypto = require('crypto');

// Encrypt API key
const encryptApiKey = (apiKey) => {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.MASTER_KEY, 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
};

// Decrypt API key
const decryptApiKey = (encryptedKey) => {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.MASTER_KEY, 'salt', 32);
  
  const parts = encryptedKey.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};
```

### Local-Only Storage

```javascript
// All data stored locally in SQLite
// No cloud sync by default
// Optional encrypted backup

const database = {
  location: 'C:/Users/[User]/AppData/Local/Luna AI/db.sqlite',
  encryption: 'AES-256-CBC',
  backup: 'Optional (encrypted)',
  cloudSync: 'Disabled by default'
};
```

### Sensitive Data Hashing

```javascript
const bcrypt = require('bcrypt');

// Hash sensitive data
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Verify hash
const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};
```

---

## Layer 4: Process Isolation & Sandboxing

### Electron Security Configuration

```javascript
// Main process security
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      // Disable Node.js integration in renderer
      nodeIntegration: false,
      
      // Enable context isolation
      contextIsolation: true,
      
      // Use preload script for IPC
      preload: path.join(__dirname, 'preload.js'),
      
      // Disable dev tools in production
      devTools: process.env.NODE_ENV !== 'production',
      
      // Sandbox renderer process
      sandbox: true,
      
      // Disable remote module
      enableRemoteModule: false
    }
  });
};
```

### Preload Script Validation

```javascript
// preload.js - Only expose safe APIs
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('luna', {
  // Only expose safe methods
  sendMessage: (message) => {
    if (typeof message !== 'string') {
      throw new Error('Invalid message type');
    }
    return ipcRenderer.invoke('send-message', message);
  },
  
  // Don't expose dangerous APIs
  // No access to: fs, child_process, etc.
});
```

---

## Layer 5: Audit Logging & Monitoring

### Operation Logging

```javascript
const logOperation = (operation, details, success) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    operation: operation,
    details: details,
    success: success,
    userId: getCurrentUserId(),
    ipAddress: 'localhost'
  };
  
  // Store in database
  db.insert('audit_log', logEntry);
  
  // Alert if suspicious
  if (!success && operation === 'DANGEROUS_OP') {
    alertSecurityTeam(logEntry);
  }
};

// Log all operations
logOperation('openApp', { app: 'Notepad' }, true);
logOperation('deleteFile', { path: 'C:/important.txt' }, false);
```

### Suspicious Activity Detection

```javascript
const detectSuspiciousActivity = (logs) => {
  const suspiciousPatterns = [
    // Multiple failed operations in short time
    (logs) => {
      const failedOps = logs.filter(l => !l.success);
      return failedOps.length > 10 && 
             (Date.now() - failedOps[0].timestamp) < 60000;
    },
    
    // Repeated attempts to access restricted operations
    (logs) => {
      const restrictedAttempts = logs.filter(l => 
        RESTRICTED_OPERATIONS.includes(l.operation)
      );
      return restrictedAttempts.length > 5;
    },
    
    // Unusual time of access
    (logs) => {
      const hour = new Date().getHours();
      return hour < 6 || hour > 22; // Unusual hours
    }
  ];
  
  return suspiciousPatterns.some(pattern => pattern(logs));
};
```

---

## 🔐 Best Practices for Users

### Protect Your API Keys

1. **Never share API keys** - Keep them private
2. **Use environment variables** - Don't hardcode keys
3. **Rotate keys regularly** - Change keys every 90 days
4. **Revoke compromised keys** - Immediately disable if leaked
5. **Use different keys** - One key per service

### Secure Your PC

1. **Keep Windows updated** - Install security patches
2. **Use antivirus** - Keep antivirus active
3. **Enable firewall** - Use Windows Defender Firewall
4. **Strong password** - Use complex password
5. **Two-factor authentication** - Enable 2FA where possible

### Luna AI Usage

1. **Review permissions** - Check what Luna can access
2. **Monitor operations** - Check audit logs regularly
3. **Report issues** - Report security concerns immediately
4. **Keep Luna updated** - Update to latest version
5. **Backup data** - Regular backups of important data

---

## 🚨 Security Incident Response

### If You Suspect a Breach

1. **Stop Luna immediately** - Close the application
2. **Change API keys** - Revoke all compromised keys
3. **Review logs** - Check audit logs for suspicious activity
4. **Report to maintainers** - Email security@luna-ai.com
5. **Scan your PC** - Run antivirus scan
6. **Update password** - Change your Windows password

### Reporting Security Issues

**Please do NOT open public issues for security vulnerabilities.**

Instead:
1. Email: security@luna-ai.com
2. Include: Detailed description, steps to reproduce, impact
3. Wait: We'll respond within 48 hours
4. Coordinate: We'll work with you on a fix timeline

---

## 📋 Security Checklist

- [ ] API keys encrypted at rest
- [ ] IPC messages validated
- [ ] Permission system enforced
- [ ] Operations logged and monitored
- [ ] Suspicious activity detected
- [ ] Data stored locally only
- [ ] Renderer process sandboxed
- [ ] No Node.js integration in renderer
- [ ] Context isolation enabled
- [ ] Preload script validates all APIs
- [ ] Restricted operations blocked
- [ ] Audit logs retained
- [ ] Security documentation updated
- [ ] Regular security audits scheduled

---

## 🔗 Resources

- [OWASP Security Guidelines](https://owasp.org/)
- [Electron Security](https://www.electronjs.org/docs/tutorial/security)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)

---

## 📞 Security Contact

- **Email:** security@luna-ai.com
- **GitHub:** [Report Issue](https://github.com/R22-b/luna-AI/security/advisories)
- **Discord:** (coming soon)

---

**Your security is our priority.** 🛡️

Last Updated: June 28, 2026
