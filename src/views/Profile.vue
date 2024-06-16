<script setup>
/*Imports y declaración de variables.*/
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { ref, onMounted, onUnmounted, defineProps, watch, watchEffect } from "vue";
import { useRouter } from 'vue-router';
import { usandoMovil, disponible } from "../main";
import Publicacion from "../components/Publicacion.vue";
import { supabase, userId, userActive } from "../clients/supabase";

const props = defineProps({
  gymtag: {
    type: String
  }
});

const profileId = ref();
const siguiendo = ref();
const perfilPropio = ref();
const editando = ref(false);
const todasPublicaciones = ref();
const cantidadPublicaciones = ref();
const gymTag = ref();
const nombreCompleto = ref();
const numSeguidores = ref();
const numSeguidos = ref();
const fotoPerfil = ref("https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg");
const esPrivado = ref(true)
const router = useRouter();
const edad = ref();
const publicacionesContainer = ref(null);
const mostrarHeaderFooter = ref({});
const windowWidth = ref(window.innerWidth);
const mostrarHeaderFooterGlobal = ref(false);
const isBelowThreshold = ref(window.innerWidth <= 875);

/*Cambio el valor del ancho de la pantalla cuando cambia de tamaño.*/
const updateWidth = () => {
  windowWidth.value = window.innerWidth;
  if (windowWidth.value > 875) {
    isBelowThreshold.value = false;
  } else {
    isBelowThreshold.value = true;
  }
};

/*Observamos los cambios en el gymtag.*/
watch(() => props.gymtag, (newGymtag, oldGymtag) => {
  if (newGymtag !== oldGymtag) {
    mostrarp();
  }
});

/*Observamos el ancho de la pantalla para recargar la página si el usuario la redimensiona.*/
watch(isBelowThreshold, (newVal, oldVal) => {
  if (document.querySelector('.contenido_esp') || document.querySelector('.final')) {
    if (newVal !== oldVal) {
      /*Recargamos la página.*/
      router.go(0);
    }
  }
});

/*Función para mostrar las publicaciones del usuario.*/
async function mostrarp() {
  /*Obtenemos el usuario actual.*/
  const { data: usuario, errorUsuario } = await supabase
    .from('usuarios')
    .select("*")
    .eq('gymtag', props.gymtag);
  if (errorUsuario) {
    return;
  }
  if (usuario.length == 0) {
    router.push('/NotFound');
  }
  /*Mostramos la foto de perfil del usuario.*/
  if (usuario[0].fotoperfil === '/predeterminada.png' || usuario[0].fotoperfil === null || usuario[0].fotoperfil === '') {
    fotoPerfil.value = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg';
  } else {
    /*De lo contrario mostramos la foto de perfil actual del usuario.*/
    fotoPerfil.value = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/' + usuario[0].fotoperfil;
  }
  /*Guardamos los datos del usuario.*/
  gymTag.value = usuario[0].gymtag;
  const nombre = usuario[0].nombre !== null ? usuario[0].nombre : "";
  const apellido = usuario[0].apellidos !== null ? usuario[0].apellidos : "";
  nombreCompleto.value = nombre + " " + apellido;
  profileId.value = usuario[0].id;
  edad.value = calcularEdad(usuario[0].fechanacimiento);

  /*Llamamos a la función de cargar estadísticas.*/
  cargarEstadisticas();

  /*Obtenemos las publicaciones del usuario.*/
  const { data: publicaciones, errorPublicaciones } = await supabase
    .from('publicaciones')
    .select('*')
    .eq('idusuario', usuario[0].id);
  if (errorPublicaciones) {
    return;
  }
  todasPublicaciones.value = publicaciones.reverse();
  cantidadPublicaciones.value = publicaciones.length;

  if (profileId.value == userId.value) {
    perfilPropio.value = true;
  } else {
    perfilPropio.value = false;
  }
  /*Obtenemos si el usuario sigue al usuario del perfil.*/
  const { data: seguidores, errorSeguidores } = await supabase
    .from('seguidores')
    .select('*')
    .eq('idseguidor', userId.value)
    .eq('idseguido', profileId.value);
  if (errorSeguidores) {
    return;
  }

  if (seguidores.length == 0) {
    siguiendo.value = false;
  } else {
    siguiendo.value = true;
  }

  /*Obtenemos los seguidores del usuario.*/
  const { data: seguidoresPerfil, errorSeguidoresPerfil } = await supabase
    .from('seguidores')
    .select('*')
    .eq('idseguido', profileId.value);
  if (errorSeguidoresPerfil) {
    return;
  }
  numSeguidores.value = seguidoresPerfil.length;
  /*Obtenemos los seguidos del usuario.*/
  const { data: seguidosPerfil, errorSeguidosPerfil } = await supabase
    .from('seguidores')
    .select('*')
    .eq('idseguidor', profileId.value);
  if (errorSeguidosPerfil) {
    return;
  }
  numSeguidos.value = seguidosPerfil.length;
}
mostrarp();

disponible.value = true;
const fotoTuPerfilMostrar = ref('https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg');

async function obtenerTuFotoPerfil() {
  if (userActive.value == true) {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select("*")
      .eq('id', userId.value);
    fotoTuPerfilMostrar.value = usuario[0].fotoperfil;
    /*Si la ruta de la foto de perfil es la predeterminada, null o empty; mostramos la imagen predeterminada en la previsualización de la foto de perfil.*/
    if (fotoTuPerfilMostrar.value === '/predeterminada.png' || fotoTuPerfilMostrar.value === null || fotoTuPerfilMostrar.value === '') {
      fotoTuPerfilMostrar.value = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg';
    } else {
      /*De lo contrario mostramos la foto de perfil actual del usuario.*/
      fotoTuPerfilMostrar.value = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/' + fotoTuPerfilMostrar.value;
    }
  }
}
obtenerTuFotoPerfil();

