import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("pos_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("pos_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((res) => {
        setUser(res.data.data);
        localStorage.setItem("pos_user", JSON.stringify(res.data.data));
      })
      .catch(() => {
        localStorage.removeItem("pos_token");
        localStorage.removeItem("pos_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      const data = res.data.data;
      localStorage.setItem("pos_token", data.token);
      const userInfo = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      };
      localStorage.setItem("pos_user", JSON.stringify(userInfo));
      setUser(userInfo);
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  };

  const logout = () => {
    localStorage.removeItem("pos_token");
    localStorage.removeItem("pos_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
