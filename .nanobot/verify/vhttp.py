"""Minimal HTTP helper for manual SPEC verification (no external deps)."""
import http.cookiejar
import mimetypes
import os
import re
import urllib.error
import urllib.request
import uuid

BASE = "http://127.0.0.1:3000"
ADMIN = "/kelola-8f3c2a"


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def encode_multipart(fields, files):
    """fields: dict[str,str]; files: list[(name, filename, bytes, content_type)]"""
    boundary = "----verify" + uuid.uuid4().hex
    out = bytearray()
    for k, v in fields.items():
        out += f"--{boundary}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n".encode()
        out += str(v).encode() + b"\r\n"
    for name, filename, data, ctype in files:
        out += f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"; filename=\"{filename}\"\r\n".encode()
        out += f"Content-Type: {ctype}\r\n\r\n".encode()
        out += data + b"\r\n"
    out += f"--{boundary}--\r\n".encode()
    return bytes(out), f"multipart/form-data; boundary={boundary}"


class Resp:
    def __init__(self, status, headers, body):
        self.status = status
        self.headers = headers
        self.body = body

    @property
    def text(self):
        return self.body.decode("utf-8", "replace")

    def header(self, name):
        for k, v in self.headers:
            if k.lower() == name.lower():
                return v
        return None

    def cookies(self):
        return [v for k, v in self.headers if k.lower() == "set-cookie"]

    def __repr__(self):
        return f"<Resp {self.status} len={len(self.body)}>"


class Session:
    def __init__(self):
        self.jar = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(
            urllib.request.HTTPCookieProcessor(self.jar), NoRedirect()
        )

    def request(self, method, path, fields=None, files=None, headers=None, follow=False):
        url = path if path.startswith("http") else BASE + path
        hdrs = {
            "User-Agent": "porto-verify/1.0",
            "Accept": "text/html,application/xhtml+xml,*/*",
            "Origin": BASE,
            "Referer": BASE + "/",
        }
        if headers:
            hdrs.update(headers)
        data = None
        if fields is not None or files:
            data, ctype = encode_multipart(fields or {}, files or [])
            hdrs["Content-Type"] = ctype
        elif method in ("POST", "PUT", "PATCH"):
            data = b""
        req = urllib.request.Request(url, data=data, headers=hdrs, method=method)
        handlers = [urllib.request.HTTPCookieProcessor(self.jar)]
        if follow:
            handlers.append(urllib.request.HTTPRedirectHandler())
        else:
            handlers.append(NoRedirect())
        opener = urllib.request.build_opener(*handlers)
        try:
            r = opener.open(req, timeout=120)
            return Resp(r.status, list(r.headers.items()), r.read())
        except urllib.error.HTTPError as e:
            return Resp(e.code, list(e.headers.items()), e.read())

    def get(self, path, **kw):
        return self.request("GET", path, **kw)

    def post(self, path, fields=None, files=None, **kw):
        return self.request("POST", path, fields=fields, files=files, **kw)


def action_fields(html):
    """Extract the React server-action hidden inputs from a rendered form."""
    fields = {}
    for m in re.finditer(r'<input type="hidden" name="(\$ACTION[^"]*)"(?: value="([^"]*)")?/?>', html):
        name, value = m.group(1), m.group(2) or ""
        value = (
            value.replace("&quot;", '"').replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
        )
        fields[name] = value
    return fields


def png(width=8, height=8, rgb=(20, 120, 200)):
    """Tiny valid PNG (no external deps)."""
    import struct
    import zlib

    raw = b""
    for _ in range(height):
        raw += b"\x00" + bytes(rgb) * width
    def chunk(tag, payload):
        return (
            struct.pack(">I", len(payload))
            + tag
            + payload
            + struct.pack(">I", zlib.crc32(tag + payload) & 0xFFFFFFFF)
        )
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )


def strip_tags(html):
    html = re.sub(r"<script.*?</script>", " ", html, flags=re.S)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html))
