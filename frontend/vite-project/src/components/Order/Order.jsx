import { useCallback, useContext, useEffect, useState } from 'react';
import './Order.css';
import axios from 'axios';
import { Modal, message } from 'antd';
import MyAddress from '../Profile/Myaddress';
import LoadingScreen from '../Loading/LoadingScreen';
import { CartContext } from '../../context/CartProvider';
import { useNavigate } from 'react-router-dom';

const Order = () => {
  const [userData, setUserData] = useState(null);
  const [csrfToken, setCsrfToken] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const navigate = useNavigate(); 
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { cartItems, couponDiscount, appliedCoupon, clearCart } = useContext(CartContext);

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/hesap');
        throw new Error("Kullanıcı oturumu bulunamadı.");
      }

      const csrfResponse = await fetch(`${apiUrl}/csrf-token`, {
        method: "GET",
        credentials: "include",
      });
      const csrfData = await csrfResponse.json();
      setCsrfToken(csrfData.csrfToken);

      const userResponse = await fetch(`${apiUrl}/api/hesap/profile`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!userResponse.ok) {
        throw new Error("Kullanıcı verileri alınamadı.");
      }
      const userData = await userResponse.json();
      setUserData({
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
        phone: userData.phone || "",
        address: userData.address,
      });

      console.log("Fetched User Data:", userData);

    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, [apiUrl, navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const calculateTotals = () => {
    const cartItemTotals = cartItems.map((item) => item.price.newprice * item.quantity);
    let initialSubTotal = cartItemTotals.reduce((previousValue, currentValue) => previousValue + currentValue, 0);
    let subTotals = initialSubTotal;

    if (couponDiscount.type === "percent") {
      subTotals = subTotals * (1 - couponDiscount.value / 100);
    } else if (couponDiscount.type === "amount") {
      subTotals = subTotals - couponDiscount.value;
    }

    const cargoFee = initialSubTotal >= 400 || subTotals >= 400 ? 0 : 150;
    const total = (subTotals + cargoFee).toFixed(2);

    return {
      initialSubTotal: initialSubTotal.toFixed(2),
      subTotals: subTotals.toFixed(2),
      cargoFee: cargoFee.toFixed(2),
      total: total,
    };
  };

  const totals = calculateTotals();

  const handleCheckout = async () => {
    if (!isTermsChecked) {
      message.error("Ön Bilgilendirme Koşulları ve Mesafeli Satış Sözleşmesi'ni onaylamalısınız.");
      return;
    }

    if (!selectedAddress) {
      message.error("Bir adres seçmelisiniz.");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      message.error("Kullanıcı oturumu bulunamadı.");
      navigate('/hesap');
      return;
    }

    if (!userData || !userData.email) {
      message.error("Kullanıcı bilgileri eksik.");
      return;
    }

    const orderData = {
      buyer: {
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
        phone: userData.phone,
        address: selectedAddress,
      },
      items: cartItems.map(item => ({
        product: item._id,
        quantity: item.quantity,
        price: item.price.newprice,
      })),
      subtotal: totals.initialSubTotal, 
      total: totals.total, 
      couponCode: appliedCoupon ? appliedCoupon : null,
      discountValue: couponDiscount.value,
    };

    console.log("Order Data:", orderData);

    try {
      const response = await axios.post(`${apiUrl}/api/orders`, orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "CSRF-Token": csrfToken,
        },
        withCredentials: true,
      });

      if (response.status === 201) {
        message.success("Sipariş başarıyla oluşturuldu.");
        clearCart();
      } else {
        message.error("Sipariş oluşturulurken bir hata oluştu.");
      }
    } catch (error) {
      console.error('Sipariş oluşturulurken bir hata oluştu:', error);
      message.error("Sipariş oluşturulurken bir hata oluştu.");
    }
  };


  const handleModalClose = () => {
    setIsModalVisible(false);
    fetchUserData();
  };

  if (!userData) {
    return <LoadingScreen />;
  }

  const { name, phone, address, surname } = userData;

  return (
    <section className="order-page">
      <div className="container">
        <div className="order-wrapper">
          <div className="order-column">
            <form action="">
              <div className="order-left">
                <div className="order-address">
                  <h3>Adres Bilgileri</h3>
                  <div className="wp-display-flex address-page-content">
                    {address && address.length > 0 ? (
                      address.map((addr) => (
                        <div key={addr._id} className="wp-display-flex wp-bg-white wp-flex-column addresses-page-content-box">
                          <div className="wp-display-flex addresses-page-content-box-header">
                            <label>
                              <input
                                type="radio"
                                name="selectedAddress"
                                value={addr._id}
                                onChange={() => setSelectedAddress(addr)}
                              />
                            </label>
                            <span className="wp-text wp-color-black wp-font-md wp-font-w-bold">{addr.addressname || 'Kayıtlı Adres Yok'}</span>
                            <span className="wp-number wp-color-black wp-font-sm">{phone || ''}</span>
                          </div>
                          <div className="wp-display-flex wp-flex-column address-page-content-box-body">
                            <span className="wp-text wp-color-black wp-font-sm wp-font-w-bold">{`${name} ${surname}` || ''}</span>
                            <span className="wp-text wp-color-black wp-font-sm">{addr.neighbourhood || ''}</span>
                            <span className="wp-text wp-color-black wp-font-sm">{addr.addressdesc || ''}</span>
                            <span className="wp-text wp-color-black wp-font-sm">{addr.town || ''}</span>
                            <span className="wp-text wp-color-black wp-font-sm">{addr ? `${addr.province}/${addr.town}` : ''}</span>
                          </div>
                          <div className="wp-display-flex wp-flex-row address-page-content-box-actions"></div>
                        </div>
                      ))
                    ) : null}
                    <div className='add-address-content-box'>
                      <button type="button" onClick={() => setIsModalVisible(true)}><i className='bi bi-plus'></i></button>
                    </div>
                    <Modal
                      open={isModalVisible}
                      onCancel={() => handleModalClose()}
                      footer={null}
                    >
                      <MyAddress onClose={() => handleModalClose()} />
                    </Modal>
                  </div>
                </div>
                <div className="payment-info">
                  <h3>Ödeme Yöntemi</h3>
                  <div className="payment-info-wrapper">
                    <div className='payment-info-title'>
                      <strong>Iyzico</strong>
                      <img src="/images/credit-card.png" alt="" />
                    </div>
                    <div className='payment-info-desc'>
                      <i className='bi bi-credit-card'></i>
                      <span>
                        Ödemeye geç düğmesine tıkladıktan sonra, satın alımınızı güvenle tamamlamanız için iyzico - Kredi ve Banka Kartları ağ geçidine yönlendirilirsiniz.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div className="order-right">
            <form action="">
              <div className="cart-check-box">
                <input
                  type="checkbox"
                  name="terms"
                  id="terms"
                  required
                  onChange={(e) => setIsTermsChecked(e.target.checked)}
                />
                <span className='cart-checkbox-text'>Ön Bilgilendirme Koşulları ve Mesafeli Satış Sözleşmesi`ni okudum, onaylıyorum.</span>
              </div>
              <div className="order-collaterals">
                <div className="cart-totals">
                  <table>
                    <tbody>
                      <tr className='cart-subtotal'>
                        <th>Sepet Toplamı</th>
                        <td>
                          <span id='subtotal'>₺{totals.initialSubTotal}</span>
                        </td>
                      </tr>
                      <tr>
                        <th>Kupon İndirimi</th>
                        <td>
                          <span id='coupon'>
                            {couponDiscount.type === "percent"
                              ? `${couponDiscount.value}% indirim`
                              : `₺${parseFloat(couponDiscount.value).toFixed(2)} indirim`}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <th>Kargo</th>
                        <td>
                          <span id="cargo-fee">₺{totals.cargoFee}</span>
                        </td>
                      </tr>
                      <tr>
                        <th>Toplam</th>
                        <td>
                          <strong>₺{totals.total}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="order-check-button">
                  <button className='btn btn-primary btn-lg' type="button" onClick={handleCheckout}>Ödemeye Geç</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Order;
