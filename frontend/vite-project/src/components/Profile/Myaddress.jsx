import { useState, useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';
import PropTypes from 'prop-types';
import "./Myaccount.css"
import "./SavedAddress.css"

const MyAddress = ({ onClose }) => {
  const [provinces, setProvinces] = useState([]);
  const [towns, setTowns] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [quarters, setQuarters] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedTown, setSelectedTown] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [addressDesc, setAddressDesc] = useState('');
  const [addressName, setAddressName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [csrfToken, setCsrfToken] = useState("");  

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/csrf-token`, {  
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken);

        const addressResponse = await fetch('/data.json');
        if (!addressResponse.ok) {
          throw new Error(`HTTP error! status: ${addressResponse.status}`);
        }
        const byData = await addressResponse.json();
        setProvinces(byData);
        setLoading(false);
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchCsrfToken();
  }, [API_BASE_URL]);

  useEffect(() => {
    if (selectedProvince) {
      const province = provinces.find(prov => prov.name === selectedProvince);
      setTowns(province ? province.counties : []);
      setDistricts([]);
      setQuarters([]);
      setSelectedTown('');
      setSelectedDistrict('');
      setSelectedQuarter('');
    }
  }, [selectedProvince, provinces]);

  useEffect(() => {
    if (selectedTown) {
      const town = towns.find(town => town.name === selectedTown);
      setDistricts(town ? town.districts : []);
      setQuarters([]);
      setSelectedDistrict('');
      setSelectedQuarter('');
    }
  }, [selectedTown, towns]);

  useEffect(() => {
    if (selectedDistrict) {
      const district = districts.find(dist => dist.name === selectedDistrict);
      setQuarters(district ? district.neighborhoods : []);
      setSelectedQuarter('');
    }
  }, [selectedDistrict, districts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newAddress = {
      addressname: addressName,
      province: selectedProvince,
      town: selectedTown,
      district: selectedDistrict,
      neighbourhood: selectedQuarter,
      addressdesc: addressDesc,
    };

    try {
      const token = localStorage.getItem('token'); 
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/hesap/address`,  
        { address: newAddress },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "CSRF-Token": csrfToken,  
          },
          withCredentials: true,
        }
      );
      message.success("Adres Kaydedildi!")
      console.log('Address added successfully:', response.data);

  
      setAddressName('');
      setSelectedProvince('');
      setSelectedTown('');
      setSelectedDistrict('');
      setSelectedQuarter('');
      setAddressDesc('');

      onClose(); 
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error('Unauthorized: Redirect to login or renew token');
        // Handle token renewal or redirect to login
      } else {
        console.error('Error adding address:', error.response ? error.response.data : error.message);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="profile-info">
      <h2>Adres Ekleme</h2>
      <div className="user-form">
        <div className="form-section">
          <h1>Adres Bilgileri</h1>
          <form onSubmit={handleSubmit}>
            <label>
              <span>Adres İsmi</span>
              <input
                type='text'
                value={addressName}
                onChange={(e) => setAddressName(e.target.value)}
                required
              />
            </label>
            <label>
              <span>İl</span>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
              >
                <option value="">İl Seçin</option>
                {provinces.map((province) => (
                  <option key={province.name} value={province.name}>
                    {province.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>İlçe</span>
              <select
                value={selectedTown}
                onChange={(e) => setSelectedTown(e.target.value)}
                disabled={!selectedProvince}
              >
                <option value="">İlçe Seçin</option>
                {towns.map((town) => (
                  <option key={town.name} value={town.name}>
                    {town.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Mahalle</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={!selectedTown}
              >
                <option value="">Mahalle Seçin</option>
                {districts.map((district) => (
                  <option key={district.name} value={district.name}>
                    {district.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Sokak</span>
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                disabled={!selectedDistrict}
              >
                <option value="">Sokak Seçin</option>
                {quarters.map((quarter) => (
                  <option key={quarter.name} value={quarter.name}>
                    {quarter.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Adres</span>
              <textarea
                id="comment-text"
                required
                value={addressDesc}
                onChange={(e) => setAddressDesc(e.target.value)}
              ></textarea>
            </label>
            <button type="submit" className="btn btn-primary acc-btn">
              Adresi Kaydet
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

MyAddress.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default MyAddress;
