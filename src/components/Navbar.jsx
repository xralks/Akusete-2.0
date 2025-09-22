import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [userType, setUserType] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const { user } = useAuth();
  const userMenuRef = useRef(null);
  const dropdownRef = useRef(null);

  const toggleMenu = () => setIsOpen((v) => !v);
  const toggleUserMenu = () => setIsUserMenuOpen((v) => !v);
  const closeAllMenus = () => {
    setIsOpen(false);
    setIsUserMenuOpen(false);
  };

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768; 
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (dropdownRef.current) {
      if (isMobile) {
        dropdownRef.current.setAttribute('hidden', '');
      } else {
        dropdownRef.current.removeAttribute('hidden');
      }
    }
  }, [isMobile]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setProfile(null);
        setUserType(null);
        return;
      }
      try {
        setLoadingProfile(true);

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, username, avatar_url, id_tipo_usuario')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.warn('No se pudo obtener profile:', profileError.message);
          setProfile(null);
          setUserType(null);
        } else {
          setProfile(profileData);

          if (profileData.id_tipo_usuario) {
            const { data: tipoData, error: tipoError } = await supabase
              .from('tipo_usuario')
              .select('nombre_tipo_usuario')
              .eq('id', profileData.id_tipo_usuario)
              .single();
            
            if (tipoError) {
              console.warn('Error obteniendo tipo de usuario:', tipoError.message);
              setUserType(null);
            } else {
              setUserType(tipoData?.nombre_tipo_usuario || null);
            }
          } else {
            setUserType(null);
          }
        }
      } catch (err) {
        console.error('Error cargando profile:', err);
        setProfile(null);
        setUserType(null);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error al cerrar sesión:', error);
    closeAllMenus();
  };

  const getUserDisplayName = () => {
    if (!user) return 'Usuario';
    if (profile?.username?.trim()) return profile.username;
    if (profile?.full_name?.trim()) return profile.full_name;
    if (user.user_metadata?.full_name?.trim()) return user.user_metadata.full_name;
    if (user.user_metadata?.username?.trim()) return user.user_metadata.username;
    if (user.email) return user.email.split('@')[0];
    return 'Usuario';
  };

  const getUserAvatar = () => {
    if (profile?.avatar_url) return { type: 'image', src: profile.avatar_url };
    if (user?.user_metadata?.avatar_url)
      return { type: 'image', src: user.user_metadata.avatar_url };

    const name = getUserDisplayName();
    const initials = name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
    const colorIndex = (name?.length || 0) % colors.length;
    return { type: 'initials', initials, backgroundColor: colors[colorIndex] };
  };

  const isAdmin = () => {
    return userType?.toLowerCase().trim() === 'administrador';
  };

  const avatar = getUserAvatar();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">AKUsete</Link>
        <button
          className={`hamburger ${isOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Menu"
        >
          <span></span><span></span><span></span>
        </button>
      </div>

      <ul className={`navbar-menu ${isOpen ? 'active' : ''}`}>
        <li><Link to="/que-es-akusete" onClick={closeAllMenus}>Qué es akusete</Link></li>
        <li className="dropdown" ref={dropdownRef}>
          <span className="dropdown-trigger">Tickets</span>
          <ul className="dropdown-menu submenu">
            <li><Link to="/crear-ticket" onClick={closeAllMenus}>Crear Tickets</Link></li>
            <li><Link to="/tickets" onClick={closeAllMenus}>Ver Tickets</Link></li>
          </ul>
        </li>
        <li className="mobile-only"><Link to="/crear-ticket" onClick={closeAllMenus}>Crear Tickets</Link></li>
        <li className="mobile-only"><Link to="/tickets" onClick={closeAllMenus}>Ver Tickets</Link></li>

        {!user && (
          <li><Link to="/login" onClick={closeAllMenus}>Iniciar Sesión</Link></li>
        )}

        {user && (
          <>
            <li className="user-profile desktop-only" ref={userMenuRef}>
              <div className="user-info" onClick={toggleUserMenu}>
                <div className="user-avatar">
                  {avatar.type === 'image' ? (
                    <img src={avatar.src} alt="Avatar" />
                  ) : (
                    <div className="avatar-initials" style={{ backgroundColor: avatar.backgroundColor }}>
                      {avatar.initials}
                    </div>
                  )}
                </div>
                <span className="user-name">
                  {loadingProfile ? 'Cargando…' : getUserDisplayName()}
                </span>
                <svg
                  className={`dropdown-arrow ${isUserMenuOpen ? 'open' : ''}`}
                  width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
                >
                  <path d="M6 8L2 4h8l-4 4z" />
                </svg>
              </div>

              {isUserMenuOpen && (
                <div className="user-dropdown">
                  <Link to="/usuario" onClick={closeAllMenus} className="user-dropdown-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    Ver Datos
                  </Link>
                  {isAdmin() && (
                    <Link to="/resolver-problemas" onClick={closeAllMenus} className="user-dropdown-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.5 1L5.5 7.5L11.5 14L13 12.5L8.5 8H22V6H8.5L13 1.5L11.5 1ZM2 4V18H4V6H16V4H2Z"/>
                      </svg>
                      Resolver Problemas
                    </Link>
                  )}
                  <button onClick={handleLogout} className="user-dropdown-item logout-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                    </svg>
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </li>
            <li className="mobile-only"><Link to="/usuario" onClick={closeAllMenus}>Ver Datos</Link></li>
            {isAdmin() && (
              <li className="mobile-only"><Link to="/resolver-problemas" onClick={closeAllMenus}>Problemas</Link></li>
            )}
            <li className="mobile-only">
              <button onClick={handleLogout} className="logout-button mobile-logout">Cerrar Sesión</button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;