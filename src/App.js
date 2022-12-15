import "./App.css";
import { useEffect, useRef, useState } from "react";

import MathView from "react-math-view";

import 'katex/dist/katex.min.css';
import TeX from '@matejmazur/react-katex';

function Key(props) {
  return (
  <div className="Key">
    <div className="Key-text">
      <small className="Key-shift"><TeX math={props.shift} /></small>
      <small className="Key-alpha"><TeX math={props.alpha} /></small>
    </div>
    <button className="Button" onClick={props.onClick}><TeX math={props.main} /></button>
  </div>
  );
}

function Modal({ handleClose, show, children }) {
  if (show) {
    return (
      <div className="Modal">
        <div className="modal-content">
          {children}
          <button onClick={handleClose}>close</button>
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
        <tr>
          <th>Symbol</th>
          <th>Value</th>
          <th>Unit</th>
        </tr>
        {constants.map((constant) => (
          <tr>
            <td>{constant.symbol}</td>
            <td>{constant.value}</td>
            <td>{constant.unit}</td>
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
        <tr>
          <th>Symbol</th>
          <th>Value</th>
        </tr>
        {engsymbols.map((engsymbol) => (
          <tr>
            <td>{engsymbol.symbol}</td>
            <td>{engsymbol.value}</td>
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

  function insert(key, keys, keya) {
    mathinRef.current?.focus(); 
    if (alpha) {
      mathinRef.current?.executeCommand(['insert', keya]); 
    }
    else if (shift) {
      mathinRef.current?.executeCommand(['insert', keys]); 
    }
    else {
      mathinRef.current?.executeCommand(['insert', key]); 
    }
    toggleS(false)
    toggleA(false)
  };

  function cursor(key) {
    mathinRef.current?.focus(); 
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
    mathinRef.current?.focus(); 
    mathinRef.current?.executeCommand(['moveToMathFieldStart']); 
    mathinRef.current?.executeCommand(['deleteToMathFieldEnd']); 
  }

  function back() { 
    mathinRef.current?.focus(); 
    mathinRef.current?.executeCommand(['deleteBackward']); 
  }

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
          <Key main="\text{SHIFT}"             shift=""           alpha=""    onClick={() => toggleS(!shift)}/>
          <Key main="\text{ALPHA}"             shift=""           alpha=""    onClick={() => toggleA(!alpha)}/>
          <Key main="\leftarrow"               shift=""           alpha=""    onClick={() => cursor("left")} />
          <Key main="\rightarrow"              shift=""           alpha=""    onClick={() => cursor("right")}/>
          <Key main="\text{MODE}"              shift=""           alpha="" />
          <Key main="\text{2nd}"               shift=""           alpha="" />
          
          <Key main="\text{OPTN}"              shift=""           alpha=""     onClick={() => setShowConstants(true)} />
          <Key main="="                        shift=""           alpha=""     onClick={() => insert("=", "", "")}/>
          <Key main="\blacktriangle"           shift=""           alpha=""     onClick={() => cursor("up")}       />
          <Key main="\blacktriangledown"       shift=""           alpha=""     onClick={() => cursor("down")}     />
          <Key main="\int dx"                  shift="d/dx"       alpha=""     onClick={() => insert("\\int_{#0}^#0 #0 dx", "\\frac{d}{dx} #0", "")}/>
          <Key main="x"                        shift="\sum"       alpha=""     onClick={() => insert("x", "\\sum_{x=#0}^#0 #0", "")}/>

          <Key main="\frac{\square}{\square}"  shift="a^{b/c}"    alpha=""     onClick={() => insert("\\frac{#0}{#0}", "#0\\frac{#0}{#0}", "")}/>
          <Key main="\sqrt{\square}"           shift="^3\sqrt y"  alpha=""     onClick={() => insert("\\sqrt{#0}", "\\sqrt[3]{#0}", "")}/>
          <Key main="x^2"                      shift="x^3"        alpha="\cot" onClick={() => insert("#0^2", "#0^3", "\\cot(#0)")}/>
          <Key main="x^y"                      shift="^x\sqrt y"  alpha="\cot^{-1}" onClick={() => insert("#0^#0", "\\sqrt[#0]{#0}", "\\cot^{-1}(#0)")}/>
          <Key main="\log_a x"                 shift="10^x"       alpha=""     onClick={() => insert("\\log_#0 (#0)", "10^x", "")}/>
          <Key main="\ln"                      shift="e^x"        alpha="\pi"     onClick={() => insert("\\ln (#0)", "e^#0", "\\pi")}/>

          <Key main="-"                        shift="\log"       alpha="a"     onClick={() => insert("-", "\\log (#0)", "a")}/>
          <Key main="\degree"                  shift="^3\sqrt y"  alpha="b"     onClick={() => insert("\\degree", "\\sqrt[3]{#0}", "b")}/>
          <Key main="x^{-1}"                   shift="x!"         alpha="c"     onClick={() => insert("#0^{-1}", "!", "c")}/>
          <Key main="\sin"                     shift="\arcsin"    alpha="d"     onClick={() => insert("\\sin(#0)", "\\arcsin(#0)", "d")}/>
          <Key main="\cos"                     shift="\arccos"    alpha="e"     onClick={() => insert("\\cos(#0)", "\\arccos(#0)", "e")}/>
          <Key main="\tan"                     shift="\arctan"    alpha="f"     onClick={() => insert("\\tan(#0)", "\\arctan(#0)", "f")}/>

          <Key main="\text{STO}"               shift="\text{RCL}" alpha="" />
          <Key main="\text{ENG}"               shift="\angle"     alpha="i"     onClick={() => insert("", "\\angle", "i")}/>
          <Key main="("                        shift="\text{Abs}" alpha="y"     onClick={() => insert("(", "\\vert #0 \\vert", "y")}/>
          <Key main=")"                        shift=","          alpha="z"     onClick={() => insert(")", ",", "z")}/>
          <Key main="S \leftrightharpoons D"   shift=""           alpha=""      onClick={calc_numeric} />
          <Key main="M"                        shift=""           alpha="" />
        </div>
        <div className="Keyboard-lower"> 
          <Key main="7"     shift="" alpha="" onClick={() => insert("7", "", "")}/>
          <Key main="8"     shift="" alpha="" onClick={() => insert("8", "", "")}/>
          <Key main="9"     shift="" alpha="" onClick={() => insert("9", "", "")}/>
          <Key main="\text{DEL}" shift="" alpha="" onClick={back}/>
          <Key main="\text{CLR}" shift="" alpha="" onClick={clear}/>

          <Key main="4"     shift="" alpha="" onClick={() => insert("4", "", "")}/>
          <Key main="5"     shift="" alpha="" onClick={() => insert("5", "", "")}/>
          <Key main="6"     shift="" alpha="" onClick={() => insert("6", "", "")}/>
          <Key main="\times" shift="" alpha="" onClick={() => insert("\\times", "", "")}/>
          <Key main="\div"   shift="" alpha="" onClick={() => insert("\\div", "", "")}/>

          <Key main="1"     shift="" alpha="" onClick={() => insert("1", "", "")}/>
          <Key main="2"     shift="" alpha="" onClick={() => insert("2", "", "")}/>
          <Key main="3"     shift="" alpha="" onClick={() => insert("3", "", "")}/>
          <Key main="+"     shift="" alpha="" onClick={() => insert("+", "", "")}/>
          <Key main="-"     shift="" alpha="" onClick={() => insert("-", "", "")}/>

          <Key main="0"     shift="" alpha="" onClick={() => insert("0", "", "")}/>
          <Key main="."     shift="" alpha="" onClick={() => insert(".", "", "")}/>
          <Key main="\text{Exp}" shift="" alpha="" />
          <Key main="\text{Ans}" shift="" alpha="" />
          <Key main="="     shift="" alpha="" onClick={calculate}/>

        </div>
      </div>  
    </div>
  );
}