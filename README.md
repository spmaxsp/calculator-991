# Calculator 991
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) 


## About:
a calculator, written in react. The calculations are based on latex2latex2 from OrangeX4. 
The whole application will be integrated into an electron package later.

> **Attention: The project is still "work in progress". Simple functionalities are already working, but some buttons are not working yet.**

### Screenshot:
<p align="center">
<img src="screenshot.jpeg" alt="screenshot of the calculator" width="500" margin="auto" />
</p>

### React frontend:
The frontend is written in React js. The expressions are entered as latex expressions using MathLive from CortexJS.

### Python Backend:
The expressions are calculated by an API written in python. The API is copied from OrangeX4s sympy-calculator for VS code. It is based on Flask and latex2latex2.

## Installation:
Documentation for the installation with the used Python and NodeJS modules will be added later.

## Projects used:
 - OrangeX4/latex2sympy
 - OrangeX4/latex-sympy-calculator (only the py-server script)
 - ShaMan123/react-math-view
 - MatejBransky/react-katex

## License:
The project is under MIT license. Please also note the licenses of the used code pieces
