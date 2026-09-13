# GPU HW Sizer — 4 GPUs Datacenter

Calculadora web de dimensionamiento de memoria GPU para inferencia de modelos LLM.

## GPUs habilitadas

La aplicación trabaja exclusivamente con estas cuatro GPUs:

1. NVIDIA HGX H200 — 141 GB de VRAM por GPU
2. NVIDIA RTX PRO 6000 Blackwell Server Edition — 96 GB
3. NVIDIA L40S — 48 GB
4. NVIDIA L4 — 24 GB

Fuentes de producto:
- https://lenovopress.lenovo.com/lp1944-nvidia-h200-141gb-gpu
- https://lenovopress.lenovo.com/lp2263-thinksystem-nvidia-rtx-pro-6000-blackwell-server-edition-pcie-gen5-gpu
- https://lenovopress.lenovo.com/lp1812-nvidia-l40s-48gb-pcie-gen4-passive-gpu
- https://lenovopress.lenovo.com/lp1717-thinksystem-nvidia-l4-24gb-pcie-gen4-passive-gpu

## Alcance

El cálculo utiliza:
- Memoria del modelo.
- KV Cache.
- VRAM total.
- Cantidad de GPUs por capacidad de memoria.

La aplicación no calcula SLA, no clasifica automáticamente una GPU como preferida y no utiliza un ranking de rendimiento para decidir el producto.

La GPU y la cantidad final pueden ser seleccionadas por el usuario a partir de las cuatro alternativas habilitadas.

## Fórmula de memoria del modelo

`M_model = parámetros(B) × bytes_por_parámetro × 1.2`

## KV Cache

`M_KV = 2 × concurrencia × tokens × layers × KV_heads × head_dimension × bytes`

## Desarrollo local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Docker

```bash
docker build -t gpu-hw-sizer .
docker run --rm -p 8080:80 gpu-hw-sizer
```

Luego abrir `http://localhost:8080`.

## Estructura

```text
src/
  App.tsx
  data.ts
  main.tsx
  sizing.ts
  styles.css
  types.ts

Dockerfile
nginx.conf
docker-compose.yml
index.html
package.json
vite.config.ts
tsconfig.json
tsconfig.app.json
tsconfig.node.json
```

## Nota

Los resultados son preliminares y deben validarse contra la documentación vigente del modelo, la GPU y la plataforma de servidor antes de definir una configuración final.
