'use client';

import { useEffect, useState } from 'react';
import { Star, Plus, X, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'Makanan' | 'Minuman';
  image?: string;
  available: boolean;
  isBestSeller: boolean;
}

export default function AdminBestSeller() {
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [bestSellerItems, setBestSellerItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu');
      const data = await response.json();
      const menuItems = data.menuItems || [];
      
      setAllMenuItems(menuItems);
      setBestSellerItems(menuItems.filter((item: MenuItem) => item.isBestSeller));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setError('Gagal memuat data menu');
      setLoading(false);
    }
  };

  const handleToggleBestSeller = async (itemId: string, isBestSeller: boolean) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/menu/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isBestSeller }),
      });

      if (!response.ok) {
        throw new Error('Gagal memperbarui menu');
      }

      setSuccess(isBestSeller ? 'Menu berhasil ditambahkan ke Best Seller' : 'Menu berhasil dihapus dari Best Seller');
      fetchMenuItems();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkAddBestSeller = async () => {
    if (selectedItems.length === 0) {
      setError('Pilih minimal satu menu');
      return;
    }

    try {
      setUpdating(true);
      
      // Update selected items to be best sellers
      const updatePromises = selectedItems.map(itemId =>
        fetch(`/api/menu/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isBestSeller: true }),
        })
      );

      await Promise.all(updatePromises);
      
      setSuccess(`${selectedItems.length} menu berhasil ditambahkan ke Best Seller`);
      setSelectedItems([]);
      setShowModal(false);
      fetchMenuItems();
    } catch (error) {
      setError('Gagal memperbarui menu');
    } finally {
      setUpdating(false);
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const availableMenuItems = allMenuItems.filter(item => !item.isBestSeller && item.available);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data menu best seller...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/menu"
            className="flex items-center text-gray-600 hover:text-orange-500 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Kembali ke Menu
          </Link>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-orange-600 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Best Seller</span>
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kelola Menu Best Seller</h1>
        <p className="text-gray-600 mt-2">Kelola menu yang ditampilkan sebagai best seller di halaman utama</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Best Seller</p>
              <p className="text-3xl font-bold text-gray-900">{bestSellerItems.length}</p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <Star className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Menu Tersedia</p>
              <p className="text-3xl font-bold text-gray-900">{availableMenuItems.length}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Batas Halaman Utama</p>
              <p className="text-3xl font-bold text-gray-900">6</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Menu Best Seller Saat Ini */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Menu Best Seller Saat Ini</h2>
        
        {bestSellerItems.length === 0 ? (
          <div className="text-center py-12">
            <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum ada menu best seller</h3>
            <p className="text-gray-600 mb-4">Tambahkan menu untuk ditampilkan di halaman utama</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors duration-200"
            >
              Tambah Menu Best Seller
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bestSellerItems.map((item) => (
              <div key={item._id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center relative">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Star className="h-8 w-8 text-white" />
                  )}
                  <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                    BEST SELLER
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-orange-500">
                      Rp {item.price.toLocaleString('id-ID')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.category === 'Makanan' 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.category}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleBestSeller(item._id, false)}
                    disabled={updating}
                    className="w-full bg-red-500 text-white py-2 px-3 rounded-md hover:bg-red-600 disabled:opacity-50 transition-colors duration-200 text-sm"
                  >
                    Hapus dari Best Seller
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal untuk menambah best seller */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Tambah Menu Best Seller</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedItems([]);
                  setError('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600">
                Pilih menu yang ingin ditambahkan sebagai best seller. Menu yang dipilih akan tampil di halaman utama.
              </p>
              {selectedItems.length > 0 && (
                <p className="text-sm text-orange-600 mt-2">
                  {selectedItems.length} menu dipilih
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto mb-4">
              {availableMenuItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Tidak ada menu yang tersedia untuk dijadikan best seller</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableMenuItems.map((item) => (
                    <div
                      key={item._id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        selectedItems.includes(item._id)
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                      onClick={() => handleSelectItem(item._id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedItems.includes(item._id)
                              ? 'border-orange-500 bg-orange-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedItems.includes(item._id) && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-orange-500 font-bold">
                              Rp {item.price.toLocaleString('id-ID')}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              item.category === 'Makanan' 
                                ? 'bg-orange-100 text-orange-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {item.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleBulkAddBestSeller}
                disabled={selectedItems.length === 0 || updating}
                className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {updating ? 'Menyimpan...' : `Tambah ${selectedItems.length} Menu`}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedItems([]);
                  setError('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors duration-200"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}