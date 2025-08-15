# Docker Troubleshooting Guide

This guide documents common issues encountered when running `docker compose up` and their solutions, based on end-to-end testing of the SaaS Home project.

## Table of Contents
- [Quick Start Issues](#quick-start-issues)
- [Build Issues](#build-issues)
- [Runtime Issues](#runtime-issues)
- [Port and Network Issues](#port-and-network-issues)
- [Windows-Specific Issues](#windows-specific-issues)
- [Profile and Dependency Issues](#profile-and-dependency-issues)
- [Performance Issues](#performance-issues)
- [Health Check Issues](#health-check-issues)

## Quick Start Issues

### Issue: Obsolete Version Warning
**Error:**
```
time="2025-08-13T21:31:44-03:00" level=warning msg="docker-compose.yml: the attribute `version` is obsolete"
```

**Fix:**
Remove the `version: '3.9'` line from both `docker-compose.yml` and `docker-compose.override.yml`. Docker Compose v2 doesn't require this field and it's deprecated.

**Impact:** Warning only, doesn't prevent functionality

---

## Build Issues

### Issue: Missing Workspace Packages
**Error:**
```
COPY packages/*/package.json ./packages/*/ 2>/dev/null || true
failed to compute cache key: "/||": not found
```

**Cause:** Dockerfile trying to copy workspace packages that don't exist in this project structure.

**Fix:** 
Update the Dockerfile to remove the conditional workspace copy:
```dockerfile
# Remove this line:
COPY packages/*/package.json ./packages/*/ 2>/dev/null || true
```

**Prevention:** Check project structure before copying workspace-specific files.

---

### Issue: Documentation Files Causing Vite Scan Failures
**Error:**
```
Failed to run dependency scan. Skipping dependency pre-bundling. Error: The following dependencies are imported but could not be resolved:
README_files/libs/quarto-html/quarto.js (imported by /app/README.html)
```

**Cause:** Vite trying to process documentation HTML files that reference missing JavaScript dependencies.

**Fix:** 
Update `.dockerignore` to exclude documentation files:
```dockerignore
# Documentation that's not needed in container
README*.md
README*.html
*.md
docs/
documentation/
README_files/
```

**Prevention:** Always exclude unnecessary files in .dockerignore to keep container builds lean and avoid conflicts.

---

### Issue: Redundant NPM Install in CMD
**Error:** Container exits immediately after successful npm install

**Cause:** Dockerfile CMD running `npm ci && npm run dev` when dependencies are already installed in the deps stage.

**Fix:**
```dockerfile
# Change from:
CMD ["sh", "-c", "npm ci && $CMD"]
# To:
CMD ["npm", "run", "dev"]
```

**Prevention:** Avoid redundant package installations when using multi-stage builds.

---

## Runtime Issues

### Issue: Dev Server Not Starting
**Symptoms:** 
- Container builds successfully
- Container exits with code 0
- No error messages

**Cause:** Command not properly executing in container

**Fix:** Use explicit command format:
```dockerfile
CMD ["npm", "run", "dev"]
```

**Alternative Fix:** If using variables, ensure proper shell expansion:
```dockerfile
CMD ["sh", "-c", "${CMD}"]
```

**Debug Steps:**
1. Run container interactively: `docker run --rm -it <image> sh`
2. Test command manually: `npm run dev`
3. Check if Vite config is correct

---

## Port and Network Issues

### Issue: Port Already in Use
**Error:**
```
Error starting userland proxy: listen tcp4 0.0.0.0:5173: bind: address already in use
```

**Diagnosis:** Check what's using the port:
```bash
# Windows
netstat -ano | findstr ":5173"

# Linux/Mac
lsof -i :5173
```

**Fixes:**
1. **Stop conflicting service:**
   ```bash
   # Kill process using port
   taskkill /PID <PID> /F  # Windows
   kill -9 <PID>           # Linux/Mac
   ```

2. **Use different port:**
   ```yaml
   # In docker-compose.yml
   ports:
     - "5174:5173"  # Map host port 5174 to container port 5173
   ```

3. **Change Vite port:**
   ```yaml
   environment:
     - VITE_PORT=5174
   ports:
     - "5174:5174"
   ```

**Prevention:** Use port ranges or random ports for development environments.

---

### Issue: Service Unreachable Despite Port Binding
**Symptoms:**
- `netstat` shows port is listening
- `curl localhost:5173` fails to connect
- Vite shows "ready" message in logs

**Possible Causes:**
1. **Windows Docker networking issue**
2. **Firewall blocking connection**
3. **Vite not binding to 0.0.0.0**

**Fixes:**
1. **Verify Vite config:**
   ```typescript
   // vite.config.ts
   export default defineConfig({
     server: {
       host: '0.0.0.0', // Critical for Docker
       port: 5173,
     }
   })
   ```

2. **Test container network IP:**
   ```bash
   docker compose logs web-root | grep "Network:"
   curl http://172.x.x.x:5173  # Use the network IP shown
   ```

3. **Check Windows Docker Desktop networking:**
   - Restart Docker Desktop
   - Check WSL 2 integration settings
   - Try accessing via `127.0.0.1` instead of `localhost`

---

## Windows-Specific Issues

### Issue: File Sync Slowness
**Symptoms:**
- Slow hot reload
- Changes not reflected immediately
- High CPU usage

**Cause:** Windows file system performance with volume mounts

**Fixes:**
1. **Use named volumes for node_modules:**
   ```yaml
   volumes:
     - .:/app
     - web_node_modules:/app/node_modules  # Separate volume
   ```

2. **Enable WSL 2 backend in Docker Desktop**

3. **Move project to WSL 2 filesystem:**
   ```bash
   # From Windows, access via:
   \\wsl$\Ubuntu\home\user\project
   ```

4. **Configure Vite polling:**
   ```typescript
   export default defineConfig({
     server: {
       watch: {
         usePolling: true,
         interval: 1000,
       }
     }
   })
   ```

**Performance Impact:** Named volumes can improve build times by 3-5x on Windows.

---

### Issue: Path Separators
**Symptoms:** Build failures with path-related errors

**Fix:** Use forward slashes in Dockerfile and compose files:
```dockerfile
COPY package.json package-lock.json ./
# Not: COPY package.json package-lock.json .\
```

---

## Profile and Dependency Issues

### Issue: Service Dependencies Across Profiles
**Error:**
```
service "docs-site" depends on undefined service "dashboard-page-build": invalid compose project
```

**Cause:** Service in one profile depending on service from another profile that's not active.

**Fix Options:**
1. **Run multiple profiles:**
   ```bash
   docker compose --profile dev --profile build up
   ```

2. **Move dependencies to same profile:**
   ```yaml
   docs-site:
     profiles:
       - dev
       - build  # Add to multiple profiles
   ```

3. **Make dependencies conditional:**
   ```yaml
   depends_on:
     dashboard-page-build:
       condition: service_started
       required: false  # Make optional
   ```

**Best Practice:** Keep related services in the same profile or use profile inheritance.

---

### Issue: Test Profile Dependencies
**Error:**
```
service "test-runner" depends on undefined service "cliente360-page": invalid compose project
```

**Fix:** Run test profile with development services:
```bash
docker compose --profile dev --profile test up
```

**Alternative:** Create self-contained test profile:
```yaml
test-runner:
  build:
    context: .
    target: dev
  command: npm test
  # Remove depends_on or make them conditional
```

---

## Performance Issues

### Issue: Slow Build Times
**Symptoms:**
- Docker build takes several minutes
- Frequent cache misses

**Optimizations:**
1. **Order Dockerfile commands by change frequency:**
   ```dockerfile
   # Dependencies change less often
   COPY package*.json ./
   RUN npm ci
   
   # Source code changes more often
   COPY . .
   ```

2. **Use BuildKit:**
   ```bash
   export DOCKER_BUILDKIT=1
   docker compose build
   ```

3. **Optimize .dockerignore:**
   ```dockerignore
   node_modules
   dist/
   *.log
   .git/
   README*
   docs/
   ```

4. **Use multi-stage builds effectively:**
   ```dockerfile
   FROM node:20-alpine AS deps
   # Install dependencies
   
   FROM deps AS dev
   # Development setup
   
   FROM deps AS prod
   # Production build
   ```

---

### Issue: High Memory Usage
**Symptoms:**
- Docker consuming excessive RAM
- Build failures with out-of-memory errors

**Fixes:**
1. **Set resource limits:**
   ```yaml
   services:
     web-root:
       deploy:
         resources:
           limits:
             memory: 1G
             cpus: '0.5'
   ```

2. **Optimize Node.js memory:**
   ```yaml
   environment:
     - NODE_OPTIONS="--max-old-space-size=1024"
   ```

3. **Clean up regularly:**
   ```bash
   docker system prune -a
   docker volume prune
   ```

---

## Health Check Issues

### Issue: Health Checks Always Fail
**Error:** Container shows "health: starting" then "unhealthy"

**Debug Steps:**
1. **Test health check manually:**
   ```bash
   docker exec <container> sh -c "curl -f http://localhost:5173 || exit 1"
   ```

2. **Check if service is actually ready:**
   ```bash
   docker logs <container>
   ```

3. **Increase timeout:**
   ```yaml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:5173"]
     interval: 30s
     timeout: 10s
     retries: 5
     start_period: 40s  # Give service time to start
   ```

**Common Fix:** Install curl in Alpine images:
```dockerfile
RUN apk add --no-cache curl
```

---

## Emergency Procedures

### Complete Reset
When everything breaks:
```bash
# Stop all containers
docker compose down -v

# Clean everything
docker system prune -a --volumes

# Remove all images
docker compose build --no-cache

# Start fresh
docker compose up --build
```

### Debug Container Issues
```bash
# Run interactive shell in failing container
docker run --rm -it <image> sh

# Check what files exist
ls -la /app

# Check if node_modules is properly mounted
ls -la /app/node_modules

# Test commands manually
npm run dev
```

### Port Diagnosis
```bash
# Check all listening ports
netstat -tlnp | grep :517

# Check Docker port mapping
docker port <container>

# Test connectivity
telnet localhost 5173
nc -zv localhost 5173
```

---

## Best Practices Summary

1. **Always test with clean builds:** Use `--build --no-cache` periodically
2. **Monitor resource usage:** `docker stats` to check memory/CPU
3. **Use proper .dockerignore:** Exclude unnecessary files
4. **Version lock dependencies:** Use package-lock.json
5. **Test on target platform:** If deploying to Linux, test in Linux containers
6. **Profile configurations separately:** Dev, build, test profiles should work independently
7. **Document service dependencies:** Make inter-service dependencies explicit
8. **Health checks should be realistic:** Test what users actually access
9. **Clean up regularly:** Prevent disk space issues
10. **Use named volumes for performance:** Especially on Windows

---

## Getting Help

If you encounter issues not covered here:

1. **Check logs first:**
   ```bash
   docker compose logs <service>
   docker compose logs --follow
   ```

2. **Verify configuration:**
   ```bash
   docker compose config
   docker compose config --profiles
   ```

3. **Test individual services:**
   ```bash
   docker compose up <service> --build
   ```

4. **Create minimal reproduction:**
   - Start with basic service
   - Add complexity gradually
   - Identify where it breaks

This guide will be updated as new issues are discovered during development.
