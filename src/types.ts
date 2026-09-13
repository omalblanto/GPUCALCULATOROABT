export type Precision = "FP16" | "FP8" | "INT8" | "INT4" | "UNDEFINED";

export interface ModelArchitecture {
  layers: number;
  kvHeads: number;
  headDim: number;
  source: "manual" | "preset" | "estimated";
  label: string;
}

export interface SizingInputs {
  model: string;
  parametersB: number;
  precision: Precision;
  totalUsers: number;
  concurrentUsers: number;
  inputTokens: number;
  outputTokens: number;
  useCase: string;
  layers?: number;
  kvHeads?: number;
  headDim?: number;
  kvPrecision?: Precision;
}

/** Especificación de una de las cuatro GPUs de datacenter habilitadas. */
export interface GpuSpec {
  id: string;
  name: string;
  shortName: string;
  memoryGB: number;
  bandwidthGBs: number;
  powerW: number;
  minHardwareIncrement: number;
  maxGpusPerAssumedServer: number;
  nvlink: boolean;
  mig: string;
  architecture: string;
  productUrl: string;
  formFactor: string;
  softwareNote: string;
}

export interface GpuSizingResult {
  gpu: GpuSpec;
  memoryGpuCount: number;
  totalProvisionedVramGB: number;
}

export interface SizingResult {
  effectivePrecision: Precision;
  precisionWasAssumed: boolean;
  precisionBytes: number;
  sequenceTokens: number;
  modelMemoryGB: number;
  kvCacheGB: number;
  totalVramGB: number;
  architecture: ModelArchitecture;
  results: GpuSizingResult[];
  warnings: string[];
}
