from latex2sympy2 import latex2latex

def do_calculation(argument):
    argument = argument.replace('\differentialD', 'd')
    argument = argument.replace('\mathop{=}', '=')
    
    result = latex2latex(argument)
    print(result)
    return  result# for now just return the argument

    # will later be replaced with the actual calculation with latex2sympy2 (sympy)