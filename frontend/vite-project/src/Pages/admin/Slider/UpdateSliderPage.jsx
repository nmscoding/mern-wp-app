import { Button, Form, Input, Spin, Upload, message, Select } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UploadOutlined } from "@ant-design/icons";

const { Option } = Select;

const UpdateSliderPage = () => {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [existingImage, setExistingImage] = useState(null);
  const [csrfToken, setCsrfToken] = useState("");
  const [products, setProducts] = useState([]);
  const [setRemovedImage] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const params = useParams();
  const sliderId = params.id;

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch(`${apiUrl}/csrf-token`, {
          credentials: "include",
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error("Failed to fetch CSRF token:", error);
      }
    };
    fetchCsrfToken();
  }, [apiUrl]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/urun`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          message.error("Ürün verilerini getirme başarısız.");
        }
      } catch (error) {
        console.error("Ürün verileri hatası:", error);
      }
    };
    fetchProducts();
  }, [apiUrl]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const response = await fetch(`${apiUrl}/api/sliders/${sliderId}`);

        if (!response.ok) {
          message.error("Veri getirme başarısız.");
          return;
        }

        const data = await response.json();

        if (data) {
          setExistingImage(data.img);
          form.setFieldsValue({
            title: data.title,
            subtitle: data.subtitle,
            productId: data.productId,
          });
        }
      } catch (error) {
        console.log("Veri hatası:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiUrl, sliderId, form]);

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${apiUrl}/api/sliders/upload`, {
        method: 'POST',
        headers: {
          "CSRF-Token": csrfToken, // Include CSRF token in headers
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

    let imgLink = existingImage;
    if (fileList.length > 0) {
      imgLink = await uploadImage(fileList[0].originFileObj);
      if (!imgLink) {
        message.error("Resim yüklenemedi.");
        setLoading(false);
        return;
      }
    }

    const payload = {
      ...values,
      img: imgLink,
    };

    try {
      const response = await fetch(`${apiUrl}/api/sliders/${sliderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken, // Include CSRF token in headers
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (response.ok) {
        message.success("Slider başarıyla güncellendi.");
        navigate("/admin/sliders");
      } else {
        message.error("Slider güncellenirken bir hata oluştu.");
      }
    } catch (error) {
      console.log("Slider güncelleme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleRemoveExistingImage = () => {
    setExistingImage(null);
    setRemovedImage(true);
  };

  return (
    <Spin spinning={loading}>
      <Form name="basic" layout="vertical" onFinish={onFinish} form={form}>
        <Form.Item
          label="Başlık"
          name="title"
          rules={[
            {
              required: true,
              message: "Lütfen başlık girin!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Alt Başlık"
          name="subtitle"
          rules={[
            {
              required: true,
              message: "Lütfen alt başlık girin!"
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Yönlendirilecek Ürün"
          name="productId"
          rules={[
            {
              required: true,
              message: "Lütfen bir ürün seçin!"
            },
          ]}
        >
          <Select>
            {products.map((product) => (
              <Option key={product._id} value={product._id}>
                {product.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Mevcut Resim">
          {existingImage && (
            <div className="existing-image-item">
              <img src={`${apiUrl}/${existingImage}`} alt="existing" className="existing-image" />
              <Button onClick={handleRemoveExistingImage}>Sil</Button>
            </div>
          )}
        </Form.Item>
        <Form.Item
          label="Yeni Resim Yükle"
          name="upload"
        >
          <Upload
            fileList={fileList}
            onChange={handleUploadChange}
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

export default UpdateSliderPage;
