# Timothy Ododo — Professional Portfolio & Web Service

[![Go Version](https://img.shields.io/badge/Go-1.22+-00ADD8?style=flat&logo=go)](https://golang.org)
[![Render](https://img.shields.io/badge/Render-Deploy%20Ready-46E3B7?style=flat&logo=render)](https://render.com)
[![Docker](https://img.shields.io/badge/Docker-Multi--stage-2496ED?style=flat&logo=docker)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

The official, production-ready portfolio website and backend API for **Timothy Ododo**:

> **Technology Mentor & Advocate**  
> *IT Support Professional | Backend Engineer | Cloud & DevOps Practitioner | AI-enabled Technology Professional*

---

## 🌟 Professional Positioning & Proof Points

This application is designed to communicate technical competence, human connection, leadership, and systems reliability:

* **Trained 200+ Students** in programming, hardware programming (Raspberry Pi Pico / MicroPython), and creative computing.
* **Supported 1,000+ Participants & Contestants** for *Anambra Innovation Week 2024* through the Solution Innovation District (SID — ICT arm of the Anambra State Government).
* **Mastered Raspberry Pi Pico Hardware Programming in 3 Days** prior to deployment as lead instructor at Buildathon Holiday Camp.
* **Learn2Earn NG Fellow & Ambassador (2026)** specializing in software engineering, Go backend systems, and AI-native developer workflows.
* **B.Sc. Computer Science at IU International University of Applied Sciences, Germany** — *Full Scholarship Recipient*.
* **Google IT Support Professional Certificate** holder with verified systems administration, TCP/IP networking, and security diagnostic proficiency.

---

## 🏗️ Architecture & Technology Stack

* **Backend Engine:** Go (Golang) standard library (`net/http`, `html/template`, `encoding/json`, `log/slog`).
* **Frontend:** Semantic HTML5, Modular CSS3 Design System with Light/Dark/System themes, and Vanilla ES6+ JavaScript.
* **Content Layer:** Decoupled JSON data store in `/content` allowing instant updates without modifying application code.
* **Security & Observability:** HTTP security headers (`CSP`, `X-Frame-Options`, `X-Content-Type-Options`), structured slog logging, anti-spam honeypot filtering, and health monitoring.
* **DevOps & Cloud:** Ready for automated continuous deployment on **Render** (`render.yaml`) and Docker multi-stage builds.

---

## 📁 Project Structure

```text
timothy-portfolio/
│
├── cmd/
│   └── web/
│       └── main.go           # Go application entry point & router setup
│
├── internal/
│   ├── config/
│   │   └── config.go         # Environment configuration loader
│   ├── models/
│   │   └── models.go         # Domain models & PageData structs
│   ├── services/
│   │   └── content.go        # Thread-safe JSON content loader & cache
│   └── handlers/
│       ├── handlers.go       # HTTP request handlers & template renderers
│       └── handlers_test.go  # Unit & integration tests
│
├── templates/
│   ├── layout.html           # Master HTML5 layout, SEO meta & header/footer
│   ├── index.html            # Home page view
│   ├── about.html            # About & philosophy view
│   ├── experience.html       # Experience timeline view
│   ├── projects.html         # Portfolio & category filter view
│   ├── project.html          # Individual case study deep-dive view
│   ├── skills.html           # Technical skills matrix view
│   ├── resume.html           # Interactive & printable CV view
│   ├── contact.html          # Contact form with server validation
│   ├── 404.html              # Custom 404 page
│   └── 500.html              # Custom 500 error page
│
├── static/
│   ├── css/
│   │   └── style.css         # Clean CSS3 design system with dark/light variables
│   └── js/
│       └── main.js           # Theme switcher, project filtering & contact validation
│
├── content/
│   ├── profile.json          # Bio, contact, tagline, and capabilities
│   ├── experience.json       # Career and fellowship history
│   ├── projects.json         # Case studies, challenges, solutions & tech stacks
│   ├── skills.json           # Categorized skill proficiencies
│   ├── certifications.json   # Google IT Support, 3MTT, Learn2Earn
│   ├── education.json        # IU University & scholarship distinction
│   └── community.json        # GoVote, Global Peace Foundation, SDGs Network
│
├── go.mod                    # Go module definition
├── render.yaml               # Render Blueprint deployment configuration
├── Dockerfile                # Multi-stage production container build
├── .env.example              # Environment variables reference
└── README.md                 # Complete documentation
```

---

## 🚀 Local Development (Go)

### Prerequisites
* Go 1.22 or newer installed

### 1. Clone the repository
```bash
git clone https://github.com/timothyododo/portfolio-service.git
cd portfolio-service
```

### 2. Run the application locally
```bash
go run ./cmd/web
```
The server will boot on `http://localhost:8080` (or the port defined in `$PORT`).

### 3. Run the automated tests
```bash
go test -v ./...
```

### 4. Build the production binary
```bash
go build -o bin/web ./cmd/web
./bin/web
```

---

## ☁️ Deployment on Render

### Option A: Automatic Blueprint Deployment (Recommended)
1. Push your repository to GitHub.
2. In the **Render Dashboard**, select **New +** → **Blueprint**.
3. Connect your GitHub repository.
4. Render will detect `render.yaml` and configure:
   * **Runtime:** Go
   * **Build Command:** `go build -v -o bin/web ./cmd/web`
   * **Start Command:** `./bin/web`
   * **Health Check Path:** `/health`
5. Click **Apply**. Your application will build and deploy on Render's global CDN!

### Option B: Manual Web Service Setup
1. Create a new **Web Service** on Render.
2. Connect your GitHub repository.
3. Configure settings:
   * **Environment:** `Go`
   * **Build Command:** `go build -o bin/web ./cmd/web`
   * **Start Command:** `./bin/web`
   * **Auto-Deploy:** `Yes`
4. Set Environment Variables in the Render settings:
   * `PORT`: `8080`
   * `APP_ENV`: `production`
   * `CONTACT_EMAIL`: `timothyododo@gmail.com`
5. Deploy and verify the health check at `https://your-subdomain.onrender.com/health`.

---

## 🐳 Docker Deployment

To build and run the containerized application locally or on any cloud container service (Google Cloud Run, AWS ECS, Azure Container Apps):

```bash
# Build the minimal multi-stage image (<25MB)
docker build -t timothy-portfolio .

# Run the container
docker run -d -p 8080:8080 --name timothy-portfolio timothy-portfolio

# Check container health
curl http://localhost:8080/health
```

---

## 📝 Content Management

To update projects, experience, skills, certifications, or biography without touching Go handler code:
1. Navigate to `/content/`.
2. Edit the corresponding JSON file (`projects.json`, `experience.json`, etc.).
3. Commit and push your changes. The Go application loads all content safely on startup with thread-safe caching.

---

## 🛡️ Endpoints Overview

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Home page (Hero, Impact Metrics, What I Bring, Featured Work) |
| `GET` | `/about` | Biography, background story & philosophy |
| `GET` | `/experience` | Full experience timeline |
| `GET` | `/projects` | Project portfolio with instant category & search filters |
| `GET` | `/projects/{slug}` | Deep-dive case study with Problem, Solution & Challenges |
| `GET` | `/skills` | Matrix of technical proficiencies & credentials |
| `GET` | `/resume` | Printable CV & PDF download trigger |
| `GET` | `/contact` | Contact details & verified contact form |
| `POST` | `/api/contact` | JSON contact form endpoint with validation & spam honeypot |
| `GET` | `/api/projects` | JSON projects feed for client-side queries |
| `GET` | `/health` | Production health check endpoint (`{"status":"ok"}`) |
| `GET` | `/sitemap.xml` | Dynamic SEO sitemap |
| `GET` | `/robots.txt` | Crawler instructions |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
