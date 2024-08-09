import { useState, useEffect } from "react";
import { Button, Form, Input, Spin, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const CreateCampaignPage = () => {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [csrfToken, setCsrfToken] = useState("");
  const [form] = Form.useForm();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

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

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${apiUrl}/api/campaigns/upload`, {
        method: 'POST',
        headers: {
          "CSRF-Token": csrfToken,
        },
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Uploaded image URL:", data.url); // Debug: Log the uploaded image URL
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

    if (fileList.length === 0) {
      message.error("Lütfen bir kampanya görseli yükleyin.");
      setLoading(false);
      return;
    }

    const imgLink = await uploadImage(fileList[0].originFileObj);

    if (!imgLink) {
      message.error("Resim yüklenemedi.");
      setLoading(false);
      return;
    }

    const payload = {
      ...values,
      img: imgLink,
    };

    console.log("Payload:", payload); // Debug: Log the payload

    try {
      const response = await fetch(`${apiUrl}/api/campaigns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken,
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (response.ok) {
        message.success("Kampanya başarıyla oluşturuldu.");
        form.resetFields();
        setFileList([]);
        navigate("/admin/campaigns");
      } else {
        const errorData = await response.json();
        message.error(`Kampanya oluşturulurken bir hata oluştu: ${errorData.message}`);
      }
    } catch (error) {
      console.log("Kampanya oluşturma hatası:", error);
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
          label="Kampanya Başlığı"
          name="title"
          rules={[
            {
              required: true,
              message: "Lütfen kampanya başlığını girin!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Kampanya Açıklaması"
          name="desc"
          rules={[
            {
              required: true,
              message: "Lütfen kampanya açıklamasını girin!",
            },
          ]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          label="Kampanya Görseli Yükle"
          name="upload"
          rules={[
            {
              required: true,
              message: "Lütfen bir kampanya görseli yükleyin."
            },
          ]}
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
          Oluştur
        </Button>
      </Form>
    </Spin>
  );
};

export default CreateCampaignPage;
