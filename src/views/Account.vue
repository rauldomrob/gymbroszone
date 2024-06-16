<script setup>
/*Imports y declaración de variables.*/
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { supabase, userId, logOut } from '../clients/supabase';
import { disponible, reloadHeader } from "../main";

disponible.value = true;

/*Variables inputs.*/
const fileInput = ref(null);
const gymtagInput = ref(null);
const fecha_nacimientoInput = ref(null);
const nombreInput = ref(null);
const apellidosInput = ref(null);

/*Variables imagen.*/
const hayImagen = ref(false);
const imagenPreview = ref(null);
const fondo_imagen = ref(null);

/*Variables datos.*/
const gymtag = ref('');
const fecha_nacimiento = ref('');
const nombre = ref('');
const apellidos = ref('');


/*Variables PopUp */
const mensajePopUp = ref('');
const mostrarPregunta = ref(false);
const esPredeterminada = ref(true);
const account_container = ref();

const router = useRouter();

let id = ref('');
/*Variables foto perfil.*/
const foto = ref('https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg');
const fotoperfilActual = ref('');

/*Estas variables almacenarán los valores actuales delos datos del usuario.*/
let gymtagActual;
let nombreActual;
let apellidosActual;
let fecha_nacimientoActual;

/*Obtenemos la fecha y la hora.*/
function obtenerFechaYHoraActual() {
  const ahora = new Date();
  const año = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const día = String(ahora.getDate()).padStart(2, '0');
  const horas = String(ahora.getHours()).padStart(2, '0');
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  const segundos = String(ahora.getSeconds()).padStart(2, '0');

  return `${año}-${mes}-${día}_${horas}:${minutos}:${segundos}`;
};


/*Comprobamos el nombre ingresado.*/
function validarNombre() {
  const nombreT = nombre.value.trim();
  if (/^(?!.* {2,})[a-zñáéíóú\s-]{3,14}$/i.test(nombreT)) {
    return true;
  }
  mensaje('El nombre debe contener entre 3 y 14 letras.');
  return false;
}

/*Comprobamos los apellidos ingresados.*/
function validarApellidos() {
  const apellidosT = apellidos.value.trim();
  if (/^(?!.* {2,})[a-zñáéíóú\s-]{3,24}$/i.test(apellidosT)) {
    return true;
  }
  mensaje('Los apellidos deben contener entre 3 y 24 letras.');
  return false;
}

//Comprobamos el GymTag ingresado.
async function validarGymtag() {
  const gymtagMin = gymtag.value.toLowerCase();
  gymtag.value = gymtagMin;
  /*Comprobamos que el tamaño del GymTag sea el deseado.*/
  if (gymtagMin.length < 3 || gymtagMin.length > 14) {
    mensaje('Tu GymTag debe tener entre 3 y 14 caracteres.');
    return false;
  }
  /*Comprobamos que los caracteres ingresados sean válidos.*/
  if (!/^[a-z0-9ñ._]+$/.test(gymtagMin)) {
    mensaje('Tu GymTag solo puede tener letras, números y algunos caracteres especiales.');
    return false;
  }
  /*Comprobamos si el GymTag está disponible.*/
  try {
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('gymtag')
      .eq('gymtag', gymtagMin);

    if (error) throw error;
    /*El gymtag estará en uso si usuarios contiene algún elemento.*/
    if (usuarios.length > 0) {
      mensaje('El GymTag ingresado ya está en uso.');
      return false;
    }
    /*GymTag disponible.*/
    return true;
  } catch (error) {
    mensaje('Hubo un error al verificar el GymTag. Por favor, inténtalo de nuevo.');
    return false;
  }
}

/*Comprobamos si el usuario es mayor de 14 años.*/
function validarEdad() {
  var fechaActual = new Date();
  var annoActual = fechaActual.getFullYear();
  const anno = parseInt(fecha_nacimiento.value.split("-")[0], 10);
  if (/^(\d{4})-(\d{2})-(\d{2})$/.test(fecha_nacimiento.value) && (anno >= 1900 && anno <= (annoActual - 14))) {
    return true;
  } else if (anno <= 1900) {
    //Si el usuario ingresa una fecha anterior a 1900 se avisa de que la edad ingresada no es válida.
    mensaje('La edad ingresada no es válida.');
  } else if (anno >= (annoActual - 14)) {
    //Si el usuario no tiene más de 14 años se le avisa que debe tenerlos.
    mensaje('Debes tener más de 14 años.');
  }
  return false;
}

/*Función para avisar al usuario.*/
function mensaje(mensaje) {
  mostrarPregunta.value = true;
  document.body.style.overflow = 'hidden';
  mensajePopUp.value = mensaje;
  nextTick(() => {
    setTimeout(() => {
      const divPregunta = document.querySelector('.div_pregunta');
      if (divPregunta) {
        divPregunta.classList.remove('shrink');
        divPregunta.classList.add('expand');
      }
    }, 5);
  });
}

