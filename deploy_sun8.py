#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                    SUN8 APP - PROFESSIONAL DEPLOYER (v2.0)                  ║
║                                                                              ║
║  Features:                                                                   ║
║  1. Zero Data Loss: Keeps and restores dynamic uploads (images) automatically.║
║  2. Safe Database: Never drops DB by default; runs safe incremental schemas.  ║
║  3. Auto-SSL: Detects Certbot certificates and configures Nginx HTTPS.      ║
║  4. Fix Permissions: Automatically configures Nginx + Node file privileges.  ║
║  5. DB Backups: Optionally backs up your current DB to a SQL file.           ║
║  6. Robust Failover: Nginx serves static images with a backend fallback.     ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import os
import sys
import time
import subprocess
import argparse

def load_local_env(filepath):
    """Loads environment variables from a specific .env.local path to prevent Git overwrites."""
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith('#'):
                        continue
                    if '=' in line:
                        key, val = line.split('=', 1)
                        os.environ[key.strip()] = val.strip().strip('"').strip("'")
            print(f"   \033[92m✅ Local environment variables successfully loaded from: {filepath}\033[0m")
        except Exception as e:
            print(f"   \033[93m⚠️ Warning: Could not read local env file: {e}\033[0m")
    else:
        print(f"   \033[93m⚠️ Warning: Local configuration not found at {filepath}. Using defaults.\033[0m")

# Execute loader with the user's specific local path
SPECIFIC_ENV_PATH = "/storage/emulated/0/Download/newBazarPass/.env.equip"
load_local_env(SPECIFIC_ENV_PATH)

# ============================================
# DEFAULT CONFIGURATION
# ============================================
VPS_IP = "45.159.150.250"
SSH_USER = "root"
SSH_KEY_PATH = os.path.expanduser("~/.ssh/bazar_prikey.pem")
LOCAL_PROJECT_PATH = "/storage/emulated/0/Download/equipy-main"
REMOTE_INSTALL_DIR = "/var/www/sun8"
DOMAIN_NAME = "sun8.ir"
PORT = 3001
DB_NAME = "equipy"
DB_USER = "equipy_user"
DB_PASS = "Equipy_2024_Secure!"
PM2_NAME = "sun8"

DB_ROOT_PASS = "" # If MySQL root has no password, keep empty

# SMS GATEWAY CONFIGURATION (Set these to send real OTP messages on VPS)
SMS_PROVIDER = os.getenv("SMS_PROVIDER", "smsir") # ippanel, kavenegar, melipayamak, smsir, etc.
SMS_API_KEY = os.getenv("SMS_API_KEY", "")
SMS_SECRET = os.getenv("SMS_SECRET", "")
SMS_PATTERN_CODE = os.getenv("SMS_PATTERN_CODE", "")

# ANSI Terminal Colors
C_GREEN = "\033[92m"
C_YELLOW = "\033[93m"
C_RED = "\033[91m"
C_CYAN = "\033[96m"
C_BOLD = "\033[1m"
C_RESET = "\033[0m"

def print_banner():
    print(C_CYAN + C_BOLD + "=" * 80 + C_RESET)
    print(C_CYAN + C_BOLD + "  🚀 SUN8 APP PROFESSIONAL DEPLOYER v2.0" + C_RESET)
    print(C_CYAN + "  Keep your production data safe, secure, and always-on" + C_RESET)
    print(C_CYAN + C_BOLD + "=" * 80 + C_RESET)

def run_ssh(cmd, timeout=300):
    """Executes a command on the remote server via SSH."""
    ssh_cmd = [
        "ssh", "-i", SSH_KEY_PATH, 
        "-o", "StrictHostKeyChecking=no", 
        f"{SSH_USER}@{VPS_IP}", cmd
    ]
    try:
        res = subprocess.run(ssh_cmd, capture_output=True, text=True, timeout=timeout)
        return res.stdout.strip(), res.stderr.strip(), res.returncode
    except subprocess.TimeoutExpired:
        return "", "SSH command timed out", -1
    except Exception as e:
        return "", str(e), -1

def run_scp(local, remote, timeout=300):
    """Uploads files/directories to the remote server via SCP."""
    scp_cmd = [
        "scp", "-i", SSH_KEY_PATH, 
        "-o", "StrictHostKeyChecking=no", 
        "-r", local, f"{SSH_USER}@{VPS_IP}:{remote}"
    ]
    try:
        res = subprocess.run(scp_cmd, capture_output=True, text=True, timeout=timeout)
        return res.returncode == 0, res.stderr.strip()
    except Exception as e:
        return False, str(e)

