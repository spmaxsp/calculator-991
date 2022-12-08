import "./App.css";
import { useLayoutEffect, useRef, useState } from "react";
import MathView from "react-math-view";
import virtualKeyboardContainer from "react-math-view";
import { executeCommand } from "react-math-view";

export default function App() {
  const [latex_out, setOut] = useState("");
  const [latex_in, setIn] = useState("");
  const mathinRef = useRef(null);
  const mathoutRef = useRef(null);
  function output() {
    setIn(mathinRef.current?.getValue());
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latex: mathinRef.current?.getValue()})
    };
    fetch("http://127.0.0.1:4242/calc", requestOptions)
    .then(res => res.json())
    .then((result) => {
          setOut(result.result);
          console.log("result: " + result.result);
        },

        (error) => {
            console.log("error: " + error);
        }
    )
      //setOut(mathinRef.current?.getValue());
  };

  useLayoutEffect(() => {
    document.getElementById("mf").setOptions({virtualKeyboardContainer: document.getElementById("keys") });
    mathinRef.current.focus();
  }, []);
  
  function press(key) {
    console.log("button: " + key);
    mathinRef.current?.focus(); 
    mathinRef.current?.executeCommand(['insert', key]); 
  };


  return (
    <div className="App">
      <h1>Calculate</h1>
      <h2>Input</h2>
      <MathView
        id="mf"
        virtualKeyboardMode="manual"
        virtuelKeyboardTrigger="manual"
        value=""
        ref={mathinRef}
      />
      <button onClick={() => press('\\frac{1}{2}')}>Test frac</button>
      <button onClick={() => press('\\int #0 d #0')}>Test int</button>

      <button onClick={output}>Calc</button>
      <div style={{ marginTop: 30 }}>
        <a> {latex_in} </a>
      </div>

      <h2>Output</h2>
      <MathView
        virtualKeyboardMode="manual"
        value={latex_out}
        ref={mathoutRef}
      />
      <div style={{ marginTop: 30 }}>
        <a> {latex_out} </a>
      </div>
      
      <div id="keys" style={{position: "relative", with: "30%"}} /> 
    </div>
  );
}