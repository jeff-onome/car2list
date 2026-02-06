import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/database';

const COUNTRY_DATA: Record<string, string[]> = {
  "United States": ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"],
  "Canada": ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Nova Scotia", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan"],
  "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland"],
  "Germany": ["Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hesse", "Lower Saxony", "Mecklenburg-Vorpommern", "North Rhine-Westphalia", "Rhineland-Palatinate", "Saarland", "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia"],
  "France": ["Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Brittany", "Centre-Val de Loire", "Corsica", "Grand Est", "Hauts-de-France", "Île-de-France", "Normandy", "Nouvelle-Aquitaine", "Occitanie", "Pays de la Loire", "Provence-Alpes-Côte d'Azur"],
  "Italy": ["Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna", "Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardy", "Marche", "Molise", "Piedmont", "Apulia", "Sardinia", "Sicily", "Tuscany", "Trentino-South Tyrol", "Umbria", "Aosta Valley", "Veneto"],
  "Spain": ["Andalusia", "Aragon", "Asturias", "Balearic Islands", "Basque Country", "Canary Islands", "Cantabria", "Castile and León", "Castile-La Mancha", "Catalonia", "Extremadura", "Galicia", "Madrid", "Murcia", "Navarre", "La Rioja", "Valencia"],
  "Japan": ["Hokkaido", "Tohoku", "Kanto", "Chubu", "Kansai", "Chugoku", "Shikoku", "Kyushu"],
  "China": ["Anhui", "Beijing", "Chongqing", "Fujian", "Gansu", "Guangdong", "Guangxi", "Guizhou", "Hainan", "Hebei", "Heilongjiang", "Henan", "Hubei", "Hunan", "Jiangsu", "Jiangxi", "Jilin", "Liaoning", "Ningxia", "Qinghai", "Shaanxi", "Shandong", "Shanghai", "Shanxi", "Sichuan", "Tianjin", "Tibet", "Xinjiang", "Yunnan", "Zhejiang"],
  "India": ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"],
  "Australia": ["New South Wales", "Queensland", "South Australia", "Tasmania", "Victoria", "Western Australia", "Northern Territory", "ACT"],
  "Brazil": ["Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal", "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia", "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"],
  "Mexico": ["Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua", "Coahuila", "Colima", "Durango", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "México", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"],
  "South Korea": ["Seoul", "Busan", "Daegu", "Incheon", "Gwangju", "Daejeon", "Ulsan", "Gyeonggi", "Gangwon", "Chungcheong", "Jeolla", "Gyeongsang", "Jeju"],
  "Russia": ["Central", "Northwestern", "Southern", "North Caucasian", "Volga", "Ural", "Siberian", "Far Eastern"],
  "Switzerland": ["Aargau", "Appenzell Ausserrhoden", "Appenzell Innerrhoden", "Basel-Landschaft", "Basel-Stadt", "Bern", "Fribourg", "Geneva", "Glarus", "Graubünden", "Jura", "Lucerne", "Neuchâtel", "Nidwalden", "Obwalden", "Schaffhausen", "Schwyz", "Solothurn", "St. Gallen", "Thurgau", "Ticino", "Uri", "Valais", "Vaud", "Zug", "Zurich"],
  "United Arab Emirates": ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"],
  "Saudi Arabia": ["Riyadh", "Makkah", "Madinah", "Eastern Province", "Qassim", "Ha'il", "Tabuk", "Northern Borders", "Jazan", "Najran", "Baha", "Jawf", "Asir"],
  "Netherlands": ["Drenthe", "Flevoland", "Friesland", "Gelderland", "Groningen", "Limburg", "North Brabant", "North Holland", "Overijssel", "South Holland", "Utrecht", "Zeeland"],
  "Sweden": ["Stockholm", "Västerbotten", "Norrbotten", "Uppsala", "Södermanland", "Östergötland", "Jönköping", "Kronoberg", "Kalmar", "Gotland", "Blekinge", "Skåne", "Halland", "Västra Götaland", "Värmland", "Örebro", "Västmanland", "Dalarna", "Gävleborg", "Västernorrland", "Jämtland"],
  "Norway": ["Agder", "Innlandet", "Møre og Romsdal", "Nordland", "Oslo", "Rogaland", "Troms og Finnmark", "Trøndelag", "Vestfold og Telemark", "Vestland", "Viken"],
  "Denmark": ["Capital Region", "Central Denmark", "North Denmark", "Region Zealand", "Region of Southern Denmark"],
  "Finland": ["Lapland", "North Ostrobothnia", "Kainuu", "North Karelia", "North Savo", "South Savo", "South Ostrobothnia", "Ostrobothnia", "Pirkanmaa", "Satakunta", "Central Finland", "Southwest Finland", "South Karelia", "Päijät-Häme", "Kanta-Häme", "Uusimaa", "Kymenlaakso", "Åland"],
  "Belgium": ["Antwerp", "East Flanders", "Flemish Brabant", "Limburg", "West Flanders", "Hainaut", "Liège", "Luxembourg", "Namur", "Walloon Brabant", "Brussels"],
  "Austria": ["Burgenland", "Carinthia", "Lower Austria", "Upper Austria", "Salzburg", "Styria", "Tyrol", "Vorarlberg", "Vienna"],
  "Portugal": ["Aveiro", "Beja", "Braga", "Bragança", "Castelo Branco", "Coimbra", "Évora", "Faro", "Guarda", "Leiria", "Lisbon", "Portalegre", "Porto", "Santarém", "Setúbal", "Viana do Castelo", "Vila Real", "Viseu", "Azores", "Madeira"],
  "Greece": ["Attica", "Central Greece", "Central Macedonia", "Crete", "East Macedonia and Thrace", "Epirus", "Ionian Islands", "North Aegean", "Peloponnese", "South Aegean", "Thessaly", "Western Greece", "Western Macedonia"],
  "Turkey": ["Marmara", "Aegean", "Central Anatolia", "Mediterranean", "Black Sea", "Southeastern Anatolia", "Eastern Anatolia"],
  "Israel": ["Central", "Haifa", "Jerusalem", "Northern", "Southern", "Tel Aviv"],
  "Singapore": ["Central", "North", "North-East", "East", "West"],
  "Malaysia": ["Johor", "Kedah", "Kelantan", "Malacca", "Negeri Sembilan", "Pahang", "Penang", "Perak", "Perlis", "Sabah", "Sarawak", "Selangor", "Terengganu"],
  "Indonesia": ["Java", "Sumatra", "Kalimantan", "Sulawesi", "Papua", "Nusa Tenggara", "Maluku"],
  "Thailand": ["Central", "Northern", "Northeastern", "Eastern", "Southern"],
  "Vietnam": ["North", "Central", "South"],
  "Philippines": ["Luzon", "Visayas", "Mindanao"],
  "South Africa": ["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape"],
  "Nigeria": ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"],
  "Egypt": ["Alexandria", "Aswan", "Asyut", "Beheira", "Beni Suef", "Cairo", "Dakahlia", "Damietta", "Faiyum", "Gharbia", "Giza", "Ismailia", "Kafr El Sheikh", "Luxor", "Matrouh", "Minya", "Monufia", "New Valley", "North Sinai", "Port Said", "Qalyubia", "Qena", "Red Sea", "Sharqia", "Sohag", "South Sinai", "Suez"],
  "Argentina": ["Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"],
  "Chile": ["Arica and Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo", "Valparaíso", "Metropolitana", "O'Higgins", "Maule", "Ñuble", "Biobío", "Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes"],
  "Colombia": ["Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá", "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta", "Nariño", "Norte de Santander", "Putumayo", "Quindío", "Risaralda", "San Andrés", "Santander", "Sucre", "Tolima", "Valle del Cauca", "Vaupés", "Vichada"],
  "Peru": ["Amazonas", "Ancash", "Apurímac", "Arequipa", "Ayacucho", "Cajamarca", "Callao", "Cusco", "Huancavelica", "Huánuco", "Ica", "Junín", "La Libertad", "Lambayeque", "Lima", "Loreto", "Madre de Dios", "Moquegua", "Pasco", "Piura", "Puno", "San Martín", "Tacna", "Tumbes", "Ucayali"],
  "Poland": ["Greater Poland", "Kuyavian-Pomeranian", "Lesser Poland", "Łódź", "Lower Silesian", "Lublin", "Lubusz", "Masovian", "Opole", "Podlaskie", "Pomeranian", "Silesian", "Subcarpathian", "Holy Cross", "Warmian-Masurian", "West Pomeranian"],
  "Czech Republic": ["Prague", "Central Bohemian", "South Bohemian", "Plzeň", "Karlovy Vary", "Ústí nad Labem", "Liberec", "Hradec Králové", "Pardubice", "Vysočina", "South Moravian", "Olomouc", "Zlín", "Moravian-Silesian"],
  "Hungary": ["Budapest", "Bács-Kiskun", "Baranya", "Békés", "Borsod-Abaúj-Zemplén", "Csongrád-Csanád", "Fejér", "Győr-Moson-Sopron", "Hajdú-Bihar", "Heves", "Jász-Nagykun-Szolnok", "Komárom-Esztergom", "Nógrád", "Pest", "Somogy", "Szabolcs-Szatmár-Bereg", "Tolna", "Vas", "Veszprém", "Zala"],
  "Romania": ["Alba", "Arad", "Argeș", "Bacău", "Bihor", "Bistrița-Năsăud", "Botoșani", "Brașov", "Brăila", "Buzău", "Caraș-Severin", "Călărași", "Cluj", "Constanța", "Covasna", "Dâmbovița", "Dolj", "Galați", "Giurgiu", "Gorj", "Harghita", "Hunedoara", "Ialomița", "Iași", "Ilfov", "Maramureș", "Mehedinți", "Mureș", "Neamț", "Olt", "Prahova", "Satu Mare", "Sălaj", "Sibiu", "Suceava", "Teleorman", "Timiș", "Tulcea", "Vaslui", "Vâlcea", "Vrancea", "Bucharest"],
  "Ukraine": ["Cherkasy", "Chernihiv", "Chernivtsi", "Crimea", "Dnipropetrovsk", "Donetsk", "Ivano-Frankivsk", "Kharkiv", "Kherson", "Khmelnytskyi", "Kyiv", "Kirovohrad", "Luhansk", "Lviv", "Mykolaiv", "Odesa", "Poltava", "Rivne", "Sevastopol", "Sumy", "Ternopil", "Vinnytsia", "Volyn", "Zakarpattia", "Zaporizhzhia", "Zhytomyr"],
  "Ireland": ["Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", "Westmeath", "Wexford", "Wicklow"],
  "New Zealand": ["Auckland", "Bay of Plenty", "Canterbury", "Gisborne", "Hawke's Bay", "Manawatū-Whanganui", "Marlborough", "Nelson", "Northland", "Otago", "Southland", "Taranaki", "Tasman", "Waikato", "Wairarapa", "Wellington", "West Coast"],
  "Pakistan": ["Balochistan", "Khyber Pakhtunkhwa", "Punjab", "Sindh", "Gilgit-Baltistan", "Azad Kashmir", "Islamabad"],
  "Bangladesh": ["Barishal", "Chattogram", "Dhaka", "Khulna", "Rajshahi", "Rangpur", "Mymensingh", "Sylhet"],
  "Qatar": ["Ad-Dawhah", "Al-Khawr", "Al-Wakrah", "Ar-Rayyan", "Ash-Shamal", "Umm Salal", "Al-Dayyan", "Al-Shahaniya"],
  "Kuwait": ["Al Asimah", "Hawalli", "Farwaniya", "Mubarak Al-Kabeer", "Ahmadi", "Jahra"],
  "Oman": ["Muscat", "Dhofar", "Musandam", "Buraimi", "Ad Dakhiliyah", "Al Batinah", "Al Wusta", "Ash Sharqiyah", "Ad Dhahirah"],
  "Bahrain": ["Capital", "Muharraq", "Northern", "Southern"],
  "Kazakhstan": ["Almaty", "Nur-Sultan", "Shymkent", "Akmola", "Aktobe", "Almaty Region", "Atyrau", "East Kazakhstan", "Jambyl", "Karaganda", "Kostanay", "Kyzylorda", "Mangystau", "North Kazakhstan", "Pavlodar", "Turkistan", "West Kazakhstan"],
  "Luxembourg": ["Diekirch", "Grevenmacher", "Luxembourg"],
  "Monaco": ["Monte Carlo", "La Condamine", "Monaco-Ville", "Fontvieille"],
  "Hong Kong": ["Hong Kong Island", "Kowloon", "New Territories"],
  "Iceland": ["Capital Region", "Southern Peninsula", "Western Region", "Westfjords", "Northwestern Region", "Northeastern Region", "Eastern Region", "Southern Region"],
  "Morocco": ["Casablanca-Settat", "Rabat-Salé-Kénitra", "Marrakesh-Safi", "Fès-Meknès", "Tanger-Tetouan-Al Hoceima", "Oriental", "Béni Mellal-Khénifra", "Drâa-Tafilalet", "Souss-Massa", "Guelmim-Oued Noun", "Laâyoune-Sakia El Hamra", "Dakhla-Oued Ed-Dahab"],
  "Kenya": ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Central", "Coast", "Eastern", "North Eastern", "Nyanza", "Rift Valley", "Western"],
  "Ghana": ["Greater Accra", "Ashanti", "Central", "Eastern", "Western", "Volta", "Northern", "Upper East", "Upper West", "Bono", "Bono East", "Ahafo", "Savannah", "North East", "Oti", "Western North"],
  "Ethiopia": ["Addis Ababa", "Afar", "Amhara", "Benishangul-Gumuz", "Dire Dawa", "Gambela", "Harari", "Oromia", "Sidama", "Somali", "South West", "Southern"],
  "Jordan": ["Amman", "Zarqa", "Irbid", "Aqaba", "Madaba", "Mafraq", "Balqa", "Jerash", "Ajloun", "Karak", "Tafilah", "Ma'an"],
  "Lebanon": ["Beirut", "Mount Lebanon", "North Lebanon", "Akkar", "Beqaa", "Baalbek-Hermel", "South Lebanon", "Nabatieh"],
  "Panama": ["Panama City", "Bocas del Toro", "Chiriquí", "Coclé", "Colón", "Darién", "Herrera", "Los Santos", "Veraguas", "Panamá Oeste"],
  "Costa Rica": ["San José", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limón"],
  "Uruguay": ["Artigas", "Canelones", "Cerro Largo", "Colonia", "Durazno", "Flores", "Florida", "Lavalleja", "Maldonado", "Montevideo", "Paysandú", "Río Negro", "Rivera", "Rocha", "Salto", "San José", "Soriano", "Tacuarembó", "Treinta y Tres"],
  "Azerbaijan": ["Absheron", "Ganja-Dashkasan", "Lankaran-Astara", "Shaki-Zaqatala", "Guba-Khachmaz", "Central Aran", "Karabakh", "East Zangezur", "Nakhchivan"]
};

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    state: '',
    password: '',
    confirmPassword: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'email') setEmailError('');
    setFormData(prev => ({ 
      ...prev, 
      [name]: value,
      // If country changes, reset state
      ...(name === 'country' ? { state: '' } : {}) 
    }));
  };

  const states = useMemo(() => {
    return formData.country ? COUNTRY_DATA[formData.country] || [] : [];
  }, [formData.country]);

  const countries = useMemo(() => {
    return Object.keys(COUNTRY_DATA).sort();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    setEmailError('');

    try {
      // Check for existing identity in the registry
      const users = await dbService.getUsers();
      const existingUser = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase());

      if (existingUser) {
        setEmailError('This email is already associated with an active membership.');
        setIsSubmitting(false);
        return;
      }
      
      // Determine Role
      let role: 'USER' | 'ADMIN' | 'DEALER' = 'USER';
      if (formData.email.toLowerCase().startsWith('admin')) role = 'ADMIN';
      if (formData.email.toLowerCase().startsWith('dealer')) role = 'DEALER';

      const userId = `u_${Date.now()}`;
      const userData = {
        id: userId,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password, // Persisting password for strict login check
        role: role,
        isVerified: false,
        joinedAt: new Date().toISOString(),
        location: {
          country: formData.country,
          state: formData.state
        }
      };

      // Save to Firebase
      await dbService.saveUser(userId, userData as any);
      // Login locally
      login(role, userData as any);
      // Success redirection
      navigate('/register-success');
    } catch (error) {
      console.error("Registration sync failed:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-20">
      <div className="max-w-2xl w-full glass p-10 md:p-16 rounded-[3rem] border-white/5 shadow-2xl">
        <div className="text-center mb-12">
          <Link to="/" className="text-2xl font-bold tracking-tighter gradient-text uppercase block mb-4">AutoSphere</Link>
          <h1 className="text-3xl font-bold uppercase tracking-tighter">Membership Application</h1>
          <p className="text-zinc-500 text-sm mt-2 uppercase tracking-widest">Join our exclusive global network of collectors.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RegisterInput label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
            <RegisterInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
          </div>

          <div className="relative">
            {emailError && (
              <p className="text-red-500 text-[9px] uppercase tracking-[0.2em] ml-4 mb-2 font-bold animate-pulse">
                {emailError}
              </p>
            )}
            <RegisterInput label="Email Address" type="email" name="email" value={formData.email} onChange={handleInputChange} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4">Country</label>
              <div className="relative">
                <select 
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 appearance-none text-zinc-300 transition-all hover:bg-zinc-800"
                >
                  <option value="">Select Country</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4">State / Province / Region</label>
              <div className="relative">
                <select 
                  name="state"
                  required
                  disabled={!formData.country}
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 appearance-none disabled:opacity-30 text-zinc-300 transition-all hover:bg-zinc-800"
                >
                  <option value="">{formData.country ? `Select Region in ${formData.country}` : 'Select Country First'}</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RegisterInput label="Password" type="password" name="password" value={formData.password} onChange={handleInputChange} required />
            <RegisterInput label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required />
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full bg-white text-black py-5 rounded-full font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl active:scale-[0.98] ${isSubmitting ? 'opacity-50' : ''}`}
            >
              {isSubmitting ? 'Synchronizing...' : 'Apply for Membership'}
            </button>
          </div>
        </form>

        <div className="mt-10 text-center">
          <p className="text-zinc-500 text-xs uppercase tracking-widest">
            Already a member? <Link to="/login" className="text-white hover:underline transition-colors">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const RegisterInput = ({ label, type = "text", ...props }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4">{label}</label>
    <input 
      type={type}
      className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-zinc-100 hover:bg-zinc-800"
      placeholder={`Your ${label.toLowerCase()}`}
      {...props}
    />
  </div>
);

export default Register;