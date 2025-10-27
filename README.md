# LegalAI

## Features

- **TypeScript** - For type safety and improved developer experience
- **Next.js** - Full-stack React framework
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Node.js** - Runtime environment
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
pnpm i
```

Then, initialize prisma & configurate database:

```bash
npx prisma validate
npx prisma generate
npx prisma db push
npx prisma db pull
```

Run the development server:

```bash
pnpm next dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the web application.

## Available Scripts

- `pnpm dev`: Start all applications in development mode
- `pnpm build`: Build all applications
- `pnpm dev:web`: Start only the web application
- `pnpm dev:server`: Start only the server
- `pnpm check-types`: Check TypeScript types across all apps
- `pnpm dlx taze -r`: Update all dependencies
- `pnpm next dev`: Next dev работает на Webpack, а next dev --turbo включает Turbopack.

## API tests
- http://localhost:3000/api/test-auth - Authorized user
- http://localhost:3000/api/migrate-documents - All the documents in current DB

## Deployment guide

I choosed Azure VM [Ubuntu 24.04.3 LTS (GNU/Linux 6.14.0-1012-azure x86_64)] as an infrastructure for deploying the app, especially it's backend part.

1. SSH command connection:
- Execute in your choice of local shell

```bash
ssh -i <private-key-file-path> azureuser@20.240.218.13
ssh -i C:\Users\Sulpak\Downloads\azekowka.pem azureuser@20.240.218.13
```

2. Clone git repo:
- Do not forget to generate Personal Access Token (PAT) from Github, and select :repo scope
```bash
git clone https://github.com/azekowka/LegalAI.git
cd LegalAI/apps/backend
```

3. Install uv, a fast Python package installer:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env
```

4. Create a virtual environment and install the packages listed in requirements.txt:

```bash
uv venv
source .venv/bin/activate
sudo apt update
sudo apt install build-essential cmake
uv pip install -r requirements.txt
```

5. Run the application: 

```bash
python app.py
uvicorn main:app --host 0.0.0.0 --port 8000
```

6. Open portal.azure.com -> Networking settings -> Add Inbound port rule -> Destination: 8000

7. HTTPS, SSL, Nginx configuration starting

```bash
sudo apt update
sudo apt install nginx
```
* Note: If ```sudo ufw status ``` -> Status: active , please also run ``` sudo ufw allow 'Nginx Full' ``` to allow HTTP & HTTPS traffic

8. Nginx config file

```bash
sudo nano /etc/nginx/sites-available/20.240.218.
sudo nano /etc/nginx/sites-available/legalai.azekowka.me
```

```bash
    server {
        listen 80;
        listen [::]:80;

        server_name legalai.azekowka.me www.legalai.azekowka.me;

        location / {
            proxy_pass http://127.0.0.1:8000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
```

```bash
sudo ln -s /etc/nginx/sites-available/legalai.azekowka.me /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

9. Get SSL certificate using Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d legalai.azekowka.me
```

- Furthermore, do not forget to create :80 and :443 Inbound port rules with TCP protocol and Allow Action, to resolve firewall errors with Certbot.

10. Permanent access to backend 

```bash
sudo nano /etc/systemd/system/legalai.service
```

```bash
[Unit]
Description=LegalAI FastAPI Backend Service
After=network.target

[Service]
User=azureuser
Group=azureuser
WorkingDirectory=/home/azureuser/LegalAI/apps/backend
ExecStart=/home/azureuser/LegalAI/apps/backend/.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl start legalai
sudo systemctl status legalai # status check
sudo journalctl -u legalai -f # real-time logs
```