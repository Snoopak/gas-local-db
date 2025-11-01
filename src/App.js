import React, { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, X, Save, Phone, Home, Gauge, Upload, Download, FileText, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';

// ==================== ALERT SYSTEM ====================
// Context для Alert System
const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

// Progress Toast Component
const ProgressToast = ({ type, message, duration, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600',
    info: 'bg-blue-600'
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`${colors[type]} text-white rounded-lg shadow-2xl overflow-hidden min-w-[320px] max-w-md transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icons[type]}
            <span className="font-medium">{message}</span>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 ml-2 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white"
            style={{
              animation: `progress-bar ${duration}ms linear`,
              width: '100%'
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes progress-bar {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Modal Component
const Modal = ({ type, title, message, onConfirm, onCancel, onClose }) => {
  const colors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
    confirm: 'text-gray-900'
  };

  const icons = {
    success: <CheckCircle className="w-12 h-12" />,
    error: <AlertCircle className="w-12 h-12" />,
    warning: <AlertTriangle className="w-12 h-12" />,
    info: <Info className="w-12 h-12" />,
    confirm: <AlertCircle className="w-12 h-12" />
  };

  const isConfirm = type === 'confirm';

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      style={{ animation: 'fade-in 0.3s ease-out' }}
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full" style={{ animation: 'scale-in 0.3s ease-out' }}>
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className={colors[type]}>{icons[type]}</div>
            <div className="flex-1">
              <h3 className={`text-xl font-bold ${colors[type]} mb-2`}>
                {title}
              </h3>
              <p className="text-gray-600">{message}</p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            {isConfirm ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Скасувати
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Видалити
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                OK
              </button>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

// Snackbar Component
const Snackbar = ({ message, actionText, onAction, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleAction = () => {
    if (onAction) onAction();
    handleClose();
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div
        className={`bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-4 min-w-[300px] max-w-md transform transition-all duration-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <span className="flex-1">{message}</span>
        {actionText && (
          <button
            onClick={handleAction}
            className="text-yellow-400 hover:text-yellow-300 font-semibold uppercase text-sm transition-colors"
          >
            {actionText}
          </button>
        )}
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Alert Provider Component
const AlertProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null);
  const [snackbar, setSnackbar] = useState(null);

  const showToast = useCallback((type, message, duration = 3000) => {
    const id = Date.now();
    const toast = { id, type, message, duration };
    setToasts(prev => [...prev, toast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const showModal = useCallback((type, title, message, onConfirm, onCancel) => {
    setModal({ type, title, message, onConfirm, onCancel });
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  const showSnackbar = useCallback((message, actionText, onAction) => {
    setSnackbar({ message, actionText, onAction });

    setTimeout(() => {
      setSnackbar(null);
    }, 4000);
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbar(null);
  }, []);

  const value = {
    showToast,
    showModal,
    closeModal,
    showSnackbar,
    closeSnackbar
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <ProgressToast
            key={toast.id}
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
          />
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <Modal
          type={modal.type}
          title={modal.title}
          message={modal.message}
          onConfirm={modal.onConfirm}
          onCancel={modal.onCancel}
          onClose={closeModal}
        />
      )}

      {/* Snackbar */}
      {snackbar && (
        <Snackbar
          message={snackbar.message}
          actionText={snackbar.actionText}
          onAction={snackbar.onAction}
          onClose={closeSnackbar}
        />
      )}
    </AlertContext.Provider>
  );
};
// ==================== END ALERT SYSTEM ====================


// IndexedDB ініціалізація
const DB_NAME = 'ClientsDB';
const DB_VERSION = 1;
const STORE_NAME = 'clients';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('fullName', 'fullName', { unique: false });
        store.createIndex('accountNumber', 'accountNumber', { unique: false });
        store.createIndex('settlement', 'settlement', { unique: false });
        store.createIndex('phone', 'phone', { unique: false });
        store.createIndex('meterNumber', 'meterNumber', { unique: false });
      }
    };
  });
};

// Функція для розбиття та форматування телефонів
const formatPhones = (phoneString) => {
  if (!phoneString) return null;
  
  // Розбиваємо по комі та прибираємо пробіли
  const phones = phoneString.split(',').map(p => p.trim()).filter(p => p);
  
  return phones.map((phone, index) => (
    <span key={index}>
      <a 
        href={`tel:${phone.replace(/[^\d+]/g, '')}`} 
        className="text-blue-600 hover:text-blue-800 hover:underline"
      >
        {phone}
      </a>
      {index < phones.length - 1 && ', '}
    </span>
  ));
};

const addClient = async (client) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(client);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const updateClient = async (client) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(client);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const deleteClient = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const getAllClients = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getClientsByPage = async (page, pageSize) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.openCursor();
    const results = [];
    let skipped = 0;
    let collected = 0;
    
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (skipped < page * pageSize) {
          skipped++;
          cursor.continue();
        } else if (collected < pageSize) {
          results.push(cursor.value);
          collected++;
          cursor.continue();
        } else {
          resolve(results);
        }
      } else {
        resolve(results);
      }
    };
    request.onerror = () => reject(request.error);
  });
};

const countClients = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const searchClients = async (searchTerm, settlements, streets, meterBrands, meterSizes, meterYears, meterGroups, filterDisconnected, filterDacha, filterAbsent) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.openCursor();
    const results = [];
    
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const client = cursor.value;
        const matchesSearch = !searchTerm || 
          client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.accountNumber.includes(searchTerm) ||
          client.phone.includes(searchTerm) ||
          client.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.meterNumber.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesSettlement = settlements.length === 0 || settlements.includes(client.settlement);
        
        const clientStreetName = [client.streetType, client.street].filter(s => s).join(' ');
        const matchesStreet = streets.length === 0 || streets.includes(clientStreetName);
        
        const matchesMeterBrand = meterBrands.length === 0 || meterBrands.includes(client.meterBrand);
        const matchesMeterSize = meterSizes.length === 0 || meterSizes.includes(client.meterSize);
        const matchesMeterYear = meterYears.length === 0 || meterYears.includes(client.meterYear);
        const matchesMeterGroup = meterGroups.length === 0 || meterGroups.includes(client.meterGroup);
        
        // ⭐ ФІЛЬТРИ СТАТУСІВ
        let matchesStatus = true;
        if (filterDisconnected || filterDacha || filterAbsent) {
          matchesStatus = 
            (filterDisconnected && client.gasDisconnected === 'Так') ||
            (filterDacha && client.dacha === true) ||
            (filterAbsent && client.temporaryAbsent === true);
        }
        
        if (matchesSearch && matchesSettlement && matchesStreet && 
            matchesMeterBrand && matchesMeterSize && matchesMeterYear && matchesMeterGroup && matchesStatus) {
          results.push(client);
        }
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    request.onerror = () => reject(request.error);
  });
};

// ⭐ НОВА ФУНКЦІЯ: Пошук з пагінацією для infinite scroll
const searchClientsPaginated = async (searchTerm, settlements, streets, meterBrands, meterSizes, meterYears, meterGroups, filterDisconnected, filterDacha, filterAbsent, page, pageSize) => {
  // Спочатку отримуємо ВСІ результати
  const allResults = await searchClients(searchTerm, settlements, streets, meterBrands, meterSizes, meterYears, meterGroups, filterDisconnected, filterDacha, filterAbsent);
  
  // Повертаємо тільки потрібну сторінку
  const start = page * pageSize;
  const end = start + pageSize;
  
  return {
    items: allResults.slice(start, end),
    total: allResults.length,
    hasMore: end < allResults.length
  };
};


