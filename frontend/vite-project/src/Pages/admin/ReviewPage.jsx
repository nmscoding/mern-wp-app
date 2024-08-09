import { Button, Popconfirm, Space, Table, message, Select } from "antd";
import { useCallback, useEffect, useState } from "react";

const ReviewPage = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

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

  const fetchReviews = useCallback(async (productId) => {
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/urun/${productId}/reviews`, {
        credentials: "include",
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

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/urun`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        message.error("Ürünleri getirme başarısız.");
      }
    } catch (error) {
      console.log("Ürün veri hatası:", error);
    }
  }, [apiUrl]);

  const deleteReview = useCallback(
    async (reviewId, productId) => {
      try {
        const response = await fetch(`${apiUrl}/api/urun/${productId}/reviews/${reviewId}`, {
          method: "DELETE",
          headers: {
            "CSRF-Token": csrfToken, // Include CSRF token in headers
          },
          credentials: "include",
        });

        if (response.ok) {
          message.success("Yorum başarıyla silindi.");
          if (selectedProduct) {
            fetchReviews(selectedProduct);
          }
        } else {
          message.error("Silme işlemi başarısız.");
        }
      } catch (error) {
        console.log("Silme hatası:", error);
      }
    },
    [apiUrl, csrfToken, selectedProduct, fetchReviews]
  );

  useEffect(() => {
    fetchCsrfToken();
    fetchProducts();
  }, [fetchCsrfToken, fetchProducts]);

  useEffect(() => {
    if (selectedProduct) {
      fetchReviews(selectedProduct);
    }
  }, [selectedProduct, fetchReviews]);

  const columns = [
    {
      title: "Yorum",
      dataIndex: "text",
      key: "text",
    },
    {
      title: "Puan",
      dataIndex: "rating",
      key: "rating",
    },
    {
      title: "Kullanıcı",
      dataIndex: ["user", "name"],
      key: "user",
    },
    {
      title: "Tarih",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleDateString("tr-TR"),
    },
    {
      title: "Fotoğraflar",
      dataIndex: "images",
      key: "images",
      render: (images) => images.map((img, index) => (
        <img key={index} src={`${apiUrl}${img}`} alt="review" width={50} />
      )),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Yorumu Sil"
            description="Yorumu silmek istediğinizden emin misiniz?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteReview(record._id, selectedProduct)}
          >
            <Button type="primary" danger>
              Sil
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Select
        placeholder="Ürün Seçin"
        style={{ width: 200, marginBottom: 20 }}
        onChange={(value) => setSelectedProduct(value)}
      >
        {products.map((product) => (
          <Select.Option key={product._id} value={product._id}>
            {product.name}
          </Select.Option>
        ))}
      </Select>
      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey={(record) => record._id}
        loading={loading}
      />
    </div>
  );
};

export default ReviewPage;
