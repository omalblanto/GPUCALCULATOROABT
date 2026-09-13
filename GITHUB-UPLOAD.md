# Archivos para GitHub

Subir a la raíz del repositorio exactamente esta estructura:

```text
src/
  App.tsx
  data.ts
  main.tsx
  sizing.ts
  styles.css
  types.ts
.dockerignore
.gitignore
CALCULATION-METHODOLOGY.md
Dockerfile
LICENSE
README.md
docker-compose.yml
index.html
nginx.conf
package.json
tsconfig.app.json
tsconfig.json
tsconfig.node.json
vite.config.ts
```

## Importante

El repositorio anterior tenía copias antiguas de estos archivos directamente en la raíz:

- App.tsx
- data.ts
- sizing.ts
- styles.css
- types.ts

Esas copias de la raíz deben eliminarse. La aplicación activa debe usar únicamente los archivos ubicados en `src/`.

También pueden eliminarse documentos de actualización de versiones anteriores si ya no se necesitan.
