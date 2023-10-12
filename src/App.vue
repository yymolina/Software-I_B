<template>
  <v-layout>
    <v-app-bar style="background: #7B1FA2" prominent>

      <router-link v-if="!isAuthenticated" to="/home" style="display: block; margin-left: 20px;">
        <v-img class="hello" src="../src/assets/logoinicio.png" width="50px" height="50px" margin-left="10px" />
      </router-link>

      <div v-if="isAuthenticated">
      <strong style="background: #ffff; -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px; font-weight: 600; margin-left: 60px">Iris & Bebi</strong>
    </div>

      <v-spacer></v-spacer>

      <!--<v-btn variant="text" icon="mdi-magnify"></v-btn>-->

      <!-- Menu profile -->
      <div class="text-center" style="width: 120px;">
        <v-menu open-on-hover>
          <template v-slot:activator="{ props }">
            <v-btn color="#fff" v-bind="props" style="background: linear-gradient(45deg, rgb(108 56 255), rgb(124 77 255))"
              prepend-icon="mdi mdi-account"></v-btn>
          </template>

          <v-list style="background-color: #7c4dffdf;">
            <v-list-subheader style="color: #ffff; justify-content: center; font-weight: bold; text-transform: uppercase; letter-spacing: 4px; font-size: 15px;">{{ userData ? userData.usuario : '' }}</v-list-subheader>
            <v-list-item style="color: #ffff" v-for="(item, i) in filteredItems" :key="i" @click="handleAction(item.action)">
              <template v-slot:prepend>
                <v-icon style="color: #ffff">{{ item.icon }}</v-icon>
              </template>
              <v-list-item-title v-text="item.text"></v-list-item-title>
            </v-list-item>
          </v-list>

        </v-menu>
      </div>
    </v-app-bar>
  </v-layout>

  <v-app>

    <v-navigation-drawer v-if="isAuthenticated" color="#ffff" v-model="drawer" :rail="rail" permanent
      @click="rail = false" style="background-color: rgba(6, 0, 255, 0.11);">
    
      <v-list dense nav>

        <div @click.stop="rail = !rail" class="hello"
          style="margin-top: 91px; margin-bottom: 28px; width: 60%; margin-left: 18%;">
          <v-img src="../src/assets/logoIb.png" />
        </div>

        <v-divider></v-divider>

        <!--MENU-->
        <v-list-item color="#df4cf2" prepend-icon="mdi mdi-home-account" title="Home" value="Home" router-link to="/home"
          style=""></v-list-item>

        <v-list-item color="#df4cf2" prepend-icon="mdi mdi-account-group" title="Usuarios" value="Usuario" router-link to="/Usuario_C"
          style="" v-if="isAdmin"></v-list-item>

        <v-list-item color="#df4cf2" prepend-icon="mdi-account-group-outline" title="Clientes" value="Cliente" router-link to="/Cliente"
          style=""></v-list-item>

        <!--SUB MENU-->
        <v-list-item-group>
          <v-list-item color="#df4cf2" @click="toggleSubMenu('subMenu1')" prepend-icon="mdi mdi-tshirt-crew" value="Productos" router-link
            to="/Productos" style="margin-bottom: 1px;">
            <v-list-item-content>
              <v-list-item-title>Productos</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-slide-y-transition>
            <v-list-item-group color="#df4cf2" v-if="openSubMenus.includes('subMenu1')">
              <v-list-item color="#df4cf2" prepend-icon="mdi mdi-shape-plus" style="margin-top: 0px; margin-left: 20px; font-size: 14px;"
                to="/Ventas_Factura">
                <v-list-item-content>
                  <v-list-item-title>Ventas-Facturas</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-slide-y-transition>
          <!-- FINALIZA SUB MENU-->
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-main style="background-color: #E2E4E8; margin-top: 62px; ">
      <router-view></router-view>

      <!-- CAROUSEL -->
      <div>
      <v-carousel v-if="!isAuthenticated" class="fill-height ma-0 custom-carousel" style="width: 100vw; height: 100vh;">
        <v-carousel-item src="../src/assets/banner3.jpg" cover></v-carousel-item>

        <v-carousel-item src="../src/assets/banner2.jpg" cover></v-carousel-item>

        <v-carousel-item src="../src/assets/banner1.jpg" cover></v-carousel-item>
      </v-carousel>
    </div>
    </v-main>

    <!-- FOOTER -->
    <v-container style="max-width: 100%; padding: 0%;">
    <v-footer class=" d-flex " style="background: linear-gradient(45deg, #c08ff4, #c08ff4); justify-content: center; display: flex;" >
    
      <div class="pt-0" style="color:#ffff; font-size: 15px; margin-right: 10%;">
        <v-icon icon="mdi mdi-map-marker"></v-icon>
      Floridablanca - Santander
    </div>
    
      <div class="pt-0" style="color:#ffff; font-size: 15px;">
        <v-icon icon="mdi mdi-whatsapp"></v-icon>
      Contactenos: 321 3013719
    </div>
    
    <div style="margin-left: 10%;">
      <v-img class="hello" src="../src/assets/logoinicio.png" width="50px" height="50px"/>
    </div>
  </v-footer>
</v-container>

  </v-app>
  <!--BOTON PARA CERRAR LOGIN-->
  <v-dialog v-model="showLoginDialog" max-width="650px">
    <Login_1 @close-dialog="showLoginDialog = false"></Login_1>
  </v-dialog>
</template>

<script>
import Login_1 from "../src/components/Login.vue";
import { mapState } from 'vuex';
export default {

  name: 'App',
  computed: {
    ...mapState(['isAuthenticated', 'userData']),
    isAdmin() {
      return this.userData && this.userData.rol === 'admin';
    },
    itemsWithoutLogout() {
      return this.filteredItems.filter(item => item.action !== 'logout');
    },

    filteredItems() {
      if (this.isAuthenticated) {
        return this.items.filter(item => item.text !== 'Iniciar Sesión');
      } else {
        return this.items.filter(item => item.text !== 'Perfil' && item.text !== 'Cerrar Sesión');
      }
    }
  },
  components: {
    Login_1,
  },

  data() {
    return {
      showLoginDialog: false,
      items: [
        { text: 'Iniciar Sesión', icon: 'mdi-login', action: 'goToLogin' },
        { text: 'Perfil', icon: 'mdi-account', action: 'goToProfile' },
        { text: 'Cerrar Sesión', icon: 'mdi-logout', action: 'logout' },
      ],
      drawer: true,
      rail: true,
      openSubMenus: [], // Almacena los submenús abiertos
    };
  },
  methods: {
    toggleSubMenu(subMenu) {
      if (this.openSubMenus.includes(subMenu)) {
        // Si el submenú ya está abierto, ciérralo
        const index = this.openSubMenus.indexOf(subMenu);
        this.openSubMenus.splice(index, 1);
      } else {
        // Si el submenú está cerrado, ábrelo
        this.openSubMenus.push(subMenu);
      }
    },
    handleAction(action) {
      switch (action) {
        case 'goToLogin':
          this.showLoginDialog = true;
          break;
        case 'goToProfile':
          this.$router.push('/Perfil_usuario');
          break;
        case 'logout':
          this.logout('/');
          break;
      }
    },
    logout() {
      this.$store.dispatch('logout'); // Llama a la acción 'logout' del store para limpiar los datos del usuario y marcarlo como no autenticado
      this.$router.push('/');   // Redirecciona al usuario a la página de inicio de sesión
    }
  },
};
</script>