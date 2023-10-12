<template>
  <div v-if="userData" style="background-color: #ffff; height: 86vh; overflow-y: auto">
    <v-form>
      <v-container style="padding-left: 10%;
    padding-right: 10%;">
        <v-toolbar-title style="font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 15px;">Perfil</v-toolbar-title>
  <v-row justify="center">
    <v-col cols="12" sm="6"> 
       <v-card-text>
        <v-text-field v-model="userData.nombre" label="Nombre" variant="outlined" readonly></v-text-field>
        <v-text-field v-model="userData.apellido" label="Apellido" variant="outlined"  readonly></v-text-field>
        <v-text-field v-model="userData.email" label="Email" variant="outlined" readonly></v-text-field>
        <v-text-field v-model="userData.direccion" label="Direccion" variant="outlined" readonly></v-text-field>
        <v-text-field v-model="userData.departamento" label="Departamento" variant="outlined" readonly></v-text-field>
        <v-text-field v-model="userData.pais" label="Pais" variant="outlined" readonly></v-text-field>
      </v-card-text>
    </v-col>

    <v-col cols="12" sm="6">   
      <v-card-text>
        <v-text-field v-model="userData.rol" label="Rol Usuario" variant="outlined" readonly></v-text-field>
        <v-text-field v-model="userData.usuario" label="Usuario" variant="outlined" readonly ></v-text-field>
        <v-text-field  v-model="userData.clave" label="Clave" variant="outlined" readonly></v-text-field>
       </v-card-text> 
    </v-col>
  </v-row>
</v-container>
</v-form>
</div>
</template>
  
<script>
import { mapState } from 'vuex';

export default {
  name:"perfil_usuario",

  computed: {
    ...mapState(['userData']), 
},

}
</script> 
  