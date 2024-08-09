import { Button, Form, Input, Spin, Upload, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UploadOutlined } from "@ant-design/icons";

const UpdateBlogPage = () => {
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [removedImages, setRemovedImages] = useState([]); 
    const [csrfToken, setCsrfToken] = useState("");  
    const navigate = useNavigate();

    const [form] = Form.useForm();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const params = useParams();
    const blogId = params.id;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                const response = await fetch(`${apiUrl}/csrf-token`, { 
                    method: "GET",
                    credentials: "include",
                });
                const data = await response.json();
                setCsrfToken(data.csrfToken);

                const blogResponse = await fetch(`${apiUrl}/api/blogs/${blogId}`);

                if (!blogResponse.ok) {
                    message.error("Veri getirme başarısız.");
                    return;
                }

                const blogData = await blogResponse.json();

                setExistingImages(blogData.img);
                form.setFieldsValue({
                    name: blogData.name,
                    title: blogData.title,
                    desc: blogData.desc,
                    subdesc: blogData.subdesc,
                    blockquote: blogData.blockquote,
                    tags: blogData.tags.join(", "),
                });

            } catch (error) {
                console.log("Veri hatası:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [apiUrl, blogId, form]);

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

        const newImgLinks = await Promise.all(fileList.map(file => uploadImage(file.originFileObj)));
        if (newImgLinks.includes(null)) {
            message.error("Resimlerin bazıları yüklenemedi.");
            setLoading(false);
            return;
        }

        const updatedImgLinks = [...existingImages, ...newImgLinks].filter(img => !removedImages.includes(img));

        const payload = {
            ...values,
            img: updatedImgLinks,
            tags: values.tags.split(",").map(tag => tag.trim())
        };

        try {
            const response = await fetch(`${apiUrl}/api/blogs/${blogId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "CSRF-Token": csrfToken,
                },
                body: JSON.stringify(payload),
                credentials: "include",
            });

            if (response.ok) {
                message.success("Blog başarıyla güncellendi.");
                navigate("/admin/blog");
            } else {
                message.error("Blog güncellenirken bir hata oluştu.");
            }
        } catch (error) {
            console.log("Blog güncelleme hatası:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadChange = ({ fileList }) => {
        setFileList(fileList);
    };

    const handleRemoveExistingImage = (imageUrl) => {
        setExistingImages(existingImages.filter(img => img !== imageUrl));
        setRemovedImages([...removedImages, imageUrl]); 
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
                <Form.Item label="Mevcut Resimler">
                    <div className="existing-images">
                        {existingImages.map((img) => (
                            <div key={img} className="existing-image-item">
                                <img src={img} alt="existing" className="existing-image" />
                                <Button onClick={() => handleRemoveExistingImage(img)}>Sil</Button>
                            </div>
                        ))}
                    </div>
                </Form.Item>
                <Form.Item
                    label="Yeni Resimler Yükle"
                    name="upload"
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
                    Güncelle
                </Button>
            </Form>
        </Spin>
    );
};

export default UpdateBlogPage;
