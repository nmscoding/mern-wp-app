import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from './Pages/HomePage';
import ShopPage from './Pages/ShopPage';
import ProductDetailsPage from './Pages/ProductDetailsPage';
import BlogDetailsPage from './Pages/BlogDetailsPage';
import BlogPage from './Pages/BlogPage';
import CartPage from './Pages/CartPage';
import AuthPage from './Pages/AuthPage';
import ContactPage from "./Pages/ContactPage";
import './App.css';
import ProfilePage from "./Pages/ProfilePage";
import ProtectedRoute from "./Pages/ProtectedRoute";
import UserPage from "./Pages/admin/UserPage";
import CategoryPage from "./Pages/admin/Categories/CategoryPage";
import UpdateCategoryPage from "./Pages/admin/Categories/UpdateCategoryPage";
import CreateCategoryPage from "./Pages/admin/Categories/CreateCategoryPage";
import CreateProductPage from "./Pages/admin/Products/CreateProductPage";
import ProductPage from "./Pages/admin/Products/ProductPage";
import UpdateProductPage from "./Pages/admin/Products/UpdateProductPage";
import CouponPage from "./Pages/admin/Coupons/CouponPage";
import CreateCouponPage from "./Pages/admin/Coupons/CreateCouponPage";
import UpdateCouponPage from "./Pages/admin/Coupons/UpdateCouponPage";
import CategoryProducts from "./Pages/CategoryProducts";
import Products from "./components/Products/Products";
import Favorites from "./components/Favorites/Favorites";
import AboutUsPage from "./Pages/AboutUsPage";
import UpdateBrandPage from "./Pages/admin/Brands/UpdateBrandPage";
import BrandPage from "./Pages/admin/Brands/BrandPage";
import CreateBrandPage from "./Pages/admin/Brands/CreateBrandPage";
import AdminBlogPage from "./Pages/admin/Blog/AdminBlogPage"
import CreateBlogPage from "./Pages/admin/Blog/CreateBlogPage"
import UpdateBlogPage from "./Pages/admin/Blog/UpdateBlogPage"
import AdminContactPage from "./Pages/admin/Contact/AdminContactPage";
import ReviewPage from "./Pages/admin/ReviewPage";
import ForgotPassword from "./components/Auth/ForgotPassword"
import ResetPassword from "./components/Auth/ResetPassword"
import CampaignPage from "./Pages/admin/Campaign/CampaignPage";
import CreateCampaignPage from "./Pages/admin/Campaign/CreateCampaignPage";
import UpdateCampaignPage from "./Pages/admin/Campaign/UpdateCampaignPage";
import SliderPage from "./Pages/admin/Slider/SliderPage";
import CreateSliderPage from "./Pages/admin/Slider/CreateSliderPage";
import UpdateSliderPage from "./Pages/admin/Slider/UpdateSliderPage";
import ProductCampaignPage from "./Pages/admin/ProductCampaign/ProductCampaignPage";
import CreateProductCampaignPage from "./Pages/admin/ProductCampaign/CreateProductCampaignPage";
import OrderPage from "./Pages/OrderPage";
import ForgotPasswordSuccess from "./components/Auth/ForgotPasswordSuccess";
import DashboardPage from "./Pages/admin/DashboardPage";
import AdminOrderPage from "./Pages/admin/OrderPage"
import PersonalInformation from "./components/Profile/PersonalInformation";
import AuthSuccess from "./components/Auth/AuthSuccess";


function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/magaza" element={<ShopPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/iletisim" element={<ContactPage />} />
      <Route path="/sepetim" element={<CartPage />} />
      <Route path="/hesap" element={<AuthPage />} />
      <Route path="/auth/success" element={<AuthSuccess />} />
      <Route path="/urun/:id" element={<ProductDetailsPage />} />
      <Route path="/blogs/:id" element={<BlogDetailsPage />} />
      <Route path="/" element={<Products />} />
      <Route path="/kategori/:categoryName" element={<CategoryProducts />} />
      <Route path="/tumurun" element={<CategoryProducts />} />
      <Route path="/favorilerim" element={<Favorites />} />
      <Route path="/hakkimizda" element={<AboutUsPage />} />
      <Route path="/sifremi-unuttum" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/siparis" element={<OrderPage />} />
      <Route path="/baglanti-onay" element={<ForgotPasswordSuccess />} />
      <Route path="/hesap/:tab?" element={<PersonalInformation />} />

      <Route
        path="/hesap/profil"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hesap"
        element={localStorage.getItem("user") ? <Navigate to="/hesap/profil" /> : <AuthPage />}
      />
      <Route path="/admin/*">
        <Route path="" element={<DashboardPage />} />
        <Route path="users" element={<UserPage />} />
        <Route path="kategori" element={<CategoryPage />} />
        <Route path="kategori/update/:id" element={<UpdateCategoryPage />} />
        <Route path="kategori/create" element={<CreateCategoryPage />} />
        <Route path="urun" element={<ProductPage />} />
        <Route path="urun/create" element={<CreateProductPage />} />
        <Route path="urun/update/:id" element={<UpdateProductPage />} />
        <Route path="coupons" element={<CouponPage />} />
        <Route path="coupons/create" element={<CreateCouponPage />} />
        <Route path="coupons/update/:id" element={<UpdateCouponPage />} />
        <Route path="brands" element={<BrandPage />} />
        <Route path="brands/create" element={<CreateBrandPage />} />
        <Route path="brands/update/:id" element={<UpdateBrandPage />} />
        <Route path="campaigns" element={<CampaignPage />} />
        <Route path="campaigns/create" element={<CreateCampaignPage />} />
        <Route path="productcampaign" element={<ProductCampaignPage />} />
        <Route path="productcampaign/create" element={<CreateProductCampaignPage />} />
        <Route path="campaigns/update/:id" element={<UpdateCampaignPage />} />
        <Route path="sliders" element={<SliderPage />} />
        <Route path="sliders/create" element={<CreateSliderPage />} />
        <Route path="sliders/update/:id" element={<UpdateSliderPage />} />
        <Route path="blogs" element={<AdminBlogPage />} />
        <Route path="blogs/create" element={<CreateBlogPage />} />
        <Route path="blogs/update/:id" element={<UpdateBlogPage />} />
        <Route path="contacts" element={<AdminContactPage />} />
        <Route path="reviews" element={<ReviewPage />} />
        <Route path="siparis" element={<AdminOrderPage />} />
      </Route>
    </Routes>
  );
}

export default App;
