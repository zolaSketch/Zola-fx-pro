#!/usr/bin/env python3
"""ቅዳሴ መልመጃ — static server with a force-download route."""
import http.server, socketserver, os, urllib.parse

DIR = os.path.dirname(os.path.abspath(__file__))
APP = os.path.join(DIR, 'kidase-app.html')
FILENAME = 'ቅዳሴ-መልመጃ.html'


class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=DIR, **kw)

    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path
        # Any of these force an actual file download on the phone
        if path in ('/download', '/get', '/app', '/dl'):
            try:
                data = open(APP, 'rb').read()
            except OSError:
                self.send_error(404)
                return
            quoted = urllib.parse.quote(FILENAME)
            self.send_response(200)
            self.send_header('Content-Type', 'application/octet-stream')
            self.send_header('Content-Disposition',
                             "attachment; filename=\"kidase-app.html\"; "
                             "filename*=UTF-8''" + quoted)
            self.send_header('Content-Length', str(len(data)))
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            self.wfile.write(data)
            return
        if path == '/':
            self.send_response(302)
            self.send_header('Location', '/download.html')
            self.end_headers()
            return
        return super().do_GET()

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('X-Frame-Options', 'ALLOWALL')
        super().end_headers()

    def log_message(self, fmt, *args):
        print("%s - %s" % (self.address_string(), fmt % args), flush=True)


class TCPServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == '__main__':
    with TCPServer(('0.0.0.0', 8080), H) as httpd:
        print('serving on 0.0.0.0:8080', flush=True)
        httpd.serve_forever()