function arriba() {
  window.scrollTo(0, 0);
}

const vista = ref(sessionStorage.getItem("vista") || "Publicaciones");
/*Función para cambiar la vista de publicaciones a estadísticas.*/
function cambiarVista(tipo) {
  editando.value = false
  vista.value = tipo;
  /*Guardamos la vista actual en local.*/
  sessionStorage.setItem("vista", tipo);
}

onMounted(() => {
  /*Si no hay vista almacenada establecemos las publicaciones como principal.*/
  if (!sessionStorage.getItem("vista")) {
    sessionStorage.setItem("vista", "Publicaciones");
  }
  /*Añadimos el evento de escucha de ocultar publicación.*/
  window.addEventListener('ocultar-publicacion', (event) => {
    ocultarPublicacion(event.detail.idPublicacion);
  });
  /*Añadimos el evento de escucha de la redimensión de la pantalla.*/
  window.addEventListener("resize", updateWidth);
  updateWidth();
});

/*Cuando se desmonta eliminamos los eventos de escucha.*/
onUnmounted(() => {
  window.removeEventListener('ocultar-publicacion', (event) => {
    ocultarPublicacion(event.detail.idPublicacion);
  });
  window.removeEventListener("resize", updateWidth);
});

/*Función de ocultar la publicación.*/
function ocultarPublicacion(idPublicacion) {
  const publicacionElement = document.querySelector(`[data-publicacion-id="${idPublicacion}"]`);
  if (publicacionElement) {
    publicacionElement.style.display = 'none';
  }
}

/*Función para seguir al usuario al que estamos viendo el perfil.*/
async function seguir() {
  /*Se sigue al usuario, de manera visual.*/
  siguiendo.value = true;
  numSeguidores.value++;
  /*Comprobamos si el usuario sigue al usuario que quiere seguir.*/
  const { data: seguidores, errorSeguidores } = await supabase
    .from('seguidores')
    .select('*')
    .eq('idseguidor', userId.value)
    .eq('idseguido', profileId.value);
  /*En caso de error no se sigue al usuario, se vuelve al estado visual anterior.*/
  if (errorSeguidores) {
    numSeguidores.value--;
    siguiendo.value = false;
    return;
  }
  /*Se guarda en la tabla seguidores si no existe la relación.*/
  if (seguidores.length == 0) {
    const { error: insertError } = await supabase
      .from('seguidores')
      .insert([{ idseguidor: userId.value, idseguido: profileId.value }]);
    /*En caso de error no se sigue al usuario, se vuelve al estado visual anterior.*/
    if (insertError) {
      numSeguidores.value--;
      siguiendo.value = false;
      return;
    }
  } else {
    numSeguidores.value--;
    siguiendo.value = true;
  }
}

/*Función para dejar de seguir a un usuario.*/
async function dejarSeguir() {
  /*Se deja de seguir al usuario, de manera visual.*/
  siguiendo.value = false;
  numSeguidores.value--;
  /*Hacemos la consulta para eliminarle de seguidor.*/
  const { error: deleteError } = await supabase
    .from('seguidores')
    .delete()
    .eq('idseguidor', userId.value)
    .eq('idseguido', profileId.value);
  /*En caso de error no deja de seguir al usuario, se vuelve al estado visual anterior.*/
  if (deleteError) {
    numSeguidores.value++;
    siguiendo.value = true;
    return;
  }
}

const mensajeAviso = ref(false);
const mostrarAviso = ref();

/*Mensaje aviso.*/
function mensaje(mensaje) {
  mensajeAviso.value = mensaje;
  mostrarAviso.value = true;
}
const { sexo, peso, altura, actividad, resActividad, resIMC, nivelIMC, pesoValido, alturaValida } = {
  sexo: ref(),
  peso: ref(),
  altura: ref(),
  actividad: ref(),
  resActividad: ref(),
  resIMC: ref(),
  nivelIMC: ref(),
  pesoValido: ref(),
  alturaValida: ref()
};

/*Validamos el peso ingresado.*/
const validarPeso = () => {
  const pesoValue = Math.floor(parseFloat(peso.value) * 100) / 100;
  peso.value = Math.floor(parseFloat(peso.value) * 100) / 100;
  if (!isNaN(pesoValue) && pesoValue >= 35 && pesoValue <= 300) {
    /*Si el valor es válido realizamos los cálculos.*/
    pesoValido.value = true;
    calcularIMC();
    calcularCalorias();
    mostrarAviso.value = false;
  } else {
    pesoValido.value = false;
    mensaje('Por favor, ingrese un valor válido para el peso entre 35 y 300 kg (max 2 decimales).'); // Valor no válido
  }
};

/*Validamos la altura ingresada*/
const validarAltura = () => {
  const alturaValue = Math.floor(parseFloat(altura.value) * 1) / 1;
  altura.value = Math.floor(parseFloat(altura.value) * 1) / 1;
  if (!isNaN(alturaValue) && alturaValue >= 120 && alturaValue <= 250) {
    /*Si el valor es válido realizamos los cálculos.*/
    alturaValida.value = true;
    calcularIMC();
    calcularCalorias();
    mostrarAviso.value = false;
  } else {
    alturaValida.value = false;
    mensaje('Por favor, ingrese un valor válido para la altura entre 120 y 250 cm.');
  }
};

const resultado = ref({
  mantenimiento: null,
  superavit: [],
  deficit: []
});

