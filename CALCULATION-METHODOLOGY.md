# Metodología de cálculo

## 1. Memoria del modelo

La memoria de los pesos se estima como:

`M_model = P × Z × 1.2`

Donde:
- `P`: parámetros del modelo expresados en billones.
- `Z`: bytes por parámetro según precisión.
- `1.2`: overhead utilizado por la metodología de sizing.

Valores utilizados:
- FP16/BF16: 2 bytes.
- FP8: 1 byte.
- INT8: 1 byte.
- INT4: 0.5 bytes.

## 2. KV Cache

`M_KV = 2 × C × T × L × KVH × D × Z`

Donde:
- `C`: solicitudes/usuarios concurrentes utilizados para el cálculo.
- `T`: input + output en tokens.
- `L`: número de layers.
- `KVH`: KV heads.
- `D`: head dimension.
- `Z`: bytes de la precisión del KV Cache.

## 3. VRAM total

`VRAM_total = M_model + M_KV`

## 4. Número de GPUs

Para cada una de las cuatro GPUs habilitadas:

`GPU_count = ceil(VRAM_total / VRAM_GPU)`

Para el producto HGX H200 de 4 GPU, la configuración física se redondea al incremento de cuatro tarjetas correspondiente al board seleccionado.

## 5. Selección del usuario

El motor muestra las cuatro alternativas y su mínimo por memoria. No determina automáticamente una GPU preferida. El usuario puede seleccionar el tipo de GPU y ajustar la cantidad final.

## GPUs incluidas

- H200 141 GB
- RTX PRO 6000 Blackwell 96 GB
- L40S 48 GB
- L4 24 GB

Referencia principal de metodología:
https://lenovopress.lenovo.com/lp2130-lenovo-llm-sizing-guide
