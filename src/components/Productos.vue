<template>
  <v-data-table :headers="headers" :items="desserts" :search="search"  :sort-by="[{ key: 'calories', order: 'asc' }]" class="elevation-1" style="height: 86vh; overflow-y: auto ;">
    <template v-slot:top>
      <v-toolbar flat style=" border: none; padding: 18px;  background-color: rgb(6 0 255 / 11%)">
        <v-container>
          <v-toolbar-title style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">Productos</v-toolbar-title>
        </v-container>

          <!--aqui inicia buscador-->
          <v-container>
            <v-responsive max-width="550" class="d-flex justify-center">
              <v-text-field v-model="search" append-icon="mdi-magnify" label="Buscar" single-line hide-details></v-text-field>
            </v-responsive>
          </v-container>
          <!--aqui finaliza buscador-->

        
        <v-spacer></v-spacer> 
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ props }">
            <v-btn dark class="mb-2" v-bind="props" style="border-radius: 5px; border-width: 1px; color: #ffff ;background: linear-gradient(45deg, #6949EA, #DF4CF2);">+ Crear nuevo </v-btn>
            <v-btn  class="mb-2" @click="exportarInventarioExcel" ><v-icon  title="Descargar Inventario">  mdi-download </v-icon></v-btn>            
        
          <CarritoVenta/>  
          </template>
          <v-card>
            <v-card-title>  
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.id" label="id"></v-text-field> 
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.producto" label="Producto"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.fecharegistro" label="Fecha de Registro"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.stock" type="number" @input="handleStockInput" label="Stock"  min="0"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.descripcion" label="Descripcion"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.preciocosto" type="number" label="Precio Costo" :prefix="currencySymbol"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.precioventa" type="number" label="Precio Venta" :prefix="currencySymbol"></v-text-field>
                  </v-col>

                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="close">Cancelar</v-btn>
              <v-btn color="blue-darken-1" variant="text" @click="save">Guardar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="text-h5">Estas seguro de liminar este producto?</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="closeDelete">Cancel</v-btn>
              <v-btn color="blue-darken-1" variant="text" @click="deleteItemConfirm">OK</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-icon size="small" class="me-2" @click="editItem(item.raw)" title="Editar">
              mdi-pencil
            </v-icon>
                <v-icon size="small" class="me-2" @click="deleteItem(item.raw)" title="Eliminar">
                  mdi-delete
                </v-icon>
              <v-icon size="small" class="me-2" @click="agregarProducto(item.raw)"  >
            mdi-plus
          </v-icon>
        </template>
      <template v-slot:no-data>
    </template> 
  </v-data-table>
</template>