/*Función para cargar las estadísticas del usuario.*/
async function cargarEstadisticas() {
  const { data: estadisticas, errorEstadisticas } = await supabase
    .from('estadisticas')
    .select('*')
    .eq('idusuario', profileId.value);
  if (errorEstadisticas) {
    return;
  }
  esPrivado.value = estadisticas[0].esprivado;
  peso.value = estadisticas[0].pesokg;
  altura.value = estadisticas[0].alturacm;
  sexo.value = estadisticas[0].sexo;
  actividad.value = estadisticas[0].actividad;
  calcularIMC();
  calcularCalorias();
}

/*Función para calcular el IMC del usuario con la información ingresada y mostrar el resultado.*/
function calcularIMC() {
  let alturaMetros = altura.value / 100;
  resIMC.value = parseFloat(peso.value) / (alturaMetros * alturaMetros);

  if (resIMC.value < 16) {
    nivelIMC.value = 'Delgadez severa';
  } else if (resIMC.value >= 16 && resIMC.value < 17) {
    nivelIMC.value = 'Delgadez moderada';
  } else if (resIMC.value >= 17 && resIMC.value < 18.5) {
    nivelIMC.value = 'Delgadez aceptable';
  } else if (resIMC.value >= 18.5 && resIMC.value < 25) {
    nivelIMC.value = 'Peso normal';
  } else if (resIMC.value >= 25 && resIMC.value < 30) {
    nivelIMC.value = 'Sobrepeso';
  } else if (resIMC.value >= 30 && resIMC.value < 35) {
    nivelIMC.value = 'Obesidad clase I';
  } else if (resIMC.value >= 35 && resIMC.value < 40) {
    nivelIMC.value = 'Obesidad clase II';
  } else if (resIMC.value >= 40) {
    nivelIMC.value = 'Obesidad clase III';
  }
}

/*Función para calcular las calorías del usuario con la información ingresada y mostrar el resultado.*/
function calcularCalorias() {
  if (alturaValida.value && pesoValido.value) {
    let tmb;
    if (sexo.value === 'hombre') {
      tmb = 10 * peso.value + 6.25 * altura.value - 5 * edad.value + 5;
    } else {
      tmb = 10 * peso.value + 6.25 * altura.value - 5 * edad.value - 161;
    }
    let factorActividad;
    switch (actividad.value) {
      case 'sedentario':
        factorActividad = 1.2;
        resActividad.value = "Poco o ningún ejercicio"
        break;
      case 'ligero':
        factorActividad = 1.375;
        resActividad.value = "Ejercicio ligero o deportes 1-3 días/semana"
        break;
      case 'moderado':
        resActividad.value = "Ejercicio moderado o deportes 3-5 días/semana"
        factorActividad = 1.55;
        break;
      case 'intenso':
        factorActividad = 1.725;
        resActividad.value = "Ejercicio intenso o deportes 6-7 días/semana"
        break;
      case 'muy_intenso':
        factorActividad = 1.9;
        resActividad.value = "Ejercicio muy intenso o trabajo físico y ejercicio 2 veces/día"
        break;
    }

    let caloriasMantenimiento = tmb * factorActividad;
    resultado.value.mantenimiento = Math.round(caloriasMantenimiento);

    resultado.value.superavit = [
      { nivel: 'Superávit ligero', kcal: Math.round(caloriasMantenimiento * 1.10) },
      { nivel: 'Superávit moderado', kcal: Math.round(caloriasMantenimiento * 1.15) },
      { nivel: 'Superávit agresivo', kcal: Math.round(caloriasMantenimiento * 1.20) },
      { nivel: 'Superávit muy agresivo', kcal: Math.round(caloriasMantenimiento * 1.25) }
    ];

    resultado.value.deficit = [
      { nivel: 'Déficit ligero', kcal: Math.round(caloriasMantenimiento * 0.90) },
      { nivel: 'Déficit moderado', kcal: Math.round(caloriasMantenimiento * 0.80) },
      { nivel: 'Déficit agresivo', kcal: Math.round(caloriasMantenimiento * 0.70) },
      { nivel: 'Déficit muy agresivo', kcal: Math.round(caloriasMantenimiento * 0.60) }
    ];
  }

}

/*Función para cambiar la privacidad de las estadísticas del usuario.*/
async function cambiarPrivacidad(valor) {
  /*Actualizamos la privacidad de manera visual.*/
  esPrivado.value = valor;
  /*Actualizamos la privacidad en la tabla.*/
  const { data, error } = await supabase
    .from('estadisticas')
    .update({ esprivado: esPrivado.value })
    .eq('idusuario', userId.value);
  if (error) {
    /*En caso de error dejamos la privacidad como estaba originalmente.*/
    esPrivado.value = !valor;
    return;
  }
}

/*Función para calcular la edad.*/
function calcularEdad(fechaNacimiento) {
  /*Convertimos la cadena de fecha de nacimiento a un objeto Date.*/
  const fechaNac = new Date(fechaNacimiento);
  const hoy = new Date();
  /*Calculamos la diferencia en años.*/
  let edad = hoy.getFullYear() - fechaNac.getFullYear();
  /*Ajustamos la edad si el cumpleaños de este año no ha sido aún.*/
  const mesActual = hoy.getMonth();
  const diaActual = hoy.getDate();
  const mesNacimiento = fechaNac.getMonth();
  const diaNacimiento = fechaNac.getDate();

  if (mesActual < mesNacimiento || (mesActual === mesNacimiento && diaActual < diaNacimiento)) {
    edad--;
  }
  return edad;
}

const mostrarForm = ref(false);

/*Función para mostrar las estadísticas.*/
function mostrarEditarStats(valor) {
  mostrarForm.value = valor;
}

