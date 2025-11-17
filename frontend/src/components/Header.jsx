import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const Header = () => {
  const { isAuthenticated, handleLogout, userRole } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-warning text-dark py-3 mb-4 shadow">
      <div className="container d-flex justify-content-between align-items-center">
        {/* Logo / Título */}
        <Link to="/" className="text-dark text-decoration-none h4 mb-0 fw-bold">
          Games World
        </Link>

        <nav>
          <Link to="/consolas" className="text-dark mx-2 text-decoration-none fw-semibold">
            Consolas
          </Link>

          {/* Botón visible solo para administradores */}
          {isAuthenticated && String(userRole || "").toUpperCase() === "ADMIN" && (
            <button
              className="btn btn-outline-dark btn-sm ms-2"
              onClick={() => navigate("/user", { replace: true })}
            >
              Usuarios
            </button>
          )}

          {isAuthenticated ? (
            <button
              className="btn btn-outline-dark btn-sm ms-2"
              onClick={() => {
                handleLogout();
                navigate("/login", { replace: true });
              }}
            >
              Cerrar sesión
            </button>
          ) : (
            <Link to="/login" className="text-dark mx-2 text-decoration-none fw-semibold">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