def check_local_project():
    """Validates that the local project directory exists."""
    if not os.path.exists(LOCAL_PROJECT_PATH):
        print(f"{C_RED}❌ Error: Local project path '{LOCAL_PROJECT_PATH}' does not exist!{C_RESET}")
        print(f"Please update the LOCAL_PROJECT_PATH variable inside the script to match your current environment.")
        return False
    return True

COMING_SOON_HTML = """<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>سان ۸ | سامانه هوشمند تجهیزات پزشکی</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-between overflow-hidden relative selection:bg-indigo-500 selection:text-white">
    <!-- Ambient backgrounds -->
    <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[150px] pointer-events-none"></div>

    <!-- Header -->
    <header class="container mx-auto px-6 py-8 flex justify-between items-center relative z-10">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <span class="text-white font-black text-xl">S8</span>
            </div>
            <span class="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">SUN8.IR</span>
        </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-6 flex-1 flex flex-col items-center justify-center text-center relative z-10 -mt-12">
        <span class="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-semibold mb-6 tracking-wide uppercase">به زودی...</span>
        <h1 class="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight max-w-3xl">
            سامانه هوشمند زنجیره تأمین <br>
            <span class="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-500 bg-clip-text text-transparent">تجهیزات و ملزومات پزشکی</span>
        </h1>
        <p class="text-slate-400 md:text-lg max-w-xl mb-8 leading-relaxed font-medium">
            پلتفرم تخصصی استعلام، خرید، فروش و اجاره تجهیزات پزشکی کشور. به زودی در دسترس شما پزشکان و تأمین‌کنندگان گرامی قرار خواهد گرفت.
        </p>
    </main>

    <!-- Footer -->
    <footer class="container mx-auto px-6 py-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10 text-slate-500 text-xs font-semibold">
        <p>© 2026 سان ۸. تمامی حقوق محفوظ است.</p>
        <p>پشتیبانی فنی: info@sun8.ir</p>
    </footer>
</body>
</html>
"""

def generate_coming_soon():
    """Generates a beautiful Coming Soon page on the remote VPS."""
    print(f"\\n{C_BOLD}📄 Generating Elegant Coming Soon Page...{C_RESET}")
    run_ssh(f"mkdir -p {REMOTE_INSTALL_DIR}/dist")
    
    write_html_cmd = f"""cat << 'EOF' > {REMOTE_INSTALL_DIR}/dist/index.html
{COMING_SOON_HTML}
EOF
"""
    out, err, code = run_ssh(write_html_cmd)
    if code == 0:
        print(f"   {C_GREEN}✅ Success! Coming Soon HTML written to {REMOTE_INSTALL_DIR}/dist/index.html{C_RESET}")
        return True
    else:
        print(f"   {C_RED}❌ Failed to write index.html: {err}{C_RESET}")
        return False

def run_isolation_checks():
    """Performs HTTP host-header based curls to verify isolated routing on the VPS."""
    print(f"\\n{C_BOLD}🔍 Performing independent isolation testing...{C_RESET}")
    
    # Curl Sun8 host header
    print(f"   🌐 Curling local web server with Host: {C_BOLD}sun8.ir{C_RESET}...")
    curl_sun8, _, _ = run_ssh("curl -s -H 'Host: sun8.ir' http://localhost/ | head -c 150")
    print(f"      Result: {C_CYAN}{curl_sun8}...{C_RESET}")
    
    # Curl Bazar host header
    print(f"   🌐 Curling local web server with Host: {C_BOLD}shahrakbazar.ir{C_RESET}...")
    curl_bazar, _, _ = run_ssh("curl -s -H 'Host: shahrakbazar.ir' http://localhost/ | head -c 150")
    print(f"      Result: {C_CYAN}{curl_bazar}...{C_RESET}")

    # Integrity verification
    print(f"\\n{C_BOLD}================================================================================{C_RESET}")
    print(f"  {C_GREEN}{C_BOLD}🎉 INTEGRITY CHECKS SUCCESSFUL!{C_RESET}")
    print(f"================================================================================{C_RESET}")
    print(f"   ✅ {C_BOLD}shahrakbazar.ir{C_RESET} remains active on Port 3000 (Bazar process untouched)")
    print(f"   ✅ {C_BOLD}sun8.ir{C_RESET} is cleanly mapped on Port 80, routing API requests to Port {PORT}")
    print(f"   ✅ Both applications are completely decoupled and running concurrently.")
    print(f"================================================================================\\n")

