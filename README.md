![Surf4Fun Logo](public/assets/images/s4f4k.png)
## 🚀 Project Overview

This repository implements a **modular NestJS API** featuring:

* **Discord-based logging & alerts** via a custom `DiscordLoggerService` that posts structured embeds for logs, warnings, errors, and metrics.
* **End-to-end observability** with `ObservabilityInterceptor` capturing request latencies, flagging slow requests, and wiring into both Discord channels and an in-memory `MetricsService`.
* **Real-time KPI dashboard** in Discord using `MetricsDashboardService`, rotating summary embeds every hour and updating them every minute.
* **Prisma ORM** integration with middleware that records database query latencies into metrics.
* **Extensible metrics** including HTTP throughput, error rates, latency percentiles (P95/P99), Apdex scores, CPU/memory usage, cache-hit ratio, DB P95, external-call P95, warn/error log counts, and top-five slowest endpoints.

This setup provides a **FAANG-style observability stack** entirely within Discord, leveraging NestJS’s DI, interceptors, and the Discord.js library.

---

## Project Structure

```
src/
├── main.ts                          # Application entrypoint & global setup
├── instances/
│   └── axios.instance.ts            # Shared Axios instance (external HTTP + timing)
├── configs/
│   └── validator-options.ts         # class-validator settings
├── interceptors/                    # Global NestJS interceptors
│   ├── observability.interceptor.ts
│   ├── cache-versioning.interceptor.ts
│   ├── response-time.interceptor.ts
│   ├── wrap-response.interceptor.ts
│   └── pagination-headers.interceptor.ts
├── modules/
│   ├── app/
│   │   └── app.module.ts            # Root module: wires Helpers, SharedPrisma, API feature modules
│   ├── helpers/                     # Helpers: Core observability & logging
│   │   ├── dto/
│   │   │   └── error-response.dto.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── services/
│   │   │   ├── discord-logger.service.ts
│   │   │   ├── metrics.service.ts
│   │   │   └── metrics-dashboard.service.ts
│   │   └── helpers.module.ts        # Exports DiscordLoggerService & MetricsService
│   ├── shared/                      # Cross-cutting shared modules
│   │   └── prisma/                  # Prisma ORM integration
│   │       ├── bhop.service.ts       # BhopPrismaService w/ DB timing middleware
│   │       ├── surf.service.ts       # SurfPrismaService
│   │       ├── dashboard.service.ts  # DashboardPrismaService
│   │       └── prisma.module.ts      # Global PrismaModule (imports HelpersModule)
│   └── api/                         # Feature-specific endpoints
│       ├── surf/                    # surf/recent-times controller & service
│       ├── steam/                   # SteamService + SteamController
│       ├── ksf/                     # KsfScraperService + controller
│       └── maps/                    # MapsModule using BhopPrismaService
└── .env.example                     # Environment variables template
```

---

## Installation & Setup

1. **Clone & install dependencies**

   ```bash
   git clone <repo-url> && cd surfing4fun-back
   yarn install
   ```

2. **Generate Prisma clients**

   ```bash
   yarn db:generate
   ```

3. **Run in development**

   ```bash
   yarn start:dev
   ```

---

## Key Features

### 1. Discord Logger

* **`DiscordLoggerService`** logs messages to three channels:

  * **Logs**: generic info/debug/verbose
  * **Errors**: structured error embeds with HTTP context, stack traces, system metadata
  * **Metrics**: free-form text and rich embeds for KPI summaries

### 2. Observability Interceptor

* Captures **every** HTTP request latency
* Emits **warning** embeds for slow (>500 ms) requests (`sendWarnEmbed`)
* Sends **error** embeds on unhandled exceptions (`sendErrorEmbedOptions`)
* Records all metrics in-memory (`MetricsService.recordRequest`)

### 3. Metrics Service & Dashboard

* Tracks: total requests, errors, latency buckets, Apdex, CPU %, memory, cache hits/misses, DB & external latencies, warn/error log counts, top-five slowest endpoints
* **`MetricsDashboardService`** posts an initial dashboard embed on startup, **edits** it every minute, and **rotates** to a new message every hour

### 4. Prisma Integration

* Global `PrismaModule` provides multiple Prisma clients (Bhop, Surf, etc.)
* Middleware on each client records **DB query latency** into metrics
* Exposes `getDbP95()` to surface database performance

### 5. HTTP & Scraping Clients

* **Shared Axios instance** (`axios.instance.ts`) with request/response interceptors capturing external-call latency (`recordExtLatency`)
* Consumed by services like `SteamService`, `CountryFlagService`, and `KsfScraperService` for external API calls and web scraping

---

## Usage & Commands

* **Start (dev)**: `yarn start:dev`
* **Start (prod)**: `yarn start:prod`
* **Lint**: `yarn lint`

---

## Observability in Discord

1. **Logs Channel**

   * Green embeds for normal requests
   * Orange embeds for slow-warn requests

2. **Errors Channel**

   * Red embeds with HTTP status, params, query, body, IP, user-agent, host, env, commit SHA, CPU/memory usage, trace/span IDs, stack trace

3. **Metrics Channel**

   * Text line per request when recording metric
   * **Dashboard embed** every minute showing

     * RPM, Error %, P95/P99, Apdex
     * CPU %, Memory MB, Cache Hit %
     * DB P95, Ext P95, Warn Logs, Error Logs
     * Top-five slowest endpoint paths & times

---

## Extending & Customization

* **Thresholds**: adjust `WARN_THRESHOLD_MS` in `ObservabilityInterceptor`
* **Cache TTL**: tune `CACHE_TTL` in `CacheVersioningInterceptor` and `KsfScraperService`
* **New metrics**: push custom metrics via `MetricsService.record...()`
* **Additional Prisma clients**: add new `.service.ts` under `modules/prisma`

---

## Contributors
<a href="https://github.com/surfing4fun/surfing4fun-back/graphs/contributors"><img src="https://contrib.rocks/image?repo=surfing4fun/surfing4fun-back" alt="Contributors" /></a> 