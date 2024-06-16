<script setup>
/*Imports y declaración de variables.*/
import { ref, watch, onMounted, onUnmounted, computed } from "vue";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { disponible } from "../main";
import { supabase, userActive, userId } from "../clients/supabase";
import Publicacion from "../components/Publicacion.vue";


disponible.value = true;

const vistaUnica = ref(false)

const buscado = ref(false);
const busquedaAlimento = ref("");
const pagina = ref(1);
const productos = ref([]);
const totalPaginas = ref(1);
const productosPorPagina = 10;
const codigo = ref();

const ProductoFoto = ref("");
const ProductoNombre = ref("");
const ProductoNutriScore = ref("");
const ProductoNovaGroup = ref("");
const ProductoEcoScore = ref("");
const ProductoCantidad = ref("");
const ProductoIngredientes = ref("");
const ProductoKcal_100 = ref("");
const ProductoKjul_100 = ref("");
const ProductoFat_100 = ref("");
const ProductoFatUnit = ref("");
const ProductoSaturedFat_100 = ref("");
const ProductoSaturedFatUnit = ref("");
const ProductoCarbohydrates_100g = ref("");
const ProductoCarbohydratesUnit = ref("");
const ProductoSugars_100 = ref("");
const ProductoSugarsUnit = ref("");
const ProductoFiber_100 = ref("");
const ProductoFiberUnit = ref("");
const ProductoProteins_100 = ref("");
const ProductoProteinsUnit = ref("");
const ProductoSalt_100 = ref("");
const ProductoSaltUnit = ref("");
const ProductoAlcohol_100 = ref("");
const ProductoAlcoholUnit = ref("");

const ProductoPositivePoints = ref("");
const ProductoNegativePoints = ref("");
const ProductoProteinsPoints = ref("");
const ProductoFiberPoints = ref("");
const ProductoFruitsPoints = ref("");
const ProductoEnergyPoints = ref("");
const ProductoSugarsPoints = ref("");
const ProductoSaturatedPoints = ref("");
const ProductoSodiumPoints = ref("");
const ProductoNutriScorePoints = ref("");
const error_buscar_producto = ref(false);
const maxScrollReached = ref(0);

const cargando = ref(true);

const fotoTuPerfilMostrar = ref('https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg');

const totalPaginasComputed = computed(() => {
  return Math.ceil(totalPaginas.value);
});

/*Función para ir a la página anterior.*/
async function paginaAnterior() {
  if (pagina.value > 1) {
    pagina.value--;
    await buscarProductos(pagina.value);
    scrollToFooter();
  }
}

/*Función para ir a la página siguiente.*/
async function paginaSiguiente() {
  if (pagina.value < totalPaginas.value) {
    pagina.value++;
    // window.scrollTo({ top: document.body.scrollHeight });
    await buscarProductos(pagina.value);
    scrollToFooter();
  }
}

/*Función para desplazar la pantalla al footer.*/
function scrollToFooter() {
  const footer = document.querySelector('footer');
  if (footer) {
    const footerRect = footer.getBoundingClientRect();
    const footerOffset = footerRect.top + window.pageYOffset - (window.innerHeight / 2) + (footerRect.height / 2);
    window.scrollTo({ top: footerOffset, behavior: 'smooth' });
  }
}

/*Observamos los cambios en busquedaAlimento.*/
watch(busquedaAlimento, () => {
  codigo.value = undefined;
  pagina.value = 1;
  const busqueda = busquedaAlimento.value.trim();
  const botonBuscar = document.querySelector('.boton_productos');
  if (esCodigoBarras.test(busqueda) || busqueda == '') {
    if (botonBuscar) {
      botonBuscar.classList.remove('animate-button');
    }
    buscarProductos();
  } else {
    if (botonBuscar) {
      setInterval(() => {
        botonBuscar.classList.add('animate-button');
      }, 2000);
    }
  }
});

setInterval(() => {
  setInterval(() => {
    const botonBuscar = document.querySelector('.publicar_boton');
    if (botonBuscar && !esCodigoBarras.test(busquedaAlimento.value.trim()) && busquedaAlimento.value.trim() !== '') {
      botonBuscar.classList.remove('animate-button');
      setTimeout(() => {
        botonBuscar.classList.add('animate-button');
      }, 50); // Delay para reiniciar la animación
    }
  }, 4000);
}, 2000);

const esCodigoBarras = /^[0-9]{4,}$/;
const esCantidad = /^[0-9]{1,3}$/;

/*Función para asignar los detalles de un producto.*/
function asignarDetallesProducto(producto) {
  /*Asignamos los valores del producto a las variables correspondientes.*/
  ProductoFat_100.value = producto.nutriments["fat_100g"];
  ProductoFoto.value = imagen(producto);
  ProductoNombre.value = nombre(producto);
  ProductoNutriScore.value = urlNutriScore(producto);
  ProductoNovaGroup.value = urlNovaScore(producto);
  ProductoEcoScore.value = urlEcoScore(producto);
  ProductoKcal_100.value = producto.nutriments["energy-kcal_100g"];
  ProductoKjul_100.value = producto.nutriments["energy-kj_100g"];
  ProductoFat_100.value = producto.nutriments["fat_100g"];
  ProductoFatUnit.value = producto.nutriments["fat_unit"];
  ProductoSaturedFat_100.value = producto.nutriments["saturated-fat_100g"];
  ProductoSaturedFatUnit.value = producto.nutriments["saturated-fat_unit"];
  ProductoCarbohydrates_100g.value = producto.nutriments["carbohydrates_100g"];
  ProductoCarbohydratesUnit.value = producto.nutriments["carbohydrates_unit"];
  ProductoSugars_100.value = producto.nutriments["sugars_100g"];
  ProductoSugarsUnit.value = producto.nutriments["sugars_unit"];
  ProductoFiber_100.value = producto.nutriments["fiber_100g"];
  ProductoFiberUnit.value = producto.nutriments["fiber_unit"];
  ProductoProteins_100.value = producto.nutriments["proteins_100g"];
  ProductoProteinsUnit.value = producto.nutriments["proteins_unit"];
  ProductoSalt_100.value = producto.nutriments["salt_100g"];
  ProductoSaltUnit.value = producto.nutriments["salt_unit"];
  ProductoAlcohol_100.value = producto.nutriments["alcohol_100g"];
  ProductoAlcoholUnit.value = producto.nutriments["alcohol_unit"];
  ProductoIngredientes.value = ingredients(producto).replace(/_/g, " ");
  ProductoCantidad.value = producto.quantity;

  /*Asignamos los puntos del NutriScore del producto a las variables correspondientes.*/
  ProductoNegativePoints.value = producto.nutriscore_data ? producto.nutriscore_data.negative_points : "?";
  ProductoPositivePoints.value = producto.nutriscore_data ? producto.nutriscore_data.positive_points : "?";
  ProductoProteinsPoints.value = producto.nutriscore_data ? producto.nutriscore_data.proteins_points : "?";
  ProductoFiberPoints.value = producto.nutriscore_data ? producto.nutriscore_data.fiber_points : "?";
  ProductoFruitsPoints.value = producto.nutriscore_data ? producto.nutriscore_data.fruits_vegetables_nuts_colza_walnut_olive_oils_points : "?";
  ProductoEnergyPoints.value = producto.nutriscore_data ? producto.nutriscore_data.energy_points : "?";
  ProductoSaturatedPoints.value = producto.nutriscore_data ? producto.nutriscore_data.saturated_fat_points : "?";
  ProductoSugarsPoints.value = producto.nutriscore_data ? producto.nutriscore_data.sugars_points : "?";
  ProductoSodiumPoints.value = producto.nutriscore_data ? producto.nutriscore_data.sodium_points : "?";
  ProductoNutriScorePoints.value = producto.nutriscore_data ? producto.nutriscore_score_opposite : "?";
}


