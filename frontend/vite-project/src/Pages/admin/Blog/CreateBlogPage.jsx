import { Button, Form, Input, Spin, Upload, message } from "antd";
import { useState, useEffect } from "react";
import { UploadOutlined } from "@ant-design/icons";

const CreateBlogPage = () => {
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [csrfToken, setCsrfToken] = useState("");  
    const [form] = Form.useForm();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchCSRFToken = async () => {
            try {
                const response = await fetch(`${apiUrl}/csrf-token`, { 
                    method: "GET",
                    credentials: "include",
                });
                const data = await response.json();
                setCsrfToken(data.csrfToken);
            } catch (error) {
                console.log("CSRF token fetch error:", error);
            }
        };

        fetchCSRFToken();
    }, [apiUrl]);

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`${apiUrl}/api/blogs/upload`, {
                method: 'POST',
                headers: {
                    "CSRF-Token": csrfToken,
                },
                body: formData,
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                return `${apiUrl}${data.url}`;
            } else {
                message.error('Resim yükleme başarısız.');
                return null;
            }
        } catch (error) {
            console.error('Resim yükleme hatası:', error);
            return null;
        }
    };

    const onFinish = async (values) => {
        setLoading(true);
        const imgLinks = await Promise.all(fileList.map(file => uploadImage(file.originFileObj)));

        if (imgLinks.includes(null)) {
            message.error("Resimlerin bazıları yüklenemedi.");
            setLoading(false);
            return;
        }

        const payload = {
            ...values,
            img: imgLinks,
            tags: values.tags.split(",").map(tag => tag.trim())
        };

        try {
            const response = await fetch(`${apiUrl}/api/blogs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "CSRF-Token": csrfToken,
                },
                body: JSON.stringify(payload),
                credentials: "include",
            });

            if (response.ok) {
                message.success("Blog başarıyla oluşturuldu.");
                form.resetFields();
                setFileList([]);
            } else {
                const errorData = await response.json();
                message.error(`Blog oluşturulurken bir hata oluştu: ${errorData.message}`);
            }
        } catch (error) {
            console.log("Blog oluşturma hatası:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadChange = ({ fileList }) => {
        setFileList(fileList);
    };

    return (
        <Spin spinning={loading}>
            <Form name="basic" layout="vertical" onFinish={onFinish} form={form}>
                <Form.Item
                    label="Blog Adı"
                    name="name"
                    rules={[
                        {
                            required: true,
                            message: "Lütfen blog adını girin!",
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Blog Başlığı"
                    name="title"
                    rules={[
                        {
                            required: true,
                            message: "Lütfen blog başlığını girin!",
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Blog İçeriği"
                    name="desc"
                    rules={[
                        {
                            required: true,
                            message: "Lütfen blog içeriğini girin!",
                        },
                    ]}
                >
                    <Input.TextArea rows={6} />
                </Form.Item>
                <Form.Item
                    label="Blog Alt Açıklaması"
                    name="subdesc"
                    rules={[
                        {
                            required: true,
                            message: "Lütfen blog alt açıklamasını girin!",
                        },
                    ]}
                >
                    <Input.TextArea rows={4} />
                </Form.Item>
                <Form.Item
                    label="Blog Alıntısı"
                    name="blockquote"
                    rules={[
                        {
                            required: true,
                            message: "Lütfen blog alıntısını girin!",
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Etiketler"
                    name="tags"
                    rules={[
                        {
                            required: true,
                            message: "Lütfen etiketleri girin!",
                        },
                    ]}
                >
                    <Input placeholder="Etiketleri virgülle ayırarak girin" />
                </Form.Item>
                <Form.Item
                    label="Blog Görselleri Yükle"
                    name="upload"
                    rules={[
                        {
                            required: true,
                            message: "En az 1 adet fotoğraf yükleyin."
                        },
                    ]}
                >
                    <Upload
                        fileList={fileList}
                        onChange={handleUploadChange}
                        multiple
                        beforeUpload={() => false}
                        listType="picture"
                    >
                        <Button icon={<UploadOutlined />}>Resim Yükle</Button>
                    </Upload>
                </Form.Item>

                <Button type="primary" htmlType="submit">
                    Oluştur
                </Button>
            </Form>
        </Spin>
    );
};

export default CreateBlogPage;
