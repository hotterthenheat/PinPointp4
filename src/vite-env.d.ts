/// <reference types="vite/client" />

// Chart.js is loaded globally via CDN <script> in index.html
interface Window {
  Chart?: any;
}