/*Función para buscar un producto.*/
async function buscarProductos() {
  cargando.value = true;
  let url;
  let busqueda = busquedaAlimento.value.trim();
  /*Comprobamos si lo ingresado en el input es un código de barras o no.*/
  if (busqueda === "" && codigo.value == undefined) {
    url = `https://world.openfoodfacts.org/cgi/search.pl?search_simple=1&action=process&page_size=${productosPorPagina}&page=${pagina.value}&json=true&sort_by=popularity`;
    vistaUnica.value = false;
  } else if (esCodigoBarras.test(busqueda) || codigo.value != undefined) {
    mostrarProducto(busqueda);
    try {
      /*Hacemos la petición a la API y obtenemos la respuesta.*/
      const response = await fetch(url);
      let result = await response.json();
      if (result.status === 'failure' && result.result.id === 'product_not_found') {
        vistaUnica.value = false;
        error_buscar_producto.value = true;
        return;
      } else {
        error_buscar_producto.value = false;
      }
      vistaUnica.value = true;
      /*Extraemos los resultados.*/
      const producto = result.product;

      /*Asignamos los valores del producto a las variables correspondientes.*/
      asignarDetallesProducto(producto);
    } catch (error) {
    } finally {
      cargando.value = false;
    }
  } else if (esCantidad.test(busqueda)) {
    /*Si no es un código de barras, buscamos productos por su información como su nombre.*/
    url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(busqueda)}&search_simple=1&action=process&page_size=${productosPorPagina}&page=${pagina.value}&json=true&sort_by=quantity`;
    vistaUnica.value = false;
  } else {
    url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(busqueda)}&search_simple=1&action=process&page_size=${productosPorPagina}&page=${pagina.value}&json=true&sort_by=popularity`;
    vistaUnica.value = false;
  }
  try {
    /*Hacemos la petición a la API y obtenemos la respuesta.*/
    const response = await fetch(url);
    let result = await response.json();
    /*Extraemos los resultados.*/
    const resultado = result.products;
    productos.value = resultado;
    /*Calculamos el número de páginas.*/
    totalPaginas.value = Math.ceil(result.count / productosPorPagina);
    buscado.value = true;
    if (resultado.length === 0 && busqueda !== "") {
      error_buscar_producto.value = true;
      return;
    } else {
      error_buscar_producto.value = false;
    }
  } catch (error) {
    return;
  } finally {
    cargando.value = false;
  }
}

/*Función para mostrar un producto más en detalle.*/
async function mostrarProducto(codigoP) {
  codigo.value = codigoP;
  vistaUnica.value = true;
  window.scrollTo(0, 0);
  try {
    const url = `https://world.openfoodfacts.org/api/v3/product/${codigoP}`;
    const response = await fetch(url);
    const result = await response.json();
    if (result.status === 'failure' && result.result.id === 'product_not_found') {
      error_buscar_producto.value = true;
      return;
    } else {
      error_buscar_producto.value = false;
    }
    const producto = result.product;
    asignarDetallesProducto(producto);
  } catch (error) {
  } finally {
    cargando.value = false;
  }
}

/*Función para cerrar el producto que se está visualizando.*/
function cerrarProducto() {
  codigo.value = undefined;
  vistaUnica.value = false;
  resetearDatosProducto();
  const rejaProductos = document.querySelector('.reja-productos');
  if (rejaProductos) {
    rejaProductos.classList.remove('invisible');
  }
  cargando.value = false;
}

/*Función para resetear los datos del producto.*/
function resetearDatosProducto() {
  ProductoFoto.value = "";
  ProductoNombre.value = "";
  ProductoNutriScore.value = "";
  ProductoNovaGroup.value = "";
  ProductoEcoScore.value = "";
  ProductoCantidad.value = "";
  ProductoIngredientes.value = "";
  ProductoKcal_100.value = "";
  ProductoKjul_100.value = "";
  ProductoFat_100.value = "";
  ProductoFatUnit.value = "";
  ProductoSaturedFat_100.value = "";
  ProductoSaturedFatUnit.value = "";
  ProductoCarbohydrates_100g.value = "";
  ProductoCarbohydratesUnit.value = "";
  ProductoSugars_100.value = "";
  ProductoSugarsUnit.value = "";
  ProductoFiber_100.value = "";
  ProductoFiberUnit.value = "";
  ProductoProteins_100.value = "";
  ProductoProteinsUnit.value = "";
  ProductoSalt_100.value = "";
  ProductoSaltUnit.value = "";
  ProductoAlcohol_100.value = "";
  ProductoAlcoholUnit.value = "";
  ProductoPositivePoints.value = "";
  ProductoNegativePoints.value = "";
  ProductoProteinsPoints.value = "";
  ProductoFiberPoints.value = "";
  ProductoFruitsPoints.value = "";
  ProductoEnergyPoints.value = "";
  ProductoSugarsPoints.value = "";
  ProductoSaturatedPoints.value = "";
  ProductoSodiumPoints.value = "";
  ProductoNutriScorePoints.value = "";
}

