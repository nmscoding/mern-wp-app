import { Button, Form, Input, InputNumber, Select, Spin, Upload, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UploadOutlined } from "@ant-design/icons";
import "./UpdateProduct.css";

const UpdateProductPage = () => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [removedImages, setRemovedImages] = useState([]); 
    const [csrfToken, setCsrfToken] = useState("");  
    const navigate = useNavigate();

    const [form] = Form.useForm();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const params = useParams();
    const productId = params.id;

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

                const [categoriesResponse, singleProductResponse] = await Promise.all([
                    fetch(`${apiUrl}/api/kategori`),
                    fetch(`${apiUrl}/api/urun/${productId}`),
                ]);

                if (!categoriesResponse.ok || !singleProductResponse.ok) {
                    message.error("Veri getirme başarısız.");
                    return;
                }

                const [categoriesData, singleProductData] = await Promise.all([
                    categoriesResponse.json(),
                    singleProductResponse.json(),
                ]);

                setCategories(categoriesData);

                if (singleProductData) {
                    setExistingImages(singleProductData.img);
                    form.setFieldsValue({
                        name: singleProductData.name,
                        newprice: singleProductData.price.newprice,
                        discount: singleProductData.price.discount,
                        installment: singleProductData.price.installment,
                        title: singleProductData.title,
                        category: singleProductData.category,
                        features: singleProductData.features || [], // Mevcut özellikleri formda ayarla
                    });
                }
            } catch (error) {
                console.log("Veri hatası:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [apiUrl, productId, form]);

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`${apiUrl}/api/urun/upload`, {
                method: 'POST',
                headers: {
                    "CSRF-Token": csrfToken,
                },
                body: formData,
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                return data.url;
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

        try {
            const response = await fetch(`${apiUrl}/api/urun/${productId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "CSRF-Token": csrfToken,  
                },
                body: JSON.stringify({
                    ...values,
                    price: {
                        newprice: values.newprice,
                        discount: values.discount,
                        installment: values.installment,
                    },
                    img: updatedImgLinks,
                }),
                credentials: "include",
            });

            if (response.ok) {
                message.success("Ürün başarıyla güncellendi.");
                navigate("/admin/urun");
            } else {
                message.error("Ürün güncellenirken bir hata oluştu.");
            }
        } catch (error) {
            console.log("Ürün güncelleme hatası:", error);
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
                    label="Ürün İsmi"
                    name="name"
                    rules={[
                        {
                            required: true,
                            message: "Lütfen Ürün adını girin!",
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Ürün Kategorisi"
                    name="category"
                    rules={[
                        {
                            required: true,
                            message: "Lütfen 1 kategori seçin!",
                        },
                    ]}
                >
                    <Select>
                        {categories.map((category) => (
                            <Select.Option value={category._id} key={category._id}>
                                {category.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    label="Ürün Başlığı"
                    name="title"
                    rules={[
                        {
                            required: true,
                            message: "Lütfen bir ürün açıklaması girin!",
                        },
                    ]}
                >
                    <Input.TextArea rows={4} />
                </Form.Item>
                <Form.Item
                    label="Fiyat"
                    name="newprice"
                    rules={[
                        {
                            required: true,
                            message: "Lütfen ürün fiyatını girin!",
                        },
                    ]}
                >
                    <InputNumber />
                </Form.Item>
                <Form.Item
                    label="İndirim Oranı"
                    name="discount"
                    rules={[
                        {
                            required: true,
                            message: "Lütfen bir ürün indirim oranı girin!",
                        },
                    ]}
                >
                    <InputNumber />
                </Form.Item>
                <Form.Item
                    label="Taksit Bilgisi (Aylık)"
                    name="installment"
                    rules={[
                        {
                            required: true,
                            message: "Taksit bilgisi zorunlu değil (0) girilebilir.",
                        },
                    ]}
                >
                    <InputNumber />
                </Form.Item>
                <Form.Item label="Mevcut Resimler">
                    <div className="existing-images">
                        {existingImages.map((img) => (
                            <div key={img} className="existing-image-item">
                                <img src={`${apiUrl}${img}`} alt="existing" className="existing-image" />
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
                <Form.List name="features">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <div key={key} style={{ display: 'flex', marginBottom: 8, alignItems: 'center' }}>
                                    <Form.Item
                                        {...restField}
                                        name={[name]}
                                        style={{ flex: 1 }}
                                    >
                                        <Input placeholder="Özellik" />
                                    </Form.Item>
                                    <Button type="danger" onClick={() => remove(name)} style={{ marginLeft: 8 }}>
                                        Sil
                                    </Button>
                                </div>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<UploadOutlined />}>
                                    Özellik Ekle
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
                <Button type="primary" htmlType="submit">
                    Güncelle
                </Button>
            </Form>
        </Spin>
    );
};

export default UpdateProductPage;
