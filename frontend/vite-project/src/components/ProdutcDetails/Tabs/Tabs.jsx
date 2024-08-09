import { useState } from "react";
import Reviews from "../../Reviews/Reviews"
import PropTypes from "prop-types";
import "./Tabs.css"

const Tabs = ({ singleProduct, setSingleProduct }) => {
    const [activeTab, setActiveTab] = useState("desc");

    const handleTabClick = (e, tab) => {
        e.preventDefault();
        setActiveTab(tab);
    };
    return (
        <div className="single-tabs">
            <ul className="tab-list">
                <li>
                    <a
                        href="#"
                        className={`tab-button ${activeTab === "desc" ? "active" : ""}`}
                        onClick={(e) => handleTabClick(e, "desc")}
                    >Ürün Bilgileri</a>
                </li>
                <li>
                    <a
                        href="#"
                        className={`tab-button ${activeTab === "info" ? "active" : ""}`}
                        onClick={(e) => handleTabClick(e, "info")}
                    >Ürün Özellikleri</a>
                </li>
                <li>
                    <a
                        href="#"
                        className={`tab-button ${activeTab === "reviews" ? "active" : ""}`}
                        onClick={(e) => handleTabClick(e, "reviews")}
                    >Değerlendirmeler</a>
                </li>
            </ul>
            <div className="tab-panel">
                <div
                    className={`tab-panel-descriptions content ${activeTab === "desc" ? "active" : ""
                        }`}
                >
                    <div className="tab-panel-description">
                        <span className="ellipse"></span>
                        <span className="single-product-marke">
                            Bu ürün Water Planet Filter Technology tarafından gönderilecektir.
                        </span>
                    </div>
                    <div className="tab-panel-description">
                        <span className="ellipse"></span>
                        <p className="single-product-marke">
                            Kampanya fiyatından satılmak üzere 10 adetten fazla stok sunulmuştur.
                        </p>
                    </div>
                    <div className="tab-panel-description">
                        <span className="ellipse"></span>
                        <p className="single-product-marke">
                            İncelemiş olduğunuz ürünün satış fiyatını satıcı belirlemektedir.
                        </p>
                    </div>
                    <div className="tab-panel-description">
                        <span className="ellipse"></span>
                        <p className="single-product-marke">
                            Bir ürün, birden fazla satıcı tarafından satılabilir. Birden fazla satıcı tarafından
                            satışa sunulan ürünlerin satıcıları ürün için belirledikleri fiyata, satıcı
                            puanlarına,
                            teslimat statülerine, ürünlerdeki promosyonlara, kargonun bedava olup olmamasına ve
                            ürünlerin hızlı teslimat ile teslim edilip edilememesine, ürünlerin stok ve
                            kategorileri
                            bilgilerine göre sıralanmaktadır.
                        </p>
                    </div>
                    <div className="tab-panel-description">
                        <span className="ellipse"></span>
                        <p className="single-product-marke">
                            Bu üründen en fazla 10 adet sipariş verilebilir. 10 adedin üzerindeki siparişleri
                            Trendyol iptal etme hakkını saklı tutar. Belirlenen bu limit kurumsal siparişlerde
                            geçerli olmayıp, kurumsal siparişler için farklı limitler belirlenebilmektedir.
                        </p>
                    </div>
                    <div className="tab-panel-description">
                        <span className="ellipse"></span>
                        <p className="single-product-marke">
                            15 gün içinde ücretsiz iade. Detaylı bilgi için <a href="">tıklayınız.</a>
                        </p>
                    </div>
                    <div className="tab-panel-description">
                        <span className="ellipse"></span>
                        <p className="single-product-marke">
                            * FDA COMPONENTS ÖN FİLTRE KALİTESİ (ÇİFT KARBON) * ÜSTÜN VONTRON MEMBRAN KALİTESİ
                            80GBD
                            * ŞIK VE BENZERSİZ TASARIM * SINIFININ EN KÜÇÜĞÜ * DAHİLİ 8LT METAL TANK * LÜX
                            MUSLUK *
                            100GBD POMPA & BASINÇ DÜŞÜRÜCÜ 5 AŞAMALI SU ARITMA CİHAZI - YENİ NESİL SU ARITMA
                        </p>
                    </div>
                </div>
                <div
                    className={`tab-panel-information content ${activeTab === "info" ? "active" : ""
                        }`}
                    id="info"
                >
                    {singleProduct.features ? (
                            <>
                                <h3>Ürün Özellikleri</h3>
                                <table>
                                    <tbody>
                                        {Object.entries(singleProduct.features).map(([key, value], index) => (
                                            <tr key={index}>
                                                <td className={key}></td>
                                                <th className={`feature-${index + 1}`}>{value}</th>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        ) :null
                    }

                </div>
                <Reviews active={activeTab === "reviews" ? "content active" : "content"}
                    singleProduct={singleProduct} setSingleProduct={setSingleProduct} />
            </div>
        </div>
    )
}

export default Tabs

Tabs.propTypes = {
    singleProduct: PropTypes.object,
    setSingleProduct: PropTypes.func,
};