/*Función para poner la primera letra en mayúscula.*/
function toCapitalize(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

/*Función para mostrar el nombre del producto, en su defecto se devuelve false.*/
function nombre(producto) {
  const idiomas = [
    'product_name_es',
    'product_name_en',
    'product_name',
    'product_name_fr',
    'product_name_ro',
    'product_name_pl',
    'product_name_ar',
    'product_name_bn',
    'product_name_bs',
    'product_name_ca',
    'product_name_cs',
    'product_name_da',
    'product_name_de',
    'product_name_el',
    'product_name_et',
    'product_name_fa',
    'product_name_fi',
    'product_name_he',
    'product_name_hi',
    'product_name_hr',
    'product_name_hu',
    'product_name_id',
    'product_name_it',
    'product_name_ja',
    'product_name_ko',
    'product_name_lt',
    'product_name_lv',
    'product_name_mk',
    'product_name_ms',
    'product_name_nl',
    'product_name_no',
    'product_name_pt',
    'product_name_ru',
    'product_name_sk',
    'product_name_sl',
    'product_name_sr',
    'product_name_sv',
    'product_name_tr',
    'product_name_uk',
    'product_name_vi',
    'product_name_zh',
    'product_name_zh_tw'
  ];
  for (const idioma of idiomas) {
    /*Devolvemos la información en función del idioma.*/
    if (producto[idioma] && producto[idioma].trim() !== '' && producto.brands_tags && producto.brands_tags.length > 0) {
      return producto[idioma] + " - " + toCapitalize(producto.brands_tags[0]);
    }
    if (producto[idioma] && producto[idioma].trim() !== '') {
      return producto[idioma]
    }
  }
  /*Si no se devuelve un nombre, devolvemos la marca.*/
  if (producto.brands_tags && producto.brands_tags.length > 0) {
    return toCapitalize(producto.brands_tags[0]);
  }
  return false;
}

/*Función para mostrar la cantidad del producto, en su defecto se devuelve una cadena vacía.*/
function cantidad(producto) {
  if (producto.quantity) {
    return ` - ${producto.quantity}`;
  }
  return '';
}

/*Guardamos para mostrar la imagen del producto o en su defecto una imagen predeterminada.*/
function imagen(producto) {
  if (producto.image_url != null) {
    return producto.image_url;
  } else {
    return "https://world.openfoodfacts.org/images/icons/dist/packaging.svg";
  }
}

/*Función para mostrar los ingredientes en función de los datos obtenidos.*/
function ingredients(producto) {
  if (
    producto.ingredients_text_es != null &&
    producto.ingredients_text_es != ""
  ) {
    return producto.ingredients_text_es;
  } else if (
    producto.ingredients_text_en != null &&
    producto.ingredients_text_en != ""
  ) {
    return producto.ingredients_text_en;
  } else if (
    producto.ingredients_text_uk != null &&
    producto.ingredients_text_uk != ""
  ) {
    return producto.ingredients_text_en;
  } else if (
    producto.ingredients_text != null &&
    producto.ingredients_text != ""
  ) {
    return producto.product.ingredients_text;
  } else {
    return "No disponible"
  }
}

/*Función para mostrar el NutriScore en función de los datos obtenidos.*/
function urlNutriScore(valor) {
  switch (valor.nutriscore_grade) {
    case "a":
      return "https://static.openfoodfacts.org/images/attributes/dist/nutriscore-a-new-en.svg"
    case "b":
      return "https://static.openfoodfacts.org/images/attributes/dist/nutriscore-b-new-en.svg";
    case "c":
      return "https://static.openfoodfacts.org/images/attributes/dist/nutriscore-c-new-en.svg";
    case "d":
      return "https://static.openfoodfacts.org/images/attributes/dist/nutriscore-d-new-en.svg";
    case "e":
      return "https://static.openfoodfacts.org/images/attributes/dist/nutriscore-e-new-en.svg";
    default:
      return "https://static.openfoodfacts.org/images/attributes/dist/nutriscore-unknown-new-en.svg";
  }
}

/*Función para mostrar el EcoScore en función de los datos obtenidos.*/
function urlEcoScore(valor) {
  switch (valor.ecoscore_grade) {
    case "a":
      return "https://static.openfoodfacts.org/images/attributes/dist/ecoscore-a.svg";
    case "b":
      return "https://static.openfoodfacts.org/images/attributes/dist/ecoscore-b.svg";
    case "c":
      return "https://static.openfoodfacts.org/images/attributes/dist/ecoscore-c.svg";
    case "d":
      return "https://static.openfoodfacts.org/images/attributes/dist/ecoscore-d.svg";
    case "e":
      return "https://static.openfoodfacts.org/images/attributes/dist/ecoscore-e.svg";
    default:
      return "https://static.openfoodfacts.org/images/attributes/dist/ecoscore-unknown.svg";
  }
}

/*Función para mostrar el NovaScore en función de los datos obtenidos.*/
function urlNovaScore(valor) {
  switch (valor.nova_group) {
    case 1:
      return "https://static.openfoodfacts.org/images/attributes/dist/nova-group-1.svg";
    case 2:
      return "https://static.openfoodfacts.org/images/attributes/dist/nova-group-2.svg";
    case 3:
      return "https://static.openfoodfacts.org/images/attributes/dist/nova-group-3.svg";
    case 4:
      return "https://static.openfoodfacts.org/images/attributes/dist/nova-group-4.svg";
    default:
      return "https://static.openfoodfacts.org/images/attributes/dist/nova-group-unknown.svg";
  }
}

/*Función para borrar el filtro de alimentos.*/
function borrar() {
  busquedaAlimento.value = "";
  cargando.value = true;
  error_buscar_producto.value = false;
  cerrarProducto();
  buscarProductos();
}

/*Función para borrar el filtro de usuarios.*/
function borrarUsuario() {
  busquedaUsuarios.value = "";
  todosUsuarios.value = [];
  offset = 0;
  noMoreUsuarios = false;
  cargarUsuarios();
}

const vistaBusqueda = ref("Usuarios");
/*Función para cambiar la vista.*/
function cambiarVista(tipo) {
  vistaBusqueda.value = tipo;
  maxScrollReached.value = 0;
  if (tipo === 'Publicaciones') {
    buscarPublicaciones();
    obtenerTuFotoPerfil();
  }
}

let html5QrcodeScanner = null;
const mostrandoScanner = ref(false);

/*Función de cuando el escaneo ha sido exitoso.*/
function onScanSuccess(decodedText, decodedResult) {
  busquedaAlimento.value = decodedText;
  if (html5QrcodeScanner) {
    html5QrcodeScanner.clear();
    html5QrcodeScanner = null;
  }
}

/*Controlamos el error del escáner.*/
function onScanError(errorMessage) {
  if (errorMessage) {
    return;
  }
}

/*Función para mostrar el escáner.*/
function mostrarScanner() {
  mostrandoScanner.value = !mostrandoScanner.value
  if (mostrandoScanner.value == false) {
    html5QrcodeScanner.clear();
    html5QrcodeScanner = null;
    return
  }

  const readerElement = document.getElementById("reader");

  if (readerElement) {
    if (!html5QrcodeScanner) {
      html5QrcodeScanner = new Html5QrcodeScanner(
        "reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 180 },
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.EAN_13,
          ],
        },
        /*Esto previene múltiples instancias del escáner.*/
        false
      );
      html5QrcodeScanner.render(onScanSuccess, onScanError);

      /*Verificamos si el elemento existe.*/
      if (readerElement) {
        /*Creamos un nuevo div.*/
        var newDiv = document.createElement("div");
        /*Añadimos la clase 'ocultar-i' al nuevo div*/
        newDiv.classList.add('ocultar-i');
        /*Añadimos contenido al nuevo div*/
        newDiv.innerHTML = "<div style='position: absolute !important; background-color: rgb(181, 57, 57) !important; height: 50px !important; width: 50px !important; right: 0 !important; top: 0 !important; z-index: 100 !important; background: var(--bg-color) !important;'></div>"
        /*Añadimos el nuevo div como hijo del elemento "reader"*/
        readerElement.appendChild(newDiv);
      }
    }
  }
}

