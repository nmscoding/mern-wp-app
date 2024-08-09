import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Myaccount from "./Myaccount";
import Myadress from "./Myaddress";
import Mylastorders from "./Mylastorders";
import Myorders from "./Myorders";
import SavedAdress from "./SavedAddress";

const PersonalInformation = () => {
    const { tab } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(tab || "profile");

    useEffect(() => {
        setActiveTab(tab || "profile");
    }, [tab]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        navigate(`/hesap/${tab}`);
    };

    const renderContent = () => {
        switch (activeTab) {
            case "profile":
                return <Myaccount />;
            case "adres-ekleme":
                return <Myadress />;
            case "siparislerim":
                return <Myorders />;
            case "gecmis-siparislerim":
                return <Mylastorders />;
            case "adreslerim":
                return <SavedAdress />;
            default:
                return <Myaccount />;
        }
    };

    return (
        <section className="profile">
            <div className="container">
                <div className="profile-wrapper">
                    <div className="profile-menu">
                        <div className="account-info-wrapper">
                            <ul className="title">
                                <li>Kullanıcı Bilgileri</li>
                            </ul>
                            <ul className="account-info">
                                <li>
                                    <i className="bi bi-person"></i>
                                    <a href="#" onClick={() => handleTabClick("profile")}>Profilim</a>
                                </li>
                                <li>
                                    <i className="bi bi-pin-map-fill"></i>
                                    <a href="#" onClick={() => handleTabClick("adreslerim")}>Adres Bilgileri</a>
                                </li>
                            </ul>
                        </div>
                        <div className="order-info-wrapper">
                            <ul className="title">
                                <li>Sipariş Bilgileri</li>
                            </ul>
                            <ul className="order-info">
                                <li>
                                    <i className="bi bi-box-seam-fill"></i>
                                    <a href="#" onClick={() => handleTabClick("siparislerim")}>Tüm Siparişlerim</a>
                                </li>
                                <li>
                                    <i className="bi bi-box-seam-fill"></i>
                                    <a href="#" onClick={() => handleTabClick("gecmis-siparislerim")}>Sipariş Geçmişi</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="profile-content">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PersonalInformation;