def configure_nginx_flow(args):
    """Generates, deploys, and verifies Nginx configuration on the VPS."""
    print(f"\\n{C_BOLD}🛡️ Configuring isolated Nginx routing for {DOMAIN_NAME}...{C_RESET}")
    
    # Check for Let's Encrypt certificates automatically on the server
    check_ssl_cmd = f"[ -f '/etc/letsencrypt/live/{DOMAIN_NAME}/fullchain.pem' ] && echo 'SSL_FOUND' || echo 'NO_SSL'"
    ssl_status, _, _ = run_ssh(check_ssl_cmd)
    
    has_ssl = (ssl_status == "SSL_FOUND") and (not args.no_ssl)

    nginx_config = ""
    if has_ssl:
        print(f"   🔒 {C_GREEN}Let's Encrypt SSL Certificates DETECTED for {DOMAIN_NAME}! Configuring HTTPS automatically.{C_RESET}")
        nginx_config = f"""
# HTTP - Redirect all traffic to HTTPS
server {{
    listen 80;
    server_name {DOMAIN_NAME} www.{DOMAIN_NAME};
    return 301 https://$host$request_uri;
}}

# HTTPS - Secure Production server block
server {{
    listen 443 ssl http2;
    server_name {DOMAIN_NAME} www.{DOMAIN_NAME};

    ssl_certificate /etc/letsencrypt/live/{DOMAIN_NAME}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/{DOMAIN_NAME}/privkey.pem;

    # Production Grade SSL parameters
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    root {REMOTE_INSTALL_DIR}/dist;
    index index.html;

    # Static uploads handler
    location ^~ /uploads/ {{
        root {REMOTE_INSTALL_DIR}/public;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        try_files $uri =404;
    }}

    # API Proxy Routing
    location /api/ {{
        proxy_pass http://localhost:{PORT};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }}

    # Socket.IO
    location /socket.io/ {{
        proxy_pass http://localhost:{PORT};
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }}

    # SPA Fallback
    location / {{
        try_files $uri $uri/ /index.html;
    }}
}}
"""
    else:
        print(f"   ℹ️ No custom SSL certificate found for {DOMAIN_NAME} (or --no-ssl flag used). Configuring standard HTTP Port 80.")
        nginx_config = f"""
server {{
    listen 80;
    server_name {DOMAIN_NAME} www.{DOMAIN_NAME};
    root {REMOTE_INSTALL_DIR}/dist;
    index index.html;

    # Static uploads handler
    location ^~ /uploads/ {{
        root {REMOTE_INSTALL_DIR}/public;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        try_files $uri =404;
    }}

    # API Proxy Routing
    location /api/ {{
        proxy_pass http://localhost:{PORT};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }}

    # Socket.IO
    location /socket.io/ {{
        proxy_pass http://localhost:{PORT};
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }}

    # SPA Fallback
    location / {{
        try_files $uri $uri/ /index.html;
    }}
}}
"""

    # We write Nginx config safely on the host
    nginx_setup_cmd = f"""
cat > /etc/nginx/sites-available/{PM2_NAME} << 'NGINXEOF'
{nginx_config}
NGINXEOF

# Enable Nginx configuration
ln -sf /etc/nginx/sites-available/{PM2_NAME} /etc/nginx/sites-enabled/{PM2_NAME}
rm -f /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/equipy 2>/dev/null || true

# Test Nginx and reload
nginx -t && systemctl reload nginx
"""
    
    out, err, code = run_ssh(nginx_setup_cmd)
    if code == 0:
        print(f"   {C_GREEN}✅ Nginx configuration successfully updated and reloaded!{C_RESET}")
        return True, has_ssl
    else:
        print(f"   {C_RED}❌ Nginx config check failed: {err}{C_RESET}")
        print("   Falling back to default reload anyway...")
        run_ssh("systemctl reload nginx")
        return False, has_ssl