/*Añadimos el evento de escucha de volver atrás.*/
window.addEventListener('popstate', function () {
  if (vistaUnica.value == true && vistaBusqueda.value === 'Productos') {
    cerrarProducto()
  } else {
    history.go(-1);
  }
});

/*Función para cargar usuarios.*/
function buscarUsuarios() {
  todosUsuarios.value = [];
  offset = 0;
  noMoreUsuarios = false;
  cargarUsuarios();
}

/*Variables para mostrar los usuarios.*/
const todosUsuarios = ref([]);
const busquedaUsuarios = ref("");
let offset = 0;
const limit = 10;
const loading = ref(false);
const loadingP = ref(false);
let noMoreUsuarios = false;
const mostrarBotonBuscar = ref(true);


/*Función para cargar los usuarios.*/
async function cargarUsuarios() {
  if (loading.value || noMoreUsuarios) return;
  loading.value = true;
  try {
    /*Buscamos los usuarios filtrando por su nombre, apellidos y GymTag.*/
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('*')
      .or(`nombre.ilike.%${busquedaUsuarios.value}%,gymtag.ilike.%${busquedaUsuarios.value}%,apellidos.ilike.%${busquedaUsuarios.value}%`)
      .range(offset, offset + limit - 1);
    if (error) {
      loading.value = false;
      return;
    }
    /*Obtenemos la foto de perfil.*/
    for (const usuario of usuarios) {
      usuario.fotoPerfil = usuario.fotoperfil && usuario.fotoperfil !== "/predeterminada.png"
        ? `https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/${usuario.fotoperfil}`
        : "https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg";

      /*Obtenemos el número de seguidores del usuario cargado.*/
      const { data: seguidoresPerfil, error: errorSeguidores } = await supabase
        .from('seguidores')
        .select('*')
        .eq('idseguido', usuario.id);
      if (errorSeguidores) {
        loading.value = false;
        return;
      }
      usuario.numSeguidores = seguidoresPerfil.length;
      /*Obtenemos el número de seguidos del usuario cargado.*/
      const { data: seguidosPerfil, error: errorSeguidos } = await supabase
        .from('seguidores')
        .select('*')
        .eq('idseguidor', usuario.id);
      if (errorSeguidos) {
        loading.value = false;
        return;
      }
      usuario.numSeguidos = seguidosPerfil.length;
    }

    if (usuarios.length < limit) {
      noMoreUsuarios = true;
    } else {
      offset += limit;
    }
    /*Añadimos los usuarios.*/
    todosUsuarios.value.push(...usuarios);
  } catch (error) {
  } finally {
    loading.value = false;
  }
}

const todasPublicaciones = ref([]);
const busquedaPublicaciones = ref("");
const offsetPublicaciones = ref(0);
const limitPublicaciones = 12;
const noMorePublicaciones = ref(false);

/*Función para cargar las publicaciones.*/
async function cargarPublicaciones() {
  if (loadingP.value || noMorePublicaciones.value) return;
  loadingP.value = true;
  try {
    /*Buscamos las publicaciones filtrando por su temática y contenido.*/
    const { data: publicaciones, error } = await supabase
      .from('publicaciones')
      .select('*')
      .or(`tematica.ilike.%${busquedaPublicaciones.value}%,contenido.ilike.%${busquedaPublicaciones.value}%`)
      .range(offsetPublicaciones.value, offsetPublicaciones.value + limitPublicaciones - 1);
    if (error) {
      loadingP.value = false;
      return;
    }
    /*Comprobamos el número de publicaciones que ya hemos cargado.*/
    if (publicaciones.length < limitPublicaciones) {
      noMorePublicaciones.value = true;
    } else {
      offsetPublicaciones.value += limitPublicaciones;
    }
    /*Añadimos las publicaciones.*/
    todasPublicaciones.value.push(...publicaciones);
  } catch (error) {
  } finally {
    loadingP.value = false;
  }
}

/*Función para buscar publicaciones.*/
function buscarPublicaciones() {
  todasPublicaciones.value = [];
  offsetPublicaciones.value = 0;
  noMorePublicaciones.value = false;
  cargarPublicaciones();
}

/*Función para borrar el filtro de usuarios.*/
function borrarFiltroPublicaciones() {
  busquedaPublicaciones.value = "";
  todasPublicaciones.value = [];
  offsetPublicaciones.value = 0;
  noMorePublicaciones.value = false;
  cargarPublicaciones();
}

/*Función para cargar os usuarios dinámicamente.*/
function handleScroll() {
  const currentScroll = window.scrollY + window.innerHeight;
  const scrollThreshold = document.body.offsetHeight - 100;

  if (currentScroll > maxScrollReached.value && currentScroll > scrollThreshold) {
    if (vistaBusqueda.value === 'Usuarios') {
      cargarUsuarios();
    } else if(vistaBusqueda.value === 'Publicaciones'){
      cargarPublicaciones();
    }
    maxScrollReached.value = currentScroll;
  }
}

/*Cuando se monta la vista, llamamos a las funciones y añadimos el evento de escucha del scroll.*/
onMounted(() => {
  buscarProductos()
  cargarUsuarios();
  window.addEventListener('scroll', handleScroll);
});

/*Cuando se desmonta la vista eliminamos el evento de escucha del scroll.*/
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

/*En función de si hay publicaciones o no añadimos una clase u otra al div de cargando.*/
const claseUsuarios = computed(() => {
  return todosUsuarios.value.length === 0 ? 'vacio' : 'lleno';
});

/*En función de si hay publicaciones o no añadimos una clase u otra al div de cargando.*/
const clasePublicaciones = computed(() => {
  return todasPublicaciones.value.length === 0 ? 'vacio' : 'lleno';
});

