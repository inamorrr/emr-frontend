import { useEffect, useRef } from 'react';

/**
 * Pindahkan fokus ke judul halaman (h1) saat halaman dibuka.
 * Pembaca layar mengumumkan halaman baru; pengguna keyboard mulai dari atas konten.
 */
export function usePageFocus() {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return ref;
}
