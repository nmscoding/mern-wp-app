import { Button, Popconfirm, Space, Table, message } from "antd";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const BrandPage = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const columns = [
    {
      title: "Marka Görseli",
      dataIndex: "img",
      key: "img",
      render: (imgSrc) => (
        <img src={`${apiUrl}/${imgSrc}`} alt="Image" width={100} />
      ),
    },
    {
      title: "Marka İsmi",
      dataIndex: "name",
      key: "name",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() => navigate(`/admin/brands/update/${record._id}`)}
          >
            Düzenle
          </Button>
          <Popconfirm
            title="Markayı Sil"
            description="Markayı silmek istediğinizden emin misiniz?"
            okText="Evet"
            cancelText="Hayır"
            onConfirm={() => deleteBrand(record._id)}
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

  const fetchBrands = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/brands`, {
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

  const deleteBrand = useCallback(
    async (brandId) => {
      try {
        const response = await fetch(`${apiUrl}/api/brands/${brandId}`, {
          method: "DELETE",
          headers: {
            "CSRF-Token": csrfToken, // Include CSRF token in headers
          },
          credentials: "include",
        });

        if (response.ok) {
          message.success("Marka başarıyla silindi.");
          setDataSource((prevBrands) => {
            return prevBrands.filter((brand) => brand._id !== brandId);
          });
        } else {
          message.error("Silme işlemi başarısız.");
        }
      } catch (error) {
        console.log("Silme hatası:", error);
      }
    },
    [apiUrl, csrfToken]
  );

  useEffect(() => {
    fetchCsrfToken();
    fetchBrands();
  }, [fetchCsrfToken, fetchBrands]);

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      rowKey={(record) => record._id}
      loading={loading}
    />
  );
};

export default BrandPage;
