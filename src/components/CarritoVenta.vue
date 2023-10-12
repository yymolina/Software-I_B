<template>
  <div >
    <v-row justify="center">
      <v-dialog v-model="dialog" persistent width="auto">
        <template v-slot:activator="{ props }">
          <v-btn style="margin-top: -10px; margin-right: 31%;;position: fixed;" color="purple" v-bind="props" >
          Venta
        </v-btn>
      </template>
        <v-card >
          <v-card-title class="text-h5">
            Venta
            <v-progress-linear style="margin-left: 0px;" v-if="cargando" color="purple" indeterminate reverse></v-progress-linear>
          </v-card-title>
        <v-card-text>
          <v-alert v-if="stockInsuficiente" type="error" dense outlined>
            No hay suficiente stock disponible para uno o más productos.
          </v-alert>
            <v-alert v-if="cantidadInvalida" type="error" dense outlined>
              "Rellena la cantidad para realizar una venta"
            </v-alert>
              <v-table class="table">
                <thead >
                  <tr > 
                    <th>id</th>
                    <th>Nombre</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                    <tr v-for="(producto, index) in productosVentas" :key="index">
                    <td v-if="mostrarColumnaKeyid" >{{ producto.keyid }}</td>
                    <td>{{ producto.id }}</td>
                    <td>{{ producto.producto }}</td>
                    <td><input type="number" v-model="producto.cantidadVendida" @input="updateSubtotal(producto)" min="1"/></td>
                    <td>{{ '$' + producto.precioventa }}</td>
                    <td>{{ '$' + (producto.cantidadVendida * producto.precioventa).toLocaleString('es-ES', { style: 'decimal', minimumFractionDigits: 0, useGrouping: true }) }}</td>
                    <td><v-btn  color="red" icon @click="eliminarProducto(producto)"><v-icon>mdi-delete</v-icon></v-btn></td>
                    </tr>
                    <tfoot v-if="productosVentas.length > 0">
                    <tr>
                    <td colspan="4"></td>
                    <td class="text-h7">TOTAL: &nbsp;</td>
                    <td class="text-h7"> {{'$' + totalCarrito.toLocaleString('es-ES', { style: 'decimal', minimumFractionDigits: 0, useGrouping: true }) }}</td>
                    </tr>
                    </tfoot>
                </tbody>  
              </v-table>
          </v-card-text>
          <v-card-actions >
          <v-spacer></v-spacer>
            <v-btn color="purple" variant="text" @click="dialog = false">
              Cancelar Venta
            </v-btn>
            <v-btn color="purple" variant="text" @click="realizarVenta()">
              Realizar Venta
            </v-btn>
        </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>
