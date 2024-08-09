import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList
} from 'recharts';
import TotalProductsSoldCard from './DataPage/TotalProductsSoldCard';
import TotalWagesEarned from './DataPage/TotalWagesEarnedCard';
import TotalSiteVisitsCard from './DataPage/TotalSiteVisitsCard';
import './DataPage/DataPage.css';

const CustomXAxis = (props) => {
  const { dataKey = 'date', ...rest } = props;
  const formatDate = (tickItem) => {
    const date = new Date(tickItem + 'T00:00:00'); // Türkiye saat diliminde tarihi alıyoruz
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return <XAxis dataKey={dataKey} tickFormatter={formatDate} {...rest} />;
};

CustomXAxis.propTypes = {
  dataKey: PropTypes.string,
};

const CustomYAxis = (props) => {
  const { dataKey = 'sales', ...rest } = props;
  return <YAxis dataKey={dataKey} {...rest} />;
};

CustomYAxis.propTypes = {
  dataKey: PropTypes.string,
};

const fillMissingDates = (data, startDate, endDate) => {
  const dateMap = new Map(data.map(item => [new Date(item.date).toISOString().split('T')[0], item]));
  const filledData = [];
  let currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (dateMap.has(dateStr)) {
      filledData.push(dateMap.get(dateStr));
    } else {
      filledData.push({ date: dateStr, sales: 0 });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return filledData; // Verileri tersine çevirmiyoruz
};

const DashboardPage = () => {
  const [salesData, setSalesData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/orders/sales-data`);
        const responseData = response.data.map(item => ({
          ...item,
          date: new Date(item.date).toISOString().split('T')[0], // Tarihi ISO formatına çeviriyoruz
        }));
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 29);
        const startDateStr = startDate.toISOString().split('T')[0];
        
        const filledData = fillMissingDates(responseData, startDateStr, endDate);
        setSalesData(filledData);

        const total = filledData.reduce((acc, item) => acc + item.sales, 0);
        setTotalSales(total);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      }
    };

    fetchSalesData();
  }, [apiUrl]);

  const tooltipFormatter = (value, name, { payload }) => {
    const date = new Date(payload.date + 'T00:00:00'); 
    const formattedDate = date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return [`₺${value}`, `${formattedDate}`];
  };

  return (
    <div>
      <h3>30 Günlük Günlük Satış Verileri</h3>
      <div className="scorecards">
        <TotalWagesEarned totalSales={totalSales} />
        <TotalProductsSoldCard />
        <TotalSiteVisitsCard />
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={salesData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <CustomXAxis />
          <CustomYAxis />
          <Tooltip formatter={tooltipFormatter} />
          <Legend />
          <Bar dataKey="sales" fill="#13c6fb">
            <LabelList dataKey="sales" position="top" formatter={(value) => `₺${value}`} />
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DashboardPage;