/*Función para guardar las estadísticas.*/
async function guardarEstadisticas() {
  const { data: estadisticas, errorEstadisticas } = await supabase
    .from('estadisticas')
    .select('*')
    .eq('idusuario', userId.value);
  if (errorEstadisticas) {
    return;
  }
  /*Comprobamos si se ha modificado algún dato.*/
  if ((peso.value == estadisticas[0].pesokg) && (altura.value == estadisticas[0].alturacm) && (sexo.value == estadisticas[0].sexo) && (actividad.value == estadisticas[0].actividad)) {
    mensaje('Debes modificar algún dato para guardar cambios');
    return;
  }
  /*Objeto para realizar la consulta.*/
  let consulta = {};
  if ((peso.value !== null && peso.value !== '') && (altura.value !== null && altura.value !== '') &&
    (sexo.value !== null && sexo.value !== '') && (actividad.value !== null && actividad.value !== '')) {
    if (peso.value != estadisticas[0].pesokg && pesoValido.value) {
      consulta.pesokg = peso.value;
    }
    if (altura.value != estadisticas[0].alturacm && alturaValida.value) {
      consulta.alturacm = altura.value;
    }
    if (sexo.value != estadisticas[0].sexo) {
      consulta.sexo = sexo.value;
    }
    if (actividad.value != estadisticas[0].actividad) {
      consulta.actividad = actividad.value;
    }
  } else {
    mensaje('No puede haber campos vacíos');
    return
  }
  /*Actualizamos la información del usuario.*/
  if (Object.keys(consulta).length > 0) {
    const { data, error } = await supabase
      .from('estadisticas')
      .update(consulta)
      .eq('idusuario', userId.value)
    if (error) {
      mensaje('Ha ocurrido un error al actualizar tu información.');
    } else {

      mensaje('Tu información ha sido actualizada.');
      cargarEstadisticas();
    }
  }
}

/*Observamos los cambios para llamar a las diferentes funciones.*/
watchEffect([sexo, actividad], [calcularCalorias, calcularIMC]);
watch(peso, validarPeso);
watch(altura, validarAltura);

/*Función para mostrar todas las publicaciones de un perfil una debajo de la otra.*/
function mostrarTodoPerfil(id) {
  if (id && windowWidth.value < 875) {
    mostrarHeaderFooter.value[id] = true;
    mostrarHeaderFooterGlobal.value = true;
    if (publicacionesContainer.value) {
      publicacionesContainer.value.style.display = 'flex';
      publicacionesContainer.value.style.flexDirection = 'column';
      publicacionesContainer.value.style.alignItems = 'center';
      publicacionesContainer.value.classList.add('publicaciones_esp');
      const vistaElement = publicacionesContainer.value.querySelector('.vista');
      const targetElement = document.querySelector(`[data-publicacion-id="${id}"]`);
      const contenido = document.querySelector('#contenido');
      const arriba = document.querySelector('.arriba');
      const volver = document.querySelector('.volver');
      if (arriba) {
        arriba.classList.remove('arriba');
        arriba.classList.add('mostrar_arriba');
      }
      if (volver) {
        volver.classList.remove('volver');
        volver.classList.add('mostrar_volver');
      }
      if (contenido) {
        contenido.classList.add('contenido_esp');
      }
      if (vistaElement) {
        vistaElement.classList.add('vista_esp');
      }
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

        const isLastElement = targetElement === targetElement.parentNode.lastElementChild;
        const isFirstElement = targetElement === targetElement.parentNode.firstElementChild;
        let offset;

        if (isFirstElement) {
          offset = 0;
        } else if (isLastElement) {
          offset = 370;
        } else {
          offset = 200;
        }

        setTimeout(() => {
          window.scrollBy({ top: offset, behavior: 'smooth' });
        }, 5);
      }
    }
  }
}