/*Se avisa al usuario de que ha incluido un archivo inválido o que ha ocurrido algún error al guardar la imagen o la publicación.*/
function avisoImagen(mensaje) {
  mostrarPregunta.value = true;
  document.body.style.overflow = 'hidden';
  mensajePopUp.value = mensaje;
  nextTick(() => {
    setTimeout(() => {
      const divPregunta = document.querySelector('.div_pregunta');
      if (divPregunta) {
        divPregunta.classList.remove('shrink');
        divPregunta.classList.add('expand');
      }
    }, 5);
  });
  /*Quitamos la imagen.*/
  quitar_imagen();
}

/*Función para actualizar la información del usuario.*/
async function guardar() {
  let recargar = false;
  let consulta = {};
  /*Comprobamos el gymtag.*/
  if (gymtagActual !== gymtag.value && await validarGymtag()) {
    consulta.gymtag = gymtag.value;
  } else if (!(gymtagActual === gymtag.value)) {
    gymtag.value = gymtagActual;
    return false;
  }

  /*Comprobamos la fecha de nacimiento.*/
  if (fecha_nacimientoActual !== fecha_nacimiento.value && validarEdad()) {
    consulta.fechanacimiento = fecha_nacimiento.value;
    fecha_nacimientoActual = fecha_nacimiento.value;
  } else if (fecha_nacimientoActual === fecha_nacimiento.value) {
  } else {
    fecha_nacimiento.value = fecha_nacimientoActual;
    return false;
  }

  /*Comprobamos el nombre.*/
  if (nombreActual !== nombre.value && validarNombre()) {
    consulta.nombre = nombre.value;
    nombreActual = nombre.value;
  } else if (nombreActual === nombre.value) {
  } else {
    nombre.value = nombreActual;
    return false;
  }

  /*Comprobamos los apellidos.*/
  if (apellidosActual !== apellidos.value && validarApellidos()) {
    consulta.apellidos = apellidos.value;
    apellidosActual = apellidos.value;
  } else if (apellidosActual === apellidos.value) {
  } else {
    apellidos.value = apellidosActual;
    return false;
  }

  /*Encriptamos el id del usuario para comprobar su carpeta.*/
  const encId = await hashString(id);
  const nombreFoto = await hashString(id + obtenerFechaYHoraActual());
  /*Creamos la carpeta de la imagen de perfil.*/
  const ruta = 'users/' + encId + '/' + nombreFoto;
  /*Si el usuario borra su foto de perfil.*/
  if (foto.value === 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg' && fotoperfilActual.value !== '/predeterminada.png') {
    /*Borramos la foto de perfil.*/
    const { data: dataBorrado, error: errorBorrado } = await supabase.storage
      .from('files')
      .remove([fotoperfilActual.value]);
    /*Avisamos al usuario en caso de error.*/
    if (errorBorrado) {
      mensaje('Ha ocurrido un error al actualizar tu foto de perfil.');
      return false;
    }
    consulta.fotoperfil = '/predeterminada.png';
    fotoperfilActual.value = '/predeterminada.png';
    foto.value = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg';
    recargar = true;
    /*No ha cambiado su foto de perfil anterior.*/
  } else if (foto.value === 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/' + fotoperfilActual.value) {
    /*No ha quitado la foto de perfil predeterminada.*/
  } else if (foto.value === 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg' && fotoperfilActual.value === '/predeterminada.png') {
  } else {
    /*Cambia su foto antigua de perfil por una nueva o añade una nueva quitando así la predeterminada.*/
    if (fotoperfilActual.value !== '/predeterminada.png') {
      let borrar = '';
      const urlBase = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/';
      if (fotoperfilActual.value.startsWith(urlBase)) {
        borrar = fotoperfilActual.value.replace(urlBase, '');
      } else {
        borrar = fotoperfilActual.value
      }
      /*Si tenía una foto de perfil, la eliminamos para poder añadir la nueva.*/
      const { data: dataBorrado, error: errorBorrado } = await supabase.storage
        .from('files')
        .remove([borrar]);
      /*Avisamos al usuario en caso de error.*/
      if (errorBorrado) {
        mensaje('Ha ocurrido un error al actualizar tu foto de perfil.');
        return false;
      }
    }
    /*Subimos la nueva foto de perfil.*/
    const imagen = fileInput.value.files[0];
    const { data: subir, error: errorSubir } = await supabase.storage
      .from('files')
      .upload(ruta, imagen);
    /*Avisamos al usuario en caso de error.*/
    if (errorSubir) {
      mensaje('Ha ocurrido un error al actualizar tu foto de perfil.');
      return false;
    }
    fotoperfilActual.value = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/' + ruta;
    consulta.fotoperfil = ruta;
    recargar = true;
  }
  /*Actualizamos la información del usuario.*/
  if (Object.keys(consulta).length > 0) {
    const { data, error } = await supabase
      .from('usuarios')
      .update(consulta)
      .eq('id', id)
    if (error) {
      mensaje('Ha ocurrido un error al actualizar tu información.');
    } else {
      if (gymtagActual !== gymtag.value) {
        gymtagActual = gymtag.value;
        reloadHeader();
      }
      if (recargar) {
        reloadHeader();
      }
      mensaje('Tu información ha sido actualizada.');
    }
  }
}