/*Función para obtener la foto de perfil del usuario para que esta sea visible en las publicaciones a la hora de comentar.*/
async function obtenerTuFotoPerfil() {
  if (userActive.value == true) {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select("*")
      .eq('id', userId.value);
    if (error) {
      fotoPerfil.value = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg';
      return;
    }
    fotoTuPerfilMostrar.value = usuario[0].fotoperfil;
    if (fotoTuPerfilMostrar.value === '/predeterminada.png' || fotoTuPerfilMostrar.value === null || fotoTuPerfilMostrar.value === '') {
      fotoTuPerfilMostrar.value = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg';
    } else {
      /*De lo contrario mostramos la foto de perfil actual del usuario.*/
      fotoTuPerfilMostrar.value = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/' + fotoTuPerfilMostrar.value;
    }
  }
}
</script>
<template>
  <div class="buscador">
    <div class="filtros">
      <button @click="cambiarVista('Usuarios')"
        :class="{ filtroSeleccionado: vistaBusqueda === 'Usuarios', filtrosNoSeleccionado: vistaBusqueda !== 'Usuarios' }">GymBros</button>
      <button @click="cambiarVista('Publicaciones')"
        :class="{ filtroSeleccionado: vistaBusqueda === 'Publicaciones', filtrosNoSeleccionado: vistaBusqueda !== 'Publicaciones' }">Publicaciones</button>
      <button @click="cambiarVista('Productos')"
        :class="{ filtroSeleccionado: vistaBusqueda === 'Productos', filtrosNoSeleccionado: vistaBusqueda !== 'Productos' }">Productos</button>
    </div>
  </div>
  <div v-if="vistaBusqueda === 'Usuarios'" class="usuarios">
    <div class="search-producto buscar_usuario">
      <font-awesome-icon class="lupa" :icon="['fas', 'magnifying-glass']" />
      <input type="text" v-model="busquedaUsuarios" placeholder="Escribe aquí" />
      <font-awesome-icon class="cross quitar_filtro_usuario" :icon="['fas', 'xmark']" @click="borrarUsuario" />
      <button @click="buscarUsuarios" v-if="mostrarBotonBuscar" class="publicar_boton">Buscar</button>
    </div>
    <div class="vista-usuarios">
      <template v-for="usuario in todosUsuarios" :key="usuario.id">
        <RouterLink :to="{ name: 'profile', params: { gymtag: usuario.gymtag } }" class="usuario-card-link">
          <div class="usuario-card">
            <img :src="usuario.fotoPerfil" alt="Foto de perfil" class="usuario-foto" />
            <div class="usuario-info">
              <h2>@{{ usuario.gymtag }}</h2>
              <p>{{ usuario.nombre }} {{ usuario.apellidos }}</p>
            </div>
            <div class="usuario-estadisticas">
              <span>Seguidores: {{ usuario.numSeguidores }}</span>
              <span>Seguidos: {{ usuario.numSeguidos }}</span>
            </div>
          </div>
        </RouterLink>
      </template>
      <div v-if="loading" :class="['div_cargando', claseUsuarios]">
        <div class="cargando"></div>
      </div>
    </div>
  </div>
  <div v-if="vistaBusqueda === 'Publicaciones'" class="publicaciones">
    <div class="search-producto buscar_usuario" :class="vistaBusqueda === 'Publicaciones' ? 'pub' : ''">
      <font-awesome-icon class="lupa" :icon="['fas', 'magnifying-glass']" />
      <input type="text" v-model="busquedaPublicaciones" placeholder="Escribe aquí" />
      <font-awesome-icon class="cross quitar_filtro_usuario" :icon="['fas', 'xmark']"
        @click="borrarFiltroPublicaciones" />
      <button @click="buscarPublicaciones" v-if="mostrarBotonBuscar" class="publicar_boton">Buscar</button>
    </div>
    <div class="vista">
      <template v-for="publicacion in todasPublicaciones" :key="publicacion.idpublicacion">
        <div :data-publicacion-id="publicacion.idpublicacion">
          <Publicacion :publicacionUnica="publicacion" :ProfileView="false"
            :fotoTuPerfilMostrar="fotoTuPerfilMostrar" />
        </div>
      </template>
    </div>
    <div v-if="loadingP" :class="['div_cargando2', clasePublicaciones]">
      <div class="cargando"></div>
    </div>
  </div>
  <div class="productos-comun" v-if="vistaBusqueda === 'Productos'">
    <div class="search-producto buscar_usuario">
      <font-awesome-icon class="lupa" :icon="['fas', 'magnifying-glass']" />
      <input type="text" v-model="busquedaAlimento" placeholder="Escribe aquí" />
      <font-awesome-icon class="cross quitar_filtro_usuario" :icon="['fas', 'xmark']" @click="borrar" />
      <button @click="buscarProductos" v-if="mostrarBotonBuscar" class="publicar_boton boton_productos">Buscar</button>
    </div>
    <div class="scanner-padre">
      <button class="btn-scanner" @click="mostrarScanner()">Escanear producto</button>
      <div id="reader"></div>
      <div id="result"></div>
    </div>
    <div class="error_buscar_producto" v-if="error_buscar_producto">
      <h2>No hay coincidencias.</h2>
    </div>
    <div class="reja-productos" :class="{ 'invisible': vistaUnica }" v-if="!error_buscar_producto">
      <div v-if="cargando" class="cargando_productos">
        <div class="cargando"></div>
      </div>
      <template v-for="producto in productos" :key="producto.code" v-if="!cargando">
        <div class="mini-producto-padre">
          <div class="mini-producto" @click="mostrarProducto(producto.id)">
            <h2 v-if="(nombre(producto) + cantidad(producto)).length > 50" class="mini-nombre">{{ (nombre(producto) &&
              cantidad(producto)) ? (nombre(producto) +
                cantidad(producto)).slice(0, 50) : (nombre(producto) !== false ? nombre(producto) : producto.id) }}...
            </h2>
            <h2 v-if="(nombre(producto) + cantidad(producto)).length <= 50" class="mini-nombre">{{ (nombre(producto) &&
              cantidad(producto)) ? (nombre(producto) +
                cantidad(producto)) : (nombre(producto) !== false ? nombre(producto) : producto.id) }}</h2>
            <div class="mini-img">
              <img :src="imagen(producto)" />
            </div>
            <div class="mini-scores">
              <img :src="urlNutriScore(producto)" class="mini-nutri" />
              <img :src="urlNovaScore(producto)" class="mini-nova" />
              <img :src="urlEcoScore(producto)" class="mini-eco" />
            </div>
          </div>
        </div>
      </template>
    </div>
    <div class="pagination-controls" :class="{ 'invisible': buscado && vistaUnica }"
      v-if="!cargando && !error_buscar_producto">
      <button @click="paginaAnterior" :disabled="pagina === 1" :class="{ 'disabled-button': pagina === 1 }">
        <font-awesome-icon :icon="['fas', 'chevron-left']" />
      </button>
      <span>{{ pagina }} / {{ totalPaginasComputed }}</span>
      <button @click="paginaSiguiente" :disabled="pagina === totalPaginas"
        :class="{ 'disabled-button': pagina === totalPaginas }">
        <font-awesome-icon :icon="['fas', 'chevron-right']" />
      </button>
    </div>
  </div>
  <div class="productos" :class="{ 'invisible': !vistaUnica && vistaBusqueda === 'Productos' }"
    v-if="vistaBusqueda === 'Productos'">
    <div class="producto-arriba">
      <font-awesome-icon @click="cerrarProducto()" class="cross-interno" :icon="['fas', 'xmark']" />
      <div class="producto-img">
        <img :src="ProductoFoto" alt="" class="img-producto" />
      </div>
      <div class="producto-general">
        <div class="general-texto">
          <h2 class="producto-nombre">{{ ProductoNombre !== false ? ProductoNombre : codigo }}</h2>
          <p class="producto-cantidad">
          <div>Cantidad: </div>{{ ProductoCantidad && ProductoCantidad.trim() !== '' ? ProductoCantidad + '.' : '?' }}
          </p>
          <p class="producto-ingredientes">
          <div>Ingredientes: </div>{{ ProductoIngredientes + '.' ?? '?' }}</p>
        </div>
        <div class="general-scores">
          <img class="producto-nutriscore" :src="ProductoNutriScore" alt="" />
          <img class="producto-novagroup" :src="ProductoNovaGroup" alt="" />
          <img class="producto-ecoscore" :src="ProductoEcoScore" alt="" />
        </div>
      </div>
    </div>
    <div class="producto-nutrientes">
      <div class="tabla-nutrientes">
        <div class="tr">
          <div class="th">Información nutricional</div>
          <div class="th">Por 100 g / 100 ml</div>
        </div>
        <div class="tr">
          <div>Energía</div>
          <div>{{ ProductoKjul_100 ?? '?' }} Kj <br> {{ ProductoKcal_100 ?? '?' }} Kcal</div>
        </div>
        <div class="tr">
          <div>Grasas</div>
          <div>{{ ProductoFat_100 ?? '?' }} {{ ProductoFatUnit }}</div>
        </div>
        <div class="tr">
          <div>Grasas saturadas</div>
          <div>{{ ProductoSaturedFat_100 ?? '?' }} {{ ProductoSaturedFatUnit }}</div>
        </div>
        <div class="tr">
          <div>Carbohidratos</div>
          <div>{{ ProductoCarbohydrates_100g ?? '?' }} {{ ProductoCarbohydratesUnit }}</div>
        </div>
        <div class="tr">
          <div>Fibra</div>
          <div>{{ ProductoFiber_100 ?? '?' }} {{ ProductoFiberUnit }}</div>
        </div>
        <div class="tr">
          <div>Proteinas</div>
          <div>{{ ProductoProteins_100 ?? '?' }} {{ ProductoProteinsUnit }}</div>
        </div>
        <div class="tr">
          <div>Sal</div>
          <div>{{ ProductoSalt_100 ?? '?' }} {{ ProductoSaltUnit }}</div>
        </div>
        <div class="tr">
          <div>Azucar</div>
          <div>{{ ProductoSugars_100 ?? '?' }} {{ ProductoSugarsUnit }}</div>
        </div>
        <div class="tr">
          <div>Alcohol</div>
          <div>{{ ProductoAlcohol_100 ?? '?' }} {{ ProductoAlcoholUnit }}</div>
        </div>
      </div>
      <div class="tabla-nutriscore">
        <div class="positive-points points">
          <h3>Puntos positivos: {{ ProductoPositivePoints ?? '?' }}</h3>
          <span>Proteinas: {{ ProductoProteinsPoints ?? '?' }}/5</span>
          <span>Fibra: {{ ProductoFiberPoints ?? '?' }}/5</span>
          <span>Frutas, vegetales, nueces y aceites de colza/nuez/oliva : {{ ProductoFruitsPoints ?? '?' }}/5</span>

        </div>
        <div class="negative-points points">
          <h3>Puntos negativos: {{ ProductoNegativePoints ?? '?' }}</h3>
          <span>Energía: {{ ProductoEnergyPoints ?? '?' }}/10</span>
          <span>Azucares: {{ ProductoSugarsPoints ?? '?' }}/10</span>
          <span>Grasas saturadas: {{ ProductoSaturatedPoints ?? '?' }}/10</span>
          <span>Sodio: {{ ProductoSodiumPoints ?? '?' }}/10</span>
        </div>
      </div>
      <div class="nutriscore-points">
        <img class="total-nutriscore" :src="ProductoNutriScore" alt="" />
        <h3>Puntuación total: {{ ProductoNutriScorePoints ?? '?' }}</h3>
      </div>
    </div>
  </div>
  <footer></footer>