function ClientDatabase() {
  // ⭐ Alert System
  const { showToast, showModal } = useAlert();
  
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSettlement, setSelectedSettlement] = useState([]);
  const [selectedStreet, setSelectedStreet] = useState([]);
  // ⭐ НОВІ ФІЛЬТРИ СТАТУСІВ
  const [filterDisconnected, setFilterDisconnected] = useState(false);
  const [filterDacha, setFilterDacha] = useState(false);
  const [filterAbsent, setFilterAbsent] = useState(false);
  // ⭐ Dropdown швидких дій
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [selectedMeterBrand, setSelectedMeterBrand] = useState([]);
  const [selectedMeterSize, setSelectedMeterSize] = useState([]);
  const [selectedMeterYear, setSelectedMeterYear] = useState([]);
  const [selectedMeterGroups, setSelectedMeterGroups] = useState([]);
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredTotalCount, setFilteredTotalCount] = useState(0); // ⭐ Для фільтрованих даних
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // ⭐ Для онбордингу
  const [importProgress, setImportProgress] = useState({ show: false, current: 0, total: 0, fileName: '' }); // ⭐ Для прогресу імпорту
  const [settlements, setSettlements] = useState(['Всі']);
  const [streets, setStreets] = useState(['Всі']);
  const [meterBrands, setMeterBrands] = useState(['Всі']);
  const [meterSizes, setMeterSizes] = useState(['Всі']);
  const [meterYears, setMeterYears] = useState(['Всі']);
  const [meterGroups, setMeterGroups] = useState([]);
  const pageSize = 50;
  
  // ⭐ INFINITE SCROLL: Додаткові state
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isFirstRender = useRef(true);
  const stateRestored = useRef(false);
  
  // ⭐ SessionStorage ключі для збереження стану
  const STORAGE_KEYS = {
    CLIENTS: 'clients_infinite_scroll',
    SCROLL_Y: 'clients_scroll_position',
    PAGE: 'clients_current_page',
    FILTERS: 'clients_filters',
    HAS_MORE: 'clients_has_more',
    FILTERED_TOTAL: 'clients_filtered_total' // ⭐ Загальна кількість відфільтрованих
  };
  
  // Додаємо ref для debounce таймера та debouncedSearchTerm
  const searchTimeoutRef = useRef(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // State для відкритих dropdown
  const [openDropdown, setOpenDropdown] = useState(null);
  
  // State для згортання фільтрів лічильників на мобільних
  const [showMeterFilters, setShowMeterFilters] = useState(false);
  
  // State для згортання фільтрів адреси на мобільних
  const [showAddressFilters, setShowAddressFilters] = useState(false);

  // useEffect для закриття модалки на ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        resetForm();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      // Блокуємо scroll body коли модалка відкрита
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const [formData, setFormData] = useState({
    fullName: '', settlement: '', streetType: '', street: '', building: '', buildingLetter: '',
    apartment: '', apartmentLetter: '', accountNumber: '', eic: '', phone: '',
    meterBrand: '', meterSize: '', meterNumber: '', meterYear: '', verificationDate: '',
    nextVerificationDate: '', installationDate: '', meterLocation: '', meterGroup: '', 
    meterSubtype: '', meterType: '', meterOwnership: '', serviceOrg: '', mvnssh: '', 
    rsp: '', seal: '', stickerSeal: '',
    boilerBrand: '', boilerPower: '', stoveType: '', stoveCount: '', columnType: '', columnCount: '',
    area: '', utilityType: '', utilityGroup: '', grs: '',
    gasDisconnected: '', disconnectMethod: '', disconnectSeal: '', disconnectDate: '',
    connectDate: '', dacha: false, temporaryAbsent: false
  });

  // useEffect для debounce пошуку
  useEffect(() => {
    // Очищуємо попередній таймер
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Встановлюємо новий таймер на 300мс
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    // Cleanup функція
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // ⭐ СТАРИЙ useEffect ВИДАЛЕНО - тепер є правильний нижче!

  useEffect(() => {
    // ⭐ Пропускаємо перший рендер (дані завантажуються в init useEffect)
    if (isFirstRender.current) {
      return;
    }
    
    // ⭐ Якщо тільки що відновили стан - пропускаємо один раз
    if (stateRestored.current) {
      stateRestored.current = false;
      return;
    }

    if (debouncedSearchTerm || selectedSettlement.length > 0 || selectedStreet.length > 0 || 
        selectedMeterBrand.length > 0 || selectedMeterSize.length > 0 || selectedMeterYear.length > 0 || selectedMeterGroups.length > 0 ||
        filterDisconnected || filterDacha || filterAbsent) {
      // ⭐ При фільтрації ТЕОЖ використовуємо infinite scroll!
      clearScrollState();
      setCurrentPage(0);
      setHasMore(true); // ⭐ Увімкнуто!
      performSearch();
    } else {
      // ⭐ Без фільтрів - скидаємо і завантажуємо заново
      clearScrollState();
      setCurrentPage(0);
      setHasMore(true);
      loadClients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, selectedSettlement, selectedStreet, selectedMeterBrand, selectedMeterSize, selectedMeterYear, selectedMeterGroups, filterDisconnected, filterDacha, filterAbsent]);

  // Динамічне оновлення фільтрів на основі вибраних значень
  useEffect(() => {
    const updateDynamicFilters = async () => {
      const allClients = await getAllClients();
      
      // Фільтруємо клієнтів ТІЛЬКИ по адресі (для оновлення списків лічильників)
      let filteredByAddress = allClients;
      
      if (selectedSettlement.length > 0) {
        filteredByAddress = filteredByAddress.filter(c => selectedSettlement.includes(c.settlement));
      }
      
      if (selectedStreet.length > 0) {
        filteredByAddress = filteredByAddress.filter(c => {
          const clientStreetName = [c.streetType, c.street].filter(s => s).join(' ');
          return selectedStreet.includes(clientStreetName);
        });
      }
      
      // Оновлюємо список вулиць (фільтрується по населеному пункту)
      if (selectedSettlement.length > 0) {
        const uniqueStreets = [...new Set(filteredByAddress.map(c => {
          const streetName = [c.streetType, c.street].filter(s => s).join(' ');
          return streetName;
        }).filter(s => s))].sort();
        setStreets(uniqueStreets);
      } else {
        await loadStreets();
      }
      
      // ⭐ КЛЮЧОВЕ ВИПРАВЛЕННЯ: Фільтри лічильників беруть дані по адресі,
      // але НЕ фільтруються між собою (не залежать від selectedMeterBrand, selectedMeterSize і т.д.)
      
      // Оновлюємо список марок лічильників (по адресі, але НЕ по іншим фільтрам лічильників)
      const uniqueBrands = [...new Set(filteredByAddress.map(c => c.meterBrand).filter(b => b))].sort();
      setMeterBrands(uniqueBrands);
      
      // Оновлюємо список типорозмірів (по адресі, але НЕ по іншим фільтрам лічильників)
      const uniqueSizes = [...new Set(filteredByAddress.map(c => c.meterSize).filter(s => s))].sort();
      setMeterSizes(uniqueSizes);
      
      // Оновлюємо список років (по адресі, але НЕ по іншим фільтрам лічильників)
      const uniqueYears = [...new Set(filteredByAddress.map(c => c.meterYear).filter(y => y))].sort((a, b) => b - a);
      setMeterYears(uniqueYears);
      
      // Оновлюємо список груп лічильників (по адресі, але НЕ по іншим фільтрам лічильників)
      const uniqueGroups = [...new Set(filteredByAddress.map(c => c.meterGroup).filter(g => g))].sort();
      setMeterGroups(uniqueGroups);
    };
    
    updateDynamicFilters();
  }, [selectedSettlement, selectedStreet]); // ⭐ ВАЖЛИВО: Тільки адреса, БЕЗ фільтрів лічильників!

  // ⭐ INFINITE SCROLL: Слухач скролу
  useEffect(() => {
    const handleScroll = () => {
      // ⭐ INFINITE SCROLL працює ЗАВЖДИ (і з фільтрами, і без!)
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Якщо до кінця залишилось менше 400px і є ще дані - завантажуємо
      if (scrollTop + windowHeight >= documentHeight - 400 && hasMore && !isLoadingMore) {
        setCurrentPage(prev => prev + 1);
      }

      // Зберігаємо позицію скролу (з debounce)
      clearTimeout(window.scrollSaveTimeout);
      window.scrollSaveTimeout = setTimeout(() => {
        saveScrollState();
      }, 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isLoadingMore]);

  // ⭐ INFINITE SCROLL: Завантаження при зміні currentPage
  useEffect(() => {
    if (currentPage > 0) {
      // Перевіряємо чи є фільтри
      const hasFilters = debouncedSearchTerm || selectedSettlement.length > 0 || selectedStreet.length > 0 || 
                        selectedMeterBrand.length > 0 || selectedMeterSize.length > 0 || 
                        selectedMeterYear.length > 0 || selectedMeterGroups.length > 0 ||
                        filterDisconnected || filterDacha || filterAbsent;
      
      if (hasFilters) {
        performSearch(true); // append = true для фільтрів
      } else {
        loadClients(true); // append = true для всіх клієнтів
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // ⭐ INFINITE SCROLL: Відновлення стану при mount
  useEffect(() => {
    const initializeApp = async () => {
      // Завантажуємо фільтри завжди
      await loadTotalCount();
      loadSettlements();
      loadStreets();
      loadMeterData();
      
      // Спробуємо відновити стан
      const restored = restoreScrollState();
      if (!restored) {
        // Якщо немає збереженого стану - завантажуємо перших клієнтів
        await loadClients();
      }
      
      // ⭐ Завершили початкове завантаження
      setIsInitialLoading(false);
      
      // ⭐ Дозволяємо useEffect з фільтрами спрацьовувати після mount
      isFirstRender.current = false;
    };
    
    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ⭐ Закриття dropdown швидких дій при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showQuickActions && !event.target.closest('.relative')) {
        setShowQuickActions(false);
      }
    };

    if (showQuickActions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showQuickActions]);


  const loadClients = async (append = false) => {
    // ⭐ INFINITE SCROLL: Якщо вже завантажуємо або немає більше - виходимо
    if (isLoadingMore || (!append && loading)) return;
    
    if (append) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const data = await getClientsByPage(currentPage, pageSize);
      
      if (append) {
        // ⭐ INFINITE SCROLL: Додаємо до існуючих
        setClients(prev => [...prev, ...data]);
      } else {
        // Звичайне завантаження
        setClients(data);
      }
      
      // Перевіряємо чи є ще дані
      setHasMore(data.length === pageSize);
      
      // ⭐ Зберігаємо стан після рендеру (щоб не було конфлікту)
      setTimeout(() => {
        saveScrollState();
      }, 100);
      
    } catch (error) {
      console.error('Error loading clients:', error);
    }
    
    if (append) {
      setIsLoadingMore(false);
    } else {
      setLoading(false);
    }
  };

  const loadTotalCount = async () => {
    const count = await countClients();
    setTotalCount(count);
  };

  const loadSettlements = async () => {
    const allClients = await getAllClients();
    const uniqueSettlements = [...new Set(allClients.map(c => c.settlement).filter(s => s))].sort();
    setSettlements(uniqueSettlements);
  };

  const loadStreets = async () => {
    const allClients = await getAllClients();
    const uniqueStreets = [...new Set(allClients.map(c => {
      const streetName = [c.streetType, c.street].filter(s => s).join(' ');
      return streetName;
    }).filter(s => s))].sort();
    setStreets(uniqueStreets);
  };

  const loadMeterData = async () => {
    const allClients = await getAllClients();
    
    const uniqueBrands = [...new Set(allClients.map(c => c.meterBrand).filter(b => b))].sort();
    setMeterBrands(uniqueBrands);
    
    const uniqueSizes = [...new Set(allClients.map(c => c.meterSize).filter(s => s))].sort();
    setMeterSizes(uniqueSizes);
    
    const uniqueYears = [...new Set(allClients.map(c => c.meterYear).filter(y => y))].sort((a, b) => b - a);
    setMeterYears(uniqueYears);
    
    const uniqueGroups = [...new Set(allClients.map(c => c.meterGroup).filter(g => g))].sort();
    setMeterGroups(uniqueGroups);
  };

  // ⭐ INFINITE SCROLL: Збереження стану в SessionStorage
  const saveScrollState = () => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
      sessionStorage.setItem(STORAGE_KEYS.SCROLL_Y, window.scrollY.toString());
      sessionStorage.setItem(STORAGE_KEYS.PAGE, currentPage.toString());
      sessionStorage.setItem(STORAGE_KEYS.HAS_MORE, hasMore.toString());
      sessionStorage.setItem(STORAGE_KEYS.FILTERED_TOTAL, filteredTotalCount.toString()); // ⭐ Зберігаємо
      sessionStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify({
        searchTerm,
        selectedSettlement,
        selectedStreet,
        selectedMeterBrand,
        selectedMeterSize,
        selectedMeterYear,
        selectedMeterGroups
      }));
    } catch (e) {
      console.error('Error saving scroll state:', e);
    }
  };

  // ⭐ INFINITE SCROLL: Відновлення стану з SessionStorage
  const restoreScrollState = () => {
    try {
      const savedClients = sessionStorage.getItem(STORAGE_KEYS.CLIENTS);
      const savedScrollY = sessionStorage.getItem(STORAGE_KEYS.SCROLL_Y);
      const savedPage = sessionStorage.getItem(STORAGE_KEYS.PAGE);
      const savedFilters = sessionStorage.getItem(STORAGE_KEYS.FILTERS);
      const savedHasMore = sessionStorage.getItem(STORAGE_KEYS.HAS_MORE);
      const savedFilteredTotal = sessionStorage.getItem(STORAGE_KEYS.FILTERED_TOTAL); // ⭐ Читаємо

      if (savedClients && savedPage) {
        setClients(JSON.parse(savedClients));
        setCurrentPage(parseInt(savedPage));
        setHasMore(savedHasMore === 'true');
        setFilteredTotalCount(parseInt(savedFilteredTotal) || 0); // ⭐ Відновлюємо
        
        if (savedFilters) {
          const filters = JSON.parse(savedFilters);
          setSearchTerm(filters.searchTerm || '');
          setSelectedSettlement(filters.selectedSettlement || []);
          setSelectedStreet(filters.selectedStreet || []);
          setSelectedMeterBrand(filters.selectedMeterBrand || []);
          setSelectedMeterSize(filters.selectedMeterSize || []);
          setSelectedMeterYear(filters.selectedMeterYear || []);
          setSelectedMeterGroups(filters.selectedMeterGroups || []);
        }
        
        // Відновлюємо позицію скролу після рендеру
        setTimeout(() => {
          if (savedScrollY) {
            window.scrollTo(0, parseInt(savedScrollY));
          }
        }, 100);
        
        // ⭐ Позначаємо що стан відновлено
        stateRestored.current = true;
        
        return true;
      }
    } catch (e) {
      console.error('Error restoring scroll state:', e);
    }
    return false;
  };

  // ⭐ INFINITE SCROLL: Очищення стану (при зміні фільтрів)
  const clearScrollState = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.CLIENTS);
      sessionStorage.removeItem(STORAGE_KEYS.SCROLL_Y);
      sessionStorage.removeItem(STORAGE_KEYS.PAGE);
      sessionStorage.removeItem(STORAGE_KEYS.FILTERS);
      sessionStorage.removeItem(STORAGE_KEYS.HAS_MORE);
      sessionStorage.removeItem(STORAGE_KEYS.FILTERED_TOTAL); // ⭐ Очищуємо
    } catch (e) {
      console.error('Error clearing scroll state:', e);
    }
  };

  // ⭐ INFINITE SCROLL: Обробка кліку по картці з збереженням стану
  const handleClientCardClick = (clientId) => {
    // Зберігаємо стан перед відкриттям деталей
    saveScrollState();
    // Відкриваємо/закриваємо картку
    setExpandedClientId(expandedClientId === clientId ? null : clientId);
    
    // Якщо закриваємо - відновлюємо позицію
    if (expandedClientId === clientId) {
      setTimeout(() => {
        const savedScrollY = sessionStorage.getItem(STORAGE_KEYS.SCROLL_Y);
        if (savedScrollY) {
          window.scrollTo(0, parseInt(savedScrollY));
        }
      }, 50);
    }
  };

  const performSearch = async (append = false) => {
    // ⭐ INFINITE SCROLL для фільтрів
    if (isLoadingMore || (!append && loading)) return;
    
    if (append) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const result = await searchClientsPaginated(
        debouncedSearchTerm, selectedSettlement, selectedStreet,
        selectedMeterBrand, selectedMeterSize, selectedMeterYear, selectedMeterGroups,
        filterDisconnected, filterDacha, filterAbsent,
        currentPage, pageSize
      );
      
      if (append) {
        // ⭐ Додаємо до існуючих
        setClients(prev => [...prev, ...result.items]);
      } else {
        // Перші результати
        setClients(result.items);
      }
      
      // Зберігаємо загальну кількість знайдених
      setFilteredTotalCount(result.total);
      setHasMore(result.hasMore);
      
      // Зберігаємо стан
      setTimeout(() => {
        saveScrollState();
      }, 100);
      
    } catch (error) {
      console.error('Error searching:', error);
    }
    
    if (append) {
      setIsLoadingMore(false);
    } else {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.accountNumber || !formData.fullName) {
      showToast('warning', 'Заповніть обов\'язкові поля: Особовий рахунок та ПІБ');
      return;
    }
    
    try {
      if (editingClient) {
        await updateClient({ ...formData, id: editingClient.id });
        showToast('success', 'Зміни успішно збережено!');
      } else {
        await addClient(formData);
        showToast('success', 'Клієнта успішно додано!');
      }
      await loadClients();
      await loadTotalCount();
      await loadSettlements();
      await loadStreets();
      await loadMeterData();
      resetForm();
    } catch (error) {
      console.error('Error saving client:', error);
      showToast('error', 'Помилка при збереженні клієнта');
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData(client);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    showModal(
      'confirm',
      'Підтвердження видалення',
      'Ви впевнені що хочете видалити цього клієнта з бази? Цю дію не можна буде відмінити.',
      async () => {
        // Підтверджено - видаляємо
        try {
          await deleteClient(id);
          await loadClients();
          await loadTotalCount();
          await loadSettlements();
          await loadStreets();
          await loadMeterData();
          showToast('success', 'Клієнта успішно видалено!');
        } catch (error) {
          console.error('Error deleting client:', error);
          showToast('error', 'Помилка при видаленні клієнта');
        }
      },
      () => {
        // Скасовано - нічого не робимо
        console.log('Видалення скасовано');
      }
    );
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    setImportProgress({ show: true, current: 0, total: 0, fileName: file.name });
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Встановлюємо загальну кількість
        setImportProgress(prev => ({ ...prev, total: jsonData.length }));
        
        let imported = 0;
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          const acc = row['Особовий рахунок'] || '';
          const name = row['ПІБ'] || '';
          
          if (!acc.toString().trim() || !name.toString().trim()) continue;
          
          const client = {
            fullName: (row['ПІБ'] || '').toString().trim(),
            settlement: (row['Населений пункт'] || '').toString().trim(),
            streetType: (row['Тип вулиці'] || '').toString().trim(),
            street: (row['Вулиця'] || '').toString().trim(),
            building: (row['Будинок'] || '').toString().trim(),
            buildingLetter: (row['Літера буд.'] || '').toString().trim(),
            apartment: (row['Квартира'] || '').toString().trim(),
            apartmentLetter: (row['Літера кв.'] || '').toString().trim(),
            accountNumber: acc.toString().trim(),
            eic: (row['EIC'] || '').toString().trim(),
            phone: (row['Телефон'] || '').toString().trim(),
            meterBrand: (row['Марка лічильника'] || '').toString().trim(),
            meterSize: (row['Типорозмір'] || '').toString().trim(),
            meterNumber: (row['№ лічильника'] || '').toString().trim(),
            meterYear: (row['Рік випуску'] || '').toString().trim(),
            verificationDate: (row['Дата повірки'] || '').toString().trim(),
            nextVerificationDate: (row['Наступна повірка'] || '').toString().trim(),
            installationDate: (row['Дата встановлення'] || '').toString().trim(),
            meterLocation: (row['Розташування лічильника'] || '').toString().trim(),
            meterGroup: (row['Група ліч.'] || '').toString().trim(),
            meterSubtype: (row['Підтип'] || '').toString().trim(),
            meterType: (row['Тип ліч.'] || '').toString().trim(),
            meterOwnership: (row['Належність'] || '').toString().trim(),
            serviceOrg: (row['Серв.орган.'] || '').toString().trim(),
            mvnssh: (row['МВНСШ'] || '').toString().trim(),
            rsp: (row['РСП'] || '').toString().trim(),
            seal: (row['Пломба'] || '').toString().trim(),
            stickerSeal: (row['Стікерна пломба'] || '').toString().trim(),
            boilerBrand: (row['Котел марка'] || '').toString().trim(),
            boilerPower: (row['Котел потужність'] || '').toString().trim(),
            stoveType: (row['Газова плита тип'] || '').toString().trim(),
            stoveCount: (row['Кількість плит'] || '').toString().trim(),
            columnType: (row['ВПГ тип'] || '').toString().trim(),
            columnCount: (row['Кількість ВПГ'] || '').toString().trim(),
            area: (row['Площа'] || '').toString().trim(),
            utilityType: (row['Комун. гос-во'] || '').toString().trim(),
            utilityGroup: (row['Група'] || '').toString().trim(),
            grs: (row['ГРС'] || '').toString().trim(),
            gasDisconnected: (row['Газ вимкнено'] || '').toString().trim(),
            disconnectMethod: (row['Метод відключення'] || '').toString().trim(),
            disconnectSeal: (row['Пломба відкл.'] || '').toString().trim(),
            disconnectDate: (row['Дата відкл.'] || '').toString().trim(),
            connectDate: (row['Дата підкл.'] || '').toString().trim(),
            dacha: row['Дача'] === 'Так' || row['Дача'] === true,
            temporaryAbsent: row['Тимчасово відсутній'] === 'Так' || row['Тимчасово відсутній'] === true
          };
          
          await addClient(client);
          imported++;
          
          // Оновлюємо прогрес
          setImportProgress(prev => ({ ...prev, current: i + 1 }));
        }
        
        await loadClients();
        await loadTotalCount();
        await loadSettlements();
        await loadStreets();
        await loadMeterData();
        
        // Завершили імпорт
        setImportProgress({ show: false, current: 0, total: 0, fileName: '' });
        setIsInitialLoading(false); // ⭐ Відключаємо початковий loader після першого імпорту
        showToast('success', `Імпортовано ${imported} клієнтів!`, 4000);
      } catch (error) {
        console.error('Import error:', error);
        setImportProgress({ show: false, current: 0, total: 0, fileName: '' });
        showToast('error', 'Помилка при імпорті файлу');
      }
      setLoading(false);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleExportExcel = async () => {
    setLoading(true);
    showToast('info', 'Експорт в Excel...', 3000);
    try {
      const allClients = await getAllClients();
      const exportData = allClients.map(c => ({
        'ПІБ': c.fullName, 'Населений пункт': c.settlement, 'Тип вулиці': c.streetType,
        'Вулиця': c.street, 'Будинок': c.building, 'Літера буд.': c.buildingLetter,
        'Квартира': c.apartment, 'Літера кв.': c.apartmentLetter, 'Особовий рахунок': c.accountNumber,
        'EIC': c.eic, 'Телефон': c.phone, 
        'Марка лічильника': c.meterBrand, 'Типорозмір': c.meterSize, '№ лічильника': c.meterNumber, 
        'Рік випуску': c.meterYear, 'Дата повірки': c.verificationDate, 'Наступна повірка': c.nextVerificationDate, 
        'Дата встановлення': c.installationDate, 'Розташування лічильника': c.meterLocation,
        'Група ліч.': c.meterGroup, 'Підтип': c.meterSubtype, 'Тип ліч.': c.meterType,
        'Належність': c.meterOwnership, 'Серв.орган.': c.serviceOrg, 'МВНСШ': c.mvnssh,
        'РСП': c.rsp, 'Пломба': c.seal, 'Стікерна пломба': c.stickerSeal,
        'Котел марка': c.boilerBrand, 'Котел потужність': c.boilerPower, 
        'Газова плита тип': c.stoveType, 'Кількість плит': c.stoveCount,
        'ВПГ тип': c.columnType, 'Кількість ВПГ': c.columnCount, 
        'Площа': c.area, 'Комун. гос-во': c.utilityType, 'Група': c.utilityGroup, 'ГРС': c.grs,
        'Газ вимкнено': c.gasDisconnected, 'Метод відключення': c.disconnectMethod,
        'Пломба відкл.': c.disconnectSeal, 'Дата відкл.': c.disconnectDate, 'Дата підкл.': c.connectDate,
        'Дача': c.dacha ? 'Так' : 'Ні', 'Тимчасово відсутній': c.temporaryAbsent ? 'Так' : 'Ні'
      }));
      
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Клієнти');
      XLSX.writeFile(wb, `Абоненти_${new Date().toISOString().split('T')[0]}.xlsx`);
      showToast('success', `Експортовано ${allClients.length} клієнтів!`, 4000);
    } catch (error) {
      console.error('Export error:', error);
      showToast('error', 'Помилка при експорті');
    }
    setLoading(false);
  };

  const handleDownloadTemplate = () => {
    const template = [{
      'ПІБ': 'Іванов Іван Іванович', 'Населений пункт': 'Київ', 'Тип вулиці': 'вул.',
      'Вулиця': 'Хрещатик', 'Будинок': '1', 'Літера буд.': 'А', 'Квартира': '10',
      'Літера кв.': '', 'Особовий рахунок': '1234567890', 'EIC': '12345678901234567890',
      'Телефон': '+380501234567',
      'Марка лічильника': 'Metrix', 'Типорозмір': 'G4', '№ лічильника': 'МТ123456',
      'Рік випуску': '2020', 'Дата повірки': '01.01.2020', 'Наступна повірка': '01.01.2030',
      'Дата встановлення': '15.01.2020', 'Розташування лічильника': 'Кухня',
      'Група ліч.': 'Група 1', 'Підтип': 'Мембранний', 'Тип ліч.': 'Побутовий',
      'Належність': 'Абонент', 'Серв.орган.': 'Сервіс-1', 'МВНСШ': '10', 'РСП': 'РСП-1',
      'Пломба': '№123456', 'Стікерна пломба': '№789012',
      'Котел марка': 'Ariston', 'Котел потужність': '24 кВт',
      'Газова плита тип': 'ПГ-4', 'Кількість плит': '1',
      'ВПГ тип': 'ВПГ-10', 'Кількість ВПГ': '1',
      'Площа': '65.5', 'Комун. гос-во': 'Квартира', 'Група': 'Багатоквартирний', 'ГРС': 'ГРС-1',
      'Газ вимкнено': 'Ні', 'Метод відключення': '', 'Пломба відкл.': '',
      'Дата відкл.': '', 'Дата підкл.': '', 'Дача': 'Ні', 'Тимчасово відсутній': 'Ні'
    }];
    const ws = XLSX.utils.json_to_sheet(template);
    ws['!cols'] = Array(45).fill({ wch: 15 });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Шаблон');
    XLSX.writeFile(wb, 'Шаблон_Абоненти.xlsx');
  };

  const resetForm = () => {
    setFormData({
      fullName: '', settlement: '', streetType: '', street: '', building: '', buildingLetter: '',
      apartment: '', apartmentLetter: '', accountNumber: '', eic: '', phone: '',
      meterBrand: '', meterSize: '', meterNumber: '', meterYear: '', verificationDate: '',
      nextVerificationDate: '', installationDate: '', meterLocation: '', meterGroup: '', 
      meterSubtype: '', meterType: '', meterOwnership: '', serviceOrg: '', mvnssh: '', 
      rsp: '', seal: '', stickerSeal: '',
      boilerBrand: '', boilerPower: '', stoveType: '', stoveCount: '', columnType: '', columnCount: '',
      area: '', utilityType: '', utilityGroup: '', grs: '',
      gasDisconnected: '', disconnectMethod: '', disconnectSeal: '', disconnectDate: '',
      connectDate: '', dacha: false, temporaryAbsent: false
    });
    setEditingClient(null);
    setIsModalOpen(false);
  };

  // Функції для обробки множинного вибору
  const toggleSelection = (array, setArray, value) => {
    if (array.includes(value)) {
      setArray(array.filter(v => v !== value));
    } else {
      setArray([...array, value]);
    }
    setCurrentPage(0);
  };

  const getFilterLabel = (selectedArray, allArray, label) => {
    if (selectedArray.length === 0) return label;
    if (selectedArray.length === 1) return selectedArray[0];
    return `${label} (${selectedArray.length})`;
  };

  // Компонент MultiSelectDropdown
  const MultiSelectDropdown = ({ options, selected, onChange, label, name }) => {
    const isOpen = openDropdown === name;
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setOpenDropdown(null);
        }
      };
      if (isOpen) {
        // Невелика затримка щоб клік на кнопку встиг спрацювати
        setTimeout(() => {
          document.addEventListener('click', handleClickOutside);
        }, 0);
        return () => document.removeEventListener('click', handleClickOutside);
      }
    }, [isOpen]);

    return (
      <div className="relative w-full sm:w-auto" ref={dropdownRef}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpenDropdown(isOpen ? null : name);
          }}
          className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-left flex items-center justify-between min-w-full sm:min-w-[180px] text-sm sm:text-base">
          <span className="truncate">{getFilterLabel(selected, options, label)}</span>
          <svg className={`w-4 h-4 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div 
            className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {options.length === 0 ? (
              <div className="px-4 py-2 text-gray-400 text-sm">Немає опцій</div>
            ) : (
              options.map(option => (
                <label
                  key={option}
                  className="flex items-center px-3 sm:px-4 py-3 sm:py-2 hover:bg-indigo-50 cursor-pointer active:bg-indigo-100"
                  onClick={(e) => {
                    // ⭐ ФІКС: Зупиняємо propagation щоб dropdown не закривався
                    e.stopPropagation();
                    // Якщо клікнули не на сам checkbox, то тоглимо вручну
                    if (e.target.tagName !== 'INPUT') {
                      e.preventDefault();
                      toggleSelection(selected, onChange, option);
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={(e) => {
                      // ⭐ ФІКС: Зупиняємо propagation щоб dropdown не закривався
                      e.stopPropagation();
                      toggleSelection(selected, onChange, option);
                    }}
                    className="w-5 h-5 sm:w-4 sm:h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 flex-shrink-0"
                  />
                  <span className="ml-3 sm:ml-2 text-sm text-gray-700">{option}</span>
                </label>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      {/* ⭐ MODAL ПРОГРЕСУ ІМПОРТУ */}
      {importProgress.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all">
            {/* Іконка завантаження */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-indigo-100"></div>
                <div className="absolute top-0 left-0 w-20 h-20 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Upload className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
            </div>

            {/* Заголовок */}
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Імпорт даних
            </h3>
            <p className="text-gray-600 text-center mb-6 text-sm">
              {importProgress.fileName}
            </p>

            {/* Прогрес бар */}
            <div className="mb-4">
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Оброблено записів</span>
                <span>{importProgress.current} / {importProgress.total}</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="text-center mt-2">
                <span className="text-lg font-bold text-indigo-600">
                  {importProgress.total > 0 ? Math.round((importProgress.current / importProgress.total) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Підказка */}
            <p className="text-xs text-gray-500 text-center">
              ⏳ Будь ласка, зачекайте. Не закривайте вікно.
            </p>
          </div>
        </div>
      )}

      {/* ⭐ ПЛАВАЮЧИЙ ЛІЧИЛЬНИК - показується ЗАВЖДИ */}
      {clients.length > 0 && (
        <div className="fixed top-4 right-4 z-40 bg-white/95 backdrop-blur-sm shadow-lg rounded-lg px-4 py-2 border border-indigo-200 transition-all hover:shadow-xl">
          <div className="text-center">
            <p className="text-xs text-gray-500 font-medium">Завантажено</p>
            <p className="text-lg font-bold text-indigo-900">
              {clients.length} <span className="text-sm text-gray-400">/</span> {
                // Показуємо filteredTotalCount якщо є фільтри, інакше totalCount
                (debouncedSearchTerm || selectedSettlement.length > 0 || selectedStreet.length > 0 || 
                 selectedMeterBrand.length > 0 || selectedMeterSize.length > 0 || 
                 selectedMeterYear.length > 0 || selectedMeterGroups.length > 0 ||
                 filterDisconnected || filterDacha || filterAbsent)
                  ? filteredTotalCount
                  : totalCount
              }
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6 mb-4 sm:mb-6">
          {/* Заголовок + Швидкі дії */}
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-900">База абонентів газопостачання</h1>
            
            {/* Dropdown з швидкими діями */}
            <div className="relative">
              <button 
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Швидкі дії"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              
              {/* Dropdown меню */}
              {showQuickActions && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl border-2 border-gray-200 z-50">
                  <div className="p-2">
                    <button onClick={() => { handleDownloadTemplate(); setShowQuickActions(false); }} className="w-full px-4 py-3 text-left hover:bg-purple-50 rounded-lg flex items-center gap-3 transition-colors">
                      <FileText className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="font-semibold text-sm text-gray-900">Шаблон</div>
                        <div className="text-xs text-gray-500">Завантажити Excel</div>
                      </div>
                    </button>
                    
                    <label className="w-full px-4 py-3 hover:bg-green-50 rounded-lg flex items-center gap-3 transition-colors cursor-pointer">
                      <Upload className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-semibold text-sm text-gray-900">Імпорт</div>
                        <div className="text-xs text-gray-500">Завантажити дані</div>
                      </div>
                      <input type="file" accept=".xlsx,.xls" onChange={(e) => { handleImportExcel(e); setShowQuickActions(false); }} className="hidden" disabled={loading} />
                    </label>
                    
                    <button onClick={() => { handleExportExcel(); setShowQuickActions(false); }} disabled={totalCount === 0 || loading} className="w-full px-4 py-3 text-left hover:bg-blue-50 rounded-lg flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      <Download className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-semibold text-sm text-gray-900">Експорт</div>
                        <div className="text-xs text-gray-500">Зберегти в Excel</div>
                      </div>
                    </button>
                    
                    <div className="border-t my-2"></div>
                    
                    <button onClick={() => { setIsModalOpen(true); setShowQuickActions(false); }} disabled={loading} className="w-full px-4 py-3 text-left hover:bg-indigo-50 rounded-lg flex items-center gap-3 transition-colors">
                      <Plus className="w-5 h-5 text-indigo-600" />
                      <div>
                        <div className="font-semibold text-sm text-gray-900">Додати клієнта</div>
                        <div className="text-xs text-gray-500">Новий запис</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Показуємо фільтри та пошук ТІЛЬКИ якщо база не порожня */}
          {!isInitialLoading && totalCount > 0 && (
          <>
          {/* Головний пошук на всю ширину */}
          <div className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Пошук за ПІБ, особовим рахунком, телефоном..."
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
                value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }} />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Фільтри для мобільних - 2 кнопки */}
          <div className="sm:hidden grid grid-cols-2 gap-2 mb-3">
            {/* Кнопка фільтрів адреси */}
            <button 
              onClick={() => setShowAddressFilters(!showAddressFilters)}
              className="px-3 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border border-blue-200 text-blue-900 rounded-lg flex items-center justify-between transition-all shadow-sm"
            >
              <span className="flex items-center gap-1 font-medium text-sm">
                <Home size={18} />
                Адреса
                {(selectedSettlement.length > 0 || selectedStreet.length > 0) && (
                  <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                    {selectedSettlement.length + selectedStreet.length}
                  </span>
                )}
              </span>
              <span className="text-sm">{showAddressFilters ? '▲' : '▼'}</span>
            </button>

            {/* Кнопка фільтрів лічильників */}
            <button 
              onClick={() => setShowMeterFilters(!showMeterFilters)}
              className="px-3 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border border-purple-200 text-purple-900 rounded-lg flex items-center justify-between transition-all shadow-sm"
            >
              <span className="flex items-center gap-1 font-medium text-sm">
                <Gauge size={18} />
                Лічильник
                {(selectedMeterGroups.length > 0 || selectedMeterBrand.length > 0 || selectedMeterSize.length > 0 || selectedMeterYear.length > 0) && (
                  <span className="bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                    {selectedMeterGroups.length + selectedMeterBrand.length + selectedMeterSize.length + selectedMeterYear.length}
                  </span>
                )}
              </span>
              <span className="text-sm">{showMeterFilters ? '▲' : '▼'}</span>
            </button>
          </div>

          {/* Фільтри для Desktop - 2 колонки */}
          <div className="hidden sm:grid sm:grid-cols-2 gap-4 mb-4">
            {/* Ліва колонка - Фільтри адреси */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Home size={16} />
                Фільтри адреси
              </h3>
              <div className="space-y-2">
                <MultiSelectDropdown
                  options={settlements}
                  selected={selectedSettlement}
                  onChange={setSelectedSettlement}
                  label="Населений пункт"
                  name="settlement"
                />
                <MultiSelectDropdown
                  options={streets}
                  selected={selectedStreet}
                  onChange={setSelectedStreet}
                  label="Вулиця"
                  name="street"
                />
              </div>
            </div>

            {/* Права колонка - Фільтри лічильників */}
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <h3 className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <Gauge size={16} />
                Фільтри лічильників
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <MultiSelectDropdown
                  options={meterGroups}
                  selected={selectedMeterGroups}
                  onChange={setSelectedMeterGroups}
                  label="Група"
                  name="meterGroup"
                />
                <MultiSelectDropdown
                  options={meterBrands}
                  selected={selectedMeterBrand}
                  onChange={setSelectedMeterBrand}
                  label="Марка"
                  name="meterBrand"
                />
                <MultiSelectDropdown
                  options={meterSizes}
                  selected={selectedMeterSize}
                  onChange={setSelectedMeterSize}
                  label="Розмір"
                  name="meterSize"
                />
                <MultiSelectDropdown
                  options={meterYears}
                  selected={selectedMeterYear}
                  onChange={setSelectedMeterYear}
                  label="Рік"
                  name="meterYear"
                />
              </div>
            </div>
          </div>

          {/* Фільтри адреси для мобільних (згортаються) */}
          <div className={`sm:hidden mb-3 ${showAddressFilters ? 'block' : 'hidden'}`}>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 space-y-2">
            <MultiSelectDropdown
              options={settlements}
              selected={selectedSettlement}
              onChange={setSelectedSettlement}
              label="Населений пункт"
              name="settlement"
            />
            <MultiSelectDropdown
              options={streets}
              selected={selectedStreet}
              onChange={setSelectedStreet}
              label="Вулиця"
              name="street"
            />
            </div>
          </div>

          {/* Фільтри лічильників для мобільних (згортаються) */}
          <div className={`sm:hidden mb-3 ${showMeterFilters ? 'block' : 'hidden'}`}>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 space-y-2">
            <MultiSelectDropdown
              options={meterGroups}
              selected={selectedMeterGroups}
              onChange={setSelectedMeterGroups}
              label="Група лічильника"
              name="meterGroup"
            />
            <MultiSelectDropdown
              options={meterBrands}
              selected={selectedMeterBrand}
              onChange={setSelectedMeterBrand}
              label="Марка лічильника"
              name="meterBrand"
            />
            <MultiSelectDropdown
              options={meterSizes}
              selected={selectedMeterSize}
              onChange={setSelectedMeterSize}
              label="Типорозмір"
              name="meterSize"
            />
            <MultiSelectDropdown
              options={meterYears}
              selected={selectedMeterYear}
              onChange={setSelectedMeterYear}
              label="Рік випуску"
              name="meterYear"
            />
            </div>
          </div>

          {/* ⭐ ФІЛЬТРИ СТАТУСІВ - компактні чіпси */}
          <div className="mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Статуси:</span>
              <label className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-300 rounded-md cursor-pointer transition-all text-xs">
                <input 
                  type="checkbox" 
                  checked={filterDisconnected}
                  onChange={(e) => setFilterDisconnected(e.target.checked)}
                  className="w-3.5 h-3.5 text-red-600 rounded" 
                />
                <span className="font-medium text-gray-700">🔴 Відключений</span>
              </label>
              <label className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-md cursor-pointer transition-all text-xs">
                <input 
                  type="checkbox" 
                  checked={filterDacha}
                  onChange={(e) => setFilterDacha(e.target.checked)}
                  className="w-3.5 h-3.5 text-orange-600 rounded" 
                />
                <span className="font-medium text-gray-700">🟠 Дача</span>
              </label>
              <label className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-yellow-50 border border-gray-200 hover:border-yellow-300 rounded-md cursor-pointer transition-all text-xs">
                <input 
                  type="checkbox" 
                  checked={filterAbsent}
                  onChange={(e) => setFilterAbsent(e.target.checked)}
                  className="w-3.5 h-3.5 text-yellow-600 rounded" 
                />
                <span className="font-medium text-gray-700">🟡 Не проживає</span>
              </label>
            </div>
          </div>

          {/* Кнопка "Скинути всі фільтри" - компактна */}
          <div className="mb-4">
            {(searchTerm || selectedSettlement.length > 0 || selectedStreet.length > 0 || 
              selectedMeterBrand.length > 0 || selectedMeterSize.length > 0 || selectedMeterYear.length > 0 || selectedMeterGroups.length > 0 ||
              filterDisconnected || filterDacha || filterAbsent) && (
              <button onClick={() => {
                setSearchTerm('');
                setSelectedSettlement([]);
                setSelectedStreet([]);
                setSelectedMeterBrand([]);
                setSelectedMeterSize([]);
                setSelectedMeterYear([]);
                setSelectedMeterGroups([]);
                setFilterDisconnected(false);
                setFilterDacha(false);
                setFilterAbsent(false);
                setCurrentPage(0);
              }}
                className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 rounded-md flex items-center gap-1.5 transition-colors text-sm font-medium">
                <X size={16} /> Скинути фільтри
              </button>
            )}
          </div>

          {/* ⭐ СТАТИСТИКА з іконками */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
              <div className="text-sm text-gray-600 flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-medium text-gray-700">Всього:</span>
                  <span className="font-semibold text-indigo-600">{totalCount}</span>
                </span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="font-medium text-gray-700">Показано:</span>
                  <span className="font-semibold text-blue-600">{clients.length}</span>
                </span>
              </div>
            </div>
            
            {/* ⭐ Стара пагінація видалена - тепер Infinite Scroll! */}
          </div>
          </>
          )}

          {loading && <div className="text-center py-8 text-gray-500">Завантаження...</div>}

          {!loading && (
            <>
              {/* Розділювач перед списком - показуємо тільки якщо база не порожня */}
              {totalCount > 0 && (
                <div className="mb-5 mt-2">
                  <div className="border-t border-gray-200"></div>
                </div>
              )}

              <div className="space-y-3">
              {clients.map(c => {
                const statusColor = c.gasDisconnected === 'Так' ? 'border-red-500' : 
                                   c.temporaryAbsent ? 'border-yellow-400' : 
                                   c.dacha ? 'border-orange-400' : 'border-transparent';
                
                return (
                  <div key={c.id} className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow border-l-4 ${statusColor}`}>
                    {/* Компактний вид */}
                    <div className="short-client-info p-3">
                      {/* Заголовок */}
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-900 text-base">{c.fullName}</h3>
                            {c.temporaryAbsent && (
                              <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Відсутній
                              </span>
                            )}
                            {c.dacha && (
                              <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-0.5 rounded">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                </svg>
                                Дача
                              </span>
                            )}
                            {c.gasDisconnected === 'Так' && (
                              <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                </svg>
                                Відключений
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">о/р:</span> {c.accountNumber}
                          </p>
                        </div>
                        <div className="flex gap-1.5 ml-2">
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(c); }} 
                            className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} 
                            className="text-red-600 hover:bg-red-50 p-1 rounded">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {/* Адреса та телефон */}
                      <div className="text-sm text-gray-700 mb-2 space-y-1">
                        <p className="flex items-start gap-1.5">
                          <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>
                            {c.settlement}, {c.streetType} {c.street}, буд. {c.building}{c.buildingLetter}
                            {c.apartment && `, кв. ${c.apartment}${c.apartmentLetter}`}
                          </span>
                        </p>
                        {c.phone && (
                          <p className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="flex flex-wrap gap-x-1">
                              {formatPhones(c.phone)}
                            </span>
                          </p>
                        )}
                      </div>
                      
                      {/* Лічильник компактно */}
                      {c.meterNumber && (
                        <div className="bg-purple-50 px-3 py-2 rounded text-sm flex items-center gap-2">
                          <svg className="w-4 h-4 text-purple-800 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                          </svg>
                          <span>
                            <span className="font-semibold">
                              {c.meterBrand} {c.meterSize && `G${c.meterSize}`}
                            </span>
                            <span className="text-gray-600">
                              {' '}№{c.meterNumber}
                              {c.meterYear && ` ${c.meterYear}р.`}
                            </span>
                          </span>
                        </div>
                      )}
                      
                      {/* Інфо про відключення для відключених */}
                      {c.gasDisconnected === 'Так' && (c.disconnectDate || c.disconnectMethod) && (
                        <div className="mt-2 bg-red-50 border border-red-200 rounded px-3 py-2 text-xs text-red-800">
                          <p>
                            {c.disconnectDate && <><strong>Відключено:</strong> {c.disconnectDate}</>}
                            {c.disconnectDate && c.disconnectMethod && ' | '}
                            {c.disconnectMethod && <><strong>Метод:</strong> {c.disconnectMethod}</>}
                          </p>
                        </div>
                      )}
                      
                      {/* Кнопка детальніше */}
                      <button 
                        onClick={() => handleClientCardClick(c.id)}
                        className="mt-2 w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 rounded text-sm font-medium transition-colors">
                        📋 Детальніше
                      </button>
                    </div>

                    
                    {/* Розгорнута детальна інформація */}
                    {expandedClientId === c.id && (
                      <div className="border-t border-gray-200 bg-gray-50 p-3 sm:p-4">

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                        <div className="bg-blue-50 p-2.5 sm:p-3 rounded-lg">
                          <p className="text-xs font-semibold text-blue-900 mb-2">ОСОБОВІ ДАНІ</p>
                          <div className="space-y-1 text-xs sm:text-sm">
                            <p className="text-gray-700"><span className="font-medium">Особовий рахунок:</span> {c.accountNumber}</p>
                            {c.eic && <p className="text-gray-700"><span className="font-medium">EIC:</span> {c.eic}</p>}
                            {c.phone && (
                              <div className="flex items-center gap-2">
                                <Phone size={14} className="text-gray-500 flex-shrink-0" />
                                <div className="flex flex-wrap gap-x-1">
                                  {formatPhones(c.phone)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-purple-50 p-2.5 sm:p-3 rounded-lg">
                          <p className="text-xs font-semibold text-purple-900 mb-2">ЛІЧИЛЬНИК</p>
                          {c.meterNumber ? (
                            <div className="space-y-1 text-xs">
                              {c.meterBrand && <p className="text-gray-700"><span className="font-semibold">Марка:</span> {c.meterBrand}</p>}
                              {c.meterSize && <p className="text-gray-700"><span className="font-semibold">Типорозмір:</span> {c.meterSize}</p>}
                              <p className="text-gray-700"><span className="font-semibold">№:</span> {c.meterNumber}</p>
                              {c.meterYear && <p className="text-gray-700"><span className="font-semibold">Рік випуску:</span> {c.meterYear}</p>}
                              {c.verificationDate && <p className="text-gray-700"><span className="font-semibold">Дата повірки:</span> {c.verificationDate}</p>}
                              {c.nextVerificationDate && <p className="text-gray-600"><span className="font-semibold">Наступна повірка:</span> {c.nextVerificationDate}</p>}
                              {c.installationDate && <p className="text-gray-700"><span className="font-semibold">Дата встановлення:</span> {c.installationDate}</p>}
                              {c.meterLocation && <p className="text-gray-600"><span className="font-semibold">Розташування:</span> {c.meterLocation}</p>}
                              {c.meterGroup && <p className="text-gray-600"><span className="font-semibold">Група ліч.:</span> {c.meterGroup}</p>}
                              {c.meterSubtype && <p className="text-gray-600"><span className="font-semibold">Підтип:</span> {c.meterSubtype}</p>}
                              {c.meterType && <p className="text-gray-600"><span className="font-semibold">Тип ліч.:</span> {c.meterType}</p>}
                              {c.meterOwnership && <p className="text-gray-600"><span className="font-semibold">Належність:</span> {c.meterOwnership}</p>}
                              {c.serviceOrg && <p className="text-gray-600"><span className="font-semibold">Серв.орган.:</span> {c.serviceOrg}</p>}
                              {c.mvnssh && <p className="text-gray-600"><span className="font-semibold">МВНСШ:</span> {c.mvnssh}</p>}
                              {c.rsp && <p className="text-gray-600"><span className="font-semibold">РСП:</span> {c.rsp}</p>}
                              {c.seal && <p className="text-gray-600"><span className="font-semibold">Пломба:</span> {c.seal}</p>}
                              {c.stickerSeal && <p className="text-gray-600"><span className="font-semibold">Стікерна пломба:</span> {c.stickerSeal}</p>}
                            </div>
                          ) : <p className="text-gray-400 text-sm">Немає даних</p>}
                        </div>

                        <div className="bg-orange-50 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-orange-900 mb-2">ПРИЛАДИ</p>
                          <div className="space-y-1 text-sm">
                            {c.boilerBrand && <p className="text-gray-700"><span className="font-medium">Котел:</span> {c.boilerBrand}{c.boilerPower && ` (${c.boilerPower})`}</p>}
                            {c.stoveType && <p className="text-gray-700"><span className="font-medium">Плита:</span> {c.stoveType}{c.stoveCount && ` × ${c.stoveCount} шт`}</p>}
                            {c.columnType && <p className="text-gray-700"><span className="font-medium">ВПГ:</span> {c.columnType}{c.columnCount && ` × ${c.columnCount} шт`}</p>}
                            {!c.boilerBrand && !c.stoveType && !c.columnType && <p className="text-gray-400 text-sm">Немає даних</p>}
                          </div>
                        </div>
                      </div>

                      {c.gasDisconnected === 'Так' && (
                        <div className="mt-4 bg-red-50 p-3 rounded-lg border-2 border-red-200">
                          <p className="text-xs font-semibold text-red-900 mb-2">⚠️ ГАЗ ВІДКЛЮЧЕНО</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            {c.disconnectDate && <p className="text-gray-700"><span className="font-semibold">Дата відкл.:</span> {c.disconnectDate}</p>}
                            {c.disconnectMethod && <p className="text-gray-700"><span className="font-semibold">Метод:</span> {c.disconnectMethod}</p>}
                            {c.disconnectSeal && <p className="text-gray-700"><span className="font-semibold">Пломба:</span> {c.disconnectSeal}</p>}
                            {c.connectDate && <p className="text-green-700"><span className="font-semibold">Дата підкл.:</span> {c.connectDate}</p>}
                          </div>
                        </div>
                      )}

                        {(c.area || c.utilityGroup || c.grs) && (
                          <div className="mt-4 bg-white p-3 rounded-lg border border-gray-200">
                            <p className="text-xs font-semibold text-gray-900 mb-2">ДОДАТКОВА ІНФОРМАЦІЯ</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                              {c.area && <p className="text-gray-600"><span className="font-medium">Площа:</span> {c.area} м²</p>}
                              {c.utilityGroup && <p className="text-gray-600"><span className="font-medium">Група:</span> {c.utilityGroup}</p>}
                              {c.grs && <p className="text-gray-600"><span className="font-medium">ГРС:</span> {c.grs}</p>}
                            </div>
                          </div>
                        )}
                        
                        {/* Кнопки редагування та видалення */}
                        <div className="mt-4 flex flex-col sm:flex-row gap-2">
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(c); }} 
                            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium">
                            <Edit2 size={16} /> Редагувати
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} 
                            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium">
                            <Trash2 size={16} /> Видалити
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* ⭐ INFINITE SCROLL: Індикатор завантаження */}
              {isLoadingMore && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                  <p className="text-gray-600 mt-2 text-sm">Завантаження...</p>
                </div>
              )}

              {/* ⭐ INFINITE SCROLL: Кінець списку */}
              {!hasMore && clients.length > 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🎉</div>
                  <p className="text-lg font-semibold text-gray-800">
                    {(debouncedSearchTerm || selectedSettlement.length > 0 || selectedStreet.length > 0 || 
                      selectedMeterBrand.length > 0 || selectedMeterSize.length > 0 || 
                      selectedMeterYear.length > 0 || selectedMeterGroups.length > 0)
                      ? 'Це всі результати!'
                      : 'Це всі клієнти!'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {(debouncedSearchTerm || selectedSettlement.length > 0 || selectedStreet.length > 0 || 
                      selectedMeterBrand.length > 0 || selectedMeterSize.length > 0 || 
                      selectedMeterYear.length > 0 || selectedMeterGroups.length > 0)
                      ? `Знайдено ${filteredTotalCount} клієнтів`
                      : 'Ви переглянули всю базу'}
                  </p>
                </div>
              )}

              {clients.length === 0 && (
                <div>
                  {searchTerm || selectedSettlement.length > 0 || selectedStreet.length > 0 || 
                   selectedMeterBrand.length > 0 || selectedMeterSize.length > 0 || selectedMeterYear.length > 0 || selectedMeterGroups.length > 0 ? (
                    // Якщо є фільтри - показуємо звичайне повідомлення
                    <div className="text-center py-12 text-gray-500">
                      Нічого не знайдено
                    </div>
                  ) : isInitialLoading ? (
                    // Поки завантажуємо - показуємо loader
                    <div className="text-center py-12 text-gray-500">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mb-2"></div>
                      <p>Завантаження...</p>
                    </div>
                  ) : totalCount === 0 ? (
                    // Якщо база порожня - показуємо онбординг
                    <div className="max-w-3xl mx-auto py-12 px-4">
                      {/* Заголовок */}
                      <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full mb-4">
                          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Вітаємо в базі абонентів!</h2>
                        <p className="text-gray-600 text-lg">Почніть роботу з додавання ваших перших клієнтів</p>
                      </div>

                      {/* Кроки */}
                      <div className="grid md:grid-cols-3 gap-6 mb-8">
                        {/* Крок 1 */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4">
                            <span className="text-2xl font-bold text-indigo-600">1</span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2 text-lg">Завантажте шаблон</h3>
                          <p className="text-gray-600 text-sm mb-4">Скачайте Excel шаблон з правильною структурою даних</p>
                          <button 
                            onClick={handleDownloadTemplate}
                            className="w-full px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
                          >
                            <FileText size={16} />
                            Завантажити шаблон
                          </button>
                        </div>

                        {/* Крок 2 */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                            <span className="text-2xl font-bold text-blue-600">2</span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2 text-lg">Заповніть дані</h3>
                          <p className="text-gray-600 text-sm mb-4">Внесіть інформацію про клієнтів в Excel файл</p>
                          <div className="w-full px-4 py-2 bg-gray-50 text-gray-500 rounded-lg text-center text-sm">
                            Або додайте вручну →
                          </div>
                        </div>

                        {/* Крок 3 */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                            <span className="text-2xl font-bold text-green-600">3</span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2 text-lg">Імпортуйте базу</h3>
                          <p className="text-gray-600 text-sm mb-4">Завантажте заповнений файл в систему</p>
                          <label className="w-full px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer text-sm font-medium">
                            <Upload size={16} />
                            Імпортувати Excel
                            <input type="file" accept=".xlsx,.xls" onChange={handleImportExcel} className="hidden" />
                          </label>
                        </div>
                      </div>

                      {/* Швидкі дії */}
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border-2 border-indigo-100">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                          <div className="text-center md:text-left">
                            <h3 className="font-semibold text-gray-900 mb-1">Або почніть з одного клієнта</h3>
                            <p className="text-gray-600 text-sm">Додайте першого абонента вручну через форму</p>
                          </div>
                          <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm hover:shadow-md whitespace-nowrap"
                          >
                            <Plus size={20} />
                            Додати клієнта
                          </button>
                        </div>
                      </div>

                      {/* Підказка */}
                      <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                          💡 <span className="font-medium">Порада:</span> Для швидкого старту рекомендуємо використати імпорт з Excel
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Якщо є дані але зараз порожньо (через фільтри які щойно скинули)
                    <div className="text-center py-12 text-gray-500">
                      Немає жодного клієнта. Додайте першого!
                    </div>
                  )}
                </div>
              )}
              </div>
            </>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto"
          onClick={resetForm}
        >
          <div className="min-h-screen flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-lg max-w-6xl w-full my-8" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b bg-white rounded-t-lg">
                <h2 className="text-2xl font-bold text-gray-900">{editingClient ? 'Редагувати клієнта' : 'Новий клієнт'}</h2>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                    <h3 className="font-bold text-blue-900 mb-3 text-lg flex items-center gap-2">
                      <Home size={20} /> ПІБ, Адреса, Особові дані
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">ПІБ *</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                          value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Населений пункт</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                          value={formData.settlement} onChange={(e) => setFormData({...formData, settlement: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Тип вулиці</label>
                        <input type="text" placeholder="вул., пр., пл." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          value={formData.streetType} onChange={(e) => setFormData({...formData, streetType: e.target.value})} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Вулиця</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Будинок</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          value={formData.building} onChange={(e) => setFormData({...formData, building: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Літера буд.</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          value={formData.buildingLetter} onChange={(e) => setFormData({...formData, buildingLetter: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Квартира</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          value={formData.apartment} onChange={(e) => setFormData({...formData, apartment: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Літера кв.</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          value={formData.apartmentLetter} onChange={(e) => setFormData({...formData, apartmentLetter: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Особовий рахунок *</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          value={formData.accountNumber} onChange={(e) => setFormData({...formData, accountNumber: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">EIC</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          value={formData.eic} onChange={(e) => setFormData({...formData, eic: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                        <input type="tel" placeholder="+380..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                      </div>
                      <div className="md:col-span-3 flex items-center gap-6 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4"
                            checked={formData.dacha} onChange={(e) => setFormData({...formData, dacha: e.target.checked})} />
                          <span className="text-sm">Дача</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4"
                            checked={formData.temporaryAbsent} onChange={(e) => setFormData({...formData, temporaryAbsent: e.target.checked})} />
                          <span className="text-sm">Тимчасово не проживає</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                    <h3 className="font-bold text-purple-900 mb-3 text-lg flex items-center gap-2">
                      <Gauge size={20} /> Лічильник
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Марка лічильника</label>
                        <input type="text" placeholder="Metrix..." className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.meterBrand} onChange={(e) => setFormData({...formData, meterBrand: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Типорозмір</label>
                        <input type="text" placeholder="G4..." className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.meterSize} onChange={(e) => setFormData({...formData, meterSize: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">№ лічильника</label>
                        <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.meterNumber} onChange={(e) => setFormData({...formData, meterNumber: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Рік випуску</label>
                        <input type="text" placeholder="2020" className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.meterYear} onChange={(e) => setFormData({...formData, meterYear: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Дата повірки</label>
                        <input type="text" placeholder="ДД.ММ.РРРР" className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.verificationDate} onChange={(e) => setFormData({...formData, verificationDate: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Наступна повірка</label>
                        <input type="text" placeholder="ДД.ММ.РРРР" className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.nextVerificationDate} onChange={(e) => setFormData({...formData, nextVerificationDate: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Дата встановлення</label>
                        <input type="text" placeholder="ДД.ММ.РРРР" className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.installationDate} onChange={(e) => setFormData({...formData, installationDate: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Розташування</label>
                        <input type="text" placeholder="Кухня..." className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.meterLocation} onChange={(e) => setFormData({...formData, meterLocation: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Група ліч.</label>
                        <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.meterGroup} onChange={(e) => setFormData({...formData, meterGroup: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Підтип</label>
                        <input type="text" placeholder="Мембранний..." className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.meterSubtype} onChange={(e) => setFormData({...formData, meterSubtype: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Тип ліч.</label>
                        <input type="text" placeholder="Побутовий..." className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.meterType} onChange={(e) => setFormData({...formData, meterType: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Належність</label>
                        <input type="text" placeholder="Абонент..." className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.meterOwnership} onChange={(e) => setFormData({...formData, meterOwnership: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Серв.орган.</label>
                        <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.serviceOrg} onChange={(e) => setFormData({...formData, serviceOrg: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">МВНСШ</label>
                        <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.mvnssh} onChange={(e) => setFormData({...formData, mvnssh: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">РСП</label>
                        <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.rsp} onChange={(e) => setFormData({...formData, rsp: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Пломба</label>
                        <input type="text" placeholder="№123456" className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.seal} onChange={(e) => setFormData({...formData, seal: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Стікерна пломба</label>
                        <input type="text" placeholder="№789012" className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.stickerSeal} onChange={(e) => setFormData({...formData, stickerSeal: e.target.value})} /></div>
                    </div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
                    <h3 className="font-bold text-orange-900 mb-3 text-lg">Прилади</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Котел - марка</label>
                        <input type="text" placeholder="Ariston..." className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.boilerBrand} onChange={(e) => setFormData({...formData, boilerBrand: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Котел - потужність</label>
                        <input type="text" placeholder="24 кВт..." className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.boilerPower} onChange={(e) => setFormData({...formData, boilerPower: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Газова плита - тип</label>
                        <input type="text" placeholder="ПГ-4..." className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.stoveType} onChange={(e) => setFormData({...formData, stoveType: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Кількість плит</label>
                        <input type="text" placeholder="1, 2..." className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.stoveCount} onChange={(e) => setFormData({...formData, stoveCount: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">ВПГ - тип</label>
                        <input type="text" placeholder="ВПГ-10..." className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.columnType} onChange={(e) => setFormData({...formData, columnType: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Кількість ВПГ</label>
                        <input type="text" placeholder="1, 2..." className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.columnCount} onChange={(e) => setFormData({...formData, columnCount: e.target.value})} /></div>
                    </div>
                  </div>

                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Комунальне господарство та відключення</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Площа (м²)</label>
                        <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Комун. гос-во</label>
                        <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.utilityType} onChange={(e) => setFormData({...formData, utilityType: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Група</label>
                        <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.utilityGroup} onChange={(e) => setFormData({...formData, utilityGroup: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">ГРС</label>
                        <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.grs} onChange={(e) => setFormData({...formData, grs: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Газ вимкнено</label>
                        <input type="text" placeholder="Так/Ні" className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.gasDisconnected} onChange={(e) => setFormData({...formData, gasDisconnected: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Метод відкл.</label>
                        <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.disconnectMethod} onChange={(e) => setFormData({...formData, disconnectMethod: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Пломба відкл.</label>
                        <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.disconnectSeal} onChange={(e) => setFormData({...formData, disconnectSeal: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Дата відкл.</label>
                        <input type="text" placeholder="ДД.ММ.РРРР" className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.disconnectDate} onChange={(e) => setFormData({...formData, disconnectDate: e.target.value})} /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Дата підкл.</label>
                        <input type="text" placeholder="ДД.ММ.РРРР" className="w-full px-3 py-2 border rounded-lg text-sm"
                          value={formData.connectDate} onChange={(e) => setFormData({...formData, connectDate: e.target.value})} /></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t bg-gray-50 rounded-b-lg">
                <button onClick={handleSubmit}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2">
                  <Save size={20} /> {editingClient ? 'Зберегти зміни' : 'Додати клієнта'}
                </button>
                <button onClick={resetForm} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100">
                  Скасувати
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Обгортаємо ClientDatabase в AlertProvider
export default function AppWithAlerts() {
  return (
    <AlertProvider>
      <ClientDatabase />
    </AlertProvider>
  );
}