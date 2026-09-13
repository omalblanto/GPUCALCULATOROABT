import type { GpuSpec, Precision } from "./types";

export const MODEL_SUGGESTIONS = [
  "DeepSeek-R1",
  "DeepSeek-V3",
  "Llama 3.3",
  "Llama 4",
  "Qwen 3.5",
  "Qwen-Coder",
  "Gemma 3",
  "Gemma 4",
  "Mistral Large",
  "Mistral Small",
  "gpt-oss (OpenAI)",
  "GLM-4",
  "GLM-5",
  "Kimi K2",
  "Kimi K3",
  "Phi-3",
  "Phi-4"
];

export const PRECISION_LABELS: Record<Precision, string> = {
  FP16: "FP16 / BF16",
  FP8: "FP8",
  INT8: "INT8",
  INT4: "INT4",
  UNDEFINED: "No definida"
};

/**
 * Lista cerrada de GPUs de datacenter usadas por la calculadora.
 * El motor de sizing solo compara resultados contra estos cuatro productos.
 * Datos técnicos tomados de los Product Guides de Lenovo Press indicados en productUrl.
 */
export const GPU_SPECS: GpuSpec[] = [
  {
    id: "h200-hgx-4",
    name: "ThinkSystem NVIDIA HGX H200 141GB 700W 4-GPU Board",
    shortName: "NVIDIA HGX H200 4-GPU",
    memoryGB: 141,
    bandwidthGBs: 4800,
    powerW: 700,
    minHardwareIncrement: 4,
    maxGpusPerAssumedServer: 4,
    nvlink: true,
    mig: "Hasta 7 MIG por GPU",
    architecture: "Hopper",
    productUrl: "https://lenovopress.lenovo.com/lp1944-nvidia-h200-141gb-gpu",
    formFactor: "HGX / SXM5, board de 4 GPU",
    softwareNote:
      "141 GB HBM3e por GPU, 4.8 TB/s de ancho de banda y NVLink. El producto seleccionado se adquiere como board HGX de 4 GPU."
  },
  {
    id: "rtx-pro-6000-blackwell",
    name: "ThinkSystem NVIDIA RTX PRO 6000 Blackwell Server Edition 96GB PCIe Gen5 Passive GPU",
    shortName: "RTX PRO 6000 Blackwell",
    memoryGB: 96,
    bandwidthGBs: 1597,
    powerW: 600,
    minHardwareIncrement: 1,
    maxGpusPerAssumedServer: 8,
    nvlink: false,
    mig: "Hasta 4 MIG de 24 GB",
    architecture: "Blackwell",
    productUrl:
      "https://lenovopress.lenovo.com/lp2263-thinksystem-nvidia-rtx-pro-6000-blackwell-server-edition-pcie-gen5-gpu",
    formFactor: "PCIe Gen5 x16, dual-slot",
    softwareNote:
      "96 GB GDDR7, hasta 1597 GB/s de ancho de banda, PCIe Gen5 y soporte de hasta 4 instancias MIG de 24 GB."
  },
  {
    id: "l40s",
    name: "ThinkSystem NVIDIA L40S 48GB PCIe Gen4 Passive GPU",
    shortName: "NVIDIA L40S",
    memoryGB: 48,
    bandwidthGBs: 864,
    powerW: 350,
    minHardwareIncrement: 1,
    maxGpusPerAssumedServer: 8,
    nvlink: false,
    mig: "Sin soporte MIG",
    architecture: "Ada Lovelace",
    productUrl:
      "https://lenovopress.lenovo.com/lp1812-nvidia-l40s-48gb-pcie-gen4-passive-gpu",
    formFactor: "PCIe Gen4 x16, dual-slot",
    softwareNote:
      "48 GB GDDR6, 864 GB/s de ancho de banda, PCIe Gen4 x16 y refrigeración pasiva."
  },
  {
    id: "l4",
    name: "ThinkSystem NVIDIA L4 24GB PCIe Gen4 Passive GPU",
    shortName: "NVIDIA L4",
    memoryGB: 24,
    bandwidthGBs: 300,
    powerW: 72,
    minHardwareIncrement: 1,
    maxGpusPerAssumedServer: 8,
    nvlink: false,
    mig: "Sin soporte MIG",
    architecture: "Ada Lovelace",
    productUrl:
      "https://lenovopress.lenovo.com/lp1717-thinksystem-nvidia-l4-24gb-pcie-gen4-passive-gpu",
    formFactor: "PCIe Gen4 x16, low-profile",
    softwareNote:
      "24 GB GDDR6, 300 GB/s de ancho de banda, PCIe Gen4 x16 y consumo máximo de 72 W."
  }
];

export const SOURCES = [
  {
    label: "Lenovo LLM Sizing Guide (LP2130)",
    url: "https://lenovopress.lenovo.com/lp2130-lenovo-llm-sizing-guide"
  },
  {
    label: "Lenovo Press — NVIDIA H200 141GB (LP1944)",
    url: "https://lenovopress.lenovo.com/lp1944-nvidia-h200-141gb-gpu"
  },
  {
    label: "Lenovo Press — RTX PRO 6000 Blackwell 96GB (LP2263)",
    url: "https://lenovopress.lenovo.com/lp2263-thinksystem-nvidia-rtx-pro-6000-blackwell-server-edition-pcie-gen5-gpu"
  },
  {
    label: "Lenovo Press — NVIDIA L40S 48GB (LP1812)",
    url: "https://lenovopress.lenovo.com/lp1812-nvidia-l40s-48gb-pcie-gen4-passive-gpu"
  },
  {
    label: "Lenovo Press — NVIDIA L4 24GB (LP1717)",
    url: "https://lenovopress.lenovo.com/lp1717-thinksystem-nvidia-l4-24gb-pcie-gen4-passive-gpu"
  },
  {
    label: "NVIDIA NIM",
    url: "https://www.nvidia.com/en-us/ai-data-science/products/nim-microservices/"
  },
  {
    label: "NVIDIA AI Enterprise",
    url: "https://www.nvidia.com/en-us/data-center/products/ai-enterprise/"
  },
  {
    label: "NVIDIA Container Toolkit",
    url: "https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/"
  },
  {
    label: "NVIDIA DCGM",
    url: "https://developer.nvidia.com/dcgm"
  },
  {
    label: "NVIDIA NGC Catalog",
    url: "https://catalog.ngc.nvidia.com/"
  }
];
