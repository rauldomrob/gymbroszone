<script setup>
/*Imports necesarios.*/
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { ref, onMounted, onUnmounted, computed, nextTick, watch, defineEmits } from "vue";
import { supabase, userId } from "@/clients/supabase";
import fotoPredeterminada from "../assets/img/foto-predeterminada.avif";
import { useRoute } from 'vue-router';

/*Parámetros necesarios para mostrar publicación.*/
const props = defineProps({
  publicacionUnica: {
    type: Object,
    required: true,
  },
  ProfileView: {
    type: Boolean,
    default: false
  },
  fotoTuPerfilMostrar: {
    type: String,
    required: false
  },
  mostrarHeaderFooter: {
    type: Boolean,
    default: false
  }
});

/*Creación de las variables necesarias.*/
const route = useRoute();

const perfilPropio = ref();
const siguiendo = ref();
const fotoPerfil = ref();

const gymTag = ref();
const foto = ref('');
const windowWidth = ref(window.innerWidth);

const likes = ref({});
const guardados = ref({});
const isProfile = ref(props.ProfileView);

const animatingLike = ref(false);
const animatingLike2 = ref({});
const animatingSave = ref({});
const likeAnimationStyle = ref({ top: '50%', left: '50%' });
const numeroLikes = ref();
const isProcessing = ref(false);

const likeText = computed(() => {
  return numeroLikes.value === 1 ? ' Like' : ' Likes';
});

const deshabilitado = computed(() => comentarioTexto.value.length === 0);
const comentarioTexto = ref('');
const comentarioInput = ref(null);
const comentarios = ref([]);

const mostrarFinal = ref(false);
const contenidoTransform = ref('translateY(0)');

const isCover = ref(true);
const esCover = ref(true);
const tieneLikeInicial = ref(true);
const tieneLikeFinal = ref();
const tieneGuardadoInicial = ref(true);
const tieneGuardadoFinal = ref();

const mostrarPregunta = ref(false);
const mensajePopUp = ref('');
const comentarioIdParaEliminar = ref(null);

const tematica = ref(props.publicacionUnica.tematica);
const descripcion = ref(props.publicacionUnica.contenido);
const mostrarMas = ref(false);
const publicacionId = ref(null);
const emit = defineEmits(['mostrar-todo-perfil']);

const ruta = ref("https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/" + props.publicacionUnica.ruta);
const fotoPerfilMostrada = ref('https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg');

const isProfileRoute = computed(() => {
  return route.name === 'profile';
});

cargarPublicacion();

if (props.publicacionUnica.resolucion == "cover") {
  isCover.value = true;
  esCover.value = true;
} else {
  esCover.value = false;
  if (windowWidth < 1100) {
    isCover.value = false;
  }
}

/*Función para dar formato a la fecha.*/
function formatFecha(fecha) {
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(fecha).toLocaleString('es-ES', options);
}

/*Función para seguir a un usuario.*/
async function seguir() {
  /*Se sigue al usuario, de manera visual.*/
  siguiendo.value = true;
  /*Comprobamos si el usuario sigue al usuario que quiere seguir.*/
  const { data: seguidores, errorSeguidores } = await supabase
    .from('seguidores')
    .select('*')
    .eq('idseguidor', userId.value)
    .eq('idseguido', props.publicacionUnica.idusuario);
  /*En caso de error no se sigue al usuario, se vuelve al estado visual anterior.*/
  if (errorSeguidores) {
    siguiendo.value = false;
    return;
  }
  /*Se guarda en la tabla seguidores si no existe la relación.*/
  if (seguidores.length == 0) {
    const { error: insertError } = await supabase
      .from('seguidores')
      .insert([{ idseguidor: userId.value, idseguido: props.publicacionUnica.idusuario }]);
    /*En caso de error no se sigue al usuario, se vuelve al estado visual anterior.*/
    if (insertError) {
      siguiendo.value = false;
      return;
    }
  } else {
    siguiendo.value = true;
  }
}

/*Función para dejar de seguir a un usuario.*/
async function dejarSeguir() {
  /*Se deja de seguir al usuario, de manera visual.*/
  siguiendo.value = false;
  /*Hacemos la consulta para eliminarle de seguidor.*/
  const { error: deleteError } = await supabase
    .from('seguidores')
    .delete()
    .eq('idseguidor', userId.value)
    .eq('idseguido', props.publicacionUnica.idusuario);
  /*En caso de error no deja de seguir al usuario, se vuelve al estado visual anterior.*/
  if (deleteError) {
    siguiendo.value = true;
    return;
  }
}

/*Función para dar like con doble click a la publicación.*/
function dobleClick(event) {
  const rect = event.target.getBoundingClientRect();
  likeAnimationStyle.value = {
    top: `${event.clientY - rect.top}px`,
    left: `${event.clientX - rect.left}px`,
  };
  /*Mostramos la animación del like con doble click.*/
  if (!animatingLike.value) {
    animatingLike.value = true;
    setTimeout(() => {
      animatingLike.value = false;
    }, 600);
  }
  darLike();
}

/*Función para obtener los comentarios de la publicación que se desea ver en grande.*/
async function obtenerComentarios(idpublicacion) {
  const { data: comentariosData, error } = await supabase
    .from('comentarios')
    .select('*, usuarios(gymtag)')
    .eq('idpublicacion', idpublicacion)
    .order('fechacreacion', { ascending: false });
  if (error) {
    return;
  }
  /*Obtenemos la foto de perfil del usuario al que pertenece cada comentario.*/
  const comentariosConFotoPerfil = await Promise.all(comentariosData.map(async comentario => {
    /*Cogemos la ruta de la foto de perfil del usuario al que pertenece el comentario.*/
    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .select('fotoperfil')
      .eq('id', comentario.idusuario);
    if (usuarioError) {
      console.error('Error al obtener la foto de perfil del usuario:', usuarioError);
      comentario.fotoPerfilComentarioMostrada = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg';
    } else {
      /*Si la ruta de la foto de perfil es la predeterminada, null o empty; mostramos la imagen predeterminada en la previsualización de la foto de perfil.*/
      if (usuarioData[0].fotoperfil === '/predeterminada.png' || usuarioData[0].fotoperfil === null || usuarioData[0].fotoperfil === '') {
        comentario.fotoPerfilComentarioMostrada = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg';
      } else {
        /*De lo contrario mostramos la foto de perfil actual del usuario.*/
        comentario.fotoPerfilComentarioMostrada = `https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/${usuarioData[0].fotoperfil}`;
      }
    }
    return comentario;
  }));
  /*Actualizamos los comentarios con los datos.*/
  comentarios.value = comentariosConFotoPerfil;
}

/*Función para dar like a una publicación.*/
async function darLike() {
  const idpublicacion = props.publicacionUnica.idpublicacion;
  if (likes.value[props.publicacionUnica.idpublicacion]) {
    return;
  }
  animatingLike2.value[props.publicacionUnica.idpublicacion] = true;
  setTimeout(() => animatingLike2.value[props.publicacionUnica.idpublicacion] = false, 600);

  /*Actualizamos el like de manera visual, en caso de error en cualquier consultar, deshacemos esta acción de lo contrario permanece.*/
  likes.value[idpublicacion] = true;
  numeroLikes.value++;
  /*Comprobamos si el usuario ya le había dado like anteriormente a la publicación.*/
  const { data, errorLike } = await supabase
    .from('likes')
    .select('*')
    .eq('idusuario', userId.value)
    .eq('idpublicacion', idpublicacion);
  /*En caso de error no se da like a la publicación, se vuelve al estado visual anterior.*/
  if (errorLike) {
    likes.value[idpublicacion] = false;
    numeroLikes.value--;
    return;
  }
  /*Insertamos el like si el usuario no le había dado like a la publicación anteriormente.*/
  if (data.length == 0) {
    const { error: insertError } = await supabase
      .from('likes')
      .insert([{ idusuario: userId.value, idpublicacion: idpublicacion }]);
    /*En caso de error no se da like a la publicación, se vuelve al estado visual anterior.*/
    if (insertError) {
      likes.value[idpublicacion] = false;
      numeroLikes.value--;
      return;
    }
  } else {
    likes.value[idpublicacion] = true;
  }
}

