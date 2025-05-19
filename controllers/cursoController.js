const pool = require('../config/db');

const getCursosByCentro = async (req, res) => {
  const idcentro = req.params.id;
  const idUsuario = req.user?.idUsuario; // 👈 Recuperado desde `ProtectedRoute`
  const nivelUsuario = req.user?.nivelUsuario; // 👈 Recuperado desde `ProtectedRoute`

  if (!idcentro) {
    return res.status(400).json({
      success: false,
      message: 'Falta el ID del centro'
    });
  }

  try {
    // 1. Verificar que el centro exista
    const [centroRows] = await pool.query(
      'SELECT * FROM centro WHERE idcentro = ?', 
      [idcentro]
    );

    if (centroRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Centro no encontrado'
      });
    }

    // 2. Validar acceso según rol
    const [userRows] = await pool.query(
      'SELECT * FROM usuario WHERE idusr = ?', 
      [idUsuario]
    );

    const user = userRows[0];

    // ✅ Nivel 4 (AdminSupremo) → acceso total
    if (nivelUsuario == 4) {
      const [cursos] = await pool.query(
        'SELECT * FROM curso WHERE idcentro = ?', 
        [idcentro]
      );
      return res.json({ success: true, data: cursos });
    }

    // ✅ Nivel 3 (AdminCentro) → solo si es admin de este centro
    if (nivelUsuario == 3 && user.idcentro != idcentro) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este centro'
      });
    }

    // ✅ Nivel 2 (Profesor) → debe estar asociado al centro
    if (nivelUsuario == 2) {
      const [profesorRows] = await pool.query(
        'SELECT idcentro FROM usuario WHERE idusr = ?', 
        [idUsuario]
      );
      if (profesorRows[0]?.idcentro != idcentro) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este centro'
        });
      }
    }

    // ✅ Nivel 0 (Alumno) → debe estar inscrito en el centro
    if (nivelUsuario == 0) {
      const [enrollment] = await pool.query(
        'SELECT idcentro FROM matricula WHERE idusr = ? AND idcentro = ?', 
        [idUsuario, idcentro]
      );
      if (enrollment.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No estás inscrito en este centro'
        });
      }
    }

    // ✅ Nivel 1 (Empresa) → debe estar asociada al centro
    if (nivelUsuario == 1) {
      const [empresaRows] = await pool.query(
        'SELECT idcentro FROM usuario WHERE idusr = ?', 
        [idUsuario]
      );
      if (empresaRows[0]?.idcentro != idcentro) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este centro'
        });
      }
    }

    // 3. Si todo ok → devolver cursos
    const [cursos] = await pool.query(
      'SELECT * FROM curso WHERE idcentro = ?', 
      [idcentro]
    );

    return res.json({ success: true, data: cursos });

  } catch (error) {
    console.error('Error al obtener cursos:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

module.exports = { getCursosByCentro };import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
  const location = useLocation();
  const idUsuario = localStorage.getItem("idUsuario");
  const nivelUsuario = localStorage.getItem("nivelUsuario");

  // Si no está logueado → redirige al login
  if (!idUsuario) return <Navigate to="/login" replace />;

  // Si requiere rol y no coincide → redirige a /unauthorized
  if (requiredRole && !String(requiredRole).includes(nivelUsuario)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Para rutas dinámicas con /centro/:id/curso
  const pathSegments = location.pathname.split("/");
  const idCentroURL = pathSegments[2]; // Ej: /centro/123/curso → idCentro = 123

  // Opcional: Validar que el usuario tiene acceso al centro (ej: alumno, empresa, profesor)
  if (idCentroURL && nivelUsuario != 4) {
    const idCentroUsuario = localStorage.getItem("idCentro");
    if (idCentroUsuario != idCentroURL) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Si todo bien → muestra el contenido
  return children;
}