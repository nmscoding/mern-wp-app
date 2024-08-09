import { Table, message, Select, Button, Input } from "antd";
import { useCallback, useEffect, useState } from "react";
import Cookies from 'js-cookie';

const { Option } = Select;
const { Search } = Input;

const OrdersPage = () => {
  const [dataSource, setDataSource] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const columns = [
    {
      title: "Sipariş No",
      dataIndex: ["orderNumber"],
      key: "orderNumber",
    },
    {
      title: "Ad",
      dataIndex: ["buyer", "name"],
      key: "name",
    },
    {
      title: "Soyad",
      dataIndex: ["buyer", "surname"],
      key: "surname",
    },
    {
      title: "Adres",
      dataIndex: ["buyer", "address"],
      key: "address",
      render: (address) =>
        address
          ? `${address.neighbourhood}, ${address.addressdesc}, ${address.district}/${address.province}`
          : "Adres Bilgisi Yok",
    },
    {
      title: "Telefon",
      dataIndex: ["buyer", "phone"],
      key: "phone",
    },
    {
      title: "Ürünler",
      dataIndex: "items",
      key: "items",
      render: (items) =>
        items.map(item => (
          <div key={item.product._id}>
            {item.product.name} - {item.quantity} adet - ₺{item.price.toFixed(2)}
          </div>
        )),
    },
    {
      title: "Toplam",
      dataIndex: "total",
      key: "total",
      render: (total) => `₺${(total).toFixed(2)}`,
    },
    {
      title: "Durum",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          defaultValue={status}
          onChange={(value) => handleStatusChange(value, record._id)}
        >
          <Option value="Sipariş Hazırlanıyor">Sipariş Hazırlanıyor</Option>
          <Option value="Kargoda">Kargoda</Option>
          <Option value="Teslim Edildi">Teslim Edildi</Option>
          <Option value="İptal Edildi">İptal Edildi</Option>
        </Select>
      ),
    },
    {
      title: "Güncelle",
      key: "update",
      render: (_, record) => (
        <Button onClick={() => updateOrderStatus(record._id)}>Güncelle</Button>
      ),
    },
  ];

  const fetchCsrfToken = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/csrf-token`, {
        credentials: "include",
      });
      const data = await response.json();
      Cookies.set('XSRF-TOKEN', data.csrfToken);
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error);
    }
  }, [apiUrl]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/orders`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setDataSource(data);
        setFilteredData(data);
      } else {
        message.error("Veri başarısız.");
        console.error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Veri hatası:", error);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  const handleStatusChange = (value, orderId) => {
    const newDataSource = dataSource.map(order => {
      if (order._id === orderId) {
        return { ...order, status: value };
      }
      return order;
    });
    setDataSource(newDataSource);
    setFilteredData(newDataSource);
  };

  const updateOrderStatus = async (orderId) => {
    setLoading(true);

    const order = dataSource.find(order => order._id === orderId);

    try {
      const response = await fetch(`${apiUrl}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "CSRF-Token": Cookies.get('XSRF-TOKEN'), // CSRF token'ı header'a ekliyoruz
        },
        body: JSON.stringify({ status: order.status }),
        credentials: "include",
      });

      if (response.ok) {
        message.success("Sipariş durumu güncellendi.");
      } else {
        message.error("Sipariş durumu güncellenemedi.");
        console.error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Durum güncelleme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    if (value) {
      const filtered = dataSource.filter(order => order.orderNumber.includes(value));
      setFilteredData(filtered);
    } else {
      setFilteredData(dataSource);
    }
  };

  useEffect(() => {
    fetchCsrfToken();
    fetchOrders();
  }, [fetchCsrfToken, fetchOrders]);

  return (
    <div>
      <Search
        placeholder="Sipariş Numarası ile Ara"
        onSearch={handleSearch}
        style={{ marginBottom: 16, width: 300 }}
      />
      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey={(record) => record._id}
        loading={loading}
      />
    </div>
  );
};

export default OrdersPage;