</template>
<style scoped>
@keyframes rotate {
  0% {
    transform: rotate(0deg) translateX(3px);
  }

  20% {
    transform: rotate(5deg) translateX(3px);
  }

  40% {
    transform: rotate(-5deg) translateX(3px);
  }

  60% {
    transform: rotate(5deg) translateX(3px);
  }

  80% {
    transform: rotate(-5deg) translateX(3px);
  }

  100% {
    transform: rotate(0deg) translateX(3px);
  }
}

.animate-button {
  animation: rotate 0.5s;
}

.error_buscar_producto {
  margin-left: 60px;
  margin-top: 150px;
}

.pagination-controls {
  margin: 40px 0 10px 60px;
  display: flex;
  align-items: center;
  font-size: 25px;
  color: rgba(255, 255, 255, 0.92);
  color: var(--dark-blue);
  font-weight: bold;
}

.pagination-controls button {
  font-size: 26px;
  border: none;
  height: fit-content;
  width: 30px;
  margin: 0 8px;
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  background-color: var(--dark-blue);
  padding: 2px 4px;
  border-radius: 4px;
  border: 2px solid black;
}

.disabled-button {
  background-color: #213555 !important;
  cursor: not-allowed !important;
  color: rgba(255, 255, 255, 0.557) !important;
  border: 2px solid rgba(0, 0, 0, 0.86) !important;
}

.cargando_productos {
  width: 100% !important;
  left: 30px;
  display: flex;
  justify-content: center;
  margin: 100px 0 140px;
  position: absolute;
  top: 400px;
}

.cargando_productos .cargando {
  position: relative;
}

.publicar_boton {
  cursor: pointer;
  background-color: var(--blue-buttons);
  border: solid var(--black) 2px;
  border-radius: 2px;
  font-size: 16px;
  transition: background-color 0.5s, border 0.5s, color 0.5s;
  height: 28px;
  padding: 0 10px;
  transform: translateX(3px);
}

.invisible {
  display: none !important;
}

.publicar_boton:hover,
.publicar_boton:active {
  background-color: var(--very-dark-blue);
  color: var(--light-blue-text);
  border: 2px solid var(--grey-buttons-inputs-border);
}

.usuarios {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding-bottom: 20px;
}

.vista-usuarios {
  width: 80%;
  margin-left: 60px;
  margin-top: -25px;
}

