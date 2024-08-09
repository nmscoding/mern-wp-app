import { useContext, useEffect, useRef } from "react";
import { useCookies } from 'react-cookie';
import "./Header.css";
import PropTypes from "prop-types";
import { CartContext } from "../../../context/CartProvider";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Header = ({ setIsSearchShow }) => {
  const { cartItems, setCartItems } = useContext(CartContext); // CartContext'in güncellenmesi için setCartItems ekleniyor
  const [cookies, removeCookie] = useCookies(['token']);
  const user = JSON.parse(localStorage.getItem("user"));
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (!user && (pathname.startsWith("/hesap") || pathname === "/favorilerim")) {
      navigate("/hesap");
    }
  }, [user, pathname, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        handleMenuClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    if (window.confirm("Çıkış yapmak istediğinize emin misiniz?")) {
      localStorage.removeItem("user");
      localStorage.clear();
      Object.keys(cookies).forEach(cookieName => removeCookie(cookieName));
      setCartItems([]); // Sepeti sıfırlamak için
      navigate("/");
      window.location.reload();
    }
  };

  const handleMenuToggle = () => {
    document.getElementById("sidebar").style.left = "0";
  };

  const handleMenuClose = () => {
    document.getElementById("sidebar").style.left = "-100%";
  };

  return (
    <header>
      <div className="global-notification">
        <p>
          <i className="bi bi-instagram"></i> İnstagramdan Bizi Takip Edebilirsiniz.
          <a href="https://www.instagram.com/waterplanet.tech/?hl=tr"> WATER PLANET</a>
        </p>
      </div>
      <div className="header-row">
        <div className="container">
          <div className="header-wrapper">
            <div className="header-mobile">
              <i className="bi bi-list" id="btn-menu" onClick={handleMenuToggle}></i>
            </div>
            <div className="header-left">
              <Link to={"/"} className="logo"><img src="/images/logo.png" alt="" /></Link>
            </div>
            <div className="header-center" id="sidebar" ref={sidebarRef}>
              <nav className="navigation">
                <ul className="menu-list">
                  <li className="menu-list-item">
                    <Link to={"/"} className={`menu-link ${pathname === "/" && "active"}`}>Ana Sayfa
                    </Link>
                  </li>
                  <li className="menu-list-item megamenu-wrapper">
                    <Link
                      to={"/magaza"}
                      className={`menu-link ${pathname === "/magaza" && "active"
                        }`}
                    >Ürünler
                      <i className="bi bi-chevron-down"></i>
                    </Link>
                    <div className="menu-dropdown-wrapper">
                      <div className="menu-dropdown-megamenu">
                        <div className="megamenu-links">
                          <div className="megamenu-products">
                            <h3 className="megamenu-products-title">Tüm Ürünler</h3>
                            <ul className="megamenu-list">
                              <li>
                                <Link to={"/kategori/Cihazlar"}>Cihazlar</Link>
                              </li>
                              <li>
                              <Link to={"/kategori/Filtreler"}>Filtreler</Link>
                              </li>
                              <li>
                              <Link to={"/kategori/Mebranlar"}>Mebranlar</Link>
                              </li>
                              <li>
                              <Link to={"/kategori/Tanklar"}>Tanklar</Link>
                              </li>
                              <li>
                              <Link to={"/kategori/Bataryalar"}>Bataryalar</Link>
                              </li>
                              <li>
                              <Link to={"/kategori/Yedek Parçalar"}>Yedek Parçalar</Link>
                              </li>
                            </ul>
                          </div>
                          <div className="megamenu-products">
                            <h3 className="megamenu-products-title">Büyük İndirim</h3>
                            <ul className="megamenu-list">
                              <li>
                                <a href="#">Cihazlar</a>
                              </li>
                              <li>
                                <a href="#">Filtreler</a>
                              </li>
                              <li>
                                <a href="#">Mebranlar</a>
                              </li>
                              <li>
                                <a href="#">Tanklar</a>
                              </li>
                            </ul>
                          </div>
                          <div className="megamenu-products">
                            <h3 className="megamenu-products-title">Toptan Kampanyalar</h3>
                            <ul className="megamenu-list">
                              <li>
                                <a href="#">Toptan Cihazlar</a>
                              </li>
                              <li>
                                <a href="#">Toptan Filtreler</a>
                              </li>
                              <li>
                                <a href="#">Toptan Mebranlar</a>
                              </li>
                              <li>
                                <a href="#">Toptan Tanklar</a>
                              </li>
                              <li>
                                <a href="#">Toptan Bataryalar</a>
                              </li>
                              <li>
                                <a href="#">Toptan Yedek Parçalar</a>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="megamenu-single">
                          <Link to={"/tumurun"}>
                            <img src="/images/menu-campaign.png" alt="" />
                          </Link>
                          <h3 className="megamenu-single-title">Siteye Özel</h3>
                          <h4 className="megamenu-single-subtitle">Kampanyalar</h4>
                          <Link to={"/tumurun"} className="megamenu-single-button btn btn-primary btn-sm">Satın Al</Link>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="menu-list-item">
                    <Link
                      to={"/blog"}
                      className={`menu-link ${pathname === "/blog" && "active"
                        }`}
                    >Blog</Link>
                  </li>
                  <li className="menu-list-item">
                    <Link to={"/hakkimizda"} className="menu-link">HAKKIMIZDA
                    </Link>
                  </li>
                  <li className="menu-list-item">
                    <Link to={"/iletisim"} className={`menu-link ${pathname === "/iletisim" && "active"}`}>İLETİŞİM</Link>
                  </li>
                </ul>
              </nav>
              <i className="bi-x-circle" id="close-sidebar" onClick={handleMenuClose}></i>
            </div>
            <div className="header-right">
              <div className="header-right-links">
                <Link to={user ? "/hesap/profil" : "/hesap"} className="header-account">
                  <i className="bi bi-person"></i>
                </Link>
                <button className="search-button" onClick={() => setIsSearchShow(true)}>
                  <i className="bi bi-search"></i>
                </button>
                <Link to={"/favorilerim"}>
                  <i className="bi bi-heart"></i>
                </Link>
                <div className="header-cart">
                  <Link to={"/sepetim"} className="header-cart-link">
                    <i className="bi bi-bag"></i>
                    <span className="header-cart-count">
                      {cartItems.length}
                    </span>
                  </Link>
                </div>
                {user && (
                  <button
                    className="search-button"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  setIsSearchShow: PropTypes.func.isRequired,
};

export default Header;
