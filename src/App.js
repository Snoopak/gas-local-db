import React, { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, X, Save, Phone, Home, Gauge, Upload, Download, FileText, CheckCircle, AlertCircle, Info, AlertTriangle, Database, Activity, Flame, MapPin, ChevronUp, ChevronDown, Users } from 'lucide-react';
import * as XLSX from 'xlsx';
import './App.css';
import {METER_CATALOG, METER_SIZES, METER_SUBTYPE, METER_LOCATION, METER_OWNERSHIP, SERVICE_ORG, METER_GROUP, METER_MANUFACTURER, U_STREET_TYPE} from './data';

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

const searchClients = async (searchTerm, settlements, streets, meterBrands, meterSizes, meterYears, meterGroups, filterDisconnected, filterDacha, filterAbsent, filterConnected, filterBuilding, filterApartment) => {
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
          client.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.accountNumber?.includes(searchTerm) ||
          client.phone?.includes(searchTerm) ||
          client.street?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.meterNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesSettlement = settlements.length === 0 || settlements.includes(client.settlement);
        
        const clientStreetName = [client.streetType, client.street].filter(s => s).join(' ');
        const matchesStreet = streets.length === 0 || streets.includes(clientStreetName);

        // ⭐ ФІЛЬТР: будинок
        const matchesBuilding = !filterBuilding ||
          (String(client.building || '') + String(client.buildingLetter || '')).toLowerCase() === filterBuilding.toLowerCase();

        // ⭐ ФІЛЬТР: квартира
        const matchesApartment = !filterApartment ||
          (String(client.apartment || '') + String(client.apartmentLetter || '')).toLowerCase() === filterApartment.toLowerCase();
        
        const matchesMeterBrand = meterBrands.length === 0 || meterBrands.includes(client.meterBrand);
        const matchesMeterSize = meterSizes.length === 0 || meterSizes.includes(client.meterSize);
        const matchesMeterYear = meterYears.length === 0 || meterYears.includes(client.meterYear);
        const matchesMeterGroup = meterGroups.length === 0 || meterGroups.includes(client.meterGroup);
        
        // ⭐ ФІЛЬТРИ СТАТУСІВ
        let matchesStatus = true;
        if (filterDisconnected || filterDacha || filterAbsent) {
          matchesStatus = 
            (filterDisconnected && client.gasDisconnected === true) ||
            (filterDacha && client.dacha === true) ||
            (filterAbsent && client.temporaryAbsent === true);
        }

        // ⭐ ФІЛЬТР: газ включений (виключає відключених)
        const matchesConnected = !filterConnected || client.gasDisconnected !== true;
        
        if (matchesSearch && matchesSettlement && matchesStreet &&
            matchesBuilding && matchesApartment &&
            matchesMeterBrand && matchesMeterSize && matchesMeterYear && matchesMeterGroup &&
            matchesStatus && matchesConnected) {
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
const searchClientsPaginated = async (searchTerm, settlements, streets, meterBrands, meterSizes, meterYears, meterGroups, filterDisconnected, filterDacha, filterAbsent, filterConnected, filterBuilding, filterApartment, page, pageSize) => {
  // Спочатку отримуємо ВСІ результати
  const allResults = await searchClients(searchTerm, settlements, streets, meterBrands, meterSizes, meterYears, meterGroups, filterDisconnected, filterDacha, filterAbsent, filterConnected, filterBuilding, filterApartment);
  
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
  // ⭐ КОНФІГУРАЦІЯ
  const CONFIG = {
    PAGE_SIZE: 50,
    DEBOUNCE_DELAY: 500,
    SCROLL_THRESHOLD: 400,
    STATE_RESTORE_DELAY: 100,
    SCROLL_SAVE_DEBOUNCE: 200
  };
  
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
  const [filterConnected, setFilterConnected] = useState(false);
  // ⭐ ФІЛЬТРИ АДРЕСИ: будинок і квартира
  const [filterBuilding, setFilterBuilding] = useState('');
  const [filterApartment, setFilterApartment] = useState('');
  // ⭐ Dropdown швидких дій
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showImportUrlModal, setShowImportUrlModal] = useState(false);
  
  // DEBUG: Логування стану модалки
  useEffect(() => {
    console.log('🟣 showImportUrlModal changed:', showImportUrlModal);
  }, [showImportUrlModal]);
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
  const [grsList, setGrsList] = useState([]);
  
  // ⭐ Лічильники для статусів
  const [statusCounts, setStatusCounts] = useState({ disconnected: 0, dacha: 0, absent: 0 });
  
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
  const buildingTimeoutRef = useRef(null);
  const [debouncedBuilding, setDebouncedBuilding] = useState('');
  const apartmentTimeoutRef = useRef(null);
  const [debouncedApartment, setDebouncedApartment] = useState('');
  
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
      document.documentElement.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = '';
    };
  }, [isModalOpen]);

  

  const [formData, setFormData] = useState({
    fullName: '', settlement: '', streetType: '', street: '', building: '', buildingLetter: '',
    apartment: '', apartmentLetter: '', accountNumber: '', eic: '', phone: '',
    meterBrand: '', meterSize: '', meterNumber: '', meterYear: '', verificationDate: '',
    nextVerificationDate: '', installationDate: '', meterLocation: '', meterGroup: '', 
    meterSubtype: '', meterOwnership: '', serviceOrg: '', mvnssh: '', 
    rsp: '', seal: '', stickerSeal: '', meterManufacturer: '',
    boilerBrand: '', boilerPower: '', stoveType: '', stoveCount: '', columnType: '', columnCount: '',
    area: '', utilityType: '', utilityGroup: '', grs: '',
    gasDisconnected: false, disconnectMethod: '', disconnectSeal: '', disconnectDate: '',
    connectDate: '', dacha: false, temporaryAbsent: false
  });

  // useEffect для debounce пошуку
  useEffect(() => {
    // Очищуємо попередній таймер
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Встановлюємо новий таймер
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, CONFIG.DEBOUNCE_DELAY);

    // Cleanup функція
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Debounce для будинку
  useEffect(() => {
    if (buildingTimeoutRef.current) clearTimeout(buildingTimeoutRef.current);
    buildingTimeoutRef.current = setTimeout(() => {
      setDebouncedBuilding(filterBuilding);
    }, CONFIG.DEBOUNCE_DELAY);
    return () => clearTimeout(buildingTimeoutRef.current);
  }, [filterBuilding]);

  // Debounce для квартири
  useEffect(() => {
    if (apartmentTimeoutRef.current) clearTimeout(apartmentTimeoutRef.current);
    apartmentTimeoutRef.current = setTimeout(() => {
      setDebouncedApartment(filterApartment);
    }, CONFIG.DEBOUNCE_DELAY);
    return () => clearTimeout(apartmentTimeoutRef.current);
  }, [filterApartment]);

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
        filterDisconnected || filterDacha || filterAbsent || filterConnected || debouncedBuilding || debouncedApartment) {
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
  }, [debouncedSearchTerm, selectedSettlement, selectedStreet, selectedMeterBrand, selectedMeterSize, selectedMeterYear, selectedMeterGroups, filterDisconnected, filterDacha, filterAbsent, filterConnected, debouncedBuilding, debouncedApartment]);

  // Динамічне оновлення фільтрів — каскадна логіка
  useEffect(() => {
    const updateDynamicFilters = async () => {
      const allClients = await getAllClients();

    const uniqueGrs = [...new Set(allClients.map(c => c.grs).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'uk', { sensitivity: 'base' }));
    setGrsList(uniqueGrs);


      // Базовий фільтр по адресі
      let byAddress = allClients;
      if (selectedSettlement.length > 0) {
        byAddress = byAddress.filter(c => selectedSettlement.includes(c.settlement));
      }
      if (selectedStreet.length > 0) {
        byAddress = byAddress.filter(c => {
          const clientStreetName = [c.streetType, c.street].filter(s => s).join(' ');
          return selectedStreet.includes(clientStreetName);
        });
      }

      // Вулиці — тільки по населеному пункту
      let clientsForStreets = allClients;
      if (selectedSettlement.length > 0) {
        clientsForStreets = allClients.filter(c => selectedSettlement.includes(c.settlement));
      }
      const uniqueStreets = [...new Set(clientsForStreets.map(c =>
        [c.streetType, c.street].filter(s => s).join(' ')
      ).filter(s => s))].sort((a, b) => a.localeCompare(b, 'uk', { sensitivity: 'base' }));
      setStreets(uniqueStreets);

      // ⭐ КАСКАД лічильників: адреса → група → марка → типорозмір → рік

      // Групи — по адресі
      const uniqueGroups = [...new Set(byAddress.map(c => c.meterGroup).filter(g => g))]
        .sort((a, b) => a.localeCompare(b, 'uk', { sensitivity: 'base' }));
      setMeterGroups(uniqueGroups);

      // Марки — по адресі + обрана група
      let byGroup = byAddress;
      if (selectedMeterGroups.length > 0) {
        byGroup = byGroup.filter(c => selectedMeterGroups.includes(c.meterGroup));
      }
      const uniqueBrands = [...new Set(byGroup.map(c => c.meterBrand).filter(b => b))]
        .sort((a, b) => a.localeCompare(b, 'uk', { sensitivity: 'base' }));
      setMeterBrands(uniqueBrands);

      // Типорозміри — по адресі + група + марка
      let byBrand = byGroup;
      if (selectedMeterBrand.length > 0) {
        byBrand = byBrand.filter(c => selectedMeterBrand.includes(c.meterBrand));
      }
      const uniqueSizes = [...new Set(byBrand.map(c => c.meterSize).filter(s => s))]
        .sort((a, b) => a.localeCompare(b, 'uk', { numeric: true, sensitivity: 'base' }));
      setMeterSizes(uniqueSizes);

      // Роки — по адресі + група + марка + типорозмір
      let bySize = byBrand;
      if (selectedMeterSize.length > 0) {
        bySize = bySize.filter(c => selectedMeterSize.includes(c.meterSize));
      }
      const uniqueYears = [...new Set(bySize.map(c => c.meterYear).filter(y => y))]
        .sort((a, b) => a - b);
      setMeterYears(uniqueYears);
    };

    updateDynamicFilters();
  }, [selectedSettlement, selectedStreet, selectedMeterGroups, selectedMeterBrand, selectedMeterSize]);

  // ⭐ INFINITE SCROLL: Слухач скролу
  useEffect(() => {
    let scrollSaveTimeout = null; // ⭐ Локальна змінна для очищення
    
    const handleScroll = () => {
      // ⭐ INFINITE SCROLL працює ЗАВЖДИ (і з фільтрами, і без!)
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Якщо до кінця залишилось менше SCROLL_THRESHOLD і є ще дані - завантажуємо
      if (scrollTop + windowHeight >= documentHeight - CONFIG.SCROLL_THRESHOLD && hasMore && !isLoadingMore) {
        setCurrentPage(prev => prev + 1);
      }

      // Зберігаємо позицію скролу (з debounce)
      if (scrollSaveTimeout) clearTimeout(scrollSaveTimeout);
      scrollSaveTimeout = setTimeout(() => {
        saveScrollState();
      }, CONFIG.SCROLL_SAVE_DEBOUNCE);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollSaveTimeout) clearTimeout(scrollSaveTimeout); // ⭐ Очищаємо при unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isLoadingMore]);

  // ⭐ INFINITE SCROLL: Завантаження при зміні currentPage
  useEffect(() => {
    if (currentPage > 0) {
      // Перевіряємо чи є фільтри
      const hasFilters = debouncedSearchTerm || selectedSettlement.length > 0 || selectedStreet.length > 0 || 
                        selectedMeterBrand.length > 0 || selectedMeterSize.length > 0 || 
                        selectedMeterYear.length > 0 || selectedMeterGroups.length > 0 ||
                        filterDisconnected || filterDacha || filterAbsent || filterConnected || debouncedBuilding || debouncedApartment;
      
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
      // ⭐ Перевіряємо чи це повне перезавантаження (F5)
      const isPageReload = !sessionStorage.getItem('app_initialized');
      
      // Завантажуємо фільтри завжди
      await loadTotalCount();
      loadSettlements();
      loadStreets();
      loadMeterData();
      loadStatusCounts(); // ⭐ Завантажуємо лічильники статусів
      
      if (isPageReload) {
        // ⭐ При F5: зберігаємо тільки позицію скролу, але скидаємо клієнтів
        const savedScrollY = sessionStorage.getItem(STORAGE_KEYS.SCROLL_Y);
        
        // Очищаємо клієнтів і сторінки
        sessionStorage.removeItem(STORAGE_KEYS.CLIENTS);
        sessionStorage.removeItem(STORAGE_KEYS.PAGE);
        sessionStorage.removeItem(STORAGE_KEYS.HAS_MORE);
        sessionStorage.removeItem(STORAGE_KEYS.FILTERED_TOTAL);
        
        // Завантажуємо перших клієнтів
        await loadClients();
        
        // Відновлюємо тільки скрол
        if (savedScrollY) {
          setTimeout(() => {
            window.scrollTo(0, parseInt(savedScrollY));
          }, CONFIG.STATE_RESTORE_DELAY);
        }
        
        sessionStorage.setItem('app_initialized', 'true');
      } else {
        // ⭐ При переключенні вкладок: повне відновлення
        const restored = restoreScrollState();
        if (!restored) {
          await loadClients();
        }
      }
      
      // ⭐ Завершили початкове завантаження
      setIsInitialLoading(false);
      
      // ⭐ Дозволяємо useEffect з фільтрами спрацьовувати тільки ПІСЛЯ всього завантаження
      setTimeout(() => {
        isFirstRender.current = false;
      }, CONFIG.STATE_RESTORE_DELAY);
    };
    
    initializeApp();
    
    // ⭐ Очищуємо прапорець при закритті вкладки
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('app_initialized');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ⭐ Закриття dropdown швидких дій при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (event) => {
      const quickActionsButton = event.target.closest('button[title="Швидкі дії"]');
      const quickActionsMenu = event.target.closest('.absolute.right-0.mt-2.w-80');
      
      console.log('🟠 showQuickActions mousedown:', {
        hasButton: !!quickActionsButton,
        hasMenu: !!quickActionsMenu,
        target: event.target.tagName,
        className: event.target.className
      });
      
      // НЕ закривати якщо клік всередині меню
      if (showQuickActions && !quickActionsButton && !quickActionsMenu) {
        console.log('🔴 Closing showQuickActions');
        setShowQuickActions(false);
      }
    };

    if (showQuickActions) {
      console.log('✅ showQuickActions listener added');
      // Використовуємо затримку як у dropdown
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 150);
      return () => {
        clearTimeout(timer);
        console.log('🧹 showQuickActions listener removed');
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showQuickActions]);

  // ⭐ Оновлюємо лічильники статусів при зміні фільтрів
  useEffect(() => {
    if (!isFirstRender.current) {
      loadStatusCounts();
    }
  }, [selectedSettlement, selectedStreet, selectedMeterGroups, selectedMeterBrand, selectedMeterSize, selectedMeterYear]);


  const loadClients = async (append = false) => {
    // ⭐ INFINITE SCROLL: Якщо вже завантажуємо або немає більше - виходимо
    if (isLoadingMore || (!append && loading)) return;
    
    if (append) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const data = await getClientsByPage(currentPage, CONFIG.PAGE_SIZE);
      
      if (append) {
        // ⭐ INFINITE SCROLL: Додаємо до існуючих
        setClients(prev => [...prev, ...data]);
      } else {
        // Звичайне завантаження
        setClients(data);
      }
      
      // Перевіряємо чи є ще дані
      setHasMore(data.length === CONFIG.PAGE_SIZE);
      
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
  
  // ⭐ Підрахунок клієнтів за статусами (враховує фільтри!)
  const loadStatusCounts = async () => {
    const allClients = await getAllClients();
    
    // Фільтруємо клієнтів за поточними фільтрами
    const filteredClients = allClients.filter(client => {
      // Фільтр по населеному пункту
      const matchesSettlement = selectedSettlement.length === 0 || selectedSettlement.includes(client.settlement);
      
      // Фільтр по вулиці
      const matchesStreet = selectedStreet.length === 0 || selectedStreet.includes(client.street);
      
      // Фільтр по групі лічильника
      const matchesMeterGroup = selectedMeterGroups.length === 0 || selectedMeterGroups.includes(client.meterGroup);
      
      // Фільтр по марці лічильника
      const matchesMeterBrand = selectedMeterBrand.length === 0 || selectedMeterBrand.includes(client.meterBrand);
      
      // Фільтр по розміру лічильника
      const matchesMeterSize = selectedMeterSize.length === 0 || selectedMeterSize.includes(client.meterSize);
      
      // Фільтр по року лічильника
      const matchesMeterYear = selectedMeterYear.length === 0 || selectedMeterYear.includes(client.meterYear);
      
      return matchesSettlement && matchesStreet && matchesMeterGroup && matchesMeterBrand && matchesMeterSize && matchesMeterYear;
    });
    
    // Рахуємо клієнтів з кожним статусом серед відфільтрованих
    const counts = {
      disconnected: filteredClients.filter(c => c.gasDisconnected === true).length,
      dacha: filteredClients.filter(c => c.dacha === true).length,
      absent: filteredClients.filter(c => c.temporaryAbsent === true).length
    };
    setStatusCounts(counts);
  };

  const loadSettlements = async () => {
    const allClients = await getAllClients();
    const uniqueSettlements = [...new Set(allClients.map(c => c.settlement).filter(s => s))].sort((a, b) => a.localeCompare(b, 'uk', { sensitivity: 'base' }));
    setSettlements(uniqueSettlements);
  };

  const loadStreets = async () => {
    const allClients = await getAllClients();
    const uniqueStreets = [...new Set(allClients.map(c => {
      const streetName = [c.streetType, c.street].filter(s => s).join(' ');
      return streetName;
    }).filter(s => s))].sort((a, b) => a.localeCompare(b, 'uk', { sensitivity: 'base' }));
    setStreets(uniqueStreets);
  };

  const loadMeterData = async () => {
    const allClients = await getAllClients();
    
    const uniqueBrands = [...new Set(allClients.map(c => c.meterBrand).filter(b => b))].sort((a, b) => a.localeCompare(b, 'uk', { sensitivity: 'base' }));
    setMeterBrands(uniqueBrands);
    
    const uniqueSizes = [...new Set(allClients.map(c => c.meterSize).filter(s => s))].sort((a, b) => a.localeCompare(b, 'uk', { numeric: true, sensitivity: 'base' }));
    setMeterSizes(uniqueSizes);
    
    const uniqueYears = [...new Set(allClients.map(c => c.meterYear).filter(y => y))].sort((a, b) => a - b);
    setMeterYears(uniqueYears);
    
    const uniqueGroups = [...new Set(allClients.map(c => c.meterGroup).filter(g => g))].sort((a, b) => a.localeCompare(b, 'uk', { sensitivity: 'base' }));
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
        }, CONFIG.STATE_RESTORE_DELAY);
        
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
        filterDisconnected, filterDacha, filterAbsent, filterConnected, debouncedBuilding, debouncedApartment,
        currentPage, CONFIG.PAGE_SIZE
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

  const handleAdd = () => {
    setEditingClient(null);
    setFormData({
      fullName: '', settlement: '', streetType: '', street: '', building: '', buildingLetter: '',
      apartment: '', apartmentLetter: '', accountNumber: '', eic: '', phone: '',
      meterBrand: '', meterSize: '', meterNumber: '', meterYear: '', verificationDate: '',
      nextVerificationDate: '', installationDate: '', meterLocation: '', meterGroup: '',
      meterSubtype: '', meterOwnership: '', serviceOrg: '', mvnssh: '',
      rsp: '', seal: '', stickerSeal: '', meterManufacturer: '',
      boilerBrand: '', boilerPower: '', stoveType: '', stoveCount: '', columnType: '', columnCount: '',
      area: '', utilityType: '', utilityGroup: '', grs: '',
      gasDisconnected: false, disconnectMethod: '', disconnectSeal: '', disconnectDate: '',
      connectDate: '', dacha: false, temporaryAbsent: false
    });
    setIsModalOpen(true);
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
      }
    );
  };

  // ⭐ Імпорт за URL (для слабких телефонів)
  const [importUrl, setImportUrl] = useState('');
  const [importingFromUrl, setImportingFromUrl] = useState(false);

  const handleImportFromURL = async () => {
    if (!importUrl.trim()) {
      showToast('warning', 'Введіть посилання на файл JSON');
      return;
    }
    
    setImportingFromUrl(true);
    setLoading(true);
    
    try {
      showToast('info', 'Завантаження файлу...', 2000);
      
      let finalUrl = importUrl.trim();
      
      // 🔥 АВТОМАТИЧНА КОНВЕРТАЦІЯ Google Drive URL
      if (finalUrl.includes('drive.google.com/file')) {
        const match = finalUrl.match(/\/d\/([^\/]+)/);
        if (match && match[1]) {
          const fileId = match[1];
          finalUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
          showToast('info', '🔄 Конвертую Google Drive URL...', 1000);
        }
      }
      
      // 🔥 АВТОМАТИЧНА КОНВЕРТАЦІЯ Dropbox URL
      if (finalUrl.includes('dropbox.com')) {
        finalUrl = finalUrl.replace('?dl=0', '?dl=1').replace('www.dropbox.com', 'dl.dropboxusercontent.com');
        showToast('info', '🔄 Конвертую Dropbox URL...', 1000);
      }
            
      console.log('🌐 Final URL:', finalUrl);
      
      // 🔥 Fetch БЕЗ Service Worker (обхід SW кешу)
      const response = await fetch(finalUrl, {
        method: 'GET',
        cache: 'no-store', // Обходимо Service Worker
        headers: {
          'Accept': 'application/json',
        }
      });
      
      console.log('✅ Response received:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Помилка завантаження: ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text();

// 🔒 обмеження розміру (~5MB)
if (text.length > 5 * 1024 * 1024) {
  throw new Error('Файл занадто великий');
}

let data;
try {
  data = JSON.parse(text);
} catch {
  throw new Error('Невалідний JSON');
}
      
      console.log('📦 Data loaded:', {
        isArray: Array.isArray(data),
        hasClients: !!data.clients,
        length: Array.isArray(data) ? data.length : (data.clients ? data.clients.length : 0),
        firstItem: Array.isArray(data) ? data[0] : (data.clients ? data.clients[0] : null)
      });
      
      // Перевірка формату
      if (!Array.isArray(data) && (!data || !Array.isArray(data.clients))) {
        console.error('❌ Invalid format:', data);
        throw new Error('Неправильний формат файлу. Очікується масив клієнтів або об\'єкт з полем "clients"');
      }
      
      const clients = Array.isArray(data) ? data : data.clients;
      
      console.log('👥 Clients to import:', clients.length);
      
      if (clients.length === 0) {
        throw new Error('Файл не містить клієнтів');
      }
      
      // Встановлюємо прогрес
      setImportProgress({ show: true, current: 0, total: clients.length, fileName: 'import-url.json' });
      
      // Очищаємо базу
      const db = await openDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      // Додаємо клієнтів
      let imported = 0;
for (let i = 0; i < clients.length; i++) {
  const c = clients[i];

  // 🔒 базова валідація
  if (!c || typeof c.fullName !== 'string' || typeof c.accountNumber !== 'string') {
    continue;
  }

  await addClient(c);
  imported++;
        // Оновлюємо прогрес кожні 50 записів або на останньому
        if ((i + 1) % 50 === 0 || i === clients.length - 1) {
          setImportProgress(prev => ({ ...prev, current: i + 1 }));
        }
      }
      
      // Оновлюємо дані
      await loadClients();
      await loadTotalCount();
      await loadSettlements();
      await loadStreets();
      await loadMeterData();
      await loadStatusCounts();
      
      showToast('success', `✅ Імпортовано ${imported} клієнтів з посилання!`);
      setImportUrl(''); // Очищаємо поле
      
      // Закриваємо прогрес через 2 сек
      setTimeout(() => {
        setImportProgress({ show: false, current: 0, total: 0, fileName: '' });
      }, 2000);
      
    } catch (error) {
      console.error('Import from URL error:', error);
      showToast('error', `Помилка імпорту: ${error.message}`);
      setImportProgress({ show: false, current: 0, total: 0, fileName: '' });
    } finally {
      setImportingFromUrl(false);
      setLoading(false);
    }
  };

  // ⭐ ПАРСЕР ПРИЛАДІВ: розбирає текст типу "(Котел) АОГВ-16 - 1шт.; (Плита газова) ПГ-4 - 1шт.;"
  const parseAppliances = (text) => {
    const result = {
      boilerBrand: '',
      boilerPower: '',
      stoveType: '',
      stoveCount: '',
      columnType: '',
      columnCount: ''
    };

    if (!text || typeof text !== 'string') return result;

    // Розбиваємо на окремі прилади
    const items = text.split(';').map(s => s.trim()).filter(s => s);

    const boilers = [];
    const stoves = [];
    const columns = [];

    items.forEach(item => {
      // Котел: (Котел) АОГВ-16 - 1шт.
      if (item.includes('(Котел)') || item.includes('(котел)')) {
        const match = item.match(/\((?:Котел|котел)\)\s*(.+?)(?:\s*-\s*\d+\s*шт\.?)?$/i);
        if (match && match[1]) {
          const boilerInfo = match[1].trim();
          // Витягуємо потужність якщо є
          const powerMatch = boilerInfo.match(/(\d+(?:[.,]\d+)?)\s*(?:кВт|квт|С|с)?/i);
          
          boilers.push({
            name: boilerInfo,
            power: powerMatch ? powerMatch[1].replace(',', '.') : ''
          });
        }
      }
      
      // Плита: (Плита газова) ПГ-4 - 1шт.
      if (item.includes('(Плита') || item.includes('(плита)') || item.includes('ПГ')) {
        const match = item.match(/\((?:Плита.*?|плита.*?)\)\s*(.+?)(?:\s*-\s*(\d+)\s*шт\.?)?$/i);
        if (match && match[1]) {
          const count = match[2] ? parseInt(match[2]) : 1;
          for (let i = 0; i < count; i++) {
            stoves.push(match[1].trim());
          }
        } else {
          // Якщо формат інший, пробуємо знайти ПГ-X
          const pgMatch = item.match(/ПГ[- ]?(\d+)/i);
          if (pgMatch) {
            stoves.push('ПГ-' + pgMatch[1]);
          }
        }
      }
      
      // ВПГ/Колонка: (Колонка) КГІ - 1шт.
      if (item.includes('(Колонка)') || item.includes('(колонка)') || item.includes('(ВПГ)') || item.includes('(впг)')) {
        const match = item.match(/\((?:Колонка|колонка|ВПГ|впг)\)\s*(.+?)(?:\s*-\s*(\d+)\s*шт\.?)?$/i);
        if (match && match[1]) {
          const count = match[2] ? parseInt(match[2]) : 1;
          for (let i = 0; i < count; i++) {
            columns.push(match[1].trim());
          }
        }
      }
    });

    // Об'єднуємо котли (якщо кілька)
    if (boilers.length > 0) {
      result.boilerBrand = boilers.map(b => b.name).join('; ');
      // Потужність беремо з першого котла
      result.boilerPower = boilers[0].power;
    }

    // Об'єднуємо плити
    if (stoves.length > 0) {
      // Групуємо однакові плити
      const stoveCounts = {};
      stoves.forEach(s => {
        stoveCounts[s] = (stoveCounts[s] || 0) + 1;
      });
      
      // Формуємо рядок з кількістю для кожного типу
      const uniqueStoves = Object.keys(stoveCounts);
      result.stoveType = uniqueStoves.map(s => 
        stoveCounts[s] > 1 ? `${s} (${stoveCounts[s]}шт)` : s
      ).join(', ');
      result.stoveCount = stoves.length.toString();
    }

    // Об'єднуємо колонки
    if (columns.length > 0) {
      const columnCounts = {};
      columns.forEach(c => {
        columnCounts[c] = (columnCounts[c] || 0) + 1;
      });
      
      const uniqueColumns = Object.keys(columnCounts);
      result.columnType = uniqueColumns.map(c => 
        columnCounts[c] > 1 ? `${c} (${columnCounts[c]}шт)` : c
      ).join(', ');
      result.columnCount = columns.length.toString();
    }

    return result;
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    // ⭐ НЕ показуємо модалку одразу - спочатку парсимо файл!
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // ⭐ ТЕПЕР показуємо модалку - коли вже знаємо total!
        setImportProgress({ show: true, current: 0, total: jsonData.length, fileName: file.name });
        
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
            meterOwnership: (row['Належність'] || '').toString().trim(),
            serviceOrg: (row['Серв.орган.'] || '').toString().trim(),
            mvnssh: (row['МВНСШ'] || '').toString().trim(),
            rsp: (row['РСП'] || '').toString().trim(),
            seal: (row['Пломба'] || '').toString().trim(),
            stickerSeal: (row['Стікерна пломба'] || '').toString().trim(),
            meterManufacturer: (row['Завод виробник'] || '').toString().trim(),
            // ⚠️ НЕ читаємо окремі стовпці приладів - вони будуть заповнені парсером нижче
            boilerBrand: '',
            boilerPower: '',
            stoveType: '',
            stoveCount: '',
            columnType: '',
            columnCount: '',
            area: (row['Площа'] || '').toString().trim(),
            utilityType: (row['Комун. гос-во'] || '').toString().trim(),
            utilityGroup: (row['Група'] || '').toString().trim(),
            grs: (row['ГРС'] || '').toString().trim(),
            gasDisconnected: (row['Газ вимкнено'] === 'Так' || row['Газ вимкнено'] === true),
            disconnectMethod: (row['Метод відключення'] || '').toString().trim(),
            disconnectSeal: (row['Пломба відкл.'] || '').toString().trim(),
            disconnectDate: (row['Дата відкл.'] || '').toString().trim(),
            connectDate: (row['Дата підкл.'] || '').toString().trim(),
            dacha: row['Дача'] === 'Так' || row['Дача'] === true,
            temporaryAbsent: row['Тимчасово відсутній'] === 'Так' || row['Тимчасово відсутній'] === true
          };
          
          // ⭐ АВТОПАРСИНГ: Якщо є стовпець "Прилади" - парсимо його
          const appliancesText = row['Прилади'] || row['прилади'] || row['Обладнання'] || row['обладнання'] || '';
          if (appliancesText && appliancesText.toString().trim()) {
            const parsed = parseAppliances(appliancesText.toString());
            // Заповнюємо з парсера
            client.boilerBrand = parsed.boilerBrand;
            client.boilerPower = parsed.boilerPower;
            client.stoveType = parsed.stoveType;
            client.stoveCount = parsed.stoveCount;
            client.columnType = parsed.columnType;
            client.columnCount = parsed.columnCount;
          } else {
            // Якщо немає стовпця "Прилади" - читаємо з окремих стовпців (для сумісності зі старим шаблоном)
            client.boilerBrand = (row['Котел марка'] || '').toString().trim();
            client.boilerPower = (row['Котел потужність'] || '').toString().trim();
            client.stoveType = (row['Газова плита тип'] || '').toString().trim();
            client.stoveCount = (row['Кількість плит'] || '').toString().trim();
            client.columnType = (row['ВПГ тип'] || '').toString().trim();
            client.columnCount = (row['Кількість ВПГ'] || '').toString().trim();
          }
          
          await addClient(client);
          imported++;
          
          // Оновлюємо прогрес кожні 50 записів або на останньому
          if ((i + 1) % 50 === 0 || i === jsonData.length - 1) {
            setImportProgress(prev => ({ ...prev, current: i + 1 }));
          }
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

  // ⭐ ФОРМАТУВАННЯ ПРИЛАДІВ для експорту: об'єднує окремі поля назад в текст
  const formatAppliances = (client) => {
    const parts = [];
    
    if (client.boilerBrand) {
      const power = client.boilerPower ? ` ${client.boilerPower}` : '';
      parts.push(`(Котел) ${client.boilerBrand}${power} - 1шт.`);
    }
    
    if (client.stoveType) {
      // Якщо в назві вже є кількість - використовуємо як є
      if (client.stoveType.includes('(') && client.stoveType.includes('шт)')) {
        parts.push(`(Плита газова) ${client.stoveType};`);
      } else {
        const count = client.stoveCount || '1';
        parts.push(`(Плита газова) ${client.stoveType} - ${count}шт.`);
      }
    }
    
    if (client.columnType) {
      const count = client.columnCount || '1';
      parts.push(`(ВПГ) ${client.columnType} - ${count}шт.`);
    }
    
    return parts.join(' ');
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
        'Група ліч.': c.meterGroup, 'Підтип': c.meterSubtype,
        'Належність': c.meterOwnership, 'Серв.орган.': c.serviceOrg, 'МВНСШ': c.mvnssh,
        'РСП': c.rsp, 'Пломба': c.seal, 'Стікерна пломба': c.stickerSeal, 'Завод виробник': c.meterManufacturer,
        'Прилади': formatAppliances(c),
        'Площа': c.area, 'Комун. гос-во': c.utilityType, 'Група': c.utilityGroup, 'ГРС': c.grs,
        'Газ вимкнено': c.gasDisconnected ? 'Так' : 'Ні', 'Метод відключення': c.disconnectMethod,
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

  // ⭐ Експорт в JSON (для імпорту за URL)
  const handleExportJSON = async () => {
    setLoading(true);
    showToast('info', 'Експорт в JSON...', 2000);
    
    try {
      const allClients = await getAllClients();
      
      if (allClients.length === 0) {
        showToast('warning', 'Немає клієнтів для експорту');
        setLoading(false);
        return;
      }
      
      // 🔥 Очищаємо від службових полів IndexedDB (id, createdAt, etc)
      const cleanClients = allClients.map(client => {
        const { id, ...cleanData } = client; // Видаляємо id
        return cleanData;
      });
      
      // Створюємо JSON з форматуванням
      const jsonData = JSON.stringify(cleanClients, null, 2);
      
      // Створюємо і завантажуємо файл
      const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clients_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast('success', `✅ JSON експортовано! (${allClients.length} клієнтів)`);
    } catch (error) {
      console.error('JSON export error:', error);
      showToast('error', 'Помилка при експорті JSON');
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
      'Прилади': '(Котел) Ariston 24 - 1шт.; (Плита газова) ПГ-4 - 1шт.; (ВПГ) ВПГ-10 - 1шт.;',
      'Площа': '65.5', 'Комун. гос-во': 'Квартира', 'Група': 'Багатоквартирний', 'ГРС': 'ГРС-1',
      'Газ вимкнено': 'Ні', 'Метод відключення': '', 'Пломба відкл.': '',
      'Дата відкл.': '', 'Дата підкл.': '', 'Дача': 'Ні', 'Тимчасово відсутній': 'Ні'
    }];
    const ws = XLSX.utils.json_to_sheet(template);
    ws['!cols'] = Array(41).fill({ wch: 15 }); // Зменшено з 45 до 41 (видалено 5 стовпців, додано 1)
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
      meterSubtype: '', meterOwnership: '', serviceOrg: '', mvnssh: '', 
      rsp: '', seal: '', stickerSeal: '', meterManufacturer: '',
      boilerBrand: '', boilerPower: '', stoveType: '', stoveCount: '', columnType: '', columnCount: '',
      area: '', utilityType: '', utilityGroup: '', grs: '',
      gasDisconnected: false, disconnectMethod: '', disconnectSeal: '', disconnectDate: '',
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

  // Компонент MultiSelectDropdown - обгорнутий в React.memo для оптимізації
  const MultiSelectDropdown = React.memo(({ options, selected, onChange, label, name }) => {
    const isOpen = openDropdown === name;
    const dropdownRef = useRef(null);

    useEffect(() => {
      if (!isOpen) return;
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setOpenDropdown(null);
        }
      };
      const timer = setTimeout(() => { document.addEventListener('mousedown', handleClickOutside); }, 150);
      return () => { clearTimeout(timer); document.removeEventListener('mousedown', handleClickOutside); };
    }, [isOpen, name]);

    const toggleOption = useCallback((option) => {
      toggleSelection(selected, onChange, option);
    }, [selected, onChange, name]);

    const labelText = selected.length === 0 ? label
      : selected.length === 1 ? selected[0]
      : `${label} (${selected.length})`;

    return (
      <div className="dropdown-wrap" ref={dropdownRef}>
        <button
          type="button"
          className={"dropdown-btn" + (selected.length > 0 ? " active" : "")}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenDropdown(isOpen ? null : name); }}>
          <span className="dropdown-btn-label">{labelText}</span>
          <ChevronDown size={11} style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
        </button>
        {isOpen && (
          <div className="dropdown-menu">
            {options.length === 0 ? (
              <div className="dropdown-empty">Немає опцій</div>
            ) : (
              <>
                {selected.length > 0 && (
                  <div className="dropdown-reset"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange([]); }}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                    × Скинути
                  </div>
                )}
                {options.map(option => (
                  <div key={option}
                    className={"dropdown-option" + (selected.includes(option) ? " selected" : "")}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleOption(option); }}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                    <div className={"dropdown-checkbox" + (selected.includes(option) ? " checked" : "")}>
                      {selected.includes(option) && (
                        <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="dropdown-option-label">{option}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    );
  });

  return (
    <div className="app-wrapper">
      {/* IMPORT PROGRESS MODAL */}
      {importProgress.show && (
        <div className="import-progress-overlay">
          <div className="import-progress-card">
            <div className="import-spinner-wrap">
              <div className="import-spinner-ring">
                <div className="import-spinner-bg"></div>
                <div className="import-spinner-anim"></div>
                <div className="import-spinner-icon">
                  <Upload size={32} />
                </div>
              </div>
            </div>
            <h3 className="import-title">Імпорт даних</h3>
            <p className="import-filename">{importProgress.fileName}</p>
            <div className="import-progress-bar-wrap">
              <div className="import-progress-header">
                <span>Оброблено записів</span>
                <span>{importProgress.current} / {importProgress.total}</span>
              </div>
              <div className="import-progress-track">
                <div className="import-progress-fill"
                  style={{ width: `${importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0}%` }}>
                </div>
              </div>
              <div className="import-percent">
                {importProgress.total > 0 ? Math.round((importProgress.current / importProgress.total) * 100) : 0}%
              </div>
            </div>
            <p className="import-hint">⏳ Будь ласка, зачекайте. Не закривайте вікно.</p>
          </div>
        </div>
      )}

      <div className="app-container">

        {/* ===== NAVBAR ===== */}
        <div className="navbar">
          <div className="navbar-inner">
            <div className="navbar-logo">
              <div className="navbar-logo-icon"><Database size={14} /></div>
              <span className="navbar-title">Абоненти газу</span>
            </div>
            <div className="navbar-stats">
              <span className="stat-badge">Всього: <b>{totalCount}</b></span>
              <span className="stat-badge-danger">Відключених: <b>{statusCounts.disconnected}</b></span>
            </div>
            <div className="navbar-actions">
              <button className="btn" onClick={() => setShowImportUrlModal(true)}><Upload size={13} /> Імпорт JSON</button>
              <label  className="btn" onMouseDown={(e) => {e.stopPropagation();}}><Upload size={13} />Імпорт XLS
              <input type="file" accept=".xlsx,.xls" onChange={(e) => { handleImportExcel(e); setShowQuickActions(false); }} className="hidden" disabled={loading} />
              </label>
              <button className="btn" onClick={handleExportJSON}><Download size={13} /> JSON</button>
              <button className="btn" onClick={handleExportExcel}><Download size={13} />Експорт Excel</button>
              <button onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDownloadTemplate(); 
                setShowQuickActions(false); 
                }}
                onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                }}
                className="btn"><FileText size={13} />Шаблон XLS</button>
              <button className="btn-primary" onClick={handleAdd}><Plus size={13} /> Новий</button>
            </div>
          </div>

          {/* ===== ФІЛЬТРИ ===== */}
          <div className="filters-panel">

            {/* Пошук */}
            <div className="search-box">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Пошук: ПІБ, рахунок, телефон, № лічильника..."
              />
              {searchTerm && (
                <button className="search-clear" onClick={() => setSearchTerm('')}><X size={14} /></button>
              )}
            </div>

            {/* Адреса + лічильник */}
            <div className="filter-row">
              <MultiSelectDropdown options={settlements} selected={selectedSettlement} onChange={setSelectedSettlement} label="Нас. пункт" name="settlement" />
              <MultiSelectDropdown options={streets} selected={selectedStreet} onChange={setSelectedStreet} label="Вулиця" name="street" />
              <input className="filter-input-small" type="text" value={filterBuilding} onChange={e => setFilterBuilding(e.target.value)} placeholder="Буд." />
              <input className="filter-input-small" type="text" value={filterApartment} onChange={e => setFilterApartment(e.target.value)} placeholder="Кв." />
              <div className="filter-divider" />
              <MultiSelectDropdown options={meterGroups} selected={selectedMeterGroups} onChange={setSelectedMeterGroups} label="Група ліч." name="meterGroup" />
              <MultiSelectDropdown options={meterBrands} selected={selectedMeterBrand} onChange={setSelectedMeterBrand} label="Марка" name="meterBrand" />
              <MultiSelectDropdown options={meterSizes} selected={selectedMeterSize} onChange={setSelectedMeterSize} label="Типорозмір" name="meterSize" />
              <MultiSelectDropdown options={meterYears} selected={selectedMeterYear} onChange={setSelectedMeterYear} label="Рік" name="meterYear" />
            </div>

            {/* Статуси */}
            <div className="status-row">
              <span className="status-label">Статус:</span>
              <button
                className={"status-chip status-chip-off" + (filterDisconnected ? " active" : "")}
                onClick={() => setFilterDisconnected(!filterDisconnected)}>
                <span className="status-chip-dot"></span>
                Відключений {statusCounts.disconnected > 0 && <span className="status-count">({statusCounts.disconnected})</span>}
              </button>
              <button
                className={"status-chip status-chip-dacha" + (filterDacha ? " active" : "")}
                onClick={() => setFilterDacha(!filterDacha)}>
                <span className="status-chip-dot"></span>
                Дача {statusCounts.dacha > 0 && <span className="status-count">({statusCounts.dacha})</span>}
              </button>
              <button
                className={"status-chip status-chip-absent" + (filterAbsent ? " active" : "")}
                onClick={() => setFilterAbsent(!filterAbsent)}>
                <span className="status-chip-dot"></span>
                Не проживає {statusCounts.absent > 0 && <span className="status-count">({statusCounts.absent})</span>}
              </button>
              <button
                className={"status-chip status-chip-gas" + (filterConnected ? " active" : "")}
                onClick={() => setFilterConnected(!filterConnected)}>
                <span className="status-chip-dot"></span>
                Газ включений
              </button>
              {(searchTerm || selectedSettlement.length > 0 || selectedStreet.length > 0 ||
                selectedMeterBrand.length > 0 || selectedMeterSize.length > 0 || selectedMeterYear.length > 0 ||
                selectedMeterGroups.length > 0 || filterDisconnected || filterDacha || filterAbsent ||
                filterConnected || filterBuilding || filterApartment) && (
                <button className="btn-reset" onClick={() => {
                  setSearchTerm(''); setDebouncedSearchTerm('');
                  setSelectedSettlement([]); setSelectedStreet([]);
                  setSelectedMeterBrand([]); setSelectedMeterSize([]);
                  setSelectedMeterYear([]); setSelectedMeterGroups([]);
                  setFilterDisconnected(false); setFilterDacha(false);
                  setFilterAbsent(false); setFilterConnected(false);
                  setFilterBuilding(''); setFilterApartment('');
                  setDebouncedBuilding(''); setDebouncedApartment('');
                  setCurrentPage(0); setHasMore(true);
                  clearScrollState(); loadClients();
                }}><X size={11} /> Скинути</button>
              )}
            </div>
          </div>

          {/* Рядок результатів */}
          <div className="results-bar">
            <div className="results-bar-text">
              <div class="results-bar-items">
              {(debouncedSearchTerm || selectedSettlement.length > 0 || selectedStreet.length > 0 ||
                selectedMeterBrand.length > 0 || selectedMeterSize.length > 0 || selectedMeterYear.length > 0 ||
                selectedMeterGroups.length > 0 || filterDisconnected || filterDacha || filterAbsent ||
                filterConnected || filterBuilding || filterApartment)
                ? <><div class="results-bar-item"><Users size={14} className="ii-icon" /> Всього: <span>{totalCount}</span></div><div class="results-bar-divider"></div><div class="results-bar-item found"><Search size={14} className="ii-icon" /> Знайдено: <span>{filteredTotalCount}</span></div></>
                : <><div class="results-bar-item"><Users size={14} className="ii-icon" /> Всього: <span>{totalCount}</span></div></>
              }
              </div>
            </div>
            {/* <span className="results-bar-hint">↓ scroll для завантаження</span> */}
          </div>
        </div>

        {/* ===== СПИСОК КЛІЄНТІВ ===== */}
        <div className="clients-list">
          {isInitialLoading ? (
            <div className="skeleton-list">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-row">
                    <div className="skeleton-dot"></div>
                    <div className="skeleton-body">
                      <div className="skeleton-line" style={{height:14, width:180}}></div>
                      <div className="skeleton-line-dark" style={{height:10, width:120}}></div>
                      <div className="skeleton-line-dark" style={{height:10, width:220}}></div>
                      <div className="skeleton-line-dark" style={{height:10, width:160}}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="clients-inner">
              {clients.map(c => {
                const dotClass = c.gasDisconnected === true ? 'dot-red' :
                                 c.temporaryAbsent ? 'dot-amber' :
                                 c.dacha ? 'dot-purple' : 'dot-green';
                return (
                  <div key={c.id} className="client-card">

                    {/* КОРОТКА КАРТКА */}
                    <div className="client-card-short">
                      <div className="client-card-body">
                        <div className="client-card-left">
                          <div className="client-name-row">
                            <span className={"client-status-dot " + dotClass}></span>
                            <span className="client-name">{c.fullName}</span>
                            {c.gasDisconnected && <span className="badge badge-red">× Відключений</span>}
                            {c.dacha && <span className="badge badge-purple">⌂ Дача</span>}
                            {c.temporaryAbsent && <span className="badge badge-amber">× Не проживає</span>}
                          </div>
                          <div className="client-account">
                            о/р: {c.accountNumber}{c.eic ? ` · EIC: ${c.eic}` : ''}
                          </div>
                          <div className="client-meta">
                            {(c.settlement || c.street) && (
                              <div className="client-meta-row">
                                <div className="meta-icon"><MapPin size={11} /></div>
                                <span>
                                  {c.settlement}{c.street ? `, ${[c.streetType, c.street].filter(Boolean).join(' ')}` : ''}
                                  {c.building ? `, буд. ${c.building}${c.buildingLetter || ''}` : ''}
                                  {c.apartment ? `, кв. ${c.apartment}${c.apartmentLetter || ''}` : ''}
                                </span>
                              </div>
                            )}
                            {c.phone && (
                              <div className="client-meta-row">
                                <div className="meta-icon"><Phone size={11} /></div>
                                <span>{formatPhones(c.phone)}</span>
                              </div>
                            )}
                          </div>
                          {c.meterNumber && (
                            <div className="client-meter-row">
                              <Activity size={11} />
                              {c.meterBrand && <span className="meter-tag">{c.meterBrand}
                                 {/* { {c.meterSize ? ` ${c.meterSize}` : ''} }*/ }
                                </span>}
                              <span className="meter-tag">№ {c.meterNumber}</span>
                              {c.meterYear && <span className="meter-tag">{c.meterYear} р.</span>}
                              {c.verificationDate && <span className="meter-tag">Повірка: {c.verificationDate}</span>}
                              {c.nextVerificationDate && (
                              <span className={`meter-tag ${c.nextVerificationDate.split('.').reverse().join('-') < new Date().toISOString().split('T')[0] ? 'meter-tag-expired' : ''}`}>
                                Наступна: {c.nextVerificationDate}
                              </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="client-card-actions">
                          <div className="action-btns">
                            <button className="btn-icon btn-icon-edit" onClick={e => { e.stopPropagation(); handleEdit(c); }}><Edit2 size={13} /></button>
                            <button className="btn-icon btn-icon-delete" onClick={e => { e.stopPropagation(); handleDelete(c.id); }}><Trash2 size={13} /></button>
                          </div>
                          <button className="btn-expand" onClick={() => handleClientCardClick(c.id)}>
                            {expandedClientId === c.id
                              ? <><ChevronUp size={11} /> Згорнути</>
                              : <><ChevronDown size={11} /> Повна картка</>}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* РОЗГОРНУТА КАРТКА */}
                    {expandedClientId === c.id && (
                      <div className="client-card-expanded">
                        <div className="expanded-section-title"><Activity size={11} /> Дані лічильника</div>
                        {c.meterNumber ? (
                          <div className="meter-chips">
                            {c.meterBrand && <div className="meter-chip"><span className="meter-chip-label">Марка</span><span className="meter-chip-value">{c.meterBrand}</span></div>}
                            {c.meterSize && <div className="meter-chip"><span className="meter-chip-label">Типорозмір</span><span className="meter-chip-value">{c.meterSize}</span></div>}
                            <div className="meter-chip"><span className="meter-chip-label">№</span><span className="meter-chip-value">{c.meterNumber}</span></div>
                            {c.meterYear && <div className="meter-chip"><span className="meter-chip-label">Рік</span><span className="meter-chip-value">{c.meterYear}</span></div>}
                            {c.verificationDate && <div className="meter-chip"><span className="meter-chip-label">Повірка</span><span className="meter-chip-value">{c.verificationDate}</span></div>}
                            {c.nextVerificationDate && <div className="meter-chip"><span className="meter-chip-label">Наступна</span><span className="meter-chip-value">{c.nextVerificationDate}</span></div>}
                            {c.installationDate && <div className="meter-chip"><span className="meter-chip-label">Встановлено</span><span className="meter-chip-value">{c.installationDate}</span></div>}
                            {c.meterLocation && <div className="meter-chip"><span className="meter-chip-label">Розташування</span><span className="meter-chip-value">{c.meterLocation}</span></div>}
                            {c.meterManufacturer && <div className="meter-chip"><span className="meter-chip-label">Завод</span><span className="meter-chip-value">{c.meterManufacturer}</span></div>}
                            {c.meterGroup && <div className="meter-chip"><span className="meter-chip-label">Група</span><span className="meter-chip-value">{c.meterGroup}</span></div>}
                            {c.meterSubtype && <div className="meter-chip"><span className="meter-chip-label">Підтип</span><span className="meter-chip-value">{c.meterSubtype}</span></div>}
                            {c.meterOwnership && <div className="meter-chip"><span className="meter-chip-label">Належність</span><span className="meter-chip-value">{c.meterOwnership}</span></div>}
                            {c.serviceOrg && <div className="meter-chip"><span className="meter-chip-label">Серв. орган</span><span className="meter-chip-value">{c.serviceOrg}</span></div>}
                            {(c.mvnssh || c.rsp) && <div className="meter-chip"><span className="meter-chip-label">МВНСШ/РСП</span><span className="meter-chip-value">{c.mvnssh}{c.rsp ? ' / ' + c.rsp : ''}</span></div>}
                            {c.seal && <div className="meter-chip"><span className="meter-chip-label">Пломба</span><span className="meter-chip-value">{c.seal}</span></div>}
                            {c.stickerSeal && <div className="meter-chip"><span className="meter-chip-label">Стікерна пломба</span><span className="meter-chip-value">{c.stickerSeal}</span></div>}
                          </div>
                        ) : <p style={{fontSize:12,color:'#9ca3af'}}>Немає даних про лічильник</p>}

                        {(c.boilerBrand || c.stoveType || c.columnType) && (
                          <div className="appliances-row">
                            <div className="appliances-label section-title"><Flame size={13}/> Прилади:</div>
                            {c.boilerBrand && <span className="appliance-pill"><Flame size={10} style={{color:'#f97316'}} /> {c.boilerBrand}</span>}
                            {c.stoveType && <span className="appliance-pill"><Flame size={10} style={{color:'#3b82f6'}} /> {c.stoveType}</span>}
                            {c.columnType && <span className="appliance-pill"><Flame size={10} style={{color:'#06b6d4'}} /> {c.columnType}</span>}
                          </div>
                        )}

                        {c.gasDisconnected && (
                          <div className="gas-off-block">
                            <p className="gas-off-title">⚠️ Газ відключено</p>
                            <div className="gas-off-details">
                              {c.disconnectDate && <span><b>Дата:</b> {c.disconnectDate}</span>}
                              {c.disconnectMethod && <span><b>Спосіб:</b> {c.disconnectMethod}</span>}
                              {c.disconnectSeal && <span><b>Пломба:</b> {c.disconnectSeal}</span>}
                              {c.connectDate && <span className="gas-on-date"><b>Підключено:</b> {c.connectDate}</span>}
                            </div>
                          </div>
                        )}

                        <div className="expanded-btns">
                          <button className="btn-edit-full" onClick={e => { e.stopPropagation(); handleEdit(c); }}><Edit2 size={12} /> Редагувати</button>
                          <button className="btn-delete-full" onClick={e => { e.stopPropagation(); handleDelete(c.id); }}><Trash2 size={12} /> Видалити</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoadingMore && (
                <div className="load-more-spinner">
                  <div className="spinner"></div>
                  <p className="load-more-text">Завантаження...</p>
                </div>
              )}

              {!hasMore && clients.length > 0 && (
                <div className="list-end-text">
                  {(debouncedSearchTerm || selectedSettlement.length > 0 || selectedStreet.length > 0 ||
                    selectedMeterBrand.length > 0 || selectedMeterSize.length > 0 || selectedMeterYear.length > 0 || selectedMeterGroups.length > 0)
                    ? `Знайдено ${filteredTotalCount} клієнтів`
                    : `Переглянуто всіх ${totalCount} клієнтів`}
                </div>
              )}

              {clients.length === 0 && !loading && (
                <div>
                  {searchTerm || selectedSettlement.length > 0 || selectedStreet.length > 0 ||
                   selectedMeterBrand.length > 0 || selectedMeterSize.length > 0 || selectedMeterYear.length > 0 || selectedMeterGroups.length > 0 ? (
                    <div className="empty-search">
                      <div className="empty-search-icon">🔍</div>
                      <p className="empty-search-title">Нічого не знайдено</p>
                      <p className="empty-search-hint">Спробуйте змінити параметри пошуку</p>
                    </div>
                  ) : totalCount === 0 ? (
                    <div className="empty-db">
                      <div className="empty-db-icon">📋</div>
                      <h2 className="empty-db-title">База порожня</h2>
                      <p className="empty-db-hint">Додайте першого абонента або імпортуйте з Excel</p>
                      <div className="empty-db-btns">
                        <label  className="btn" onMouseDown={(e) => {e.stopPropagation();}}><Upload size={13} />Імпорт XLS
                          <input type="file" accept=".xlsx,.xls" onChange={(e) => { handleImportExcel(e); setShowQuickActions(false); }} className="hidden" disabled={loading} />
                        </label>
                        <button className="btn" onClick={() => setShowImportUrlModal(true)}><Upload size={14} /> Імпорт JSON по URL </button>
                        <button onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDownloadTemplate(); 
                setShowQuickActions(false); 
                }}
                onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                }}
                className="btn"><FileText size={13} />Шаблон XLS</button>
                        <button className="btn-primary" onClick={handleAdd}><Plus size={14} /> Додати абонента</button>
                      </div>
                    </div>
                  ) : !isInitialLoading ? (
                    <div className="list-end-text">Немає клієнтів</div>
                  ) : null}
                </div>
              )}
              </div>
            </>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-center">
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">{editingClient ? 'Редагувати клієнта' : 'Новий клієнт'}</h2>
                <button className="modal-close" onClick={resetForm}><X size={24} /></button>
              </div>
              <div className="modal-body">

                {/* Особові дані */}
                <div className="modal-section-blue">
                  <h3 className="modal-section-title modal-section-title-blue"><Home size={18} /> ПІБ, Адреса, Особові дані</h3>
                  <div className="modal-grid-3">
                    
                    {/* 1 РЯДОК: ПІБ + Особовий рахунок */}
                    <div className="name-account-fields modal-col-3">
                      <div>
                        <label className="form-label">ПІБ *</label>
                        <input className="form-input" type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                      </div>
                      <div>
                        <label className="form-label">Особовий рахунок *</label>
                        <input className="form-input" type="text" maxlength="10" value={formData.accountNumber} onChange={(e) => setFormData({...formData, accountNumber: e.target.value})} />
                      </div>
                    </div>

                    {/* 2 РЯДОК: Населений пункт + Тип вул. + Вулиця + Будинок + Літ. + Кв. + Літ. */}
                    <div className="address-compact-grid modal-col-3">
                      <div>
                        <label className="form-label">Населений пункт</label>
                        <input className="form-input" type="text" value={formData.settlement} onChange={(e) => setFormData({...formData, settlement: e.target.value})} />
                      </div>
                      <div>
                        <label className="form-label">Вулиця (тип/назва)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px' }}>
                          <select className="form-input" value={formData.streetType} onChange={(e) => setFormData({...formData, streetType: e.target.value})}>
                            {U_STREET_TYPE.map((type, idx) => (
                              <option key={idx} value={type}>{type}</option>
                            ))}
                          </select>
                          <input className="form-input" type="text" value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} />
                        </div>
                      </div>
                      <div className="address-numbers-grid">
                        <div>
                          <label className="form-label" title="Будинок">Буд.</label>
                          <input className="form-input" type="text" value={formData.building} onChange={(e) => setFormData({...formData, building: e.target.value})} />
                        </div>
                        <div>
                          <label className="form-label" title="Літера">літ. Буд.</label>
                          <input className="form-input" type="text" value={formData.buildingLetter} onChange={(e) => setFormData({...formData, buildingLetter: e.target.value})} />
                        </div>
                        <div>
                          <label className="form-label" title="Квартира">Кв.</label>
                          <input className="form-input" type="text" value={formData.apartment} onChange={(e) => setFormData({...formData, apartment: e.target.value})} />
                        </div>
                        <div>
                          <label className="form-label" title="Літера кв.">літ. Кв.</label>
                          <input className="form-input" type="text" value={formData.apartmentLetter} onChange={(e) => setFormData({...formData, apartmentLetter: e.target.value})} />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="form-label">EIC</label>
                      <input className="form-input" type="text" value={formData.eic} onChange={(e) => setFormData({...formData, eic: e.target.value})} />
                    </div>

                    {/* 4 РЯДОК: Телефон + Чекбокси */}
                    <div>
                      <label className="form-label">Телефон</label>
                      <input className="form-input" type="tel" placeholder="+380..." value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    
                    <div className="flex-checkbox-wrapper">
                      <label className="form-checkbox-label">
                        <input type="checkbox" checked={formData.dacha} onChange={(e) => setFormData({...formData, dacha: e.target.checked})}/>Дача</label>
                      <label className="form-checkbox-label">
                        <input type="checkbox" checked={formData.temporaryAbsent} onChange={(e) => setFormData({...formData, temporaryAbsent: e.target.checked})}/>Тимчасово не проживає</label>
                    </div>

                  </div>
                </div>

                {/* Лічильник */}
                <div className="modal-section-purple">
                  <h3 className="modal-section-title modal-section-title-purple"><Gauge size={18} /> Лічильник</h3>
                  
                  {/* РЯДОК 1 */}
                  <div className="form-grid-row" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Марка лічильника</label>
                      <select className="form-input" value={formData.meterBrand} onChange={(e) => {
                        const brand = e.target.value;
                        const found = METER_CATALOG.find(m => m.brand === brand);
                        let detectedSize = formData.meterSize;
                        if (found) {
                            const normalizedBrand = brand.replace(',', '.').replace('G ', 'G');
                            const match = METER_SIZES.find(size => normalizedBrand.includes(size));
                            if (match) detectedSize = match.replace('G', '');
                        } else if (brand === "") detectedSize = "";
                        setFormData({ ...formData, meterBrand: brand, meterManufacturer: found ? found.manufacturer : '', meterGroup: found ? found.group : '', meterSize: detectedSize });
                      }}>
                        <option value="">— оберіть марку —</option>
                        {METER_CATALOG.map(m => <option key={m.brand} value={m.brand}>{m.brand}</option>)}
                      </select>
                    </div>
                    <div><label className="form-label">Типорозмір</label><input className="form-input" type="text" value={formData.meterSize} onChange={(e) => setFormData({...formData, meterSize: e.target.value})} /></div>
                    <div><label className="form-label">№ лічильника</label><input className="form-input" type="text" value={formData.meterNumber} onChange={(e) => setFormData({...formData, meterNumber: e.target.value})} /></div>
                    <div><label className="form-label">Рік вип.</label><input className="form-input" type="text" value={formData.meterYear} onChange={(e) => setFormData({...formData, meterYear: e.target.value})} /></div>
                    <div><label className="form-label">Наст. повірка</label><input className="form-input" type="text" placeholder="ДД.ММ.РРРР" value={formData.nextVerificationDate} onChange={(e) => setFormData({...formData, nextVerificationDate: e.target.value})} /></div>
                  </div>

                  {/* РЯДОК 2 */}
                  <div className="form-grid-row" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Завод виробник</label>
                      <select className="form-input" value={formData.meterManufacturer} onChange={(e) => setFormData({...formData, meterManufacturer: e.target.value})}>
                        <option value="">— оберіть завод —</option>
                        {METER_MANUFACTURER.map((man, idx) => <option key={idx} value={man}>{man}</option>)}
                      </select>
                    </div>
                    <div><label className="form-label">Група ліч.</label><select className="form-input" value={formData.meterGroup} onChange={(e) => setFormData({...formData, meterGroup: e.target.value})}>
                        <option value="">— оберіть групу —</option>
                        {METER_GROUP.map((group, idx) => <option key={idx} value={group}>{group}</option>)}
                    </select></div>
                    <div><label className="form-label">Підтип</label><select className="form-input" value={formData.meterSubtype} onChange={(e) => setFormData({...formData, meterSubtype: e.target.value})}>
                        <option value="">— оберіть підтип —</option>
                        {METER_SUBTYPE.map((sub, idx) => <option key={idx} value={sub}>{sub}</option>)}
                    </select></div>
                    <div><label className="form-label">Належність</label><select className="form-input" value={formData.meterOwnership} onChange={(e) => setFormData({...formData, meterOwnership: e.target.value})}>
                        <option value="">— належність —</option>
                        {METER_OWNERSHIP.map((own, idx) => <option key={idx} value={own}>{own}</option>)}
                    </select></div>
                    <div><label className="form-label">Серв. орган</label><select className="form-input" value={formData.serviceOrg} onChange={(e) => setFormData({...formData, serviceOrg: e.target.value})}>
                        <option value="">— серв. орган —</option>
                        {SERVICE_ORG.map((org, idx) => <option key={idx} value={org}>{org}</option>)}
                    </select></div>
                  </div>

                  {/* РЯДОК 3 */}
                  <div className="form-grid-row" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Розташування</label>
                      <select className="form-input" value={formData.meterLocation} onChange={(e) => setFormData({...formData, meterLocation: e.target.value})}>
                        <option value="">— розташування —</option>
                        {METER_LOCATION.map((loc, idx) => <option key={idx} value={loc}>{loc}</option>)}
                      </select>
                    </div>
                    <div><label className="form-label">МВНСШ</label><input className="form-input" type="text" value={formData.mvnssh} onChange={(e) => setFormData({...formData, mvnssh: e.target.value})} /></div>
                    <div><label className="form-label">РСП</label><input className="form-input" type="text" value={formData.rsp} onChange={(e) => setFormData({...formData, rsp: e.target.value})} /></div>
                    <div><label className="form-label">Пломба</label><input className="form-input" type="text" value={formData.seal} onChange={(e) => setFormData({...formData, seal: e.target.value})} /></div>
                    <div><label className="form-label">Стікерна пломба</label><input className="form-input" type="text" value={formData.stickerSeal} onChange={(e) => setFormData({...formData, stickerSeal: e.target.value})} /></div>
                  </div>
                </div>

                {/* Прилади */}
                <div className="modal-section-orange">
                  <h3 className="modal-section-title modal-section-title-orange">Прилади</h3>
                  <div className="modal-grid-2">
                    <div><label className="form-label">Котел — марка</label><input className="form-input" type="text" value={formData.boilerBrand} onChange={(e) => setFormData({...formData, boilerBrand: e.target.value})} /></div>
                    <div><label className="form-label">Котел — потужність</label><input className="form-input" type="text" value={formData.boilerPower} onChange={(e) => setFormData({...formData, boilerPower: e.target.value})} /></div>
                    <div><label className="form-label">Плита — тип</label><input className="form-input" type="text" value={formData.stoveType} onChange={(e) => setFormData({...formData, stoveType: e.target.value})} /></div>
                    <div><label className="form-label">Кількість плит</label><input className="form-input" type="text" value={formData.stoveCount} onChange={(e) => setFormData({...formData, stoveCount: e.target.value})} /></div>
                    <div><label className="form-label">ВПГ — тип</label><input className="form-input" type="text" value={formData.columnType} onChange={(e) => setFormData({...formData, columnType: e.target.value})} /></div>
                    <div><label className="form-label">Кількість ВПГ</label><input className="form-input" type="text" value={formData.columnCount} onChange={(e) => setFormData({...formData, columnCount: e.target.value})} /></div>
                  </div>
                </div>
                <div className="modal-section-red">
                  <h3 className="modal-section-title modal-section-title-red">Відключення</h3>
                  <div className="modal-col-3">
                    <div className="form-checkbox-row"> 
                      <label className="form-checkbox-label">
                        <input type="checkbox" checked={formData.gasDisconnected || false} onChange={(e) => setFormData({...formData, gasDisconnected: e.target.checked})} />
                        Газ відключено
                      </label> 
                    </div>
                  </div><br/>
                  <div className="modal-grid-3">
                    <div><label className="form-label">Метод відкл.</label><input className="form-input" type="text" value={formData.disconnectMethod} onChange={(e) => setFormData({...formData, disconnectMethod: e.target.value})} /></div>
                    <div><label className="form-label">Пломба відкл.</label><input className="form-input" type="text" value={formData.disconnectSeal} onChange={(e) => setFormData({...formData, disconnectSeal: e.target.value})} /></div>
                    <div><label className="form-label">Дата відкл.</label><input className="form-input" type="text" placeholder="ДД.ММ.РРРР" value={formData.disconnectDate} onChange={(e) => setFormData({...formData, disconnectDate: e.target.value})} /></div>
                  </div>
                </div>
                {/* Додатково */}
                <div className="modal-section-gray">
                  <h3 className="modal-section-title modal-section-title-gray">Інша інформація про об'єкт</h3>
                  <div className="modal-grid-4">
                    <div><label className="form-label">Площа (м²)</label><input className="form-input" type="text" value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})} /></div>
                    <div><label className="form-label">Комун. гос-во</label><input className="form-input" type="text" value={formData.utilityType} onChange={(e) => setFormData({...formData, utilityType: e.target.value})} /></div>
                    <div><label className="form-label">Група</label><input className="form-input" type="text" value={formData.utilityGroup} onChange={(e) => setFormData({...formData, utilityGroup: e.target.value})} /></div>
                    <div><label className="form-label">ГРС</label>
                        <select className="form-input" value={formData.grs || ''} onChange={(e) => setFormData({ ...formData, grs: e.target.value })}>
                          <option value="">— оберіть ГРС —</option>
                          {grsList.map((grsName, index) => (
                            <option key={index} value={grsName}>
                              {grsName}
                            </option>
                          ))}
                        </select>
                    </div>
                    <div><label className="form-label">Газ вимкнено</label><input className="form-input" type="text" placeholder="Так/Ні" value={formData.gasDisconnected} onChange={(e) => setFormData({...formData, gasDisconnected: e.target.value})} /></div>
                    <div><label className="form-label">Дата підкл.</label><input className="form-input" type="text" placeholder="ДД.ММ.РРРР" value={formData.connectDate} onChange={(e) => setFormData({...formData, connectDate: e.target.value})} /></div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-save" onClick={handleSubmit}><Save size={18} /> {editingClient ? 'Зберегти зміни' : 'Додати клієнта'}</button>
                <button className="btn-cancel" onClick={resetForm}>Скасувати</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImportUrlModal && (
        <div className="url-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowImportUrlModal(false); setImportUrl(''); } }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) e.stopPropagation(); }}>
          <div className="url-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="url-modal-body">
              <div className="url-modal-header">
                <h2 className="url-modal-title">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" style={{color:'#0d9488'}} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Імпорт за посиланням
                </h2>
                <button className="url-modal-close" onClick={() => { setShowImportUrlModal(false); setImportUrl(''); }} disabled={importingFromUrl}><X size={22} /></button>
              </div>

              <div className="info-box">
                <div className="info-box-inner">
                  <Info size={18} style={{color:'#3b82f6', flexShrink:0, marginTop:2}} />
                  <div className="info-box-text">
                    <p><b>💡 Для слабких телефонів</b></p>
                    <p>Введіть посилання на JSON файл замість завантаження файлу.</p>
                    <p><b>Де розмістити файл:</b></p>
                    <ul>
                      <li>GitHub (рекомендовано)</li>
                      <li>Google Drive — публічне посилання</li>
                      <li>Свій сервер — FTP</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div style={{marginBottom:16}}>
                <label className="url-input-label">Посилання на файл JSON:</label>
                <input className="url-input" type="url" value={importUrl} onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://raw.githubusercontent.com/your-name/repo/main/backup.json"
                  disabled={importingFromUrl} />
                <p className="url-input-hint">Приклад: https://raw.githubusercontent.com/Snoopak/gas-local-db/main/backups/clients.json</p>
              </div>

              <div className="code-box">
                <p className="code-box-title">📄 Очікуваний формат файлу:</p>
                <pre className="code-pre">{`[
  {
    "fullName": "Іванов Іван",
    "settlement": "Київ",
    ...
  }
]`}</pre>
                <p className="code-hint">Або об'єкт з полем "clients": {"{ clients: [...] }"}</p>
              </div>

              <div className="url-modal-footer">
                <button className="btn-import-url" onClick={handleImportFromURL} disabled={importingFromUrl || !importUrl.trim()}>
                  {importingFromUrl ? (
                    <><div className="spinner" style={{borderColor:'white',borderTopColor:'transparent',width:18,height:18}}></div> Завантаження...</>
                  ) : (
                    <><Upload size={16} /> Імпортувати</>
                  )}
                </button>
                <button className="btn-cancel-url" onClick={() => { setShowImportUrlModal(false); setImportUrl(''); }} disabled={importingFromUrl}>
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