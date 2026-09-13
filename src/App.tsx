import { useMemo, useState } from "react";
import { GPU_SPECS, MODEL_SUGGESTIONS, PRECISION_LABELS, SOURCES } from "./data";
import { calculateSizing } from "./sizing";
import type { GpuSizingResult, Precision, SizingInputs } from "./types";

const DEFAULT_INPUTS: SizingInputs = {
  model: "Llama 3.3",
  parametersB: 70,
  precision: "FP8",
  totalUsers: 100,
  concurrentUsers: 10,
  inputTokens: 8000,
  outputTokens: 1000,
  useCase: "Chatbot / Asistente empresarial",
  kvPrecision: "FP8"
};

const DEFAULT_GPU_ID = "h200-hgx-4";

function fmt(value: number, digits = 1) {
  return new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: digits
  }).format(value);
}

function BrandWordmarks() {
  return (
    <div className="brand-lockup" aria-label="Tecnologías Lenovo y NVIDIA">
      <span className="lenovo-mark">LENOVO</span>
      <span className="plus">+</span>
      <span className="nvidia-mark">NVIDIA</span>
    </div>
  );
}

function normalizeQuantity(value: number, minimum: number, increment: number) {
  const safeValue = Number.isFinite(value) ? value : minimum;
  const base = Math.max(minimum, Math.floor(safeValue));
  return increment > 1 ? Math.ceil(base / increment) * increment : base;
}

