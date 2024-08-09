import { Button, Popconfirm, Space, Table, message } from "antd";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';

const AdminBlogPage = () => {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [csrfToken, setCsrfToken] = useState("");
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const columns = [
        {
            title: "Blog Görseli",
            dataIndex: "img",
            key: "img",
            render: (imgSrc) => (
                <img src={imgSrc[0]} alt="Image" width={100} />
            ),
        },
        {
            title: "Blog Başlığı",
            dataIndex: "title",
            key: "title",
            render: (text) => <b>{text}</b>,
        },
        {
            title: "Etiketler",
            dataIndex: "tags",
            key: "tags",
            render: (tags) => (
                tags.map((tag) => <span key={tag} style={{ marginRight: 5 }}>{tag}</span>)
            ),
        },
        {
            title: "Actions",
            dataIndex: "actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        onClick={() => navigate(`/admin/blogs/update/${record._id}`)}
                    >
                        Düzenle
                    </Button>
                    <Popconfirm
                        title="Blogu Sil"
                        description="Blogu silmek istediğinizden emin misiniz?"
                        okText="Evet"
                        cancelText="Hayır"
                        onConfirm={() => deleteBlog(record._id)}
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

    const deleteBlog = async (blogId) => {
        const token = localStorage.getItem('token'); // Get JWT token from localStorage
        try {
            const response = await fetch(`${apiUrl}/api/blogs/${blogId}`, {
                method: "DELETE",
                headers: {
                  "CSRF-Token": csrfToken,
                  "Authorization": `Bearer ${token}`, // Include JWT token in headers
                },
                credentials: "include",
            });

            if (response.ok) {
                message.success("Blog başarıyla silindi.");
                setDataSource((prevBlogs) => {
                    return prevBlogs.filter((blog) => blog._id !== blogId);
                });
            } else {
                message.error("Silme işlemi başarısız.");
            }
        } catch (error) {
            console.log("Silme hatası:", error);
        }
    };

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        await fetchCsrfToken();
        try {
          const response = await fetch(`${apiUrl}/api/blogs`, {
            credentials: "include",
          });
          if (!response.ok) {
            message.error("Veri getirme başarısız.");
          }

          const blogsData = await response.json();
          
          if (!Array.isArray(blogsData)) {
            message.error("Gelen veri geçersiz formatta.");
            setLoading(false);
            return;
          }

          setDataSource(blogsData);
        } catch (error) {
          console.log("Veri hatası:", error);
          message.error("Veri çekme hatası.");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [apiUrl, fetchCsrfToken]);

    return (
        <Table
            dataSource={dataSource}
            columns={columns}
            rowKey={(record) => record._id}
            loading={loading}
        />
    );
};

export default AdminBlogPage;