/*Función para encriptar cadenas de texto.*/
async function hashString(cadena) {
  const encoder = new TextEncoder();
  const data = encoder.encode(cadena);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/*Para que cuando se haga clic en el preview de la foto se autopulse el input de la foto.*/
function triggerFileInput() {
  fileInput.value.click();
}

/*Para que cuando se haga clic en el div que tapa el icono del calendario, se haga focus en el input de la fecha de nacimiento.*/
function triggerDateInput() {
  fecha_nacimientoInput.value.focus();
}

/*Redirigimos al usuario a home si pulsa el botón de cerrar publicar.*/
function cerrar_mi_cuenta() {
  if (account_container.value) {
    account_container.value.classList.add('slide-down');
  }
  setTimeout(() => {
    // router.push('/');
    router.push({ name: 'profile', params: { gymtag: gymtagActual } });
  }, 200);
}

/*Función para quitar la previsualización de la imagen.*/
function quitar_imagen() {
  hayImagen.value = false;
  esPredeterminada.value = true;
  foto.value = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg';
}

/*Función para resetear el input de la imagen.*/
function resetInput(event) {
  hayImagen.value = false;
  event.target.value = null;
}

/*Función para comprobar la imagen.*/
function comprobarImagen(event) {
  const file = event.target.files[0];
  /*Comprobamos que haya un archivo*/
  if (!file) return;

  /*Comprobación del tipo de archivo*/
  if (!file.type.startsWith('image/')) {
    /*Avisamos al usuario en caso de error.*/
    avisoImagen('Por favor, selecciona una imagen válida.');
    /*Limpiamos el input si el archivo no es una imagen.*/
    event.target.value = '';
    return;
  }
  /*Máximo 4MB*/
  const tamMax = 4 * 1024 * 1024;
  if (file.size > tamMax) {
    /*Avisamos al usuario en caso de error.*/
    avisoImagen('El archivo supera el tamaño máximo permitido, 4 MB.');
    /*Limpiamos el input si el archivo es demasiado grande.*/
    event.target.value = '';
    return;
  }
  /* Verificar la proporción de la imagen */
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const ratio = width / height;
      if (ratio < 0.33 || ratio > 3) {
        /* Avisamos al usuario si la proporción no es aceptable */
        avisoImagen('Las proporciones de la imágenes no son válidas.');
        /* Limpiamos el input si la proporción no es aceptable */
        event.target.value = '';
        return;
      }
      /* Llamamos a la función para mostrar la previsualización de la imagen si todo es correcto */
      mostrarImagen(file);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

/*Función para mostrar la previsualización de la imagen.*/
function mostrarImagen(file) {
  hayImagen.value = true;
  const reader = new FileReader();
  reader.onload = (e) => {
    foto.value = e.target.result;
    esPredeterminada.value = false;
  };
  reader.readAsDataURL(file);
}

/*Cuando carga, obtenemos los datos del usuarios para mostrarlos.*/
onMounted(async () => {
  /*Muestro el mensaje que se debe mostrar si se ha actualizado el gymtag.*/
  if (localStorage.getItem('showMessage') === 'true') {
    mensaje('Tu información ha sido actualizada.');
    localStorage.removeItem('showMessage');
  }
  id = userId.value;
  const { data, error } = await supabase
    .from('usuarios')
    .select('gymtag, nombre, apellidos, fechanacimiento, fotoperfil')
    .eq('id', id);
  if (error) {
    /*Si ocurre un error avisamos al usuario y colocamos en la previsualización de la foto de perfil la imagen pfotoperfilActualreredeterminada.*/
    mensaje('Hubo un error al cargar tu información.');
    foto.value = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg';
    esPredeterminada.value = true;
  } else {
    /*Si no hay error, guardamos los datos en variables para luego operar con ellos.*/
    gymtagActual = data[0].gymtag;
    fecha_nacimientoActual = data[0].fechanacimiento;
    nombreActual = data[0].nombre;
    apellidosActual = data[0].apellidos;
    fotoperfilActual.value = data[0].fotoperfil;

    /*Colocamos los datos en los inputs.*/
    gymtag.value = data[0].gymtag;
    fecha_nacimiento.value = data[0].fechanacimiento;
    nombre.value = data[0].nombre;
    apellidos.value = data[0].apellidos;

    /*Si la ruta de la foto de perfil es la predeterminada, null o empty; mostramos la imagen predeterminada en la previsualización de la foto de perfil.*/
    if (fotoperfilActual.value === '/predeterminada.png' || fotoperfilActual.value === null || fotoperfilActual.value === '') {
      foto.value = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg';
      esPredeterminada.value = true;
    } else {
      /*De lo contrario mostramos la foto de perfil actual del usuario.*/
      foto.value = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/' + fotoperfilActual.value;
      esPredeterminada.value = false;
    }
  }
});

/*Se muestra el PopUp de confirmación para eliminar la foto de perfil.*/
function confirmacion() {
  if (!esPredeterminada.value) {
    mostrarPregunta.value = true;
    document.body.style.overflow = 'hidden';
    mensajePopUp.value = '¿Quieres eliminar tu foto de perfil?';
    nextTick(() => {
      setTimeout(() => {
        const divPregunta = document.querySelector('.div_pregunta');
        if (divPregunta) {
          divPregunta.classList.remove('shrink');
          divPregunta.classList.add('expand');
        }
      }, 5);
    });
  }
}

/*El usuario confirma la eliminación de la foto de perfil.*/
function confirmar() {
  const divPregunta = document.querySelector('.div_pregunta');
  if (divPregunta) {
    divPregunta.classList.remove('expand');
    divPregunta.classList.add('shrink');
    setTimeout(() => {
      mostrarPregunta.value = '';
      document.body.style.overflow = '';
      mensajePopUp.value = '';
    }, 250);
  }
  quitar_imagen();
}

/*El usuario cancela la eliminación de la foto de perfil.*/
function cancelar() {
  const divPregunta = document.querySelector('.div_pregunta');
  if (divPregunta) {
    divPregunta.classList.remove('expand');
    divPregunta.classList.add('shrink');
    setTimeout(() => {
      mostrarPregunta.value = false;
      document.body.style.overflow = '';
      mensajePopUp.value = '';
    }, 250);
  }
}

/*Función para ocultar el PopUp.*/
function cerrarSes() {
  const divPregunta = document.querySelector('.div_pregunta');
  if (divPregunta) {
    divPregunta.classList.remove('expand');
    divPregunta.classList.add('shrink');
    setTimeout(() => {
      mostrarPregunta.value = false;
      document.body.style.overflow = '';
      mensajePopUp.value = '';
    }, 250);
  }
  logOut();
}

/*Función para mostrar el PopUp para cerrar sesión.*/
function cerrarSesion() {
  mostrarPregunta.value = true;
  document.body.style.overflow = 'hidden';
  mensajePopUp.value = '¿Estás seguro que deseas cerrar sesión?';
  nextTick(() => {
    setTimeout(() => {
      const divPregunta = document.querySelector('.div_pregunta');
      if (divPregunta) {
        divPregunta.classList.remove('shrink');
        divPregunta.classList.add('expand');
      }
    }, 5);
  });
}
</script>
<template>
  <div class="todo_account">
    <div v-if="mostrarPregunta" class="todo_mostrar_pregunta" @click="cancelar">
      <div class="div_pregunta div_pregunta_inicio" @click.stop>
        <div class="pregunta">{{ mensajePopUp }}</div>
        <div class="botones_pregunta">
          <button v-if="mensajePopUp != '¿Quieres eliminar tu foto de perfil?' && mensajePopUp != '¿Estás seguro que deseas cerrar sesión?'" @click="cancelar">Aceptar</button>
          <button v-if="mensajePopUp == '¿Quieres eliminar tu foto de perfil?'" @click="confirmar">Eliminar</button>
          <button v-if="mensajePopUp == '¿Quieres eliminar tu foto de perfil?'" @click="cancelar">Cancelar</button>
          <button class="boton_esp" v-if="mensajePopUp == '¿Estás seguro que deseas cerrar sesión?'"
            @click="cerrarSes">Si</button>
          <button class="boton_esp" v-if="mensajePopUp == '¿Estás seguro que deseas cerrar sesión?'"
            @click="cancelar">No</button>
        </div>
      </div>
    </div>
    <div class="account_container" ref="account_container">
      <div class="titulo_account">
        <div class="cerrar_sesion_arriba tooltip" @click="cerrarSesion">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path
              d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
          </svg>
          <div class="tooltiptext">Pulsa para cerrar sesión</div>
        </div>
        <div class="cerrar_account">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" @click="cerrar_mi_cuenta">
            <path
              d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z">
            </path>
          </svg>
        </div>
      </div>
      <div class="contenido_publicar">
        <div class="div_imagen">
          <div class="prev_imagen" @click="triggerFileInput" ref="fondo_imagen">
            <img id="imagen" ref="imagenPreview" :src="foto" />
          </div>
          <div class="botones_imagen">
            <div class="contenedor_boton contendor_boton1">
              <div class="div_input_imagen">
                <input class="input_file" type="file" ref="fileInput" @change="comprobarImagen" @click="resetInput"
                  accept="image/*" />
                <div class="anadir">
                  <div class="anadir_texto">
                    <button @click="triggerFileInput">
                      Seleccionar imagen
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="contenedor_boton contendor_boton2">
              <div class="div_input_imagen div_quitar_imagen">
                <div class="input_file input_file_eliminar"></div>
                <div class="anadir quitar">
                  <div class="boton_quitar_imagen">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="quitar_imagen"
                      @click="confirmacion"
                      :class="{ 'no_permitido': esPredeterminada, 'permitido': !esPredeterminada }">
                      <path
                        d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="editar_datos">
        <div class="fila1">
          <div class="fila_izquierda">
            <div class="contenedor_input">
              <input v-model="gymtag" type="text" class="input" required autocomplete="off" ref="gymtagInput"
                placeholder="Escribe tu GymTag">
              <label class="label">GymTag</label>
            </div>
          </div>
          <div class="fila_derecha">
            <div class="contenedor_input">
              <input v-model="fecha_nacimiento" type="date" class="input" required autocomplete="off"
                ref="fecha_nacimientoInput">
              <label class="label">Fecha de nacimiento</label>
              <div class="tapar" @click="triggerDateInput"></div>
            </div>
          </div>
        </div>
        <div class="fila2">
          <div class="fila_izquierda">
            <div class="contenedor_input">
              <input v-model="nombre" type="text" class="input" required autocomplete="off" ref="nombreInput"
                placeholder="Escribe tu nombre">
              <label class="label">Nombre</label>
            </div>
          </div>
          <div class="fila_derecha">
            <div class="contenedor_input">
              <input v-model="apellidos" type="text" class="input" required autocomplete="off" ref="apellidosInput"
                placeholder="Escribe tus apellidos">
              <label class="label">Apellidos</label>
            </div>
          </div>
        </div>
        <div class="guardar">
          <button class="guardar_boton" @click="guardar">Guardar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tooltip .tooltiptext {
  visibility: hidden;
  width: 180px;
  background-color: var(--very-dark-blue);
  color: #dfe8f8;
  text-align: center;
  border-radius: 5px;
  padding: 10px;
  position: absolute;
  z-index: 1;
  right: -135px;
  bottom: 48px;
  transform: translateX(0);
  opacity: 0;
  transition: opacity 0.3s;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.418);
}

.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}