/*Función para quitar like a la publicación.*/
async function quitarLike() {
  if (isProcessing.value) return;
  const idpublicacion = props.publicacionUnica.idpublicacion;
  isProcessing.value = true;
  /*Se quita el like de la publicación, de manera visual.*/
  likes.value[idpublicacion] = !likes.value[idpublicacion];
  numeroLikes.value--;
  const { data: likeData, error: errorLike } = await supabase
    .from('likes')
    .select('*')
    .eq('idusuario', userId.value)
    .eq('idpublicacion', idpublicacion);
  /*En caso de error no se quita el like a la publicación, se vuelve al estado visual anterior.*/
  if (errorLike) {
    numeroLikes.value++;
    likes.value[idpublicacion] = !likes.value[idpublicacion];
    isProcessing.value = false;
    return;
  }
  /*Hacemos la consulta para quitar el like.*/
  const { error: quitarLikeError } = await supabase
    .from('likes')
    .delete()
    .eq('idusuario', userId.value)
    .eq('idpublicacion', idpublicacion);
  /*En caso de error no se quita el like a la publicación, se vuelve al estado visual anterior.*/
  if (quitarLikeError) {
    numeroLikes.value++;
    likes.value[idpublicacion] = !likes.value[idpublicacion];
    isProcessing.value = false;
    return;
  }
  isProcessing.value = false;
}

/*Función para guardar a una publicación.*/
async function guardar() {
  const idpublicacion = props.publicacionUnica.idpublicacion;
  if (guardados.value[idpublicacion]) return;
  animatingSave.value[idpublicacion] = true;
  setTimeout(() => animatingSave.value[idpublicacion] = false, 400);
  /*Guardamos la publicación de manera visual.*/
  guardados.value[idpublicacion] = true;
  /*Comprobamos si el usuario ha guardado la publicación anteriormente.*/
  const { data, errorGuardado } = await supabase
    .from('guardados')
    .select('*')
    .eq('idusuario', userId.value)
    .eq('idpublicacion', idpublicacion);
  /*En caso de error no se guarda la publicación, se vuelve al estado visual anterior.*/
  if (errorGuardado) {
    guardados.value[idpublicacion] = !guardados.value[idpublicacion];
    return;
  }
  /*Se guarda en la tabla guardados si no se había guardado antes.*/
  if (data.length == 0) {
    const { error: insertError } = await supabase
      .from('guardados')
      .insert([{ idusuario: userId.value, idpublicacion: idpublicacion }]);
    /*En caso de error no se guarda la publicación, se vuelve al estado visual anterior.*/
    if (insertError) {
      guardados.value[idpublicacion] = !guardados.value[idpublicacion];
      return;
    }
  } else {
    guardados.value[idpublicacion] = true;
  }
}

/*Función para quitar el guardado de la publicación.*/
async function eliminarGuardado() {
  const idpublicacion = props.publicacionUnica.idpublicacion;
  /*Se quita el guardado de la publicación, de manera visual.*/
  guardados.value[idpublicacion] = !guardados.value[idpublicacion];
  /*Hacemos la consulta para quitar el guardado.*/
  const { error: quitarGuardadoError } = await supabase
    .from('guardados')
    .delete()
    .eq('idusuario', userId.value)
    .eq('idpublicacion', idpublicacion);
  /*En caso de error no se quita el guardado a la publicación, se vuelve al estado visual anterior.*/
  if (quitarGuardadoError) {
    guardados.value[idpublicacion] = !guardados.value[idpublicacion];
    return;
  }
}

/*Función para establecer una imagen predeterminada en caso de error al mostrar la imagen de la publicación.*/
function comprobarImagen() {
  ruta.value = fotoPredeterminada;
}

/*Función para cargar la publicación.*/
async function cargarPublicacion() {
  /*Obtenemos los datos del usuario para mostrarlos en la publicación.*/
  const { data: usuario, error: errorUsuario } = await supabase
    .from('usuarios')
    .select("*")
    .eq('id', props.publicacionUnica.idusuario);
  if (errorUsuario) {
    return;
  }
  /*Guardamos en las variables los datos del usuario.*/
  gymTag.value = usuario[0].gymtag;
  fotoPerfil.value = usuario[0].fotoperfil;
  /*Si la ruta de la foto de perfil es la predeterminada, null o empty; mostramos la imagen predeterminada en la previsualización de la foto de perfil.*/
  if (fotoPerfil.value === '/predeterminada.png' || fotoPerfil.value === null || fotoPerfil.value === '') {
    fotoPerfilMostrada.value = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg';
  } else {
    /*De lo contrario mostramos la foto de perfil actual del usuario.*/
    fotoPerfilMostrada.value = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/' + fotoPerfil.value;
  }
  /*Comprobamos si la publicación es del usuario que la está visualizando o no.*/
  if (props.publicacionUnica.idusuario === userId.value) {
    perfilPropio.value = true;
  } else {
    /*Si la publicación no es del propio usuario, comprobamos si el usuario sigue al dueño de la publicación.*/
    perfilPropio.value = false;
    const { data: seguidores, error: errorSeguidores } = await supabase
      .from('seguidores')
      .select('*')
      .eq('idseguidor', userId.value)
      .eq('idseguido', props.publicacionUnica.idusuario);
    if (errorSeguidores) {
      return;
    }
    siguiendo.value = seguidores.length !== 0;
  }
  /*Obtenemos si el usuario que está viendo la publicación le ha dado like anteriormente o no.*/
  const { data: likeData, error: errorLike } = await supabase
    .from('likes')
    .select('*')
    .eq('idusuario', userId.value)
    .eq('idpublicacion', props.publicacionUnica.idpublicacion);

  if (errorLike) {
    return;
  }

  likes.value[props.publicacionUnica.idpublicacion] = likeData.length !== 0;
  /*Obtenemos si el usuario que está viendo la publicación la ha guardado anteriormente o no.*/
  const { data: guardadoData, error: errorGuardado } = await supabase
    .from('guardados')
    .select('*')
    .eq('idusuario', userId.value)
    .eq('idpublicacion', props.publicacionUnica.idpublicacion);
  if (errorGuardado) {
    return;
  }
  guardados.value[props.publicacionUnica.idpublicacion] = guardadoData.length !== 0;
  /*Obtenemos la cantidad de likes para mostrarla.*/
  await obtenerCantidadLikes(props.publicacionUnica.idpublicacion);
}

/*Función para obtener la cantidad de likes de la publicación.*/
async function obtenerCantidadLikes(idpublicacion) {
  const { count, error } = await supabase
    .from('likes')
    .select('idpublicacion', { count: 'exact', head: true })
    .eq('idpublicacion', idpublicacion);
  if (error) {
    return;
  }
  /*Actualizamos la variable.*/
  numeroLikes.value = count;
}

/*Función para actualizar el ancho de la pantalla cuando esta se redimensiona.*/
function updateWidth() {
  windowWidth.value = window.innerWidth;
  foto.value.style.cursor = 'pointer';
  if (mostrarFinal.value && windowWidth.value > 875) {
    contenidoTransform.value = 'translateY(0)';
  } else if (mostrarFinal.value && windowWidth.value <= 875) {
    contenidoTransform.value = 'translateY(0)';
  }
}

/*Función para mostrar la publicación que se hace click en grande.*/
async function mostrar(bool) {
  if ((!bool && windowWidth.value > 875) || (bool && windowWidth.value <= 875)) {
    document.body.style.overflow = "hidden";
    mostrarFinal.value = true;
  }
  updateWidth();
  /*Si la pantalla es menor o igual a 875px, se muestran los comentarios desde abajo hacia arriba.*/
  if (windowWidth.value <= 875) {
    await nextTick();
    const contenidoElement = document.querySelector('.contenido');
    if (contenidoElement) {
      contenidoElement.classList.add('no_mostrar');
    }
    setTimeout(() => {
      if (contenidoElement) {
        contenidoElement.classList.add('mostrar');
        contenidoElement.classList.remove('no_mostrar');
      }
    }, 10);
  };
  /*Guardamos si la publicación tiene like o está guardada inicialmente o no para poder eliminarla si corresponde o no en /liked o /saved.*/
  tieneLikeInicial.value = likes.value[props.publicacionUnica.idpublicacion] || false;
  tieneGuardadoInicial.value = guardados.value[props.publicacionUnica.idpublicacion] || false;
  if ((!bool && windowWidth.value > 875) || (bool && windowWidth.value <= 875)) {
    /*Obtenemos los comentarios. */
    await obtenerComentarios(props.publicacionUnica.idpublicacion);
  }
}

