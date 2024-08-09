import React from "react";
import "./Footer.css"
import Policy from "../Policy/Policy";
import { Link } from "react-router-dom";

const Footer = () => {

    return (
        <React.Fragment>
            <Policy />
            <footer className="footer">
                <div className="footer-top">
                    <div className="container">
                        <div className="footer-row-wrapper">
                            <div className="footer-subscribe-wrapper">
                                <div className="footer-subscribe">
                                    <div className="footer-subscribe-top">
                                        <h3 className="subscribe-title">Yeni ürünler ve indirimler hakkında bilgi almak için e-postalarımızı alın..
                                        </h3>
                                        <p className="subscribe-desc">İlk Kayıtta %10 indirim hediye kuponunuzu alın.</p>
                                    </div>
                                    <div className="footer-subscribe-bottom">
                                        <Link to={"/hesap"}><button className="btn btn-lg btn-primary">Kayıt Ol</button></Link>
                                        <p className="privacy-text">Kayıt olarak Koşullarımızı,<a href="#"> Gizlilik ve Çerez Politikamızı kabul
                                            etmiş olursunuz.</a></p>
                                    </div>
                                </div>
                            </div>
                            <div className="footer-contact-wrapper">
                                <div className="footer-contact-top">
                                    <h3 className="contact-title">Bize Ulaşın <br /> (+90) 505 091 19 12</h3>
                                    <p className="contact-desc">Çalışma Saatlerimiz 09.00 - 20.00 arası.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer-center">
                    <div className="container">
                        <div className="footer-widgets">
                            <div className="brand-info">
                                <div className="footer-logo">
                                    <div className="header-left">
                                        <a href="#" className="logo"><img src="/images/logo.png" alt="" /></a>
                                    </div>
                                </div>
                                <div className="footer-desc">
                                    <p>Suyun en sağlıklı haliyle tanışın. En sağlıklı su plastikte muhafıza edilen su değil, kendin cihazından
                                        arıttığın sudur!</p>

                                </div>
                                <div className="footer-contact">
                                    <p>
                                        <a href="tel:0505 091 19 12">(+90) 505 091 19 12</a> - <a
                                            href="mailto:info@example.com">info@waterplanet.info</a>
                                    </p>
                                </div>
                            </div>
                            <div className="widget-nav-menu">
                                <h4>Politikalar</h4>
                                <ul className="menu-list">
                                    <li className="menu-item">
                                        <Link to={"/hakkimizda"}>Hakkımızda</Link>
                                    </li>
                                    <li className="menu-item">
                                        <a href="#">Gizlilik Politikası</a>
                                    </li>
                                    <li className="menu-item">
                                        <a href="#">İade Politikası</a>
                                    </li>
                                    <li className="menu-item">
                                        <a href="#">Nakliye Politikası</a>
                                    </li>
                                    <li className="menu-item">
                                        <a href="#">Alışveriş Politikası</a>
                                    </li>
                                </ul>
                            </div>
                            <div className="widget-nav-menu">
                                <h4>Hesap</h4>
                                <ul className="menu-list">
                                    <li className="menu-item">
                                        <Link to={"/"}>Satış Paneli</Link>
                                    </li>
                                    <li className="menu-item">
                                        <Link to={"/hesap/siparislerim"}>Siparişlerim</Link>
                                    </li>
                                    <li className="menu-item">
                                        <Link to={"/favorilerim"}>Favoriler</Link>
                                    </li>
                                    <li className="menu-item">
                                        <Link to={"/hesap"}>Hesap Detayları</Link>
                                    </li>
                                    <li className="menu-item">
                                        <Link to={"/hesap/siparislerim"}>Kargo Takibi</Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="widget-nav-menu">
                                <h4>Alışveriş</h4>
                                <ul className="menu-list">
                                    <li className="menu-item">
                                        <Link to={"/magaza"}>En çok satanlar</Link>
                                    </li>
                                    <li className="menu-item">
                                        <Link to={"/magaza"}>İndirim</Link>
                                    </li>
                                    <li className="menu-item">
                                        <Link to={"/magaza"}>En Son Ürünler</Link>
                                    </li>
                                    <li className="menu-item">
                                        <Link to={"/magaza"}>İndirimli Ürünler</Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="widget-nav-menu">
                                <h4>Kategoriler</h4>
                                <ul className="menu-list">
                                    <li className="menu-item">
                                        <Link to={"/kategori/Cihazlar"}>Cihazlar</Link>
                                    </li>
                                    <li className="menu-item">
                                        <Link to={"/kategori/Filtreler"}>Filtreler</Link>
                                    </li>
                                    <li className="menu-item">
                                        <Link to={"/kategori/Mebranlar"}>Mebranlar</Link>
                                    </li>
                                    <li className="menu-item">
                                        <Link to={"/kategori/Tanklar"}>Tanklar</Link>
                                    </li>
                                    <li className="menu-item">
                                        <Link to={"/kategori/Bataryalar"}>Bataryalar</Link>
                                    </li>
                                    <li className="menu-item">
                                        <Link to={"/kategori/Yedek Parçalar"}>Yedek Parçalar</Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <div className="container">
                        <div className="footer-copyright">
                            <div className="site-copyright">
                                <p>Copyright 2024 © E-Commerce Theme. All right reserved. Powered by Alper Filiz.</p>
                            </div>
                            <a href="#">
                                <img src="/images/cards.png" alt="" />
                            </a>
                            <div className="footer-menu">
                                <ul className="footer-menu-list">
                                    <li className="list-item">
                                        <a href="#">Privacy Policy</a>
                                    </li>
                                    <li className="list-item">
                                        <a href="#">Terms and Conditions</a>
                                    </li>
                                    <li className="list-item">
                                        <a href="#">Returns Policy</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </React.Fragment>
    );
};


export default Footer