.tooltip .tooltiptext::after {
  content: "";
  position: absolute;
  top: 38px;
  left: 17px;
  border-width: 8px;
  border-style: solid;
  border-color: var(--very-dark-blue) transparent transparent transparent;
}

.editar_datos {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.cerrar_sesion_arriba {
  position: absolute;
  height: 35px;
  width: 35px;
  top: 10px;
  left: 25px;
  z-index: 10;
  cursor: pointer;
}

.cerrar_sesion_arriba svg path {
  fill: var(--light-blue-text);
  stroke: var(--light-blue-text);
  stroke-width: 1.5px;
}

.cerrar_sesion_arriba:hover svg path,
.cerrar_sesion_arriba:active svg path {
  filter: drop-shadow(0 0 15px rgba(179, 196, 241, 0.76));
}

.boton_esp {
  width: 80px;
}

.editar_datos>div {
  width: 100%;
  height: fit-content;
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-bottom: 70px;
}

.fila_izquierda,
.fila_derecha {
  display: flex;
  justify-content: center;
  width: 48%;
}

.contenedor_input {
  position: relative;
  display: flex;
  width: 70%;
}

.account_container {
  transition: transform 0.25s ease-in-out, background-color 0.25s ease-in-out;
}

.slide-down {
  transform: translateY(100%);
  background-color: black;
}

.input {
  width: 100%;
  height: 45px;
  border: none;
  outline: none;
  padding: 0px 8px;
  border-radius: 2px;
  color: var(--light-blue-text);
  font-size: 18px;
  background-color: var(--blue-inputs);
  box-shadow: 3px 3px 10px rgba(0, 0, 0, 1);
  cursor: pointer;
  border: 2px solid var(--grey-buttons-inputs-border);
}

.input:valid,
.input:focus {
  border: 2px solid var(--grey-buttons-inputs-border);
}

.tapar {
  height: 35px;
  width: 35px;
  position: absolute;
  background-color: var(--blue-inputs);
  top: 5px;
  right: 5px;
  cursor: pointer;
}

.label {
  font-size: 24px;
  padding-left: 1px;
  position: absolute;
  top: 9px;
  transition: 0.3s;
  pointer-events: none;
  transform: translateY(-37px);
  color: var(--light-blue-text);
}

.todo_account {
  background-color: var(--bg-color);
  width: 100vw;
  height: fit-content;
  padding-left: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 80px;
  padding-bottom: 90px;
}

.account_container {
  width: 80%;
  margin-top: 80px;
  height: fit-content;
  background-color: var(--dark-blue);
  max-width: 1176px;
  border: var(--black) 4px solid;
  border-radius: 6px;
  min-width: 761px;
}

.titulo_account {
  display: flex;
  justify-content: end;
  align-items: center;
  width: 98%;
  margin-top: 10px;
  height: 30px;
  position: relative;
}

.cerrar_account {
  cursor: pointer;
  display: none;
}

.cerrar_account svg path {
  fill: var(--light-blue-text);
  stroke: var(--dark-blue);
  stroke-width: 2.5px;
}

.contenido_publicar {
  display: flex;
  flex-direction: column;
  height: calc(100% - 82px);
  width: 100%;
}

.div_imagen {
  width: 100%;
  height: calc(100% + 10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding-top: 0;
  position: relative;
  margin-bottom: 50px;
}

.prev_imagen {
  position: relative;
  width: 350px;
  height: 350px;
  background-color: var(--light-blue-text);
  border-radius: 50%;
  border: 2px solid black;
  box-shadow: 2px 2px 8px var(--very-dark-blue);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: border 0.3s;
}

.prev_imagen:hover,
.prev_imagen:active {
  border: 2px solid rgb(109, 109, 109);
}

.prev_imagen svg {
  width: 40px;
  height: 40px;
  transition: filter 0.3s;
  filter: opacity(0.9);
}

#imagen {
  width: 100%;
  height: 100%;
  object-fit: cover;
  max-width: 100%;
  max-height: 100%;
  border-radius: 50%;
}

.prev_imagen:hover svg,
.prev_imagen:active svg {
  filter: opacity(0.7);
}

.div_pregunta {
  color: var(--light-blue-text);
  background-color: var(--dark-blue);
  padding: 25px 30px;
  border-radius: 5px;
  border: var(--black) 2px solid;
  letter-spacing: 0.5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 120px;
  cursor: default;
  margin-left: 60px;
  transition: transform 0.2s ease-in-out, opacity 0.2s ease-in-out;
}

.div_pregunta_inicio {
  transform: scale(0);
  opacity: 0;
}

.div_pregunta.shrink {
  transform: scale(0);
  opacity: 0;
}

.div_pregunta.expand {
  transform: scale(1);
  opacity: 1;
}

.botones_pregunta {
  width: 100%;
  display: flex;
  justify-content: space-around;
}

.botones_pregunta button {
  font-weight: bold;
  text-decoration: none;
  background-color: #3d5a98;
  color: var(--light-blue-text);
  border: 2px solid var(--black);
  cursor: pointer;
  border-radius: 25px;
  text-align: center;
  transition: border 0.5s;
  padding: 5px 10px;
}

.botones_pregunta button:hover,
.botones_pregunta button:active {
  border-color: #eef2fa81;
}

.no_permitido {
  cursor: not-allowed;
}

.permitido {
  cursor: pointer;
}

.div_contenido {
  width: calc(55% + 2px);
  height: 100%;
}

.fila2 {
  margin-bottom: 60px !important;
}

.guardar {
  margin-top: 5px;
  height: 45px !important;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px !important;
}

.guardar_boton {
  cursor: pointer;
  background-color: var(--blue-buttons);
  width: 27%;
  border: solid var(--black) 2px;
  border-radius: 2px;
  font-size: 18px;
  transition: background-color 0.5s, border 0.5s, color 0.5s;
  height: 100%;
}

.guardar_boton:hover,
.guardar_boton:active {
  background-color: var(--very-dark-blue);
  color: var(--light-blue-text);
  border: 2px solid var(--grey-buttons-inputs-border);
}

.botones_imagen {
  width: 100%;
  height: fit-content;
  display: flex;
  justify-content: center;
}

.div_input_imagen {
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  flex-direction: column;
  height: 74px;
  padding-right: 10px;
}

.contenedor_boton {
  width: fit-content;
  display: flex;
  justify-content: end;
}

.div_quitar_imagen {
  padding-left: 10px;
  padding-right: 0;
}

.contendor_boton2 {
  justify-content: start;
  width: 100px;
  margin-left: 30px;
}

#div_boton_quitar_imagen button {
  width: 200px;
}

