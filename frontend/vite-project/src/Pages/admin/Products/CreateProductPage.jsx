import { Button, Form, Input, InputNumber, Select, Spin, Upload, message } from "antd";
import { useEffect, useState } from "react";
import { UploadOutlined } from "@ant-design/icons";

const CreateProductPage = () => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [csrfToken, setCsrfToken] = useState("");  
    const [form] = Form.useForm();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);

            try {
                const response = await fetch(`${apiUrl}/csrf-token`, { 
                    method: "GET",
                    credentials: "include",
                });
                const data = await response.json();
                setCsrfToken(data.csrfToken);

                const categoriesResponse = await fetch(`${apiUrl}/api/kategori`);
                if (categoriesResponse.ok) {
                    const categoriesData = await categoriesResponse.json();
                    setCategories(categoriesData);
                } else {
                    message.error("Veri getirme başarısız.");
                }
            } catch (error) {
                console.log("Veri hatası:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [apiUrl]);

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
        const imgLinks = await Promise.all(fileList.map(file => uploadImage(file.originFileObj)));

        if (imgLinks.includes(null)) {
            message.error("Resimlerin bazıları yüklenemedi.");
            setLoading(false);
            return;
        }

        const payload = {
            ...values,
            price: {
                newprice: values.newprice,
                discount: values.discount,
                installment: values.installment,
            },
            features: values.features,
            img: imgLinks,
        };

        try {
            const response = await fetch(`${apiUrl}/api/urun`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "CSRF-Token": csrfToken,
                },
                body: JSON.stringify(payload),
                credentials: "include",
            });

            if (response.ok) {
                message.success("Ürün başarıyla oluşturuldu.");
                form.resetFields();
                setFileList([]);
            } else {
                const errorData = await response.json();
                message.error(`Ürün oluşturulurken bir hata oluştu: ${errorData.message}`);
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

    useEffect(() => {
        form.setFieldsValue({ features: [""] });
    }, [form]);

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
                            message: "Lütfen bir ürün başlığı girin!",
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
                            message: "Lütfen ürünün indirim oranını girin!",
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
                <Form.Item
                    label="Ürün Görselleri Yükle"
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
                <Form.List name="features">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <div key={key} style={{ display: 'flex', marginBottom: 8, alignItems: 'center' }}>
                                    <Form.Item
                                        label="Ürünün Özellikleri"
                                        {...restField}
                                        name={[name]}
                                        style={{ flex: 1 }}
                                        rules={[
                                            {
                                                required: true,
                                                message: "Lütfen ürünün özelliklerini girin örneğin (tezgah altı)!",
                                            },
                                        ]}
                                    >
                                        <Input placeholder="Özellik (Tezgah Altı, Garanti Süresi vs.)" />
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
                    Oluştur
                </Button>
            </Form>
        </Spin>
    );
};

export default CreateProductPage;
