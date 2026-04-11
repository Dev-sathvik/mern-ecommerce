import React, { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { apiRequest } from "../services/apiClient";

export const Profile = () => {
  const { user, token } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiRequest(`/profile`, { token });
        setProfileData(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <div className="user-info">
        <p>
          <strong>Name:</strong> {user?.name}
        </p>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <p>
          <strong>ID:</strong> {user?.id}
        </p>
      </div>
      {profileData && <pre>{JSON.stringify(profileData, null, 2)}</pre>}
    </div>
  );
};