.quitar {
  padding-top: 3.5px;
}

svg.quitar_imagen {
  width: 30px !important;
  height: 30px !important;
}

.div_quitar_imagen svg path {
  fill: var(--light-blue-text);
  stroke: var(--light-blue-text);
  stroke-width: 1.5px;
}

.input_file {
  width: 20%;
  height: 37px;
  width: 200px;
  border-radius: 2px;
  position: relative;
  top: -1800.5px;
  cursor: pointer;
}

.input_file_eliminar {
  width: 40px;
}

.anadir {
  height: 37px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  top: -18.5px;
  cursor: pointer;
}

.anadir.quitar {
  pointer-events: auto;
  cursor: default;
}

.anadir_texto {
  width: 28%;
  min-width: 275px;
  height: 100%;
  display: flex;
  justify-content: center;
  text-align: center;
}

.boton_quitar_imagen {
  width: 28%;
  min-width: 40px;
  height: 100%;
  display: flex;
  justify-content: center;
  text-align: center;
}

.anadir_texto button {
  padding: 0 19px;
  cursor: pointer;
  background-color: var(--blue-inputs);
  border: solid var(--black) 2px;
  color: var(--light-blue-text);
  border-radius: 2px;
  font-size: 18px;
  transition: background-color 0.5s, border 0.5s, color 0.5s;
}

