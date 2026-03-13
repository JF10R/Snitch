## CATEGORY 42: Container & Docker Security

> **OWASP references:** A02:2025 Security Misconfiguration (CWE-16), A05:2025 Injection (CWE-78 for shell injection in entrypoints).
>
> **Cross-reference:** Category 11 (Cloud) covers IAM and cloud credentials. This category focuses on container-specific risks: Dockerfiles, Compose configs, image security, and runtime hardening.

### Detection
- Dockerfiles: `Dockerfile`, `Dockerfile.*`, `*.dockerfile`
- Compose files: `docker-compose.yml`, `docker-compose.*.yml`, `compose.yml`, `compose.*.yml`
- Container orchestration: `kubernetes/*.yml`, `k8s/*.yml`, `helm/**/*.yaml`
- Container registries: `.dockerignore`, `skaffold.yaml`, `tilt_config.json`
- Container runtime configs: `.docker/config.json`, `daemon.json`

### What to Search For

**Running as root:**
- Dockerfiles with no `USER` directive (defaults to root)
- `USER root` without switching back to a non-root user before `CMD`/`ENTRYPOINT`
- Containers running with `--privileged` flag
- `securityContext.runAsRoot: true` or missing `runAsNonRoot: true` in k8s manifests

**Unpinned base images:**
- `FROM node:latest` or `FROM python:3` (no specific tag or digest)
- `FROM ubuntu` with no version tag
- Images not pinned to SHA256 digest (`FROM node:20@sha256:abc...`)
- Multi-stage builds where intermediate stages use unpinned images

**Secrets in build args and layers:**
- `ARG` or `ENV` directives containing passwords, tokens, or API keys
- `COPY .env` or `COPY credentials*` into the image
- Secrets passed via `docker build --build-arg SECRET=value`
- Secrets visible in intermediate layers (not using multi-stage or `--secret` mount)

**Missing health checks:**
- No `HEALTHCHECK` directive in Dockerfile
- No `healthcheck` in docker-compose service definitions
- No readiness/liveness probes in k8s pod specs

**Exposed ports and networking:**
- `EXPOSE` on unnecessary ports
- `docker-compose` services with `ports: "0.0.0.0:PORT:PORT"` binding to all interfaces
- `network_mode: host` in compose files
- Missing network isolation between services

**Image size and attack surface:**
- Using full OS images (`ubuntu`, `debian`) instead of minimal alternatives (`alpine`, `distroless`)
- Installing unnecessary packages (compilers, editors, debugging tools) in production images
- Not cleaning up package manager caches (`apt-get clean`, `rm -rf /var/lib/apt/lists/*`)

**Docker socket exposure:**
- Mounting Docker socket: `-v /var/run/docker.sock:/var/run/docker.sock`
- Docker socket mounted in compose: `volumes: ["/var/run/docker.sock:/var/run/docker.sock"]`
- Container with access to Docker API (container escape vector)

**Dockerfile injection:**
- Shell form `CMD` or `ENTRYPOINT` using environment variables without quoting
- `RUN` commands with unvalidated build args interpolated into shell commands
- `curl | sh` or `wget | bash` in RUN commands (supply chain risk)

### Critical
- Container running as root with Docker socket mounted (full host escape)
- Secrets (API keys, passwords) hardcoded in `ENV` or `ARG` directives visible in image layers
- `--privileged` flag or `SYS_ADMIN` capability on production containers
- `curl | sh` or `wget | bash` in Dockerfile `RUN` commands from unverified URLs

### High
- No `USER` directive in Dockerfile (runs as root by default)
- `.env` or credential files copied into image without multi-stage separation
- Unpinned base images (`FROM node:latest`) — vulnerable to supply chain attacks
- Docker socket mounted in any container
- `network_mode: host` in production compose files
- No health check in Dockerfile or compose for production services
- Build args containing secrets (`--build-arg DB_PASSWORD=...`)

### Medium
- Using full OS base images instead of Alpine/distroless for production
- Packages installed without cleanup (bloated attack surface)
- Ports bound to `0.0.0.0` instead of `127.0.0.1` for internal services
- Missing `.dockerignore` (risk of copying `.git`, `.env`, `node_modules` into image)
- No resource limits (`mem_limit`, `cpus`) in compose or k8s specs
- `ADD` used instead of `COPY` (ADD auto-extracts archives, has URL fetch capability)

### Context Check
1. Does the Dockerfile include a `USER` directive to run as non-root?
2. Are base images pinned to specific versions or SHA256 digests?
3. Are secrets passed via Docker build secrets (`--secret`) or mounted at runtime, not baked into layers?
4. Is there a `.dockerignore` excluding `.env`, `.git`, `node_modules`, and credential files?
5. Are health checks defined for production services?
6. Is the Docker socket exposed to any container?
7. Are production images using minimal base images (Alpine, distroless)?

### NOT Vulnerable
- Non-root `USER` directive before `CMD`/`ENTRYPOINT`
- Base images pinned to SHA256 digest (`FROM node:20-alpine@sha256:abc...`)
- Secrets mounted at runtime via Docker secrets or environment, not in build layers
- Multi-stage builds where final stage contains only runtime artifacts
- `.dockerignore` excluding sensitive files (`.env`, `.git`, credentials)
- Health checks defined in both Dockerfile and compose/k8s
- Resource limits set on all production containers
- No Docker socket exposure

### Files to Check
- `Dockerfile`, `Dockerfile.*`, `*.dockerfile`
- `docker-compose.yml`, `docker-compose.*.yml`, `compose.yml`, `compose.*.yml`
- `.dockerignore`
- `kubernetes/**/*.yml`, `k8s/**/*.yml`, `helm/**/*.yaml`
- `skaffold.yaml`, `tilt_config.json`
- `.github/workflows/*.yml` (for Docker build steps)
