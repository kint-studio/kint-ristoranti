"""Server statico per lo sviluppo di KINT Ristoranti: niente cache, MIME espliciti, 404.html.
Con --dist serve dist/ applicando _headers e _redirects come Cloudflare Pages."""
import argparse
import functools
import http.server
import io
import pathlib
import re
import urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent.parent


def pattern(glob):
    """Converte un percorso di _headers/_redirects (con * e :nome) in espressione regolare."""
    out = re.escape(glob).replace(r'\*', '.*')
    return re.compile('^' + re.sub(r'\\?:([A-Za-z_]\w*)', r'(?P<\1>[^/]+)', out) + '$')


def load_headers(base):
    rules, current = [], None
    f = base / '_headers'
    for line in (f.read_text(encoding='utf-8').splitlines() if f.exists() else []):
        if not line.strip() or line.lstrip().startswith('#'):
            continue
        if line[0] in ' \t':
            if current is not None and ':' in line:
                k, v = line.split(':', 1)
                current[1].append((k.strip(), v.strip()))
        else:
            current = (pattern(line.strip()), [])
            rules.append(current)
    return rules


def load_redirects(base):
    rules = []
    f = base / '_redirects'
    for line in (f.read_text(encoding='utf-8').splitlines() if f.exists() else []):
        parts = line.split()
        if len(parts) < 2 or parts[0].startswith('#'):
            continue
        status = int(parts[2]) if len(parts) > 2 and parts[2].isdigit() else 302
        rules.append((pattern(parts[0]), parts[1], status))
    return rules


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        '.js': 'text/javascript', '.mjs': 'text/javascript', '.webp': 'image/webp',
        '.woff2': 'font/woff2', '.json': 'application/json', '.svg': 'image/svg+xml',
        '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
    }
    use_rules = False
    headers_rules = []
    redirect_rules = []
    extra = []

    def send_head(self):
        path = urllib.parse.unquote(urllib.parse.urlsplit(self.path).path)
        self.extra = []
        if self.use_rules:
            for rx, to, status in self.redirect_rules:
                m = rx.match(path)
                if m:
                    dest = to
                    for k, v in m.groupdict().items():
                        dest = dest.replace(':' + k, v)
                    self.send_response(status)
                    self.send_header('Location', dest)
                    self.send_header('Content-Length', '0')
                    self.end_headers()
                    return None
            for rx, hdrs in self.headers_rules:
                if rx.match(path):
                    self.extra += hdrs
        target = pathlib.Path(self.translate_path(self.path))
        if not target.exists() or (target.is_dir() and not (target / 'index.html').exists()):
            return self.not_found()
        return super().send_head()

    def not_found(self):
        page = pathlib.Path(self.directory) / '404.html'
        body = page.read_bytes() if page.exists() else b'404 Not Found'
        self.send_response(404)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        return None if self.command == 'HEAD' else io.BytesIO(body)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        for k, v in self.extra:
            if k.lower() != 'cache-control':  # in sviluppo la cache resta spenta
                self.send_header(k, v)
        super().end_headers()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=3101)
    parser.add_argument('--dist', action='store_true', help='serve dist/ con _headers e _redirects')
    args = parser.parse_args()
    base = ROOT / 'dist' if args.dist else ROOT
    if args.dist:
        Handler.use_rules = True
        Handler.headers_rules = load_headers(base)
        Handler.redirect_rules = load_redirects(base)
    handler = functools.partial(Handler, directory=str(base))
    with http.server.ThreadingHTTPServer(('127.0.0.1', args.port), handler) as server:
        print(f'KINT Ristoranti dev server su http://127.0.0.1:{args.port}/', flush=True)
        server.serve_forever()


if __name__ == '__main__':
    main()