.anadir_texto button:hover,
.anadir_texto button:active {
  border: 2px solid #eef2fa81;
}

.contenido {
  margin-bottom: 25px;
}

#file-upload-button {
  cursor: pointer !important;
  width: 0 !important;
}

.div_cerrar_sesion {
  margin-top: 70px;
}

.div_cerrar_sesion button {
  padding: 7px 19px;
  cursor: pointer;
  background-color: var(--blue-inputs);
  border: solid var(--black) 2px;
  color: var(--light-blue-text);
  border-radius: 2px;
  font-size: 18px;
  transition: background-color 0.5s, border 0.5s, color 0.5s;
}

.div_cerrar_sesion button:hover,
.div_cerrar_sesion button:active {
  border: 2px solid #eef2fa81;
}

::placeholder {
  color: var(--light-blue-text);
  opacity: 0.8;
  font-size: 17px;
}

::-moz-placeholder {
  color: var(--light-blue-text);
  font-size: 17px;
  opacity: 0.8;
}

:-ms-input-placeholder {
  color: var(--light-blue-text);
  font-size: 17px;
  opacity: 0.8;
}

::-ms-input-placeholder {
  color: var(--light-blue-text);
  font-size: 17px;
  opacity: 0.8;
}

@media(max-width: 1275px) {
  .prev_imagen {
    width: 305px;
    height: 305px;
  }

  .container {
    margin-bottom: 42px;
  }

  .container .label {
    font-size: 22px;
  }

  #tematica {
    height: 40px;
  }
}

