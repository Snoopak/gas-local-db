import React, { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, X, Save, Phone, Home, Gauge, Upload, Download, FileText, CheckCircle, AlertCircle, Info, AlertTriangle, Database, Activity, Flame, MapPin, ChevronUp, ChevronDown, Users, Sun, Moon, Copy, ChevronRight, UserCircle, SlidersHorizontal, Globe, IdCard, Hash } from 'lucide-react';
import * as XLSX from 'xlsx';
import './App.css';
import {METER_CATALOG, METER_SIZES, METER_SUBTYPE, METER_LOCATION, METER_OWNERSHIP, SERVICE_ORG, METER_GROUP, METER_MANUFACTURER, U_STREET_TYPE} from './data';

// ⭐ ПАРСЕР ПРИЛАДІВ: розбирає текст типу "(Котел) АОГВ-16 - 1шт.; (Плита газова) ПГ-4 - 1шт.;"
const parseAppliances = (text) => {
  const result = {
    boilerBrand: '', boilerCount: '',
    stoveType: '', stoveCount: '',
    columnType: '', columnCount: ''
  };

  if (!text || typeof text !== 'string') return result;

  const items = text.split(';').map(s => s.trim()).filter(s => s);

  const boilers = [];
  const stoves = [];
  const columns = [];

  items.forEach(item => {
    const isDisconnected = item.toUpperCase().includes('ВІДКЛ');
    const icon = isDisconnected ? ' ❌' : '';

    // 1. КОТЛИ ТА КОНВЕКТОРИ
    if (item.includes('(Котел)') || item.includes('(котел)') || item.includes('Конвектор') || item.includes('конвектор')) {
      // Видаляємо всі можливі комбінації префіксів (включаючи "(колонка)" для двоконтурних котлів)
      const cleanStr = item.replace(/\((Котел|котел|Колонка|колонка|ВПГ|впг)\)\s*/gi, '').trim();
      const match = cleanStr.match(/(.+?)(?:\s*-\s*(\d+)\s*шт\.?)?$/i);

      if (match && match[1]) {
        const count = match[2] ? parseInt(match[2], 10) : 1;
        boilers.push({ name: match[1].trim() + icon, count: count });
      }
    }
    
    // 2. КОЛОНКИ ТА ВПГ (Обов'язково ПЕРЕД плитами)
    else if (item.includes('(Колонка)') || item.includes('(колонка)') || item.includes('(ВПГ)') || item.includes('(впг)')) {
      const cleanStr = item.replace(/\((Колонка|колонка|ВПГ|впг)\)\s*/gi, '').trim();
      const match = cleanStr.match(/(.+?)(?:\s*-\s*(\d+)\s*шт\.?)?$/i);

      if (match && match[1]) {
        const count = match[2] ? parseInt(match[2], 10) : 1;
        for (let i = 0; i < count; i++) {
          columns.push(match[1].trim() + icon);
        }
      }
    }
    
    // 3. ПЛИТИ ТА ПОВЕРХНІ
    else if (item.includes('(Плита') || item.includes('(плита)') || item.includes('ПГ') || item.includes('Поверхня') || item.includes('поверхня')) {
      const cleanStr = item.replace(/\((Плита.*?|плита.*?)\)\s*/gi, '').trim();
      const match = cleanStr.match(/(.+?)(?:\s*-\s*(\d+)\s*шт\.?)?$/i);

      if (match && match[1]) {
        const count = match[2] ? parseInt(match[2], 10) : 1;
        for (let i = 0; i < count; i++) {
          stoves.push(match[1].trim() + icon);
        }
      }
    }
  });

  // ЗБІРКА РЕЗУЛЬТАТІВ БЕЗ ЗАДВОЄНЬ
  if (boilers.length > 0) {
    result.boilerBrand = boilers.map(b => b.name).join('; ');
    const totalCount = boilers.reduce((sum, b) => sum + b.count, 0);
    result.boilerCount = `${totalCount}шт.`;
  }

  if (stoves.length > 0) {
    // Беремо лише унікальні назви плит, кількість порахує інтерфейс
    const uniqueStoves = [...new Set(stoves)];
    result.stoveType = uniqueStoves.join(', ');
    result.stoveCount = stoves.length.toString() + 'шт.';
  }

  if (columns.length > 0) {
    // Те саме для колонок
    const uniqueColumns = [...new Set(columns)];
    result.columnType = uniqueColumns.join(', ');
    result.columnCount = columns.length.toString() + 'шт.';
  }

  return result;
};

// ==================== ALERT SYSTEM ====================
const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

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

// ⚡ Пакетний запис масиву клієнтів в одній транзакції IndexedDB
const addClientsBatch = async (clientsBatch) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    // Відкриваємо ОДНУ транзакцію 'readwrite' для всього пакета
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);

    // Всі елементи пакета додаються в один суцільний потік
    for (let i = 0; i < clientsBatch.length; i++) {
      store.add(clientsBatch[i]);
    }
  });
};

