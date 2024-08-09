import { Button, Popconfirm, Space, Table, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CategoryPage = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const columns = [
    {
      title: "Kategori Görseli",
      dataIndex: "img",
      key: "img",
      render: (imgSrc) => <img src={imgSrc} alt="Image" width={100} />,
    },
    {
      title: "Name",
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
            onClick={() => navigate(`/admin/kategori/update/${record._id}`)}
          >
            Düzenle
          </Button>
          <Popconfirm
            title="Kategoriyi Sil"
            description="Kategoriyi silmek istediğinizden emin misiniz?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteCategory(record._id)}
          >
            <Button type="primary" danger>
              Delete
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

  const fetchCategories = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/kategori`, {
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

  const deleteCategory = useCallback(
    async (categoryId) => {
      try {
        const response = await fetch(`${apiUrl}/api/kategori/${categoryId}`, {
          method: "DELETE",
          headers: {
            "CSRF-Token": csrfToken, // Include CSRF token in headers
          },
          credentials: "include",
        });

        if (response.ok) {
          message.success("Kategori başarıyla silindi.");
          fetchCategories();
        } else {
          message.error("Silme işlemi başarısız.");
        }
      } catch (error) {
        console.log("Silme hatası:", error);
      }
    },
    [apiUrl, csrfToken, fetchCategories]
  );

  useEffect(() => {
    fetchCsrfToken();
    fetchCategories();
  }, [fetchCsrfToken, fetchCategories]);

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      rowKey={(record) => record._id}
      loading={loading}
    />
  );
};

export default CategoryPage;
