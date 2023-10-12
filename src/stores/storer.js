  // En tu archivo store.js o ventas.js
  import { defineStore } from 'pinia';


  export const useVentasStore = defineStore({
    id: 'ventas',
    state: () => ({
      productosVentas: [], // Arreglo para almacenar los productos en el apartado de ventas
      desserts: [], // Agregar desserts al store de ventas
      facturaID: null,
    }),
    actions: {
      setVentas(nuevasVentas) {
        this.ventas = nuevasVentas;
      },
      
      setFacturaID(id) {
        this.facturaID = id;
      },
      
      agregarProducto(producto) {
        this.productosVentas.push(producto);
      },
      limpiarProductos() {
        this.productosVentas = [];

      },
      limpiarDesserts() {
        this.desserts = [];
      },
      guardarFactura(facturaData) {
        this.factura = facturaData;
      },
      // Puedes agregar más acciones según tus necesidades, como eliminar producto, limpiar ventas, etc.
    },
    getters: {
      factura: (state) => state.factura,
    },
  });