@media(max-width: 1040px) {
  .account_container {
    width: 89%;
    min-width: 794px;
  }

  .div_imagen {
    min-width: 367px;
  }

  .div_contenido {
    min-width: 430px;
  }
}

@media(max-width: 875px) {
  .tooltip .tooltiptext {
  visibility: hidden;
  width: 160px;
  background-color: var(--very-dark-blue);
  color: #dfe8f8;
  text-align: center;
  border-radius: 5px;
  padding: 10px;
  position: absolute;
  z-index: 1;
  right: -120px;
  bottom: -49px;
  transform: translateX(0);
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 14px;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.418);
}

.tooltip .tooltiptext::after {
  content: "";
  position: absolute;
  top: -16px;
  left: 17px;
  border-width: 8px;
  border-color: transparent transparent var(--very-dark-blue) transparent;
}

  .cerrar_sesion_arriba {
    height: 30px;
    width: 30px;
    top: 0;
    left: 20px;
  }

  .todo_account {
    margin-top: -6px;
    padding: 0;
    background-color: var(--dark-blue);
  }

  .cerrar_account {
    margin-right: 4px;
  }

  .account_container {
    width: 100%;
    margin-top: 10px;
    max-width: 1126px;
    border: none;
    border-radius: 0;
    min-width: 0;
    min-height: 98vh;
  }

  .contenido_publicar {
    flex-direction: column;
  }

  .div_imagen {
    height: fit-content;
    padding: 50px 0 20px;
  }

  .prev_imagen {
    width: 300px;
    height: 300px;
  }

  .div_contenido {
    width: 100%;
    height: fit-content;
    background-color: var(--dark-blue);
  }

  .div_input_imagen {
    margin-top: 10px;
    height: 60px;
  }

  .container .label {
    font-size: 24px;
  }

  .guardar {
    margin-top: 5px !important;
    margin-bottom: 20px;
  }

  .guardar_boton {
    min-width: 200px
  }

  .anadir {
    top: -13.5px;
  }

  .contenido {
    margin-top: 55px;
  }

  .quitar {
    padding-top: 1px;
  }

  svg.quitar_imagen {
    width: 28px !important;
    height: 28px !important;
  }

  .titulo_account {
    z-index: 400;
    position: fixed;
  }

  .cerrar_account {
    display: flex;
  }

  .input,
  .contenedor_input {
    min-width: 245px;
  }

  .div_pregunta {
    margin-left: 0;
  }
}