// ⚡ Пакетне оновлення масиву існуючих клієнтів (через put)
const updateClientsBatch = async (clientsBatch) => {
  if (!clientsBatch || clientsBatch.length === 0) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    transaction.oncomplete = () => resolve();
    transaction.onerror = (e) => reject(e.target.error);

    for (let i = 0; i < clientsBatch.length; i++) {
      store.put(clientsBatch[i]);
    }
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
    let hasSkipped = false; 
    let collected = 0;
    const skipCount = page * pageSize;

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        // Миттєвий стрибок через непотрібні записи
        if (skipCount > 0 && !hasSkipped) {
          hasSkipped = true;
          cursor.advance(skipCount); 
          return;
        }
        
        results.push(cursor.value);
        collected++;

        if (collected < pageSize) {
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

// ⭐ ВИПРАВЛЕНО: Пошукова функція зі строгим співставленням та перевіркою типів
const searchClients = async (
  searchTerm, settlements, streets, meterBrands, meterSizes, meterYears, meterGroups, 
  filterDisconnected, filterDacha, filterAbsent, filterConnected, filterBuilding, filterApartment,
  selectedGrs, meterYearFrom, meterYearTo, verificationYearFrom, verificationYearTo, filterSeal, filterStickerSeal, filterHasIot
) => {
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
        const clientStreetName = [client.streetType, client.street].filter(Boolean).join(' ');
        const matchesStreet = streets.length === 0 || streets.includes(clientStreetName);

        const matchesBuilding = !filterBuilding ||
          (String(client.building || '') + String(client.buildingLetter || '')).toLowerCase().includes(filterBuilding.toLowerCase().trim());

        const matchesApartment = !filterApartment ||
          (String(client.apartment || '') + String(client.apartmentLetter || '')).toLowerCase().includes(filterApartment.toLowerCase().trim());
        
        const matchesMeterBrand = meterBrands.length === 0 || meterBrands.includes(client.meterBrand);
        const matchesMeterSize = meterSizes.length === 0 || meterSizes.includes(client.meterSize);
        const matchesMeterGroup = meterGroups.length === 0 || meterGroups.includes(client.meterGroup);
        const matchesMeterYear = meterYears.length === 0 || meterYears.includes(client.meterYear);

        // Фільтр ГРС
        const clientGrs = client.grs ? String(client.grs).trim() : '';
        const matchesGrs = selectedGrs.length === 0 || (clientGrs !== '' && selectedGrs.includes(clientGrs));

        // Перевірка діапазону років випуску
        const year = client.meterYear ? parseInt(client.meterYear, 10) : null;
        const matchesYearFrom = !meterYearFrom || (year !== null && !isNaN(year) && year >= parseInt(meterYearFrom, 10));
        const matchesYearTo = !meterYearTo || (year !== null && !isNaN(year) && year <= parseInt(meterYearTo, 10));

        // Перевірка діапазону років повірки
        const verYear = client.nextVerificationDate ? parseInt(client.nextVerificationDate.split('.').pop(), 10) : null;
        const matchesVerYearFrom = !verificationYearFrom || (verYear !== null && !isNaN(verYear) && verYear >= parseInt(verificationYearFrom, 10));
        const matchesVerYearTo = !verificationYearTo || (verYear !== null && !isNaN(verYear) && verYear <= parseInt(verificationYearTo, 10));

        // Пломби
        const matchesSeal = !filterSeal || 
          (client.seal && client.seal.toString().toLowerCase().includes(filterSeal.toLowerCase().trim()));

        const matchesStickerSeal = !filterStickerSeal || 
          (client.stickerSeal && client.stickerSeal.toString().toLowerCase().includes(filterStickerSeal.toLowerCase().trim()));

        const matchesIot = !filterHasIot || (client.iotBrand || client.iotNumber || (client.iotHistory && client.iotHistory.length > 0));
        
        let matchesStatus = true;
        if (filterDisconnected || filterDacha || filterAbsent) {
          matchesStatus = 
            (filterDisconnected && client.gasDisconnected === true) ||
            (filterDacha && client.dacha === true) ||
            (filterAbsent && client.temporaryAbsent === true);
        }

        const matchesConnected = !filterConnected || client.gasDisconnected !== true;
        
        if (matchesSearch && matchesSettlement && matchesStreet &&
            matchesBuilding && matchesApartment && matchesGrs &&
            matchesMeterBrand && matchesMeterSize && matchesMeterGroup && matchesMeterYear &&
            matchesYearFrom && matchesYearTo && matchesVerYearFrom && matchesVerYearTo &&
            matchesSeal && matchesStickerSeal &&
            matchesStatus && matchesConnected && matchesIot) {
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

const searchClientsPaginated = async (
  searchTerm, settlements, streets, meterBrands, meterSizes, meterYears, meterGroups, 
  filterDisconnected, filterDacha, filterAbsent, filterConnected, filterBuilding, filterApartment,
  selectedGrs, meterYearFrom, meterYearTo, verificationYearFrom, verificationYearTo, filterSeal, filterStickerSeal, filterHasIot,
  page, pageSize
) => {
  const allResults = await searchClients(
    searchTerm, settlements, streets, meterBrands, meterSizes, meterYears, meterGroups, 
    filterDisconnected, filterDacha, filterAbsent, filterConnected, filterBuilding, filterApartment,
    selectedGrs, meterYearFrom, meterYearTo, verificationYearFrom, verificationYearTo, filterSeal, filterStickerSeal, filterHasIot
  );
  
  const start = page * pageSize;
  const end = start + pageSize;
  
  return {
    items: allResults.slice(start, end),
    total: allResults.length,
    hasMore: end < allResults.length
  };
};

function ClientDatabase() {
  const CONFIG = {
    PAGE_SIZE: 50,
    DEBOUNCE_DELAY: 500,
    SCROLL_THRESHOLD: 400,
    STATE_RESTORE_DELAY: 100,
    SCROLL_SAVE_DEBOUNCE: 200
  };
  
  const { showToast, showModal } = useAlert();
  
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSettlement, setSelectedSettlement] = useState([]);
  const [selectedStreet, setSelectedStreet] = useState([]);

  const [filterDisconnected, setFilterDisconnected] = useState(false);
  const [filterDacha, setFilterDacha] = useState(false);
  const [filterAbsent, setFilterAbsent] = useState(false);
  const [filterConnected, setFilterConnected] = useState(false);

  const [filterBuilding, setFilterBuilding] = useState('');
  const [filterApartment, setFilterApartment] = useState('');

  const [filterHasIot, setFilterHasIot] = useState(false);

  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const [selectedGrs, setSelectedGrs] = useState([]);
  const [meterYearFrom, setMeterYearFrom] = useState('');
  const [meterYearTo, setMeterYearTo] = useState('');
  const [verificationYearFrom, setVerificationYearFrom] = useState('');
  const [verificationYearTo, setVerificationYearTo] = useState('');
  const [filterSeal, setFilterSeal] = useState('');
  const [filterStickerSeal, setFilterStickerSeal] = useState('');

  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showImportUrlModal, setShowImportUrlModal] = useState(false);
  
  const [selectedMeterBrand, setSelectedMeterBrand] = useState([]);
  const [selectedMeterSize, setSelectedMeterSize] = useState([]);
  const [selectedMeterYear, setSelectedMeterYear] = useState([]);
  const [selectedMeterGroups, setSelectedMeterGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredTotalCount, setFilteredTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [importProgress, setImportProgress] = useState({ show: false, current: 0, total: 0, fileName: '' });
  const [settlements, setSettlements] = useState(['Всі']);
  const [streets, setStreets] = useState(['Всі']);
  const [meterBrands, setMeterBrands] = useState(['Всі']);
  const [meterSizes, setMeterSizes] = useState(['Всі']);
  const [meterYears, setMeterYears] = useState(['Всі']);
  const [meterGroups, setMeterGroups] = useState([]);
  const [grsList, setGrsList] = useState([]);

  const [iotHistoryModalClient, setIotHistoryModalClient] = useState(null);
  
  const [statusCounts, setStatusCounts] = useState({ disconnected: 0, dacha: 0, absent: 0 });
  
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isFirstRender = useRef(true);
  const stateRestored = useRef(false);
  
  const STORAGE_KEYS = {
    CLIENTS: 'clients_infinite_scroll',
    SCROLL_Y: 'clients_scroll_position',
    PAGE: 'clients_current_page',
    FILTERS: 'clients_filters',
    HAS_MORE: 'clients_has_more',
    FILTERED_TOTAL: 'clients_filtered_total'
  };
  
  const searchTimeoutRef = useRef(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const buildingTimeoutRef = useRef(null);
  const [debouncedBuilding, setDebouncedBuilding] = useState('');
  const apartmentTimeoutRef = useRef(null);
  const [debouncedApartment, setDebouncedApartment] = useState('');
  
  const [openDropdown, setOpenDropdown] = useState(null);

  const [selectedClient, setSelectedClient] = useState(null);
  const closingTimer = useRef(null);
  const lastSwipeTime = useRef(0);

  const overlayRef = useRef(null);
  const touchStartY = useRef(0);
  const touchCurrentY = useRef(0);
  const isDragging = useRef(false);
  const rafId = useRef(null);

  const handleTouchStart = (e) => {
    console.log('[DEBUG TOUCH] 🟡 Початок свайпу (Touch Start)');
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    touchStartY.current = clientY;
    touchCurrentY.current = 0;
    isDragging.current = true;

    if (overlayRef.current) {
      overlayRef.current.style.transition = 'none';
    }
  };

const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    
    // Блокуємо скрол фону при свайпі, щоб не було фантомних кліків
    if (e && e.cancelable && e.type === 'touchmove') {
      e.preventDefault();
    }

    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const diff = clientY - touchStartY.current;

    if (diff > 0) {
      touchCurrentY.current = diff;
      
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        if (overlayRef.current) {
          overlayRef.current.style.transform = `translate3d(0, ${diff}px, 0)`;
        }
      });
    }
  };

const handleTouchEnd = (e) => {
    if (!isDragging.current) return;
    console.log('[DEBUG TOUCH] 🟠 Кінець свайпу (Touch End). Пройдена відстань:', touchCurrentY.current);
    isDragging.current = false;

    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }

    if (rafId.current) cancelAnimationFrame(rafId.current);

    if (touchCurrentY.current > 120) {
      console.log('[DEBUG TOUCH] Відстань достатня, викликаємо closeMobilePanel()');
      
      // 1. ОДРАЗУ вмикаємо плавність, поки шторка ще під пальцем
      if (overlayRef.current) {
        overlayRef.current.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
      }

      // 2. В наступному кадрі даємо команду на закриття (без затримки)
      requestAnimationFrame(() => {
        closeMobilePanel();
      });

    } else {
      console.log('[DEBUG TOUCH] Відстань замала, повертаємо шторку назад')
      if (overlayRef.current) {
        overlayRef.current.style.transition = 'transform 0.2s cubic-bezier(0.32, 0.72, 0, 1)';
        overlayRef.current.style.transform = 'translate3d(0, 0, 0)';
      }
    }

    touchCurrentY.current = 0;
  };


// 🕵️‍♂️ ГЛОБАЛЬНИЙ ДЕБАГГЕР УСІХ КЛІКІВ ТА ТАПІВ
  useEffect(() => {
    const handleGlobalClick = (e) => {
      console.log('[DEBUG GLOBAL CLICK] 🎯 Клік прилетів у:', e.target.tagName, 'Клас:', e.target.className);
    };
    
    const handleGlobalTouch = (e) => {
      console.log('[DEBUG GLOBAL TOUCH] 👆 Тап прилетів у:', e.target.tagName, 'Клас:', e.target.className);
    };

    // Третій параметр { capture: true } дозволяє нам перехопити подію НАЙПЕРШИМИ, 
    // до того як якийсь інший код її скасує
    document.addEventListener('click', handleGlobalClick, { capture: true });
    document.addEventListener('touchstart', handleGlobalTouch, { capture: true });

    return () => {
      document.removeEventListener('click', handleGlobalClick, { capture: true });
      document.removeEventListener('touchstart', handleGlobalTouch, { capture: true });
    };
  }, []);

  useEffect(() => {
    const onMouseMove = (e) => handleTouchMove(e);
    const onMouseUp = () => handleTouchEnd();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const [darkMode, setDarkMode] = useState(false);
  const [ctxMenu, setCtxMenu] = useState({ show: false, x: 0, y: 0, client: null });
  const isMobile = () => window.innerWidth < 960;

  useEffect(() => {
    const saved = localStorage.getItem('grm-theme');
    if (saved === 'dark') {
      setDarkMode(true);
      document.body.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('grm-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const handleClick = () => setCtxMenu({ show: false, x: 0, y: 0, client: null });
    const handleEsc = (e) => { if (e.key === 'Escape') setCtxMenu({ show: false, x: 0, y: 0, client: null }); };
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        resetForm();
      }
    };

    
    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
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
    boilerBrand: '', boilerCount: '', stoveType: '', stoveCount: '', columnType: '', columnCount: '',
    area: '', utilityType: '', utilityGroup: '', grs: '',
    gasDisconnected: false, disconnectMethod: '', disconnectSeal: '', disconnectDate: '',
    connectDate: '', dacha: false, temporaryAbsent: false,
    // --- НОВІ ПОЛЯ ІОТ ---
    iotBrand: '', iotNumber: '', iotSeal: '', iotInstallDate: '',
    iotHistory: [], iotLastDate: '', iotLastTime: '', iotLastReading: '', iotProcessed: ''
  });

  const [accountError, setAccountError] = useState('');

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, CONFIG.DEBOUNCE_DELAY);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  useEffect(() => {
    if (buildingTimeoutRef.current) clearTimeout(buildingTimeoutRef.current);
    buildingTimeoutRef.current = setTimeout(() => {
      setDebouncedBuilding(filterBuilding);
    }, CONFIG.DEBOUNCE_DELAY);
    return () => clearTimeout(buildingTimeoutRef.current);
  }, [filterBuilding]);

  useEffect(() => {
    if (apartmentTimeoutRef.current) clearTimeout(apartmentTimeoutRef.current);
    apartmentTimeoutRef.current = setTimeout(() => {
      setDebouncedApartment(filterApartment);
    }, CONFIG.DEBOUNCE_DELAY);
    return () => clearTimeout(apartmentTimeoutRef.current);
  }, [filterApartment]);

  useEffect(() => {
    if (isFirstRender.current) {
      return;
    }
    
    if (stateRestored.current) {
      stateRestored.current = false;
      return;
    }

    const hasActiveFilters = debouncedSearchTerm || selectedSettlement.length > 0 || selectedStreet.length > 0 || 
      selectedMeterBrand.length > 0 || selectedMeterSize.length > 0 || selectedMeterYear.length > 0 || selectedMeterGroups.length > 0 ||
      filterDisconnected || filterDacha || filterAbsent || filterConnected || debouncedBuilding || debouncedApartment ||
      selectedGrs.length > 0 || meterYearFrom || meterYearTo || verificationYearFrom || verificationYearTo || filterSeal || filterStickerSeal || filterHasIot;

    if (hasActiveFilters) {
      clearScrollState();
      setCurrentPage(0);
      setHasMore(true);
      performSearch();
    } else {
      clearScrollState();
      setCurrentPage(0);
      setHasMore(true);
      loadClients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearchTerm, selectedSettlement, selectedStreet, selectedMeterBrand, selectedMeterSize, 
    selectedMeterYear, selectedMeterGroups, filterDisconnected, filterDacha, filterAbsent, filterConnected, 
    debouncedBuilding, debouncedApartment,
    selectedGrs, meterYearFrom, meterYearTo, verificationYearFrom, verificationYearTo, filterSeal, filterStickerSeal, filterHasIot
  ]);

  useEffect(() => {
    const updateDynamicFilters = async () => {
      const allClients = await getAllClients();

      const uniqueGrs = [...new Set(
        allClients.map(c => c.grs ? String(c.grs).trim() : '').filter(Boolean)
      )].sort((a, b) => a.localeCompare(b, 'uk', { sensitivity: 'base' }));
      setGrsList(uniqueGrs);

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

      let clientsForStreets = allClients;
      if (selectedSettlement.length > 0) {
        clientsForStreets = allClients.filter(c => selectedSettlement.includes(c.settlement));
      }
      const uniqueStreets = [...new Set(clientsForStreets.map(c =>
        [c.streetType, c.street].filter(s => s).join(' ')
      ).filter(s => s))].sort((a, b) => a.localeCompare(b, 'uk', { sensitivity: 'base' }));
      setStreets(uniqueStreets);

      const uniqueGroups = [...new Set(byAddress.map(c => c.meterGroup).filter(g => g))]
        .sort((a, b) => a.localeCompare(b, 'uk', { sensitivity: 'base' }));
      setMeterGroups(uniqueGroups);

      let byGroup = byAddress;
      if (selectedMeterGroups.length > 0) {
        byGroup = byGroup.filter(c => selectedMeterGroups.includes(c.meterGroup));
      }
      const uniqueBrands = [...new Set(byGroup.map(c => c.meterBrand).filter(b => b))]
        .sort((a, b) => a.localeCompare(b, 'uk', { sensitivity: 'base' }));
      setMeterBrands(uniqueBrands);

      let byBrand = byGroup;
      if (selectedMeterBrand.length > 0) {
        byBrand = byBrand.filter(c => selectedMeterBrand.includes(c.meterBrand));
      }
      const uniqueSizes = [...new Set(byBrand.map(c => c.meterSize).filter(s => s))]
        .sort((a, b) => a.localeCompare(b, 'uk', { numeric: true, sensitivity: 'base' }));
      setMeterSizes(uniqueSizes);

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

  useEffect(() => {
    let scrollSaveTimeout = null;

    const handleScroll = () => {
      let scrollTop, containerHeight, contentHeight;

      const listEl = document.querySelector('.clients-list');
      const isDesktop = window.innerWidth >= 960 && listEl;

      if (isDesktop) {
        scrollTop = listEl.scrollTop;
        containerHeight = listEl.clientHeight;
        contentHeight = listEl.scrollHeight;
      } else {
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        containerHeight = window.innerHeight;
        contentHeight = document.documentElement.scrollHeight;
      }

      if (scrollTop + containerHeight >= contentHeight - CONFIG.SCROLL_THRESHOLD && hasMore && !isLoadingMore) {
        setCurrentPage(prev => prev + 1);
      }

      if (scrollSaveTimeout) clearTimeout(scrollSaveTimeout);
      scrollSaveTimeout = setTimeout(() => {
        saveScrollState();
      }, CONFIG.SCROLL_SAVE_DEBOUNCE);
    };

    window.addEventListener('scroll', handleScroll);

    const listEl = document.querySelector('.clients-list');
    if (listEl) {
      listEl.addEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (listEl) {
        listEl.removeEventListener('scroll', handleScroll);
      }
      if (scrollSaveTimeout) clearTimeout(scrollSaveTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isLoadingMore]);

  useEffect(() => {
    if (currentPage > 0) {
      const hasFilters = debouncedSearchTerm || selectedSettlement.length > 0 || selectedStreet.length > 0 || 
                        selectedMeterBrand.length > 0 || selectedMeterSize.length > 0 || 
                        selectedMeterYear.length > 0 || selectedMeterGroups.length > 0 ||
                        filterDisconnected || filterDacha || filterAbsent || filterConnected || debouncedBuilding || debouncedApartment ||
                        selectedGrs.length > 0 || meterYearFrom || meterYearTo || verificationYearFrom || verificationYearTo || filterSeal || filterStickerSeal || filterHasIot;
      
      if (hasFilters) {
        performSearch(true);
      } else {
        loadClients(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const loadAllCounts = useCallback(async () => {
    try {
      const allClients = await getAllClients();
      
      const total = allClients.length;
      
      const filteredClients = allClients.filter(client => {
        const matchesSettlement = selectedSettlement.length === 0 || selectedSettlement.includes(client.settlement);
        const matchesStreet = selectedStreet.length === 0 || selectedStreet.includes(client.street);
        const matchesMeterGroup = selectedMeterGroups.length === 0 || selectedMeterGroups.includes(client.meterGroup);
        const matchesMeterBrand = selectedMeterBrand.length === 0 || selectedMeterBrand.includes(client.meterBrand);
        const matchesMeterSize = selectedMeterSize.length === 0 || selectedMeterSize.includes(client.meterSize);
        const matchesMeterYear = selectedMeterYear.length === 0 || selectedMeterYear.includes(client.meterYear);
        
        return matchesSettlement && matchesStreet && matchesMeterGroup && matchesMeterBrand && matchesMeterSize && matchesMeterYear;
      });
      
      const counts = {
        disconnected: filteredClients.filter(c => c.gasDisconnected === true).length,
        dacha: filteredClients.filter(c => c.dacha === true).length,
        absent: filteredClients.filter(c => c.temporaryAbsent === true).length
      };

      setTotalCount(total);
      setStatusCounts(counts);
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  }, [selectedSettlement, selectedStreet, selectedMeterGroups, selectedMeterBrand, selectedMeterSize, selectedMeterYear]);

useEffect(() => {
  const initializeApp = async () => {
    // 1. Спочатку завантажуємо лише першу сторінку для миттєвого відображення
    const hasRestoredFilters = restoreScrollState();
    if (!hasRestoredFilters) {
      await loadClients();
    }
    isFirstRender.current = false;

    // 2. Витягуємо ВСЮ базу ОДИН РАЗ і роздаємо іншим функціям
    const allClients = await getAllClients();
    
    // 3. Роздаємо готові дані
    await loadAllCounts(allClients);
    loadSettlements(allClients);
    loadStreets(allClients);
    loadMeterData(allClients);
  };
  
  initializeApp();
}, []);

  useEffect(() => {
    if (!isFirstRender.current) {
      loadAllCounts();
    }
  }, [loadAllCounts]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const quickActionsButton = event.target.closest('button[title="Швидкі дії"]');
      const quickActionsMenu = event.target.closest('.quick-actions-dropdown');
      
      if (showQuickActions && !quickActionsButton && !quickActionsMenu) {
        setShowQuickActions(false);
      }
    };

    if (showQuickActions) {
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 150);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showQuickActions]);

const loadClients = async (append = false) => {
    if (isLoadingMore || (!append && loading)) return;
    
    if (append) setIsLoadingMore(true);
    else setLoading(true);
    
    try {
      const data = await getClientsByPage(currentPage, CONFIG.PAGE_SIZE);
      
      if (append) setClients(prev => [...prev, ...data]);
      else setClients(data);
      
      setHasMore(data.length === CONFIG.PAGE_SIZE);
      
      // 🔥 ПОВЕРНУЛИ ЗБЕРЕЖЕННЯ
      setTimeout(() => {
        saveScrollState();
      }, 100);
      
    } catch (error) {
      console.error('Error loading clients:', error);
    }
    
    if (append) setIsLoadingMore(false);
    else setLoading(false);
    
    setIsInitialLoading(false);
  };

  const loadSettlements = (allClients) => {
    const uniqueSettlements = [...new Set(allClients.map(c => c.settlement).filter(s => s))].sort((a, b) => a.localeCompare(b, 'uk', { sensitivity: 'base' }));
    setSettlements(uniqueSettlements);
  };

  const loadStreets = (allClients) => {
    const uniqueStreets = [...new Set(allClients.map(c => [c.streetType, c.street].filter(s => s).join(' ')).filter(s => s))].sort((a, b) => a.localeCompare(b, 'uk', { sensitivity: 'base' }));
    setStreets(uniqueStreets);
  };

const loadMeterData = (allClients) => {
  const uniqueBrands = [...new Set(allClients.map(c => c.meterBrand).filter(b => b))].sort((a, b) => a.localeCompare(b, 'uk', { sensitivity: 'base' }));
  setMeterBrands(uniqueBrands);
  const uniqueSizes = [...new Set(allClients.map(c => c.meterSize).filter(s => s))].sort((a, b) => a.localeCompare(b, 'uk', { numeric: true, sensitivity: 'base' }));
  setMeterSizes(uniqueSizes);
  const uniqueYears = [...new Set(allClients.map(c => c.meterYear).filter(y => y))].sort((a, b) => a - b);
  setMeterYears(uniqueYears);
  const uniqueGroups = [...new Set(allClients.map(c => c.meterGroup).filter(g => g))].sort((a, b) => a.localeCompare(b, 'uk', { sensitivity: 'base' }));
  setMeterGroups(uniqueGroups);
};

// 🔥 1. Новий автоматичний запис фільтрів
  useEffect(() => {
    // Захист від затирання кешу при першому рендері сторінки!
    if (isFirstRender.current) return;

    const hasAnyFilters = Boolean(
      searchTerm || selectedSettlement.length > 0 || selectedStreet.length > 0 || 
      selectedMeterBrand.length > 0 || selectedMeterSize.length > 0 || 
      selectedMeterYear.length > 0 || selectedMeterGroups.length > 0 ||
      filterDisconnected || filterDacha || filterAbsent || filterConnected || 
      filterBuilding || filterApartment || selectedGrs.length > 0 || 
      meterYearFrom || meterYearTo || verificationYearFrom || verificationYearTo || 
      filterSeal || filterStickerSeal || filterHasIot
    );

    try {
      if (!hasAnyFilters) {
        // Якщо фільтри скинули — чистимо пам'ять
        sessionStorage.removeItem(STORAGE_KEYS.FILTERS);
      } else {
        // Якщо є фільтри — зберігаємо
        sessionStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify({
          searchTerm, selectedSettlement, selectedStreet, selectedMeterBrand,
          selectedMeterSize, selectedMeterYear, selectedMeterGroups,
          filterDisconnected, filterDacha, filterAbsent, filterConnected,
          filterBuilding, filterApartment, selectedGrs, meterYearFrom,
          meterYearTo, verificationYearFrom, verificationYearTo,
          filterSeal, filterStickerSeal, filterHasIot
        }));
      }
    } catch (e) {
      console.error('Error saving filters:', e);
    }
  }, [
    searchTerm, selectedSettlement, selectedStreet, selectedMeterBrand,
    selectedMeterSize, selectedMeterYear, selectedMeterGroups,
    filterDisconnected, filterDacha, filterAbsent, filterConnected,
    filterBuilding, filterApartment, selectedGrs, meterYearFrom,
    meterYearTo, verificationYearFrom, verificationYearTo,
    filterSeal, filterStickerSeal, filterHasIot
  ]);

  // 🔥 2. Залишаємо порожню пустушку, щоб старий код не зламався
  const saveScrollState = () => {};

const restoreScrollState = () => {
    try {
      const savedFilters = sessionStorage.getItem(STORAGE_KEYS.FILTERS);

      if (savedFilters) {
        const filters = JSON.parse(savedFilters);
        
        // 🔥 Броня від порожніх об'єктів у пам'яті
        const hasActualFilters = Boolean(
          filters.searchTerm || filters.selectedSettlement?.length > 0 || 
          filters.selectedStreet?.length > 0 || filters.selectedMeterBrand?.length > 0 || 
          filters.selectedMeterSize?.length > 0 || filters.selectedMeterYear?.length > 0 || 
          filters.selectedMeterGroups?.length > 0 || filters.filterDisconnected || 
          filters.filterDacha || filters.filterAbsent || filters.filterConnected || 
          filters.filterBuilding || filters.filterApartment || filters.selectedGrs?.length > 0 || 
          filters.meterYearFrom || filters.meterYearTo || filters.verificationYearFrom || 
          filters.verificationYearTo || filters.filterSeal || filters.filterStickerSeal || filters.filterHasIot
        );

        if (!hasActualFilters) {
          sessionStorage.removeItem(STORAGE_KEYS.FILTERS);
          return false;
        }
        
        setSearchTerm(filters.searchTerm || '');
        setDebouncedSearchTerm(filters.searchTerm || ''); 
        
        setSelectedSettlement(filters.selectedSettlement || []);
        setSelectedStreet(filters.selectedStreet || []);
        setSelectedMeterBrand(filters.selectedMeterBrand || []);
        setSelectedMeterSize(filters.selectedMeterSize || []);
        setSelectedMeterYear(filters.selectedMeterYear || []);
        setSelectedMeterGroups(filters.selectedMeterGroups || []);
        setFilterDisconnected(filters.filterDisconnected || false);
        setFilterDacha(filters.filterDacha || false);
        setFilterAbsent(filters.filterAbsent || false);
        setFilterConnected(filters.filterConnected || false);
        
        setFilterBuilding(filters.filterBuilding || '');
        setDebouncedBuilding(filters.filterBuilding || ''); 
        
        setFilterApartment(filters.filterApartment || '');
        setDebouncedApartment(filters.filterApartment || ''); 
        
        setSelectedGrs(filters.selectedGrs || []);
        setMeterYearFrom(filters.meterYearFrom || '');
        setMeterYearTo(filters.meterYearTo || '');
        setVerificationYearFrom(filters.verificationYearFrom || '');
        setVerificationYearTo(filters.verificationYearTo || '');
        setFilterSeal(filters.filterSeal || '');
        setFilterStickerSeal(filters.filterStickerSeal || '');
        setFilterHasIot(filters.filterHasIot || false);
        
        return true; 
      }
    } catch (e) {
      console.error('Error restoring filters:', e);
    }
    return false;
  };

const clearScrollState = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.CLIENTS);
      sessionStorage.removeItem(STORAGE_KEYS.SCROLL_Y);
      sessionStorage.removeItem(STORAGE_KEYS.PAGE);
      // 🔥 ВИДАЛЕНО: sessionStorage.removeItem(STORAGE_KEYS.FILTERS);
      sessionStorage.removeItem(STORAGE_KEYS.HAS_MORE);
      sessionStorage.removeItem(STORAGE_KEYS.FILTERED_TOTAL);
    } catch (e) {
      console.error('Error clearing scroll state:', e);
    }
  };

  const handleContextMenu = (e, client) => {
    e.preventDefault();
    setCtxMenu({ show: true, x: e.clientX, y: e.clientY, client });
  };

  const handleCtxAction = (action) => {
    if (!ctxMenu.client) return;
    const c = ctxMenu.client;
    switch(action) {
      case 'edit': handleEdit(c); break;
      case 'copy':
        const addr = [c.settlement, c.streetType, c.street, c.building, c.apartment].filter(Boolean).join(' ');
        navigator.clipboard.writeText(addr).then(() => showToast('success', 'Адресу скопійовано!'));
        break;
      case 'call':
        if (c.phone) window.location.href = 'tel:' + c.phone;
        else showToast('warning', 'Немає телефону');
        break;
      case 'delete': handleDelete(c.id); break;
    }
    setCtxMenu({ show: false, x: 0, y: 0, client: null });
  };
 
const handleClientCardClick = (clientId) => {
  console.log('[DEBUG CLICK] 🟢 Клік по картці! clientId:', clientId);
  
  // Якщо шторка закривається — перериваємо анімацію
  if (closingTimer.current) {
    clearTimeout(closingTimer.current);
    closingTimer.current = null;
  }
  
  if (overlayRef.current) {
    // Скидаємо всі інлайн-стилі перед відкриттям
    overlayRef.current.style.transition = 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)';
    overlayRef.current.style.transform = '';
    overlayRef.current.style.pointerEvents = '';
    overlayRef.current.classList.add('open');
  }

  const client = clients.find(c => c.id === clientId);
  saveScrollState();
  setSelectedClient(client);
};
const closeMobilePanel = useCallback(() => {
    // Захист від повторних викликів
    if (closingTimer.current) return;
    
    if (overlayRef.current) {
      overlayRef.current.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
      overlayRef.current.style.transform = 'translate3d(0, 110vh, 0)';
      overlayRef.current.style.pointerEvents = 'none';
      overlayRef.current.classList.remove('open');
    }

    closingTimer.current = setTimeout(() => {
      setSelectedClient(null);
      
      // Скидаємо стилі ЧЕРЕЗ requestAnimationFrame, щоб уникнути дьоргання
      requestAnimationFrame(() => {
        if (overlayRef.current) {
          overlayRef.current.style.transform = '';
          overlayRef.current.style.transition = '';
          overlayRef.current.style.pointerEvents = '';
        }
        closingTimer.current = null;
      });
    }, 350); // 300ms анімація + 50ms запас
  }, []);
  

const refreshCurrentList = async () => {
  const hasFilters = Boolean(
    debouncedSearchTerm || selectedSettlement.length > 0 || selectedStreet.length > 0 || 
    selectedMeterBrand.length > 0 || selectedMeterSize.length > 0 || selectedMeterYear.length > 0 || selectedMeterGroups.length > 0 ||
    filterDisconnected || filterDacha || filterAbsent || filterConnected || debouncedBuilding || debouncedApartment ||
    selectedGrs.length > 0 || meterYearFrom || meterYearTo || verificationYearFrom || verificationYearTo || filterSeal || filterStickerSeal || filterHasIot
  );

  setCurrentPage(0); // Після збереження безпечно повертатись на першу сторінку списку
  setHasMore(true);
  
  if (hasFilters) {
    await performSearch();
  } else {
    await loadClients();
  }
};


const performSearch = async (append = false) => {
    if (isLoadingMore || (!append && loading)) return;
    
    if (append) setIsLoadingMore(true);
    else setLoading(true);
    
    try {
      const result = await searchClientsPaginated(
        debouncedSearchTerm, selectedSettlement, selectedStreet,
        selectedMeterBrand, selectedMeterSize, selectedMeterYear, selectedMeterGroups,
        filterDisconnected, filterDacha, filterAbsent, filterConnected, debouncedBuilding, debouncedApartment,
        selectedGrs, meterYearFrom, meterYearTo, verificationYearFrom, verificationYearTo, filterSeal, filterStickerSeal, filterHasIot,
        currentPage, CONFIG.PAGE_SIZE
      );
      
      if (append) setClients(prev => [...prev, ...result.items]);
      else setClients(result.items);
      
      setFilteredTotalCount(result.total);
      setHasMore(result.hasMore);
      
      // 🔥 ПОВЕРНУЛИ ЗБЕРЕЖЕННЯ
      setTimeout(() => {
        saveScrollState();
      }, 100);
      
    } catch (error) {
      console.error('Error searching:', error);
    }
    
    if (append) setIsLoadingMore(false);
    else setLoading(false);
    
    setIsInitialLoading(false);
  };

  // ✅ Асинхронна перевірка дубліката по УСІЙ IndexedDB
const checkAccountDuplicate = async (accNum) => {
  const trimmed = accNum ? accNum.toString().trim() : '';

  if (!trimmed) {
    setAccountError('');
    return false;
  }

  try {
    const db = await openDB();
    const isDuplicate = await new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('accountNumber');
      
      const request = index.get(trimmed);

      request.onsuccess = () => {
        const found = request.result;
        if (!found) {
          resolve(false);
        } else {
          // Якщо це редагування і знайшли того самого клієнта — це не дубль
          const isSameClient = editingClient && found.id === editingClient.id;
          resolve(!isSameClient);
        }
      };

      request.onerror = () => reject(request.error);
    });

    if (isDuplicate) {
      setAccountError('Абонент з таким особовим рахунком вже існує в базі!');
      return true;
    } else {
      setAccountError('');
      return false;
    }
  } catch (error) {
    console.error('Помилка перевірки о/р:', error);
    return false;
  }
};

  const handleSubmit = async () => {
  if (!formData.accountNumber || !formData.fullName) {
    showToast('warning', 'Заповніть обов\'язкові поля: Особовий рахунок та ПІБ');
    return;
  }
      
  // 🔍 Чекаємо на результат перевірки по всій IndexedDB
  const isDuplicate = await checkAccountDuplicate(formData.accountNumber);
  if (isDuplicate) {
    showToast('warning', 'Абонент з таким особовим рахунком вже існує в базі!');
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
    await refreshCurrentList();
    await loadAllCounts();
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
    setAccountError('');
    setFormData({
      fullName: '', settlement: '', streetType: '', street: '', building: '', buildingLetter: '',
      apartment: '', apartmentLetter: '', accountNumber: '', eic: '', phone: '',
      meterBrand: '', meterSize: '', meterNumber: '', meterYear: '', verificationDate: '',
      nextVerificationDate: '', installationDate: '', meterLocation: '', meterGroup: '',
      meterSubtype: '', meterOwnership: '', serviceOrg: '', mvnssh: '',
      rsp: '', seal: '', stickerSeal: '', meterManufacturer: '',
      boilerBrand: '', boilerCount: '', stoveType: '', stoveCount: '', columnType: '', columnCount: '',
      area: '', utilityType: '', utilityGroup: '', grs: '',
      gasDisconnected: false, disconnectMethod: '', disconnectSeal: '', disconnectDate: '',
      connectDate: '', dacha: false, temporaryAbsent: false,
      // --- НОВІ ПОЛЯ ІОТ ---
      iotBrand: '', iotNumber: '', iotSeal: '', iotInstallDate: '',
      iotHistory: [], iotLastDate: '', iotLastTime: '', iotLastReading: '', iotProcessed: ''
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
        try {
          await deleteClient(id);
          await refreshCurrentList();
          await loadAllCounts();
          await loadSettlements();
          await loadStreets();
          await loadMeterData();
          showToast('success', 'Клієнта успішно видалено!');
        } catch (error) {
          console.error('Error deleting client:', error);
          showToast('error', 'Помилка при видаленні клієнта');
        }
      },
      () => {}
    );
  };

  const [importUrl, setImportUrl] = useState('');
  const [importingFromUrl, setImportingFromUrl] = useState(false);

// 🎯 Оптимізована функція імпорту з URL
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
    if (finalUrl.includes('drive.google.com/file')) {
      const match = finalUrl.match(/\/d\/([^\/]+)/);
      if (match && match[1]) {
        finalUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;
      }
    }
    
    const response = await fetch(finalUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Помилка завантаження: ${response.status}`);
    
    const text = await response.text();
    const data = JSON.parse(text);
    const clients = Array.isArray(data) ? data : data.clients;
    
    if (!clients || clients.length === 0) throw new Error('Файл порожній');

    setImportProgress({ show: true, current: 0, total: clients.length, fileName: 'import-url.json' });

    // Очищаємо стару базу перед масовим імпортом
    const db = await openDB();
    const clearTransaction = db.transaction([STORE_NAME], 'readwrite');
    await new Promise((res, rej) => {
      const req = clearTransaction.objectStore(STORE_NAME).clear();
      req.onsuccess = res;
      req.onerror = rej;
    });

    // 🚀 ПАКЕТНИЙ ІМПОРТ (BATCHING)
    const BATCH_SIZE = 500; // Оптимальний розмір пачки для мобілок
    let currentBatch = [];
    let importedCount = 0;

    for (let i = 0; i < clients.length; i++) {
      const c = clients[i];
      if (!c || !c.fullName || !c.accountNumber) continue;

      currentBatch.push(c);
      importedCount++;

      // Коли пачка заповнена або це останній елемент — записуємо в БД
      if (currentBatch.length === BATCH_SIZE || i === clients.length - 1) {
        await addClientsBatch(currentBatch);
        currentBatch = []; // Очищаємо буфер

        // Оновлюємо прогрес-бар
        setImportProgress(prev => ({ ...prev, current: importedCount }));

        // ☕ Ковток повітря для Main Thread (щоб UI перемалювався без затримок)
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    await loadClients();
    await loadAllCounts();
    await loadSettlements();
    await loadStreets();
    await loadMeterData();

    showToast('success', `✅ Успішно імпортовано ${importedCount} абонентів!`);
    setImportUrl('');

  } catch (error) {
    console.error('Import error:', error);
    showToast('error', `Помилка імпорту: ${error.message}`);
  } finally {
    setImportProgress({ show: false, current: 0, total: 0, fileName: '' });
    setImportingFromUrl(false);
    setLoading(false);
  }
};

const handleImportExcel = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 1. Спочатку МИТТЄВО показуємо оверлей із прогресом
  setLoading(true);
  setImportProgress({ 
    show: true, 
    current: 0, 
    total: 0, 
    fileName: `${file.name} (зчитування...)` 
  });

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      // ⚡ 2. ДАЄМО БРАУЗЕРУ 50мс НА МАЛЮВАННЯ UI
      // Без цієї паузи браузер заморожує екран і не малює вікно до кінця парсингу
      await new Promise(resolve => setTimeout(resolve, 50));

      const data = new Uint8Array(event.target.result);
      
      // Важка синхронна обробка Excel
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (!jsonData || jsonData.length === 0) {
        showToast('warning', 'Файл порожній або має невалідний формат');
        setImportProgress({ show: false, current: 0, total: 0, fileName: '' });
        setLoading(false);
        return;
      }

      // Оновлюємо точну кількість записів у вже відкритому вікні
      setImportProgress({ show: true, current: 0, total: jsonData.length, fileName: file.name });

      const cleanAcc = (val) => {
        if (!val) return '';
        return String(val).replace(/\s/g, '').replace(/^0+/, '').toLowerCase();
      };
      // --- ОНОВЛЕНИЙ БЛОК ---
      const formatExcelDate = (val) => {
        if (!val) return '';
        
        const strVal = String(val).trim();
        
        // Якщо в тексті вже є крапки або тире (напр. "15.05.2024" або "2024-05-15") - не чіпаємо
        if (strVal.includes('.') || strVal.includes('-')) return strVal;
        
        // Пробуємо перетворити на число (спрацює і для 46142, і для "46142")
        const numVal = Number(strVal);
        
        // Якщо це якийсь звичайний текст і не число - повертаємо як є
        if (isNaN(numVal)) return strVal;
        
        // Конвертуємо Excel-число в дату
        const date = new Date(Date.UTC(0, 0, numVal - 1));
        const d = String(date.getUTCDate()).padStart(2, '0');
        const m = String(date.getUTCMonth() + 1).padStart(2, '0');
        const y = date.getUTCFullYear();
        
        return `${d}.${m}.${y}`;
      };
      // ----------------------
      const allDbClients = await getAllClients();
      const existingClientsMap = new Map();
      allDbClients.forEach(c => {
        if (c.accountNumber) {
          existingClientsMap.set(cleanAcc(c.accountNumber), c);
        }
      });

      let imported = 0;
      let updated = 0;

      const BATCH_SIZE = 500;
      let newClientsBatch = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        const acc = row['Особовий рахунок'] || '';
        const name = row['ПІБ'] || '';

        const accStr = cleanAcc(acc);
        if (!accStr || !name.toString().trim()) continue;

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
          verificationDate: formatExcelDate(row['Дата повірки']),
          nextVerificationDate: formatExcelDate(row['Наступна повірка']),
          installationDate: formatExcelDate(row['Дата встановлення']),
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
          boilerBrand: '', boilerCount: '', stoveType: '', stoveCount: '', columnType: '', columnCount: '',
          area: (row['Площа'] || '').toString().trim(),
          utilityType: (row['Комун. гос-во'] || '').toString().trim(),
          utilityGroup: (row['Група'] || '').toString().trim(),
          grs: (row['ГРС'] || '').toString().trim(),
          gasDisconnected: (row['Газ вимкнено'] === 'Так' || row['Газ вимкнено'] === true),
          disconnectMethod: (row['Метод відключення'] || '').toString().trim(),
          disconnectSeal: (row['Пломба відкл.'] || '').toString().trim(),
          disconnectDate: formatExcelDate(row['Дата відкл.']),
          connectDate: formatExcelDate(row['Дата підкл.']),
          dacha: row['Дача'] === 'Так' || row['Дача'] === true,
          temporaryAbsent: row['Тимчасово відсутній'] === 'Так' || row['Тимчасово відсутній'] === true,
          // Додаємо ІоТ поля (назви в row[] зміни на ті, що у твоєму головному шаблоні Excel)
          iotBrand: (row['ІоТ Марка'] || '').toString().trim(),
          iotNumber: (row['ІоТ Серійний №'] || '').toString().trim(),
          iotSeal: (row['ІоТ Пломба'] || '').toString().trim(),
          iotInstallDate: formatExcelDate(row['ІоТ Дата встанов.']),
          iotHistory: [],
        };

        const appliancesText = row['Прилади'] || row['прилади'] || row['Обладнання'] || row['обладнання'] || '';
        if (appliancesText && appliancesText.toString().trim()) {
          const parsed = parseAppliances(appliancesText.toString());
          client.boilerBrand = parsed.boilerBrand;
          client.boilerCount = parsed.boilerCount;
          client.stoveType = parsed.stoveType;
          client.stoveCount = parsed.stoveCount;
          client.columnType = parsed.columnType;
          client.columnCount = parsed.columnCount;
        } else {
          client.boilerBrand = (row['Котел марка'] || '').toString().trim();
          client.boilerCount = (row['Котел кількість'] || '').toString().trim();
          client.stoveType = (row['Газова плита тип'] || '').toString().trim();
          client.stoveCount = (row['Кількість плит'] || '').toString().trim();
          client.columnType = (row['ВПГ тип'] || '').toString().trim();
          client.columnCount = (row['Кількість ВПГ'] || '').toString().trim();
        }

        if (existingClientsMap.has(accStr)) {
          const existingClient = existingClientsMap.get(accStr);
          await updateClient({ ...existingClient, ...client, id: existingClient.id });
          updated++;
        } else {
          newClientsBatch.push(client);
          imported++;
        }

        if (newClientsBatch.length >= BATCH_SIZE || i === jsonData.length - 1) {
          if (newClientsBatch.length > 0) {
            await addClientsBatch(newClientsBatch);
            newClientsBatch = [];
          }
          setImportProgress(prev => ({ ...prev, current: i + 1 }));
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      await loadClients();
      await loadAllCounts();
      await loadSettlements();
      await loadStreets();
      await loadMeterData();

      setImportProgress({ show: false, current: 0, total: 0, fileName: '' });
      setIsInitialLoading(false);
      showToast('success', `Готово! Нових: ${imported}, Оновлено: ${updated}`, 5000);

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

  const formatAppliances = (client) => {
    const parts = [];
    
    if (client.boilerBrand) {
      const count = client.boilerCount ? `${client.boilerCount}шт.` : '1шт.';
      parts.push(`(Котел) ${client.boilerBrand} - ${count}`); 
    }
    
    if (client.stoveType) {
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

// 🚀 Функція імпорту файлу з історією зв'язку ІоТ
const handleImportIoT = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setLoading(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 50));

    const data = new Uint8Array(await file.arrayBuffer());
    const workbook = XLSX.read(data, { type: 'array' });
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    const cleanStr = (val) => val ? String(val).replace(/\s/g, '').toLowerCase() : '';
    const allDbClients = await getAllClients();
    const existingClientsMap = new Map();
    
    allDbClients.forEach(c => {
      if (c.accountNumber) existingClientsMap.set(`ACC_${cleanStr(c.accountNumber)}`, c);
      if (c.meterNumber) existingClientsMap.set(`MET_${cleanStr(c.meterNumber)}`, c);
    });

    let updatedCount = 0;
    const BATCH_SIZE = 500;
    let updateBatch = [];

    const parseUaDate = (d, t) => {
      if (!d) return 0;
      const parts = d.split('.');
      return parts.length === 3 
        ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}T${t || '00:00:00'}`).getTime() 
        : new Date(`${d}T${t || '00:00:00'}`).getTime();
    };

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const accKey = `ACC_${cleanStr(row['Особ.Рах.'])}`;
      const meterKey = `MET_${cleanStr(row['Сер.номер лічильника'])}`;

      let clientToUpdate = existingClientsMap.get(accKey) || existingClientsMap.get(meterKey);

      if (clientToUpdate) {
        if (!clientToUpdate.iotHistory) clientToUpdate.iotHistory = [];

        const newLog = {
          date: (row['Дата надходження'] || '').toString().trim(),
          time: (row['Час надходження'] || '').toString().trim(),
          reading: (row['Показник Лічильника'] || '').toString().trim(),
          processed: (row['Оброблений'] || '').toString().trim()
        };

        const isDuplicate = clientToUpdate.iotHistory.some(h => h.date === newLog.date && h.time === newLog.time);

        if (!isDuplicate && newLog.date) {
          clientToUpdate.iotHistory.push(newLog);
          clientToUpdate.iotHistory.sort((a, b) => parseUaDate(b.date, b.time) - parseUaDate(a.date, a.time));
          
          clientToUpdate.iotLastDate = clientToUpdate.iotHistory[0].date;
          clientToUpdate.iotLastTime = clientToUpdate.iotHistory[0].time;
          clientToUpdate.iotLastReading = clientToUpdate.iotHistory[0].reading;

          updateBatch.push(clientToUpdate);
          updatedCount++;
        }

        if (updateBatch.length >= BATCH_SIZE || i === jsonData.length - 1) {
          if (updateBatch.length > 0) {
            await updateClientsBatch(updateBatch);
            updateBatch = []; 
          }
        }
      }
    }
    
    await loadClients();
    showToast('success', `Готово! Додано нових записів ІоТ: ${updatedCount}`);
  } catch (error) {
    showToast('error', `Помилка: ${error.message}`);
  } finally {
    setLoading(false);
  }
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
      
      const cleanClients = allClients.map(client => {
        const { id, ...cleanData } = client;
        return cleanData;
      });
      
      const jsonData = JSON.stringify(cleanClients, null, 2);
      
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
    ws['!cols'] = Array(41).fill({ wch: 15 });
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
      boilerBrand: '', boilerCount: '', stoveType: '', stoveCount: '', columnType: '', columnCount: '',
      area: '', utilityType: '', utilityGroup: '', grs: '',
      gasDisconnected: false, disconnectMethod: '', disconnectSeal: '', disconnectDate: '',
      connectDate: '', dacha: false, temporaryAbsent: false,
      // --- НОВІ ПОЛЯ ІОТ ---
      iotBrand: '', iotNumber: '', iotSeal: '', iotInstallDate: '',
      iotHistory: [], iotLastDate: '', iotLastTime: '', iotLastReading: '', iotProcessed: ''
    });
    setEditingClient(null);
    setAccountError('');
    setIsModalOpen(false);
  };

  const toggleSelection = (array, setArray, value) => {
    if (array.includes(value)) {
      setArray(array.filter(v => v !== value));
    } else {
      setArray([...array, value]);
    }
    setCurrentPage(0);
  };

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
    }, [selected, onChange]);

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

  // ⭐ ВИПРАВЛЕНО: Розрахунок активності фільтрів із перевіркою .length > 0
  const hasActiveFilters = Boolean(
    debouncedSearchTerm || 
    selectedSettlement.length > 0 || 
    selectedStreet.length > 0 ||
    selectedMeterBrand.length > 0 || 
    selectedMeterSize.length > 0 || 
    selectedMeterYear.length > 0 ||
    selectedMeterGroups.length > 0 || 
    selectedGrs.length > 0 || 
    filterDisconnected || 
    filterDacha || 
    filterAbsent ||
    filterConnected || 
    filterBuilding.trim() || 
    filterApartment.trim() || 
    meterYearFrom || 
    meterYearTo || 
    verificationYearFrom || 
    verificationYearTo || 
    filterSeal.trim() || 
    filterStickerSeal.trim() ||
    filterHasIot
  );

  return (
    <div className="app-wrapper">
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
              <div className="navbar-logo-icon"><Database size={15} /></div>
              <div className="nav-title-group">
                <span className="navbar-title">Абоненти газу</span>
                <span className="nav-subtitle">
                  {isInitialLoading ? (
                    '\u00A0' // Невидимий пробіл тримає каркас і не дає шапці стрибати
                  ) : totalCount > 0 ? (
                    <>
                      Всього абонентів: <strong className="count-fade-in">{totalCount}</strong>
                    </>
                  ) : (
                    <>
                      Абоненти: <strong style={{ color: '#ef4444' }}>Відсутні</strong>
                    </>
                  )}
                </span>
              </div>
            </div>
            <div className="navbar-actions">
              <button className="btn-theme" onClick={() => setDarkMode(!darkMode)} title="Перемкнути тему">
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <div className="nav-divider"></div>

              <div className="relative">
                <button 
                  title="Швидкі дії"
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="btn-quick-pill"
                >
                  <Activity size={16} />
                  <span className="hidden sm:inline">Швидкі дії</span>
                  <ChevronDown size={14} className={showQuickActions ? 'rotate-180' : ''} style={{ transition: 'transform 0.2s' }} />
                </button>
                
                {showQuickActions && (
                <div className="quick-actions-dropdown">
                  <div className="qa-menu-group">
                    {/* Створення */}
                    <button 
                      onClick={(e) => { e.preventDefault(); handleAdd(); setShowQuickActions(false); }} 
                      className="qa-item"
                    >
                      <div className="qa-icon-box qa-indigo"><Plus size={14} /></div> 
                      <span>Новий клієнт</span>
                    </button>
                    
                    <div className="qa-divider"></div>
                    
                    {/* Імпорт */}
                    <label className="qa-item">
                      <div className="qa-icon-box qa-green"><Upload size={14} /></div>
                      <span>Імпорт XLS</span>
                      <input 
                        type="file" 
                        accept=".xlsx,.xls" 
                        onChange={(e) => { handleImportExcel(e); setShowQuickActions(false); }} 
                        className="hidden" 
                        disabled={loading} 
                      />
                    </label>

                    <button 
                      onClick={(e) => { e.preventDefault(); setShowImportUrlModal(true); setShowQuickActions(false); }} 
                      className="qa-item"
                    >
                      <div className="qa-icon-box qa-green"><Upload size={14} /></div>
                      <span>Імпорт JSON</span>
                    </button>
                    
                    <label className="qa-item">
                      <div className="qa-icon-box qa-indigo"><Globe size={14} style={{ color: '#6b7280' }} /></div>
                      <span>Імпорт логів ІоТ</span>
                      <input 
                        type="file" 
                        accept=".xlsx, .xls" 
                        onChange={(e) => { handleImportIoT(e); setShowQuickActions(false); }} 
                        style={{ display: 'none' }} 
                      />
                    </label>

                    
                    <div className="qa-divider"></div>
                    
                    {/* Експорт */}
                    <button 
                      onClick={(e) => { e.preventDefault(); handleExportExcel(); setShowQuickActions(false); }} 
                      className="qa-item"
                    >
                      <div className="qa-icon-box qa-blue"><Download size={14} /></div>
                      <span>Експорт Excel</span>
                    </button>

                    <button 
                      onClick={(e) => { e.preventDefault(); handleExportJSON(); setShowQuickActions(false); }} 
                      className="qa-item"
                    >
                      <div className="qa-icon-box qa-blue"><Download size={14} /></div>
                      <span>Експорт JSON</span>
                    </button>

                    <div className="qa-divider"></div>

                    {/* Шаблон */}
                    <button 
                      onClick={(e) => { e.preventDefault(); handleDownloadTemplate(); setShowQuickActions(false); }}
                      className="qa-item"
                    >
                      <div className="qa-icon-box qa-orange"><FileText size={14} /></div>
                      <span>Шаблон XLS</span>
                    </button>
                  </div>
                </div>
              )}

              </div>
            </div>
          </div>

          {/* ===== ФІЛЬТРИ ===== */}
          <div className={`filters-panel ${totalCount === 0 ? 'disabled' : ''}`}>
            <div className="filters-panel-compact">
              <div className="search-row-compact">
                <div className="search-box" style={{ flex: 1 }}>
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

                {/* ⭐ ВИПРАВЛЕНО: Кнопка відкриття шторки тепер корректно перевіряє active стан */}
                <button 
                  className={`btn-toggle-filters ${(selectedSettlement.length > 0 || selectedStreet.length > 0 || filterBuilding || filterApartment || selectedGrs.length > 0 || selectedMeterBrand.length > 0 || selectedMeterSize.length > 0 || selectedMeterGroups.length > 0 || meterYearFrom || meterYearTo || verificationYearFrom || verificationYearTo || filterSeal || filterStickerSeal) ? 'has-active' : ''}`}
                  onClick={() => setShowFilterDrawer(true)}
                >
                  <SlidersHorizontal size={15} />
                  <span className="hidden sm:inline">Фільтри</span>
                </button>
                {hasActiveFilters && (
                <button 
                  className="btn-reset-icon"
                  title="Скинути всі фільтри"
                  onClick={() => {
                    // Очищаємо всі стейти
                    setSearchTerm(''); setDebouncedSearchTerm('');
                    setSelectedSettlement([]); setSelectedStreet([]);
                    setSelectedMeterBrand([]); setSelectedMeterSize([]);
                    setSelectedMeterYear([]); setSelectedMeterGroups([]);
                    setFilterDisconnected(false); setFilterDacha(false);
                    setFilterAbsent(false); setFilterConnected(false);
                    setFilterBuilding(''); setFilterApartment('');
                    setDebouncedBuilding(''); setDebouncedApartment('');
                    setSelectedGrs([]);
                    setMeterYearFrom(''); setMeterYearTo('');
                    setVerificationYearFrom(''); setVerificationYearTo('');
                    setFilterSeal(''); setFilterStickerSeal('');
                    setFilterHasIot(false);

                    setCurrentPage(0); 
                    setHasMore(true);
                    
                    // 🔥 ГОЛОВНА ЗМІНА ТУТ:
                    // Примусово стираємо фільтри з пам'яті браузера
                    sessionStorage.removeItem(STORAGE_KEYS.FILTERS);
                    clearScrollState(); 
                   }}
                  >
                  <X size={16} />
                </button>
                )}
              </div>

            </div>

          {/* ===== БІЧНА ШТОРКА (DRAWER) ===== */}
          {showFilterDrawer && (
            <div className="drawer-backdrop" onClick={() => setShowFilterDrawer(false)}>
              <div className="drawer-panel" onClick={e => e.stopPropagation()}>
                <div className="drawer-header">
                  <div className="drawer-header-title">
                    <SlidersHorizontal size={18} style={{ color: '#4f46e5' }} />
                    <span>Розширені фільтри</span>
                  </div>
                  <button className="btn-close-drawer" onClick={() => setShowFilterDrawer(false)}>
                    <X size={18} />
                  </button>
                </div>

                <div className="drawer-body">
  
  <div className="drawer-section">
    <div className="drawer-section-title">Адреса та ГРС</div>
    <div className="drawer-grid-2">
      <MultiSelectDropdown options={settlements} selected={selectedSettlement} onChange={setSelectedSettlement} label="Нас. пункт" name="settlement" />
      <MultiSelectDropdown options={streets} selected={selectedStreet} onChange={setSelectedStreet} label="Вулиця" name="street" />
    </div>
    
    <div className="drawer-grid-2">
      <input className="drawer-input" type="text" value={filterBuilding} onChange={e => setFilterBuilding(e.target.value)} placeholder="Будинок" />
      <input className="drawer-input" type="text" value={filterApartment} onChange={e => setFilterApartment(e.target.value)} placeholder="Квартира" />
    </div>

    <MultiSelectDropdown 
      options={grsList} 
      selected={selectedGrs} 
      onChange={setSelectedGrs} 
      label="ГРС" 
      name="grs" 
    />
  </div>

  <div className="drawer-section">
    <div className="drawer-section-title">Параметри лічильника</div>
    <MultiSelectDropdown options={meterGroups} selected={selectedMeterGroups} onChange={setSelectedMeterGroups} label="Група ліч." name="meterGroup" />
    
    <div className="drawer-grid-2">
      <MultiSelectDropdown options={meterBrands} selected={selectedMeterBrand} onChange={setSelectedMeterBrand} label="Марка" name="meterBrand" />
      <MultiSelectDropdown options={meterSizes} selected={selectedMeterSize} onChange={setSelectedMeterSize} label="Розмір" name="meterSize" />
    </div>

    {/* Рідний стиль drawer-card-box для року випуску */}
    <div className="drawer-card-box">
      <span className="drawer-card-title">Рік випуску</span>
      
      <MultiSelectDropdown options={meterYears} selected={selectedMeterYear} onChange={setSelectedMeterYear} label="Оберіть конкретні роки" name="meterYear" />
      
      <div className="drawer-dashed-divider">
      </div>

      <div className="drawer-grid-2">
        <input className="drawer-input" style={{ textAlign: 'center' }} type="number" placeholder="Від (1995)" value={meterYearFrom} onChange={e => setMeterYearFrom(e.target.value)} />
        <input className="drawer-input" style={{ textAlign: 'center' }} type="number" placeholder="До (2010)" value={meterYearTo} onChange={e => setMeterYearTo(e.target.value)} />
      </div>
    </div>

    {/* ТАКИЙ САМИЙ блок для року повірки, щоб була єдина стилістика */}
    <div className="drawer-card-box">
      <span className="drawer-card-title">Рік повірки</span>
      <div className="drawer-grid-2">
        <input className="drawer-input" style={{ textAlign: 'center' }} type="number" placeholder="Від 2024" value={verificationYearFrom} onChange={e => setVerificationYearFrom(e.target.value)} />
        <input className="drawer-input" style={{ textAlign: 'center' }} type="number" placeholder="До 2028" value={verificationYearTo} onChange={e => setVerificationYearTo(e.target.value)} />
      </div>
    </div>
  </div>

  <div className="drawer-section">
    <div className="drawer-section-title">Телеметрія</div>
    <div className="custom-checkbox-wrapper" style={{ marginTop: '8px' }}>
      <input 
        type="checkbox" 
        id="filterIot"
        className="custom-checkbox-input" 
        checked={filterHasIot} 
        onChange={(e) => setFilterHasIot(e.target.checked)} 
      />
      <label htmlFor="filterIot" className="custom-checkbox-label">
        <span className="custom-checkbox-box"></span>
        {/* Прибрано інлайн-колір, тепер береться з твого CSS */}
        <span style={{ fontWeight: 500 }}>Абоненти з ІоТ модулем</span>
      </label>
    </div>
  </div>

  <div className="drawer-section">
    <div className="drawer-section-title">Пошук за номерами пломб</div>
    <input className="drawer-input" type="text" placeholder="№ пломби (напр. R261)" value={filterSeal} onChange={e => setFilterSeal(e.target.value)} />
    <input className="drawer-input" type="text" placeholder="№ стікерної пломби (напр. B1484)" value={filterStickerSeal} onChange={e => setFilterStickerSeal(e.target.value)} />
  </div>

</div>

                <div className="drawer-footer">
                  <button className="btn-apply-drawer" onClick={() => setShowFilterDrawer(false)}>
                    Показати результати
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="status-toolbar-left">
            <div className="stats-left-group">
              <div className="stats-item">
                <Users size={14} className="stats-icon" />
                {hasActiveFilters ? (
                  <>
                    <span>Знайдено:</span> 
                    {!isInitialLoading && <strong className="count-fade-in" style={{ color: '#0d9488' }}>{filteredTotalCount}</strong>}
                  </>
                ) : (
                  <>
                    <span>Всього:</span> 
                    {!isInitialLoading && <strong className="count-fade-in">{totalCount}</strong>}
                  </>
                )}
              </div>
            </div>

            <div className="toolbar-v-divider"></div>

            <div className="status-group">
              <span className="status-label">Статус:</span>
              
              <div className="status-chips-scroll">
                <button className={`status-chip status-off ${filterDisconnected ? 'active' : ''}`} onClick={() => setFilterDisconnected(!filterDisconnected)}>
                  <span className="chip-dot"></span>
                  <span className="chip-text">Відключений</span>
                  <span className={`chip-count ${!isInitialLoading && statusCounts.disconnected > 0 ? 'chip-count-visible' : 'chip-count-placeholder'}`}>
                    ({isInitialLoading ? '000' : statusCounts.disconnected})
                  </span>
                </button>
                <button className={`status-chip status-dacha ${filterDacha ? 'active' : ''}`} onClick={() => setFilterDacha(!filterDacha)}>
                  <span className="chip-dot"></span>
                  <span className="chip-text">Дача</span>
                  <span className={`chip-count ${!isInitialLoading && statusCounts.dacha > 0 ? 'chip-count-visible' : 'chip-count-placeholder'}`}>
                    ({isInitialLoading ? '0000' : statusCounts.dacha})
                  </span>
                </button>
                <button className={`status-chip status-absent ${filterAbsent ? 'active' : ''}`} onClick={() => setFilterAbsent(!filterAbsent)}>
                  <span className="chip-dot"></span>
                  <span className="chip-text">Не проживає</span>
                  <span className={`chip-count ${!isInitialLoading && statusCounts.absent > 0 ? 'chip-count-visible' : 'chip-count-placeholder'}`}>
                    ({isInitialLoading ? '000' : statusCounts.absent})
                  </span>
                </button>
                <button className={`status-chip status-on ${filterConnected ? 'active' : ''}`} onClick={() => setFilterConnected(!filterConnected)}>
                  <span className="chip-dot"></span>
                  <span className="chip-text">Газ включений</span>
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* ===== ОСНОВНИЙ КОНТЕНТ ===== */}
        <div className="main-content">
          <div className="list-panel">
            <div className="clients-list">
              {isInitialLoading ? (
                <div className="skeleton-list">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="skeleton-client-card">
                      <div className="sk-body">
                        <div className="sk-name" style={{ width: `${60 + (i % 3) * 10}%` }}></div>
                        <div className="sk-address-row">
                          <div className="sk-icon-dot"></div>
                          <div className="sk-address" style={{ width: `${70 + (i % 2) * 15}%` }}></div>
                        </div>
                        <div className="sk-tags">
                          <div className="sk-badge-account"></div>
                          <div className="sk-badge-dot"></div>
                          <div className="sk-badge-meter"></div>
                        </div>
                      </div>
                      <div className="sk-right">
                        <div className="sk-meter-brand"></div>
                        <div className="sk-meter-num"></div>
                      </div>
                      <div className="sk-chevron"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="clients-inner">
                    {clients.map(c => {
                      const dotClass = c.gasDisconnected === true ? 'suspended' : 'active';
                      const addr = [c.settlement, [c.streetType, c.street].filter(Boolean).join(' '), c.building ? `буд. ${c.building}${c.buildingLetter || ''}` : '', c.apartment ? `кв. ${c.apartment}${c.apartmentLetter || ''}` : ''].filter(Boolean).join(', ');
                      const meterShort = c.meterNumber ? `${c.meterBrand ? c.meterBrand.split(' ')[0] : ''} G${c.meterSize || ''} №${c.meterNumber}` : '';

                      // 1. ПРОСТО ДОДАЄМО ЗМІННІ ТУТ
                      let touchStartX = 0;
                      let touchStartY = 0;

                      return (
                        <div
                          key={c.id}
                          className={`client-item ${selectedClient?.id === c.id && !isMobile() ? 'selected' : ''}`}
                          onClick={() => handleClientCardClick(c.id)}
                          
                          // 2. ОБРОБНИКИ ТАПІВ
                          onTouchStart={(e) => {
                            touchStartX = e.touches[0].clientX;
                            touchStartY = e.touches[0].clientY;
                          }}
                          onTouchEnd={(e) => {
                            const touchEndX = e.changedTouches[0].clientX;
                            const touchEndY = e.changedTouches[0].clientY;
                            
                            const diffX = Math.abs(touchEndX - touchStartX);
                            const diffY = Math.abs(touchEndY - touchStartY);
                            
                            // Якщо палець посунувся більше ніж на 10px (це скрол) — ігноруємо
                            if (diffX > 10 || diffY > 10) return;
                            
                            // Якщо це чіткий тап — вбиваємо подвійний клік і відкриваємо
                            e.preventDefault();
                            handleClientCardClick(c.id);
                          }}
                          
                          onContextMenu={(e) => handleContextMenu(e, c)}
                          >
                          <div className="item-body">
                            <div className="item-name">{c.fullName || '—'}</div>
                            <div className="item-address"><div className="meta-icon"><MapPin size={11} /></div> {addr}</div>
                            <div className="item-tags">
                              <div className="meta-icon"><Hash size={14} strokeWidth={2} style={{ opacity: 0.5 }} /></div><span className="account">о/р: {c.accountNumber || '—'}</span>
                              <span className={`status-indicator ${dotClass}`}></span>
                              {meterShort && <span className="meter-badge"><i className="fas fa-tachometer-alt"></i> {meterShort}</span>}
                              
                              {(c.iotBrand || c.iotNumber) && (
                                <div className="meta-icon" title={`ІоТ: ${c.iotBrand || '—'} №${c.iotNumber || '—'}`}>
                                  <Globe size={12} style={{ color: '#6b7280' }} />
                                </div>
                              )}
                            {/* Рядок 2 (на мобілці) / Продовження (на десктопі): Всі статусні беджі */}
                              {(c.dacha || c.temporaryAbsent || c.gasDisconnected) && (
                                <div className="item-badges">
                                  {c.dacha && <span className="badge-chip badge-dacha">Дача</span>}
                                  {c.temporaryAbsent && <span className="badge-chip badge-absent">Не прож.</span>}
                                  {c.gasDisconnected && <span className="badge-chip badge-off">× Відключений</span>}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="item-right">
                            <div className="meter-brand">{c.meterBrand || ''}</div>
                            <div className="meter-num">№ {c.meterNumber || '—'}</div>
                          </div>
                          <ChevronRight size={24} color="#d1d5db" />
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
                        {hasActiveFilters
                          ? `Знайдено ${filteredTotalCount} клієнтів`
                          : `Переглянуто всіх ${totalCount} клієнтів`}
                      </div>
                    )}

                    {clients.length === 0 && !loading && (
                      <div>
                        {hasActiveFilters ? (
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
                              <label className="btn" onMouseDown={(e) => {e.stopPropagation();}}><Upload size={13} />Імпорт XLS
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

          {/* ПРАВА ПАНЕЛЬ — ДЕТАЛІ (ДЕСКТОП) */}
          {!isMobile() && totalCount > 0 && (
            <div className="detail-panel">
              {selectedClient ? (
                <>
                  <div className="detail-panel-header">
                    <h3>{selectedClient.fullName}</h3>
                    <button className="btn-icon" onClick={() => setSelectedClient(null)}><X size={18} /></button>
                  </div>
                  <div className="detail-panel-body">
                    <div className="detail-info-block">
                      <h4><UserCircle size={14} /> Особові дані</h4>
                      <div className="detail-row"><span className="dlbl">Особовий рахунок</span><span className="dval">{selectedClient.accountNumber}</span></div>
                      <div className="detail-row"><span className="dlbl">ПІБ</span><span className="dval"><strong>{selectedClient.fullName}</strong></span></div>
                       <div className="detail-row">
                        <span className="dlbl">Адреса</span>
                        <span className="dval" style={{fontSize:'0.75rem'}}>
                          {[selectedClient.settlement, selectedClient.streetType, selectedClient.street, selectedClient.building && `буд. ${selectedClient.building}${selectedClient.buildingLetter || ''}`, selectedClient.apartment && `кв. ${selectedClient.apartment}${selectedClient.apartmentLetter || ''}`].filter(Boolean).join(', ')}
                        </span>
                      </div>
                      <div className="detail-row"><span className="dlbl">EIC</span><span className="dval">{selectedClient.eic || '—'}</span></div>
                      <div className="detail-row"><span className="dlbl">Телефон</span><span className="dval">{selectedClient.phone ? (
                        <a href={`tel:${selectedClient.phone.replace(/[^\d+]/g, '')}`} style={{color: '#2563eb', textDecoration: 'none', fontWeight: 500}}>
                          {selectedClient.phone}
                        </a>
                      ) : '—'}</span></div>
                     
                      {selectedClient.dacha && (
                        <div className="detail-row">
                          <span className="dlbl">Тип об'єкта</span>
                          <span className="dval"><span className="badge-chip badge-dacha">Дача</span></span>
                        </div>
                      )}

                      {selectedClient.temporaryAbsent && (
                        <div className="detail-row">
                          <span className="dlbl">Проживання</span>
                          <span className="dval"><span className="badge-chip badge-absent">Не проживає</span></span>
                        </div>
                      )}
                    </div>
                    
                    <div className="detail-info-block">
                      <h4><Home size={14} /> Об'єкт</h4>
                      <div className="detail-row"><span className="dlbl">Площа</span><span className="dval">{selectedClient.area ? `${selectedClient.area} м²` : '—'}</span></div>
                      <div className="detail-row"><span className="dlbl">Комун. гос-во</span><span className="dval">{selectedClient.utilityType || '—'}</span></div>
                      <div className="detail-row"><span className="dlbl">Група</span><span className="dval">{selectedClient.utilityGroup || '—'}</span></div>
                      <div className="detail-row"><span className="dlbl">ГРС</span><span className="dval">{selectedClient.grs || '—'}</span></div>
                      <div className="detail-row"><span className="dlbl">Дата підкл.</span><span className="dval">{selectedClient.connectDate || '—'}</span></div>
                    </div>

                    <div className="detail-info-block">
                      <h4><Gauge size={14} /> Лічильник</h4>
                      {selectedClient.meterNumber ? (
                        <>
                          <div className="detail-row"><span className="dlbl">Марка / Тип</span><span className="dval">{selectedClient.meterBrand || '—'}</span></div>
                          <div className="detail-row"><span className="dlbl">№ лічильника</span><span className="dval">{selectedClient.meterNumber}</span></div>
                          <div className="detail-row"><span className="dlbl">Рік випуску</span><span className="dval">{selectedClient.meterYear || '—'}</span></div>
                          <div className="detail-row"><span className="dlbl">Повірка</span><span className="dval">{selectedClient.verificationDate || '—'}</span></div>
                          <div className="detail-row"><span className="dlbl">Наступна повірка</span><span className="dval">{selectedClient.nextVerificationDate || '—'}</span></div>
                          <div className="detail-row"><span className="dlbl">Підтип</span><span className="dval">{selectedClient.meterSubtype || '—'}</span></div>
                          <div className="detail-row"><span className="dlbl">Завод-виробник</span><span className="dval" style={{fontSize:'0.7rem'}}>{selectedClient.meterManufacturer || '—'}</span></div>
                          <div className="detail-row"><span className="dlbl">Група</span><span className="dval">{selectedClient.meterGroup || '—'}</span></div>
                          <div className="detail-row"><span className="dlbl">Належність / Серв. орган</span><span className="dval">{selectedClient.meterOwnership || '—'} / {selectedClient.serviceOrg || '—'}</span></div>
                          <div className="detail-row"><span className="dlbl">Розташування</span><span className="dval" style={{fontSize:'0.7rem'}}>{selectedClient.meterLocation || '—'}</span></div>
                          <div className="detail-row"><span className="dlbl">МВНСШ / РСП</span><span className="dval">{selectedClient.mvnssh || '—'} / {selectedClient.rsp || '—'}</span></div>
                          <div className="detail-row"><span className="dlbl">Пломба</span><span className="dval">{selectedClient.seal || '—'}</span></div>
                          <div className="detail-row"><span className="dlbl">Стікерна пломба</span><span className="dval">{selectedClient.stickerSeal || '—'}</span></div>
                        </>
                      ) : <p style={{fontSize:12,color:'#9ca3af'}}>Немає даних</p>}
                    </div>

                    <div className="detail-info-block">
                      <h4><Flame size={14} /> Прилади</h4>
                      {selectedClient.boilerBrand && <div className="detail-row"><span className="dlbl">Котел</span><span className="dval">{selectedClient.boilerBrand}{selectedClient.boilerCount ? ` (${selectedClient.boilerCount})` : ''}</span></div>}
                      {selectedClient.stoveType && <div className="detail-row"><span className="dlbl">Плита</span><span className="dval">{selectedClient.stoveType}{selectedClient.stoveCount ? ` (${selectedClient.stoveCount})` : ''}</span></div>}
                      {selectedClient.columnType && <div className="detail-row"><span className="dlbl">ВПГ</span><span className="dval">{selectedClient.columnType}{selectedClient.columnCount ? ` (${selectedClient.columnCount})` : ''}</span></div>}
                      {!selectedClient.boilerBrand && !selectedClient.stoveType && !selectedClient.columnType && <div className="detail-row"><span className="dlbl">Прилади</span><span className="dval">—</span></div>}
                    </div>
                    
                    {/* --- ПОЧАТОК БЛОКУ ІОТ (ДЕСКТОП) --- */}
                    {(selectedClient.iotBrand || selectedClient.iotNumber || (selectedClient.iotHistory && selectedClient.iotHistory.length > 0)) && (
                      <div className="detail-info-block">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <h4><Globe size={14} /> Телеметрія (ІоТ)</h4>
                          {selectedClient.iotHistory && selectedClient.iotHistory.length > 0 && (
                            <button 
                              onClick={() => setIotHistoryModalClient(selectedClient)}
                              style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                            >
                              Історія ({selectedClient.iotHistory.length})
                            </button>
                          )}
                        </div>
                        
                        <div className="detail-row"><span className="dlbl">Модель</span><span className="dval">{selectedClient.iotBrand || '—'}</span></div>
                        <div className="detail-row"><span className="dlbl">Серійний №</span><span className="dval">{selectedClient.iotNumber || '—'}</span></div>
                        <div className="detail-row"><span className="dlbl">Пломба</span><span className="dval">{selectedClient.iotSeal || '—'}</span></div>
                        <div className="detail-row"><span className="dlbl">Дата встановлення</span><span className="dval">{selectedClient.iotInstallDate || '—'}</span></div>
                        
                        {selectedClient.iotLastDate && (
                          <div className="iot-last-connection">
                            <div className="detail-row">
                              <span className="dlbl">Останній зв'язок</span>
                              <span className="dval iot-status-chip-green">
                                {selectedClient.iotLastDate} {selectedClient.iotLastTime}
                              </span>
                            </div>
                            <div className="detail-row">
                              <span className="dlbl">Показник</span>
                              <span className="dval"><strong>{selectedClient.iotLastReading}</strong></span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {/* --- КІНЕЦЬ БЛОКУ ІОТ --- */}

                    {selectedClient.gasDisconnected && (
                    <div className="detail-info-block">
                      <h4><AlertTriangle size={14} />  Відключення</h4>
                      <div className="detail-row">
                        <span className="dlbl">Газ відключено</span>
                        <span className="dval" style={{color: selectedClient.gasDisconnected ? '#dc2626' : '#16a34a', fontWeight: 600}}>
                          {selectedClient.gasDisconnected ? 'ТАК' : 'Ні'}
                        </span>
                      </div>
                      {selectedClient.gasDisconnected && (
                        <>
                          <div className="detail-row"><span className="dlbl">Метод</span><span className="dval">{selectedClient.disconnectMethod || '—'}</span></div>
                          <div className="detail-row"><span className="dlbl">Пломба</span><span className="dval">{selectedClient.disconnectSeal || '—'}</span></div>
                          <div className="detail-row"><span className="dlbl">Дата</span><span className="dval">{selectedClient.disconnectDate || '—'}</span></div>
                        </>
                      )}
                    </div>
                    )}

                    <div style={{display:'flex', gap:'0.5rem', marginTop:'0.5rem'}}>
                      <button className="btn-save" onClick={() => handleEdit(selectedClient)} style={{flex:1}}>✎ Редагувати</button>
                      <button className="btn-cancel" onClick={() => handleDelete(selectedClient.id)} style={{flex:1, color:'#dc2626'}}>🗑 Видалити</button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="detail-panel-empty">
                  <div>
                    <div className="empty-icon-wrapper">
                      <IdCard size={36} strokeWidth={1.5} />
                    </div>
                    <div className="empty-text-group">
                      <p className="empty-title">Оберіть абонента</p>
                      <p className="empty-subtitle">для перегляду деталей</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* МОБІЛЬНА ПАНЕЛЬ */}
        <div
          ref={overlayRef}
          className={`mobile-overlay ${selectedClient && isMobile() ? 'open' : ''}`}>
          {selectedClient && (
            <>
              <div 
                className="mobile-header" 
                style={{ touchAction: 'none' }} /* 🚀 ОСЬ ЦЕЙ РЯДОК ВБИВАЄ ПОДВІЙНИЙ ТАП */
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleTouchStart}
              >
                <div className="sheet-grabber"></div>
                <div className="mobile-header-top">
                  <h2>{selectedClient.fullName}</h2>
                  <button 
                    type="button" 
                    className="btn-back" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      closeMobilePanel();
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="mobile-body">
                <div className="info-block">
                  <h4><UserCircle size={14} /> Особові дані</h4>
                  <div className="detail-row"><span className="dlbl">Особовий рахунок</span><span className="dval">{selectedClient.accountNumber}</span></div>
                  <div className="detail-row"><span className="dlbl">ПІБ</span><span className="dval"><strong>{selectedClient.fullName}</strong></span></div>
                  <div className="detail-row">
                    <span className="dlbl">Адреса</span>
                    <span className="dval" style={{fontSize:'0.75rem'}}>
                      {[selectedClient.settlement, selectedClient.streetType, selectedClient.street, selectedClient.building && `буд. ${selectedClient.building}${selectedClient.buildingLetter || ''}`, selectedClient.apartment && `кв. ${selectedClient.apartment}${selectedClient.apartmentLetter || ''}`].filter(Boolean).join(', ')}
                    </span>
                  </div>
                  <div className="detail-row"><span className="dlbl">EIC</span><span className="dval">{selectedClient.eic || '—'}</span></div>
                  <div className="detail-row">
                    <span className="dlbl">Телефон</span>
                    <span className="dval">
                      {selectedClient.phone ? (
                        <a href={`tel:${selectedClient.phone.replace(/[^\d+]/g, '')}`} style={{color: '#2563eb', textDecoration: 'none'}}>
                          {selectedClient.phone}
                        </a>
                      ) : '—'}
                    </span>
                  </div>

                  {selectedClient.dacha && (
                        <div className="detail-row">
                          <span className="dlbl">Тип об'єкта</span>
                          <span className="dval"><span className="badge-chip badge-dacha">Дача</span></span>
                        </div>
                      )}

                      {selectedClient.temporaryAbsent && (
                        <div className="detail-row">
                          <span className="dlbl">Проживання</span>
                          <span className="dval"><span className="badge-chip badge-absent">Не проживає</span></span>
                        </div>
                      )}

                </div>

                <div className="info-block">
                  <h4><Gauge size={14} /> Лічильник</h4>
                  {selectedClient.meterNumber ? (
                    <>
                      <div className="detail-row"><span className="dlbl">Марка / Тип</span><span className="dval">{selectedClient.meterBrand || '—'}</span></div>
                      <div className="detail-row"><span className="dlbl">№ лічильника</span><span className="dval">{selectedClient.meterNumber}</span></div>
                      <div className="detail-row"><span className="dlbl">Рік випуску</span><span className="dval">{selectedClient.meterYear || '—'}</span></div>
                      <div className="detail-row"><span className="dlbl">Повірка</span><span className="dval">{selectedClient.verificationDate || '—'}</span></div>
                      <div className="detail-row"><span className="dlbl">Наступна повірка</span><span className="dval">{selectedClient.nextVerificationDate || '—'}</span></div>
                      <div className="detail-row"><span className="dlbl">Підтип</span><span className="dval">{selectedClient.meterSubtype || '—'}</span></div>
                      <div className="detail-row"><span className="dlbl">Завод-виробник</span><span className="dval" style={{fontSize:'0.7rem'}}>{selectedClient.meterManufacturer || '—'}</span></div>
                      <div className="detail-row"><span className="dlbl">Група</span><span className="dval">{selectedClient.meterGroup || '—'}</span></div>
                      <div className="detail-row"><span className="dlbl">Належність / Серв. орган</span><span className="dval">{selectedClient.meterOwnership || '—'} / {selectedClient.serviceOrg || '—'}</span></div>
                      <div className="detail-row"><span className="dlbl">Розташування</span><span className="dval" style={{fontSize:'0.7rem'}}>{selectedClient.meterLocation || '—'}</span></div>
                      <div className="detail-row"><span className="dlbl">МВНСШ / РСП</span><span className="dval">{selectedClient.mvnssh || '—'} / {selectedClient.rsp || '—'}</span></div>
                      <div className="detail-row"><span className="dlbl">Пломба</span><span className="dval">{selectedClient.seal || '—'}</span></div>
                      <div className="detail-row"><span className="dlbl">Стікерна пломба</span><span className="dval">{selectedClient.stickerSeal || '—'}</span></div>
                    </>
                  ) : <p style={{fontSize:12,color:'#9ca3af'}}>Немає даних</p>}
                </div>

                <div className="info-block">
                  <h4><Flame size={14} /> Прилади</h4>
                  {selectedClient.boilerBrand && <div className="detail-row"><span className="dlbl">Котел</span><span className="dval">{selectedClient.boilerBrand}</span></div>}
                  {selectedClient.stoveType && <div className="detail-row"><span className="dlbl">Плита</span><span className="dval">{selectedClient.stoveType}{selectedClient.stoveCount ? ` (${selectedClient.stoveCount})` : ''}</span></div>}
                  {selectedClient.columnType && <div className="detail-row"><span className="dlbl">ВПГ</span><span className="dval">{selectedClient.columnType}{selectedClient.columnCount ? ` (${selectedClient.columnCount})` : ''}</span></div>}
                  {!selectedClient.boilerBrand && !selectedClient.stoveType && !selectedClient.columnType && <div className="detail-row"><span className="dlbl">Прилади</span><span className="dval">—</span></div>}
                </div>

                {/* --- ПОЧАТОК БЛОКУ ІОТ (МОБІЛКА) --- */}
                {(selectedClient.iotBrand || selectedClient.iotNumber || (selectedClient.iotHistory && selectedClient.iotHistory.length > 0)) && (
                  <div className="info-block">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4><Globe size={14} /> Телеметрія (ІоТ)</h4>
                      {selectedClient.iotHistory && selectedClient.iotHistory.length > 0 && (
                        <button 
                          onClick={() => setIotHistoryModalClient(selectedClient)}
                          style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          Історія ({selectedClient.iotHistory.length})
                        </button>
                      )}
                    </div>
                    
                    <div className="detail-row"><span className="dlbl">Модель</span><span className="dval">{selectedClient.iotBrand || '—'}</span></div>
                    <div className="detail-row"><span className="dlbl">Серійний №</span><span className="dval">{selectedClient.iotNumber || '—'}</span></div>
                    <div className="detail-row"><span className="dlbl">Пломба</span><span className="dval">{selectedClient.iotSeal || '—'}</span></div>
                    <div className="detail-row"><span className="dlbl">Дата встановлення</span><span className="dval">{selectedClient.iotInstallDate || '—'}</span></div>
                    
                    {selectedClient.iotLastDate && (
                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div className="detail-row">
                          <span className="dlbl">Останній зв'язок</span>
                          <span className="dval" style={{ color: '#166534', fontWeight: '600', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>
                            {selectedClient.iotLastDate} {selectedClient.iotLastTime}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="dlbl">Показник</span>
                          <span className="dval"><strong>{selectedClient.iotLastReading}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* --- КІНЕЦЬ БЛОКУ ІОТ --- */}

                {selectedClient.gasDisconnected && (
                <div className="info-block">
                  <h4><AlertTriangle size={14} /> Відключення</h4>
                  <div className="detail-row">
                    <span className="dlbl">Газ відключено</span>
                    <span className="dval" style={{color: selectedClient.gasDisconnected ? '#dc2626' : '#16a34a', fontWeight: 600}}>
                      {selectedClient.gasDisconnected ? 'ТАК' : 'Ні'}
                    </span>
                  </div>
                  {selectedClient.gasDisconnected && (
                    <>
                      <div className="detail-row"><span className="dlbl">Метод</span><span className="dval">{selectedClient.disconnectMethod || '—'}</span></div>
                      <div className="detail-row"><span className="dlbl">Пломба</span><span className="dval">{selectedClient.disconnectSeal || '—'}</span></div>
                      <div className="detail-row"><span className="dlbl">Дата</span><span className="dval">{selectedClient.disconnectDate || '—'}</span></div>
                    </>
                  )}
                </div>
                )}
              </div>

              <div className="mobile-actions">
                <button 
                  className="btn-sm primary" 
                  onClick={() => { closeMobilePanel(); handleEdit(selectedClient); }}
                >
                  <Edit2 size={16} /> Редагувати
                </button>
                <button 
                  className="btn-sm danger" 
                  onClick={() => { closeMobilePanel(); handleDelete(selectedClient.id); }}
                >
                  <Trash2 size={16} /> Видалити
                </button>
              </div>
            </>
          )}
        </div>

        {/* МОДАЛКА СТВОРЕННЯ / РЕДАГУВАННЯ */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={resetForm}>
            <div className="modal-center">
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2 className="modal-title">{editingClient ? 'Редагувати клієнта' : 'Новий клієнт'}</h2>
                  <button className="modal-close" onClick={resetForm}><X size={24} /></button>
                </div>
                <div className="modal-body">

                  <div className="modal-section">
                    <h3 className="modal-section-title modal-section-title-blue"><UserCircle size={18} /> ПІБ, Адреса, Особові дані</h3>
                    <div className="modal-grid-3">
                      
                      <div className="name-account-fields modal-col-3">
                        <div>
                          <label className="form-label">ПІБ *</label>
                          <input className="form-input" type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                        </div>
                        <div>
                          <label className="form-label">Особовий рахунок *</label>
                          <input 
                            className={`form-input ${accountError ? 'input-error' : ''}`} 
                            type="text" 
                            maxLength="10" 
                            value={formData.accountNumber} 
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData(prev => ({ ...prev, accountNumber: val }));
                              checkAccountDuplicate(val); // Жива перевірка під час вводу по всій БД
                              }} 
                            />
                          {accountError && (
                            <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontWeight: 600 }}>
                              ⚠️ {accountError}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="address-compact-grid modal-col-3">
                        <div>
                          <label className="form-label">Населений пункт *</label>
                          <input className="form-input" type="text" value={formData.settlement} onChange={(e) => setFormData({...formData, settlement: e.target.value})} />
                        </div>
                        <div>
                          <label className="form-label">Вулиця (тип/назва) *</label>
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
                            <label className="form-label" title="Будинок">Буд. *</label>
                            <input className="form-input" type="text" value={formData.building} onChange={(e) => setFormData({...formData, building: e.target.value})} />
                          </div>
                          <div>
                            <label className="form-label" title="Літера">літ. Буд. *</label>
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
                        <label className="form-label">EIC *</label>
                        <input className="form-input" type="text" value={formData.eic} onChange={(e) => setFormData({...formData, eic: e.target.value})} />
                      </div>

                      <div>
                        <label className="form-label">Телефон</label>
                        <input className="form-input" type="tel" placeholder="+380..." value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                      </div>
                      
                      <div className="flex-checkbox-wrapper">
                        {/* Чекбокс 1: Дача */}
                        <div className="custom-checkbox-wrapper">
                          <input 
                            type="checkbox" 
                            id="dacha"
                            className="custom-checkbox-input" 
                            checked={formData.dacha || false} 
                            onChange={(e) => setFormData(prev => ({ ...prev, dacha: e.target.checked }))} 
                          />
                          <label htmlFor="dacha" className="custom-checkbox-label">
                            <span className="custom-checkbox-box"></span>
                            <span>Дача</span>
                          </label>
                        </div>

                        {/* Чекбокс 2: Тимчасово не проживає */}
                        <div className="custom-checkbox-wrapper">
                          <input 
                            type="checkbox" 
                            id="temporaryAbsent"
                            className="custom-checkbox-input" 
                            checked={formData.temporaryAbsent || false} 
                            onChange={(e) => setFormData(prev => ({ ...prev, temporaryAbsent: e.target.checked }))} 
                          />
                          <label htmlFor="temporaryAbsent" className="custom-checkbox-label">
                            <span className="custom-checkbox-box"></span>
                            <span>Тимчасово не проживає</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    </div>
                    <div className="modal-section">
                    <h3 className="modal-section-title modal-section-title-blue"><Home size={18} /> Інша інформація про об'єкт</h3>
                    <div className="modal-grid-4">
                      <div><label className="form-label">Площа (м²)</label><input className="form-input" type="text" value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})} /></div>
                      <div><label className="form-label">Комун. гос-во</label><input className="form-input" type="text" value={formData.utilityType} onChange={(e) => setFormData({...formData, utilityType: e.target.value})} /></div>
                      <div><label className="form-label">Група</label><input className="form-input" type="text" value={formData.utilityGroup} onChange={(e) => setFormData({...formData, utilityGroup: e.target.value})} /></div>
                      <div><label className="form-label">ГРС</label>
                          <select 
                            className="form-input" 
                            value={formData.grs || ''} 
                            onChange={(e) => setFormData({ ...formData, grs: e.target.value })}
                          >
                            <option value="">— оберіть ГРС —</option>
                            {formData.grs && !grsList.includes(String(formData.grs).trim()) && (
                              <option value={String(formData.grs).trim()}>{String(formData.grs).trim()}</option>
                            )}
                            {grsList.map((grsName, index) => (
                              <option key={index} value={grsName}>
                                {grsName}
                              </option> 
                            ))}
                          </select>
                      </div>
                      <div><label className="form-label">Дата підкл.</label><input className="form-input" type="text" placeholder="ДД.ММ.РРРР" value={formData.connectDate} onChange={(e) => setFormData({...formData, connectDate: e.target.value})} /></div>
                    </div>

                  </div>

                  <div className="modal-section">
                    <h3 className="modal-section-title modal-section-title-purple"><Gauge size={18} /> Лічильник</h3>
                    
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
                      <div><label className="form-label">Остання повірка</label><input className="form-input" type="text" placeholder="ДД.ММ.РРРР" value={formData.verificationDate} onChange={(e) => setFormData({...formData, verificationDate: e.target.value})} /></div>
                    </div>

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

                  {/* --- ПОЧАТОК: СЕКЦІЯ ІОТ В МОДАЛЦІ --- */}
                  <div className="modal-section">
                    <h3 className="modal-section-title">
                      <Globe size={18} style={{ color: '#059669', marginRight: '6px' }} /> Телеметрія (ІоТ)
                    </h3>
                    <div className="modal-grid-4">
                      <div>
                        <label className="form-label">Марка / Модель</label>
                        <input className="form-input" type="text" value={formData.iotBrand} onChange={(e) => setFormData({...formData, iotBrand: e.target.value})} />
                      </div>
                      <div>
                        <label className="form-label">Серійний №</label>
                        <input className="form-input" type="text" value={formData.iotNumber} onChange={(e) => setFormData({...formData, iotNumber: e.target.value})} />
                      </div>
                      <div>
                        <label className="form-label">Пломба ІоТ</label>
                        <input className="form-input" type="text" value={formData.iotSeal} onChange={(e) => setFormData({...formData, iotSeal: e.target.value})} />
                      </div>
                      <div>
                        <label className="form-label">Дата встановлення</label>
                        <input className="form-input" type="text" placeholder="ДД.ММ.РРРР" value={formData.iotInstallDate} onChange={(e) => setFormData({...formData, iotInstallDate: e.target.value})} />
                      </div>
                    </div>
                  </div>
                  {/* --- КІНЕЦЬ: СЕКЦІЯ ІОТ В МОДАЛЦІ --- */}

                  <div className="modal-section">
                    <h3 className="modal-section-title modal-section-title-orange"><Flame size={18} /> Прилади</h3>
                    <div className="modal-grid-2">
                      <div><label className="form-label">Котел — марка</label><input className="form-input" type="text" value={formData.boilerBrand} onChange={(e) => setFormData({...formData, boilerBrand: e.target.value})} /></div>
                      <div><label className="form-label">Котел — кількість</label><input className="form-input" type="text" value={formData.boilerCount} onChange={(e) => setFormData({...formData, boilerCount: e.target.value})} /></div>
                      <div><label className="form-label">Плита — тип</label><input className="form-input" type="text" value={formData.stoveType} onChange={(e) => setFormData({...formData, stoveType: e.target.value})} /></div>
                      <div><label className="form-label">Кількість плит</label><input className="form-input" type="text" value={formData.stoveCount} onChange={(e) => setFormData({...formData, stoveCount: e.target.value})} /></div>
                      <div><label className="form-label">ВПГ — тип</label><input className="form-input" type="text" value={formData.columnType} onChange={(e) => setFormData({...formData, columnType: e.target.value})} /></div>
                      <div><label className="form-label">Кількість ВПГ</label><input className="form-input" type="text" value={formData.columnCount} onChange={(e) => setFormData({...formData, columnCount: e.target.value})} /></div>
                    </div>
                  </div>
                  
                  <div className="modal-section modal-section-red">
                    <h3 className="modal-section-title modal-section-title-red" style={{ marginBottom: '0px' }}><AlertTriangle size={18} /> Відключення</h3>
                    <div className="modal-col-3" style={{ marginBottom: '5px' }}>
                      <div className="form-checkbox-row"> 
                        <div className="custom-checkbox-wrapper">
                          <input type="checkbox" 
                            id="gasDisconnected"
                            className="custom-checkbox-input" 
                            checked={formData.gasDisconnected || false} 
                            onChange={(e) => setFormData(prev => ({ ...prev, gasDisconnected: e.target.checked }))} 
                          />
                          <label htmlFor="gasDisconnected" className="custom-checkbox-label">
                            <span className="custom-checkbox-box"></span>
                            <span>Газ відключено</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="modal-grid-3">
                      <div><label className="form-label">Метод відкл.</label><input className="form-input" type="text" value={formData.disconnectMethod} onChange={(e) => setFormData({...formData, disconnectMethod: e.target.value})} /></div>
                      <div><label className="form-label">Пломба відкл.</label><input className="form-input" type="text" value={formData.disconnectSeal} onChange={(e) => setFormData({...formData, disconnectSeal: e.target.value})} /></div>
                      <div><label className="form-label">Дата відкл.</label><input className="form-input" type="text" placeholder="ДД.ММ.РРРР" value={formData.disconnectDate} onChange={(e) => setFormData({...formData, disconnectDate: e.target.value})} /></div>
                    </div>
                  </div>

                </div>
                <div className="modal-footer">
                  <button 
                    className="btn-save" 
                    onClick={handleSubmit}
                    disabled={!!accountError}
                    style={{
                      opacity: accountError ? 0.5 : 1,
                      cursor: accountError ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Save size={18} /> {editingClient ? 'Зберегти зміни' : 'Додати клієнта'}
                  </button>
                  <button className="btn-cancel" onClick={resetForm}>Скасувати</button>
                </div>
              </div>
            </div>
          </div>
        )}


        
        {iotHistoryModalClient && (
  <div className="modal-overlay" onClick={() => setIotHistoryModalClient(null)}>
    <div className="modal-center">
      <div className="modal-card" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
        
        <div className="modal-header">
          <div className="modal-title">Історія зв'язку ІоТ</div>
          <button className="modal-close" onClick={() => setIotHistoryModalClient(null)}>✕</button>
        </div>
        
        <div className="modal-body iot-history-body">
          <div className="iot-history-info">
            Абонент: <b>{iotHistoryModalClient.fullName}</b><br/>
            Серійний №: <b>{iotHistoryModalClient.iotNumber || '—'}</b>
          </div>
          
          <div className="iot-history-table-wrap">
            <table className="iot-history-table">
              <thead>
                <tr>
                  <th>Дата та час</th>
                  <th>Показник</th>
                  <th>Оброблений</th>
                </tr>
              </thead>
              <tbody>
                {(iotHistoryModalClient.iotHistory || []).map((log, idx) => (
                  <tr key={idx}>
                    <td>{log.date} <span className="iot-time">{log.time}</span></td>
                    <td className="iot-reading">{log.reading}</td>
                    <td>
                      <span className={`iot-status-chip ${log.processed === 'Так' ? 'processed' : 'pending'}`}>
                        {log.processed || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

        {ctxMenu.show && (
          <div className="ctx-menu" style={{position:'fixed', left: ctxMenu.x, top: ctxMenu.y, zIndex: 9999}}>
            <button className="ctx-item" onClick={() => handleCtxAction('edit')}><Edit2 size={14} /> Редагувати</button>
            <button className="ctx-item" onClick={() => handleCtxAction('copy')}><Copy size={14} /> Копіювати адресу</button>
            <button className="ctx-item" onClick={() => handleCtxAction('call')}><Phone size={14} /> Подзвонити</button>
            <div className="ctx-divider"></div>
            <button className="ctx-item ctx-item-danger" onClick={() => handleCtxAction('delete')}><Trash2 size={14} /> Видалити</button>
          </div>
        )}
      </div>
    </div> 
  );
}

export default function AppWithAlerts() {
  return (
    <AlertProvider>
      <ClientDatabase />
    </AlertProvider>
  );
}