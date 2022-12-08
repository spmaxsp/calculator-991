from __future__ import print_function
from calc import do_calculation
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# server routes
@app.route("/ping")
def ping():
    return "OK"

@app.route("/calc", methods=["POST"])
def calc():
    content_type = request.headers.get('Content-Type')
    if (content_type == 'application/json'):
        json = request.json
        print(json)
        if (json and 'latex' in json):
            return jsonify({"result": do_calculation(json['latex'])})

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