/*Función para mostrar el perfil de manera original.*/
function volver() {
  if (windowWidth.value < 875) {
    mostrarHeaderFooter.value = {};
    mostrarHeaderFooterGlobal.value = false;
    if (publicacionesContainer.value) {
      publicacionesContainer.value.style.display = '';
      publicacionesContainer.value.style.flexDirection = '';
      publicacionesContainer.value.style.alignItems = '';
      publicacionesContainer.value.classList.remove('publicaciones_esp');
      const vistaElement = publicacionesContainer.value.querySelector('.vista');
      const contenido = document.querySelector('#contenido');
      const arriba = document.querySelector('.mostrar_arriba');
      const volver = document.querySelector('.mostrar_volver');
      const infoElement = document.querySelector('#info');
      const botonesElement = document.querySelector('#botones');
      if (infoElement) {
        infoElement.style.display = 'block';
      }
      if (botonesElement) {
        botonesElement.style.display = 'flex';
      }
      if (arriba) {
        arriba.classList.remove('mostrar_arriba');
        arriba.classList.add('arriba');
      }
      if (volver) {
        volver.classList.remove('mostrar_volver');
        volver.classList.add('volver');
      }
      if (contenido) {
        contenido.classList.remove('contenido_esp');
      }
      if (vistaElement) {
        vistaElement.classList.remove('vista_esp');
        vistaElement.style.display = 'grid';
        vistaElement.style.gridTemplateColumns = 'repeat(3, 1fr)';
        vistaElement.style.justifyItems = 'center';
        vistaElement.style.justifyContent = 'center';
        vistaElement.style.paddingBottom = '60px';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
</script>
<template>
  <div class="perfil" :class="{ usandoMovil: usandoMovil }">
    <div id="info">
      <div id="info-top">
        <div class="foto_boton">
          <div class="foto">
            <img :src="fotoPerfil" class="imagen" />
          </div>
          <div class="botones_seguir">
            <button v-if="siguiendo == false && perfilPropio == false" @click="seguir()">Seguir</button>
            <button v-if="siguiendo == true && perfilPropio == false" @click="dejarSeguir()">Siguiendo</button>
          </div>
        </div>
        <div class="informacion">
          <h2 class="gymTag">@{{ gymTag }}</h2>
          <div class="info-basica">
            <div id="seguidores">
              <h2>Seguidores</h2>
              <h3>{{ numSeguidores }}</h3>
            </div>
            <div id="seguidos">
              <h2>Seguidos</h2>
              <h3>{{ numSeguidos }}</h3>
            </div>
            <div id="publicaciones">
              <h2>Posts</h2>
              <h3>{{ cantidadPublicaciones }}</h3>
            </div>
          </div>
          <div class="div-nombre">
            <h2 class="nombre">{{ nombreCompleto }}</h2>
          </div>
        </div>
      </div>
    </div>
    <div id="contenido">
      <div id="botones">
        <button @click="cambiarVista('Publicaciones')"
          :class="{ vistaBoton: vista === 'Publicaciones', vistaNormal: vista !== 'Publicaciones' }">Posts</button>
        <button @click="cambiarVista('Estadisticas')"
          :class="{ vistaBoton: vista === 'Estadisticas', vistaNormal: vista !== 'Estadisticas' }">Estadisticas</button>
      </div>
      <button @click="volver" class="volver"><font-awesome-icon :icon="['fas', 'backward']"
          class="icono_volver" /></button>
      <button @click="arriba" class="arriba"><font-awesome-icon :icon="['fas', 'arrow-up']"
          class="icono_arriba" /></button>
      <div v-if="vista == 'Publicaciones'" id="publicaciones" class="vista" ref="publicacionesContainer">
        <template v-for="publicacion in todasPublicaciones" :key="publicacion">
          <div :data-publicacion-id="publicacion.idpublicacion" class="max_tamano">
            <Publicacion :publicacionUnica="publicacion" :ProfileView="true" :fotoTuPerfilMostrar="fotoTuPerfilMostrar"
              @mostrar-todo-perfil="mostrarTodoPerfil" :mostrarHeaderFooter="mostrarHeaderFooterGlobal" />
          </div>
        </template>
      </div>
      <div v-if="(vista == 'Estadisticas') && (!esPrivado || perfilPropio)" class="estadisticas">
        <div v-if="perfilPropio" class="privacidad">
          <div class="estadisticas-priv" v-if="esPrivado">
            Tus estadísticas son PRIVADAS
            <font-awesome-icon class="candado" @click="cambiarPrivacidad(false)" :icon="['fas', 'lock']" />
          </div>
          <div class="estadisticas-priv" v-if="!esPrivado">
            Tus estadísticas son PÚBLICAS
            <font-awesome-icon class="candado" @click="cambiarPrivacidad(true)" :icon="['fas', 'unlock']" />
          </div>
        </div>
        <button v-if="perfilPropio" @click="mostrarEditarStats(true)" class="btn-editar-stats">Editar
          estadísticas</button>
        <form v-if="perfilPropio && mostrarForm" class="formulario-estadisticas">
          <font-awesome-icon :icon="['fas', 'xmark']" @click="mostrarEditarStats(false)" class="cerrarForm" />
          <div class="edad-sexo">
            <div class="tu-edad datos-stats">
              <label>Tu actividad diaria</label>
              <select class="actividad" v-model="actividad" required>
                <option value="sedentario">Sedentario: poco o ningún ejercicio</option>
                <option value="ligero">Ligero: ejercicio ligero o deportes 1-3 días/semana</option>
                <option value="moderado">Moderado: ejercicio moderado o deportes 3-5 días/semana</option>
                <option value="intenso">Intenso: ejercicio intenso o deportes 6-7 días/semana</option>
                <option value="muy_intenso">Muy intenso: ejercicio muy intenso o trabajo físico y ejercicio 2 veces/día
                </option>
              </select>
            </div>
            <div class="tu-sexo datos-stats">
              <label>Tu Sexo</label>
              <select class="sexo" v-model="sexo" required>
                <option value="hombre">Hombre</option>
                <option value="mujer">Mujer</option>
              </select>
            </div>
          </div>
          <div class="peso-altura">
            <div class="tu-peso datos-stats">
              <label>Tu peso (kg)</label>
              <input type="number" class="peso" v-model="peso" min="30" max="650" step="0.01" required>
            </div>
            <div class="tu-altura datos-stats">
              <label>Tu altura (cm)</label>
              <input type="number" class="altura" v-model="altura" min="30" max="300" step="1" required>
            </div>
          </div>
          <button type="button" @click="guardarEstadisticas()" class="btn-guardar-stats">Guardar</button>
          <div v-if="mostrarAviso" class="mensaje">{{ mensajeAviso }}</div>
        </form>
        <div v-if="sexo && peso && altura && actividad" class="datos-estadisticas">
          <h2>Estadísticas</h2>
          <div class="res-edad-sexo">
            <h3>Edad: {{ edad }} años</h3>
            <h3>Sexo: {{ sexo }}</h3>
          </div>
          <div class="res-altura-peso">
            <h3>Altura: {{ alturaValida !== false ? altura + " cm" : "Valor inválido" }}</h3>
            <h3>Peso: {{ pesoValido !== false ? peso + " kg" : "Valor inválido" }}</h3>
          </div>
          <div class="res-actividad">
            <h3>Ejercicio: {{ resActividad }}</h3>
          </div>
        </div>
        <div v-if="resultado.mantenimiento != null" class="resultados-cal">
          <div class="mant" v-if="resultado.mantenimiento">
            <h3>Calorías para estar en balance energético</h3>
            <p>{{ resultado.mantenimiento }} kcal/día</p>
          </div>
          <div class="def-sup">
            <div class="sup" v-if="resultado.superavit.length > 0">
              <h3>Calorías para estar en superávit calórico</h3>
              <table>
                <tr>
                  <th>Nivel</th>
                  <th>kcal/día</th>
                </tr>
                <tr v-for="nivel in resultado.superavit" :key="nivel.nivel">
                  <td>{{ nivel.nivel }}</td>
                  <td>{{ nivel.kcal }}</td>
                </tr>
              </table>
            </div>
            <div v-if="resultado.deficit.length > 0">
              <h3>Calorías para estar en déficit calórico</h3>
              <table>
                <tr>
                  <th>Nivel</th>
                  <th>kcal/día</th>
                </tr>
                <tr v-for="nivel in resultado.deficit" :key="nivel.nivel">
                  <td>{{ nivel.nivel }}</td>
                  <td>{{ nivel.kcal }}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>
        <div class="resultado-imc">
          <div class="res-imc">
            <h3>IMC: {{ (!isNaN(parseFloat(resIMC)) && resIMC !== null && resIMC !== undefined && nivelIMC) ?
              (parseFloat(resIMC).toFixed(2) + " (" + nivelIMC + ")") : "No disponible" }}</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Clasificación</th>
                <th>IMC</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Delgadez severa</td>
                <td>Menos de 16</td>
              </tr>
              <tr>
                <td>Delgadez moderada</td>
                <td>16 - 16.9</td>
              </tr>
              <tr>
                <td>Delgadez aceptable</td>
                <td>17 - 18.4</td>
              </tr>
              <tr>
                <td>Peso normal</td>
                <td>18.5 - 24.9</td>
              </tr>
              <tr>
                <td>Sobrepeso</td>
                <td>25 - 29.9</td>
              </tr>
              <tr>
                <td>Obesidad clase I</td>
                <td>30 - 34.9</td>
              </tr>
              <tr>
                <td>Obesidad clase II</td>
                <td>35 - 39.9</td>
              </tr>
              <tr>
                <td>Obesidad clase III</td>
                <td>40 o más</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-if="(esPrivado && !perfilPropio) && (vista == 'Estadisticas')" class="perfilPrivado candado_perfil">
        <font-awesome-icon class="candado2" :icon="['fas', 'lock']" />
        Las estadísticas este usuario son privadas
      </div>
      <div v-if="vista == 'Publicaciones' && cantidadPublicaciones < 1" class="perfilPrivado camara_perfil">
        <font-awesome-icon :icon="['fas', 'camera']" class="camara" />
        Todavía no hay publicaciones
      </div>
    </div>
  </div>
</template>
<style scoped>
.camara {
  font-size: 100px;
  border: 2px solid var(--dark-blue);
  border-radius: 50%;
  color: var(--dark-blue);
  padding: 25px;
}

.arriba {
  display: none;
}

.volver {
  display: none;
}

.mostrar_arriba {
  position: fixed;
  bottom: 57px;
  right: 10px;
  display: block;
  width: fit-content;
  color: var(--light-blue-text);
  background-color: transparent;
  border: none;
  font-size: 40px;
  cursor: pointer;
  transition: color 0.3s, filter 0.3;
  z-index: 200;
  height: 53px;
  display: block;
  background-color: #0b1e44;
  border: 2px solid black;
  padding: 4px 6px;
}

.mostrar_volver {
  z-index: 200;
  transition: color 0.3s, filter 0.3;
  cursor: pointer;
  font-size: 35px;
  border: none;
  background-color: transparent;
  color: var(--light-blue-text);
  position: fixed;
  width: fit-content;
  bottom: 57px;
  left: 10px;
  height: 45px;
  display: block;
  background-color: #0b1e44;
  border: 2px solid black;
  padding: 4px;
}

.mostrar_volver .icono_volver {
  transform: translateY(-3px);
}

.mostrar_arriba:hover,
.mostrar_arriba:active,
.mostrar_volver:hover,
.mostrar_volver:active {
  color: white;
  filter: brightness(1.2);
}

.resultado-imc,
.resultados-cal,
.datos-estadisticas {
  border-radius: 8px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.708), 0 0 7px rgba(0, 0, 0, 0.708);
}

.formulario-estadisticas {
  border: 3px solid black;
  border-radius: 8px;
  margin-bottom: 20px;
}

.formulario-estadisticas input {
  outline: none;
}

.perfil {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 60px;
  overflow-y: visible;
}

#info {
  padding-top: 80px;
  background-color: var(--dark-blue);
  min-height: fit-content;
  width: 73%;
  color: var(--light-blue-text);
  font-size: clamp(8px, 4vw, 24px);
  height: fit-content;
}

#info-top {
  display: flex;
  justify-content: center;
  margin: 25px 0 10px;
  gap: 5%;
  height: fit-content;
}

.foto {
  min-width: 150px;
  min-height: 150px;
  width: 20vw;
  height: 20vw;
  max-width: 250px;
  max-height: 250px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.div-nombre {
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  font-size: 25px !important;
}

.imagen {
  border: 2px solid black;
  width: 100%;
  background-color: rgb(0, 0, 0);
  height: 100%;
  object-fit: cover;
  max-width: 100%;
  max-height: 100%;
  border-radius: 50%;
}

.informacion {
  margin-top: 10px;
  width: fit-content;
  max-width: 400px;
}

.nombre {
  font-size: clamp(20px, 4vw, 25px);
  text-align: start;
  padding-bottom: 10px;
}

.max_tamano {
  width: 100%;
}

.info-basica {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(9px, 0.9em, 20px);
  font-weight: bold;
  gap: 5%;
  padding-bottom: 80px;
}

.info-basica div {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 7px;
  width: 33%;
}

#imagen {
  width: 100%;
  height: 100%;
  object-fit: cover;
  max-width: 100%;
  max-height: 100%;
  border-radius: 50%;
}

.gymTag {
  margin-top: 5px;
  margin-bottom: 5px;
  margin-left: -10px;
  font-size: clamp(8px, 1.6em, 40px);
}

.foto_boton {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: fit-content;
}

.botones_seguir {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: fit-content;
  margin-top: 20px;
  margin-bottom: 15px;
}

.botones_seguir button {
  font-weight: bold;
  text-decoration: none;
  background-color: #3d5a98;
  color: var(--light-blue-text);
  border: 2px solid var(--black);
  cursor: pointer;
  border-radius: 25px;
  text-align: center;
  transition: border 0.5s;
  padding: 5px 8px;
  width: 84.44px;
}

.botones_seguir button:hover,
.botones_seguir button:active {
  border-color: #eef2fa81;
}

#contenido {
  width: 73%;
}

