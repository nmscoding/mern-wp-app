import { Button, Popconfirm, Space, Table, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CouponPage = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const columns = [
    {
      title: "Kupon Kodu",
      dataIndex: "code",
      key: "code",
      render: (code) => <b>{code}</b>,
    },
    {
      title: "İndirim Değeri",
      dataIndex: "discountValue",
      key: "discountValue",
    },
    {
      title: "İndirim Türü",
      dataIndex: "discountType",
      key: "discountType",
      render: (type) => (type === "percent" ? "Yüzde" : "Birim"),
    },
    {
      title: "Minimum Harcama Tutarı",
      dataIndex: "minimumSpend",
      key: "minimumSpend",
    },
    {
      title: "Geçerlilik Tarihi",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() => navigate(`/admin/coupons/update/${record._id}`)}
          >
            Güncelle
          </Button>
          <Popconfirm
            title="Kuponu Sil"
            description="Kuponu silmek istediğinizden emin misiniz?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteCoupon(record._id)}
          >
            <Button type="primary" danger>
              Sil
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const fetchCsrfToken = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/csrf-token`, {
        credentials: "include",
      });
      const data = await response.json();
      setCsrfToken(data.csrfToken);
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error);
    }
  }, [apiUrl]);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);

    const token = localStorage.getItem('token'); // Get JWT token from localStorage

    try {
      const response = await fetch(`${apiUrl}/api/coupons`, {
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}` // Include JWT token in headers
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDataSource(data);
      } else {
        message.error("Veri getirme başarısız.");
      }
    } catch (error) {
      console.log("Veri hatası:", error);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  const deleteCoupon = useCallback(
    async (couponId) => {
      const token = localStorage.getItem('token'); // Get JWT token from localStorage

      try {
        const response = await fetch(`${apiUrl}/api/coupons/${couponId}`, {
          method: "DELETE",
          headers: {
            "CSRF-Token": csrfToken, // Include CSRF token in headers
            "Authorization": `Bearer ${token}` // Include JWT token in headers
          },
          credentials: "include",
        });

        if (response.ok) {
          message.success("Kupon başarıyla silindi.");
          fetchCoupons();
        } else {
          message.error("Silme işlemi başarısız.");
        }
      } catch (error) {
        console.log("Silme hatası:", error);
      }
    },
    [apiUrl, csrfToken, fetchCoupons]
  );

  useEffect(() => {
    fetchCsrfToken();
    fetchCoupons();
  }, [fetchCsrfToken, fetchCoupons]);

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      rowKey={(record) => record._id}
      loading={loading}
    />
  );
};

export default CouponPage;
