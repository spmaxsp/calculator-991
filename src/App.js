import "./App.css";
import { useEffect, useRef, useState } from "react";

import MathView from "react-math-view";

import 'katex/dist/katex.min.css';
import TeX from '@matejmazur/react-katex';

function Key(props) {
  function handleMouseDown(e) {
    e.preventDefault();
    if (props.shift_state == true) {
      props.shift_func();
      props.resetS();
    }
    else if (props.alpha_state == true) {
      props.alpha_func();
      props.resetA();
    }
    else {
      props.main_func();
    }
  }

  return (
  <div className="Key">
    <div className="Key-text">
      <small className="Key-shift"><TeX math={props.shift} /></small>
      <small className="Key-alpha"><TeX math={props.alpha} /></small>
    </div>
    <button className="Button" onMouseDown={(e) => handleMouseDown(e)}><TeX math={props.main} /></button>
  </div>
  );
}

function Modal({ handleClose, show, children }) {
  if (show) {
    return (
      <div className="Modal">
        <div className="modal-content">
          <button className="modal-close" onMouseDown={handleClose}>X</button>
          {children}
        </div>
      </div>
    );
  }
  else {
    return null;
  }
}

function Constants({constants}) {
  return (
    <div className="Constants">
      <h2>Constants</h2>
      <table>
        {constants.map((constant) => (
          <tr>
            <button className="Constant">
              <h2>{constant.name} <TeX math={constant.sym} />:    
              {constant.value} <TeX math={constant.unit} /></h2>
            </button>
          </tr>
        ))}
      </table>
    </div>
  );
}

function Engsymbols({engsymbols}) {
  return (
    <div className="Engsymbols">
      <h2>Engineering Symbols</h2>
      <table>
        {engsymbols.map((engsymbol) => (
          <tr>
            <button className="Constant">
              <h2>{engsymbol.name} <TeX math={engsymbol.sym} />:    
              {engsymbol.value}</h2>
            </button>
          </tr>
        ))}
      </table>
    </div>
  );
}


