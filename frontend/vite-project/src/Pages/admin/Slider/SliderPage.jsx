import { Button, Popconfirm, Space, Table, message } from "antd";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const SliderPage = () => {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [csrfToken, setCsrfToken] = useState("");
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const columns = [
        {
            title: "Slider Görseli",
            dataIndex: "img",
            key: "img",
            render: (imgSrc) => (
                <img src={`${apiUrl}/${imgSrc}`} alt="Image" width={100} />
            ),
        },
        {
            title: "Başlık",
            dataIndex: "title",
            key: "title",
            render: (text) => <b>{text}</b>,
        },
        {
            title: "Alt Başlık",
            dataIndex: "subtitle",
            key: "subtitle",
        },
        {
            title: "Actions",
            dataIndex: "actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        onClick={() => navigate(`/admin/sliders/update/${record._id}`)}
                    >
                        Düzenle
                    </Button>
                    <Popconfirm
                        title="Slider'ı Sil"
                        description="Slider'ı silmek istediğinizden emin misiniz?"
                        okText="Evet"
                        cancelText="Hayır"
                        onConfirm={() => deleteSlider(record._id)}
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

    const fetchSliders = useCallback(async () => {
        setLoading(true);

        try {
            const response = await fetch(`${apiUrl}/api/sliders`, {
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

    const deleteSlider = useCallback(
        async (sliderId) => {
            try {
                const response = await fetch(`${apiUrl}/api/sliders/${sliderId}`, {
                    method: "DELETE",
                    headers: {
                        "CSRF-Token": csrfToken, // Include CSRF token in headers
                    },
                    credentials: "include",
                });

                if (response.ok) {
                    message.success("Slider başarıyla silindi.");
                    setDataSource((prevSliders) => {
                        return prevSliders.filter((slider) => slider._id !== sliderId);
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
        fetchSliders();
    }, [fetchCsrfToken, fetchSliders]);

    return (
        <Table
            dataSource={dataSource}
            columns={columns}
            rowKey={(record) => record._id}
            loading={loading}
        />
    );
};

export default SliderPage;
