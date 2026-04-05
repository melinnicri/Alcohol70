import { useState, useEffect, useCallback } from "react";

const RANGE_MIN = 71;
const RANGE_MAX = 100;

export default function AlcoholCalculator() {
  const [modo, setModo] = useState("final");
  const [vol, setVol] = useState("");
  const [conc, setConc] = useState(95);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  const calcular = useCallback(() => {
    setError("");
    setVisible(false);
    setResult(null);

    const v = parseFloat(vol);
    if (!v || v <= 0) {
      setError("Ingresa un volumen válido mayor a 0 mL.");
      return;
    }
    if (conc <= 70) {
      setError("La concentración inicial debe ser mayor al 70%.");
      return;
    }

    let vAlc, vAgua, vFinal, formula;

    if (modo === "final") {
      vFinal = v;
      vAlc = (vFinal * 70) / conc;
      vAgua = vFinal - vAlc;
      formula = {
        line1: `Quiero ${vFinal} mL al 70% desde alcohol al ${conc}%:`,
        line2: `Alcohol = (${vFinal} × 70) / ${conc} = ${vAlc.toFixed(1)} mL`,
        line3: `Agua = ${vFinal} − ${vAlc.toFixed(1)} = ${vAgua.toFixed(1)} mL`,
      };
    } else {
      vAlc = v;
      vAgua = vAlc * (conc / 70 - 1);
      vFinal = vAlc + vAgua;
      formula = {
        line1: `Tengo ${vAlc} mL de alcohol al ${conc}%:`,
        line2: `Agua = ${vAlc} × (${conc}/70 − 1) = ${vAgua.toFixed(1)} mL`,
        line3: `Sol. final = ${vAlc} + ${vAgua.toFixed(1)} = ${vFinal.toFixed(1)} mL al 70%`,
      };
    }

    setResult({ vAlc, vAgua, vFinal, formula });
    setTimeout(() => setVisible(true), 10);
  }, [vol, conc, modo]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Enter") calcular(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [calcular]);

  const handleModo = (m) => {
    setModo(m);
    setResult(null);
    setVisible(false);
    setError("");
  };

  return (
    <div style={styles.body}>
      <div style={styles.grid} />
      <div style={styles.wrapper}>

        {/* Header */}
        <header style={styles.header}>
          <div style={styles.pill}>Laboratorio · Dilución</div>
          <h1 style={styles.h1}>
            Alcohol<br /><span style={styles.accent}>al 70%</span>
          </h1>
          <p style={styles.subtitle}>
            Prepara tu solución desinfectante<br />
            desde alcohol de 95%, 96% o 99.9%.
          </p>
        </header>

        {/* Card */}
        <div style={styles.card}>

          {/* Mode toggle */}
          <div style={styles.modeToggle}>
            {[
              { key: "final", label: "Quiero preparar\nX mL al 70%" },
              { key: "alcohol", label: "Tengo X mL\nde alcohol" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleModo(key)}
                style={{
                  ...styles.modeBtn,
                  ...(modo === key ? styles.modeBtnActive : {}),
                }}
              >
                {label.split("\n").map((l, i) => (
                  <span key={i} style={{ display: "block" }}>{l}</span>
                ))}
              </button>
            ))}
          </div>

          {/* Volume field */}
          <div style={styles.field}>
            <label style={styles.label}>
              {modo === "final" ? "Volumen final a preparar" : "Volumen de alcohol disponible"}
            </label>
            <div style={styles.inputRow}>
              <input
                type="number"
                value={vol}
                onChange={(e) => setVol(e.target.value)}
                placeholder={modo === "final" ? "ej: 1000" : "ej: 325"}
                min="1"
                style={styles.input}
              />
              <div style={styles.unit}>mL</div>
            </div>
          </div>

          {/* Concentration field */}
          <div style={styles.field}>
            <label style={styles.label}>
              Concentración del alcohol disponible:{" "}
              <span style={{ color: "#58d68d" }}>{conc}%</span>
            </label>
            <input
              type="range"
              min={RANGE_MIN}
              max={RANGE_MAX}
              step="0.1"
              value={conc}
              onChange={(e) => setConc(parseFloat(e.target.value))}
              style={styles.range}
            />

          </div>

          <button onClick={calcular} style={styles.calcBtn}>
            Calcular →
          </button>

          {error && <div style={styles.errorMsg}>{error}</div>}
        </div>

        {/* Result */}
        {result && (
          <div
            style={{
              ...styles.resultCard,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.3s ease, transform 0.3s ease",
            }}
          >
            <div style={styles.resultTitle}>▸ Resultado</div>
            <div style={styles.resultGrid}>
              {[
                { val: result.vAlc.toFixed(1), label: "Alcohol (mL)" },
                { val: result.vAgua.toFixed(1), label: "Agua (mL)" },
                { val: result.vFinal.toFixed(1), label: "Sol. final (mL)", highlight: true },
              ].map(({ val, label, highlight }) => (
                <div key={label} style={{ ...styles.resultItem, ...(highlight ? styles.resultItemHighlight : {}) }}>
                  <div style={styles.resultValue}>{val}</div>
                  <div style={styles.resultLabel}>{label}</div>
                </div>
              ))}
            </div>
            <div style={styles.resultFormula}>
              <div>{result.formula.line1}</div>
              <div>
                {result.formula.line2.split(/(\d+\.?\d* mL|\d+\.?\d* mL al 70%)/g).map((part, i) =>
                  /\d+\.?\d* mL/.test(part)
                    ? <span key={i} style={{ color: "#58d68d" }}>{part}</span>
                    : part
                )}
              </div>
              <div>
                {result.formula.line3.split(/(\d+\.?\d* mL(?:\s+al\s+70%)?)/g).map((part, i) =>
                  /\d+\.?\d* mL/.test(part)
                    ? <span key={i} style={{ color: "#58d68d" }}>{part}</span>
                    : part
                )}
              </div>
            </div>
          </div>
        )}

        <footer style={styles.footer}>
          Modo A: Alcohol = (V_final × 70) / C₁<br />
          Modo B: Agua = V_alcohol × (C₁ / 70 − 1)
        </footer>
      </div>

      <style>{`
        input[type=number] { -moz-appearance: textfield; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=range] { accent-color: #58d68d; cursor: pointer; width: 100%; margin-top: 0.6rem; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  );
}

const styles = {
  body: {
    fontFamily: "'DM Mono', monospace",
    background: "#0d1117",
    color: "#e6edf3",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "2rem 1rem 4rem",
    position: "relative",
  },
  grid: {
    position: "fixed",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(88,214,141,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(88,214,141,0.04) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    pointerEvents: "none",
    zIndex: 0,
  },
  wrapper: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: 480,
  },
  header: {
    marginBottom: "2.5rem",
    textAlign: "center",
  },
  pill: {
    display: "inline-block",
    background: "rgba(88,214,141,0.12)",
    border: "1px solid rgba(88,214,141,0.3)",
    color: "#58d68d",
    fontSize: "0.7rem",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    padding: "0.3rem 0.8rem",
    borderRadius: 999,
    marginBottom: "1rem",
  },
  h1: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "clamp(2rem, 8vw, 2.8rem)",
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
  },
  accent: { color: "#58d68d" },
  subtitle: {
    color: "#8b949e",
    fontSize: "0.8rem",
    marginTop: "0.6rem",
    lineHeight: 1.6,
  },
  card: {
    background: "#1c2128",
    border: "1px solid #30363d",
    borderRadius: 16,
    padding: "1.8rem",
    marginBottom: "1.2rem",
  },
  modeToggle: {
    display: "flex",
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: 10,
    padding: 4,
    marginBottom: "1.6rem",
    gap: 4,
  },
  modeBtn: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#8b949e",
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.68rem",
    padding: "0.55rem 0.4rem",
    borderRadius: 7,
    cursor: "pointer",
    textAlign: "center",
    lineHeight: 1.5,
    transition: "all 0.2s",
  },
  modeBtnActive: {
    background: "#58d68d",
    color: "#0d1117",
    fontWeight: 500,
  },
  field: { marginBottom: "1.4rem" },
  label: {
    display: "block",
    fontSize: "0.72rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#8b949e",
    marginBottom: "0.5rem",
  },
  inputRow: {
    display: "flex",
    alignItems: "stretch",
    border: "1px solid #30363d",
    borderRadius: 10,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    background: "#161b22",
    border: "none",
    outline: "none",
    color: "#e6edf3",
    fontFamily: "'DM Mono', monospace",
    fontSize: "1.1rem",
    padding: "0.75rem 1rem",
  },
  unit: {
    background: "#161b22",
    borderLeft: "1px solid #30363d",
    color: "#8b949e",
    fontSize: "0.75rem",
    padding: "0 1rem",
    display: "flex",
    alignItems: "center",
  },
  presets: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
    marginTop: "0.6rem",
  },
  presetBtn: {
    background: "#161b22",
    border: "1px solid #30363d",
    color: "#8b949e",
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.72rem",
    padding: "0.3rem 0.7rem",
    borderRadius: 6,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  presetBtnActive: {
    borderColor: "#58d68d",
    color: "#58d68d",
    background: "rgba(88,214,141,0.08)",
  },
  range: { width: "100%", marginTop: "0.6rem" },
  rangeLabels: {
    position: "relative",
    height: "1.2rem",
    marginTop: "0.3rem",
  },
  tickLabel: {
    position: "absolute",
    fontSize: "0.65rem",
    color: "#8b949e",
  },
  calcBtn: {
    width: "100%",
    background: "#58d68d",
    color: "#0d1117",
    border: "none",
    borderRadius: 10,
    fontFamily: "'Syne', sans-serif",
    fontSize: "1rem",
    fontWeight: 700,
    padding: "0.9rem",
    cursor: "pointer",
    marginTop: "0.4rem",
  },
  errorMsg: {
    color: "#f85149",
    fontSize: "0.78rem",
    marginTop: "0.8rem",
    padding: "0.6rem 1rem",
    background: "rgba(248,81,73,0.08)",
    border: "1px solid rgba(248,81,73,0.2)",
    borderRadius: 8,
  },
  resultCard: {
    background: "#1c2128",
    border: "1px solid #58d68d",
    borderRadius: 16,
    padding: "1.8rem",
    marginBottom: "1.2rem",
  },
  resultTitle: {
    fontSize: "0.7rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#58d68d",
    marginBottom: "1.2rem",
  },
  resultGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "0.8rem",
    marginBottom: "1.2rem",
  },
  resultItem: {
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: 10,
    padding: "0.9rem 0.5rem",
    textAlign: "center",
  },
  resultItemHighlight: {
    borderColor: "#58d68d",
    background: "rgba(88,214,141,0.06)",
  },
  resultValue: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "#58d68d",
    lineHeight: 1,
    marginBottom: "0.3rem",
  },
  resultLabel: {
    fontSize: "0.62rem",
    color: "#8b949e",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  resultFormula: {
    background: "#0d1117",
    border: "1px solid #30363d",
    borderRadius: 8,
    padding: "0.8rem 1rem",
    fontSize: "0.75rem",
    color: "#8b949e",
    lineHeight: 1.7,
  },
  footer: {
    marginTop: "2rem",
    textAlign: "center",
    fontSize: "0.68rem",
    color: "#8b949e",
    lineHeight: 1.8,
  },
};
