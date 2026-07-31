"""Small localhost service for persistent QML state and OverFast requests."""

from __future__ import annotations

import json
import hmac
import secrets
import threading
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


HOST = "127.0.0.1"
PORT = 0
OVERFAST_ROOT = "https://overfast-api.tekrop.fr"
MAX_REQUEST_BYTES = 2_000_000
MAX_RESPONSE_BYTES = 8_000_000


class LocalHelper:
    def __init__(self, user_root: Path) -> None:
        self.state_path = user_root / "data" / "qml_state.json"
        self._server: ThreadingHTTPServer | None = None
        self._thread: threading.Thread | None = None
        self.token = secrets.token_urlsafe(32)

    @property
    def root(self) -> str:
        server = self._server
        if server is None:
            return ""
        return f"http://{HOST}:{server.server_port}"

    def start(self) -> None:
        owner = self

        class Handler(BaseHTTPRequestHandler):
            def log_message(self, _format: str, *_args: object) -> None:
                return

            def _authorized(self) -> bool:
                supplied = self.headers.get("X-OverRoll-Token", "")
                return bool(supplied) and hmac.compare_digest(supplied, owner.token)

            def _send(self, status: int, payload: object) -> None:
                body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
                self.send_response(status)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.send_header("Access-Control-Allow-Origin", "null")
                self.send_header("Access-Control-Allow-Headers", "Content-Type, X-OverRoll-Token")
                self.send_header("Access-Control-Allow-Methods", "GET, PUT, OPTIONS")
                self.send_header("Cache-Control", "no-store")
                self.end_headers()
                if body:
                    self.wfile.write(body)

            def do_OPTIONS(self) -> None:  # noqa: N802
                self._send(204, {})

            def do_GET(self) -> None:  # noqa: N802
                if not self._authorized():
                    self._send(403, {"error": "Forbidden"})
                    return
                parsed = urlsplit(self.path)
                if parsed.path == "/state":
                    self._send(200, owner._read_state())
                    return
                if parsed.path.startswith("/overfast/players") and len(self.path) <= 2048:
                    owner._proxy_overfast(self, parsed.path[len("/overfast"):], parsed.query)
                    return
                self._send(404, {"error": "Not found"})

            def do_PUT(self) -> None:  # noqa: N802
                if not self._authorized():
                    self._send(403, {"error": "Forbidden"})
                    return
                if urlsplit(self.path).path != "/state":
                    self._send(404, {"error": "Not found"})
                    return
                try:
                    length = int(self.headers.get("Content-Length", "0"))
                    if length < 0 or length > MAX_REQUEST_BYTES:
                        self._send(413, {"error": "Payload too large"})
                        return
                    payload = json.loads(self.rfile.read(length).decode("utf-8"))
                    if not isinstance(payload, dict):
                        raise ValueError("State must be an object")
                    owner._write_state(payload)
                    self._send(200, payload)
                except (OSError, ValueError, json.JSONDecodeError) as exc:
                    self._send(400, {"error": str(exc)})

        try:
            self._server = ThreadingHTTPServer((HOST, PORT), Handler)
        except OSError:
            # A launcher or another OverRoll window may already own the helper.
            self._server = None
            return
        self._server.daemon_threads = True
        self._thread = threading.Thread(target=self._server.serve_forever, name="OverRollHelper", daemon=True)
        self._thread.start()

    def stop(self) -> None:
        server = self._server
        self._server = None
        if server is None:
            return
        server.shutdown()
        server.server_close()
        if self._thread is not None:
            self._thread.join(timeout=0.5)
        self._thread = None

    def _read_state(self) -> dict[str, object]:
        try:
            payload = json.loads(self.state_path.read_text(encoding="utf-8"))
            if isinstance(payload, dict):
                return payload
        except (OSError, json.JSONDecodeError):
            pass
        return {"version": 1, "profiles": {}}

    def _write_state(self, payload: dict[str, object]) -> None:
        self.state_path.parent.mkdir(parents=True, exist_ok=True)
        temporary = self.state_path.with_suffix(".tmp")
        temporary.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        temporary.replace(self.state_path)

    @staticmethod
    def _proxy_overfast(handler: BaseHTTPRequestHandler, path: str, query: str) -> None:
        url = OVERFAST_ROOT + path + ("?" + query if query else "")
        request = urllib.request.Request(url, headers={"User-Agent": "OverRoll/2.3.3"})
        try:
            with urllib.request.urlopen(request, timeout=18) as response:
                body = response.read(MAX_RESPONSE_BYTES + 1)
                if len(body) > MAX_RESPONSE_BYTES:
                    raise OSError("OverFast response too large")
                handler.send_response(response.status)
                handler.send_header("Content-Type", response.headers.get("Content-Type", "application/json"))
                handler.send_header("Content-Length", str(len(body)))
                handler.send_header("Access-Control-Allow-Origin", "null")
                handler.send_header("Cache-Control", "no-store")
                handler.end_headers()
                handler.wfile.write(body)
        except urllib.error.HTTPError as exc:
            payload = exc.read(MAX_RESPONSE_BYTES)
            handler.send_response(exc.code)
            handler.send_header("Content-Type", "application/json")
            handler.send_header("Content-Length", str(len(payload)))
            handler.send_header("Access-Control-Allow-Origin", "null")
            handler.send_header("Cache-Control", "no-store")
            handler.end_headers()
            handler.wfile.write(payload)
        except (OSError, urllib.error.URLError) as exc:
            body = json.dumps({"error": str(exc)}).encode("utf-8")
            handler.send_response(502)
            handler.send_header("Content-Type", "application/json")
            handler.send_header("Content-Length", str(len(body)))
            handler.send_header("Access-Control-Allow-Origin", "null")
            handler.send_header("Cache-Control", "no-store")
            handler.end_headers()
            handler.wfile.write(body)
