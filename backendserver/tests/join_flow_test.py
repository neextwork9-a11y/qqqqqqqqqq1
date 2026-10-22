# Referral join + ROOT account checks. Needs API on 127.0.0.1:8090 with a fresh test DB and test config.php.
import hmac, hashlib, json, time, requests, sys
B = "http://127.0.0.1:8090/api"; K = b"test-master-key-0123456789abcdef0123456789abcdef"
def master(path, body):
    d = json.dumps(body); ts = str(int(time.time()))
    sig = hmac.new(K, f"{ts}.POST./api{path}.{hashlib.sha256(d.encode()).hexdigest()}".encode(), hashlib.sha256).hexdigest()
    return requests.post(B + path, data=d, headers={"Content-Type": "application/json", "X-Master-Ts": ts, "X-Master-Sig": sig})
fails = 0
def check(n, c):
    global fails; print(("ok    " if c else "FAIL  ") + n); fails += 0 if c else 1
check("root account created", master("/master/root/ensure", {"password": "RootPass#2026"}).status_code == 200)
check("root login works", requests.post(B + "/member/login", json={"username": "ROOT", "password": "RootPass#2026"}).status_code == 200)
check("sponsor lookup shows ROOT", requests.get(B + "/member/sponsor?code=ROOT").json()["data"]["life_id"] == "ROOT")
check("register without referral link refused", requests.post(B + "/member/register", json={"name": "X", "phone": "01700000009", "password": "secret1"}).status_code == 400)
check("register via ROOT link works", requests.post(B + "/member/register", json={"name": "A", "phone": "01711111111", "password": "secret1", "referral_code": "ROOT"}).status_code == 200)
sys.exit(1 if fails else 0)