@media(max-width: 600px) {
  .account_container {
    padding-bottom: 85px;
  }

  .div_imagen {
    padding-top: 60px;
    margin-bottom: 10px;
  }

  .prev_imagen {
    height: 250px;
    width: 250px;
  }

  .guardar {
    margin-top: -10px !important;
  }

  .guardar_boton {
    min-width: 125px;
  }

  .container .label {
    font-size: 20px;
  }

  .anadir_texto button {
    font-size: 16px;
    width: 200px;
  }

  .contendor_boton1 {
    margin-right: 20px;
    width: 240px;
  }

  .editar_datos>div {
    flex-direction: column;
    margin: 0;
  }

  .editar_datos>div.fila1 {
    margin-top: 25px;
  }

  .fila_izquierda,
  .fila_derecha {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .contenedor_input {
    margin-bottom: 60px;
    min-width: 330px;
  }

  .fila2 {
    margin-bottom: 0 !important;
  }

  .guardar {
    margin-bottom: 0 !important;
  }
}

@media(max-width: 440px) {

  .account_container {
    padding-bottom: 60px;
  }

  .div_contenido {
    min-width: 0;
  }

  .div_imagen {
    margin-top: -10px;
  }

  .prev_imagen {
    height: 225px;
    width: 225px;
  }

  .guardar {
    margin-bottom: 5px;
  }

  .contendor_boton1 {
    width: 230px;
  }
}

@media(max-width: 380px) {
  .div_contenido {
    min-width: 0;
  }

  .div_pregunta.div_pregunta_inicio {
    height: fit-content;
  }

  .prev_imagen {
    height: 250px;
    width: 250px;
  }

  .div_imagen {
    min-width: 0;
  }

  .guardar {
    margin-bottom: 5px;
    margin-top: 60px;
  }

  .contendor_boton1 {
    margin-right: 10px;
    width: 230px;
  }

  .quitar {
    padding-top: 2px;
  }

  svg.quitar_imagen {
    width: 26px !important;
    height: 26px !important;
  }

  .editar_datos>div.fila1 {
    margin-top: 25px;
  }

  .fila_izquierda,
  .fila_derecha {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .contenedor_input {
    margin-bottom: 50px;
    min-width: 270px;
    width: 80%;
  }

  .label {
    font-size: 20px;
    transform: translateY(-32px) translateX(2px)
  }

  .input {
    height: 37px;
    font-size: 17px;
  }

  .tapar {
    height: 30px;
    width: 33px;
    right: 5px;
  }

  ::placeholder {
    font-size: 16px;
    word-spacing: -2px;
  }

  ::-moz-placeholder {
    font-size: 16px;
    word-spacing: -2px;
  }

  :-ms-input-placeholder {
    font-size: 16px;
    word-spacing: -2px;
  }

  ::-ms-input-placeholder {
    font-size: 16px;
    word-spacing: -2px;
  }

  .div_pregunta {
    padding: 17px 7px;
    margin-left: 0;
    height: 104px;
  }

  .pregunta {
    text-align: center;
    margin-bottom: 20px;
    width: 90%;
  }
}

@media(max-width: 350px) {
  .contenedor_boton.contendor_boton1 {
    width: 65%;
  }

  .div_quitar_imagen {
    padding-left: 20px;
  }

  .pregunta {
    width: 70%;
    margin-bottom: 20px
  }

  .div_pregunta {
    height: 120px;
    width: 75%;
    min-width: 235px;
  }

  .botones_pregunta {
    width: 100%;
  }
}

@media(max-width: 300px) {

  .prev_imagen {
    height: 220px;
    width: 220px;
  }

  .div_imagen {
    padding-bottom: 10px;
  }

  .contenedor_input {
    margin-bottom: 60px;
    min-width: 220px;
  }

  .input {
    width: 100%;
    min-width: 100%;
  }

  .editar_datos>div>div {
    margin-bottom: -10px;
  }

  .account_container {
    min-height: 98vh;
    padding-bottom: 105px;
  }
}
</style>