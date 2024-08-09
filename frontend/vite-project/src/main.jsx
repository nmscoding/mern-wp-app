
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import { Layout } from './layouts/Layout.jsx';
import CartProvider from "./context/CartProvider";
import App from './App.jsx'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './index.css'
import ScrollToTop from './components/ScrollToTop.jsx';
import AdminNavigate from './components/Layout/AdminNavigate.jsx';




ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
   <ScrollToTop />
    <CartProvider>
      <Layout>
        <App />
        <AdminNavigate />
      </Layout>
    </CartProvider>
  </BrowserRouter>

)
