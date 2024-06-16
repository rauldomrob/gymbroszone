<script setup>
import { useRouter } from 'vue-router';
import logo from "../assets/img/logo.png";
const router = useRouter();
/*Redirección para ver las políticas.*/
function verPoliticas() {
  router.push('/policies');
}
</script>
<template>
  <footer>
    <div class="footer">
      <h5>GymBros Zone®</h5>
      <div class="div_imagen"><img :src="logo" alt="Logo" class="logo"></div>
      <h5 @click="verPoliticas" class="hover">Políticas y condiciones</h5>
    </div>
  </footer>
</template>
<style scoped>
.hover {
  cursor: pointer;
  transition: text-shadow 0.3s;
}

.hover:active,
.hover:hover {
  text-shadow: 0 0 4px rgba(255, 255, 255, 0.341);
}

footer {
  background-color: var(--dark-blue);
  height: 80px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  bottom: 0;
  box-shadow: 2px 0 10px var(--black), 3px 0 15px var(--black);
}

h5 {
  margin: auto;
  color: var(--light-blue-text);
  padding: 5px 30px;
  border-radius: 25px;
  font-size: 18px;
}

.footer {
  display: flex;
  text-align: center;
  align-items: center;
}

.div_imagen {
  height: 60px;
  width: 60px;
}

.div_imagen img {
  width: 100%;
  height: 100%;
}

@media(max-width: 820px) {
  footer {
    display: flex;
    justify-content: space-around;
    padding: 0;
  }

  h5 {
    display: block;
    width: 33%;
    padding: 0 15px;
  }
}

@media(max-width: 820px) {
  h5 {
    font-size: 16px;
  }

  .div_imagen {
    height: 50px;
    width: 50px;
  }
}
</style>