<template>
  <v-table :headers="headers" :items="desserts" :search="search"  :sort-by="[{ key: 'calories', order: 'asc' }]" class="elevation-1" style="height: 86vh; overflow-y: auto ;">
    <template v-slot:top>
      <v-toolbar flat style=" border: none; padding: 18px;  background-color: rgb(6 0 255 / 11%)">
        <v-container>
          <v-toolbar-title style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">Ventas - Facturas</v-toolbar-title>
        </v-container>
        <v-btn style="margin-right: 10%;" @click="descargarTodasLasFacturas" >Descargar Facturas</v-btn>
      </v-toolbar>
      <tr v-if="mostrarSeparador">
        <td colspan="5" class="separador-espacio"></td>
      </tr>
  <v-table v-for="(venta, index) in ventas" :key="index" style="margin-right: 10%; margin-left: 10%;">
  <tr v-if="mostrarSeparador">
      </tr>
      <thead>
  <tr>
    <th class="text-left">Fecha de Venta</th>
    <th class="text-left">Cantidad Vendida</th>
    <th class="text-left">Precio Venta</th>
    <th class="text-left">Subtotal</th>
  </tr>
</thead>
<tbody>
  <tr v-for="(producto, pIndex) in venta.productos_vendidos" :key="pIndex">
    <td>{{ new Date(venta.fecha_venta.seconds * 1000).toLocaleString() }}</td>
    <td>{{ producto.cantidad_vendida }}</td>
    <td>${{ producto.precio_venta }}</td>
    <td>${{ producto.subtotal }}</td>
    <td></td> <!-- Deja esta celda en blanco para la columna del total -->
  </tr>
  <tr>
    <td>Total:</td> <!-- Agrega la palabra "Total" aquí -->
    <td></td>
    <td></td>
    <td>${{ venta.total }}</td> <!-- Muestra el total en la misma fila -->
  </tr>
  <v-btn class="mb-2" @click="descargarFacturaPDF(venta)"><v-icon left>mdi-download</v-icon></v-btn>
  <v-btn class="mb-2" @click="eliminarFactura(venta.id)"><v-icon left>mdi-delete</v-icon></v-btn>
  <tr v-if="mostrarSeparador">
    <td colspan="5" class="separador-espacio"></td>
  </tr>
</tbody>
  </v-table>
</template>
</v-table>
</template>

<script>
import { useVentasStore } from "../stores/storer";
import "jspdf-autotable";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import db from "../firebase/init.js";
import jsPDF from "jspdf";

export default {
  data() {
    return {
      ventas: [], // Aquí almacenaremos los datos de las ventas
      mostrarSeparador: true, // Agregar esta propiedad
    };
  },

  async created() {
  const ventasCollectionRef = collection(db, "ventas");
  const querySnapshot = await getDocs(ventasCollectionRef);
  this.ventas = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    total: doc.data().productos_vendidos.reduce(
      (acc, producto) => acc + producto.subtotal,
      0
    ),
  }));
  if (this.ventas.length > 1) {
    this.mostrarSeparador = true;
  }
},
  methods: {
    async eliminarFactura(facturaID) {
      const ventasStore = useVentasStore();
      try {
        await deleteDoc(doc(db, "ventas", facturaID));
        // Actualiza la lista de ventas en tu componente eliminando la factura
        this.ventas = this.ventas.filter((venta) => venta.id !== facturaID);
        ventasStore.setVentas(this.ventas);
        // También puedes limpiar el ID de la factura en el estado de Pinia si lo deseas
        ventasStore.setFacturaID(null);
        console.log(`Factura con ID ${facturaID} eliminada correctamente.`);
      } catch (error) {
        console.error("Error al eliminar la factura:", error);
        // Maneja los errores y muestra un mensaje de error o realiza otra acción según sea necesario
      }
    },
    
    async descargarTodasLasFacturas() {
  const doc = new jsPDF();
  let y = 10;

  for (const venta of this.ventas) {
    doc.text(`Fecha de Venta: ${new Date(venta.fecha_venta.seconds * 1000).toLocaleString()}`, 10, y);
    y += 10;
    doc.text("Direccion Entidad: Calle 201a #22-14 Villa-Claver-Floridablanca Santander", 10, 20);
    doc.text('Teléfono: +3213013719', 10, 30);
    doc.text("Cliente: ", 10, 40);

    const columns = ["Cantidad Vendida", "Precio Venta", "Subtotal"];
    const data = venta.productos_vendidos.map((producto) => [
      producto.cantidad_vendida,
      `$${producto.precio_venta}`,
      `$${producto.subtotal}`,
    ]);

    const startY = 50;

    doc.autoTable({
      startY: startY,
      head: [columns],
      body: data,
    });

    // Agregar una fila con el total
    const totalRow = [
      "",
      "Total:",
      "",
      `$${venta.total}`,
    ];
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 10,
      body: [totalRow],
    });

    y = doc.autoTable.previous.finalY + 20;
    // Agrega un salto de página después de cada factura excepto la última
    if (venta !== this.ventas[this.ventas.length - 1]) {
      doc.addPage();
      y = 10;
    }
  }

  // Guarda el PDF con un nombre único (puedes usar un nombre específico)
  const nombrePDF = 'todas_las_facturas.pdf';
  doc.save(nombrePDF);
},

  async descargarFacturaPDF(venta) {
  // Crear un nuevo documento PDF
  const doc = new jsPDF();
  // Definir la posición inicial para el contenido
  let y = 10;
  const numeroTelefonico = 'Teléfono: +3213013719';
  // Agregar la información de la factura específica al PDF
  doc.text(
    `Fecha de Venta: ${new Date(venta.fecha_venta.seconds * 1000).toLocaleString()}`,
    10,
    y
  );
  y += 10;
  doc.text(
    "Direccion Entidad: Calle 201a #22-14 Villa-Claver-Floridablanca Santander",
    10,
    20
  );
  doc.text(numeroTelefonico, 10, 30);
  doc.text("Cliente: ", 10, 40);
  // Definir la estructura de la tabla
  const columns = ["Cantidad Vendida", "Precio Venta", "Subtotal"];
  const data = venta.productos_vendidos.map((producto) => [
    producto.cantidad_vendida,
    `$${producto.precio_venta}`,
    `$${producto.subtotal}`,
  ]);

  const startY = 50;

  doc.autoTable({
    startY: startY,
    head: [columns],
    body: data,
  });

  // Agregar una fila con el total
  const totalRow = [
    "",
    "Total:",
    "",
    `$${venta.total}`,
  ];
  doc.autoTable({
    startY: doc.autoTable.previous.finalY + 10,
    body: [totalRow],
  });

  // Guardar el PDF con un nombre único (puedes usar el ID de la factura o algún otro identificador único)
  const nombrePDF = `factura_${venta.id}.pdf`;
  doc.save(nombrePDF);
}
  }
}
</script>
<style>
.separador-espacio {
  height: 20px; /* Ajusta la altura del espacio según tus preferencias */
  border-top: 1px solid #ccc; /* Agrega un borde superior como separador */
}
/* Establece el ancho máximo de la tabla y ajusta los estilos según tus preferencias */
.tabla-ancha {
  max-width: 800px;
  margin: 0 auto;
}
.text-left {
  width: auto;
}


</style>