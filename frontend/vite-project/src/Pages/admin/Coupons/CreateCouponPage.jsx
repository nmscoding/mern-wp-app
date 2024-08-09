import { Button, Form, Input, InputNumber, DatePicker, Spin, message, Select } from "antd";
import { useEffect, useState } from "react";

const CreateCouponPage = () => {
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [form] = Form.useForm();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

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

  const onFinish = async (values) => {
    setLoading(true);
    const token = localStorage.getItem('token'); // Get JWT token from localStorage

    try {
      const response = await fetch(`${apiUrl}/api/coupons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken,
          "Authorization": `Bearer ${token}` // Include JWT token in headers
        },
        body: JSON.stringify(values),
        credentials: "include",
      });

      if (response.ok) {
        message.success("Kupon başarıyla oluşturuldu.");
        form.resetFields();
      } else {
        const errorData = await response.json();
        message.error(`Kupon oluşturulurken bir hata oluştu: ${errorData.error}`);
      }
    } catch (error) {
      console.log("Kupon oluşturma hatası:", error);
      message.error("Kupon oluşturulurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Form name="basic" layout="vertical" onFinish={onFinish} form={form}>
        <Form.Item
          label="Kupon İsmi"
          name="code"
          rules={[
            {
              required: true,
              message: "Kupon kodu girin!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Kupon İndirim Değeri"
          name="discountValue"
          rules={[
            {
              required: true,
              message: "Kupon indirim değeri girin!",
            },
          ]}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          label="İndirim Türü"
          name="discountType"
          rules={[
            {
              required: true,
              message: "İndirim türü seçin!",
            },
          ]}
        >
          <Select>
            <Select.Option value="percent">Yüzde</Select.Option>
            <Select.Option value="amount">Birim</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Minimum Harcama Tutarı"
          name="minimumSpend"
          rules={[
            {
              required: true,
              message: "Minimum harcama tutarı girin!",
            },
          ]}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          label="Geçerlilik Tarihi"
          name="expiryDate"
          rules={[
            {
              required: true,
              message: "Geçerlilik tarihi seçin!",
            },
          ]}
        >
          <DatePicker showTime />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Oluştur
        </Button>
      </Form>
    </Spin>
  );
};

export default CreateCouponPage;
