from __future__ import print_function
from calc import do_calculation
from flask import Flask

app = Flask(__name__)

# server routes
@app.route("/ping")
def ping():
    return "OK"

@app.route("/calc/<text>")
def calc():
    return do_calculation(text)

# server start
def parse_port():
    port = 4242
    try:
        port = int(sys.argv[1])
    except Exception as e:
        pass
    return '{}'.format(port)

def main():
    print('starting server...')
    app.run(host='127.0.0.1', port=parse_port())

if __name__ == '__main__':
    main()
