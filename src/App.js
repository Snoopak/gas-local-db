import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit2, Trash2, X, Save, Phone, Home, Gauge, Upload, Download, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';

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

const searchClients = async (searchTerm, settlements, streets, meterBrands, meterSizes, meterYears, meterGroups) => {
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
        
        if (matchesSearch && matchesSettlement && matchesStreet && 
            matchesMeterBrand && matchesMeterSize && matchesMeterYear && matchesMeterGroup) {
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

export default function ClientDatabase() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSettlement, setSelectedSettlement] = useState([]);
  const [selectedStreet, setSelectedStreet] = useState([]);
  const [selectedMeterBrand, setSelectedMeterBrand] = useState([]);
  const [selectedMeterSize, setSelectedMeterSize] = useState([]);
  const [selectedMeterYear, setSelectedMeterYear] = useState([]);
  const [selectedMeterGroups, setSelectedMeterGroups] = useState([]);
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [settlements, setSettlements] = useState(['Всі']);
  const [streets, setStreets] = useState(['Всі']);
  const [meterBrands, setMeterBrands] = useState(['Всі']);
  const [meterSizes, setMeterSizes] = useState(['Всі']);
  const [meterYears, setMeterYears] = useState(['Всі']);
  const [meterGroups, setMeterGroups] = useState([]);
  const pageSize = 50;
  
  // Додаємо ref для debounce таймера та debouncedSearchTerm
  const searchTimeoutRef = useRef(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // State для відкритих dropdown
  const [openDropdown, setOpenDropdown] = useState(null);

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

  useEffect(() => {
    loadClients();
    loadTotalCount();
    loadSettlements();
    loadStreets();
    loadMeterData();
  }, [currentPage]);

  useEffect(() => {
    if (debouncedSearchTerm || selectedSettlement.length > 0 || selectedStreet.length > 0 || 
        selectedMeterBrand.length > 0 || selectedMeterSize.length > 0 || selectedMeterYear.length > 0 || selectedMeterGroups.length > 0) {
      performSearch();
    } else {
      loadClients();
    }
  }, [debouncedSearchTerm, selectedSettlement, selectedStreet, selectedMeterBrand, selectedMeterSize, selectedMeterYear, selectedMeterGroups]);

  // Динамічне оновлення фільтрів на основі вибраних значень
  useEffect(() => {
    const updateDynamicFilters = async () => {
      const allClients = await getAllClients();
      
      // Фільтруємо клієнтів на основі всіх обраних фільтрів
      let filteredClients = allClients;
      
      if (selectedSettlement.length > 0) {
        filteredClients = filteredClients.filter(c => selectedSettlement.includes(c.settlement));
      }
      
      if (selectedStreet.length > 0) {
        filteredClients = filteredClients.filter(c => {
          const clientStreetName = [c.streetType, c.street].filter(s => s).join(' ');
          return selectedStreet.includes(clientStreetName);
        });
      }
      
      if (selectedMeterBrand.length > 0) {
        filteredClients = filteredClients.filter(c => selectedMeterBrand.includes(c.meterBrand));
      }
      
      if (selectedMeterSize.length > 0) {
        filteredClients = filteredClients.filter(c => selectedMeterSize.includes(c.meterSize));
      }
      
      if (selectedMeterYear.length > 0) {
        filteredClients = filteredClients.filter(c => selectedMeterYear.includes(c.meterYear));
      }
      
      if (selectedMeterGroups.length > 0) {
        filteredClients = filteredClients.filter(c => selectedMeterGroups.includes(c.meterGroup));
      }
      
      // Оновлюємо список вулиць
      if (selectedSettlement.length > 0 || selectedMeterBrand.length > 0 || selectedMeterSize.length > 0 || selectedMeterYear.length > 0 || selectedMeterGroups.length > 0) {
        const uniqueStreets = [...new Set(filteredClients.map(c => {
          const streetName = [c.streetType, c.street].filter(s => s).join(' ');
          return streetName;
        }).filter(s => s))].sort();
        setStreets(uniqueStreets);
      } else {
        await loadStreets();
      }
      
      // Оновлюємо список марок лічильників
      if (selectedSettlement.length > 0 || selectedStreet.length > 0 || selectedMeterSize.length > 0 || selectedMeterYear.length > 0 || selectedMeterGroups.length > 0) {
        const uniqueBrands = [...new Set(filteredClients.map(c => c.meterBrand).filter(b => b))].sort();
        setMeterBrands(uniqueBrands);
      } else {
        const uniqueBrands = [...new Set(allClients.map(c => c.meterBrand).filter(b => b))].sort();
        setMeterBrands(uniqueBrands);
      }
      
      // Оновлюємо список типорозмірів
      if (selectedSettlement.length > 0 || selectedStreet.length > 0 || selectedMeterBrand.length > 0 || selectedMeterYear.length > 0 || selectedMeterGroups.length > 0) {
        const uniqueSizes = [...new Set(filteredClients.map(c => c.meterSize).filter(s => s))].sort();
        setMeterSizes(uniqueSizes);
      } else {
        const uniqueSizes = [...new Set(allClients.map(c => c.meterSize).filter(s => s))].sort();
        setMeterSizes(uniqueSizes);
      }
      
      // Оновлюємо список років
      if (selectedSettlement.length > 0 || selectedStreet.length > 0 || selectedMeterBrand.length > 0 || selectedMeterSize.length > 0 || selectedMeterGroups.length > 0) {
        const uniqueYears = [...new Set(filteredClients.map(c => c.meterYear).filter(y => y))].sort((a, b) => b - a);
        setMeterYears(uniqueYears);
      } else {
        const uniqueYears = [...new Set(allClients.map(c => c.meterYear).filter(y => y))].sort((a, b) => b - a);
        setMeterYears(uniqueYears);
      }
      
      // Оновлюємо список груп лічильників
      if (selectedSettlement.length > 0 || selectedStreet.length > 0 || selectedMeterBrand.length > 0 || selectedMeterSize.length > 0 || selectedMeterYear.length > 0) {
        const uniqueGroups = [...new Set(filteredClients.map(c => c.meterGroup).filter(g => g))].sort();
        setMeterGroups(uniqueGroups);
      } else {
        const uniqueGroups = [...new Set(allClients.map(c => c.meterGroup).filter(g => g))].sort();
        setMeterGroups(uniqueGroups);
      }
    };
    
    updateDynamicFilters();
  }, [selectedSettlement, selectedStreet, selectedMeterBrand, selectedMeterSize, selectedMeterYear, selectedMeterGroups]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await getClientsByPage(currentPage, pageSize);
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
    setLoading(false);
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

  const performSearch = async () => {
    setLoading(true);
    try {
      const results = await searchClients(debouncedSearchTerm, selectedSettlement, selectedStreet,
                                         selectedMeterBrand, selectedMeterSize, selectedMeterYear, selectedMeterGroups);
      setClients(results);
    } catch (error) {
      console.error('Error searching:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.accountNumber || !formData.fullName) {
      alert('Заповніть обов\'язкові поля: Особовий рахунок та ПІБ');
      return;
    }
    
    try {
      if (editingClient) {
        await updateClient({ ...formData, id: editingClient.id });
      } else {
        await addClient(formData);
      }
      await loadClients();
      await loadTotalCount();
      await loadSettlements();
      await loadStreets();
      await loadMeterData();
      resetForm();
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Помилка при збереженні клієнта');
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData(client);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити клієнта з бази?')) return;
    
    try {
      await deleteClient(id);
      await loadClients();
      await loadTotalCount();
      await loadSettlements();
      await loadStreets();
      await loadMeterData();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Помилка при видаленні клієнта');
    }
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        let imported = 0;
        for (const row of jsonData) {
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
        }
        
        await loadClients();
        await loadTotalCount();
        await loadSettlements();
        await loadStreets();
        await loadMeterData();
        alert(`Імпортовано ${imported} клієнтів`);
      } catch (error) {
        console.error('Import error:', error);
        alert('Помилка при імпорті файлу');
      }
      setLoading(false);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleExportExcel = async () => {
    setLoading(true);
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
    } catch (error) {
      console.error('Export error:', error);
      alert('Помилка при експорті');
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

  const totalPages = Math.ceil(totalCount / pageSize);

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
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    return (
      <div className="relative w-full sm:w-auto" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setOpenDropdown(isOpen ? null : name)}
          className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-left flex items-center justify-between min-w-full sm:min-w-[180px] text-sm sm:text-base">
          <span className="truncate">{getFilterLabel(selected, options, label)}</span>
          <svg className={`w-4 h-4 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {options.length === 0 ? (
              <div className="px-4 py-2 text-gray-400 text-sm">Немає опцій</div>
            ) : (
              options.map(option => (
                <label
                  key={option}
                  className="flex items-center px-3 sm:px-4 py-3 sm:py-2 hover:bg-indigo-50 cursor-pointer active:bg-indigo-100">
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={() => {
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
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-900 mb-4 sm:mb-6">База абонентів газопостачання</h1>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 min-w-full sm:min-w-[250px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Пошук..."
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
                value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }} />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                  <X size={20} />
                </button>
              )}
            </div>
            
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

          <div className="flex flex-col sm:flex-row gap-3 mb-4">

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
            

            
            {(searchTerm || selectedSettlement.length > 0 || selectedStreet.length > 0 || 
              selectedMeterBrand.length > 0 || selectedMeterSize.length > 0 || selectedMeterYear.length > 0 || selectedMeterGroups.length > 0) && (
              <button onClick={() => {
                setSearchTerm('');
                setSelectedSettlement([]);
                setSelectedStreet([]);
                setSelectedMeterBrand([]);
                setSelectedMeterSize([]);
                setSelectedMeterYear([]);
                setSelectedMeterGroups([]);
                setCurrentPage(0);
              }}
                className="px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg flex items-center gap-2 transition-colors">
                <X size={18} /> Скинути фільтри
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3 mb-4 sm:mb-6">
            <button onClick={handleDownloadTemplate}
              className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white px-3 sm:px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors text-xs sm:text-sm">
              <FileText size={16} className="sm:w-[18px] sm:h-[18px]" /> 
              <span className="hidden sm:inline">Шаблон</span>
              <span className="sm:hidden">Шаблон</span>
            </button>
            <label className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-3 sm:px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs sm:text-sm">
              <Upload size={16} className="sm:w-[18px] sm:h-[18px]" /> 
              <span className="hidden sm:inline">Імпорт</span>
              <span className="sm:hidden">Імпорт</span>
              <input type="file" accept=".xlsx,.xls" onChange={handleImportExcel} className="hidden" disabled={loading} />
            </label>
            <button onClick={handleExportExcel} disabled={totalCount === 0 || loading}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-3 sm:px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors text-xs sm:text-sm">
              <Download size={16} className="sm:w-[18px] sm:h-[18px]" /> 
              <span className="hidden sm:inline">Експорт</span>
              <span className="sm:hidden">Експорт</span>
            </button>
            <button onClick={() => setIsModalOpen(true)} disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-3 sm:px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors text-xs sm:text-sm">
              <Plus size={16} className="sm:w-[18px] sm:h-[18px]" /> 
              <span className="hidden sm:inline">Додати</span>
              <span className="sm:hidden">Додати</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <div className="text-xs sm:text-sm text-gray-600">
              Всього: {totalCount} | Показано: {clients.length}
            </div>
            
            {!searchTerm && selectedSettlement.length === 0 && selectedStreet.length === 0 && 
             selectedMeterBrand.length === 0 && selectedMeterSize.length === 0 && selectedMeterYear.length === 0 && selectedMeterGroups.length === 0 && totalPages > 1 && (
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0 || loading}
                  className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-gray-600">
                  Сторінка {currentPage + 1} з {totalPages}
                </span>
                <button onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage >= totalPages - 1 || loading}
                  className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>

          {loading && <div className="text-center py-8 text-gray-500">Завантаження...</div>}

          {!loading && (
            <div className="space-y-2 sm:space-y-3">
              {clients.map(c => (
                <div key={c.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div onClick={() => setExpandedClientId(expandedClientId === c.id ? null : c.id)}
                    className="p-3 sm:p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{c.fullName}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          {c.settlement}, {c.streetType} {c.street}, буд. {c.building}{c.buildingLetter}
                          {c.apartment && `, кв. ${c.apartment}${c.apartmentLetter}`}
                        </p>
                        <p className="text-xs sm:text-sm text-indigo-600 font-medium mt-1">
                          Особовий рахунок: {c.accountNumber}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 items-end sm:items-start flex-shrink-0">
                        {c.temporaryAbsent && <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-yellow-100 text-yellow-800 text-[10px] sm:text-xs rounded whitespace-nowrap">Відсутній</span>}
                        {c.dacha && <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-800 text-[10px] sm:text-xs rounded whitespace-nowrap">Дача</span>}
                        {c.gasDisconnected === 'Так' && <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-100 text-red-800 text-[10px] sm:text-xs rounded whitespace-nowrap">Вимкнено</span>}
                        <div className="ml-2 text-gray-400 text-lg sm:text-base">{expandedClientId === c.id ? '▼' : '▶'}</div>
                      </div>
                    </div>
                  </div>

                  {expandedClientId === c.id && (
                    <div className="border-t border-gray-200 bg-gray-50 p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row gap-2 mb-4">
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(c); }} 
                          className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 text-blue-600 hover:bg-blue-100 active:bg-blue-200 rounded-lg flex items-center justify-center gap-2 text-sm">
                          <Edit2 size={16} /> Редагувати
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} 
                          className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 text-red-600 hover:bg-red-100 active:bg-red-200 rounded-lg flex items-center justify-center gap-2 text-sm">
                          <Trash2 size={16} /> Видалити
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                        <div className="bg-blue-50 p-2.5 sm:p-3 rounded-lg">
                          <p className="text-xs font-semibold text-blue-900 mb-2">ОСОБОВІ ДАНІ</p>
                          <div className="space-y-1 text-xs sm:text-sm">
                            <p className="text-gray-700"><span className="font-medium">Особовий рахунок:</span> {c.accountNumber}</p>
                            {c.eic && <p className="text-gray-700"><span className="font-medium">EIC:</span> {c.eic}</p>}
                            {c.phone && <div className="flex items-center gap-2"><Phone size={14} className="text-gray-500" /><a href={`tel:${c.phone}`} className="text-blue-600">{c.phone}</a></div>}
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
                    </div>
                  )}
                </div>
              ))}

              {clients.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  {searchTerm || selectedSettlement.length > 0 || selectedStreet.length > 0 || 
                   selectedMeterBrand.length > 0 || selectedMeterSize.length > 0 || selectedMeterYear.length > 0 || selectedMeterGroups.length > 0
                   ? 'Нічого не знайдено' : 'Немає жодного клієнта. Додайте першого!'}
                </div>
              )}
            </div>
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