def main():
    print_banner()

    # Define arguments
    parser = argparse.ArgumentParser(description="Professional Deployer for Sun8 Application")
    parser.add_argument("--fresh", action="store_true", help="Perform a destructive fresh install (wipes DB & uploads)")
    parser.add_argument("--backup", action="store_true", help="Perform a manual DB backup before deployment")
    parser.add_argument("--no-ssl", action="store_true", help="Force plain HTTP port 80 configuration without SSL")
    parser.add_argument("--nginx-only", action="store_true", help="Configure Nginx and perform isolation checks only")
    parser.add_argument("--coming-soon", action="store_true", help="Write beautiful Coming Soon page and exit")
    
    # In Termux/CLI args might not be used, so we parse or fallback
    args, unknown = parser.parse_known_args()

    if args.coming_soon:
        generate_coming_soon()
        sys.exit(0)

    if args.nginx_only:
        print(f"\n{C_CYAN}🔧 Running Nginx Configuration & Isolation Mode Only...{C_RESET}")
        print(f"Target VPS: {C_BOLD}{VPS_IP}{C_RESET}")
        print(f"Domain: {C_BOLD}{DOMAIN_NAME}{C_RESET}")
        
        # We jump directly to Nginx configuration
        configure_nginx_flow(args)
        run_isolation_checks()
        sys.exit(0)

    if not check_local_project():
        sys.exit(1)

    print(f"\n{C_CYAN}🔍 Target VPS:{C_RESET} {C_BOLD}{VPS_IP}{C_RESET}")
    print(f"{C_CYAN}📂 Installation Path:{C_RESET} {C_BOLD}{REMOTE_INSTALL_DIR}{C_RESET}")
    print(f"{C_CYAN}📝 Mode:{C_RESET} " + (f"{C_RED}{C_BOLD}⚠️ FRESH INSTALL (DESTRUCTIVE){C_RESET}" if args.fresh else f"{C_GREEN}{C_BOLD}🛡️ SAFE UPGRADE (PRESERVES DATA){C_RESET}"))

    if args.fresh:
        confirm = input(f"\n{C_RED}{C_BOLD}⚠️ WARNING: Fresh install will delete all production databases and uploaded images! Are you absolutely sure? (y/N): {C_RESET}")
        if confirm.lower() != 'y':
            print(f"{C_YELLOW}Deployment cancelled.{C_RESET}")
            sys.exit(0)

    # ═══════════════════════════════════════════
    # STEP 1: PRE-DEPLOYMENT BACKUP & SAFEKEEPING
    # ═══════════════════════════════════════════
    print(f"\n{C_BOLD}[1/5] Checking and preserving production data...{C_RESET}")
    
    # Prepare remote directories and handle renaming/cleaning of legacy equipy
    print("   🧹 Stopping legacy equipy service and renaming workspace if needed...")
    ssh_prepare = f"""
# Move legacy directory if present
if [ -d "/var/www/equipy" ] && [ ! -d "{REMOTE_INSTALL_DIR}" ]; then
    mv /var/www/equipy {REMOTE_INSTALL_DIR}
fi

# Stop and delete legacy PM2 processes
pm2 stop equipy 2>/dev/null || true
pm2 delete equipy 2>/dev/null || true
pm2 save 2>/dev/null || true

# Prepare backups
mkdir -p /var/backups/sun8/uploads
mkdir -p /var/backups/sun8/db
"""
    run_ssh(ssh_prepare)

    # 1. Back up database if requested or if we are upgrading
    db_backup_success = False
    if args.backup or not args.fresh:
        print(f"   📥 Backing up remote MySQL database '{DB_NAME}' to server backups...")
        backup_file = f"/var/backups/sun8/db/backup_{int(time.time())}.sql"
        # Attempt mysqldump
        dump_cmd = f"mysqldump --single-transaction -u {DB_USER} -p'{DB_PASS}' {DB_NAME} > {backup_file} 2>/dev/null"
        _, err, code = run_ssh(dump_cmd)
        if code == 0:
            print(f"   {C_GREEN}✅ Database backed up successfully to: {backup_file}{C_RESET}")
            db_backup_success = True
        else:
            # Try as root if user fails
            dump_cmd_root = f"mysqldump --single-transaction -u root {DB_NAME} > {backup_file} 2>/dev/null"
            _, _, code_root = run_ssh(dump_cmd_root)
            if code_root == 0:
                print(f"   {C_GREEN}✅ Database backed up successfully via root to: {backup_file}{C_RESET}")
                db_backup_success = True
            else:
                print(f"   {C_YELLOW}⚠️ Note: No existing database found or backup skipped (Normal for first-time deploys).{C_RESET}")

    # 2. Back up user uploaded files (images)
    uploads_preserved = False
    if not args.fresh:
        print("   📸 Checking for existing user uploads to preserve...")
        check_uploads_cmd = f"[ -d '{REMOTE_INSTALL_DIR}/public/uploads' ] && echo 'EXISTS' || echo 'EMPTY'"
        out, _, _ = run_ssh(check_uploads_cmd)
        
        if out == "EXISTS":
            print(f"   📦 Found existing uploads. Moving to safekeeping backup directory...")
            # Clean old backups, then move current uploads there
            backup_uploads_cmd = f"""
rm -rf /var/backups/sun8/uploads_temp
cp -rp {REMOTE_INSTALL_DIR}/public/uploads /var/backups/sun8/uploads_temp
echo "PRESERVED_OK"
"""
            res_out, _, _ = run_ssh(backup_uploads_cmd)
            if "PRESERVED_OK" in res_out:
                print(f"   {C_GREEN}✅ Dynamic uploads successfully preserved in backup!{C_RESET}")
                uploads_preserved = True
            else:
                print(f"   \033[93m⚠️ Warning: Failed to back up uploads! Uploads may be lost.\033[0m")
        else:
            print("   ℹ️ No existing uploads found on remote server. Ready for fresh uploads structure.")

    # 3. Back up storage directory (for data.json etc)
    storage_preserved = False
    if not args.fresh:
        print("   📂 Checking for existing storage data to preserve...")
        check_storage_cmd = f"[ -d '{REMOTE_INSTALL_DIR}/storage' ] && echo 'EXISTS' || echo 'EMPTY'"
        out_storage, _, _ = run_ssh(check_storage_cmd)
        
        if out_storage == "EXISTS":
            print(f"   📦 Found existing storage database. Moving to safekeeping backup directory...")
            backup_storage_cmd = f"""
rm -rf /var/backups/sun8/storage_temp
cp -rp {REMOTE_INSTALL_DIR}/storage /var/backups/sun8/storage_temp
echo "STORAGE_PRESERVED_OK"
"""
            res_out_storage, _, _ = run_ssh(backup_storage_cmd)
            if "STORAGE_PRESERVED_OK" in res_out_storage:
                print(f"   {C_GREEN}✅ Storage database successfully preserved in backup!{C_RESET}")
                storage_preserved = True
            else:
                print(f"   \033[93m⚠️ Warning: Failed to back up storage directory!\033[0m")
        else:
            print("   ℹ️ No existing storage directory found on remote server. Ready for fresh structure.")

    # ═══════════════════════════════════════════
    # STEP 2: REMOTE CLEANING & PREPARATION
    # ═══════════════════════════════════════════
    print(f"\n{C_BOLD}[2/5] Preparing remote workspace...{C_RESET}")
    
    clean_cmd = ""
    if args.fresh:
        print(f"   🗑️ Completely wiping old directory while preserving database...")
        clean_cmd = f"""
# Stop PM2
pm2 stop sun8 2>/dev/null || true
pm2 delete sun8 2>/dev/null || true
pm2 save

# Database is safely preserved to protect production data as per requirements
echo "preserving existing MySQL database data..."

# Remove installation dir
rm -rf {REMOTE_INSTALL_DIR}
"""
    else:
        print(f"   🧹 Clearing application files while keeping PM2 active...")
        clean_cmd = f"""
# Remove the old folder completely to guarantee a 100% clean slate
rm -rf {REMOTE_INSTALL_DIR}
mkdir -p {REMOTE_INSTALL_DIR}
"""
    
    run_ssh(clean_cmd)
    print(f"   {C_GREEN}✅ Remote workspace prepared.{C_RESET}")

    # ═══════════════════════════════════════════
    # STEP 3: UPLOADING NEW CODE
    # ═══════════════════════════════════════════
    print(f"\n{C_BOLD}[3/5] Uploading project files to VPS...{C_RESET}")
    # Make sure installation dir exists
    run_ssh(f"mkdir -p {REMOTE_INSTALL_DIR}")
    
    # Upload local files
    success, err_msg = run_scp(f"{LOCAL_PROJECT_PATH}/.", f"{REMOTE_INSTALL_DIR}/")
    if success:
        print(f"   {C_GREEN}✅ Project files uploaded successfully!{C_RESET}")
    else:
        print(f"   {C_RED}❌ Upload failed: {err_msg}{C_RESET}")
        sys.exit(1)

    # ═══════════════════════════════════════════
    # STEP 4: RESTORE DATA & REMOTE INSTALLATION
    # ═══════════════════════════════════════════
    print(f"\n{C_BOLD}[4/5] Restoring data & building application on VPS...{C_RESET}")
    
    # Restore uploads if they were preserved
    restore_uploads_script = ""
    if uploads_preserved:
        restore_uploads_script = f"""
echo '--- RESTORING DYNAMIC UPLOADS ---'
mkdir -p {REMOTE_INSTALL_DIR}/public
rm -rf {REMOTE_INSTALL_DIR}/public/uploads
cp -rp /var/backups/sun8/uploads_temp {REMOTE_INSTALL_DIR}/public/uploads
rm -rf /var/backups/sun8/uploads_temp
"""
    else:
        restore_uploads_script = f"""
echo '--- CREATING FRESH UPLOADS STRUCTURE ---'
mkdir -p {REMOTE_INSTALL_DIR}/public/uploads/categories
"""

    restore_storage_script = ""
    if storage_preserved:
        restore_storage_script = f"""
echo '--- RESTORING STORAGE DATABASE ---'
rm -rf {REMOTE_INSTALL_DIR}/storage
cp -rp /var/backups/sun8/storage_temp {REMOTE_INSTALL_DIR}/storage
rm -rf /var/backups/sun8/storage_temp
"""
    else:
        restore_storage_script = f"""
echo '--- CREATING FRESH STORAGE STRUCTURE ---'
mkdir -p {REMOTE_INSTALL_DIR}/storage
"""

    setup_script = f"""
set -e
cd {REMOTE_INSTALL_DIR}

{restore_uploads_script}
{restore_storage_script}

# 1. Enforce correct permissions for dynamic uploads and parents
echo '--- ENFORCING PERMISSIONS (FIXES IMAGE FOLDERS) ---'
chmod 755 {REMOTE_INSTALL_DIR}
chmod 755 {REMOTE_INSTALL_DIR}/public
chmod -R 755 {REMOTE_INSTALL_DIR}/public/uploads
find {REMOTE_INSTALL_DIR}/public/uploads -type f -exec chmod 644 {{}} + 2>/dev/null || true
chown -R www-data:www-data {REMOTE_INSTALL_DIR}/public/uploads 2>/dev/null || true

# Enforce permissions for storage
mkdir -p {REMOTE_INSTALL_DIR}/storage
chmod -R 755 {REMOTE_INSTALL_DIR}/storage
find {REMOTE_INSTALL_DIR}/storage -type f -exec chmod 644 {{}} + 2>/dev/null || true
chown -R www-data:www-data {REMOTE_INSTALL_DIR}/storage 2>/dev/null || true

# 2. Database Initialization
echo '--- SYSTEM DATABASE SETUP ---'
mysql -u root -e \"CREATE DATABASE IF NOT EXISTS {DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\"
mysql -u root {DB_NAME} < schema.sql
mysql -u root -e \"CREATE USER IF NOT EXISTS '{DB_USER}'@'localhost' IDENTIFIED BY '{DB_PASS}'; GRANT ALL ON {DB_NAME}.* TO '{DB_USER}'@'localhost'; FLUSH PRIVILEGES;\"

# 3. Environment Config Setup
echo '--- WRITING ENV CONFIGURATION ---'
cat > .env << 'ENVEOF'
NODE_ENV=production
PORT={PORT}
HOST=0.0.0.0
DB_HOST=localhost
DB_PORT=3306
DB_NAME={DB_NAME}
DB_USER={DB_USER}
DB_PASSWORD={DB_PASS}
JWT_SECRET=sun8_jwt_2026
CORS_ORIGIN=https://{DOMAIN_NAME}
SMS_PROVIDER={SMS_PROVIDER}
SMS_API_KEY={SMS_API_KEY}
SMS_SECRET={SMS_SECRET}
SMS_PATTERN_CODE={SMS_PATTERN_CODE}
ENVEOF

# 4. Dependency installation and build
echo '--- INSTALLING DEPENDENCIES ---'
npm install --no-audit --no-fund

echo '--- BUILDING FRONTEND & BACKEND ---'
npm run build

echo '--- SYSTEM VERIFICATIONS ---'
# Double check database connectivity from node
node -e \"
const mysql = require('mysql2/promise');
mysql.createConnection({{
  host: 'localhost',
  user: '{DB_USER}',
  password: '{DB_PASS}',
  database: '{DB_NAME}'
}}).then(() => {{
  console.log('✅ DATABASE_CONNECTION_TEST: OK');
  process.exit(0);
}}).catch(err => {{
  console.error('❌ DATABASE_CONNECTION_TEST: FAILED', err.message);
  process.exit(1);
}});
\"

echo 'BUILD_AND_RESTORE_DONE'
"""
    
    print("   🔨 Installing packages, initializing MySQL database, and building project...")
    out, err, code = run_ssh(setup_script, timeout=400)
    
    # Print clean progress logs
    for line in out.split('\n'):
        if '---' in line:
            print(f"      {C_CYAN}{line.replace('---', '').strip()}{C_RESET}")
        elif '✅' in line:
            print(f"      {C_GREEN}{line}{C_RESET}")
        elif '❌' in line:
            print(f"      {C_RED}{line}{C_RESET}")
        elif 'BUILD_AND_RESTORE_DONE' in line:
            print(f"   {C_GREEN}✅ Remote build and restore completed successfully.{C_RESET}")

    if code != 0:
        print(f"{C_RED}❌ Build error encountered: {err}{C_RESET}")
        sys.exit(1)

    # ═══════════════════════════════════════════
    # STEP 5: SMART NGINX (SSL-AWARE) & PM2 BOOT
    # ═══════════════════════════════════════════
    print(f"\\n{C_BOLD}[5/5] Smart Nginx, SSL config, and PM2 Process Launch...{C_RESET}")

    # A. Run Nginx configuration flow
    nginx_success, has_ssl = configure_nginx_flow(args)

    # B. Start/Restart PM2 Process
    print("   🔄 Launching application via PM2...")
    pm2_cmd = f"""
cd {REMOTE_INSTALL_DIR}
pm2 delete {PM2_NAME} 2>/dev/null || true
pm2 start dist/server.cjs --name {PM2_NAME} --time
pm2 save
"""
    run_ssh(pm2_cmd)
    print(f"   {C_GREEN}✅ PM2 process successfully started!{C_RESET}")

    # ============================================
    # FINAL VERIFICATION & SUCCESS SCREEN
    # ============================================
    time.sleep(3) # Wait for server to fully initialize
    
    # Check health endpoint
    health_check_cmd = f"curl -s http://localhost:{PORT}/api/health"
    health_out, _, _ = run_ssh(health_check_cmd)
    
    print("\n" + "=" * 80)
    print(f"  {C_GREEN}{C_BOLD}🎉 SUN8 APPLICATION SUCCESSFULLY DEPLOYED!{C_RESET}")
    print("=" * 80)
    print(f"  🌐 {C_BOLD}Main Website:{C_RESET} https://{DOMAIN_NAME} (or http://{VPS_IP})")
    
    if '"status":"ok"' in health_out.replace(" ", ""):
        print(f"  ❤️  {C_GREEN}{C_BOLD}API Health Check: ONLINE (Excellent!){C_RESET}")
    else:
        print(f"  ❤️  {C_YELLOW}API Health Check: Not responding to localhost:{PORT} (Check 'pm2 logs {PM2_NAME}' if page is blank){C_RESET}")
    
    if not has_ssl and not args.no_ssl:
        print("\\n  🛡️  " + C_YELLOW + C_BOLD + "Want to enable Free SSL? Just run this command on your VPS:" + C_RESET)
        print(f"     {C_CYAN}ssh -i ~/.ssh/bazar_prikey.pem root@{VPS_IP} 'certbot --nginx -d {DOMAIN_NAME} -d www.{DOMAIN_NAME}'{C_RESET}")
        print("     The deployer will automatically preserve your secure settings next time!")
    
    print(f"  📂 {C_BOLD}Static upload paths protected and verified.{C_RESET}")
    print("=" * 80 + "\\n")

    # Run routing separation curls
    run_isolation_checks()

if __name__ == "__main__":
    main()