/*Función de cerrar la publicación en vista ampliada o comentarios.*/
function cerrar() {
  tieneLikeFinal.value = likes.value[props.publicacionUnica.idpublicacion] || false;
  tieneGuardadoFinal.value = guardados.value[props.publicacionUnica.idpublicacion] || false;

  /*Emitimos un evento global si estamos en /liked y se ha quitado el like que estaba dado originalmente. Tras esto se eliminara de la publicación de la vista.*/
  if (route.path === '/liked' && tieneLikeInicial.value && !tieneLikeFinal.value) {
    window.dispatchEvent(new CustomEvent('ocultar-publicacion', { detail: { idPublicacion: props.publicacionUnica.idpublicacion } }));
  }

  /*Emitimos un evento global si estamos en /saved y se ha quitado el guardado original de la publicación. Tras esto se eliminara de la publicación de la vista.*/
  if (route.path === '/saved' && tieneGuardadoInicial.value !== tieneGuardadoFinal.value) {
    window.dispatchEvent(new CustomEvent('ocultar-publicacion', { detail: { idPublicacion: props.publicacionUnica.idpublicacion } }));
  }

  document.body.style.overflow = "visible";
  /*Si la pantalla es menor o igual a 875px se hace la animación inversa a la de mostrar.*/
  if (windowWidth.value <= 875) {
    const contenidoElement = document.querySelector('.contenido');
    contenidoElement.classList.remove('mostrar');
    contenidoElement.classList.add('no_mostrar');
    setTimeout(() => {
      mostrarFinal.value = false;
      mostrarMas.value = false;
    }, 300);
  } else {
    /*De lo contrario simplemente se oculta.*/
    mostrarFinal.value = false;
    mostrarMas.value = false;
  }
}

/*Función para que ponga el OverFlow en visible.*/
function quitarOverflow() {
  document.body.style.overflow = "visible";
}

/*Función para enfocar el input de comentar.*/
function enfocarInput() {
  comentarioInput.value.focus();
}
/*Función para actualizar comentarios.*/
function actualizarComentario(event) {
  comentarioTexto.value = event.target.value;
}

/*Función para publicar un comentario nuevo.*/
async function publicar() {
  if (!deshabilitado.value) {
    /*Guardamos el comentario ingresado.*/
    const { error } = await supabase
      .from('comentarios')
      .insert([{
        idpublicacion: props.publicacionUnica.idpublicacion,
        idusuario: userId.value,
        comentario: comentarioTexto.value
      }]);

    if (error) {
      console.error("Error al publicar el comentario:", error);
      return;
    }
    comentarioTexto.value = '';
    comentarioInput.value.value = '';
  }
  /*Obtenemos todos los comentarios de nuevo.*/
  await obtenerComentarios(props.publicacionUnica.idpublicacion);
}

