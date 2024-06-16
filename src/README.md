# GymBros Zone

GymBros Zone es una red social diseñada específicamente para entusiastas del fitness y la nutrición. Conecta con otros usuarios de gimnasio, comparte fotos e historias de tu progreso, crea publicaciones, establece objetivos o marcas y descubre nuevas dietas y rutinas de ejercicios. La plataforma incluye características únicas como la capacidad de escanear alimentos mediante códigos de barras para obtener información nutricional instantánea.

Este proyecto utiliza Supabase como backend y está construido con Vue.js junto con Ionic para crear una aplicación de red social para usuarios de gimnasio interesados en nutrición y rutinas. 

## IDE Setup Recomendada

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Configuración customizada

See [Vite Configuration Reference](https://vitejs.dev/config/).


## 1. Instalación de Node.js y npm
Si aún no tienes Node.js y npm instalados en tu sistema, sigue estos pasos:

### Windows
Descarga el instalador de Node.js desde la página oficial de Node.js y sigue las instrucciones de instalación.

## 2. Instalación de Ionic y Capacitor
Instala Ionic y Capacitor globalmente usando npm:

```bash
npm install -g @ionic/cli @capacitor/cli
```
Es posible que durante este paso al ejecutar este comando puedan obviarse algunos otros pasos en la instalación como la instalación de Vue.js.

## 3. Clonar el Repositorio y Configuración del Proyecto
Clona este repositorio en tu máquina local:
```bash
git clone <url_del_repositorio>
```
Navega al directorio del proyecto:
```bash
cd nombre_del_proyecto
```
Instala las dependencias del proyecto ejecutando el siguiente comando:
```bash
npm install
```
### Instalación de Vue.js
Si no resulta la instalación con el comando anterior de las dependencias adecuadas según el package del proyecto:
Para instalar Vue.js en tu proyecto, puedes seguir estos pasos:

#### Instalación de Vue.js
Puedes instalar Vue.js utilizando
```bash
npm install -g @vue/cli
```
Este comando instalará globalmente la interfaz de línea de comandos de Vue. Una vez instalado, puedes crear un nuevo proyecto Vue.js ejecutando:

```bash
vue create nombre_del_proyecto
```
Esto iniciará un asistente interactivo que te guiará a través de la configuración de un nuevo proyecto de Vue.js.

#### Instalación de Dependencias del Proyecto
Después de crear un proyecto Vue.js, navega al directorio donde se encuentra e instala las dependencias necesarias ejecutando:

```bash
cd nombre_del_proyecto
npm install
```
Esto instalará todas las dependencias necesarias en el proyecto de Vue.js como Vue Router.

## 4. Instalación y Configuración de Supabase
Instala el cliente de Supabase en tu proyecto ejecutando el siguiente comando:

```bash
npm install @supabase/supabase-js
```
```bash
sh
npm install
```

### Compilar y reiniciar para Desarrollo
```bash
sh
npm run dev
```

### Compilado para Producción
```bash
sh
npm run build
```
### Configuración
Antes de comenzar, asegúrate de tener una cuenta en Supabase y haber creado un proyecto. Necesitarás la URL de la API y la clave de la base de datos para configurar tu aplicación.

### Variables de Entorno (.env)
Crea un archivo .env en el directorio raíz del proyecto y configura las siguientes variables con los valores proporcionados por Supabase:

```bash
VUE_APP_SUPABASE_URL=URL_DE_API
VUE_APP_SUPABASE_KEY=CLAVE_DE_BASE_DE_DATOS
```

Carga las variables de entorno del archivo .env en tu aplicación.


## 5. Instalación de Lectura de código de barras
Para utilizarlo, instálalo como una dependencia:

```bash
npm install html5-qrcode
```

## 6. Instalación de Font Awesome
Para utilizar Font Awesome instalándolo como una dependencia:

```bash
npm install @fortawesome/fontawesome-free
```
Una vez instalado, puedes importar los estilos de Font Awesome en tu aplicación para comenzar a usar los iconos.

En tu archivo de estilos principal:
```bash
@import "~@fortawesome/fontawesome-free/css/all.css";
```

## Uso
Las condiciones en las que esta aplicación podrá utilizarse se describirán en el futuro.

## Contribución
No está contemplada la contribución a este proyecto.

## Licencia
Este proyecto está bajo licencia. Consulta el archivo LICENSE para obtener más detalles.

