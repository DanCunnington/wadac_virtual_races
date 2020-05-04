<template>
  <div id="app">
    <b-container>
      <router-view/>
    </b-container>
  </div>
</template>
<script>
    export default {
        name: 'app',
        created () {
            document.title = "WADAC Virtual Racing";
        }
    }
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding-top: 40px;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
div.modal .modal-full {
  height: 100% !important;
  max-width: 80%;
}

div.modal .modal-full .modal-content{
  height: 80% !important;
}

div.modal .modal-full .modal-body{
  overflow-y: scroll
}

::-webkit-scrollbar {
  -webkit-appearance: none;
  width: 7px;
}

::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: rgba(0, 0, 0, .5);
  box-shadow: 0 0 1px rgba(255, 255, 255, .5);
}

</style>