#botones {
  width: 100%;
}

.vistaNormal {
  cursor: pointer;
  width: 50%;
  padding: 10px;
  font-weight: bold;
  color: var(--dark-blue);
  background-color: var(--light-blue-text);
  border: 1px solid black;
}

.vistaBoton {
  cursor: pointer;
  width: 50%;
  padding: 10px;
  font-weight: bold;
  color: var(--light-blue-text);
  background-color: var(--blue-inputs);
  border: 1px solid rgb(255, 255, 255);
}

.vista {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  justify-items: center;
  justify-content: center;
  padding-bottom: 60px;
}

#publicacion {
  padding: 0;
}

.estadisticas {
  display: flex;
  flex-direction: column;
}

.privacidad {
  align-self: flex-end;
  display: flex;
  align-items: center;
  margin: 15px;
}

.estadisticas-priv {
  display: flex;
  align-items: center;
  text-decoration: underline;
  text-align: end
}

.candado {
  padding: 5px;
}

.candado:hover {
  cursor: pointer;
}

.formulario-estadisticas {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px;
  background-color: var(--dark-blue);
  color: var(--light-blue-text);
}

.cerrarForm {
  position: absolute;
  top: 10px;
  right: 10px;
}

.cerrarForm:hover {
  cursor: pointer;
}

