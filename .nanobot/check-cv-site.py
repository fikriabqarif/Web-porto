import re, urllib.request, urllib.error

BASE = "http://127.0.0.1:3000"
PAGES = {
    "/": ["3.74", "20+", "H8 GMRT UGM", "Experience", "Toolbox", "autonomous"],
    "/about": ["3.74", "B.Sc. Electronics and Instrumentation", "Head of Sumo Robot Division",
               "PKM-KC 2025", "PlatformIO", "Focus areas"],
    "/cv": ["Curriculum Vitae", "fikriabqarifawwaz@mail.ugm.ac.id", "Captain",
            "INSPIRE 2026", "5 DoF Robot Arm", "Autodesk Inventor", "30 cm"],
    "/projects": ["Conversion of Conventional Vehicles", "Underwater ROV", "G-Connect ERC"],
}

def fetch(path):
    try:
        with urllib.request.urlopen(BASE + path) as r:
            return r.status, r.read().decode("utf-8", "ignore")
    except urllib.error.HTTPError as e:
        return e.code, ""

def text_of(html):
    body = re.sub(r"<script[\s\S]*?</script>|<style[\s\S]*?</style>", " ", html)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", body))

for path, needles in PAGES.items():
    status, html = fetch(path)
    text = text_of(html)
    missing = [n for n in needles if n not in text]
    print(f"{path:10} {status}  chars={len(text):6}  {'OK' if not missing else 'MISSING: ' + ', '.join(missing)}")

# project detail pages
status, html = fetch("/projects")
slugs = sorted(set(re.findall(r'href="/projects/([a-z0-9\-]+)"', html)))
print("\ndetail pages:")
for slug in slugs:
    s, h = fetch(f"/projects/{slug}")
    t = text_of(h)
    print(f"  {slug:34} {s}  h1={'yes' if '<h1' in h else 'no':3}  len={len(t)}")
