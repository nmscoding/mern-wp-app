import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Button } from 'antd';
import PropTypes from 'prop-types';
import ReviewForm from '../Reviews/ReviewForm';
import './Myaccount.css';

const MyOrderItem = ({ orders, setSingleProduct, user }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [updatedOrders, setUpdatedOrders] = useState(orders);
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : user;

    useEffect(() => {
        setUpdatedOrders(orders);
    }, [orders]);

    const getStatusClass = (status) => {
        switch (status) {
            case "Sipariş Alındı":
                return "siparis-alindi";
            case "Sipariş Hazırlanıyor":
                return "siparis-hazirlaniyor";
            case "Kargoda":
                return "kargoda";
            case "Teslim Edildi":
                return "teslim-edildi";
            case "İptal Edildi":
                return "iptal-edildi";
            default:
                return "";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "Sipariş Alındı":
                return "bi bi-hand-thumbs-up";
            case "Sipariş Hazırlanıyor":
                return "bi bi-hourglass-split";
            case "Kargoda":
                return "bi bi-truck";
            case "Teslim Edildi":
                return "bi bi bi-bag-check";
            case "İptal Edildi":
                return "bi bi-x";
            default:
                return "";
        }
    };

    const calculateDiscount = (subtotal, total) => {
        return subtotal - total;
    };

    const hasReviewedProduct = (product) => {
        return product.reviews.some(
            (review) => review.user === (currentUser.id || currentUser._id.toString())
        );
    };

    const showModal = (product) => {
        setSelectedProduct(product);
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setSelectedProduct(null);
    };

    const handleReviewSubmit = (updatedProduct) => {
        const updatedOrderList = updatedOrders.map(order => {
            return {
                ...order,
                items: order.items.map(item => {
                    if (item.product._id === updatedProduct._id) {
                        return { ...item, product: updatedProduct };
                    }
                    return item;
                })
            };
        });
        setUpdatedOrders(updatedOrderList);
        setSingleProduct(updatedProduct);
        setIsModalVisible(false);
    };

    return (
        <div className="orders-list">
            {updatedOrders.map(order => {
                const options = { year: "numeric", month: "long", day: "numeric" };
                const orderDate = new Date(order.updatedAt).toLocaleDateString("tr-TR", options);
                const discount = calculateDiscount(order.subtotal, order.total);

                return (
                    <div key={order._id} className="order-item">
                        <div className="order-items">
                            <div className="my-order-info-header">
                                <div className="my-order-id">Sipariş No: <strong>{order.orderNumber}</strong></div>
                                <div className="my-order-total-price">
                                    <div className="my-order-total">₺{order.total.toFixed(2)}</div>
                                    {discount > 0 && (
                                        <div className="my-order-subtotal-title">
                                            <span>₺{discount} indirim</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {order.items.map(item => (
                                <div key={item.product._id} className="order-product">
                                    <Link to={`/urun/${item.product._id}`}>
                                        <img
                                            src={`${apiUrl}${item.product.img[0]}`}
                                            alt=""
                                            className="order-product-image"
                                        />
                                    </Link>
                                    <div className="order-product-details">
                                        <Link to={`/urun/${item.product._id}`}>
                                            <p className="my-product-name">{item.product.name}</p>
                                        </Link>
                                        <p className="my-product-desc">{item.product.title}</p>
                                        <strong className="my-order-price">₺{item.price.toFixed(2)}</strong>
                                        <p className="product-quantity">Adet: {item.quantity}</p>
                                        {order.status === "Teslim Edildi" && (
                                            hasReviewedProduct(item.product) ? (
                                                <Button disabled className="my-product-evaluation-button">
                                                    Değerlendirme Yapıldı
                                                </Button>
                                            ) : (
                                                <Button
                                                    className="my-product-evaluation-button"
                                                    onClick={() => showModal(item.product)}
                                                >
                                                    Ürünü Değerlendir
                                                </Button>
                                            )
                                        )}
                                        {discount > 0 ? (
                                            <p className='my-order-subtotal'>₺{discount} değerinde kazanç sağladınız.</p>
                                        ): null}
                                    </div>
                                    <div className="my-order-info">
                                        <div className={`my-order-status-wrapper ${getStatusClass(order.status)}`}>
                                            <div className="my-order-status-icon"><i className={getStatusIcon(order.status)}></i></div>
                                            <div className="my-order-status-info">
                                                <p className="my-order-status">{order.status}</p>
                                                <time className="my-order-date" dateTime={order.updatedAt}>Tarih: {orderDate}</time>
                                            </div>
                                        </div>
                                        <div className="my-order-buttons-wrapper">
                                            <Link to="" className="my-order-button-link">
                                                <div><i className="bi bi-box2"></i><span>Kargo Takibi</span></div>
                                            </Link>
                                            <Link to="" className="my-order-button-link">
                                                <div><i className="bi bi-file-earmark-medical"></i><span>Faturayı Görüntüle</span></div>
                                            </Link>
                                            <Link to="" className="my-order-button-link">
                                                <div><i className="bi bi-file-x"></i><span>İade Seçenekleri</span></div>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
            <Modal
                title="Ürünü Değerlendir"
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                {selectedProduct && (
                    <ReviewForm
                        singleProduct={selectedProduct}
                        setSingleProduct={handleReviewSubmit}
                        user={user}
                    />
                )}
            </Modal>
        </div>
    );
};

MyOrderItem.propTypes = {
    orders: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        orderNumber: PropTypes.string.isRequired,
        total: PropTypes.number.isRequired,
        subtotal: PropTypes.number.isRequired,
        status: PropTypes.string.isRequired,
        updatedAt: PropTypes.string.isRequired,
        items: PropTypes.arrayOf(PropTypes.shape({
            product: PropTypes.shape({
                _id: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired,
                title: PropTypes.string.isRequired,
                img: PropTypes.arrayOf(PropTypes.string).isRequired,
                reviews: PropTypes.arrayOf(PropTypes.shape({
                    user: PropTypes.string.isRequired,
                })).isRequired,
            }).isRequired,
            price: PropTypes.number.isRequired,
            quantity: PropTypes.number.isRequired,
        })).isRequired,
    })).isRequired,
    setSingleProduct: PropTypes.func.isRequired,
    user: PropTypes.object,
};

export default MyOrderItem;