export default function App() {
  const [inputs, setInputs] = useState<SizingInputs>(DEFAULT_INPUTS);
  const [calculated, setCalculated] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [selectedGpuId, setSelectedGpuId] = useState(DEFAULT_GPU_ID);
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});

  const result = useMemo(() => calculateSizing(inputs), [inputs]);

  const selectedResult = useMemo<GpuSizingResult>(() => {
    return (
      result.results.find((item) => item.gpu.id === selectedGpuId) ??
      result.results[0]
    );
  }, [result.results, selectedGpuId]);

  const selectedMinimum = selectedResult.memoryGpuCount;
  const selectedQuantity = normalizeQuantity(
    selectedQuantities[selectedResult.gpu.id] ?? selectedMinimum,
    selectedMinimum,
    selectedResult.gpu.minHardwareIncrement
  );
  const selectedHardwareUnits = Math.ceil(
    selectedQuantity / selectedResult.gpu.minHardwareIncrement
  );
  const selectedServerEstimate = Math.max(
    1,
    Math.ceil(selectedQuantity / selectedResult.gpu.maxGpusPerAssumedServer)
  );
  const selectedProvisionedVram = selectedQuantity * selectedResult.gpu.memoryGB;
  const licenseCount = selectedQuantity;

  function setNumber(key: keyof SizingInputs, value: string) {
    const parsed = value === "" ? 0 : Number(value);
    setInputs((prev) => ({ ...prev, [key]: parsed } as SizingInputs));
    setCalculated(false);
  }

  function setText(key: keyof SizingInputs, value: string) {
    setInputs((prev) => ({ ...prev, [key]: value } as SizingInputs));
    setCalculated(false);
  }

  function setGpuSelection(gpuId: string) {
    setSelectedGpuId(gpuId);
  }

  function setGpuQuantity(item: GpuSizingResult, rawValue: string) {
    const parsed = Number(rawValue);
    const quantity = normalizeQuantity(
      parsed,
      item.memoryGpuCount,
      item.gpu.minHardwareIncrement
    );
    setSelectedGpuId(item.gpu.id);
    setSelectedQuantities((prev) => ({
      ...prev,
      [item.gpu.id]: quantity
    }));
  }

  function reset() {
    setInputs(DEFAULT_INPUTS);
    setSelectedGpuId(DEFAULT_GPU_ID);
    setSelectedQuantities({});
    setCalculated(true);
  }

  function calculate() {
    setCalculated(true);
    document.getElementById("resultados")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function printReport() {
    setShowDisclaimer(false);
    window.setTimeout(() => window.print(), 100);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <BrandWordmarks />
          <p>GPU HW Sizer</p>
          <span>Memory sizing · Lenovo LP2130</span>
        </div>

        <nav>
          <a href="#dimensionamiento">01 · Dimensionamiento</a>
          <a href="#resultados">02 · Resultados</a>
          <a href="#gpus">03 · GPUs</a>
          <a href="#software">04 · Software NVIDIA</a>
          <a href="#metodologia">05 · Metodología</a>
          <a href="#fuentes">06 · Fuentes</a>
        </nav>

        <div className="sidebar-note">
          <strong>Estado</strong>
          <span className="dev-pill">EN DESARROLLO</span>
          <p>
            El cálculo compara la memoria requerida contra la VRAM disponible de cada
            GPU. La selección final de GPU y cantidad la realiza el usuario.
          </p>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <span className="eyebrow">AI Infrastructure · Memory Sizing</span>
            <h1>Calculadora de GPUs para LLM</h1>
          </div>
          <div className="top-actions">
            <button className="button ghost" onClick={reset}>
              Restablecer
            </button>
            <button className="button dark" onClick={() => setShowDisclaimer(true)}>
              Imprimir / PDF
            </button>
          </div>
        </header>

        <section className="hero-card">
          <div>
            <span className="eyebrow">Cálculo por capacidad de memoria</span>
            <h2>Memoria del modelo + KV cache = VRAM total requerida.</h2>
            <p>
              La herramienta calcula la memoria necesaria y compara exclusivamente las cuatro GPUs
              de datacenter definidas para este proyecto. El usuario selecciona la GPU y la cantidad.
            </p>
          </div>
          <div className="hero-metrics">
            <div>
              <span>GPU seleccionada</span>
              <strong>{selectedResult.gpu.shortName}</strong>
            </div>
            <div>
              <span>Cantidad seleccionada</span>
              <strong>{selectedQuantity} GPU</strong>
            </div>
            <div>
              <span>VRAM requerida</span>
              <strong>{fmt(result.totalVramGB)} GB</strong>
            </div>
          </div>
        </section>

        <section id="dimensionamiento" className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">01 · Intake</span>
              <h2>Datos del proyecto</h2>
            </div>
            <p>
              La memoria total se calcula con los pesos del modelo y el KV cache. Los
              parámetros avanzados permiten ajustar la arquitectura del modelo.
            </p>
          </div>

          <div className="form-card">
            <div className="form-grid">
              <label className="field field-wide">
                <span>Modelo</span>
                <input
                  list="model-list"
                  value={inputs.model}
                  onChange={(e) => setText("model", e.target.value)}
                  placeholder="Ej. Llama 3.3, DeepSeek-R1, Qwen 3.5..."
                />
                <datalist id="model-list">
                  {MODEL_SUGGESTIONS.map((model) => (
                    <option value={model} key={model} />
                  ))}
                </datalist>
                <small>Campo libre con sugerencias de modelos.</small>
              </label>

              <label className="field">
                <span>Número de parámetros</span>
                <div className="input-suffix">
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={inputs.parametersB || ""}
                    onChange={(e) => setNumber("parametersB", e.target.value)}
                  />
                  <b>B</b>
                </div>
              </label>

              <label className="field">
                <span>Precisión</span>
                <select
                  value={inputs.precision}
                  onChange={(e) => setText("precision", e.target.value as Precision)}
                >
                  {Object.entries(PRECISION_LABELS).map(([key, label]) => (
                    <option value={key} key={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Usuarios totales</span>
                <input
                  type="number"
                  min="1"
                  value={inputs.totalUsers || ""}
                  onChange={(e) => setNumber("totalUsers", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Usuarios concurrentes</span>
                <input
                  type="number"
                  min="1"
                  value={inputs.concurrentUsers || ""}
                  onChange={(e) => setNumber("concurrentUsers", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Input máximo</span>
                <div className="input-suffix">
                  <input
                    type="number"
                    min="1"
                    value={inputs.inputTokens || ""}
                    onChange={(e) => setNumber("inputTokens", e.target.value)}
                  />
                  <b>tokens</b>
                </div>
              </label>

              <label className="field">
                <span>Output máximo</span>
                <div className="input-suffix">
                  <input
                    type="number"
                    min="1"
                    value={inputs.outputTokens || ""}
                    onChange={(e) => setNumber("outputTokens", e.target.value)}
                  />
                  <b>tokens</b>
                </div>
              </label>

              <label className="field field-wide">
                <span>Caso de uso</span>
                <input
                  value={inputs.useCase}
                  onChange={(e) => setText("useCase", e.target.value)}
                  placeholder="Ej. RAG, chatbot, coding assistant, inferencia batch..."
                />
              </label>
            </div>

            <div className="advanced-row">
              <button
                className="link-button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                type="button"
              >
                {showAdvanced ? "Ocultar" : "Mostrar"} parámetros avanzados de KV cache
              </button>
              <span>Útil para modelos diferentes de Llama 3.3 70B.</span>
            </div>

            {showAdvanced && (
              <div className="advanced-panel">
                <label className="field">
                  <span>Layers</span>
                  <input
                    type="number"
                    min="1"
                    value={inputs.layers ?? ""}
                    onChange={(e) => setNumber("layers", e.target.value)}
                    placeholder="Ej. 80"
                  />
                </label>
                <label className="field">
                  <span>KV Heads</span>
                  <input
                    type="number"
                    min="1"
                    value={inputs.kvHeads ?? ""}
                    onChange={(e) => setNumber("kvHeads", e.target.value)}
                    placeholder="Ej. 8"
                  />
                </label>
                <label className="field">
                  <span>Head Dimension</span>
                  <input
                    type="number"
                    min="1"
                    value={inputs.headDim ?? ""}
                    onChange={(e) => setNumber("headDim", e.target.value)}
                    placeholder="Ej. 128"
                  />
                </label>
                <label className="field">
                  <span>Precisión KV cache</span>
                  <select
                    value={inputs.kvPrecision ?? inputs.precision}
                    onChange={(e) => setText("kvPrecision", e.target.value as Precision)}
                  >
                    {Object.entries(PRECISION_LABELS)
                      .filter(([key]) => key !== "UNDEFINED")
                      .map(([key, label]) => (
                        <option value={key} key={key}>
                          {label}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
            )}

            <div className="form-footer">
              <div>
                {!calculated && (
                  <span className="dirty-note">Hay cambios pendientes de recalcular.</span>
                )}
              </div>
              <button className="button primary" onClick={calculate}>
                Calcular GPUs
              </button>
            </div>
          </div>
        </section>

        <section id="resultados" className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">02 · Output</span>
              <h2>Resumen del sizing</h2>
            </div>
            <p>
              El resultado compara exclusivamente la memoria total requerida con la
              VRAM de cada GPU. La GPU final la selecciona el usuario.
            </p>
          </div>

          <div className="metric-grid metric-grid-three">
            <article className="metric-card metric-model">
              <span>Memoria del modelo</span>
              <strong>{fmt(result.modelMemoryGB)} GB</strong>
              <small>Parámetros × bytes × 1.2</small>
            </article>
            <article className="metric-card metric-kv">
              <span>KV cache</span>
              <strong>{fmt(result.kvCacheGB)} GB</strong>
              <small>{result.architecture.label}</small>
            </article>
            <article className="metric-card metric-total">
              <span>VRAM total estimada</span>
              <strong>{fmt(result.totalVramGB)} GB</strong>
              <small>Memoria del modelo + KV cache</small>
            </article>
          </div>

          <div className="selection-card">
            <div className="selection-main">
              <span className="eyebrow">Selección preliminar</span>
              <h3>Configuración seleccionada por el usuario</h3>

              <div className="selection-controls">
                <label className="field">
                  <span>GPU seleccionada</span>
                  <select
                    value={selectedResult.gpu.id}
                    onChange={(e) => setGpuSelection(e.target.value)}
                  >
                    {result.results.map((item) => (
                      <option value={item.gpu.id} key={item.gpu.id}>
                        {item.gpu.shortName} — {item.gpu.memoryGB} GB
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Cantidad seleccionada</span>
                  <input
                    type="number"
                    min={selectedMinimum}
                    step={selectedResult.gpu.minHardwareIncrement}
                    value={selectedQuantity}
                    onChange={(e) => setGpuQuantity(selectedResult, e.target.value)}
                  />
                  <small>Mínimo calculado por memoria: {selectedMinimum} GPU</small>
                </label>
              </div>

              <div className="selection-number">
                <strong>{selectedQuantity}</strong>
                <span>GPU físicas seleccionadas</span>
              </div>
              <p>
                {selectedResult.gpu.id === "h200-hgx-4"
                  ? `${selectedHardwareUnits} board(s) HGX de 4 GPU · ${selectedServerEstimate} servidor(es) estimados`
                  : `${selectedQuantity} tarjeta(s) PCIe · ${selectedServerEstimate} servidor(es) estimados`}
              </p>
            </div>

            <div className="selection-detail">
              <div>
                <span>Mínimo por memoria</span>
                <strong>{selectedMinimum} GPU</strong>
              </div>
              <div>
                <span>Cantidad seleccionada</span>
                <strong>{selectedQuantity} GPU</strong>
              </div>
              <div>
                <span>VRAM por GPU</span>
                <strong>{selectedResult.gpu.memoryGB} GB</strong>
              </div>
              <div>
                <span>VRAM seleccionada</span>
                <strong>{fmt(selectedProvisionedVram)} GB</strong>
              </div>
              <div>
                <span>Formato</span>
                <strong>{selectedResult.gpu.formFactor}</strong>
              </div>
              <div>
                <span>Licencias NVAIE</span>
                <strong>{licenseCount} por GPU*</strong>
              </div>
            </div>
          </div>

          {result.warnings.length > 0 && (
            <div className="warning-box">
              <strong>Aspectos que deben revisarse</strong>
              <ul>
                {result.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="comparison-table-wrap">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>GPU</th>
                  <th>VRAM/GPU</th>
                  <th>Cantidad de GPU</th>
                </tr>
              </thead>
              <tbody>
                {result.results.map((item) => {
                  const quantity = normalizeQuantity(
                    selectedQuantities[item.gpu.id] ?? item.memoryGpuCount,
                    item.memoryGpuCount,
                    item.gpu.minHardwareIncrement
                  );
                  const isSelected = item.gpu.id === selectedResult.gpu.id;

                  return (
                    <tr key={item.gpu.id} className={isSelected ? "selected-row" : ""}>
                      <td>
                        <label className="gpu-choice">
                          <input
                            type="radio"
                            name="gpu-selection"
                            checked={isSelected}
                            onChange={() => setGpuSelection(item.gpu.id)}
                          />
                          <span>
                            <strong>{item.gpu.shortName}</strong>
                            <small>{item.gpu.formFactor}</small>
                          </span>
                        </label>
                      </td>
                      <td>{item.gpu.memoryGB} GB</td>
                      <td>
                        <div className="quantity-cell">
                          <input
                            className="quantity-input"
                            type="number"
                            min={item.memoryGpuCount}
                            step={item.gpu.minHardwareIncrement}
                            value={quantity}
                            onChange={(e) => setGpuQuantity(item, e.target.value)}
                          />
                          <small>Mínimo: {item.memoryGpuCount}</small>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="table-note">
              Selecciona la GPU con el control de la primera columna. La cantidad inicia
              en el mínimo calculado por memoria y puede aumentarse. El HGX H200 utiliza
              incrementos de cuatro GPUs por board.
            </p>
          </div>
        </section>

        <section id="gpus" className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">03 · Portfolio</span>
              <h2>GPUs de datacenter evaluadas</h2>
            </div>
            <p>Las capacidades se mantienen en un archivo de datos para facilitar actualizaciones.</p>
          </div>

          <div className="gpu-grid">
            {GPU_SPECS.map((gpu) => (
              <article className="gpu-card" key={gpu.id}>
                <div className="gpu-card-top">
                  <span className="gpu-chip">{gpu.architecture}</span>
                  <span>{gpu.powerW} W</span>
                </div>
                <h3>{gpu.shortName}</h3>
                <p>{gpu.softwareNote}</p>
                <dl>
                  <div><dt>VRAM</dt><dd>{gpu.memoryGB} GB</dd></div>
                  <div><dt>Bandwidth</dt><dd>{fmt(gpu.bandwidthGBs, 0)} GB/s</dd></div>
                  <div><dt>NVLink</dt><dd>{gpu.nvlink ? "Sí" : "No"}</dd></div>
                  <div><dt>MIG</dt><dd>{gpu.mig}</dd></div>
                </dl>
                <a href={gpu.productUrl} target="_blank" rel="noreferrer">
                  Ver Lenovo Press ↗
                </a>
              </article>
            ))}
          </div>
        </section>

        <section id="software" className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">04 · Software stack</span>
              <h2>Software NVIDIA sugerido</h2>
            </div>
            <p>
              La selección de software debe confirmarse contra la matriz de soporte
              vigente del sistema, GPU, sistema operativo y modelo.
            </p>
          </div>

          <div className="software-layout">
            <article className="software-card featured">
              <span className="nvidia-mark large">NVIDIA</span>
              <h3>NVIDIA AI Enterprise</h3>
              <p>
                Puede utilizarse como capa empresarial para soporte, software validado
                y operación de cargas de IA. El licenciamiento aplicable debe validarse
                contra la configuración final.
              </p>
              <strong>Para la selección actual: {licenseCount} entitlement(s) por GPU*</strong>
              <a
                href="https://www.nvidia.com/en-us/data-center/products/ai-enterprise/"
                target="_blank"
                rel="noreferrer"
              >
                NVIDIA AI Enterprise ↗
              </a>
            </article>

            <div className="software-list">
              <article><h3>NVIDIA NIM</h3><p>Microservicios de inferencia y APIs estándar.</p></article>
              <article><h3>NGC + Container Toolkit</h3><p>Contenedores y runtime para Docker/Kubernetes.</p></article>
              <article><h3>DCGM</h3><p>Telemetría, health checks y monitoreo operativo.</p></article>
              <article><h3>vGPU / RTX vWS — opcional</h3><p>Para escenarios de virtualización soportada.</p></article>
            </div>
          </div>

          <div className="license-note">
            <strong>* Nota de licenciamiento</strong>
            <p>
              Los términos comerciales, part numbers y derechos de uso deben validarse
              con Lenovo/NVIDIA antes de ordenar.
            </p>
          </div>
        </section>

        <section id="metodologia" className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">05 · Method</span>
              <h2>Cómo calcula la herramienta</h2>
            </div>
            <p>Las fórmulas visibles permiten auditar el cálculo de memoria.</p>
          </div>

          <div className="method-grid">
            <article>
              <span>01</span>
              <h3>Memoria del modelo</h3>
              <code>M_model = P × Z × 1.2</code>
              <p>P representa billones de parámetros y Z los bytes de la precisión.</p>
            </article>
            <article>
              <span>02</span>
              <h3>KV cache</h3>
              <code>M_KV = 2 × C × T × L × KVH × D × Z</code>
              <p>Usa concurrencia, contexto, layers, KV heads, head dimension y bytes.</p>
            </article>
            <article>
              <span>03</span>
              <h3>VRAM total</h3>
              <code>VRAM_total = M_model + M_KV</code>
              <p>La memoria total combina pesos del modelo y KV cache.</p>
            </article>
            <article>
              <span>04</span>
              <h3>Cantidad por memoria</h3>
              <code>GPU = ceil(VRAM_total / VRAM_GPU)</code>
              <p>El board H200 se redondea al incremento físico de cuatro GPUs.</p>
            </article>
          </div>
        </section>

        <section id="fuentes" className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">06 · References</span>
              <h2>Fuentes técnicas</h2>
            </div>
            <p>Las URLs se mantienen visibles para auditar datos y fórmulas.</p>
          </div>

          <div className="source-list">
            {SOURCES.map((source) => (
              <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>
                <span>{source.label}</span>
                <b>↗</b>
              </a>
            ))}
          </div>
        </section>

        <footer>
          <BrandWordmarks />
          <p>
            Herramienta preliminar de cálculo por memoria · En desarrollo · No constituye
            una cotización ni certificación de una configuración final.
          </p>
        </footer>

        <section className="print-report" aria-hidden="true">
          <div className="print-header">
            <BrandWordmarks />
            <div>
              <h1>GPU HW Sizing Report</h1>
              <p>Resumen técnico preliminar</p>
            </div>
          </div>

          <h2>Entradas</h2>
          <table>
            <tbody>
              <tr><th>Modelo</th><td>{inputs.model}</td></tr>
              <tr><th>Parámetros</th><td>{inputs.parametersB} B</td></tr>
              <tr><th>Precisión</th><td>{PRECISION_LABELS[inputs.precision]}</td></tr>
              <tr><th>Usuarios totales</th><td>{inputs.totalUsers}</td></tr>
              <tr><th>Usuarios concurrentes</th><td>{inputs.concurrentUsers}</td></tr>
              <tr><th>Input máximo</th><td>{inputs.inputTokens} tokens</td></tr>
              <tr><th>Output máximo</th><td>{inputs.outputTokens} tokens</td></tr>
              <tr><th>Caso de uso</th><td>{inputs.useCase}</td></tr>
            </tbody>
          </table>

          <h2>Memoria calculada</h2>
          <table>
            <tbody>
              <tr><th>Memoria del modelo</th><td>{fmt(result.modelMemoryGB)} GB</td></tr>
              <tr><th>KV cache</th><td>{fmt(result.kvCacheGB)} GB</td></tr>
              <tr><th>VRAM total</th><td>{fmt(result.totalVramGB)} GB</td></tr>
            </tbody>
          </table>

          <h2>Selección del usuario</h2>
          <table>
            <tbody>
              <tr><th>GPU</th><td>{selectedResult.gpu.name}</td></tr>
              <tr><th>VRAM por GPU</th><td>{selectedResult.gpu.memoryGB} GB</td></tr>
              <tr><th>Mínimo calculado por memoria</th><td>{selectedMinimum} GPU</td></tr>
              <tr><th>Cantidad seleccionada</th><td>{selectedQuantity} GPU</td></tr>
              <tr><th>VRAM seleccionada</th><td>{fmt(selectedProvisionedVram)} GB</td></tr>
              <tr><th>Licenciamiento NVIDIA AI Enterprise</th><td>{licenseCount} por GPU*</td></tr>
            </tbody>
          </table>

          <h2>Alternativas por memoria</h2>
          <table>
            <thead>
              <tr><th>Tipo de GPU</th><th>VRAM/GPU</th><th>Mínimo por memoria</th></tr>
            </thead>
            <tbody>
              {result.results.map((item) => (
                <tr key={item.gpu.id}>
                  <td>{item.gpu.shortName}</td>
                  <td>{item.gpu.memoryGB} GB</td>
                  <td>{item.memoryGpuCount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>Disclaimer</h2>
          <p className="print-disclaimer">
            Este documento contiene cálculos preliminares de capacidad de memoria basados
            en Lenovo LLM Sizing Guide LP2130 y documentación pública de producto. La
            configuración final debe validar compatibilidad del sistema, firmware, drivers,
            CPU, memoria host, almacenamiento, red, potencia, refrigeración, runtime y
            licenciamiento. La GPU y cantidad mostradas como selección corresponden a la
            elección del usuario.
          </p>
          <p>Referencia: https://lenovopress.lenovo.com/lp2130-lenovo-llm-sizing-guide</p>
        </section>

        {showDisclaimer && (
          <div className="modal-backdrop" role="presentation">
            <div className="modal" role="dialog" aria-modal="true">
              <span className="eyebrow">Antes de imprimir</span>
              <h2>Disclaimer técnico</h2>
              <p>
                Los resultados son estimaciones preliminares de capacidad de memoria.
                La GPU y cantidad finales son seleccionadas por el usuario.
              </p>
              <p>
                Deben validarse compatibilidad, firmware, drivers, sistema operativo,
                CPU, memoria host, almacenamiento, red, potencia, refrigeración, runtime,
                precisión y licenciamiento antes de definir una configuración final.
              </p>
              <div className="modal-source">
                Referencia:
                <a
                  href="https://lenovopress.lenovo.com/lp2130-lenovo-llm-sizing-guide"
                  target="_blank"
                  rel="noreferrer"
                >
                  Lenovo LLM Sizing Guide LP2130 ↗
                </a>
              </div>
              <div className="modal-actions">
                <button className="button ghost" onClick={() => setShowDisclaimer(false)}>
                  Cancelar
                </button>
                <button className="button primary" onClick={printReport}>
                  Continuar e imprimir
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
