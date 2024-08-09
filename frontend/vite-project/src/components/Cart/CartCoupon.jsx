import { useContext, useState, useEffect } from "react";
import { CartContext } from "../../context/CartProvider";
import { message } from "antd";

const CartCoupon = () => {
  const [couponCode, setCouponCode] = useState("");
  const { cartItems, couponDiscount, setCouponDiscount, setDiscountedTotal, setAppliedCoupon } = useContext(CartContext);
  const [csrfToken, setCsrfToken] = useState(""); // CSRF token için state ekleyin
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch(`${apiUrl}/csrf-token`, {
          credentials: "include",
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error("CSRF token alınamadı:", error);
      }
    };

    fetchCsrfToken();
  }, [apiUrl]);

  const calculateCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price.newprice * item.quantity, 0);
  };

  const applyCoupon = async () => {
    if (couponCode.trim().length === 0) {
      return message.warning("Boş değer girilimez.");
    }

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${apiUrl}/api/coupons/use/${couponCode}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "CSRF-Token": csrfToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartTotal: calculateCartTotal() }),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        return message.warning(`Error: ${errorData.error}`);
      }

      const data = await res.json();
      const { discountAmount, discountType, discountedTotal } = data;

      setCouponDiscount({ value: discountAmount, type: discountType });
      setDiscountedTotal(discountedTotal);
      setAppliedCoupon(couponCode); 
      message.success(`${couponCode} kupon kodu başarıyla uygulandı.`);
    } catch (error) {
      console.log(error);
      message.error("Bir hata oluştu.");
    }
  };

  const removeCoupon = () => {
    setCouponDiscount({ value: 0, type: null });
    setCouponCode("");
    setAppliedCoupon(""); // Kupon kodunu sıfırla
    message.success("Kupon kaldırıldı.");
  };

  return (
    <div className="actions-wrapper">
      <div className="coupon">
        <input
          type="text"
          className="input-text"
          placeholder="İndirim Kodu"
          onChange={(e) => setCouponCode(e.target.value)}
          value={couponCode}
          disabled={couponDiscount.type !== null || cartItems.length === 0}
        />
        {couponDiscount.type === null ? (
          <button className="btn btn-sm" type="button" onClick={applyCoupon} disabled={cartItems.length === 0}>
            Uygula
          </button>
        ) : (
          <button className="btn btn-sm" type="button" onClick={removeCoupon}>
            Kaldır
          </button>
        )}
      </div>
    </div>
  );
};

export default CartCoupon;
