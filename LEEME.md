# Decoración de Haxball en Render (plan gratis)

Corre UNA decoración por servicio. El plan gratis de Render da ~750 horas por mes, o sea alcanza para UN servicio encendido todo el mes.

## 1. Subir esto a GitHub
1. Creá una cuenta en github.com (gratis, sin tarjeta) y un repositorio nuevo, público, llamado `haxball-deco`.
2. En el repositorio: "Add file" → "Upload files" y arrastrá TODO el contenido de esta carpeta (Dockerfile, package.json, server.js y la carpeta deco). Commit.

## 2. Crear el servicio en Render
1. Cuenta en render.com (se puede entrar con GitHub, sin tarjeta).
2. New → Web Service → conectá tu repositorio.
3. Runtime: Docker. Instance Type: Free.
4. En Environment agregá:
   - DECO = 1   (o 2, 3, 4: cuál decoración abrir)
   - TOKEN = (el token, ver paso 3)
5. Create Web Service.

## 3. El token (lo más delicado)
El token vence en pocos minutos. Sacalo en https://www.haxball.com/headlesstoken, pegalo en TOKEN y guardá ENSEGUIDA. Render va a reconstruir el servicio (tarda unos minutos): si el token vence antes de que arranque, la sala no abre y hay que repetir.
Para ver si abrió, entrá a la URL de tu servicio (https://....onrender.com): muestra el estado y el link de la sala.

## 4. Que no se duerma
Render apaga el servicio tras 15 minutos sin visitas. Usá un servicio gratis como uptimerobot.com: creá un monitor HTTP que visite la URL de tu servicio cada 5 minutos.

## Límites conocidos
- Solo entra una decoración por cuenta gratuita (horas del mes).
- Memoria de 512 MB: justa para un solo navegador.
- Si el servicio se reinicia, hay que pegar un token nuevo.
