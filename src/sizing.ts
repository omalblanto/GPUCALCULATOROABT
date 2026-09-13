import { GPU_SPECS } from "./data";
import type {
  GpuSizingResult,
  ModelArchitecture,
  Precision,
  SizingInputs,
  SizingResult
} from "./types";

const GB = 1_000_000_000;

// Bytes por parámetro conforme a la precisión seleccionada.
const PRECISION_BYTES: Record<Precision, number> = {
  FP16: 2,
  FP8: 1,
  INT8: 1,
  INT4: 0.5,
  UNDEFINED: 2
};

function positive(value: number, fallback = 1): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

// Llama 3.3 70B conserva el preset documentado en Lenovo LP2130.
// Para otros modelos se mantiene una aproximación por banda hasta que el usuario
// ingrese Layers, KV Heads y Head Dimension desde la configuración oficial.
function resolveArchitecture(inputs: SizingInputs): ModelArchitecture {
  const manual =
    positive(inputs.layers ?? 0, 0) > 0 &&
    positive(inputs.kvHeads ?? 0, 0) > 0 &&
    positive(inputs.headDim ?? 0, 0) > 0;

  if (manual) {
    return {
      layers: inputs.layers!,
      kvHeads: inputs.kvHeads!,
      headDim: inputs.headDim!,
      source: "manual",
      label: "Arquitectura ingresada manualmente"
    };
  }

  const modelLower = inputs.model.toLowerCase();
  if (
    modelLower.includes("llama 3.3") &&
    inputs.parametersB >= 65 &&
    inputs.parametersB <= 75
  ) {
    return {
      layers: 80,
      kvHeads: 8,
      headDim: 128,
      source: "preset",
      label: "Preset Lenovo LP2130 — Llama 3.3 70B"
    };
  }

  const p = inputs.parametersB;
  const band =
    p <= 10
      ? { layers: 32, kvHeads: 8, headDim: 128 }
      : p <= 20
        ? { layers: 40, kvHeads: 8, headDim: 128 }
        : p <= 40
          ? { layers: 60, kvHeads: 8, headDim: 128 }
          : p <= 80
            ? { layers: 80, kvHeads: 8, headDim: 128 }
            : p <= 120
              ? { layers: 96, kvHeads: 8, headDim: 128 }
              : { layers: 120, kvHeads: 8, headDim: 128 };

  return {
    ...band,
    source: "estimated",
    label: "Estimación por banda de parámetros — requiere validación"
  };
}

function roundHardwareCount(count: number, increment: number): number {
  const base = Math.max(1, Math.ceil(count));
  return increment > 1 ? Math.ceil(base / increment) * increment : base;
}

export function calculateSizing(rawInputs: SizingInputs): SizingResult {
  const inputs: SizingInputs = {
    ...rawInputs,
    parametersB: positive(rawInputs.parametersB),
    totalUsers: positive(rawInputs.totalUsers),
    concurrentUsers: positive(rawInputs.concurrentUsers),
    inputTokens: positive(rawInputs.inputTokens),
    outputTokens: positive(rawInputs.outputTokens)
  };

  const effectivePrecision: Precision =
    inputs.precision === "UNDEFINED" ? "FP16" : inputs.precision;
  const precisionWasAssumed = inputs.precision === "UNDEFINED";
  const precisionBytes = PRECISION_BYTES[effectivePrecision];
  const kvPrecision =
    inputs.kvPrecision && inputs.kvPrecision !== "UNDEFINED"
      ? inputs.kvPrecision
      : effectivePrecision;
  const kvBytes = PRECISION_BYTES[kvPrecision];

  const sequenceTokens = inputs.inputTokens + inputs.outputTokens;
  const architecture = resolveArchitecture(inputs);

  // Lenovo LP2130: memoria del modelo = parámetros (billones) × bytes × 1.2.
  const modelMemoryGB = inputs.parametersB * precisionBytes * 1.2;

  // KV cache usando KV Heads directamente:
  // 2 × concurrencia × secuencia × capas × KV Heads × Head Dimension × bytes.
  const kvCacheBytes =
    2 *
    inputs.concurrentUsers *
    sequenceTokens *
    architecture.layers *
    architecture.kvHeads *
    architecture.headDim *
    kvBytes;

  const kvCacheGB = kvCacheBytes / GB;
  const totalVramGB = modelMemoryGB + kvCacheGB;
  const warnings: string[] = [];

  if (precisionWasAssumed) {
    warnings.push(
      "La precisión no fue definida. El cálculo usa FP16/BF16 como supuesto conservador."
    );
  }

  if (architecture.source === "estimated") {
    warnings.push(
      "La arquitectura del modelo fue estimada. Para aumentar la exactitud del KV cache deben ingresarse Layers, KV Heads y Head Dimension desde la configuración oficial del modelo."
    );
  }

  if (inputs.concurrentUsers > inputs.totalUsers) {
    warnings.push(
      "Los usuarios concurrentes superan los usuarios totales. Debe revisarse este dato."
    );
  }

  if (sequenceTokens >= 32_000) {
    warnings.push(
      "El contexto configurado es largo. El KV cache puede convertirse en el principal consumidor de VRAM."
    );
  }

  // GPU_SPECS es una lista cerrada de cuatro GPUs de datacenter:
  // H200 HGX, RTX PRO 6000 Blackwell, L40S y L4.
  const results: GpuSizingResult[] = GPU_SPECS.map((gpu) => {
    const rawCount = totalVramGB / gpu.memoryGB;
    const memoryGpuCount = roundHardwareCount(
      rawCount,
      gpu.minHardwareIncrement
    );

    return {
      gpu,
      memoryGpuCount,
      totalProvisionedVramGB: memoryGpuCount * gpu.memoryGB
    };
  });

  return {
    effectivePrecision,
    precisionWasAssumed,
    precisionBytes,
    sequenceTokens,
    modelMemoryGB,
    kvCacheGB,
    totalVramGB,
    architecture,
    results,
    warnings
  };
}
