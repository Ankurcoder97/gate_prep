import React, { useState } from 'react';
import { X, Calculator, Delete } from 'lucide-react';

export const ScientificCalculatorModal = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [isRad, setIsRad] = useState(true);

  if (!isOpen) return null;

  const handleNum = (num) => {
    setDisplay((prev) => (prev === '0' || prev === 'Error' ? String(num) : prev + String(num)));
  };

  const handleOp = (op) => {
    setDisplay((prev) => prev + ' ' + op + ' ');
  };

  const handleClear = () => setDisplay('0');

  const handleBackspace = () => {
    setDisplay((prev) => {
      if (prev.length <= 1 || prev === 'Error') return '0';
      return prev.trim().slice(0, -1).trim();
    });
  };

  const handleCalculate = () => {
    try {
      let expr = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E');

      expr = expr.replace(/sin\(([^)]+)\)/g, (_, val) => {
        const rad = isRad ? parseFloat(val) : (parseFloat(val) * Math.PI) / 180;
        return String(Math.sin(rad));
      });

      expr = expr.replace(/cos\(([^)]+)\)/g, (_, val) => {
        const rad = isRad ? parseFloat(val) : (parseFloat(val) * Math.PI) / 180;
        return String(Math.cos(rad));
      });

      expr = expr.replace(/tan\(([^)]+)\)/g, (_, val) => {
        const rad = isRad ? parseFloat(val) : (parseFloat(val) * Math.PI) / 180;
        return String(Math.tan(rad));
      });

      expr = expr.replace(/ln\(([^)]+)\)/g, (_, val) => String(Math.log(parseFloat(val))));
      expr = expr.replace(/log\(([^)]+)\)/g, (_, val) => String(Math.log10(parseFloat(val))));
      expr = expr.replace(/sqrt\(([^)]+)\)/g, (_, val) => String(Math.sqrt(parseFloat(val))));

      // Safe mathematical expression evaluator
      const calculateSafe = new Function(`'use strict'; return (${expr})`);
      const result = calculateSafe();
      if (isNaN(result) || !isFinite(result)) {
        setDisplay('Error');
      } else {
        setDisplay(String(Math.round(result * 1000000) / 1000000));
      }
    } catch (e) {
      setDisplay('Error');
    }
  };

  const applyFunction = (fn) => {
    if (display === '0' || display === 'Error') {
      setDisplay(`${fn}(`);
    } else {
      setDisplay(`${fn}(${display})`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center space-x-2 text-sm font-semibold">
            <Calculator className="w-4 h-4 text-blue-400" />
            <span>GATE Virtual Scientific Calculator</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Display */}
        <div className="p-4 bg-slate-950 border-b border-slate-800">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
            <button
              onClick={() => setIsRad(!isRad)}
              className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono hover:bg-slate-700"
            >
              {isRad ? 'RAD' : 'DEG'}
            </button>
            <span className="font-mono text-[11px]">{display.length > 25 ? '...' : ''}</span>
          </div>
          <div className="text-right font-mono text-2xl font-bold tracking-wider text-emerald-400 overflow-x-auto whitespace-nowrap scrollbar-none">
            {display}
          </div>
        </div>

        {/* Keypad */}
        <div className="p-3 grid grid-cols-5 gap-1.5 text-xs font-mono">
          {/* Scientific Functions */}
          <button onClick={() => applyFunction('sin')} className="p-2.5 rounded bg-slate-800 hover:bg-slate-700 font-semibold">sin</button>
          <button onClick={() => applyFunction('cos')} className="p-2.5 rounded bg-slate-800 hover:bg-slate-700 font-semibold">cos</button>
          <button onClick={() => applyFunction('tan')} className="p-2.5 rounded bg-slate-800 hover:bg-slate-700 font-semibold">tan</button>
          <button onClick={() => applyFunction('ln')} className="p-2.5 rounded bg-slate-800 hover:bg-slate-700 font-semibold">ln</button>
          <button onClick={() => applyFunction('log')} className="p-2.5 rounded bg-slate-800 hover:bg-slate-700 font-semibold">log₁₀</button>

          <button onClick={() => applyFunction('sqrt')} className="p-2.5 rounded bg-slate-800 hover:bg-slate-700 font-semibold">√x</button>
          <button onClick={() => handleOp('^')} className="p-2.5 rounded bg-slate-800 hover:bg-slate-700 font-semibold">xʸ</button>
          <button onClick={() => handleNum('(')} className="p-2.5 rounded bg-slate-800 hover:bg-slate-700 font-semibold">(</button>
          <button onClick={() => handleNum(')')} className="p-2.5 rounded bg-slate-800 hover:bg-slate-700 font-semibold">)</button>
          <button onClick={handleBackspace} className="p-2.5 rounded bg-red-900/60 hover:bg-red-800 text-red-200 font-semibold flex items-center justify-center">
            <Delete className="w-4 h-4" />
          </button>

          {/* Numbers & Standard Ops */}
          <button onClick={() => handleNum('7')} className="p-2.5 rounded bg-slate-700/60 hover:bg-slate-600 text-base font-semibold">7</button>
          <button onClick={() => handleNum('8')} className="p-2.5 rounded bg-slate-700/60 hover:bg-slate-600 text-base font-semibold">8</button>
          <button onClick={() => handleNum('9')} className="p-2.5 rounded bg-slate-700/60 hover:bg-slate-600 text-base font-semibold">9</button>
          <button onClick={() => handleOp('÷')} className="p-2.5 rounded bg-amber-600/80 hover:bg-amber-600 font-bold text-sm">÷</button>
          <button onClick={handleClear} className="p-2.5 rounded bg-red-600 hover:bg-red-700 font-bold">C</button>

          <button onClick={() => handleNum('4')} className="p-2.5 rounded bg-slate-700/60 hover:bg-slate-600 text-base font-semibold">4</button>
          <button onClick={() => handleNum('5')} className="p-2.5 rounded bg-slate-700/60 hover:bg-slate-600 text-base font-semibold">5</button>
          <button onClick={() => handleNum('6')} className="p-2.5 rounded bg-slate-700/60 hover:bg-slate-600 text-base font-semibold">6</button>
          <button onClick={() => handleOp('×')} className="p-2.5 rounded bg-amber-600/80 hover:bg-amber-600 font-bold text-sm">×</button>
          <button onClick={() => handleNum('π')} className="p-2.5 rounded bg-slate-800 hover:bg-slate-700 font-semibold">π</button>

          <button onClick={() => handleNum('1')} className="p-2.5 rounded bg-slate-700/60 hover:bg-slate-600 text-base font-semibold">1</button>
          <button onClick={() => handleNum('2')} className="p-2.5 rounded bg-slate-700/60 hover:bg-slate-600 text-base font-semibold">2</button>
          <button onClick={() => handleNum('3')} className="p-2.5 rounded bg-slate-700/60 hover:bg-slate-600 text-base font-semibold">3</button>
          <button onClick={() => handleOp('-')} className="p-2.5 rounded bg-amber-600/80 hover:bg-amber-600 font-bold text-sm">-</button>
          <button onClick={() => handleNum('e')} className="p-2.5 rounded bg-slate-800 hover:bg-slate-700 font-semibold">e</button>

          <button onClick={() => handleNum('0')} className="p-2.5 rounded bg-slate-700/60 hover:bg-slate-600 text-base font-semibold col-span-2">0</button>
          <button onClick={() => handleNum('.')} className="p-2.5 rounded bg-slate-700/60 hover:bg-slate-600 text-base font-semibold">.</button>
          <button onClick={() => handleOp('+')} className="p-2.5 rounded bg-amber-600/80 hover:bg-amber-600 font-bold text-sm">+</button>
          <button onClick={handleCalculate} className="p-2.5 rounded bg-emerald-600 hover:bg-emerald-500 font-bold text-sm shadow-lg shadow-emerald-600/30">=</button>
        </div>
      </div>
    </div>
  );
};