/*Se muestra un aviso de de borrar ya sea la publicación o el comentario.*/
function confirmarBorrar(mensaje, comentarioId = null) {
  mostrarPregunta.value = true;
  document.body.style.overflow = 'hidden';
  mensajePopUp.value = mensaje;
  comentarioIdParaEliminar.value = comentarioId;
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

/*Función para eliminar un comentario.*/
async function borrarComentario() {
  const { error } = await supabase
    .from('comentarios')
    .delete()
    .eq('id', comentarioIdParaEliminar.value);
  if (error) {
    return;
  }
  /*Mostramos los comentarios de nuevo.*/
  await obtenerComentarios(props.publicacionUnica.idpublicacion);
  cancelar();
}

/*El usuario confirma la eliminación de la publicación.*/
async function confirmar() {
  const idPublicacion = props.publicacionUnica.idpublicacion;
  const divPregunta = document.querySelector('.div_pregunta');
  /*Se oculta el mensaje de aviso.*/
  if (divPregunta) {
    divPregunta.classList.remove('expand');
    divPregunta.classList.add('shrink');
    setTimeout(() => {
      mostrarPregunta.value = '';
      document.body.style.overflow = '';
      mensajePopUp.value = '';
    }, 250);
  }
  /*Eliminamos la publicación de la tabla.*/
  const { error: deleteError } = await supabase
    .from('publicaciones')
    .delete()
    .eq('idpublicacion', idPublicacion);

  if (deleteError) {
    console.log(deleteError);
    return;
  }
  /*Eliminamos la imagen del storage.*/
  const { error: storageError } = await supabase
    .storage
    .from('files')
    .remove([props.publicacionUnica.ruta]);
  if (storageError) {
    return;
  }
  /*Emitimos un evento global de que se ha eliminado la publicación. Tras esto se eliminara de la publicación de la vista.*/
  window.dispatchEvent(new CustomEvent('ocultar-publicacion', { detail: { idPublicacion: idPublicacion } }));
  /*Cerramos la visualización de la publicación en detalle.*/
  mostrarFinal.value = false;
}

/*El usuario cancela la eliminación del comentario o publicación..*/
function cancelar() {
  const divPregunta = document.querySelector('.div_pregunta');
  if (divPregunta) {
    divPregunta.classList.remove('expand');
    divPregunta.classList.add('shrink');
    setTimeout(() => {
      mostrarPregunta.value = false;
      mensajePopUp.value = '';
    }, 250);
  }
}

/*Cuando se monta añadimos los eventos de escucha para actualizar el ancho de la pantalla y ajustar la altura.*/
onMounted(() => {
  window.addEventListener("resize", updateWidth);
  updateWidth();
  adjustHeights();
  window.addEventListener('resize', adjustHeights);
});

/*Cuando se desmonta eliminamos los eventos de escucha.*/
onUnmounted(() => {
  window.removeEventListener('resize', updateWidth);
  window.removeEventListener('resize', adjustHeights);
});

/*Observamos los divs de temática, descripción y comentarios para ajustar sus alturas.*/
watch([tematica, descripcion, comentarios], adjustHeights);

/*Función para redimensionar la imagen en función de como el usuario la haya subido.*/
function girar_imagen() {
  const imgElement = document.querySelector('.final .imagen img');
  if (imgElement) {
    if (imgElement.classList.contains('cover')) {
      imgElement.classList.remove('cover');
      imgElement.classList.add('normal');
    } else {
      imgElement.classList.remove('normal');
      imgElement.classList.add('cover');
    }
  }
}

/*Función para el botón de mostrar más y mostrar menos en la descripción de la publicación.*/
function toggleVerMas() {
  mostrarMas.value = !mostrarMas.value;
}

/*Función para ajustar la altura de los divs de temática, descripción y comentarios.*/
function adjustHeights() {
  nextTick(() => {
    const tematicaContenidoComentarios = document.querySelector('.tematica_contenido_comentarios');
    const tematicaContenido = document.querySelector('.tematica_contenido');
    const comentarios = document.querySelector('.comentarios');

    if (tematicaContenidoComentarios && tematicaContenido && comentarios) {
      const totalHeight = 380;
      const tematicaContenidoHeight = tematicaContenido.offsetHeight;
      const comentariosHeight = totalHeight - tematicaContenidoHeight;
      comentarios.style.height = `${comentariosHeight}px`;
    }
  });
}

/*Cuando se llama esta función es porque el usuario se encuentra en /profile y la pantalla es menor a 875px.*/
function clickImagen() {
  if (isProfileRoute.value && windowWidth.value < 875) {
    mostrarPublicacionesColumna(props.publicacionUnica.idpublicacion);
  } else {
    mostrar(false);
  }
}

/*Mostraremos las imágenes una debajo de la otra y se ocultarán los divs necesarios.*/
function mostrarPublicacionesColumna(id) {
  if (windowWidth.value < 875) {
    publicacionId.value = id;
    document.getElementById('info').style.display = 'none';
    document.getElementById('botones').style.display = 'none';
    /*Emitimos un evento para poder acceder al id de la publicación pulsada.*/
    emit('mostrar-todo-perfil', id);
  }
}
</script>
<template>
  <div class="publicacion" id="forzar-publicacion">
    <div v-if="mostrarPregunta" class="todo_mostrar_pregunta" @click="cancelar">
      <div class="div_pregunta div_pregunta_inicio" @click.stop>
        <div class="pregunta">{{ mensajePopUp }}</div>
        <div class="botones_pregunta">
          <button v-if="mensajePopUp == '¿Seguro que quieres eliminar esta publicación?'"
            @click="confirmar">Eliminar</button>
          <button v-if="mensajePopUp == '¿Seguro que quieres eliminar esta publicación?'"
            @click="cancelar">Cancelar</button>
          <button class="boton_esp" v-if="mensajePopUp == '¿Seguro que quieres eliminar este comentario?'"
            @click="borrarComentario()">Eliminar</button>
          <button class="boton_esp" v-if="mensajePopUp == '¿Seguro que quieres eliminar este comentario?'"
            @click="cancelar">Cancelar</button>
        </div>
      </div>
    </div>
    <div class="header-publicacion" v-if="(windowWidth <= 875 && (!props.ProfileView || mostrarHeaderFooter))">
      <div class="encabezado encabezado_p">
        <RouterLink v-if="gymTag" :to="{ name: 'profile', params: { gymtag: gymTag } }" class="RouterLink"
          @click="quitarOverflow">
          <div class="foto_gymtag">
            <div class="foto_encabezado">
              <img :src="fotoPerfilMostrada" alt="">
            </div>
            <div class="gymtag_encabezado">
              @{{ gymTag }}
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
    <div @click="mostrar(false)" class="inicial" id="forzar-inicial">
      <img :src="ruta" @error="comprobarImagen"
        :class="[isCover ? 'cover' : 'normal', { 'sin_borde': $route.path.startsWith('/profile/') }]" ref="foto"
        @dblclick="dobleClick" @click="clickImagen" />
      <font-awesome-icon v-if="animatingLike" :icon="['fas', 'heart']" class="like-animation"
        :style="likeAnimationStyle" />
    </div>
    <div class="footer-publicacion" v-if="(windowWidth <= 875 && (!props.ProfileView || mostrarHeaderFooter))">
      <div class="todo_botones_publicacion_grande todo_botones_publicacion_p">
        <div class="botones_publicacion_grande">
          <div class="megusta" v-if="!likes[props.publicacionUnica.idpublicacion]" @click="darLike()">
            <font-awesome-icon :icon="['far', 'heart']" class="heart" />
          </div>
          <div class="megusta" v-if="likes[props.publicacionUnica.idpublicacion]" @click="quitarLike">
            <font-awesome-icon :icon="['fas', 'heart']" class="heart rojo"
              :class="{ 'like-animation2': animatingLike2[props.publicacionUnica.idpublicacion] }" />
          </div>
          <div class="guardar" v-if="!guardados[props.publicacionUnica.idpublicacion]" @click="guardar">
            <font-awesome-icon :icon="['far', 'bookmark']" class="save"
              :class="{ 'save-animation': animatingSave[props.publicacionUnica.idpublicacion] }" />
          </div>
          <div class="guardar" v-if="guardados[props.publicacionUnica.idpublicacion]" @click="eliminarGuardado">
            <font-awesome-icon :icon="['fas', 'bookmark']" class="save save_dorado"
              :class="{ 'save-animation': animatingSave[props.publicacionUnica.idpublicacion] }" />
          </div>
          <div class="comentar" @click="mostrar(true)" @click.stop>
            <font-awesome-icon :icon="['far', 'comment']" class="comment" />
          </div>
        </div>
        <div class="likes_pequeno">
          {{ numeroLikes }} {{ likeText }}
        </div>
        <div v-if="tematica" class="descripcion_foto">
          {{ tematica }}
        </div>
      </div>
    </div>
    <div class="final" v-if="mostrarFinal && (!isProfileRoute || windowWidth >= 0)" @click="cerrar">
      <div class="contenido" @click.stop>
        <div class="imagen">
          <img :src="ruta" @dblclick="dobleClick" class="cover" />
          <font-awesome-icon v-if="animatingLike" :icon="['fas', 'heart']" class="like-animation"
            :style="likeAnimationStyle" />
          <div class="div_girar_imagen" ref="div_girar_imagen" v-if="!esCover">
            <svg width="600px" height="600px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
              class="girar_imagen" @click="girar_imagen" @click.stop>
              <g id="Arrow / Expand">
                <path id="Vector" d="M10 19H5V14M14 5H19V10" stroke="#000000" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </g>
            </svg>
          </div>
        </div>
        <div class="cuerpo">
          <div class="cerrar"><font-awesome-icon :icon="['fas', 'xmark']" @click="cerrar" />
            <div class="resizable-div" v-show="windowWidth <= 875" @click="cerrar"></div>
          </div>
          <div class="encabezado">
            <RouterLink v-if="gymTag" :to="{ name: 'profile', params: { gymtag: gymTag } }" class="RouterLink"
              @click="quitarOverflow">
              <div class="foto_gymtag">
                <div class="foto_encabezado">
                  <img :src="fotoPerfilMostrada" alt="">
                </div>
                <div class="gymtag_encabezado">
                  @{{ gymTag }}
                </div>
              </div>
            </RouterLink>
            <div class="botones_seguir">
              <button v-if="!siguiendo && perfilPropio == false && windowWidth > 400" @click="seguir">Seguir</button>
              <button v-if="siguiendo && perfilPropio == false && windowWidth > 400"
                @click="dejarSeguir">Siguiendo</button>
              <button v-if="!siguiendo && perfilPropio == false && windowWidth <= 400" @click="seguir">+</button>
              <button v-if="siguiendo && perfilPropio == false && windowWidth <= 400" @click="dejarSeguir"
                class="menos">
                <div>¯</div>
              </button>
              <button v-if="perfilPropio == true || userId == 'd522115b-0a93-4a05-bf50-8b32ccb9e344'"
                @click="confirmarBorrar('¿Seguro que quieres eliminar esta publicación?')" class="boton_quitar_imagen">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="quitar_imagen"
                  @click="confirmacion">
                  <path
                    d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z" />
                </svg>
              </button>
            </div>
          </div>
          <div class="tematica_contenido_comentarios">
            <div class="tematica_contenido">
              <div class="contenedor_tematica">
                <div class="tematica">{{ tematica }}</div>
              </div>
              <div v-if="descripcion.length > 0" :class="['contenedor_descripcion', { 'quitarOverflow': !mostrarMas }]">
                <div v-if="descripcion.length > 115 && !mostrarMas" class="div_esp">
                  <span class="span_esp">{{ descripcion.slice(0, 115) }}<span class="ver-mas" @click="toggleVerMas">
                      ...más</span></span>
                </div>
                <div v-if="descripcion.length < 115">
                  <span>{{ descripcion }}</span>
                </div>
                <div v-if="mostrarMas" class="descripcion-completa">
                  <span class="sin_top">{{ descripcion }}</span>
                  <span class="ver-menos" @click="toggleVerMas"> ...menos</span>
                </div>
              </div>
            </div>
            <div :class="['comentarios', { 'hacerPequenosComentarios': mostrarMas }]">
              <div v-if="comentarios.length === 0" class="sin-comentarios">
                <h3>Todavía no hay comentarios.</h3>
              </div>
              <div v-for="comentario in comentarios" :key="comentario.id" class="comentario">
                <div class="header_cometario">
                  <RouterLink v-if="gymTag" :to="{ name: 'profile', params: { gymtag: comentario.usuarios.gymtag } }"
                    class="RouterLink" @click="quitarOverflow">
                    <div class="comentario-header">
                      <img :src="comentario.fotoPerfilComentarioMostrada" class="comentario-foto" />
                      <span class="comentario-usuario">@{{ comentario.usuarios.gymtag }}</span>
                    </div>
                  </RouterLink>
                  <button
                    v-if="perfilPropio == true || comentario.idusuario === userId || userId == 'd522115b-0a93-4a05-bf50-8b32ccb9e344'"
                    @click="confirmarBorrar('¿Seguro que quieres eliminar este comentario?', comentario.id)"
                    class="boton_quitar_imagen boton_quitar_imagen_comentario">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="quitar_imagen"
                      @click="confirmacion">
                      <path
                        d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z" />
                    </svg>
                  </button>
                </div>
                <div class="comentario-contenido">
                  {{ comentario.comentario }}
                </div>
                <div class="comentario-fecha">
                  {{ formatFecha(comentario.fechacreacion) }}
                </div>
              </div>
            </div>
          </div>
          <div class="todo_botones_publicacion_grande">
            <div class="borde"></div>
            <div class="botones_publicacion_grande">
              <div class="megusta_comentario">
                <div class="megusta" v-if="!likes[props.publicacionUnica.idpublicacion]" @click="darLike()"
                  ref="likeButton">
                  <font-awesome-icon :icon="['far', 'heart']" class="heart" />
                </div>
                <div class="megusta" v-if="likes[props.publicacionUnica.idpublicacion]" @click="quitarLike">
                  <font-awesome-icon :icon="['fas', 'heart']" class="heart rojo"
                    :class="{ 'like-animation2': animatingLike2[props.publicacionUnica.idpublicacion] }" />
                </div>
                <div class="comentar" @click="enfocarInput">
                  <font-awesome-icon :icon="['far', 'comment']" class="comment" />
                </div>
              </div>
              <div class="guardar" v-if="!guardados[props.publicacionUnica.idpublicacion]" @click="guardar">
                <font-awesome-icon :icon="['far', 'bookmark']" class="save"
                  :class="{ 'save-animation': animatingSave[props.publicacionUnica.idpublicacion] }" />
              </div>
              <div class="guardar" v-if="guardados[props.publicacionUnica.idpublicacion]" @click="eliminarGuardado">
                <font-awesome-icon :icon="['fas', 'bookmark']" class="save save_dorado"
                  :class="{ 'save-animation': animatingSave[props.publicacionUnica.idpublicacion] }" />
              </div>
            </div>
            <div class="numero_likes">
              {{ numeroLikes }} {{ likeText }}
            </div>
          </div>
          <div class="borde borde2"></div>

          <div class="div_comentar">
            <div class="anadir">
              <div class="foto_anadir">
                <img :src="props.fotoTuPerfilMostrar" />
              </div>
              <div class="input_anadir">
                <textarea class="input" ref="comentarioInput" required autocomplete="off"
                  placeholder="Añade un comentario..." maxlength="100" @input="actualizarComentario"
                  v-if="windowWidth >= 875"></textarea>
                <input class="input" ref="comentarioInput" required autocomplete="off"
                  placeholder="Añade un comentario..." maxlength="100" @input="actualizarComentario"
                  v-if="windowWidth < 875" type="text">
              </div>
            </div>
            <div class="publicar" v-if="windowWidth >= 400">
              <div class="publicar_div">
                <button @click="publicar"
                  :class="deshabilitado ? 'boton_deshabilitado' : 'publicar_boton'">Publicar</button>
              </div>
            </div>
            <div class="publicar" v-if="windowWidth < 400">
              <div class="publicar_div">
                <button @click="publicar"
                  :class="deshabilitado ? 'boton_deshabilitado' : 'publicar_boton'"><font-awesome-icon
                    :icon="['fas', 'paper-plane']" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.div_girar_imagen {
  height: 35px;
  width: 35px;
  position: absolute;
  bottom: 15px;
  right: 15px;
}

svg.girar_imagen {
  background-color: var(--light-blue-text);
  border-radius: 50%;
  width: 35px !important;
  height: 35px !important;
  cursor: pointer;
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

.header_cometario {
  width: fit-content;
  padding-right: 5px;
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
}

.custom-image-style {
  max-width: 100% !important;
  max-height: 100% !important;
  object-fit: fill !important;
  width: auto !important;
  height: auto !important;
}

.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: fit-content;
}

.encabezado_p {
  padding: 7px 0 7px 3px;
}

.foto_gymtag {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 20px;
  font-size: 26px;
  color: var(--light-blue-text);
  transition: text-shadow 0.3s;
}

.final .gymtag_encabezado {
  max-width: 270px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.foto_gymtag:hover,
.foto_gymtag:active {
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.575), 0 0 6px rgba(255, 255, 255, 0.301);
}

.foto_encabezado {
  height: 60px;
  width: 60px;
  overflow: hidden;
  margin-right: 10px;
}

.foto_encabezado img {
  border-radius: 50%;
  height: 100%;
  width: 100%;
  border: 1px solid black;
  transition: border 0.3s;
  object-fit: cover;
}

.foto_gymtag:hover img,
.foto_gymtag:active img {
  border: 1px solid rgb(109, 109, 109);
}

.botones_seguir {
  padding-right: 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
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

.tematica_contenido_comentarios {
  height: 380px;
  display: flex;
  flex-direction: column;
}

.tematica_contenido {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 12px 0 0;
  flex-shrink: 0;
}

.contenedor_tematica,
.contenedor_descripcion {
  width: 100%;
  word-break: break-word;
  overflow-wrap: break-word;
  color: var(--light-blue-text);
  position: relative;
  padding-left: 20px;
  padding-right: 20px;
}

.tematica,
.descripcion {
  height: fit-content;
  white-space: normal;
  font-size: 19px;
}

.contenedor_tematica {
  margin-bottom: 5px;
  font-weight: bold;
}

.contenedor_descripcion {
  font-size: 15px;
  height: fit-content;
  max-height: 190px;
  padding-bottom: 10px;
  overflow-y: auto;
  padding: 10px 20px 10px 20px;
  border-top: 1px solid #ebebeb5d;
}

.ver-mas,
.ver-menos {
  color: #bababa;
  cursor: pointer;
}

.descripcion-completa.show {
  display: block;
}

.contenedor_descripcion.quitarOverflow {
  overflow-y: hidden;
}

span.span_esp {
  padding-top: 0;
}

.sin_top {
  padding-top: 0;
}

.sin-comentarios {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--light-blue-text);
  font-weight: 600 !important;
}

.sin-comentarios h3 {
  font-weight: 200;
}

.comentarios {
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
  border-top: 1px solid #ebebebd3;
  background-color: #0d285e;
  transition: height 0.3s ease;
  width: 100%;
}

.hacerPequenosComentarios {
  height: 167px;
}

.comentarios::-webkit-scrollbar,
.contenedor_descripcion::-webkit-scrollbar {
  width: 10px;
}

.comentarios::-webkit-scrollbar-track {
  background: var(--dark-blue);
  background: #b8c1d346;
  border: var(--light-blue-text) solid 1px;
  border-bottom: 1px solid #cccccc31;
}

.contenedor_descripcion::-webkit-scrollbar-track {
  background: var(--dark-blue);
  background: #b8c1d346;
  border: var(--light-blue-text) solid 1px;
  border-bottom: none;
  border-top: none;

}

.contenedor_descripcion::-webkit-scrollbar-track {
  border: var(--light-blue-text) solid 1px;
}

.comentarios::-webkit-scrollbar-thumb,
.contenedor_descripcion::-webkit-scrollbar-thumb {
  background-color: var(--light-blue-text);
}

.comentario {
  border-bottom: 1px solid #cccccc31;
  padding: 10px 5px;
}

.comentario-header {
  display: flex;
  align-items: center;
  color: var(--light-blue-text);
  width: fit-content;
  padding: 0 5px;
  cursor: pointer;
  transition: text-shadow 0.3s;
}

.comentario-header:hover,
.comentario-header:active {
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.575), 0 0 6px rgba(255, 255, 255, 0.301);
}

