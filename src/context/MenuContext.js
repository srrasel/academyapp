import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import SideMenu from '../components/SideMenu/SideMenu';

const MenuContext = createContext(null);

export function MenuProvider({ children }) {
  const [visible, setVisible] = useState(false);

  const openMenu = useCallback(() => setVisible(true), []);
  const closeMenu = useCallback(() => setVisible(false), []);

  const value = useMemo(
    () => ({ visible, openMenu, closeMenu }),
    [visible, openMenu, closeMenu]
  );

  return (
    <MenuContext.Provider value={value}>
      {children}
      <SideMenu visible={visible} onClose={closeMenu} />
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu must be used within MenuProvider');
  return ctx;
}
