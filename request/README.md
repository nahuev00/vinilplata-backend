# Colección Postman para ERP Gráfica - Backend

Esta colección contiene todos los endpoints disponibles en el backend del sistema ERP Gráfica.

## Instrucciones de uso

1. **Importar la colección en Postman:**
   - Abre Postman
   - Haz clic en "Import" (botón en la esquina superior izquierda)
   - Selecciona el archivo `erp-grafica-backend.postman_collection.json`

2. **Configurar variables de entorno:**
   - La colección incluye una variable `base_url` con valor `http://localhost:4000/api`
   - Puedes crear un entorno en Postman y sobrescribir esta variable si necesitas apuntar a otro servidor

3. **Endpoints disponibles:**

### Health Check

- `GET /api` - Verifica que el servidor esté funcionando

### Materiales

- `GET /api/materials` - Obtiene todos los materiales
- `POST /api/materials` - Crea un nuevo material
- `PUT /api/materials/:id` - Actualiza un material por ID
- `DELETE /api/materials/:id` - Elimina un material por ID

### Usuarios y Estaciones

- `GET /api/users/stations` - Obtiene todas las estaciones (usuarios con rol STATION)
- `POST /api/users/create` - Crea un nuevo usuario
- `POST /api/users/login` - Autentica un usuario
- `POST /api/users/:userId/materials` - Asigna un material a una estación
- `DELETE /api/users/:userId/materials/:materialId` - Remueve un material de una estación

## Notas importantes

- Los IDs en las rutas deben ser números válidos (enteros)
- Para crear/actualizar materiales, el campo `name` debe ser único
- Los roles de usuario pueden ser `ADMIN` o `STATION`
- Para usuarios `ADMIN` se valida la contraseña en login, para `STATION` no es requerida
- Al asignar/remover materiales, ambos IDs (usuario y material) deben existir en la base de datos

## Ejecutar el servidor local

```bash
cd /home/nahuel/dev/erp-grafica/backend
npm run dev
```

El servidor se ejecutará en `http://localhost:4000` por defecto.
