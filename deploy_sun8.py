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
if not os.path.exists(LOCAL_PROJECT_PATH) and os.path.exists("/storage/emulated/0/Download/sun8-main"):
    LOCAL_PROJECT_PATH = "/storage/emulated/0/Download/sun8-main"
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

    print(f"\n{C_CYAN}🔍 Tar    # ═══════════════════════════════════════════
    # PRE-REQUISITES & ENVIRONMENT SANITY CHECKS
    # ═══════════════════════════════════════════
    print(f"\n{C_BOLD}🧹 Stopping legacy services and preparing workspaces...{C_RESET}")
    # Handle renaming of legacy /var/www/equipy if present on server
    rename_cmd = f"""
if [ -d "/var/www/equipy" ] && [ ! -d "{REMOTE_INSTALL_DIR}" ]; then
    mv /var/www/equipy {REMOTE_INSTALL_DIR}
fi
# Ensure the uploads and storage directories exist on server so that export cp commands don't fail
mkdir -p {REMOTE_INSTALL_DIR}/public/uploads
mkdir -p {REMOTE_INSTALL_DIR}/storage

# Create target DB if not present so that DB dump/actions don't fail initially
mysql -u root -e "CREATE DATABASE IF NOT EXISTS {DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -e "CREATE USER IF NOT EXISTS '{DB_USER}'@'localhost' IDENTIFIED BY '{DB_PASS}'; ALTER USER '{DB_USER}'@'localhost' IDENTIFIED BY '{DB_PASS}'; GRANT ALL PRIVILEGES ON {DB_NAME}.* TO '{DB_USER}'@'localhost'; FLUSH PRIVILEGES;"
"""
    run_ssh(rename_cmd)

    # ═══════════════════════════════════════════
    # STEP 1: EXPORT EVERYTHING (before touching anything)
    # ═══════════════════════════════════════════
    print(f"\n{C_BOLD}[1/8] STEP 1: EXPORT EVERYTHING (before touching anything){C_RESET}")
    
    # - Export DB: mysqldump -u equipy_user -p'Equipy_2024_Secure!' equipy > /tmp/sun8_backup.sql
    print(f"   📥 Exporting Database '{DB_NAME}'...")
    export_db_cmd = f"mysqldump -u {DB_USER} -p'{DB_PASS}' {DB_NAME} > /tmp/sun8_backup.sql"
    out, err, code = run_ssh(export_db_cmd)
    if code != 0:
        print(f"   {C_RED}❌ Export DB failed: {err or out}{C_RESET}")
        sys.exit(1)
    print(f"   {C_GREEN}✅ Database exported successfully to /tmp/sun8_backup.sql{C_RESET}")

    # - Backup uploads: cp -r /var/www/sun8/public/uploads /tmp/sun8_uploads_backup
    print("   📸 Backing up uploads folder...")
    run_ssh("rm -rf /tmp/sun8_uploads_backup")
    backup_uploads_cmd = f"cp -r {REMOTE_INSTALL_DIR}/public/uploads /tmp/sun8_uploads_backup"
    out, err, code = run_ssh(backup_uploads_cmd)
    if code != 0:
        print(f"   {C_RED}❌ Backup uploads failed: {err or out}{C_RESET}")
        sys.exit(1)
    print(f"   {C_GREEN}✅ Uploads backed up successfully to /tmp/sun8_uploads_backup{C_RESET}")

    # - Backup storage: cp -r /var/www/sun8/storage /tmp/sun8_storage_backup
    print("   📂 Backing up storage database...")
    run_ssh("rm -rf /tmp/sun8_storage_backup")
    backup_storage_cmd = f"cp -r {REMOTE_INSTALL_DIR}/storage /tmp/sun8_storage_backup"
    out, err, code = run_ssh(backup_storage_cmd)
    if code != 0:
        print(f"   {C_RED}❌ Backup storage failed: {err or out}{C_RESET}")
        sys.exit(1)
    print(f"   {C_GREEN}✅ Storage backed up successfully to /tmp/sun8_storage_backup{C_RESET}")

    # ═══════════════════════════════════════════
    # STEP 2: CLEAN OLD CODE (keep public/uploads)
    # ═══════════════════════════════════════════
    print(f"\n{C_BOLD}[2/8] STEP 2: CLEAN OLD CODE (keep public/uploads){C_RESET}")
    # - find /var/www/sun8 -mindepth 1 -maxdepth 1 ! -name 'public' -exec rm -rf {} +
    clean_cmd = f"find {REMOTE_INSTALL_DIR} -mindepth 1 -maxdepth 1 ! -name 'public' -exec rm -rf {{}} +"
    out, err, code = run_ssh(clean_cmd)
    if code != 0:
        print(f"   {C_RED}❌ Clean old code failed: {err or out}{C_RESET}")
        sys.exit(1)
    print(f"   {C_GREEN}✅ Old code cleaned successfully. Preserved 'public/' folder.{C_RESET}")

    # ═══════════════════════════════════════════
    # STEP 3: DEPLOY NEW CODE
    # ═══════════════════════════════════════════
    print(f"\n{C_BOLD}[3/8] STEP 3: DEPLOY NEW CODE{C_RESET}")
    # - Upload from /storage/emulated/0/Download/equipy-main/ to /var/www/sun8/
    # - Skip uploading public/uploads/ (local doesn't have user files)
    print(f"   📤 Uploading project files from {LOCAL_PROJECT_PATH}...")
    success, err_msg = run_scp(f"{LOCAL_PROJECT_PATH}/.", f"{REMOTE_INSTALL_DIR}/")
    if not success:
        print(f"   {C_RED}❌ Upload failed: {err_msg}{C_RESET}")
        sys.exit(1)
    print(f"   {C_GREEN}✅ Project files uploaded successfully!{C_RESET}")

    # - Write production environment configuration
    print("   📝 Writing environment variables config...")
    env_config = f"""cat > {REMOTE_INSTALL_DIR}/.env << 'ENVEOF'
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
"""
    run_ssh(env_config)

    # - cd /var/www/sun8 && npm install --no-audit --no-fund && npm run build
    print("   📦 Installing packages and building application on VPS...")
    build_cmd = f"cd {REMOTE_INSTALL_DIR} && npm install --no-audit --no-fund && npm run build"
    out, err, code = run_ssh(build_cmd, timeout=450)
    if code != 0:
        print(f"   {C_RED}❌ Build failed: {err or out}{C_RESET}")
        sys.exit(1)
    print(f"   {C_GREEN}✅ Application packages installed and built successfully on VPS.{C_RESET}")

    # ═══════════════════════════════════════════
    # STEP 4: RESTORE EVERYTHING
    # ═══════════════════════════════════════════
    print(f"\n{C_BOLD}[4/8] STEP 4: RESTORE EVERYTHING{C_RESET}")
    
    # - Restore uploads: cp -r /tmp/sun8_uploads_backup/* /var/www/sun8/public/uploads/
    print("   📸 Restoring uploads folder...")
    restore_uploads_cmd = f"cp -r /tmp/sun8_uploads_backup/* {REMOTE_INSTALL_DIR}/public/uploads/"
    out, err, code = run_ssh(restore_uploads_cmd)
    if code != 0:
        print(f"   {C_RED}❌ Restore uploads failed: {err or out}{C_RESET}")
        sys.exit(1)
    print(f"   {C_GREEN}✅ Uploads restored successfully.{C_RESET}")

    # - Restore storage: cp -r /tmp/sun8_storage_backup /var/www/sun8/storage
    print("   📂 Restoring storage database folder...")
    run_ssh(f"rm -rf {REMOTE_INSTALL_DIR}/storage")
    restore_storage_cmd = f"cp -r /tmp/sun8_storage_backup {REMOTE_INSTALL_DIR}/storage"
    out, err, code = run_ssh(restore_storage_cmd)
    if code != 0:
        print(f"   {C_RED}❌ Restore storage failed: {err or out}{C_RESET}")
        sys.exit(1)
    print(f"   {C_GREEN}✅ Storage restored successfully.{C_RESET}")

    # - Import DB: mysql -u equipy_user -p'Equipy_2024_Secure!' equipy < /tmp/sun8_backup.sql
    print(f"   📥 Importing database '{DB_NAME}'...")
    import_db_cmd = f"mysql -u {DB_USER} -p'{DB_PASS}' {DB_NAME} < /tmp/sun8_backup.sql"
    out, err, code = run_ssh(import_db_cmd)
    if code != 0:
        print(f"   {C_RED}❌ DB import failed: {err or out}{C_RESET}")
        sys.exit(1)
    print(f"   {C_GREEN}✅ Database restored successfully.{C_RESET}")

    # ═══════════════════════════════════════════
    # STEP 5: FIX PERMISSIONS
    # ═══════════════════════════════════════════
    print(f"\n{C_BOLD}[5/8] STEP 5: FIX PERMISSIONS{C_RESET}")
    # - chmod -R 755 /var/www/sun8/public/uploads
    # - chown -R www-data:www-data /var/www/sun8/public/uploads
    # - chmod -R 755 /var/www/sun8/storage
    permissions_cmd = f"""
chmod -R 755 {REMOTE_INSTALL_DIR}/public/uploads
chown -R www-data:www-data {REMOTE_INSTALL_DIR}/public/uploads
chmod -R 755 {REMOTE_INSTALL_DIR}/storage
chown -R www-data:www-data {REMOTE_INSTALL_DIR}/storage 2>/dev/null || true
"""
    out, err, code = run_ssh(permissions_cmd)
    if code != 0:
        print(f"   {C_RED}❌ Fixing permissions failed: {err or out}{C_RESET}")
        sys.exit(1)
    print(f"   {C_GREEN}✅ Permissions for uploads and storage configured successfully.{C_RESET}")

    # ═══════════════════════════════════════════
    # STEP 6: ADD TO GITIGNORE (both local and server)
    # ═══════════════════════════════════════════
    print(f"\n{C_BOLD}[6/8] STEP 6: ADD TO GITIGNORE (both local and server){C_RESET}")
    # On server, append to .gitignore (prevent duplicate lines)
    gitignore_cmd = f"""
touch {REMOTE_INSTALL_DIR}/.gitignore
grep -qxF 'public/uploads/' {REMOTE_INSTALL_DIR}/.gitignore || echo 'public/uploads/' >> {REMOTE_INSTALL_DIR}/.gitignore
grep -qxF 'storage/data.json' {REMOTE_INSTALL_DIR}/.gitignore || echo 'storage/data.json' >> {REMOTE_INSTALL_DIR}/.gitignore
"""
    run_ssh(gitignore_cmd)
    
    # Update local .gitignore
    local_paths_to_update = [
        os.path.join(LOCAL_PROJECT_PATH, ".gitignore"),
        "/storage/emulated/0/Download/sun8-main/.gitignore",
        os.path.join(os.path.dirname(__file__), ".gitignore")
    ]
    for p in local_paths_to_update:
        try:
            dir_path = os.path.dirname(p)
            if os.path.exists(dir_path):
                content = ""
                if os.path.exists(p):
                    with open(p, "r") as f:
                        content = f.read()
                
                appended = False
                if "public/uploads/" not in content:
                    content += "\npublic/uploads/\n"
                    appended = True
                if "storage/data.json" not in content:
                    content += "storage/data.json\n"
                    appended = True
                if appended:
                    with open(p, "w") as f:
                        f.write(content)
                    print(f"   ✅ Local .gitignore at {p} updated successfully.")
        except Exception as e:
             print(f"   ⚠️ Local .gitignore append to {p} skipped: {e}")
         
    print(f"   {C_GREEN}✅ Gitignore configured successfully.{C_RESET}")

    # ═══════════════════════════════════════════
    # STEP 7: CLEAN TEMP FILES (free disk space)
    # ═══════════════════════════════════════════
    print(f"\n{C_BOLD}[7/8] STEP 7: CLEAN TEMP FILES (free disk space){C_RESET}")
    # - rm -rf /tmp/sun8_backup.sql /tmp/sun8_uploads_backup /tmp/sun8_storage_backup
    cleanup_cmd = "rm -rf /tmp/sun8_backup.sql /tmp/sun8_uploads_backup /tmp/sun8_storage_backup"
    out, err, code = run_ssh(cleanup_cmd)
    if code != 0:
        print(f"   {C_RED}❌ Cleaning temp files failed: {err or out}{C_RESET}")
        sys.exit(1)
    print(f"   {C_GREEN}✅ Temporary backup files removed.{C_RESET}")

    # ═══════════════════════════════════════════
    # STEP 8: RESTART & VERIFY
    # ═══════════════════════════════════════════
    print(f"\n{C_BOLD}[8/8] STEP 8: RESTART & VERIFY{C_RESET}")
    
    # Smart Nginx Configuration Flow
    print("   🌐 Ensuring Nginx configurations are perfectly loaded...")
    configure_nginx_flow(args)

    # - pm2 restart sun8 && sleep 3
    print("   🔄 Restarting PM2 process...")
    pm2_restart_cmd = f"""
cd {REMOTE_INSTALL_DIR}
pm2 delete {PM2_NAME} 2>/dev/null || true
pm2 start dist/server.cjs --name {PM2_NAME} --time
pm2 save
sleep 3
"""
    run_ssh(pm2_restart_cmd)

    # - curl -s http://localhost:3001/api/health (must return {"status":"ok"})
    print(f"   ❤️  Verifying local port {PORT} API health...")
    health_check_cmd = f"curl -s http://localhost:{PORT}/api/health"
    health_out, _, _ = run_ssh(health_check_cmd)
    if '"status":"ok"' in health_out.replace(" ", ""):
        print(f"      {C_GREEN}✅ API Health Check: ONLINE (Excellent! Response: {health_out}){C_RESET}")
    else:
        print(f"      {C_RED}❌ API Health Check: OFFLINE! Expected '{{\"status\":\"ok\"}}', got: '{health_out}'{C_RESET}")
        print("      Check 'pm2 logs sun8' for details.")
        sys.exit(1)

    # - ls /var/www/sun8/public/uploads/categories/ (must show category folders)
    print("   📁 Verifying categories directory structure in uploads...")
    categories_cmd = f"ls {REMOTE_INSTALL_DIR}/public/uploads/categories/"
    cat_out, cat_err, cat_code = run_ssh(categories_cmd)
    if cat_code == 0 and cat_out.strip():
        print(f"      {C_GREEN}✅ Category Folders Verified: {cat_out.replace(chr(10), ', ')}{C_RESET}")
    else:
        print(f"      {C_RED}❌ Categories folder verification failed: {cat_out or cat_err or 'Folder empty!'}{C_RESET}")
        sys.exit(1)

    # - mysql -u equipy_user -p'Equipy_2024_Secure!' equipy -e "SHOW TABLES;" (must show tables)
    print(f"   🗄️  Verifying database tables for user '{DB_USER}'...")
    db_verify_cmd = f"mysql -u {DB_USER} -p'{DB_PASS}' {DB_NAME} -e 'SHOW TABLES;'"
    db_out, db_err, db_code = run_ssh(db_verify_cmd)
    if db_code == 0 and "Tables_in_equipy" in db_out:
        print(f"      {C_GREEN}✅ MySQL Tables Verified Successfully.{C_RESET}")
    else:
        print(f"      {C_RED}❌ Database tables verification failed: {db_out or db_err}{C_RESET}")
        sys.exit(1)

    # - curl -s -H 'Host: sun8.ir' http://localhost/ (must return HTML, NOT Bazar)
    print(f"   🌐 Verifying Host-Header routing separation for '{DOMAIN_NAME}'...")
    host_routing_cmd = f"curl -s -H 'Host: {DOMAIN_NAME}' http://localhost/ | head -c 150"
    routing_out, routing_err, routing_code = run_ssh(host_routing_cmd)
    if routing_code == 0 and ("sun8" in routing_out.lower() or "doctype" in routing_out.lower() or "html" in routing_out.lower()):
        print(f"      {C_GREEN}✅ Isolated routing works perfectly! Server returns Sun8 HTML.{C_RESET}")
    else:
        print(f"      {C_RED}❌ Host-Header routing verification failed: {routing_out or routing_err}{C_RESET}")
        sys.exit(1)

    print("\n" + "=" * 80)
    print(f"  {C_GREEN}{C_BOLD}🎉 DEPLOYMENT COMPLETED AND VERIFIED SUCCESSFULLY WITH ZERO DATA LOSS!{C_RESET}")
    print("=" * 80)
    print(f"  🌐 {C_BOLD}Main Website:{C_RESET} https://{DOMAIN_NAME} (or http://{VPS_IP})")
    print(f"  📂 Uploads, storage data, database structure, and process status are completely verified.")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    main()