export default function App() {
  const [latex_out, setOut] = useState("");
  const [latex_in, setIn] = useState("");
  const mathinRef = useRef(null);
  const mathoutRef = useRef(null);

  const [showConstants, setShowConstants] = useState(true);
  const [showEngsymbols, setShowEngsymbols] = useState(false);

  const [constants, setConstants] = useState([]);
  const [engsymbols, setEngsymbols] = useState([]);
  
  var numeric = false;

  var request = "http://127.0.0.1:4242/latex"

  function calculate() {
    console.log("calculate: " + mathinRef.current?.getValue());
    setIn(mathinRef.current?.getValue());
    if (numeric) {
      request = "http://127.0.0.1:4242/latex";
    }
    else {
      request = "http://127.0.0.1:4242/numerical";
    }
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: mathinRef.current?.getValue()})
    };
    fetch(request, requestOptions)
    .then(res => res.json())
    .then((result) => {
          setOut(result.data);
          console.log("result: " + result.data);
        },

        (error) => {
            console.log("error: " + error);
        }
    )
  };
  
  const [alpha, toggleA] = useState(false);
  const [shift, toggleS] = useState(false);

  function calc_numeric() {
    numeric = !numeric;
    calculate();
  }

  function insert(key) {
    //mathinRef.current?.focus(); 
      mathinRef.current?.executeCommand(['insert', key]); 
  };

  function cursor(key) {
    //mathinRef.current?.focus(); 
    if (key == "left") {
      mathinRef.current?.executeCommand(['moveToPreviousChar']); 
    }
    else if (key == "right") {  
      mathinRef.current?.executeCommand(['moveToNextChar']); 
    }
    else if (key == "up") {
      mathinRef.current?.executeCommand(['moveUp']); 
    }
    else if (key == "down") {
      mathinRef.current?.executeCommand(['moveDown']); 
    }
  }

  function clear() { 
    //mathinRef.current?.focus(); 
    mathinRef.current?.executeCommand(['moveToMathFieldStart']); 
    mathinRef.current?.executeCommand(['deleteToMathFieldEnd']); 
  }

  function back() { 
    //mathinRef.current?.focus(); 
    mathinRef.current?.executeCommand(['deleteBackward']); 
  }

  function noop(){}

  const getData=()=>{
    fetch('http://127.0.0.1:4242/constants.json'
    ,{
      headers : { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
    )
      .then(function(response){
        console.log(response)
        return response.json();
      })
      .then(function(res) {
          setConstants(res.constants);
          setEngsymbols(res.engsym);
          console.log(res);
          setMacros();
        }
      )
  }

  useEffect(() => { 
    console.log("useEffect"); 
    getData();
  }, []);

  function setMacros() {
    constants.forEach(function (e) {
      var sym = e.symbol;
      var macro = e.macro;
      mathinRef.current?.setOptions({
        macros: {
          ...mathinRef.current?.getOptions('macros'),
          macro: sym,
        }
      });
    });

    engsymbols.forEach(function (e) {
      var sym = e.symbol;
      var macro = e.macro;
      mathinRef.current?.setOptions({
        macros: {
          ...mathinRef.current?.getOptions('macros'),
          macro: sym,
        }
      });
    });
  }
  
  return (
    <div className="App">
      <Modal show={showConstants} handleClose={() => setShowConstants(false)}>
        <Constants constants={constants}/>
      </Modal>
      <Modal show={showEngsymbols} handleClose={() => setShowEngsymbols(false)}>
        <Engsymbols engsymbols={engsymbols}/>
      </Modal>
      <div className="Calculator">
        <div className="Screen">
          <MathView
            id="mf"
            virtualKeyboardMode="off"
            virtuelKeyboardTrigger="off"
            value=""
            ref={mathinRef}
          />
          <MathView
            virtualKeyboardMode="off"
            virtuelKeyboardTrigger="off"
            value={latex_out}
            ref={mathoutRef}
          />
        </div>
        <div className="Keyboard-upper">
          <Key main="\text{SHIFT}"             shift=""           alpha=""          main_func={() => toggleS(true)}                  shift_func={() => toggleS(false)}                alpha_func={() => noop()}                   shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="\text{ALPHA}"             shift=""           alpha=""          main_func={() => toggleA(true)}                  shift_func={() => noop()}                        alpha_func={() => toggleA(false)}           shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="\leftarrow"               shift=""           alpha=""          main_func={() => cursor("left")}                 shift_func={() => cursor("left")}                alpha_func={() => cursor("left")}           shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="\rightarrow"              shift=""           alpha=""          main_func={() => cursor("right")}                shift_func={() => cursor("right")}               alpha_func={() => cursor("right")}          shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="\text{MODE}"              shift=""           alpha=""          main_func={() => noop()}                         shift_func={() => noop()}                        alpha_func={() => noop()}                   shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="\text{2nd}"               shift=""           alpha=""          main_func={() => noop()}                         shift_func={() => noop()}                        alpha_func={() => noop()}                   shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          
          <Key main="\text{OPTN}"              shift=""           alpha=""          main_func={() => setShowConstants(true)}         shift_func={() => setShowConstants(true)}        alpha_func={() => setShowConstants(true)}   shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="="                        shift=""           alpha=""          main_func={() => insert("=")}                    shift_func={() => insert("=")}                   alpha_func={() => insert("=")}              shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="\blacktriangle"           shift=""           alpha=""          main_func={() => cursor("up")}                   shift_func={() => cursor("up")}                  alpha_func={() => cursor("up")}             shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="\blacktriangledown"       shift=""           alpha=""          main_func={() => cursor("down")}                 shift_func={() => cursor("down")}                alpha_func={() => cursor("down")}           shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="\int dx"                  shift="d/dx"       alpha=""          main_func={() => insert("\\int_{#0}^#0 #0 dx")}  shift_func={() => insert("\\frac{d}{dx} #0")}    alpha_func={() => noop()}                   shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="x"                        shift="\sum"       alpha=""          main_func={() => insert("x")}                    shift_func={() => insert("\\sum_{x=#0}^#0 #0")}  alpha_func={() => noop()}                   shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />

          <Key main="\frac{\square}{\square}"  shift="a^{b/c}"    alpha=""          main_func={() => insert("\\frac{#0}{#0}")}       shift_func={() => insert("#0\\frac{#0}{#0}")}    alpha_func={() => noop()}                   shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="\sqrt{\square}"           shift="^3\sqrt y"  alpha=""          main_func={() => insert("\\sqrt{#0}")}           shift_func={() => insert("\\sqrt[3]{#0}")}       alpha_func={() => noop()}                   shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="x^2"                      shift="x^3"        alpha="\cot"      main_func={() => insert("#0^2")}                 shift_func={() => insert("#0^3")}                alpha_func={() => insert("\\cot(#0)")}      shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="x^y"                      shift="^x\sqrt y"  alpha="\cot^{-1}" main_func={() => insert("#0^#0")}                shift_func={() => insert("\\sqrt[#0]{#0}")}      alpha_func={() => insert("\\cot^{-1}(#0)")} shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="\log_a x"                 shift="10^x"       alpha=""          main_func={() => insert("\\log_#0 (#0)")}        shift_func={() => insert("10^x")}                alpha_func={() => noop()}                   shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="\ln"                      shift="e^x"        alpha="\pi"       main_func={() => insert("\\ln (#0)")}            shift_func={() => insert("e^#0")}                alpha_func={() => insert("\\pi")}           shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />

          <Key main="-"                        shift="\log"       alpha="a"         main_func={() => insert("-")}                    shift_func={() => insert("\\log (#0)")}          alpha_func={() => insert("a")}              shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="\degree"                  shift="^3\sqrt y"  alpha="b"         main_func={() => insert("\\degree")}             shift_func={() => insert("\\sqrt[3]{#0}")}       alpha_func={() => insert("b")}              shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="x^{-1}"                   shift="x!"         alpha="c"         main_func={() => insert("#0^{-1}")}              shift_func={() => insert("!")}                   alpha_func={() => insert("c")}              shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="\sin"                     shift="\arcsin"    alpha="d"         main_func={() => insert("\\sin(#0)")}            shift_func={() => insert("\\arcsin(#0)")}        alpha_func={() => insert("d")}              shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="\cos"                     shift="\arccos"    alpha="e"         main_func={() => insert("\\cos(#0)")}            shift_func={() => insert("\\arccos(#0)")}        alpha_func={() => insert("e")}              shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="\tan"                     shift="\arctan"    alpha="f"         main_func={() => insert("\\tan(#0)")}            shift_func={() => insert("\\arctan(#0)")}        alpha_func={() => insert("f")}              shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />

          <Key main="\text{STO}"               shift="\text{RCL}" alpha=""          main_func={() => noop()}                         shift_func={() => noop()}                        alpha_func={() => noop()}                   shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="\text{ENG}"               shift="\angle"     alpha="i"         main_func={() => noop()}                         shift_func={() => insert("\\angle")}             alpha_func={() => insert("i")}              shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="("                        shift="\text{Abs}" alpha="y"         main_func={() => insert("(")}                    shift_func={() => insert("\\vert #0 \\vert")}    alpha_func={() => insert("y")}              shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main=")"                        shift=","          alpha="z"         main_func={() => insert(")")}                    shift_func={() => insert(",")}                   alpha_func={() => insert("z")}              shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="S \leftrightharpoons D"   shift=""           alpha=""          main_func={() => calc_numeric()}                 shift_func={() => calc_numeric()}                alpha_func={() => calc_numeric()}           shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="M"                        shift=""           alpha=""          main_func={() => noop()}                         shift_func={() => noop()}                        alpha_func={() => noop()}                   shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
        </div>
        <div className="Keyboard-lower"> 
          <Key main="7"           shift="" alpha=""  main_func={() => insert("7")}        shift_func={() => insert("7")}        alpha_func={() => insert("7")}        shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="8"           shift="" alpha=""  main_func={() => insert("8")}        shift_func={() => insert("8")}        alpha_func={() => insert("8")}        shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="9"           shift="" alpha=""  main_func={() => insert("9")}        shift_func={() => insert("9")}        alpha_func={() => insert("9")}        shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="\text{DEL}"  shift="" alpha=""  main_func={() => back()}             shift_func={() => back()}             alpha_func={() => back()}             shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="\text{CLR}"  shift="" alpha=""  main_func={() => clear()}            shift_func={() => clear()}            alpha_func={() => clear()}            shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />

          <Key main="4"           shift="" alpha=""  main_func={() => insert("4")}        shift_func={() => insert("4")}        alpha_func={() => insert("4")}        shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="5"           shift="" alpha=""  main_func={() => insert("5")}        shift_func={() => insert("5")}        alpha_func={() => insert("5")}        shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="6"           shift="" alpha=""  main_func={() => insert("6")}        shift_func={() => insert("6")}        alpha_func={() => insert("6")}        shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="\times"      shift="" alpha=""  main_func={() => insert("\\times")}  shift_func={() => insert("\\times")}  alpha_func={() => insert("\\times")}  shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="\div"        shift="" alpha=""  main_func={() => insert("\\div")}    shift_func={() => insert("\\div")}    alpha_func={() => insert("\\div")}    shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />

          <Key main="1"           shift="" alpha=""  main_func={() => insert("1")}        shift_func={() => insert("1")}        alpha_func={() => insert("1")}        shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="2"           shift="" alpha=""  main_func={() => insert("2")}        shift_func={() => insert("2")}        alpha_func={() => insert("2")}        shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="3"           shift="" alpha=""  main_func={() => insert("3")}        shift_func={() => insert("3")}        alpha_func={() => insert("3")}        shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="+"           shift="" alpha=""  main_func={() => insert("+")}        shift_func={() => insert("+")}        alpha_func={() => insert("+")}        shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="-"           shift="" alpha=""  main_func={() => insert("-")}        shift_func={() => insert("-")}        alpha_func={() => insert("-")}        shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />

          <Key main="0"           shift="" alpha=""  main_func={() => insert("0")}        shift_func={() => insert("0")}        alpha_func={() => insert("0")}        shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="."           shift="" alpha=""  main_func={() => insert(".")}        shift_func={() => insert(".")}        alpha_func={() => insert(".")}        shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="\text{Exp}"  shift="" alpha=""  main_func={() => noop()}             shift_func={() => noop()}             alpha_func={() => noop()}             shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="\text{Ans}"  shift="" alpha=""  main_func={() => noop()}             shift_func={() => noop()}             alpha_func={() => noop()}             shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />
          <Key main="="           shift="" alpha=""  main_func={() => calculate()}        shift_func={() => calculate()}        alpha_func={() => calculate()}        shift_state={shift} alpha_state={alpha} resetS={() => toggleS(false)} resetA={() => toggleA(false)} />

        </div>
      </div>  
    </div>
  );
}