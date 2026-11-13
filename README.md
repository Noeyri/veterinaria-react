# veterinaria-react

SPA de gestión veterinaria (dueños, mascotas, citas y servicios) con Vite + React 19 + TypeScript + Bootstrap 5.

## Uso
```bash
npm install
npm start           # levanta el backend protegido y la app
```

También puedes iniciar cada servicio por separado, en dos terminales:

```bash
npm run dev      # inicia la aplicación; abre http://127.0.0.1:5173
npm run api      # inicia el backend protegido en http://127.0.0.1:3001
```

La URL de la API se configura con `VITE_API_URL` (ver `.env.example`).
En desarrollo local, el backend crea estas cuentas de demostración la primera vez que se
inicia (no sobrescribe cuentas existentes):

| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador | `admin` | `admin123` |
| Recepcionista | `recepcionista` | `recepcionista123` |
| Veterinario | `veterinario` | `veterinario123` |

Las contraseñas se guardan como hashes scrypt en `auth-users.json`, archivo local ignorado
por Git. En producción no se crean estas cuentas. Para crear cuentas manualmente, ejecuta
`npm run user:create`; no hay registro público.

Las sesiones usan una cookie HttpOnly de ocho horas. Para producción, sirve la aplicación
por HTTPS (`NODE_ENV=production`) y define `AUTH_ALLOWED_ORIGINS` con los orígenes exactos
del frontend y `HOST=0.0.0.0` si el backend debe aceptar conexiones externas. Configura
estas variables en el entorno del proceso del backend; `.env.example` solo configura Vite.
El almacenamiento de sesiones es en memoria, por lo que reiniciar el backend
cerrará las sesiones activas. La API aplica permisos en servidor: Administración tiene
acceso completo y puede crear, editar y eliminar servicios desde la sección Servicios;
Recepción gestiona dueños, mascotas y citas y consulta el catálogo sin modificarlo; el
Veterinario consulta los datos y solo puede cambiar el estado de una cita.

Ejecuta `npm run test:auth` para validar autenticación y permisos de API.

## Estructura
- `src/context` – `ThemeContext` (tema claro/oscuro) y `SessionContext` (sesión), consumidos con `useContext`
- `backend` – API Express protegida, autenticación de sesión, permisos por rol y alta local de cuentas
- `src/services` – capa de datos: `http.ts` (Axios con cookie y errores normalizados), `alova.ts` (Alova sobre la misma instancia Axios), un servicio por recurso (`getAll`, `getById`, `create`, `update`, `delete` → GET/POST/PUT/DELETE), `authService.ts` y `sistemaService.ts` (promesas locales estables para `use()`)
- `src/hooks` – `useFetch` (GET) y `useMutation` (escrituras) con estados `loading`, `data` y `error`
- `src/components` – Navbar, tarjetas (`PetCard`, `ServiceCard`), formularios, `AsyncState`, `ErrorBoundary`, `AvisosSistema`, `DuenoForm`, `FooterClinica`
- `src/pages` – vistas de la aplicación
- `db.json` – datos activos de la API
- `db.restore.json` – copia de los datos iniciales para restaurar la base

### Restaurar los datos iniciales

La API guarda los cambios en `db.json`. Para volver al conjunto de datos inicial, detén
el backend y copia `db.restore.json` sobre `db.json`. Esto reemplaza todos los cambios
realizados en la base activa.

En PowerShell:

```powershell
Copy-Item db.restore.json db.json -Force
```

En macOS/Linux:

```bash
cp db.restore.json db.json
```

Después, inicia de nuevo el backend con `npm run api` o la aplicación completa con
`npm start`. `db.restore.json` no se modifica cuando se usa la aplicación; conserva la
copia inicial para futuras restauraciones.

## Capa global y datos
- **useContext**: `useTheme()` y `useSession()` evitan el *prop drilling* (Navbar, Inicio, Login los leen directamente).
- **use() + Suspense**: `AvisosSistema` (en Inicio) y `FooterClinica` (en App) leen promesas estables de `sistemaService.ts`; `ErrorBoundary` captura los rechazos.
- **HTTP**: Axios es el cliente compartido para los servicios; `alova.ts` adapta esa misma instancia a Alova. La sección Acerca de muestra una consulta real con `useRequest`.
- **Formularios**: el formulario de servicios lee sus campos con `FormData` al enviar; los formularios existentes mantienen estado controlado. Los formularios permiten crear y editar dueños, mascotas y citas; los listados y detalles permiten eliminarlos. Se bloquea la eliminación de un dueño con mascotas o de una mascota con citas para evitar registros huérfanos. Los hooks `useFetch` / `useMutation` exponen `{ data, loading, error }` y `AsyncState` los pinta.
