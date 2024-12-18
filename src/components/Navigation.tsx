'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <div className="btm-nav">
      <Link 
        href="/btc" 
        className={pathname === '/btc' ? 'active' : ''}
      >
        <span className="btm-nav-label">BTC</span>
      </Link>
      <Link 
        href="/eth" 
        className={pathname === '/eth' ? 'active' : ''}
      >
        <span className="btm-nav-label">ETH</span>
      </Link>
      <Link 
        href="/olp" 
        className={pathname === '/olp' ? 'active' : ''}
      >
        <span className="btm-nav-label">OLP</span>
      </Link>
    </div>
  );
}