.usuario-card {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 3px solid black;
  padding: 20px;
  margin: 10px 0;
  border-radius: 10px;
  border-color: black;
  background-color: var(--blue-inputs);
  box-shadow: 0 0px 4px rgba(0, 0, 0, 0.607);
  transition: background-color 0.3s ease, color 0.3s ease;
  color: var(--light-blue-text);
}

.usuario-foto {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid var(--black);
  margin-right: 20px;
  object-fit: cover;
  transition: border-color 0.3s ease;
  background-color: var(--black);
  object-fit: cover;
  transition: border 0.3s;
}

.usuario-card:hover,
.usuario-card:active {
  scale: 1.001;
  background-color: #1c356c;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.848);
  color: white;
}

.usuario-card:hover .usuario-foto,
.usuario-card:active .usuario-foto {
  border: 2px solid black;
}

.usuario-info {
  flex: 1;
}

.usuario-info h2 {
  margin: 0;
  font-size: 1.5em;
  font-style: bold;
}

.usuario-info p {
  margin: 5px 0;
}

.usuario-estadisticas {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.usuario-estadisticas span {
  margin: 2px 0;
  font-size: 1.3em;
}

.usuario-card-link {
  text-decoration: none;
  color: inherit;
}

.usuario-foto:hover,
.usuario-info:hover,
.usuario-info h2:hover,
.usuario-info h2:hover,
.usuario-info p:hover,
.usuario-estadisticas:hover,
.usuario-estadisticas span:hover,
.usuario-card-link:hover {
  color: aliceblue;
}

.usuario-foto:hover {
  border-color: aliceblue;
}

.buscador {
  margin: 80px 0 0 60px;
}

.filtros * {
  width: 33.33%;
  padding: 10px;
  font-weight: bold;
  border: 1px solid black;
  height: 42px;
  font-size: 18px;
}

.filtroSeleccionado {
  background-color: var(--dark-blue);
  color: var(--light-blue-text);
}

.filtrosNoSeleccionado {
  background-color: var(--light-blue-text);
  color: var(--dark-blue);
}

.productos-comun {
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.search-producto {
  position: relative;
  width: 40%;
  height: 30px;
  display: flex;
  align-items: center;
  margin-top: 35px;
  margin-bottom: 45px;
  margin-left: 60px;
}

.search-producto .lupa {
  position: absolute;
  height: 65%;
  left: 5px;
}

.search-producto input {
  height: 100%;
  width: 100%;
  padding-left: 30px;
  padding-right: 5px;
  font-size: 18px;
  border: 2px solid black;
  border-radius: 8px;
}

.search-producto input:focus {
  outline: none;
}

.search-producto .cross {
  position: absolute;
  right: 5px;
  height: 65%;
}

.search-producto .cross:hover {
  cursor: pointer;
}

.scanner-padre {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: 60px;
  margin-bottom: 10px;
}

.btn-scanner {
  width: 20%;
  min-width: 250px;
  margin: auto;
  margin-bottom: 10px;
  background-color: var(--blue-inputs);
  border: 2px solid var(--black);
  padding: 5px;
  color: var(--light-blue-text);
  font-size: 18px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.496);
  transition: box-shadow 0.3s, background-color 0.3s;
  cursor: pointer;
}

.btn-scanner:hover,
.btn-scanner:active {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.496), 0 2px 15px rgba(0, 0, 0, 0.496);
  background-color: #243e76;
}

#reader {
  position: relative;
  margin-top: 15px;
  margin-bottom: 15px;
  width: 60%;
}

.ocultar-i {
  position: absolute !important;
  background-color: rgb(181, 57, 57) !important;
  height: 150px !important;
  width: 50px !important;
  right: 0 !important;
  z-index: 100 !important;
  background: var(--bg-color) !important;
}

.reja-productos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  width: 70%;
  margin-left: 60px;
  margin-top: 10px;
}

.mini-producto-padre {
  display: flex;
  justify-content: center;
}

.mini-producto {
  display: flex;
  flex-direction: column;
  border: 2px solid black;
  height: 320px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 0 2px black, 0 0 4px black, 0 0 8px rgba(0, 0, 0, 0.616);
  transition: box-shadow 0.3s, transform 0.3s;
  cursor: pointer;
}

.mini-producto:hover,
.mini-producto:active {
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.524), 0 0 2px black, 0 0 6px rgba(0, 0, 0, 0.853);
  transform: translateY(-2px);
}

.mini-nombre {
  width: 80%;
  height: 20%;
  font-size: clamp(9px, 1.4em, 20px);
  margin: 10px;
  margin-left: 15px;
}

.mini-img {
  height: 55%;
  background-color: white;
  padding: 10px;
}

.mini-img img {
  object-fit: contain;
  width: 100%;
  height: 100%;
}

.mini-scores {
  height: 20%;
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  margin-bottom: 5px;
}

.mini-nutri {
  max-height: 75%;
  max-width: 30.33%;
}

.mini-nova {
  height: 70%;
}

.mini-eco {
  max-width: 25.33%;
}

.quitar_filtro_usuario {
  transform: translateX(-77px);
}

