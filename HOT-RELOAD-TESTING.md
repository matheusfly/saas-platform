# 🔥 Hot Reload Testing Guide

This guide demonstrates how to verify hot-reload functionality across different operating systems (Linux, macOS, Windows) using Docker containers with shared volumes.

## 🎯 Overview

The hot-reload system has been configured to work seamlessly across different platforms using:
- **Vite** with polling-based file watching
- **Docker** containers with volume mounts
- **Cross-platform compatibility** for development environments

## 📋 Prerequisites

- Docker Desktop installed and running
- Node.js (for running test scripts)
- Git Bash/WSL2 (for Windows users running bash scripts)

## 🚀 Quick Start

### Option 1: Automated Full Test (Recommended)

#### Linux/macOS:
```bash
# Make the script executable
chmod +x docker-hot-reload-test.sh

# Run the full test suite
./docker-hot-reload-test.sh
```

#### Windows PowerShell:
```powershell
# Run the full test suite
.\docker-hot-reload-test.ps1
```

#### Using npm scripts:
```bash
# Run hot-reload test with component updates
npm run test:hot-reload

# Start Docker containers for testing
npm run dev:docker-test

# Full automated test (bash required)
npm run dev:hot-reload-full
```

### Option 2: Manual Testing

1. **Start Docker Containers:**
   ```bash
   docker-compose --profile dev up --build
   ```

2. **Open Browser:**
   Navigate to `http://localhost:5173`

3. **Edit Components:**
   Modify any React component file (e.g., `App.tsx`, `components/KpiCard.tsx`)

4. **Verify Auto-Refresh:**
   Watch the browser automatically update without manual refresh

## 🏗️ Configuration Details

### Vite Configuration (`vite.config.ts`)

The configuration has been optimized for cross-platform hot-reload:

```typescript
export default defineConfig({
  server: {
    host: '0.0.0.0',        // Allow external connections
    port: parseInt(process.env.VITE_PORT || '5173'),
    hmr: {
      overlay: false,
      port: parseInt(process.env.VITE_PORT || '5173'),
    },
    watch: {
      usePolling: true,     // Essential for Docker file watching
      interval: 1000,       // Check for changes every second
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
  },
})
```

### Docker Configuration

The `docker-compose.yml` includes:
- **Volume mounts**: `.:/app` for real-time file sync
- **Port mappings**: Multiple services on different ports
- **Environment variables**: `VITE_PORT` for service-specific ports

## 🧪 Test Components

The following components include hot-reload test indicators:

### 1. Main App (`App.tsx`)
- **Indicator**: Blue badge with timestamp
- **Location**: Top-right corner
- **Updates**: Real-time clock display

### 2. Dashboard Page (`components/DashboardPage.tsx`)
- **Indicator**: Green badge with test number
- **Location**: Header section
- **Updates**: Random test ID on each change

### 3. KPI Card (`components/KpiCard.tsx`)
- **Indicator**: Comment in component code
- **Location**: Component source code
- **Updates**: Timestamp and test number

## 🌐 Available Services

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| Web Root | 5173 | http://localhost:5173 | Main application |
| Dashboard | 5174 | http://localhost:5174 | Dashboard service |
| Cliente360 | 5175 | http://localhost:5175 | Cliente360 service |
| Schedule Manager | 5176 | http://localhost:5176 | Schedule service |
| Documentation | 3000 | http://localhost:3000 | Documentation site |

## 🔧 Platform-Specific Notes

### Linux
- ✅ Native Docker support
- ✅ File watching works out of the box
- ✅ Best performance

### macOS
- ✅ Docker Desktop required
- ⚠️ Potential performance issues with large file trees
- ✅ Polling helps with consistency

### Windows
- ✅ Docker Desktop with WSL2 backend recommended
- ⚠️ File path case sensitivity considerations
- ✅ PowerShell scripts provided for native experience
- 💡 Use WSL2 for better performance

## 🐛 Troubleshooting

### Slow Hot Reload
```bash
# Check if polling is enabled in vite.config.ts
# Increase polling interval if needed:
watch: {
  usePolling: true,
  interval: 2000, // 2 seconds instead of 1
}
```

### File Changes Not Detected
1. Verify Docker Desktop file sharing settings
2. Check volume mount configuration
3. Ensure container has write permissions

### Container Startup Issues
```bash
# Check Docker daemon status
docker info

# View container logs
docker-compose logs web-root

# Restart with clean slate
docker-compose down -v && docker-compose --profile dev up --build
```

### Port Conflicts
```bash
# Check what's using the ports
netstat -an | grep :5173

# Use different ports if needed
VITE_PORT=8080 docker-compose --profile dev up
```

## 📊 Performance Monitoring

Monitor hot-reload performance:

```bash
# Container resource usage
docker stats

# File system events (Linux/macOS)
tail -f /var/log/system.log | grep -i vite

# Windows Event Viewer
# Look for Docker Desktop events
```

## 🎯 Testing Checklist

- [ ] Containers start successfully
- [ ] Browser opens to localhost:5173
- [ ] Initial page loads correctly
- [ ] Test indicators are visible
- [ ] File edits trigger automatic refresh
- [ ] Changes appear within 1-2 seconds
- [ ] No manual browser refresh needed
- [ ] Console shows HMR activity
- [ ] Works across different file types (.tsx, .css, etc.)
- [ ] Survives container restarts

## 📝 Test Scripts

### Component Update Test
```javascript
// Updates multiple components with timestamps
node test-hot-reload.js
```

### Full Platform Test
```bash
# Comprehensive cross-platform test
./docker-hot-reload-test.sh full
```

### Cleanup
```bash
# Stop all containers and cleanup
./docker-hot-reload-test.sh cleanup
```

## 🔄 Continuous Integration

For CI/CD pipelines, use:

```yaml
# Example GitHub Actions
- name: Test Hot Reload
  run: |
    docker-compose --profile dev up -d
    npm run test:hot-reload
    docker-compose down
```

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Verify Docker Desktop is running
3. Ensure file sharing permissions are correct
4. Review container logs for errors

---

**Happy hot-reloading! 🔥**
