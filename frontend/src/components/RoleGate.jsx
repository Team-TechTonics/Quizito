// src/components/RoleGate.jsx
import { useAuth } from '../context/AuthContext';

/**
 * RoleGate - Conditional rendering based on user role
 * @param {string[]} allowedRoles - Array of roles that can see the content
 * @param {React.ReactNode} children - Content to show if authorized
 * @param {React.ReactNode} fallback - Content to show if not authorized
 */
const RoleGate = ({ allowedRoles, children, fallback = null }) => {
    const { user } = useAuth();

    // If no user or user role not in allowed roles, show fallback
    if (!user || !allowedRoles.includes(user.role)) {
        return fallback;
    }

    return children;
};

export default RoleGate;
