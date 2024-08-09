import { useEffect, useState } from "react";
import axios from "axios";
import { message } from "antd";
import "./Myaccount.css";
import MyorderItem from "./MyorderItem";
import { Link } from "react-router-dom";

const MyLastorders = () => {
  const [orders, setOrders] = useState([]);
  const [, setSingleProduct] = useState(null); 
  const [user, setUser] = useState(null); 
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchUserOrders = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) {
        message.error("Kullanıcı oturumu bulunamadı.");
        return;
      }

      try {
        setUser(JSON.parse(storedUser)); // localStorage'dan user bilgilerini al

        const response = await axios.get(`${apiUrl}/api/orders/user-orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        if (response.status === 200) {
          const deliveredOrders = response.data.filter(order => order.status === "Teslim Edildi" || order.status === "İptal Edildi");
          setOrders(deliveredOrders);
        } else {
          message.error("Siparişler alınamadı.");
        }
      } catch (error) {
        console.error("Error fetching user orders:", error);
        message.error("Siparişler alınamadı.");
      }
    };

    fetchUserOrders();
  }, [apiUrl]);

  return (
    <div className="profile-info">
      <h2>Geçmiş Siparişlerim</h2>
      {orders.length === 0 ? (
        <div className="my-order-empty-warring">
          <p className="wp-p-order-page">Henüz bir siparişiniz yok.</p>
          <Link to={"/magaza"} className="wp-p-order-page">
            <button className="my-order-go-to-shop">Hemen alışverişe başla <i className="bi bi-hand-index-thumb"></i></button>
          </Link>
        </div>
      ) : (
        <MyorderItem orders={orders} setSingleProduct={setSingleProduct} user={user} />
      )}
    </div>
  );
};

export default MyLastorders;