.comentario-foto {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
  margin-left: 5px;
  border: 1px solid black;
  transition: border 0.3s;
  background-color: var(--black);
  transition: border 0.3s;
}

.comentario-header:hover .comentario-foto,
.comentario-header:active .comentario-foto {
  border: 1px solid rgb(109, 109, 109);
}

.foto_encabezado img {
  border-radius: 50%;
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.comentario-usuario {
  font-weight: bold;
}

.comentario-contenido {
  margin: 10px 0;
  color: var(--light-blue-text);
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  margin-left: 12px;
  margin-right: 12px;
}

.comentario-fecha {
  font-size: 13px;
  margin-left: 12px;
  color: #bababa;
  margin-top: 5px;
}

.comentario:last-child {
  border: none;
}

.publicacion {
  background-color: var(--black);
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  aspect-ratio: 1;
  position: relative;
  max-height: fit-content;
  border: 1px solid black;
  overflow: hidden;
  cursor: pointer;
}

.header-publicacion {
  background-color: var(--dark-blue);
  height: 10%;
  display: flex;
  align-items: center;
}

.header-publicacion-izq {
  display: flex;
  align-items: center;
  width: 90%;
  margin-left: 10px;
}

.header-publicacion-izq img {
  margin: 5px 0;
  width: 9%;
  object-fit: cover;
  aspect-ratio: 1;

  border-radius: 50%;
  border: 2px solid var(--light-blue-text);
}

.header-publicacion-izq .gymtag {
  color: var(--light-blue-text);
  margin-left: 10px;
}

.header-publicacion-der {
  width: 10%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-publicacion {
  background-color: var(--dark-blue);
  display: flex;
  align-items: center;
  padding-top: 5px;
  height: fit-content;
}

.likes_pequeno {
  height: 17px;
  width: 100%;
  padding-left: 20px;
  display: flex;
  align-items: center;
  color: #eef2faf1;
  font-size: 15px;
  transform: translateY(-2px);
  margin-bottom: 5px;
}

.descripcion_foto {
  height: fit-content;
  padding-left: 20px;
  padding-right: 20px;
  color: var(--light-blue-text);
  margin-bottom: 10px;
  font-size: 18px;
}

.footer-publicacion>.todo_botones_publicacion_grande.todo_botones_publicacion_p {
  display: flex;
  flex-direction: column;
}

.footer-publicacion .tematica {
  color: white;
}

.icon {
  font-size: 2em;
  color: var(--light-blue-text);
}

.inicial {
  display: flex;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  height: 100%;
  width: 100%;
}

.cover {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.encabezado,
.footer-publicacion {
  cursor: default;
}

.final .cover {
  cursor: pointer;
}

.normal {
  max-height: 100%;
  max-width: 100%;
}

.final {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(52, 52, 52, 0.583);
  z-index: 700;
  display: flex;
  justify-content: center;
  align-items: center;
}

.contenido {
  display: flex;
  background-color: black;
  border-radius: 4px;
  border: var(--black) 3px solid;
  overflow: hidden;
  position: relative;
  cursor: default;
}

.cerrar {
  display: flex;
  justify-content: end;
}

.fa-xmark {
  cursor: pointer;
  height: 25px;
  margin: 4px 7px 0 0;
  color: var(--light-blue-text);
}

.imagen {
  background-color: black;
  width: 600px;
  height: 600px;
  border-right: var(--black) 1px solid;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cuerpo {
  position: relative;
  background: var(--dark-blue);
  width: 500px;
}

.publicar_div {
  width: 80%;
  height: 100%;
  display: flex;
  text-align: center;
  justify-content: end;
}

.publicar_boton {
  cursor: pointer;
  background-color: var(--blue-buttons);
  border: solid var(--black) 2px;
  border-radius: 2px;
  font-size: 18px;
  transition: background-color 0.5s, border 0.5s, color 0.5s;
  height: 42px;
  padding: 0 10px;
  margin-top: 8px;
}

.publicar_boton:hover,
.publicar_boton:active {
  background-color: var(--very-dark-blue);
  color: var(--light-blue-text);
  border: 2px solid var(--grey-buttons-inputs-border);
}

.boton_deshabilitado {
  cursor: not-allowed;
  background-color: #4e6368;
  color: rgba(0, 0, 0, 0.76);
  border: solid rgba(0, 0, 0, 0.76) 2px;
  border-radius: 2px;
  height: 42px;
  font-size: 18px;
  padding: 0 10px;
  margin-top: 8px;
}

.boton_deshabilitado:hover,
.boton_deshabilitado:active {
  background-color: #4e6368;
  color: rgba(0, 0, 0, 0.76);
  border: solid rgba(0, 0, 0, 0.76) 2px;
}

.div_comentar {
  display: flex;
  align-items: center;
  position: absolute;
  justify-content: space-between;
  bottom: 0;
  height: 65px;
  width: 100%;
}

.anadir {
  display: flex;
  align-items: center;
}

.input_anadir {
  margin-left: 20px;
}

.input_anadir .input {
  height: 42px;
  border: none;
  outline: none;
  padding: 0 4px;
  border-radius: 2px;
  color: var(--light-blue-text);
  font-size: 16px;
  background-color: var(--blue-inputs);
  border: 2px solid transparent;
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 1);
  cursor: pointer;
  width: 290px;
  resize: none;
  overflow-y: auto;
  margin-top: 12px;
  word-spacing: 0;
}

.input_anadir .input:focus {
  border: 2px solid var(--grey-buttons-inputs-border);
  color: var(--light-blue-text);
}

.input_anadir .input::placeholder {
  color: var(--light-blue-text);
}

.foto_anadir {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  overflow: hidden;
  border-right: var(--black) 1px solid;
  margin-left: 20px;
  margin-top: 7px;
  min-width: 45px;
}

.foto_anadir img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.todo_botones_publicacion_grande {
  display: flex;
  flex-direction: column;
}

.borde {
  width: 100%;
  background-color: #ebebebd3;
  height: 1px;
  transform: scaleY(1);
  transform-origin: top;
  position: absolute;
  bottom: 130px;
}

.borde2 {
  bottom: 58px;
  z-index: 100;
  background-color: #eef2fa;
  transform: scaleY(0.4);
}

.botones_publicacion_grande {
  display: flex;
  position: absolute;
  justify-content: space-between;
  bottom: 81px;
  padding-top: 5px;
  height: 50px;
  width: 100%;
  z-index: 100;
  overflow: visible;
}

.numero_likes {
  position: absolute;
  bottom: 62px;
  height: 21px;
  width: 100%;
  padding-left: 20px;
  z-index: 10;
  display: flex;
  align-items: center;
  color: var(--light-blue-text);
  font-size: 17px;
}

.megusta_comentario {
  display: flex;
}

button.boton_quitar_imagen {
  width: 24px !important;
  height: 24px !important;
  display: flex;
  justify-content: center;
  text-align: center;
  background-color: transparent !important;
  border: none;
  border-radius: 0;
  cursor: pointer;
  padding: 0;
  margin-right: 12px;
}

.boton_quitar_imagen svg {
  height: 24px !important;
  width: 24px !important;
  fill: var(--light-blue-text);
}

button.boton_quitar_imagen_comentario {
  width: 20px !important;
  height: 20px !important;
  margin-right: 25px;
}

.boton_quitar_imagen_comentario svg {
  height: 20px !important;
  width: 20px !important;
}

.megusta_comentario div {
  width: 55px;
}

.megusta {
  margin-left: 0px !important;
}

.comentar,
.megusta,
.guardar {
  height: 45px;
}

.todo_botones_publicacion_p .botones_publicacion_grande {
  position: static;
}

.botones_publicacion_grande * {
  font-size: 35px;
  margin: 0 10px;
}

.guardar {
  margin-right: 15px;
  margin-top: 3px;
}

.heart,
.save,
.comment {
  color: var(--light-blue-text);
  cursor: pointer;
  transition: transform 0.2s;
}

.heart,
.comment {
  font-size: 40px;
}

.heart.rojo {
  color: rgb(235, 4, 4);
}

.save.save_dorado {
  color: rgb(230, 196, 28);
}

@keyframes likeBounce {
  0% {
    transform: scale(1);
    color: rgb(238, 70, 70);
  }

  50% {
    transform: scale(1.5);
    color: rgb(235, 4, 4);
  }

  70% {
    transform: scale(1.2);
    color: rgb(235, 4, 4);
  }

  100% {
    transform: scale(1);
    color: rgb(238, 70, 70);
  }
}

.like-animation2 {
  animation: likeBounce 0.6s ease-in-out;
}

.image-container {
  position: relative;
}

.like-animation {
  position: absolute;
  font-size: 100px;
  color: rgba(255, 0, 0, 0.75);
  animation: like-animation 0.6s forwards;
  transform: translate(-50%, -50%);
}

@keyframes like-animation {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }

  50% {
    transform: translate(-50%, -80%) scale(1.2);
    opacity: 0.9;
  }

  100% {
    transform: translate(-50%, -190%) scale(0.8);
    opacity: 0;
  }
}

@keyframes saveGlow {
  0% {
    transform: scale(1);
    color: rgb(171, 153, 16);
  }

  50% {
    transform: scale(1.2);
    color: rgb(230, 196, 28);
  }

  100% {
    transform: scale(1);
    color: rgb(171, 153, 16);
  }
}

.save-animation {
  animation: saveGlow 0.4s ease-in-out;
}

.save:hover,
.save:active,
.heart:hover,
.heart:active {
  transform: scale(1.1);
}

.comment:hover,
.comment:active {
  transform: scale(1.08);
}

::placeholder {
  padding-top: 2px;
  padding-left: 2px;
  font-size: 14px;
  word-spacing: -2px;
}

::-moz-placeholder {
  padding-left: 2px;
  padding-top: 2px;
  font-size: 14px;
  word-spacing: -2px;
}

:-ms-input-placeholder {
  padding-left: 2px;
  padding-top: 2px;
  font-size: 14px;
  word-spacing: -2px;
}

::-ms-input-placeholder {
  padding-left: 2px;
  padding-top: 2px;
  font-size: 14px;
  word-spacing: -2px;
}

@media (max-width: 1200px) {
  .imagen {
    width: 500px;
    height: 500px;
  }

  .cuerpo {
    width: 400px;
  }

  .foto_gymtag {
    font-size: 24px;
  }

  .foto_gymtag {
    margin-left: 15px;
  }

  .foto_encabezado {
    margin-right: 8px;
  }

  .botones_seguir button {
    font-size: 12px;
    margin: 4px 6px;
  }

  .final .gymtag_encabezado {
    max-width: 220px;
  }

  .botones_seguir {
    padding-right: 10px;
    padding-left: 5px;
  }

  .input_anadir .input {
    width: 210px;
  }

  .foto_anadir {
    margin-left: 10px;
  }

  .input_anadir {
    margin-left: 12px;
  }

  button.boton_quitar_imagen {
    width: 20px !important;
    height: 20px !important;
  }

  .boton_quitar_imagen svg {
    height: 20px !important;
    width: 20px !important;
  }

  .tematica {
    font-size: 17px;
  }

  .contenedor_descripcion {
    font-size: 14px;
    height: fit-content;
    max-height: 100px;
  }

  .tematica_contenido_comentarios {
    height: 280px;
    display: flex;
    flex-direction: column;
  }
}

@media (max-width: 985px) {
  .imagen {
    width: 450px;
    height: 450px;
  }

  .cuerpo {
    width: 380px;
  }

  .foto_gymtag {
    font-size: 22px;
  }

  .foto_encabezado {
    height: 50px;
    width: 50px;
  }

  .final .gymtag_encabezado {
    max-width: 210px;
  }

  .input_anadir .input {
    width: 200px;
  }

  .publicar button {
    transform: translate(8px);
  }

  .tematica {
    font-size: 16px;
  }

  .contenedor_descripcion {
    max-height: 100px;
  }

  .tematica_contenido_comentarios {
    height: 240px;
    display: flex;
    flex-direction: column;
  }
}

@media (max-width: 875px) {
  .cover {
    max-height: 750px;
  }

  .publicacion {
    height: fit-content;
    aspect-ratio: 0;
    border: 2px solid black;
    border-radius: 12px;
    margin: 25px 0 25px 0;
    overflow: hidden;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.586), 0 0 8px rgba(0, 0, 0, 0.533);
  }

  .final {
    align-items: end;
    background-color: rgba(42, 42, 42, 0.783);
  }

  .cerrar .svg-inline--fa.fa-xmark {
    display: none;
  }

  .cerrar {
    height: 20px;
    display: flex;
    justify-content: center;
    padding: 4px 0 5px;
  }

  .resizable-div {
    background-color: #eef2facf;
    width: 20%;
    height: 4px;
    cursor: pointer;
    position: relative;
    z-index: 10;
    border-radius: 10px;
    max-width: 120px;
  }

  .contenido {
    width: 100%;
    border: none;
    border-radius: 14px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    height: 80vh;
    border-top: 1px solid #eef2fa6c;
    min-height: 735px;
    transition: transform 0.3s ease-in-out;
  }

  .contenido.no_mostrar {
    transform: translateY(100%);
  }

  .contenido.mostrar {
    transform: translateY(0);
  }

  .sin-comentarios h3 {
    font-size: 26px;
  }

  .comentarios {
    max-height: 490px;
  }

  .final .encabezado {
    padding: 0 20px;
  }

  .final .gymtag_encabezado {
    max-width: 400px;
    overflow: auto;
    text-overflow: none;
  }

  .megusta,
  .comentar,
  .guardar {
    padding-top: 1px;
  }

  .final .foto_gymtag {
    font-size: 29px;
  }

  .final .foto_encabezado {
    height: 70px;
    width: 70px;
    overflow: hidden;
    margin-right: 15px;
  }

  .final .foto_encabezado img {
    border-radius: 50%;
    height: 100%;
    width: 100%;
    border: 1px solid black;
    transition: border 0.3s;
    object-fit: cover;
  }

  .final .botones_seguir {
    padding-right: 22px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .final .botones_seguir button {
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

  .final .botones_seguir button.boton_quitar_imagen {
    width: 24px !important;
    height: 24px !important;
    display: flex;
    justify-content: center;
    text-align: center;
    background-color: transparent !important;
    border: none;
    border-radius: 0;
    cursor: pointer;
    padding: 0;
    margin-right: 12px;
    transform: translateX(21px);
  }

  .final .botones_seguir .boton_quitar_imagen svg {
    height: 24px !important;
    width: 24px !important;
    fill: var(--light-blue-text);
  }

  .contenedor_descripcion,
  .contenedor_tematica {
    padding-left: 40px;
    padding-right: 40px;
  }

  .cuerpo {
    height: 100%;
    width: 100%;
  }

  .tematica_contenido_comentarios {
    height: 496px;
    display: flex;
    align-items: end;
  }

  .imagen {
    display: none;
  }

  .div_pregunta {
    margin-left: 0;
  }

  .botones_publicacion_grande {
    bottom: 91px;
    padding: 0 10px;
  }

  .numero_likes {
    bottom: 74px;
    padding-left: 30px;
  }

  .borde {
    bottom: 148px;
  }

  .borde2 {
    bottom: 65px;
  }

  .div_comentar {
    padding: 0px 30px 5px 20px;
  }

  .anadir {
    width: 100%;
  }

  .input_anadir {
    height: 45px;
    width: 100%;
    margin-left: 15px;
    display: flex;
    align-items: center;
  }

  .todo_botones_publicacion_grande {
    width: fit-content;
  }

  .input_anadir .input {
    width: 100%;
    height: 35px;
  }

  .div_comentar * {
    margin-top: 0;
  }

  .div_comentar .input {
    margin-top: 0;
  }

  .publicar_div {
    width: 155px;
    justify-content: end;
    padding-right: 10px;
    align-items: center;
  }

  .publicar_boton {
    width: 100%;
    max-width: 120px;
    height: 37px;
  }

  .boton_deshabilitado {
    width: 100%;
    max-width: 120px;
    height: 37px;
  }

  .comentario {
    padding: 10px 20px;
  }

  .boton_quitar_imagen_comentario {
    margin: 0 !important;
  }

  .foto_anadir {
    width: 47px;
    height: 47px;
    min-width: 47px;
    margin-left: 7px;
  }

  .cover {
    border: 1px solid rgba(255, 255, 255, 0.359);
    border-left: none;
    border-right: none;
  }

  .todo_botones_publicacion_grande.todo_botones_publicacion_p .botones_publicacion_grande {
    width: 241px;
  }

  .sin_borde {
    border: none;
    box-shadow: none;
  }

  .publicaciones_esp .sin_borde {
    border: 1px solid rgba(255, 255, 255, 0.359);
    border-left: none;
    border-right: none;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.586), 0 0 8px rgba(0, 0, 0, 0.533);
  }
}

@media (max-width: 625px) {
  .publicacion {
    border-radius: 0;
    border: 1px solid rgba(0, 0, 0, 0.768);
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.586), 0 0 4px rgba(0, 0, 0, 0.668), 0 0 6px rgba(0, 0, 0, 0.767);
    border-left: 1px solid rgba(54, 54, 54, 0.66);
    border-right: 1px solid rgba(54, 54, 54, 0.66);
  }

  .sin_borde {
    border: none;
    box-shadow: none;
  }

  .publicaciones_esp .sin_borde {
    border-radius: 0;
    border: 1px solid rgba(0, 0, 0, 0.768);
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.586), 0 0 4px rgba(0, 0, 0, 0.668), 0 0 6px rgba(0, 0, 0, 0.767);
    border-left: 1px solid rgba(54, 54, 54, 0.66);
    border-right: 1px solid rgba(54, 54, 54, 0.66);
  }

  .todo_botones_publicacion_grande.todo_botones_publicacion_p {
    width: 100vw;
  }

  .descripcion_foto {
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: pre-wrap;
  }

  .cover {
    max-height: 600px;
  }
}

