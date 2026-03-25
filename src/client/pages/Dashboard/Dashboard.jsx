import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../api/userApi";

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getCurrentUser();
        setData(result);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          console.error(error);
          alert("Server error");
        }
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div>
      <h1>Dashboard</h1>

      {data && (
        <>
          <p>ID: {data.user.id}</p>
          <p>Phone: {data.user.phone}</p>
          <p>Full Name: {data.user.full_name}</p>
          <p>Email: {data.user.email}</p>
          <p>Permanent Address: {data.user.permanent_address}</p>
          <p>Current Address: {data.user.current_address}</p>
          <p>DOB: {data.user.dob}</p>
          <p>Gender: {data.user.gender}</p>
          <p>Created At: {data.user.created_at}</p>
          <p>Updated At: {data.user.updated_at}</p>
        </>
      )}
    </div>
  );
};

export default Dashboard;