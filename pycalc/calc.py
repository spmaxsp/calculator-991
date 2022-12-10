from latex2sympy2 import latex2latex

from latex2sympy2 import set_real

set_real(False)

def do_calculation(argument):
    argument = argument.replace('\\differentialD', 'd')
    argument = argument.replace('\\mathop{=}', '=')
    argument = argument.replace('\\angle', '(e^i)^')
    argument = argument.replace('\\left(', '{(')
    argument = argument.replace(')\\right', ')}')
    
    print(argument)
    result = latex2latex(argument,)
    print(result)
    return  result# for now just return the argument

    # will later be replaced with the actual calculation with latex2sympy2 (sympy)