<script>
import ExcelJS from 'exceljs';
require('jspdf-autotable')
import {useVentasStore}  from "../stores/storer"
import CarritoVenta from './CarritoVenta'
import db from '../firebase/init.js'
import { collection, getDocs, query, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore'


export default {
  name: 'Producto_1',
  components:{CarritoVenta},
  data: () => ({
    dialog: false,
    dialogDelete: false,
    mostrarVentas: false,
    currencySymbol: "$",
    search: '',
    headers: [
      {
        align: 'start',
        sortable: false,
        key: 'name',
      },
      { title: 'id', key: 'id' },
      { title: 'Producto', key: 'producto' },
      { title: 'Fecha Registro', key: 'fecharegistro' },
      { title: 'Descripcion', key: 'descripcion' },
      { title: 'Stock', key: 'stock',},
      { title: 'Precio Costo', key: 'preciocosto' },
      { title: 'Precio Venta', key: 'precioventa' },
      { title: 'Ganancia', key: 'ganancia' },
      { title: 'Actions', key: 'actions', sortable: false },
    ],
    ventas: [],
    desserts: [],
    editedIndex: -1,
    editedItem: {
      id: ' ',
      producto: ' ',
      stock: 0,
      preciocosto: ' ',
      precioventa: ' ',
      fecharegistro:' ',
      descripcion: ' ',
      ganancia:' ',
    },
    defaultItem: {
      id: ' ',
      producto: ' ',
      stock: 0,
      preciocosto: ' ',
      precioventa: ' ',
      fecharegistro:' ' ,
      descripcion: ' ',
      ganancia:' ',
    },
  }),
      computed: {
        formTitle() {
        return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
        },
        productosVentas() {
    return useVentasStore().productosVentas;
  },
      },
      watch: {
        dialog(val) {
        val || this.close()
        },
        dialogDelete(val) {
        val || this.closeDelete()
        },
      },
    created() {
      this.listarProducto();
      useVentasStore().limpiarDesserts();
      const ventasStore = useVentasStore();
      this.desserts = ventasStore.desserts;
    },
  methods: {


    agregarProducto(producto) {
      const productoExistente = useVentasStore().productosVentas.find(
    (item) => item.keyid === producto.keyid
  );
  if (productoExistente) {
    console.log("El producto ya está en el carrito.");
    return;
      }  else {
        const nuevoProducto= {
          cantidadVendida: 1,
          keyid: producto.keyid,
          id: producto.id,
          producto: producto.producto,
          stock: producto.stock,
          preciocosto: producto.preciocosto,
          precioventa: producto.precioventa,
          fecharegistro: producto.fecharegistro,
          descripcion: producto.descripcion,
          ganancia: producto.ganancia,
        };
        this.ventas.push(nuevoProducto); 
        useVentasStore().agregarProducto(nuevoProducto);
        console.log("Producto Agregado Al Carrito Correctamente!")
        this.close();
      }

    },
      toggleMostrarVentas() {
        this.mostrarVentas = !this.mostrarVentas;
      },
      /* Parsear la Stock */
      handleStockInput() {
        this.editedItem.stock = parseFloat(this.editedItem.stock);
        this.calculateGanancia();
      },

    async listarProducto() {
      const q = query(collection(db, "Producto"));
      const resul = await getDocs(q);
      resul.forEach((doc) => {
        console.log("id", doc.id);
        this.desserts.push({
          keyid: doc.id, 
          id: doc.data().id,
          producto: doc.data().producto,
          stock: doc.data().stock,
          preciocosto: doc.data().preciocosto,
          precioventa: doc.data().precioventa,
          fecharegistro: doc.data().fecharegistro,
          descripcion: doc.data().descripcion,
          ganancia: doc.data().ganancia,
        })
      })
    },

    async EliminarProductos() {
      console.log(this.editedItem.keyid)
      const Ref = doc(db, "Producto", this.editedItem.keyid);
      await deleteDoc(Ref, {
        producto: this.editedItem.producto,
        stock: this.editedItem.stock,
        preciocosto: this.editedItem.preciocosto,
        precioventa: this.editedItem.precioventa,
        fecharegistro: this.editedItem.fecharegistro,
        descripcion: this.editedItem.descripcion,
        ganancia: this.editedItem.ganancia,
      })
      .then(console.log("Eliminado con exito"))
      .catch(function (error) {console.log(error)
       })
    },

    async ActualizarProductos() {
      const Ref = doc(db, "Producto", this.editedItem.keyid);
      console.log(db,"Producto",this.editedItem.keyid)
      const updatedData = {
        producto: this.editedItem.producto,
        stock: this.editedItem.stock, 
        preciocosto: this.editedItem.preciocosto,
        precioventa: this.editedItem.precioventa,
        fecharegistro: this.editedItem.fecharegistro,
        descripcion: this.editedItem.descripcion,
        ganancia: this.editedItem.ganancia,
      };
      try {
        await updateDoc(Ref, updatedData);
        console.log(Ref, updatedData)
        console.log("Producto actualizado con éxito");
      }  
       catch (error) {console.error("Error al actualizar el producto:", error);
      }
    },

    async createUser() {
      const colRef = collection(db, 'Producto');
      const dataObj = {
        id: this.editedItem.id,
        producto: this.editedItem.producto,
        stock: this.editedItem.stock,
        preciocosto: this.editedItem.preciocosto,
        precioventa: this.editedItem.precioventa,
        fecharegistro: this.editedItem.fecharegistro,
        descripcion: this.editedItem.descripcion,
        ganancia: this.editedItem.ganancia,
      }
        const docRef = await addDoc(colRef, dataObj)
        console.log('El documento ha sido Creado con el siguiente: ID:', docRef.id)
        this.clear()
        this.listarProducto()
    },

    

    calculateGanancia() {
    const costo = parseFloat(this.editedItem.preciocosto);
    const venta = parseFloat(this.editedItem.precioventa);
    if (!isNaN(costo) && !isNaN(venta)) {
      this.editedItem.ganancia = ( venta-costo ).toFixed(0); /* toLocaleString('es-ES', { style: 'decimal', minimumFractionDigits: 3, useGrouping: true }) */
    } else {
      this.editedItem.ganancia = ''; // Si los valores no son válidos, establece ganancia como una cadena vacía
    }
  },



  async exportarInventarioExcel() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Inventario');

  // Definir las columnas en la hoja de cálculo
  worksheet.columns = [
    { header: 'ID', key: 'id' },
    { header: 'Producto', key: 'producto' },
    { header: 'Stock', key: 'stock' },
    { header: 'Precio Costo', key: 'preciocosto' },
    { header: 'Precio Venta', key: 'precioventa' },
    { header: 'Fecha Registro', key: 'fecharegistro' },
    { header: 'Descripción', key: 'descripcion' },
    { header: 'Ganancia', key: 'ganancia' },
  ];

  // Establecer estilos para las filas de encabezado
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'C0C0C0' }, // Color de fondo gris
    };
    cell.border = {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
    };
  });

  // Agregar datos al archivo Excel
  this.desserts.forEach((item, index) => {
    const row = worksheet.addRow({
      id: item.id,
      producto: item.producto,
      stock: item.stock,
      preciocosto: item.preciocosto,
      precioventa: item.precioventa,
      fecharegistro: item.fecharegistro,
      descripcion: item.descripcion,
      ganancia: item.ganancia,
    });

    // Aplicar estilos a las celdas en cada fila de datos
    row.eachCell((cell,colNumber) => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: index % 2 === 0 ? { argb: 'FFFFFF' } : { argb: 'F2F2F2' }, // Alternar colores de fondo
    };
    cell.border = {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
    };
    if (colNumber === 3 || colNumber === 4 || colNumber === 7) { // Col 3: Stock, Col 4: Precio Costo, Col 7: Precio Venta
      cell.numFmt = '#,##0.00'; // Formato numérico adecuado, puedes personalizarlo según tus necesidades
    }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  // Crear un Blob y URL para la descarga
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const blobURL = window.URL.createObjectURL(blob);

  // Crear un enlace para la descarga
  const link = document.createElement('a');
  link.href = blobURL;
  link.download = 'Inventario.xlsx';

  // Simular un clic en el enlace para iniciar la descarga
  link.click();

  // Liberar el objeto URL
  window.URL.revokeObjectURL(blobURL);
},
    

    initialize() {
      this.desserts = [
        {
          id: '',
          producto: '',
          stock: 0,
          preciocosto: '',
          precioventa: '',
          fecharegistro: '',
          descripcion: '',
          ganancia:'',
        },

      ]
    },
    
    editItem(item) {
      this.editedIndex = this.desserts.indexOf(item)
        this.editedItem = Object.assign({}, item)
      this.dialog = true
      this.calculateGanancia();
    },

    deleteItem(item) {

      this.editedIndex = this.desserts.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    deleteItemConfirm() {
      this.desserts.splice(this.editedIndex, 1)
      this.closeDelete()
      this.EliminarProductos()
    },

    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
      this.editedItem = Object.assign({}, this.defaultItem)
      this.editedIndex = -1
      })
    },

    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.desserts[this.editedIndex], this.editedItem)
        this.ActualizarProductos()
        this.calculateGanancia();
      } else {
        this.desserts.push(this.editedItem),
          this.createUser()
      }
      this.close()
    },
    clear(){
      
      this.desserts=[]
    }
  }
}

</script>