.btn-editar-stats {
  width: 20%;
  min-width: 150px;
  margin: auto;
  padding: 5px;
  font-weight: bold;
  color: var(--light-blue-text);
  background-color: var(--dark-blue);
  border: 2px solid black;
  margin-bottom: 10px;
}

.btn-editar-stats:hover {
  cursor: pointer;
}

.edad-sexo {
  display: flex;
  justify-content: space-around;
}

.datos-stats {
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: left;
  margin-bottom: 10px;
}

.datos-stats * {
  white-space: nowrap;
  width: 50%;
}

.datos-stats input,
.datos-stats h4,
.datos-stats select {
  margin-top: 5px;
  padding: 5px;
  min-width: 95px;
  border: 2px solid var(--dark-blue);
}

.datos-stats label {
  min-width: 95px;
}

.peso-altura {
  display: flex;
  justify-content: center;
}

.btn-guardar-stats {
  margin: auto;
  margin-top: 20px;
  cursor: pointer;
  background-color: var(--blue-buttons);
  width: 27%;
  min-width: fit-content;
  padding: 5px;
  border: solid var(--black) 2px;
  border-radius: 2px;
  font-size: 18px;
  transition: background-color 0.5s, border 0.5s, color 0.5s;
  height: 100%;
}

.btn-guardar-stats:hover,
.btn-guardar-stats:active {
  background-color: var(--very-dark-blue);
  color: var(--light-blue-text);
  border: 2px solid var(--grey-buttons-inputs-border);
}

.mensaje {
  text-align: center;
  margin-top: 10px;
}

.datos-estadisticas {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 20px;
  border: 3px solid black;
  background-color: #5983df82;

}

.datos-estadisticas h2 {
  width: 100%;
  text-align: center;
  border-bottom: 3px solid black;
  padding: 10px;
}

.res-edad-sexo {
  display: flex;
  width: 100%;
  border-bottom: 2px solid black;
}

.res-edad-sexo :first-child {
  border-right: 2px solid black;
}

.res-edad-sexo * {
  width: 50%;
  padding: 10px;

}

.res-altura-peso {
  display: flex;
  width: 100%;
  border-bottom: 2px solid black;
}

.res-altura-peso :first-child {
  border-right: 2px solid black;
}

.res-altura-peso * {
  width: 50%;
  padding: 10px;
}

.res-actividad {
  padding: 10px;
}

.resultados-cal {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 20px;
  border: 3px solid black;
  background-color: #5983df82;
}

.mant {
  width: 100%;
  text-align: center;
  border-bottom: 2px solid black;
}

.def-sup {
  display: flex;
  width: 100%;
}

.sup {
  border-right: 2px solid black;
}