<script>
import jsPDF from 'jspdf';
require('jspdf-autotable')
import { useVentasStore } from "../stores/storer"
import db from '../firebase/init.js'
import { collection,addDoc, doc, updateDoc} from 'firebase/firestore'
const ventasCollectionRef = collection(db, 'ventas');


  export default {
    name:"Carrito_Ventas_1",
    data: () => ({
        dialog: false,
        cantidadInvalida: false,
        stockInsuficiente: false,
        mostrarColumnaKeyid: false,
        cargando: false,
        
        
      }),
    computed: {
      totalCarrito() {
      return this.productosVentas.reduce((total, producto) => {
      return total + producto.cantidadVendida * producto.precioventa;
    }, 0);
  },
      productosVentas() {
      return useVentasStore().productosVentas; 
      },
    },
    created(){
        useVentasStore().limpiarProductos()
      const ventasStore = useVentasStore();
      this.desserts = ventasStore.desserts; 
    },
    methods: {   
      eliminarProducto(producto) {
      // Encuentra el índice del producto en la lista de productosVentas
      const index = this.productosVentas.indexOf(producto);

      // Si el producto se encuentra en la lista, elimínalo
      if (index !== -1) {
        this.productosVentas.splice(index, 1);
      }
    },


async generatePDF() {
let registros = [];
let totalVenta = 0;

for (const producto of this.productosVentas) {
  let registro = {
    producto: producto.producto,
    cantidad: producto.cantidadVendida,
    precio: producto.precioventa,
    subtotal: (producto.cantidadVendida * producto.precioventa).toLocaleString('es-ES', { style: 'decimal', minimumFractionDigits: 0, useGrouping: true }),
  };
  totalVenta += producto.cantidadVendida * producto.precioventa;
  registros.push(registro);
}

registros.push({
  producto: "TOTAL:",
  cantidad: "",
  precio: "",
  subtotal: totalVenta.toLocaleString('es-ES', { style: 'decimal', minimumFractionDigits: 3, useGrouping: true }),
});

const fechaCompra = 'Fecha de Compra: ' + new Date().toLocaleDateString();
const numeroTelefonico = 'Teléfono: +3213013719';

let columns = [
  { title: "Producto", dataKey: "producto" },
  { title: "Cantidad", dataKey: "cantidad" },
  { title: "Precio", dataKey: "precio" },
  { title: "Subtotal", dataKey: "subtotal" },
];

let doc = new jsPDF("p", "pt", "a4");
doc.text("I&B FACTURA", 40, 30);
doc.text("Direccion Entidad: Calle 201a #22-14 Villa-Claver-Floridablanca Santander",40,60);
doc.text(fechaCompra, 40, 80);
doc.text(numeroTelefonico, 40, 100);
doc.text("Cliente: ",40,120);


doc.autoTable(columns, registros, {
  margin: { top: 150 },
});

doc.save("I&B FACTURA.pdf");
},


async realizarVenta() {
if (this.cargando) {
  // Evita llamar a realizarVenta si ya se está procesando una venta
  return;
}

this.cargando = true; // Inicia la operación, desactiva el botón

const productosVendidos = [];

for (const producto of this.productosVentas) {
  const productoEnLista = this.desserts.find(item => item.id === producto.id);

  if (productoEnLista) {
    const cantidadVendida = parseInt(producto.cantidadVendida, 10);
    // Verifica si la cantidad vendida es mayor que el stock disponible
    if (isNaN(cantidadVendida)) {
      this.cantidadInvalida = true;
      console.error("La cantidad vendida no es un número válido");
      this.cargando = false; // Restablece cargando en caso de error
      return;
    }
    if (producto.cantidadVendida > productoEnLista.stock) {
      this.stockInsuficiente = true;
      this.cargando = false; // Restablece cargando en caso de error
      return;
    } else {
      // Actualiza el stock del producto restando la cantidad vendida
      const StockN = productoEnLista.stock -= cantidadVendida; // Corregido aquí
      const Ref = doc(db, "Producto", producto.keyid);
      const UpdateData = {
        producto: producto.producto,
        stock: StockN, // Corregido aquí
      };

      try {
        await updateDoc(Ref, UpdateData);
      } catch (error) {
        console.error("Error al actualizar el producto:", error);
        this.cargando = false; // Restablece cargando en caso de error
        return;
      }

      // Crea un objeto que representa el producto vendido
      const ventaProducto = {
        cantidad_vendida: cantidadVendida,
        precio_venta: producto.precioventa,
        subtotal: cantidadVendida * producto.precioventa,
      };

      productosVendidos.push(ventaProducto);
    }
  }
}

// Calcula el total de la venta
let totalVenta = 0;
for (const productoVendido of productosVendidos) {
  totalVenta += productoVendido.subtotal;
}

// Crea un objeto que representa la venta completa
const ventaData = {
  fecha_venta: new Date(),
  productos_vendidos: productosVendidos,
  total_venta: totalVenta,
  // Otros campos relacionados con la venta que desees agregar
};

try {
  const docRef = await addDoc(ventasCollectionRef, ventaData);
  console.log('Documento de venta agregado con ID: ', docRef.id);
  useVentasStore().setFacturaID(docRef.id);
} catch (error) {
  console.error('Error al agregar el documento de venta: ', error);
  this.cargando = false; // Restablece cargando en caso de error
  return;
}

// Restablece las variables y limpia el carrito de ventas
this.stockInsuficiente = false;
this.cantidadInvalida = false;

// Pregunta al usuario si desea descargar el PDF
if (window.confirm("¿Deseas descargar el PDF de la factura?")) {
  this.generatePDF();
} else {
  // El usuario eligió no descargar el PDF, puedes hacer algo más aquí si es necesario
}

useVentasStore().limpiarProductos();
useVentasStore().limpiarDesserts();
console.log("Venta Realizada");
this.dialog = false;
this.cargando = false; // Restablece cargando al finalizar
},


    /*  */
    updateSubtotal(producto) {
    producto.subtotal = producto.stock * producto.precioventa;
  },
  },  


  }
</script>