@media (max-width: 550px) {
  .contenido {
    height: 78vh;
    min-height: 720px;
  }

  .final .encabezado {
    padding-left: 10px;
  }

  .final .botones_seguir {
    padding-right: 0;
    padding-left: 20px;
  }

  .final .foto_encabezado {
    height: 55px;
    width: 55px;
    overflow: hidden;
    margin-right: 15px;
  }

  .sin-comentarios h3 {
    font-size: 23px;
  }

  .final .gymtag_encabezado {
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .final .foto_gymtag {
    font-size: 23px;
    margin-left: 10px
  }

  .final .foto_encabezado {
    overflow: hidden;
    margin-right: 10px;
  }

  .final .botones_seguir {
    padding-left: 0;
  }

  .contenedor_tematica {
    padding: 0 20px;
  }

  .final .contenedor_descripcion {
    padding: 10px 20px;
  }

  .comentario {
    padding: 10px 10px;
  }

  .final .botones_publicacion_grande {
    padding: 0;
  }

  .final .numero_likes {
    padding-left: 17px;
  }

  .div_comentar {
    padding: 0 10px 5px;
  }

  .publicar_div {
    width: 105px;
    justify-content: end;
    padding-right: 10px;
    align-items: center;
  }

  .publicar_boton {
    width: 100%;
    max-width: 90px;
    height: 37px;
  }

  .boton_deshabilitado {
    width: 100%;
    max-width: 90px;
    height: 37px;
  }

  .final .botones_seguir button.boton_quitar_imagen {
    transform: translateX(8px);
  }
}

@media (max-width: 470px) {
  .final .gymtag_encabezado {
    max-width: 240px;
  }
}

@media (max-width: 450px) {
  .todo_botones_publicacion_grande.todo_botones_publicacion_p .botones_publicacion_grande {
    width: 200px;
    height: 47px;
  }

  .todo_botones_publicacion_grande.todo_botones_publicacion_p .botones_publicacion_grande>.megusta {
    font-size: 35px;
    margin-right: 0;
  }

  .todo_botones_publicacion_grande.todo_botones_publicacion_p .botones_publicacion_grande>.megusta>.heart {
    font-size: 35px;
  }

  .todo_botones_publicacion_grande.todo_botones_publicacion_p .botones_publicacion_grande>.guardar {
    font-size: 35px;
    margin-top: 0;
    margin-right: 0;
  }

  .todo_botones_publicacion_grande.todo_botones_publicacion_p .botones_publicacion_grande>.guardar>.save {
    font-size: 33px;
    margin-top: 0;
  }

  .todo_botones_publicacion_grande.todo_botones_publicacion_p .botones_publicacion_grande>.comentar {
    font-size: 35px;
  }

  .todo_botones_publicacion_grande.todo_botones_publicacion_p .botones_publicacion_grande>.comentar>.comment {
    font-size: 35px;
  }
}

@media (max-width: 425px) {
  .foto_gymtag {
    margin-left: 10px;
  }

  .div_pregunta {
    height: fit-content;
    width: 80%;
    min-width: 0;
    padding: 15px 0;
  }

  .pregunta {
    margin-bottom: 20px;
    width: 70%;
    text-align: center;
  }

  .botones_pregunta {
    width: 90%;
  }

  .final .gymtag_encabezado {
    max-width: 220px;
  }
}

@media (max-width: 400px) {
  .final .megusta {
    margin-right: 0;
  }

  .descripcion_foto {
    font-size: 16px;
    margin-bottom: 5px;
  }

  .final .foto_encabezado {
    height: 45px;
    width: 45px;
  }

  .final .gymtag_encabezado {
    font-size: 20px;
    max-width: 200px;
  }

  .final .botones_seguir {
    padding-right: 0;
  }

  .final .botones_seguir button {
    font-weight: 400;
    padding: 2px 0 0;
    width: 30px;
    font-size: 20px;
  }

  .final .botones_seguir button.boton_quitar_imagen {
    width: 20px !important;
    height: 20px !important;
    transform: translateX(8px);
  }

  .final .botones_seguir .boton_quitar_imagen svg {
    height: 20px !important;
    width: 20px !important;
  }

  .final .botones_seguir button.menos div {
    transform: translateY(9px) scaleX(0.85);
    font-weight: bold;
  }

  .cerrar {
    height: 15px;
  }

  .contenido {
    height: 76vh;
    min-height: 706px;
  }

  .final .gymtag_encabezado {
    max-width: 250px;
  }

  .foto_anadir {
    width: 40px;
    height: 40px;
    min-width: 40px !important;
    margin-left: 4px;
  }

  .input_anadir {
    margin-left: 10px;
  }

  .boton_deshabilitado {
    padding: 0 10px;
  }

  .publicar_div {
    width: 60px;
    padding-right: 10px;
  }

  .publicar_boton {
    max-width: 50px;
  }

  .boton_deshabilitado {
    max-width: 50px;
  }
}

@media (max-width: 365px) {
  .final .gymtag_encabezado {
    max-width: 200px;
  }

  .contenedor_descripcion.quitarOverflow {
    overflow-y: auto;
  }
}

@media (max-width: 320px) {
  .final .gymtag_encabezado {
    max-width: 180px;
  }
}

@media (max-height: 740px) and (max-width: 600px) {

  .cuerpo,
  .contenido.mostrar {
    height: 580px;
    min-height: 582px;
  }

  .contenido.mostrar {
    position: relative;
  }

  .cuerpo {
    position: absolute;
    bottom: 0;
  }

  .comentarios {
    flex-grow: 0;
  }

  .botones_publicacion_grande {
    padding-top: 5px !important;
  }

  .numero_likes {
    padding-top: 5px !important;
  }

  .borde {
    transform: translateY(5px);
  }

  .borde2 {
    transform: translateY(0);
  }

  .contenido {
    background-color: transparent;
  }
}

@media (max-height: 600px) and (max-width: 600px) {

  .cuerpo,
  .contenido.mostrar {
    height: 500px;
    min-height: 502px;
  }

  .contenido {
    background-color: transparent;
  }

  .contenido.mostrar {
    position: relative;
  }

  .cuerpo {
    position: absolute;
    bottom: 0;
  }

  .comentarios {
    height: 281px !important;
    flex-grow: 0;
  }
}
</style>