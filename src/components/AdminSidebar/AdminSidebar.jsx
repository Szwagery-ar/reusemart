'use client';

import { usePathname } from 'next/navigation';
import LogoutButton from '../LogoutButton/LogoutButton';
import {
    LayoutDashboard, Package, Gift, LogOut, ContactRound,
    ShoppingBag, HeartHandshake, HandCoins, Banknote,
    Truck, FolderPlus, FileChartColumnIncreasing,
    UserRound, Handshake, Ribbon
} from 'lucide-react';

import './AdminSidebar.css';

const menuByRole = {
    SUPERUSER: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Barang', path: '/admin/barang', icon: Package },
        { name: 'Merchandise', path: '/admin/merchandise', icon: Gift },
        { name: 'Klaim Merchandise', path: '/admin/klaim-merch', icon: HandCoins },
        { name: 'Data Pegawai', path: '/admin/pegawai', icon: ContactRound },
        { name: 'Data Pembeli', path: '/admin/pembeli', icon: UserRound },
        { name: 'Data Penitip', path: '/admin/penitip', icon: Handshake },
        { name: 'Data Organisasi', path: '/admin/organisasi', icon: Ribbon },
        { name: 'Request Donasi', path: '/admin/reqdonasi', icon: ShoppingBag },
        { name: 'Donasi', path: '/admin/donasi', icon: HeartHandshake },
    ],
    OWNER: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Laporan', path: '/admin/laporan', icon: FileChartColumnIncreasing },
        { name: 'Request Donasi', path: '/admin/reqdonasi', icon: ShoppingBag },
        { name: 'Donasi', path: '/admin/donasi', icon: HeartHandshake },
        { name: 'Penilaian 3', path: '/admin/penilaian3', icon: HeartHandshake },
    ],
    ADMIN: [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Merchandise', path: '/admin/merchandise', icon: Gift },
        { name: 'Data Pegawai', path: '/admin/pegawai', icon: ContactRound },
        { name: 'Data Pembeli', path: '/admin/pembeli', icon: UserRound },
        { name: 'Data Organisasi', path: '/admin/organisasi', icon: Ribbon },
    ],
    GUDANG: [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Barang', path: '/admin/barang', icon: Package },
        { name: 'Transaksi Penitipan', path: '/admin/transaksi-penitipan', icon: FolderPlus },
        { name: 'Data Transaksi', path: '/admin/transaksi', icon: Handshake },
        { name: 'Data Pengiriman', path: '/admin/pengiriman', icon: Truck },
    ],
    CS: [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Data Penitip', path: '/admin/penitip', icon: Handshake },
        { name: 'Merchandise', path: '/admin/merchandise', icon: Gift },
        { name: 'Klaim Merchandise', path: '/admin/klaim-merch', icon: HandCoins },
        { name: 'Data Pembayaran', path: '/admin/konfirmasi-pembayaran', icon: Banknote },
        { name: 'Diskusi', path: '/admin/diskusi', icon: Handshake },
    ],
    QC: [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Barang', path: '/admin/barang', icon: Package },
    ]
};

export default function AdminSidebar({ user }) {
    const pathname = usePathname();
    const jabatan = user?.jabatan?.toUpperCase();
    const menuItems = menuByRole[jabatan] || [];

    return (
        <aside className="sidebar flex-row fixed w-64 h-screen z-50">
            <h2 className="text-center text-xl font-bold text-white m-6 my-[50px]">Ceritanya Logo</h2>
            <nav className="flex flex-col space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <a key={item.name} href={item.path} className='flex justify-end'>
                            <div
                                className={`flex items-center gap-2 px-4 py-3 w-100 ml-6 text-sm ${pathname === item.path
                                    ? 'sidebar-highlight font-semibold bg-white text-indigo-800'
                                    : 'text-white hover:font-semibold hover:border-b-2 hover:border-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <h1 className='z-10'>{item.name}</h1>
                            </div>
                        </a>
                    );
                })}
            </nav>
            <LogoutButton
                icon={LogOut}
                className="flex items-center mt-2 gap-2 px-4 py-3 w-58 ml-6 text-sm text-white cursor-pointer hover:font-semibold hover:border-b-2 hover:border-white"
            />
        </aside>
    );
}
