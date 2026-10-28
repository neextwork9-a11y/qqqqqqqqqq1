"""Push the XAMPP setup patch through the existing signed Master API."""
import argparse
import base64
import hashlib
import hmac
import json
import os
from pathlib import Path
import time
import urllib.request
import urllib.error

BASE = os.environ.get("LIFEOS_SERVER_URL", "https://server.nexarofx.com/lifeos/backendserver").rstrip("/")
ROOT = Path(__file__).resolve().parents[1] / "backendserver"
FILES = ["src/Migrations.php", "src/bootstrap.php", "src/Auth.php", "src/PanelPolicy.php", "src/Api/routes_master.php", "src/Api/routes_member.php", "src/Engine/Wallet.php", "src/Engine/Commission.php", "src/Engine/Placement.php", "src/Engine/Plan.php", "src/Engine/Rank.php", "src/Api/routes_admin.php", "config.example.php", "README.md", ".htaccess"]
# Ship every migration, including financial audit structures; never enumerate a partial schema.
FILES += [str(path.relative_to(ROOT)) for path in sorted((ROOT / "database").glob("*.sql"))]


def request(method, path, payload=None):
    key = os.environ.get("LIFEOS_MASTER_KEY")
    if not key:
        raise RuntimeError("LIFEOS_MASTER_KEY is not configured")
    body = json.dumps(payload, separators=(",", ":")).encode() if payload is not None else b""
    timestamp = str(int(time.time()))
    message = f"{timestamp}.{method}.{path}.{hashlib.sha256(body).hexdigest()}"
    signature = hmac.new(key.encode(), message.encode(), hashlib.sha256).hexdigest()
    req = urllib.request.Request(BASE + path, data=body if method != "GET" else None, method=method,
        headers={"Content-Type": "application/json", "User-Agent": "LifeOS-Master-Updater/1.0", "X-Master-Ts": timestamp, "X-Master-Sig": signature})
    # Never forward the signing headers to another host via redirects.
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            return None
    try:
        with urllib.request.build_opener(NoRedirect()).open(req, timeout=60) as response:
            result = json.load(response)
    except urllib.error.HTTPError as error:
        raise RuntimeError(f"Master API returned HTTP {error.code}; check server configuration") from None
    if not result.get("ok"):
        raise RuntimeError("Master API did not accept the operation")
    return result.get("data")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--files", nargs="+", help="Deploy only these reviewed files instead of the full setup package")
    args = parser.parse_args()
    request("GET", "/api/master/ping")
    print("Signed server connectivity verified")
    if args.check:
        return
    selected = args.files or FILES
    for path in selected:
        full = (ROOT / path).resolve()
        if not full.is_relative_to(ROOT.resolve()) or not full.is_file() or full.name == "config.php":
            raise RuntimeError("Invalid deployment file")
    files = [{"path": path, "content": base64.b64encode((ROOT / path).read_bytes()).decode()} for path in selected]
    deployed = request("POST", "/api/master/deploy", {"files": files})
    print("Setup update deployed; backup:", deployed.get("deploy_id", "unavailable"))
    request("POST", "/api/master/db/migrate", {})
    print("Database setup completed")
    root_pw = os.environ.get("LIFEOS_ROOT_PASSWORD")
    if root_pw:
        request("POST", "/api/master/root/ensure", {"password": root_pw})
        print("Root member account ready (login: ROOT)")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        # Do not print response bodies, request headers or credential details.
        print(str(error) if isinstance(error, RuntimeError) else "Remote update failed; check server connectivity")
        raise SystemExit(1)