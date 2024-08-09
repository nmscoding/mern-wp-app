import { Button, Popconfirm, Space, Table, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';

const ProductPage = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const columns = [
    {
      title: "Ürün Görseli",
      dataIndex: "img",
      key: "img",
      render: (imgSrc) => (
        <img src={`${apiUrl}${imgSrc[0]}`} alt="Image" width={100} />
      ),
    },
    {
      title: "Ürün İsmi",
      dataIndex: "name",
      key: "name",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Kategori",
      dataIndex: "categoryName",
      key: "categoryName",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Fiyat",
      dataIndex: "price",
      key: "price",
      render: (text) => <span>{text.newprice.toFixed(2)}</span>,
    },
    {
      title: "İndirim",
      dataIndex: "price",
      key: "price",
      render: (text) => <span>%{text.discount}</span>,
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() => navigate(`/admin/urun/update/${record._id}`)}
          >
            Düzenle
          </Button>
          <Popconfirm
            title="Ürünü Sil"
            description="Ürünü silmek istediğinizden emin misiniz?"
            okText="Evet"
            cancelText="Hayır"
            onConfirm={() => deleteProduct(record._id)}
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
      Cookies.set('XSRF-TOKEN', data.csrfToken);
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error);
    }
  }, [apiUrl]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/urun`, {
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

  const deleteProduct = useCallback(
    async (productId) => {
      try {
        const response = await fetch(`${apiUrl}/api/urun/${productId}`, {
          method: "DELETE",
          headers: {
            "CSRF-Token": csrfToken,
          },
          credentials: "include",
        });

        if (response.ok) {
          message.success("Ürün başarıyla silindi.");
          fetchProducts();
        } else {
          message.error("Silme işlemi başarısız.");
        }
      } catch (error) {
        console.log("Silme hatası:", error);
      }
    },
    [apiUrl, csrfToken, fetchProducts]
  );

  useEffect(() => {
    fetchCsrfToken();
    fetchProducts();
  }, [fetchCsrfToken, fetchProducts]);

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      rowKey={(record) => record._id}
      loading={loading}
    />
  );
};

export default ProductPage;
