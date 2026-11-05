import { useEffect, useRef } from 'react';

/**
 * Faz o gesto de "Voltar" do Android fechar a gaveta/modal em vez de sair da ficha.
 */
export function useBackToClose(isOpen: boolean, onClose: () => void): void {
  const pushedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) {
      if (pushedRef.current) {
        pushedRef.current = false;
      }
      return;
    }

    window.history.pushState({ codexDrawer: true }, '');
    pushedRef.current = true;

    const handlePopState = () => {
      if (!pushedRef.current) return;
      pushedRef.current = false;
      onCloseRef.current();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (pushedRef.current && window.history.state?.codexDrawer) {
        pushedRef.current = false;
        window.history.back();
      }
    };
  }, [isOpen]);
}