@keyframes heartbeat {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

.boton_header {
  font-weight: bold;
  text-decoration: none;
  background-color: #3d5a98;
  color: var(--light-blue-text);
  border: 2px solid var(--black);
  cursor: pointer;
  border-radius: 25px;
  text-align: center;
  transition: border 0.5s;
}

.boton_header:hover,
.boton_header:active {
  border-color: #eef2fa81;
}

.publicaciones {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 60px;
  margin-bottom: 100px;
}

.vista {
  margin-top: 0px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 80%;
  max-width: 1280px;
}

@keyframes loading {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.div_cargando {
  display: flex;
  justify-content: center;
}

.div_cargando2 {
  display: flex;
  justify-content: center;
  width: 100%;
}

.cargando {
  border: 6px solid rgba(0, 0, 0, 0.898);
  border-radius: 100%;
  border-top-color: transparent;
  border-bottom-color: transparent;
  width: 60px;
  height: 60px;
  animation: loading 1.5s infinite linear;
}

.vacio {
  margin-top: 300px;
}

.lleno {
  margin-top: 8px;
}

@media (max-width: 1100px) {
  .reja-productos {
    width: 90%;

  }

  .mini-producto {
    width: 250px;
  }
}

@media (max-width: 875.5px) {
  .pagination-controls {
    margin-left: 0;
  }

  .buscador {
    margin: 60px 0 0 0px;
  }

  .error_buscar_producto {
    margin-left: 0;
  }

  .vista-usuarios {
    width: 92%;
    margin-left: 0px;
    margin-top: 5px;
  }

  .vista {
    display: flex;
    flex-direction: column;
    padding-bottom: 40px;
    min-height: 77.9vh;
    width: 80%;
  }

  .usuario-card {
    margin-left: 0px;
  }

  .search-producto {
    width: 70%;
    margin-left: 0;
  }

  .scanner-padre {
    margin-left: 0;
  }

  .reja-productos {
    margin-left: 0;
  }

  .mini-producto {
    width: 100%;
  }

  .publicaciones {
    margin-left: 0;
    padding-top: 0;
    background-color: #0d285e;
    margin-bottom: 45px;
    min-height: 98vh;
  }

  .buscar_usuario {
    margin-bottom: 20px;
  }

  .cargando_productos {
    left: 0;
  }

  .pagination-controls {
    margin-bottom: 70px;
  }
}

@media (max-width: 625px) {
  .publicaciones {
    margin-left: 0;
  }

  .vista {
    width: 100%;
    margin: 0px;
    margin-top: 5px;
  }

  .pub {
    width: 92% !important;
    margin: 10px 0 10px;
  }

  .search-producto {
    margin-top: 40px;
  }
}

@media(max-width:590px) {
  .usuario-info h2 {
    font-size: 20px;
  }

  .usuario-estadisticas span {
    font-size: 18px;
  }

  .usuario-card {
    padding: 15px;
  }

  .usuario-foto {
    margin-right: 15px;
  }
}

@media(max-width:566.5px) {
  .mini-producto {
    width: 80%;
  }
}

@media(max-width:495px) {
  .usuario-info h2 {
    font-size: 16px;
  }

  .usuario-estadisticas span {
    font-size: 14px;
  }

  .usuario-card {
    padding: 10px;
  }

  .usuario-foto {
    margin-right: 12px;
    width: 50px;
    height: 50px;
  }

  .usuario-estadisticas {
    font-size: 14px;
  }
}

@media(max-width: 440px) {
  .filtros * {
    font-size: 16px;
  }
}

@media(max-width: 395px) {
  .filtros * {
    font-size: 14px;
    padding: 7px;
  }

  .usuario-estadisticas {
    display: none;
  }
}

@media(max-width: 325px) {
  .filtros * {
    font-size: 13px;
    padding: 5px;
  }
}


@media(max-width: 305px) {
  .usuario-foto {
    margin-right: 12px;
    width: 40px;
    height: 40px;
  }
}

.productos {
  margin-left: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -20px;
}

.producto-arriba {
  position: relative;
  display: flex;
  width: 80%;
  background-color: #5984df;
  min-height: 300px;
  max-height: 600px;
  padding: 24px;
  border-radius: 25px;
  border: 2px solid black;
  margin-bottom: 20px;
  box-shadow: 0 0 3px black, 0 0 6px rgba(0, 0, 0, 0.819);
}

.cross-interno {
  font-size: 20px;
  position: absolute;
  top: 15px;
  right: 15px;
}

.cross-interno:hover {
  cursor: pointer;
}

.producto-img {
  display: flex;
  align-items: center;
  justify-content: center;
  height: fit-content;
  width: 40%;
  min-width: 220px;
  max-width: fit-content;
  border: 2px solid black;
  border-radius: 20px;
  padding: 20px;
  margin-right: 20px;
  background-color: white
}

.img-producto {
  width: 100%;
  height: 100%;
  max-height: 500px;
  object-fit: contain;
}

.producto-general {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.producto-nombre {
  margin-top: 20px;
}

.producto-cantidad {
  display: flex;
  align-items: center;
  margin-top: 10px
}

.producto-ingredientes {
  margin-top: 10px;
  margin-bottom: 20px;
}

.producto-cantidad div {
  margin-right: 5px;
}

.general-scores {
  display: flex;
  align-items: center;
  width: 80%;
  margin: 20px auto;
}

.general-scores img {
  width: 30%;
}

.general-scores .producto-novagroup {
  width: 20%;
}

.producto-nutriscore {
  width: 40%;
  max-width: 200px;
}

.producto-novagroup {
  width: 20%;
  max-width: 80px;
  margin: 0 10% 0 10%;
  background-color: white;
  padding: 7px;
  border-radius: 7%;
}

.producto-ecoscore {
  width: 40%;
  max-width: 200px;
}

.producto-nutrientes {
  margin-bottom: 60px;
  border-radius: 25px;
  background-color: #5984df;
  padding: 24px;
  border: 2px solid black;
  width: 80%;
  box-shadow: 0 0 3px black, 0 0 6px rgba(0, 0, 0, 0.819);
}

.tabla-nutrientes {
  border: 1px solid black;
  background-color: white;
  border-radius: 6px;
  overflow: hidden;
}

.tabla-nutrientes .th {
  display: flex;
  font-size: x-large;
  font-weight: 600;
  background-color: #0c1f49;
  color: var(--light-blue-text);
}

.tabla-nutrientes> :nth-child(even) {
  background-color: #c0c0c0;
}

.tabla-nutrientes> :nth-child(odd) {
  background-color: #e6e6e6;
}

.tabla-nutrientes .tr {
  display: flex;
  border: 1px solid black;
}

.tabla-nutrientes .tr div {
  width: 50%;
  display: flex;
  align-items: center;
  padding: 5px;
}

.tabla-nutrientes .tr :first-child {
  border-right: 2px solid black;
}

.tabla-nutriscore {
  display: flex;
}

.points {
  display: flex;
  flex-direction: column;
  margin: 20px;
  width: 50%;
}

.points span {
  margin: 2px;
}

.nutriscore-points {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10%;
}

@media (max-width: 875px) {
  .productos {
    margin-left: 0;
  }

  .producto-arriba {
    flex-direction: column;
    align-items: center;
    max-height: fit-content;
    justify-content: center
  }

  .cross-interno {
    top: 10px;
    right: 12px;
  }

  .producto-img {
    min-width: calc(100% - 14px);
    width: fit-content;
    max-width: calc(100% - 14px);
    min-height: auto;
    margin: 7px;
    margin-bottom: 0;
    max-height: 600px;
  }

  .img-producto {
    height: 30%;
    margin: 0;

  }

  .tabla-nutriscore {
    display: block;
    width: 100%;
  }

  .points {
    width: 100%;
  }

  .producto-general h2 {
    text-align: center;
  }

  .total-nutriscore {
    width: 40%;
  }

  .general-scores {
    margin: auto;
    width: 80%;
    justify-content: center;
  }

  .producto-nutrientes {
    margin-bottom: 100px;
  }

  .btn-scanner {
    margin-top: 20px;
    margin-bottom: 0;
  }
}

@media (max-width: 655px) {
  .points {
    margin: 20px 0;
  }

  .search-producto {
    width: 92%;
  }

  .pub {
    width: 70%;
  }
}

@media (max-width: 450px) {
  .btn-scanner {
    width: 50%;
    min-width: 60px;
    font-size: 1em;
  }

  .tr {
    font-size: 0.8em;

  }

  .tr .th {
    font-size: 0.9em;
  }

}
</style>