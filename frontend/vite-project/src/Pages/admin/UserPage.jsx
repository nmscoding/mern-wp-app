import { Button, Popconfirm, Table, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import Cookies from 'js-cookie';

const UserPage = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const columns = [
    {
      title: "Ad",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Soyad",
      dataIndex: "surname",
      key: "surname",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Adres",
      dataIndex: "address",
      key: "address",
      render: (address) =>
        address
          ? `${address.neighbourhood}, ${address.addressdesc}, ${address.district}/${address.province}`
          : "Adres Bilgisi Yok",
    },
    {
      title: "Telefon",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <Popconfirm
          title="Kullanıcıyı Sil"
          description="Kullanıcıyı silmek istediğinizden emin misiniz?"
          okText="Yes"
          cancelText="No"
          onConfirm={() => deleteUser(record.email)}
        >
          <Button type="primary" danger>
            Delete
          </Button>
        </Popconfirm>
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

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    console.log("Fetching users from:", `${apiUrl}/api/users`);

    try {
      const response = await fetch(`${apiUrl}/api/users`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setDataSource(data);
      } else {
        message.error("Veri başarısız.");
        console.error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log("Veri hatası:", error);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  const deleteUser = async (userEmail) => {
    const token = localStorage.getItem('token'); // Get JWT token from localStorage
    try {
      const response = await fetch(`${apiUrl}/api/users/${userEmail}`, {
        method: "DELETE",
        headers: {
          "CSRF-Token": csrfToken,
          "Authorization": `Bearer ${token}`, // Include JWT token in headers
        },
        credentials: "include",
      });

      if (response.ok) {
        message.success("Kullanıcı başarıyla silindi.");
        fetchUsers();
      } else {
        message.error("Silme işlemi başarısız.");
        console.error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log("Silme hatası:", error);
    }
  };

  useEffect(() => {
    fetchCsrfToken();
    fetchUsers();
  }, [fetchCsrfToken, fetchUsers]);

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      rowKey={(record) => record._id}
      loading={loading}
    />
  );
};

export default UserPage;
