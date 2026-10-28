# Guía de Purga de Secretos y Limpieza de Historial Git

Esta guía detalla el procedimiento para eliminar permanentemente los secretos expuestos en commits pasados (`birdify-local/.env`, Google Maps API keys y tokens de Expo) y desindexar carpetas masivas como `node_modules/` de la raíz del repositorio.

> [!WARNING]
> La reescritura de historial modificará los hashes SHA de los commits en todas las ramas. 
> Antes de proceder:
> 1. Asegúrate de que todos los integrantes del equipo hayan sincronizado y guardado sus cambios de trabajo.
> 2. Haz una copia de seguridad local completa de la carpeta `Birdify-1.0/`.
> 3. Una vez ejecutado el comando `git push --force --all`, cada desarrollador deberá volver a clonar el repositorio limpio o rebasar sus ramas.

---

## Paso 1: Desindexar `node_modules/` y archivos `.db` del staging actual

Actualmente hay más de 19 000 archivos de `node_modules` rastreados en la raíz. Para quitarlos de Git sin borrarlos de tu disco duro:

```powershell
# Desde la raíz del repositorio
git rm -r --cached node_modules
git rm --cached BirdifyApp/BirdifyApp.db 2>$null

# Confirmar la eliminación en la rama actual
git commit -m "chore: desindexar node_modules y archivos locales del repositorio"
```

---

## Paso 2: Instalación de `git-filter-repo`

`git-filter-repo` es la herramienta recomendada oficialmente por Git (reemplazo de `git filter-branch` y BFG):

```powershell
pip install git-filter-repo
```

---

## Paso 3: Purgar archivos sensibles de TODO el historial

Ejecuta el siguiente comando en la raíz del repositorio para borrar completamente los archivos sensibles de todos los commits de todas las ramas:

```powershell
# Purgar carpetas y archivos confidenciales
git filter-repo --path birdify-local/.env --path BirdifyApp/BirdifyApp.db --path-glob 'node_modules/*' --invert-paths --force
```

---

## Paso 4: Reemplazar cadenas de texto de API Keys en commits antiguos

Para reemplazar cualquier ocurrencia de las claves antiguas en los mensajes de commit o código histórico, crea un archivo temporal `expressions.txt` fuera del repositorio con los valores comprometidos que vayas a rotar:

```text
<GOOGLE_MAPS_API_KEY_1_COMPROMETIDA>==>ROTATED_GOOGLE_MAPS_KEY_REDACTED
<GOOGLE_MAPS_API_KEY_2_COMPROMETIDA>==>ROTATED_GOOGLE_MAPS_KEY_REDACTED
<EXPO_ACCESS_TOKEN_COMPROMETIDO>==>ROTATED_EXPO_TOKEN_REDACTED
```

Y ejecuta:

```powershell
git filter-repo --replace-text expressions.txt --force
Remove-Item expressions.txt
```

---

## Paso 5: Reconectar el remoto y forzar subida limpia

`git-filter-repo` elimina los remotos por seguridad. Vuelve a agregarlo y sube las ramas limpias:

```powershell
# Reasociar remoto oficial
git remote add origin https://github.com/sasa71928/Birdify-1.0.git

# Subir todas las ramas y tags reescritos
git push origin --force --all
git push origin --force --tags
```

---

## Paso 6: Rotación de Claves (Obligatorio)

Independientemente de la purga, las credenciales expuestas deben ser invalidadas y regeneradas:
1. **Supabase Cloud Dashboard:** En *Settings -> API*, generar nuevo `anon` y `service_role` key si el `JWT_SECRET` fue expuesto.
2. **Expo Dashboard:** En *Settings -> Access Tokens*, revocar el token expuesto previamente y generar uno nuevo.
3. **Google Cloud Console:** En *Credentials*, revocar las API Keys anteriores y restringir la nueva API Key de Google Maps para Android usando el SHA-1 fingerprint del keystore y el paquete `com.jcota_22.BirdifyApp`.
