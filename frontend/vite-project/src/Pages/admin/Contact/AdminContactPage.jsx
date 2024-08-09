import { Button, Popconfirm, Space, Table, message } from "antd";
import { useEffect, useState, useCallback } from "react";

const AdminContactPage = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const columns = [
    {
      title: "İsim",
      dataIndex: "name",
      key: "name",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Konu",
      dataIndex: "subject",
      key: "subject",
      render: (text) => (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {text}
        </div>
      ),
    },
    {
      title: "Mesaj",
      dataIndex: "message",
      key: "message",
      render: (text) => (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {text}
        </div>
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="İletişimi Sil"
            description="Bu iletişimi silmek istediğinizden emin misiniz?"
            okText="Evet"
            cancelText="Hayır"
            onConfirm={() => deleteContact(record._id)}
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

  const fetchContacts = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/contact`, {
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

  const deleteContact = useCallback(
    async (contactId) => {
      try {
        const response = await fetch(`${apiUrl}/api/contact/${contactId}`, {
          method: "DELETE",
          headers: {
            "CSRF-Token": csrfToken, // Include CSRF token in headers
          },
          credentials: "include",
        });

        if (response.ok) {
          message.success("İletişim başarıyla silindi.");
          fetchContacts();
        } else {
          message.error("Silme işlemi başarısız.");
        }
      } catch (error) {
        console.log("Silme hatası:", error);
      }
    },
    [apiUrl, csrfToken, fetchContacts]
  );

  useEffect(() => {
    fetchCsrfToken();
    fetchContacts();
  }, [fetchCsrfToken, fetchContacts]);

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      rowKey={(record) => record._id}
      loading={loading}
      scroll={{ x: true }} // Add this line to make the table horizontally scrollable
    />
  );
};

export default AdminContactPage;
