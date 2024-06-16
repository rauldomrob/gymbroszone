<script setup>
/*Import de los iconos.*/
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
</script>
<template>
  <nav>
    <div class="borde"></div>
    <div class="botonesNav">
      <div>
        <RouterLink to="/" class="RouterLink">
          <font-awesome-icon class="icon" :icon="['fas', 'house']" />
        </RouterLink>
      </div>
      <div>
        <RouterLink to="/search" class="RouterLink">
          <font-awesome-icon class="icon" :icon="['fas', 'magnifying-glass']" />
        </RouterLink>
      </div>
      <div>
        <RouterLink to="/post" class="RouterLink">
          <font-awesome-icon class="icon" :icon="['fas', 'circle-plus']" />
        </RouterLink>
      </div>
      <div>
        <RouterLink to="/liked" class="RouterLink">
          <font-awesome-icon class="icon" :icon="['fas', 'heart']" />
        </RouterLink>
      </div>
      <div>
        <RouterLink to="/saved" class="RouterLink">
          <font-awesome-icon class="icon" :icon="['fas', 'bookmark']" />
        </RouterLink>
      </div>
    </div>
  </nav>
</template>
<style scoped>
nav {
  background-color: var(--dark-blue);
  color: var(--light-blue-text);
  width: 100%;
  height: 60px;
  position: fixed;
  bottom: -11px;
  z-index: 100;
  display: flex;
  align-items: center;
  flex-direction: column;
}

.borde {
  width: 100%;
  background-color: #eef2fa;
  height: 1px;
  transform: scaleY(0.4);
  transform-origin: top;
}

nav .botonesNav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 80%;
  margin-top: 10px;
  z-index: 10;
}

div .RouterLink {
  display: flex;
  align-items: center;
  cursor: pointer;
}

nav>div {
  height: fit-content;
  margin: 0 20px;
}

.icon {
  color: var(--light-blue-text);
  width: 30px;
  height: 30px;
}

@media (max-width: 600px) {
  nav>div {
    margin: 0 10%;
  }
}

@media (max-width: 360px) {
  nav .botonesNav {
    justify-content: space-around;
    width: 100%;
  }
}
</style>