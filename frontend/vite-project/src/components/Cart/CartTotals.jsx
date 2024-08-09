import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartProvider";
import { message } from "antd";

const CartTotals = () => {
  const { cartItems, couponDiscount, appliedCoupon } = useContext(CartContext);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch(`${apiUrl}/csrf-token`, {
          credentials: "include",
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken);
        console.log("CSRF Token fetched:", data.csrfToken);
      } catch (error) {
        console.error("Failed to fetch CSRF token:", error);
      }
    };
    fetchCsrfToken();
  }, [apiUrl]);

  if (cartItems.length === 0) {
    return <div className="cart-totals">
      <div className="wp-cart-empty">
      <i className="bi bi-cart-x-fill"></i>
      <p>Sepetinizde ürün bulunmamaktadır.</p>
      </div>
      </div>;
  }

  const cartItemTotals = cartItems.map((item) => {
    const itemTotal = item.price.newprice * item.quantity;
    return itemTotal;
  });

  let initialSubTotal = cartItemTotals.reduce((previousValue, currentValue) => {
    return previousValue + currentValue;
  }, 0);

  let subTotals = initialSubTotal;

  if (couponDiscount.type === "percent") {
    subTotals = subTotals * (1 - couponDiscount.value / 100);
  } else if (couponDiscount.type === "amount") {
    subTotals = subTotals - couponDiscount.value;
  }

  const cargoFee = initialSubTotal >= 400 || subTotals >= 400 ? 0 : 150;

  const cartTotals = (subTotals + cargoFee).toFixed(2);

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error("Kullanıcı oturumu bulunamadı.");
      navigate('/hesap')
      return;
    }

    try {
      if (appliedCoupon) {
        console.log("Applying coupon code:", appliedCoupon);
        await fetch(`${apiUrl}/api/coupons/use/${appliedCoupon}`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "CSRF-Token": csrfToken,
          },
          credentials: "include",
          body: JSON.stringify({ cartTotal: subTotals })
        });
      }

      message.success("Ödeme Sayfasına Yönlendirildi.");
      navigate(`/siparis?subtotal=${initialSubTotal}&cargo=${cargoFee}&total=${cartTotals}`);
    } catch (error) {
      console.error("Ödeme onaylanırken bir hata oluştu:", error);
      message.error("Ödeme onaylanırken bir hata oluştu.");
    }
  };

  return (
    <div className="cart-totals">
      <h2>Sipariş Özeti</h2>
      <table>
        <tbody>
          <tr className="cart-subtotal">
            <th>Ürün Toplamı</th>
            <td>
              <span id="subtotal">₺{initialSubTotal.toFixed(2)}</span>
            </td>
          </tr>
          <tr>
            <th>Kargo</th>
            <td>
              <span id="cargo-fee">₺{cargoFee.toFixed(2)}</span>
            </td>
          </tr>
          <tr>
            <th>Toplam</th>
            <td>
              <strong id="cart-total">₺{cartTotals}</strong>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="checkout">
        <button className="btn btn-primary btn-lg" onClick={handleCheckout}>Sepeti Onayla</button>
      </div>
    </div>
  );
};

export default CartTotals;