.def-sup>div {
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.resultados-cal h3 {
  padding: 10px;
  width: 100%;
  border-bottom: 2px solid black;
}

.def-sup h3 {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 65px;
}

.resultados-cal table,
.resultados-cal p {
  padding: 10px;
}

.resultado-imc {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 20px;
  border: 3px solid black;
  background-color: #5983df82;
  margin-bottom: 70px;
}

.res-imc {
  text-align: center;
  width: 100%;
  padding: 10px;
  border-bottom: 3px solid black;
}

.resultado-imc table {
  display: flex;
  width: 60%;
  flex-direction: column;
  align-items: center;
  margin: 20px;
  border: 2px solid black;
}

.resultado-imc table tbody {
  width: 100%;
}

.resultado-imc table thead {
  width: 100%;
}

.resultado-imc table tr {
  width: 100%;
  display: flex;
}

.resultado-imc table thead tr th {
  height: 100%;
  border: 1px solid black;
  border-collapse: collapse;
  padding: 10px;
  width: 50%;
}

.resultado-imc table tr td {
  height: 100%;
  border: 1px solid black;
  border-collapse: collapse;
  padding: 10px;
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.perfilPrivado {
  margin: 30px 5px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: clamp(20px, 2.2vw, 60px);
  gap: 20px;
  color: var(--dark-blue);
  font-weight: bold;
}

.candado_perfil {
  margin-top: 80px;
}

.candado2 {
  color: var(--dark-blue);
  font-size: 110px;
}

@media (min-width: 875px) and (max-width: 1100px) {
  .foto {
    width: 100px;
    height: 100px;
  }

  .gymTag {
    margin-top: 10px;
    margin-left: -10px;
    font-size: clamp(8px, 1.4em, 40px);

  }
}

@media (max-width: 1100px) {
  #forzar-publicacion {
    background-color: var(--black);
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    aspect-ratio: 1;
    position: relative;
    max-height: fit-content;
    border: 1px solid black;
    border-radius: 0;
    margin: 0;
  }

  #forzar-inicial {
    display: flex;
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    height: 100%;
    width: 100%;
  }

  .nombre {
    font-size: clamp(22px, 4vw, 24px);
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .info-basica {
    font-size: clamp(10px, .6em, 40px);
    padding-bottom: 25px;
  }
}

@media (max-width: 875.5px) {
  .perfil {
    margin: 0;
  }

  #info {
    width: 100%;
    padding-top: 60px;
  }

  .vista {
    margin-bottom: 50px;
  }

  #contenido {
    width: 100%;
  }

  .contenido_esp {
    display: flex;
    justify-content: center;
  }

  .gymTag {
    margin-top: 10px;
    margin-left: -10px;
    font-size: clamp(20px, 1.3em, 40px);
  }

  .resultado-imc table {
    width: 100%;
    margin: 0;
    border: 0;
  }

  .publicaciones_esp {
    display: flex;
    flex-direction: column;
    width: 80%;
  }

  .publicaciones_esp {
    margin-left: 0;
    padding-top: 0;
    margin-top: 110px;
    display: flex;
    flex-direction: column;
    width: 80%;
    min-height: 77.9vh;
  }

  .publicaciones_esp .max_tamano {
    width: fit-content;
    min-width: 100%;
    min-height: 693px;
  }

  .publicaciones_esp div {
    margin-left: 0;
    padding-top: 0;
    background-color: #0d285e;
    margin-bottom: 40px;
  }

  .contenido_esp {
    background-color: #0d285e;
  }

  .contenido_esp #forzar-publicacion {
    height: fit-content;
    aspect-ratio: 0;
    border: 2px solid black;
    border-radius: 12px;
    margin: 25px 0 25px 0;
    overflow: hidden;
  }

  .contenido_esp .max_tamano {
    min-height: 0;
    height: fit-content;
    margin-bottom: 10px;
  }

  .vista.publicaciones_esp {
    padding-bottom: 10px;
  }
}

@media (max-width: 625px) {
  .contenido_esp #forzar-publicacion {
    background-color: var(--black);
    aspect-ratio: 0;
    border: 1px solid black;
    border-radius: 0;
    margin: 0;
  }

  .publicacion {
    border-radius: 0;
    margin: 2px;
  }

  #info-top {
    gap: 20px;
  }

  .gymTag {
    margin-left: 7px;
  }

  .info-basica {
    gap: 0px;

  }

  .datos-estadisticas {
    font-size: medium;
  }

  .resultados-cal {
    font-size: medium;
  }

  .def-sup {
    flex-direction: column;
  }

  .def-sup>div {
    width: 100%;
  }

  .def-sup h3 {
    min-height: fit-content;
  }

  .sup {
    border-right: none;
    border-bottom: 2px solid black;
  }

  .publicaciones_esp {
    margin-left: 0;
    padding-top: 30px;
    width: 100%;
  }

  .contenido_esp .max_tamano {
    margin-bottom: 50px;
  }

  .nombre {
    font-size: 18px;
    margin-left: 7px;
  }

  .perfilPrivado {
    margin: 0px 5px 30px;
  }

  .candado_perfil {
    margin-top: 50px;
  }

  .camara_perfil{
    transform: translateY(-60px);
  }

  .camara{
    font-size: 80px;
  }

  .candado2{
    font-size: 90px;
  }
}

@media (max-width: 580px) {
  .informacion {
    max-width: 300px;
  }
}

@media (max-width: 486px) {
  .informacion {
    max-width: 250px;
  }
}

@media (max-width: 450px) {
  .foto {
    min-width: 100px;
    min-height: 100px;
  }
}

@media (max-width: 380px) {
  .informacion {
    max-width: 200px;
  }
}

@media(max-width: 350px) {
  .gymTag {
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .resultado-imc table tr td {
    height: auto;
  }
}


@media (max-width: 325px) {
  #info-top {
    gap: 10px;
  }

  .informacion {
    max-width: 180px;
  }
}

.usandoMovil {
  margin: 0;
}
</style>