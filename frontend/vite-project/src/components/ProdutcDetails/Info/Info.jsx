import { useContext, useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./Info.css";
import { CartContext } from "../../../context/CartProvider";
import ShareModal from '../../Modals/Share/ShareModal'; 
import ProductCampaign from "../ProductCampaign/ProductCampaign";

const Info = ({ singleProduct }) => {
    const quantityRef = useRef();
    const { addToCart, cartItems, addToFavorites, removeFromFavorites, favoriteItems } = useContext(CartContext);
    const originalPrice = singleProduct.price.newprice;
    const discountPercentage = singleProduct.price.discount;

    const discountedPrice = originalPrice + (originalPrice * discountPercentage) / 100;

    const filteredCard = cartItems.find((cartItem) => cartItem._id === singleProduct._id);

    const reviewCount = singleProduct.reviews.length;
    const averageRating = singleProduct.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount || 0;

    const handleDecrement = () => {
        if (quantityRef.current.value > 1) {
            quantityRef.current.value--;
        }
    };

    const handleIncrement = () => {
        quantityRef.current.value++;
    };

    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        setIsFavorite(favoriteItems.some(item => item._id === singleProduct._id));
    }, [favoriteItems, singleProduct._id]);

    const handleFavoriteClick = async () => {
        if (isFavorite) {
            await removeFromFavorites(singleProduct._id);
        } else {
            await addToFavorites(singleProduct);
        }
        setIsFavorite(!isFavorite);
    };

    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const handleShareClick = () => {
        setIsShareModalOpen(true);
    };

    return (
        <div className="product-cart">
            <h1 className="product-title">{singleProduct.name}</h1>
            <p className="product-description" dangerouslySetInnerHTML={{ __html: singleProduct.title }}></p>
            <div className="product-review">
                <ul className="product-star">
                    {Array.from({ length: 5 }, (_, index) => {
                        if (index < Math.floor(averageRating)) {
                            return (
                                <li key={index}>
                                    <i className="bi bi-star-fill gold"></i>
                                </li>
                            );
                        } else if (index < Math.ceil(averageRating)) {
                            return (
                                <li key={index} className="half">
                                    <i className="bi bi-star-half gold"></i>
                                </li>
                            );
                        } else {
                            return (
                                <li key={index}>
                                    <i className="bi bi-star-fill"></i>
                                </li>
                            );
                        }
                    })}
                </ul>
                <span>({reviewCount}) Değerlendirme</span>
            </div>
            <div className="product-price">
                <div className="price">
                    {singleProduct.price.discount && singleProduct.price.discount > 0 ? (
                        <s>₺{discountedPrice.toFixed(2)}</s>
                    ) : null}
                    <strong className="new-price">₺{singleProduct.price.newprice.toFixed(2)}</strong>
                </div>
                <div className="product-installment">
                    {singleProduct.price.installment && singleProduct.price.installment > 0 ? (
                        <span>
                            Peşin Fiyatına {singleProduct.price.installment} Taksit {singleProduct.price.installment}x <strong>₺{(singleProduct.price.newprice / singleProduct.price.installment).toFixed(0)}</strong>
                        </span>
                    ) : null}
                </div>
            </div>
            <ProductCampaign />
            <form className="variations-form" action="">
                <div className="cart-button">
                    <div className="quantity-wrapper">
                        <button type="button" onClick={handleDecrement}><i className="bi bi-dash"></i></button>
                        <input
                            type="number"
                            defaultValue="1"
                            min="1"
                            id="quantity"
                            ref={quantityRef}
                            disabled
                        />
                        <span className="quantity-text">Adet</span>
                        <button type="button" onClick={handleIncrement}><i className="bi bi-plus"></i></button>
                    </div>
                    <button className="btn btn-primary btn-lg" id="add-to-cart" type="button" disabled={filteredCard}
                        onClick={() => addToCart(singleProduct, parseInt(quantityRef.current.value))}
                    ><i className="bi bi-cart-check-fill"></i> Sepete Ekle</button>
                </div>
                <div className="product-extra-buttons">
                    <button type="button" className="product-extra-buttons-favorites" onClick={handleFavoriteClick}>
                        <div className="icon-container">
                            <i className={`bi ${isFavorite ? 'bi-trash' : 'bi-heart-fill'}`}></i>    
                        </div> 
                        <div className="tooltip-favorite">{isFavorite ? "Favorilerden Kaldır" : "Favorilere Ekle"}</div>                      
                    </button>
                    <button type="button" className="product-extra-buttons-share" onClick={handleShareClick}>
                        <div className="icon-container">
                            <i className="bi bi-send"></i>
                        </div>         
                        <div className="tooltip-share">Ürünü Paylaş</div>              
                    </button>
                    <div className="product-extra-info"><i className="bi bi-box-seam-fill"></i> Hızlı ve Güvenli Kargo <i className="bi bi-check-circle"></i></div>
                </div>
            </form>
            <ShareModal
                isOpen={isShareModalOpen}
                onRequestClose={() => setIsShareModalOpen(false)}
                shareUrl={window.location.href}
            />
            <div className="dropdown-divider"></div>
            <div className="product-features-wrapper">
                <h4>Ürün Özellikleri:</h4>
                {singleProduct.features ? (
                    <div className="product-features">
                        {Object.entries(singleProduct.features).map(([key, value], index) => ( 
                            <div key={index} className="product-feature">
                                <div className={key}></div>
                                <strong className={`features-${index + 1}`}>{value}</strong>
                            </div>
                        ))}
                    </div>
                ): null}

                <div className="single-product-info">
                    <div className="single-product-info-wrapper">
                        <span className="ellipse"></span>
                        <span className="single-product-marke">
                            Bu ürün Water Planet Filter Technology tarafından gönderilecektir.
                        </span>
                    </div>
                    <div className="single-product-info-wrapper">
                        <span className="ellipse"></span>
                        <span className="single-product-marke">
                            Kampanya fiyatından satılmak üzere 10 adetten fazla stok sunulmuştur.
                        </span>
                    </div>
                    <div className="single-product-info-wrapper">
                        <span className="ellipse"></span>
                        <span className="single-product-marke">
                            İncelemiş olduğunuz ürünün satış fiyatını satıcı belirlemektedir.
                        </span>
                    </div>
                    <div className="product-feature-bottom">
                        <div className="product-feature-button">
                            <button className="btn btn-sm">TÜM ÖZELLİKLERİ </button>
                        </div>
                        <div className="line"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

Info.propTypes = {
    singleProduct: PropTypes.object.isRequired,
};

export default Info;
