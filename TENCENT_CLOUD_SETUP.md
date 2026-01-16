# Deployment Guide for Tencent Cloud VPS

This guide walks you through deploying the `siakang-kw` project on a Tencent Cloud VPS.

---

## Option 1: Docker Deployment (Recommended)

The easiest way to deploy. Requires only Docker on the server.

### Step 1: Install Docker on VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Add your user to docker group (logout/login required)
sudo usermod -aG docker $USER
```

### Step 2: Upload Project & Deploy

```bash
# Clone or upload project
git clone https://github.com/rifhrzi/siakang-kw.git
cd siakang-kw

# Build and run
docker compose up -d --build
```

### Step 3: Access Application

Open `http://<YOUR_SERVER_IP>` in your browser.

### Useful Commands

```bash
# View logs
docker compose logs -f

# Stop
docker compose down

# Rebuild after code changes
docker compose up -d --build
```

---

## Option 2: Manual Deployment (Without Docker)

## Prerequisites

1.  **Tencent Cloud VPS**: A standard LightHouse or CVM instance with Ubuntu installed.
2.  **SSH Access**: You should be able to SSH into your server (`ssh ubuntu@<your-server-ip>`).

## Step 1: Prepare the Server

Connect to your server via SSH and update the system packages:

```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js (v18 or later)

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verify installation:
```bash
node -v
npm -v
```

### Install Process Manager (PM2) and Nginx

```bash
sudo npm install -g pm2
sudo apt install -y nginx
```

## Step 2: Upload Project Code

You can clone your repository directly if it's on GitHub, or upload the files from your local machine.

**Option A: Git Clone (Recommended)**
```bash
# Install git if needed
sudo apt install -y git

# Clone repo
git clone https://github.com/rifhrzi/siakang-kw.git
cd siakang-kw
```

**Option B: Manual Upload**
If you don't use Git on the server, upload your project folder using SCP or an FTP client (like FileZilla) to `/home/ubuntu/siakang-kw`.

## Step 3: Install Dependencies

Navigate to the project directory and install dependencies:

```bash
cd ~/siakang-kw
npm install
```

## Step 4: Build Frontend

Build the React frontend for production:

```bash
npm run build
```

This creates a `dist` folder containing the static files.

## Step 5: Start Backend Server

Start the Express server using PM2 so it stays alive in the background:

```bash
pm2 start server/index.js --name "siakang-api"
pm2 save
pm2 startup
```
*(Follow the instructions output by `pm2 startup` to potentialy copy-paste a command)*.

## Step 6: Configure Nginx

Nginx will serve the frontend files and reverse-proxy API requests to your backend.

1.  Create a new site configuration:
    ```bash
    sudo nano /etc/nginx/sites-available/siakang
    ```

2.  Paste the following configuration (Replace `_` with your domain name if you have one, e.g., `server_name example.com;`):

    ```nginx
    server {
        listen 80;
        server_name _;

        # Serve Frontend
        root /home/ubuntu/siakang-kw/dist;
        index index.html;

        # Frontend Routing (SPA catch-all)
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Backend API Proxy
        location /api {
            proxy_pass http://localhost:4000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
    *Note: Ensure the `root` path matches where your project is located (`/home/ubuntu/siakang-kw/dist` or `/var/www/...`).*

3.  Enable the site and remove the default:
    ```bash
    sudo ln -s /etc/nginx/sites-available/siakang /etc/nginx/sites-enabled/
    sudo rm /etc/nginx/sites-enabled/default
    ```

4.  Test and restart Nginx:
    ```bash
    sudo nginx -t
    sudo systemctl restart nginx
    ```

## Step 7: Configure Firewall (Tencent Cloud Console)

1.  Go to your Tencent Cloud Console > LightHouse/CVM.
2.  Select your instance > **Firewall** tab.
3.  Ensure **Port 80 (HTTP)** is ALLOWED.
4.  (Optional) If you want HTTPS later, allow Port 443.

## Step 8: Access Your App

Open your browser and visit: `http://<YOUR_SERVER_IP>`

You should see the application running. The frontend requests to `/api` will be correctly routed to your backend.

---

## Troubleshooting

-   **Backend not working?** Check logs: `pm2 logs siakang-api`
-   **Frontend 404?** Check Nginx permissions. Ensure the user running Nginx (usually `www-data`) can read the `dist` folder.
    -   Quick fix: `chmod -R 755 /home/ubuntu/siakang-kw`
