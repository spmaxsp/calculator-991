from flask import Flask, request
from flask_cors import CORS
import json
import latex2sympy2
import sympy
from sympy.abc import *
from sympy import *
from latex2sympy2 import latex2latex, latex2sympy, var, variances, set_variances, set_real, latex

app = Flask(__name__)
CORS(app)

is_real = False

def preprocess(argument):
    argument = argument.replace('\\differentialD', 'd')
    argument = argument.replace('\\mathop{=}', '=')
    argument = argument.replace('\\angle', '(e^i)^')
    argument = argument.replace('\\left(', '{(')
    argument = argument.replace(')\\right', ')}')
    return argument

@app.route('/')
def main():
    return 'Latex Sympy Calculator Server'


@app.route('/latex', methods=['POST'])
def get_latex():
    try:
        return {
            'data': latex2latex(preprocess(request.json['data'])),
            'error': ''
        }
    except Exception as e:
        return {
            'data': '',
            'error': str(e)
        }

@app.route('/numerical', methods=['POST'])
def get_numerical():
    try:
        return {
            'data': latex(simplify(latex2sympy(preprocess(request.json['data'])).subs(variances).doit().doit()).evalf(subs=variances)),
            'error': ''
        }
    except Exception as e:
        return {
            'data': '',
            'error': str(e)
        }

@app.route('/factor', methods=['POST'])
def get_factor():
    try:
        return {
            'data': latex(factor(latex2sympy(preprocess(request.json['data'])).subs(variances))),
            'error': ''
        }
    except Exception as e:
        return {
            'data': '',
            'error': str(e)
        }

@app.route('/expand', methods=['POST'])
def get_expand():
    try:
        return {
            'data': latex(expand(apart(expand_trig(latex2sympy(preprocess(request.json['data'])).subs(variances))))),
            'error': ''
        }
    except Exception as _:
        try:
          return {
              'data': latex(expand(expand_trig(latex2sympy(preprocess(request.json['data'])).subs(variances)))),
              'error': ''
          }
        except Exception as e:
          return {
              'data': '',
              'error': str(e)
          }

@app.route('/variances', methods=['GET'])
def get_variances():
    result = {}
    for key in var:
        result[key] = str(var[key])
    return json.dumps(result)

@app.route('/reset', methods=['GET'])
def reset():
    set_variances({})
    global var
    var = latex2sympy2.var
    return {
        'success' : True  
    }


@app.route('/complex', methods=['GET'])
def complex():
    global is_real
    is_real = not is_real
    set_real(True if is_real else None)
    return {
        'success' : True,
        'value' : is_real
    }


@app.route('/python', methods=['POST'])
def run_python():
    try:
        rv = eval(request.json['data'])
        return {
            'data': str(rv),
            'error': ''
        }
    except Exception as e:
        return {
            'data': '',
            'error': str(e)
        }

# server start
def parse_port():
    port = 4242
    try:
        port = int(sys.argv[1])
    except:
        pass
    return '{}'.format(port)

def main():
    print('starting server...')
    app.run(host='127.0.0.1', port=parse_port())

if __name__ == '__main__':
    main()
