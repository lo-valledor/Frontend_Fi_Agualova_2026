# Cómo verificar que el GitHub Action funciona

## Destinos de despliegue

| Entorno | Servidor      | Cuándo se ejecuta                    |
|---------|---------------|-------------------------------------|
| **Test**  | 192.168.1.197 | Push a rama `test` (o main/master) |
| **Prod**  | 192.168.1.183 | Ejecución manual (workflow_dispatch) |

---

## 1. Ver que el workflow se disparó

1. En GitHub: **Actions** (pestaña del repo).
2. Workflow **"🚀 CI/CD Frontend"**.
3. Debe aparecer una **nueva ejecución** cada vez que:
   - haces **push** a `test`, `main` o `master`, o
   - abres/actualizas un **pull request**, o
   - ejecutas **manualmente** (Run workflow).

Si no ves ninguna ejecución al hacer push a `test`, revisa que el último push incluya los cambios del workflow (rama `test` en el trigger).

---

## 2. Ver que los jobs pasan

En cada ejecución:

- **CI (Continuous Integration)**: debe terminar en verde (typecheck, lint, tests, build).
- **Deploy Test** (solo en push a test/main/master): build de la imagen Docker; si tienes `DOCKER_USERNAME` y `DOCKER_PASSWORD`, también hace push a Docker Hub.
- **Deploy Prod** (solo manual): build de imagen de producción.

Clic en la ejecución → cada job debe tener un ✓ verde. Si algo falla, entra al job y revisa el **paso** en rojo y los logs.

---

## 3. Revisar el Summary del job

1. Entra a la ejecución del workflow.
2. Abre el job **"🧪 Build & Deploy to Test"** (o el de prod).
3. Arriba verás **Summary** (resumen del job).
4. Ahí se indica:
   - si la imagen se publicó en Docker Hub y los comandos `docker pull`,
   - **servidor TEST: 192.168.1.197** y **PROD: 192.168.1.183** (para desplegar ahí).

---

## 4. Comprobar en el servidor (test o prod)

Los runners de GitHub **no pueden** conectarse a 192.168.1.x (red privada). El despliegue al servidor lo haces tú (o un runner self-hosted en tu red):

1. **Desde una máquina con acceso a la red** (o desde el propio servidor):
   ```bash
   ssh usuario@192.168.1.197   # test
   docker pull lovalledor/enerlova-frontend:test
   # Reiniciar el contenedor (ej. docker-compose up -d o tu método)
   ```

2. Para **prod** (192.168.1.183): mismo flujo con la imagen de producción después de ejecutar el workflow manualmente.

3. **Comprobar en el navegador**:
   - Test: `http://192.168.1.197` (puerto que uses, ej. 80, 3000, etc.)
   - Prod: `http://192.168.1.183`

---

## 5. Ejecutar el workflow a mano (prod)

1. **Actions** → **"🚀 CI/CD Frontend"** → **Run workflow**.
2. Elige la rama (ej. `main`) y **Run workflow**.
3. Se ejecutarán **ci** y **deploy-prod** (build de imagen prod). Luego despliegas en 192.168.1.183 como en el punto 4.

---

## Resumen rápido

| Qué quieres comprobar | Dónde |
|------------------------|--------|
| Que el Action se ejecuta | Actions → nueva run al hacer push a test/main/master |
| Que CI pasa | Run → job "Continuous Integration" en verde |
| Que se construyó la imagen test | Run → job "Build & Deploy to Test" en verde + Summary |
| Dónde desplegar test | 192.168.1.197 (pull imagen y reiniciar contenedor) |
| Dónde desplegar prod | 192.168.1.183 (igual, tras ejecutar workflow manual) |
