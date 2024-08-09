import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Modal, message } from 'antd';
import MyAddress from './Myaddress'; 
import './Myaccount.css'
import './SavedAddress.css';

const SavedAddress = () => {
  const [userData, setUserData] = useState(null);
  const [csrfToken, setCsrfToken] = useState("");  
  const [isModalVisible, setIsModalVisible] = useState(false);  

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const fetchCsrfToken = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/csrf-token`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setCsrfToken(data.csrfToken);
      axios.defaults.headers.common['CSRF-Token'] = data.csrfToken; 
    } catch (error) {
      console.error("Error fetching CSRF token:", error);
    }
  }, [apiUrl]);

  const fetchAddress = useCallback(async () => {
    try {
      await fetchCsrfToken(); 

      const token = localStorage.getItem('token'); 
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get(`${apiUrl}/api/hesap/address`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      console.log('Fetched address:', response.data);
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching address:', error.response ? error.response.data : error.message);
      if (error.response && error.response.status === 401) {
        message.error('Oturumunuz sonlanmıştır, lütfen tekrar giriş yapın.');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login'; 
      }
    }
  }, [apiUrl, fetchCsrfToken]);

  useEffect(() => {
    const interval = setInterval(fetchCsrfToken, 55 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchCsrfToken]);

  useEffect(() => {
    fetchAddress();
  }, [fetchAddress]);

  useEffect(() => {
    const handleStorageChange = () => {
      fetchAddress();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchAddress]);

  const handleDelete = async (addressId) => {
    try {
      const token = localStorage.getItem('token'); 
      if (!token) {
        throw new Error('No token found');
      }

      await axios.delete(`${apiUrl}/api/hesap/address/${addressId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "CSRF-Token": csrfToken,  
        },
        withCredentials: true,
      });
      setUserData((prevData) => ({
        ...prevData,
        address: prevData.address.filter((addr) => addr._id !== addressId)
      }));
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleAddressSaved = () => {
    setIsModalVisible(false);
    fetchAddress();
  };

  if (!userData) {
    return <div>Yükleniyor</div>;
  }

  const { name, phone, address, surname } = userData;

  return (
    <div className="wp-display-flex address-page-content">
      {address && address.length > 0 ? (
        address.map((addr) => (
          <div key={addr._id} className="wp-display-flex wp-bg-white wp-flex-column addresses-page-content-box">
              <div className="wp-display-flex addresses-page-content-box-header">
                <span className="wp-text wp-color-black wp-font-md wp-font-w-bold">{addr.addressname || 'Kayıtlı Adres Yok'}</span>
                <span className="wp-number wp-color-black wp-font-sm">{phone || ''}</span>
              </div>
              <div className="wp-display-flex wp-flex-column address-page-content-box-body">
                <span className="wp-text wp-color-black wp-font-sm wp-font-w-bold">{`${name} ${surname}` || ''}</span>
                <span className="wp-text wp-color-black wp-font-sm">{addr.neighbourhood || ''}</span>
                <span className="wp-text wp-color-black wp-font-sm">{addr.addressdesc || ''}</span>
                <span className="wp-text wp-color-black wp-font-sm">{addr.town || ''}</span>
                <span className="wp-text wp-color-black wp-font-sm">{addr ? `${addr.province}/${addr.town}` : ''}</span>
              </div>
              <div className="wp-display-flex wp-flex-row address-page-content-box-actions">
                <button onClick={() => handleDelete(addr._id)} className="wp-font-sm wp-font-w-semi-bold wp-link-button wp-transition wp-notr wp-input-small">
                  <div className="wp-display-flex address-page-content-box-actions-delete">
                    <i className="bi bi-trash"></i>
                    <span className="wp-text wp-color-black wp-font-md wp-font-w-normal">Sil</span>
                  </div>
                </button>
              </div>
          </div>
        ))
      ) : null}
      <div className='add-address-content-box'>
        <button onClick={() => setIsModalVisible(true)}><i className='bi bi-plus'></i></button>
      </div>
      <Modal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <MyAddress onClose={handleAddressSaved} />
      </Modal>
    </div>
  );
};

export default SavedAddress;
