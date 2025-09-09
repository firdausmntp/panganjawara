import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calculator, Calendar, Droplets, TrendingUp, Thermometer, Target, ArrowLeft, ChevronRight, Cloud, Sun, CloudRain, Sprout, Map, Layers, MapPin, Search, ZoomIn, ZoomOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const EdukasiTools = () => {
  const navigate = useNavigate();
  const [activeCalculator, setActiveCalculator] = useState<string | null>(null);

  // Calculator tools data
  const calculatorTools = [
    {
      id: "pupuk",
      title: "Kalkulator Pupuk",
      description: "Hitung dosis pupuk yang tepat berdasarkan jenis tanaman dan luas lahan",
      icon: Calculator,
      color: "bg-blue-500",
      category: "Nutrisi"
    },
    {
      id: "irigasi",
      title: "Kalkulator Irigasi",
      description: "Hitung kebutuhan air untuk berbagai jenis tanaman",
      icon: Droplets,
      color: "bg-cyan-500", 
      category: "Air"
    },
    {
      id: "jadwal",
      title: "Jadwal Tanam",
      description: "Tentukan waktu tanam terbaik berdasarkan musim dan wilayah",
      icon: Calendar,
      color: "bg-green-500",
      category: "Waktu"
    },
    {
      id: "cuaca",
      title: "Prediksi Cuaca",
      description: "Analisis kondisi cuaca untuk perencanaan pertanian",
      icon: Thermometer,
      color: "bg-orange-500",
      category: "Cuaca"
    }
  ];

  // Fertilizer Calculator Component
  const FertilizerCalculator = () => {
    const [cropType, setCropType] = useState("");
    const [landArea, setLandArea] = useState("");
    const [soilType, setSoilType] = useState("");
    const [growthStage, setGrowthStage] = useState("");
    const [result, setResult] = useState<any>(null);
    const [errors, setErrors] = useState<any>({});

    const validateInputs = () => {
      const newErrors: any = {};
      
      if (!cropType) newErrors.cropType = "Pilih jenis tanaman";
      if (!landArea || parseFloat(landArea) <= 0) newErrors.landArea = "Masukkan luas lahan yang valid";
      if (!soilType) newErrors.soilType = "Pilih jenis tanah";
      if (!growthStage) newErrors.growthStage = "Pilih fase pertumbuhan";
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const calculateFertilizer = () => {
      if (!validateInputs()) return;

      const area = parseFloat(landArea);
      let baseNitrogen = 0;
      let basePhosphorus = 0;
      let basePotassium = 0;

      // Base values per crop type (kg/ha) - berdasarkan rekomendasi umum
      switch (cropType) {
        case "padi":
          baseNitrogen = 200; basePhosphorus = 75; basePotassium = 100;
          break;
        case "jagung":
          baseNitrogen = 250; basePhosphorus = 100; basePotassium = 120;
          break;
        case "kedelai":
          baseNitrogen = 50; basePhosphorus = 75; basePotassium = 75; // N rendah karena fiksasi N
          break;
        case "cabai":
          baseNitrogen = 300; basePhosphorus = 150; basePotassium = 200;
          break;
        case "tomat":
          baseNitrogen = 280; basePhosphorus = 140; basePotassium = 180;
          break;
        case "bawang":
          baseNitrogen = 150; basePhosphorus = 100; basePotassium = 150;
          break;
        default:
          baseNitrogen = 150; basePhosphorus = 75; basePotassium = 100;
      }

      // Adjust berdasarkan jenis tanah
      let soilMultiplier = 1;
      switch (soilType) {
        case "sandy":
          soilMultiplier = 1.3; // Tanah pasir butuh lebih banyak karena mudah tercuci
          break;
        case "clay":
          soilMultiplier = 0.8; // Tanah liat menahan nutrisi lebih baik
          break;
        case "loam":
          soilMultiplier = 1.0; // Tanah ideal
          break;
        case "peat":
          soilMultiplier = 0.7; // Gambut kaya organik
          break;
      }

      // Adjust berdasarkan fase pertumbuhan
      let stageMultiplier = 1;
      switch (growthStage) {
        case "tanam":
          stageMultiplier = 0.3; // 30% dosis total saat tanam
          break;
        case "vegetatif":
          stageMultiplier = 0.4; // 40% dosis total saat vegetatif
          break;
        case "generatif":
          stageMultiplier = 0.3; // 30% dosis total saat generatif
          break;
        case "total":
          stageMultiplier = 1.0; // Total dosis per musim
          break;
      }

      // Hitung per hektar kemudian sesuaikan dengan luas lahan
      const nitrogenPerHa = Math.round(baseNitrogen * soilMultiplier * stageMultiplier);
      const phosphorusPerHa = Math.round(basePhosphorus * soilMultiplier * stageMultiplier);
      const potassiumPerHa = Math.round(basePotassium * soilMultiplier * stageMultiplier);

      const hectares = area / 10000; // Convert m2 to hectares
      const nitrogenNeeded = Math.round(nitrogenPerHa * hectares);
      const phosphorusNeeded = Math.round(phosphorusPerHa * hectares);
      const potassiumNeeded = Math.round(potassiumPerHa * hectares);

      setResult({
        nitrogen: nitrogenNeeded,
        phosphorus: phosphorusNeeded,
        potassium: potassiumNeeded,
        urea: Math.round(nitrogenNeeded / 0.46), // Urea mengandung 46% N
        sp36: Math.round(phosphorusNeeded / 0.36), // SP-36 mengandung 36% P2O5
        kcl: Math.round(potassiumNeeded / 0.60), // KCl mengandung 60% K2O
        phonska: Math.round((nitrogenNeeded + phosphorusNeeded + potassiumNeeded) / 0.45), // NPK Phonska
        area: area,
        hectares: hectares
      });
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="crop-type">Jenis Tanaman</Label>
            <Select value={cropType} onValueChange={setCropType}>
              <SelectTrigger className={errors.cropType ? "border-red-500" : ""}>
                <SelectValue placeholder="Pilih jenis tanaman" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="padi">Padi</SelectItem>
                <SelectItem value="jagung">Jagung</SelectItem>
                <SelectItem value="kedelai">Kedelai</SelectItem>
                <SelectItem value="cabai">Cabai</SelectItem>
                <SelectItem value="tomat">Tomat</SelectItem>
                <SelectItem value="bawang">Bawang Merah</SelectItem>
              </SelectContent>
            </Select>
            {errors.cropType && <p className="text-red-500 text-sm mt-1">{errors.cropType}</p>}
          </div>

          <div>
            <Label htmlFor="land-area">Luas Lahan (m²)</Label>
            <Input
              id="land-area"
              type="number"
              placeholder="Contoh: 5000"
              value={landArea}
              onChange={(e) => setLandArea(e.target.value)}
              className={errors.landArea ? "border-red-500" : ""}
            />
            {errors.landArea && <p className="text-red-500 text-sm mt-1">{errors.landArea}</p>}
          </div>

          <div>
            <Label htmlFor="soil-type">Jenis Tanah</Label>
            <Select value={soilType} onValueChange={setSoilType}>
              <SelectTrigger className={errors.soilType ? "border-red-500" : ""}>
                <SelectValue placeholder="Pilih jenis tanah" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandy">Pasir</SelectItem>
                <SelectItem value="clay">Liat</SelectItem>
                <SelectItem value="loam">Lempung</SelectItem>
                <SelectItem value="peat">Gambut</SelectItem>
              </SelectContent>
            </Select>
            {errors.soilType && <p className="text-red-500 text-sm mt-1">{errors.soilType}</p>}
          </div>

          <div>
            <Label htmlFor="growth-stage">Fase Pertumbuhan</Label>
            <Select value={growthStage} onValueChange={setGrowthStage}>
              <SelectTrigger className={errors.growthStage ? "border-red-500" : ""}>
                <SelectValue placeholder="Pilih fase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tanam">Saat Tanam (30%)</SelectItem>
                <SelectItem value="vegetatif">Vegetatif (40%)</SelectItem>
                <SelectItem value="generatif">Generatif (30%)</SelectItem>
                <SelectItem value="total">Total per Musim</SelectItem>
              </SelectContent>
            </Select>
            {errors.growthStage && <p className="text-red-500 text-sm mt-1">{errors.growthStage}</p>}
          </div>
        </div>
        
        <Button onClick={calculateFertilizer} className="w-full mt-4">
          <Calculator className="w-4 h-4 mr-2" />
          Hitung Kebutuhan Pupuk
        </Button>

        {result && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Hasil Perhitungan untuk {result.area.toLocaleString()} m² ({result.hectares.toFixed(2)} ha)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Kebutuhan Nutrisi</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Nitrogen (N):</span>
                      <span className="font-medium">{result.nitrogen} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fosfor (P):</span>
                      <span className="font-medium">{result.phosphorus} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kalium (K):</span>
                      <span className="font-medium">{result.potassium} kg</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Pupuk Tunggal</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Urea (46% N):</span>
                      <span className="font-medium">{result.urea} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SP-36 (36% P₂O₅):</span>
                      <span className="font-medium">{result.sp36} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>KCl (60% K₂O):</span>
                      <span className="font-medium">{result.kcl} kg</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Pupuk Majemuk</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>NPK Phonska:</span>
                      <span className="font-medium">{result.phonska} kg</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      *Sebagai alternatif pupuk tunggal
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Tips Aplikasi:</strong> Pupuk sebaiknya diberikan bertahap - 30% saat tanam, 40% fase vegetatif, 30% fase generatif untuk efisiensi maksimal.
                  </p>
                </div>
                
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-700">
                    ⚠️ <strong>Disclaimer:</strong> Hasil ini adalah prediksi umum berdasarkan standar rekomendasi. 
                    Untuk hasil optimal, konsultasikan dengan ahli pertanian dan lakukan uji tanah terlebih dahulu.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Irrigation Calculator Component
  const IrrigationCalculator = () => {
    const [cropType, setCropType] = useState("");
    const [landArea, setLandArea] = useState("");
    const [climate, setClimate] = useState("");
    const [growthStage, setGrowthStage] = useState("");
    const [irrigationType, setIrrigationType] = useState("");
    const [result, setResult] = useState<any>(null);
    const [errors, setErrors] = useState<any>({});

    const validateInputs = () => {
      const newErrors: any = {};
      
      if (!cropType) newErrors.cropType = "Pilih jenis tanaman";
      if (!landArea || parseFloat(landArea) <= 0) newErrors.landArea = "Masukkan luas lahan yang valid";
      if (!climate) newErrors.climate = "Pilih kondisi iklim";
      if (!growthStage) newErrors.growthStage = "Pilih fase pertumbuhan";
      if (!irrigationType) newErrors.irrigationType = "Pilih metode irigasi";
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const calculateIrrigation = () => {
      if (!validateInputs()) return;

      const area = parseFloat(landArea);
      let baseCropCoefficient = 0;
      let dailyWaterNeed = 0; // mm/day

      // Koefisien tanaman berdasarkan jenis (Kc values)
      switch (cropType) {
        case "padi":
          baseCropCoefficient = 1.2; // Padi sawah membutuhkan air lebih banyak
          dailyWaterNeed = 8; // mm/day
          break;
        case "jagung":
          baseCropCoefficient = 1.0;
          dailyWaterNeed = 5;
          break;
        case "kedelai":
          baseCropCoefficient = 0.8;
          dailyWaterNeed = 4;
          break;
        case "cabai":
          baseCropCoefficient = 1.1;
          dailyWaterNeed = 6;
          break;
        case "tomat":
          baseCropCoefficient = 1.1;
          dailyWaterNeed = 6;
          break;
        case "bawang":
          baseCropCoefficient = 0.9;
          dailyWaterNeed = 4;
          break;
        default:
          baseCropCoefficient = 1.0;
          dailyWaterNeed = 5;
      }

      // Adjust berdasarkan kondisi iklim
      let climateMultiplier = 1;
      switch (climate) {
        case "kering":
          climateMultiplier = 1.4; // Musim kering butuh lebih banyak
          break;
        case "normal":
          climateMultiplier = 1.0;
          break;
        case "hujan":
          climateMultiplier = 0.6; // Musim hujan butuh lebih sedikit
          break;
      }

      // Adjust berdasarkan fase pertumbuhan
      let stageMultiplier = 1;
      switch (growthStage) {
        case "awal":
          stageMultiplier = 0.7; // Fase awal butuh air lebih sedikit
          break;
        case "vegetatif":
          stageMultiplier = 1.2; // Fase vegetatif butuh air maksimal
          break;
        case "generatif":
          stageMultiplier = 1.1; // Fase generatif juga butuh banyak air
          break;
        case "pematangan":
          stageMultiplier = 0.8; // Fase pematangan dikurangi
          break;
      }

      // Efisiensi berdasarkan metode irigasi
      let efficiency = 1;
      switch (irrigationType) {
        case "sprinkler":
          efficiency = 0.8; // 80% efisien
          break;
        case "drip":
          efficiency = 0.9; // 90% efisien
          break;
        case "furrow":
          efficiency = 0.6; // 60% efisien
          break;
        case "flood":
          efficiency = 0.5; // 50% efisien
          break;
      }

      // Hitung kebutuhan air
      const adjustedWaterNeed = dailyWaterNeed * climateMultiplier * stageMultiplier;
      const dailyWaterPerM2 = adjustedWaterNeed / 1000; // Convert mm to m³ per m²
      const dailyWaterTotal = dailyWaterPerM2 * area;
      const actualWaterNeed = dailyWaterTotal / efficiency; // Account for irrigation efficiency

      setResult({
        dailyNeed: Math.round(actualWaterNeed),
        weeklyNeed: Math.round(actualWaterNeed * 7),
        monthlyNeed: Math.round(actualWaterNeed * 30),
        literPerM2: Math.round(adjustedWaterNeed),
        efficiency: Math.round(efficiency * 100),
        area: area,
        waterLoss: Math.round(actualWaterNeed - dailyWaterTotal),
        irrigationFreq: irrigationType === "drip" ? "2-3 kali/hari" : 
                       irrigationType === "sprinkler" ? "1-2 kali/hari" :
                       "2-3 kali/minggu"
      });
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="crop-type">Jenis Tanaman</Label>
            <Select value={cropType} onValueChange={setCropType}>
              <SelectTrigger className={errors.cropType ? "border-red-500" : ""}>
                <SelectValue placeholder="Pilih jenis tanaman" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="padi">Padi</SelectItem>
                <SelectItem value="jagung">Jagung</SelectItem>
                <SelectItem value="kedelai">Kedelai</SelectItem>
                <SelectItem value="cabai">Cabai</SelectItem>
                <SelectItem value="tomat">Tomat</SelectItem>
                <SelectItem value="bawang">Bawang Merah</SelectItem>
              </SelectContent>
            </Select>
            {errors.cropType && <p className="text-red-500 text-sm mt-1">{errors.cropType}</p>}
          </div>

          <div>
            <Label htmlFor="land-area">Luas Lahan (m²)</Label>
            <Input
              id="land-area"
              type="number"
              placeholder="Contoh: 5000"
              value={landArea}
              onChange={(e) => setLandArea(e.target.value)}
              className={errors.landArea ? "border-red-500" : ""}
            />
            {errors.landArea && <p className="text-red-500 text-sm mt-1">{errors.landArea}</p>}
          </div>

          <div>
            <Label htmlFor="climate">Kondisi Iklim</Label>
            <Select value={climate} onValueChange={setClimate}>
              <SelectTrigger className={errors.climate ? "border-red-500" : ""}>
                <SelectValue placeholder="Pilih kondisi iklim" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kering">Musim Kering</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="hujan">Musim Hujan</SelectItem>
              </SelectContent>
            </Select>
            {errors.climate && <p className="text-red-500 text-sm mt-1">{errors.climate}</p>}
          </div>

          <div>
            <Label htmlFor="growth-stage">Fase Pertumbuhan</Label>
            <Select value={growthStage} onValueChange={setGrowthStage}>
              <SelectTrigger className={errors.growthStage ? "border-red-500" : ""}>
                <SelectValue placeholder="Pilih fase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="awal">Fase Awal</SelectItem>
                <SelectItem value="vegetatif">Vegetatif</SelectItem>
                <SelectItem value="generatif">Generatif</SelectItem>
                <SelectItem value="pematangan">Pematangan</SelectItem>
              </SelectContent>
            </Select>
            {errors.growthStage && <p className="text-red-500 text-sm mt-1">{errors.growthStage}</p>}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="irrigation-type">Metode Irigasi</Label>
            <Select value={irrigationType} onValueChange={setIrrigationType}>
              <SelectTrigger className={errors.irrigationType ? "border-red-500" : ""}>
                <SelectValue placeholder="Pilih metode irigasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="drip">Tetes (Drip) - 90% efisien</SelectItem>
                <SelectItem value="sprinkler">Sprinkler - 80% efisien</SelectItem>
                <SelectItem value="furrow">Alur (Furrow) - 60% efisien</SelectItem>
                <SelectItem value="flood">Genangan - 50% efisien</SelectItem>
              </SelectContent>
            </Select>
            {errors.irrigationType && <p className="text-red-500 text-sm mt-1">{errors.irrigationType}</p>}
          </div>
        </div>
        
        <Button onClick={calculateIrrigation} className="w-full mt-4">
          <Droplets className="w-4 h-4 mr-2" />
          Hitung Kebutuhan Air
        </Button>

        {result && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Droplets className="w-5 h-5 mr-2" />
                Kebutuhan Air untuk {result.area.toLocaleString()} m²
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Kebutuhan Harian</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Air:</span>
                      <span className="font-medium">{result.dailyNeed} liter</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Per m²:</span>
                      <span className="font-medium">{result.literPerM2} liter</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frekuensi:</span>
                      <span className="font-medium">{result.irrigationFreq}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Kebutuhan Periode</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Mingguan:</span>
                      <span className="font-medium">{result.weeklyNeed.toLocaleString()} liter</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bulanan:</span>
                      <span className="font-medium">{result.monthlyNeed.toLocaleString()} liter</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Efisiensi</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Efisiensi:</span>
                      <span className="font-medium">{result.efficiency}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kehilangan Air:</span>
                      <span className="font-medium">{result.waterLoss} liter/hari</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                  <p className="text-sm text-cyan-700">
                    💧 <strong>Tips Irigasi:</strong> Siram pada pagi hari (06:00-08:00) atau sore hari (16:00-18:00) 
                    untuk mengurangi penguapan dan stres tanaman.
                  </p>
                </div>
                
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-700">
                    ⚠️ <strong>Disclaimer:</strong> Hasil ini adalah prediksi berdasarkan kondisi umum. 
                    Kebutuhan air aktual dapat bervariasi tergantung cuaca, kelembaban, dan kondisi spesifik lahan. 
                    Konsultasikan dengan ahli irigasi untuk sistem yang optimal.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Planting Schedule Calculator Component
  const PlantingScheduleCalculator = () => {
    const [cropType, setCropType] = useState("");
    const [region, setRegion] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [result, setResult] = useState<any>(null);
    const [errors, setErrors] = useState<any>({});

    const validateInputs = () => {
      const newErrors: any = {};
      
      if (!cropType) newErrors.cropType = "Pilih jenis tanaman";
      if (!region) newErrors.region = "Pilih wilayah";
      if (!selectedMonth) newErrors.selectedMonth = "Pilih bulan tanam";
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    // Data musim Indonesia berdasarkan bulan
    const getSeasonInfo = (month: number) => {
      // Musim Hujan: Oktober - Maret
      // Musim Kemarau: April - September
      if (month >= 10 || month <= 3) {
        return {
          season: "hujan",
          name: "Musim Hujan",
          icon: CloudRain,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200"
        };
      } else {
        return {
          season: "kemarau",
          name: "Musim Kemarau", 
          icon: Sun,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200"
        };
      }
    };

    // Kalender bulan dengan ikon musim
    const months = [
      { value: 1, name: "Januari", season: getSeasonInfo(1) },
      { value: 2, name: "Februari", season: getSeasonInfo(2) },
      { value: 3, name: "Maret", season: getSeasonInfo(3) },
      { value: 4, name: "April", season: getSeasonInfo(4) },
      { value: 5, name: "Mei", season: getSeasonInfo(5) },
      { value: 6, name: "Juni", season: getSeasonInfo(6) },
      { value: 7, name: "Juli", season: getSeasonInfo(7) },
      { value: 8, name: "Agustus", season: getSeasonInfo(8) },
      { value: 9, name: "September", season: getSeasonInfo(9) },
      { value: 10, name: "Oktober", season: getSeasonInfo(10) },
      { value: 11, name: "November", season: getSeasonInfo(11) },
      { value: 12, name: "Desember", season: getSeasonInfo(12) }
    ];

    const calculatePlantingSchedule = () => {
      if (!validateInputs()) return;

      const month = parseInt(selectedMonth);
      const seasonInfo = getSeasonInfo(month);
      
      // Database rekomendasi tanaman berdasarkan musim
      const cropRecommendations: any = {
        padi: {
          hujan: {
            suitable: true,
            reason: "Padi membutuhkan banyak air, cocok ditanam di musim hujan",
            plantingTime: "Awal musim hujan (Oktober-November)",
            harvestTime: "3-4 bulan kemudian",
            tips: "Pastikan sistem drainase baik untuk menghindari banjir"
          },
          kemarau: {
            suitable: false,
            reason: "Membutuhkan irigasi intensif di musim kemarau",
            plantingTime: "Hanya jika ada irigasi memadai",
            harvestTime: "3-4 bulan kemudian",
            tips: "Gunakan varietas tahan kering dan sistem irigasi yang baik"
          }
        },
        jagung: {
          hujan: {
            suitable: false,
            reason: "Hujan berlebihan dapat menyebabkan penyakit jamur",
            plantingTime: "Akhir musim hujan (Februari-Maret)",
            harvestTime: "3-4 bulan kemudian",
            tips: "Pastikan drainase baik dan hindari genangan air"
          },
          kemarau: {
            suitable: true,
            reason: "Jagung cocok ditanam di awal musim kemarau",
            plantingTime: "Awal musim kemarau (April-Mei)",
            harvestTime: "3-4 bulan kemudian",
            tips: "Siapkan sistem irigasi untuk fase pertumbuhan"
          }
        },
        kedelai: {
          hujan: {
            suitable: false,
            reason: "Curah hujan tinggi dapat merusak kualitas biji",
            plantingTime: "Akhir musim hujan dengan drainase baik",
            harvestTime: "2.5-3 bulan kemudian",
            tips: "Pilih lahan dengan drainase sangat baik"
          },
          kemarau: {
            suitable: true,
            reason: "Kedelai cocok ditanam di musim kemarau",
            plantingTime: "Awal musim kemarau (April-Juni)",
            harvestTime: "2.5-3 bulan kemudian",
            tips: "Pastikan ketersediaan air untuk penyiraman teratur"
          }
        },
        cabai: {
          hujan: {
            suitable: false,
            reason: "Kelembaban tinggi menyebabkan penyakit busuk buah",
            plantingTime: "Akhir musim hujan dengan perlindungan",
            harvestTime: "3-4 bulan kemudian",
            tips: "Gunakan mulsa plastik dan atap pelindung"
          },
          kemarau: {
            suitable: true,
            reason: "Cabai tumbuh optimal di musim kemarau",
            plantingTime: "Musim kemarau (April-Agustus)",
            harvestTime: "3-4 bulan kemudian",
            tips: "Siram teratur pagi dan sore, gunakan mulsa"
          }
        },
        tomat: {
          hujan: {
            suitable: false,
            reason: "Rentan terhadap penyakit layu dan busuk daun",
            plantingTime: "Akhir musim hujan di greenhouse",
            harvestTime: "3-4 bulan kemudian",
            tips: "Gunakan greenhouse atau tunnel untuk perlindungan"
          },
          kemarau: {
            suitable: true,
            reason: "Tomat tumbuh baik di musim kemarau",
            plantingTime: "Musim kemarau (Mei-Juli)",
            harvestTime: "3-4 bulan kemudian",
            tips: "Siram teratur dan gunakan mulsa organik"
          }
        },
        bawang: {
          hujan: {
            suitable: false,
            reason: "Umbi mudah membusuk karena kelembaban tinggi",
            plantingTime: "Akhir musim hujan dengan drainase sempurna",
            harvestTime: "2-3 bulan kemudian",
            tips: "Buat bedengan tinggi dengan drainase sangat baik"
          },
          kemarau: {
            suitable: true,
            reason: "Bawang cocok ditanam di musim kemarau",
            plantingTime: "Musim kemarau (Mei-Juli)",
            harvestTime: "2-3 bulan kemudian",
            tips: "Siram dengan sistem tetes, hindari genangan"
          }
        }
      };

      const recommendation = cropRecommendations[cropType]?.[seasonInfo.season];
      
      setResult({
        month: month,
        seasonInfo: seasonInfo,
        recommendation: recommendation,
        cropName: cropType,
        regionName: region
      });
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="crop-type">Jenis Tanaman</Label>
            <Select value={cropType} onValueChange={setCropType}>
              <SelectTrigger className={errors.cropType ? "border-red-500" : ""}>
                <SelectValue placeholder="Pilih jenis tanaman" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="padi">Padi</SelectItem>
                <SelectItem value="jagung">Jagung</SelectItem>
                <SelectItem value="kedelai">Kedelai</SelectItem>
                <SelectItem value="cabai">Cabai</SelectItem>
                <SelectItem value="tomat">Tomat</SelectItem>
                <SelectItem value="bawang">Bawang Merah</SelectItem>
              </SelectContent>
            </Select>
            {errors.cropType && <p className="text-red-500 text-sm mt-1">{errors.cropType}</p>}
          </div>

          <div>
            <Label htmlFor="region">Wilayah</Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className={errors.region ? "border-red-500" : ""}>
                <SelectValue placeholder="Pilih wilayah" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jawa">Jawa</SelectItem>
                <SelectItem value="sumatra">Sumatra</SelectItem>
                <SelectItem value="kalimantan">Kalimantan</SelectItem>
                <SelectItem value="sulawesi">Sulawesi</SelectItem>
                <SelectItem value="bali-nusa">Bali & Nusa Tenggara</SelectItem>
                <SelectItem value="papua">Papua</SelectItem>
              </SelectContent>
            </Select>
            {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
          </div>
        </div>

        {/* Kalender Bulan dengan Ikon Musim */}
        <div>
          <Label>Pilih Bulan Tanam</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
            {months.map((month) => {
              const IconComponent = month.season.icon;
              return (
                <div
                  key={month.value}
                  onClick={() => setSelectedMonth(month.value.toString())}
                  className={cn(
                    "p-3 rounded-lg border-2 cursor-pointer transition-all duration-200",
                    selectedMonth === month.value.toString()
                      ? "border-primary bg-primary/10"
                      : `${month.season.borderColor} ${month.season.bgColor} hover:border-primary/50`
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <IconComponent className={cn("w-5 h-5", month.season.color)} />
                    <div>
                      <p className="font-medium text-sm">{month.name}</p>
                      <p className={cn("text-xs", month.season.color)}>
                        {month.season.name}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {errors.selectedMonth && <p className="text-red-500 text-sm mt-1">{errors.selectedMonth}</p>}
        </div>
        
        <Button onClick={calculatePlantingSchedule} className="w-full">
          <Calendar className="w-4 h-4 mr-2" />
          Analisis Jadwal Tanam
        </Button>

        {result && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sprout className="w-5 h-5 mr-2" />
                Rekomendasi Jadwal Tanam - {result.cropName} di {result.regionName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Info Musim */}
                <div className={cn("p-4 rounded-lg", result.seasonInfo.bgColor, result.seasonInfo.borderColor, "border")}>
                  <div className="flex items-center space-x-3 mb-2">
                    <result.seasonInfo.icon className={cn("w-6 h-6", result.seasonInfo.color)} />
                    <h4 className={cn("font-semibold", result.seasonInfo.color)}>
                      {result.seasonInfo.name} - {months[result.month - 1].name}
                    </h4>
                  </div>
                </div>

                {/* Rekomendasi */}
                <div className={cn(
                  "p-4 rounded-lg border",
                  result.recommendation.suitable 
                    ? "bg-green-50 border-green-200" 
                    : "bg-red-50 border-red-200"
                )}>
                  <div className="flex items-start space-x-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold",
                      result.recommendation.suitable ? "bg-green-500" : "bg-red-500"
                    )}>
                      {result.recommendation.suitable ? "✓" : "✗"}
                    </div>
                    <div className="flex-1">
                      <h4 className={cn(
                        "font-semibold mb-2",
                        result.recommendation.suitable ? "text-green-700" : "text-red-700"
                      )}>
                        {result.recommendation.suitable ? "Direkomendasikan" : "Tidak Direkomendasikan"}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {result.recommendation.reason}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Waktu Tanam:</strong>
                          <p>{result.recommendation.plantingTime}</p>
                        </div>
                        <div>
                          <strong>Perkiraan Panen:</strong>
                          <p>{result.recommendation.harvestTime}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-2 bg-white/50 rounded">
                        <strong className="text-xs">💡 Tips:</strong>
                        <p className="text-xs mt-1">{result.recommendation.tips}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start space-x-2">
                    <Cloud className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-amber-700">
                        <strong>⚠️ Perhatian Penting:</strong> Jadwal ini berdasarkan pola musim Indonesia secara umum. 
                        Kondisi cuaca saat ini sering tidak menentu akibat perubahan iklim. 
                        <strong> Selalu pantau prakiraan cuaca terkini</strong> dan konsultasikan dengan petani lokal 
                        atau penyuluh pertanian di daerah Anda sebelum memulai penanaman.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Weather Prediction Component
  const WeatherPredictionCalculator = () => {
    const [selectedLayer, setSelectedLayer] = useState("2"); // Default to Curah Hujan
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapZoom, setMapZoom] = useState(1);
    const [mapCenter, setMapCenter] = useState({ lat: -2.5, lng: 118 }); // Indonesia center
    const [locationSearch, setLocationSearch] = useState("");
    const [locationResults, setLocationResults] = useState<any[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<any>(null);
    const [weatherData, setWeatherData] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingWeather, setIsLoadingWeather] = useState(false);

    // API Keys and URLs
    const bmkgWmsUrl = "https://gis.bmkg.go.id/arcgis/services/Peta_Curah_Hujan_dan_Hari_Hujan_/MapServer/WMSServer";
    const geocodeApiKey = "68bff8308fc5a536235903dyid77681";
    const openWeatherApiKey = "5431d6cfeea9ed8e7cf431bd368771b5";

    // Weather translation function
    const translateWeather = (description: string): string => {
      const translations: { [key: string]: string } = {
        // Rain conditions
        "light rain": "hujan ringan",
        "moderate rain": "hujan sedang",
        "heavy rain": "hujan lebat",
        "very heavy rain": "hujan sangat lebat",
        "extreme rain": "hujan ekstrem",
        "freezing rain": "hujan beku",
        "light intensity shower rain": "hujan rintik ringan",
        "shower rain": "hujan rintik",
        "heavy intensity shower rain": "hujan rintik lebat",
        "ragged shower rain": "hujan rintik tidak merata",
        
        // Drizzle conditions
        "light intensity drizzle": "gerimis ringan",
        "drizzle": "gerimis",
        "heavy intensity drizzle": "gerimis lebat",
        "light intensity drizzle rain": "gerimis hujan ringan",
        "drizzle rain": "gerimis hujan",
        "heavy intensity drizzle rain": "gerimis hujan lebat",
        "shower rain and drizzle": "hujan rintik dan gerimis",
        "heavy shower rain and drizzle": "hujan rintik lebat dan gerimis",
        "shower drizzle": "rintik gerimis",
        
        // Thunderstorm conditions
        "thunderstorm with light rain": "petir dengan hujan ringan",
        "thunderstorm with rain": "petir dengan hujan",
        "thunderstorm with heavy rain": "petir dengan hujan lebat",
        "light thunderstorm": "petir ringan",
        "thunderstorm": "petir",
        "heavy thunderstorm": "petir lebat",
        "ragged thunderstorm": "petir tidak merata",
        "thunderstorm with light drizzle": "petir dengan gerimis ringan",
        "thunderstorm with drizzle": "petir dengan gerimis",
        "thunderstorm with heavy drizzle": "petir dengan gerimis lebat",
        
        // Snow conditions
        "light snow": "salju ringan",
        "snow": "salju",
        "heavy snow": "salju lebat",
        "sleet": "hujan es",
        "light shower sleet": "hujan es ringan",
        "shower sleet": "hujan es",
        "light rain and snow": "hujan ringan dan salju",
        "rain and snow": "hujan dan salju",
        "light shower snow": "salju rintik ringan",
        "shower snow": "salju rintik",
        "heavy shower snow": "salju rintik lebat",
        
        // Atmosphere conditions
        "mist": "kabut tipis",
        "smoke": "asap",
        "haze": "kabut asap",
        "sand/dust whirls": "angin pasir/debu",
        "fog": "kabut tebal",
        "sand": "badai pasir",
        "dust": "debu",
        "volcanic ash": "abu vulkanik",
        "squalls": "angin kencang",
        "tornado": "tornado",
        
        // Cloud conditions
        "clear sky": "langit cerah",
        "few clouds": "sedikit berawan",
        "scattered clouds": "awan tersebar",
        "broken clouds": "awan pecah",
        "overcast clouds": "mendung",
        
        // Common descriptions
        "partly cloudy": "sebagian berawan",
        "mostly cloudy": "kebanyakan berawan",
        "sunny": "cerah",
        "windy": "berangin",
        
        // Weather main conditions (single words)
        "clouds": "berawan", 
        "clear": "cerah bersih",
        
        // Additional terms
        "light intensity": "intensitas ringan",
        "heavy intensity": "intensitas lebat",
        "shower": "rintik",
        "broken": "pecah",
        "scattered": "tersebar",
        "overcast": "mendung"
      };
      
      return translations[description.toLowerCase()] || description;
    };
    
    const layers = [
      {
        id: "2",
        name: "Peta Curah Hujan",
        description: "Peta sebaran curah hujan di Indonesia"
      },
      {
        id: "1", 
        name: "Peta Hari Hujan",
        description: "Peta sebaran hari hujan di Indonesia"
      }
    ];

    // Search for location coordinates
    const searchLocation = async () => {
      if (!locationSearch.trim()) return;
      
      setIsSearching(true);
      setLocationResults([]);
      setSelectedLocation(null);
      
      try {
        const response = await fetch(
          `https://geocode.maps.co/search?q=${encodeURIComponent(locationSearch)}&api_key=${geocodeApiKey}`
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
          const processedResults = data
            .slice(0, 8) // Show up to 8 results
            .sort((a: any, b: any) => (b.importance || 0) - (a.importance || 0)) // Sort by importance
            .map((location: any) => ({
              id: location.place_id,
              name: location.display_name,
              lat: parseFloat(location.lat),
              lng: parseFloat(location.lon),
              boundingbox: location.boundingbox,
              type: location.type,
              class: location.class,
              importance: location.importance
            }));
          
          setLocationResults(processedResults);
          
          // Auto-select first result if only one
          if (processedResults.length === 1) {
            selectLocation(processedResults[0]);
          }
        } else {
          alert("Lokasi tidak ditemukan. Coba dengan nama yang lebih spesifik.");
        }
      } catch (error) {
        console.error("Error searching location:", error);
        alert("Terjadi kesalahan saat mencari lokasi.");
      } finally {
        setIsSearching(false);
      }
    };

    // Select a location from search results
    const selectLocation = (location: any) => {
      setSelectedLocation(location);
      setMapCenter({ lat: location.lat, lng: location.lng });
      // Clear search results after selection
      setLocationResults([]);
    };

    // Get icon for location type
    const getLocationIcon = (type: string, className: string) => {
      switch (type) {
        case 'village':
        case 'town':
        case 'city':
          return '🏘️';
        case 'station':
          return '🚉';
        case 'administrative':
          return '🏛️';
        case 'suburb':
        case 'neighbourhood':
          return '🏘️';
        case 'county':
        case 'state':
          return '🗺️';
        case 'country':
          return '🌏';
        case 'island':
          return '🏝️';
        case 'manual':
          return '📍';
        default:
          return '📍';
      }
    };

    // Calculate distance between two coordinates (Haversine formula)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Radius of Earth in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c; // Distance in kilometers
    };

    // Get weather forecast for specific coordinates
    const getWeatherForecast = async (lat: number, lng: number) => {
      setIsLoadingWeather(true);
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${openWeatherApiKey}&units=metric`
        );
        const data = await response.json();
        
        if (data.cod === "200") {
          setWeatherData(data);
        } else {
          throw new Error(data.message || "Failed to fetch weather data");
        }
      } catch (error) {
        console.error("Error fetching weather:", error);
        alert("Terjadi kesalahan saat mengambil data cuaca.");
      } finally {
        setIsLoadingWeather(false);
      }
    };

    // Calculate map bounds based on zoom and center
    const calculateMapBounds = () => {
      const baseWidth = 46; // Base longitude span
      const baseHeight = 17; // Base latitude span
      const zoomFactor = Math.pow(2, mapZoom - 1);
      
      const width = baseWidth / zoomFactor;
      const height = baseHeight / zoomFactor;
      
      const minLng = Math.max(94.971952, mapCenter.lng - width / 2);
      const maxLng = Math.min(141.020042, mapCenter.lng + width / 2);
      const minLat = Math.max(-11.007615, mapCenter.lat - height / 2);
      const maxLat = Math.min(6.076768, mapCenter.lat + height / 2);
      
      return `${minLat},${minLng},${maxLat},${maxLng}`;
    };

    // Generate WMS GetMap URL with zoom and pan
    const generateMapUrl = (layerId: string) => {
      const params = new URLSearchParams({
        SERVICE: "WMS",
        VERSION: "1.3.0",
        REQUEST: "GetMap",
        LAYERS: layerId,
        STYLES: "default",
        CRS: "EPSG:4326",
        BBOX: calculateMapBounds(),
        WIDTH: "800",
        HEIGHT: "600",
        FORMAT: "image/png",
        TRANSPARENT: "TRUE"
      });
      
      return `${bmkgWmsUrl}?${params.toString()}`;
    };

    // Handle map click to get coordinates (approximate)
    const handleMapClick = (event: React.MouseEvent<HTMLImageElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Convert pixel coordinates to geographic coordinates (approximate)
      const bounds = calculateMapBounds().split(',').map(parseFloat);
      const [minLat, minLng, maxLat, maxLng] = bounds;
      
      const lng = minLng + (x / rect.width) * (maxLng - minLng);
      const lat = maxLat - (y / rect.height) * (maxLat - minLat);
      
      setMapCenter({ lat, lng });
      setSelectedLocation({
        id: `manual-${Date.now()}`,
        name: `Koordinat: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        lat,
        lng,
        boundingbox: null,
        type: 'manual',
        class: 'coordinate'
      });
      setLocationResults([]);
    };

    // Generate Legend URL
    const generateLegendUrl = (layerId: string) => {
      const params = new URLSearchParams({
        request: "GetLegendGraphic",
        version: "1.3.0",
        format: "image/png",
        layer: layerId
      });
      
      return `${bmkgWmsUrl}?${params.toString()}`;
    };

    return (
      <div className="space-y-6">
        {/* Location Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Cari Lokasi untuk Prakiraan Cuaca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  placeholder="Masukkan nama lokasi (contoh: Kuta Bumi, Pasar Kemis)"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                  className="flex-1"
                />
                <Button onClick={searchLocation} disabled={isSearching}>
                  <Search className="w-4 h-4 mr-2" />
                  {isSearching ? "Mencari..." : "Cari"}
                </Button>
              </div>
              
              {/* Quick search suggestions */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Coba cari:</p>
                <div className="flex flex-wrap gap-1.5">
                  {["Jakarta", "Surabaya", "Bandung", "Medan", "Denpasar", "Yogyakarta"].map((city) => (
                    <Button
                      key={city}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2 flex-shrink-0"
                      onClick={() => {
                        setLocationSearch(city);
                      }}
                    >
                      {city}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Search Results */}
            {locationResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Pilih lokasi yang sesuai ({locationResults.length} hasil ditemukan):
                </p>
                <div className="max-h-80 overflow-y-auto space-y-2 pb-2">
                  {locationResults.map((location, index) => (
                    <div
                      key={location.id}
                      className="p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all duration-200"
                      onClick={() => selectLocation(location)}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          <span className="text-lg mt-0.5 flex-shrink-0">
                            {getLocationIcon(location.type, "")}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 text-sm sm:text-base leading-tight">{location.name}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-2">
                              <p className="text-xs sm:text-sm text-gray-600">
                                📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {location.type}
                                </Badge>
                                {location.importance && (
                                  <div className="text-xs text-gray-500">
                                    ⭐ {(location.importance * 100).toFixed(0)}%
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="self-center sm:self-start flex-shrink-0 w-full sm:w-auto">
                          Pilih
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Location */}
            {selectedLocation && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3 flex-1">
                    <span className="text-xl mt-1">
                      {getLocationIcon(selectedLocation.type, "")}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-green-800">{selectedLocation.name}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <p className="text-sm text-green-600">
                          📍 {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                        </p>
                        {selectedLocation.type !== 'manual' && (
                          <Badge variant="outline" className="text-xs">
                            {selectedLocation.type}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        ✅ Lokasi terpilih • Klik peta untuk mengubah lokasi
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => getWeatherForecast(selectedLocation.lat, selectedLocation.lng)}
                      disabled={isLoadingWeather}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isLoadingWeather ? "Memuat..." : "Lihat Cuaca"}
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm" 
                      onClick={() => {
                        setSelectedLocation(null);
                        setLocationResults([]);
                      }}
                      title="Hapus lokasi"
                      className="h-8 w-8 p-0 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Layer Selection and Map Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="map-layer">Pilih Peta</Label>
            <Select value={selectedLayer} onValueChange={setSelectedLayer}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis peta" />
              </SelectTrigger>
              <SelectContent>
                {layers.map((layer) => (
                  <SelectItem key={layer.id} value={layer.id}>
                    {layer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              {layers.find(l => l.id === selectedLayer)?.description}
            </p>
          </div>

          <div>
            <Label>Zoom Level</Label>
            <div className="flex items-center justify-center space-x-2 mt-1">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setMapZoom(Math.max(1, mapZoom - 1))}
                disabled={mapZoom <= 1}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium px-3 min-w-[40px] text-center">{mapZoom}x</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setMapZoom(Math.min(5, mapZoom + 1))}
                disabled={mapZoom >= 5}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => setMapLoaded(!mapLoaded)}
              className="w-full"
            >
              <Map className="w-4 h-4 mr-2" />
              {mapLoaded ? "Refresh Peta" : "Tampilkan Peta"}
            </Button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => {
                  setMapZoom(1);
                  setMapCenter({ lat: -2.5, lng: 118 });
                  setSelectedLocation(null);
                  setLocationResults([]);
                }}
                className="text-xs"
              >
                Reset View
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => {
                  setMapZoom(3);
                  setMapCenter({ lat: -7.5, lng: 110 }); // Java center coordinates
                }}
                className="text-xs"
              >
                Zoom Jawa
              </Button>
            </div>
          </div>
        </div>

        {/* Map Display */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cloud className="w-5 h-5 mr-2" />
              Peta Curah Hujan Indonesia - BMKG
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Data resmi dari Badan Meteorologi, Klimatologi, dan Geofisika
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
              {/* Main Map */}
              <div className="xl:col-span-3 order-2 xl:order-1">
                <div className="relative bg-gray-50 rounded-lg overflow-hidden border">
                  {mapLoaded || selectedLayer ? (
                    <div className="relative">
                      <img
                        src={generateMapUrl(selectedLayer)}
                        alt={`Peta ${layers.find(l => l.id === selectedLayer)?.name}`}
                        className="w-full h-auto max-h-[500px] object-contain cursor-crosshair"
                        onLoad={() => setMapLoaded(true)}
                        onError={(e) => {
                          console.error("Error loading map:", e);
                          // Fallback to a placeholder or error message
                        }}
                        onClick={handleMapClick}
                        title="Klik pada peta untuk melihat prakiraan cuaca di lokasi tersebut"
                      />
                      
                      {/* Map Controls Overlay */}
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-md">
                        <div className="flex flex-col space-y-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setMapZoom(Math.min(5, mapZoom + 1))}
                            disabled={mapZoom >= 5}
                            className="h-8 w-8 p-0"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setMapZoom(Math.max(1, mapZoom - 1))}
                            disabled={mapZoom <= 1}
                            className="h-8 w-8 p-0"
                          >
                            <ZoomOut className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Location Marker */}
                      {selectedLocation && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs shadow-md">
                          📍 {selectedLocation.name.split(',')[0]}
                        </div>
                      )}
                      
                      {/* Loading overlay */}
                      {!mapLoaded && (
                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            <span className="text-sm">Memuat peta...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Map className="w-16 h-16 mx-auto mb-4" />
                        <p>Klik "Tampilkan Peta" untuk melihat data curah hujan</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Legend */}
              <div className="xl:col-span-1 order-1 xl:order-2">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Layers className="w-4 h-4 mr-2" />
                    Legenda
                  </h4>
                  
                  {mapLoaded && selectedLayer ? (
                    <div className="space-y-2">
                      <img
                        src={generateLegendUrl(selectedLayer)}
                        alt="Legend"
                        className="w-full h-auto"
                        onError={(e) => {
                          console.error("Error loading legend:", e);
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Satuan: mm/bulan
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Legenda akan muncul setelah peta dimuat
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Map Info */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CloudRain className="w-5 h-5 text-blue-500" />
                  <h4 className="font-semibold">Curah Hujan</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Data curah hujan bulanan di seluruh wilayah Indonesia
                </p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-5 h-5 text-green-500" />
                  <h4 className="font-semibold">Hari Hujan</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Jumlah hari hujan dalam sebulan per wilayah
                </p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Thermometer className="w-5 h-5 text-orange-500" />
                  <h4 className="font-semibold">Update Real-time</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Data diperbarui secara berkala oleh BMKG
                </p>
              </Card>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-start space-x-2">
                <Cloud className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-amber-700">
                    <strong>⚠️ Informasi Penting:</strong> Data curah hujan dan prakiraan cuaca ini bersumber dari BMKG. 
                    Gunakan informasi ini sebagai referensi untuk perencanaan pertanian Anda. 
                    <strong> Selalu periksa update terbaru</strong> dan konsultasikan dengan ahli meteorologi atau penyuluh pertanian 
                    untuk keputusan penting terkait aktivitas pertanian.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weather Forecast Display */}
        {weatherData && (
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center text-base sm:text-lg">
                <div className="flex items-center mb-2 sm:mb-0">
                  <Thermometer className="w-5 h-5 mr-2" />
                  <span>Prakiraan Cuaca 5 Hari</span>
                </div>
                <span className="text-sm sm:text-base font-medium sm:ml-2 text-muted-foreground sm:text-foreground">
                  {weatherData.city.name}
                </span>
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Data dari OpenWeatherMap • Update terakhir: {new Date().toLocaleString('id-ID')}
              </p>
            </CardHeader>
            <CardContent>
              {/* Current Weather */}
              <div className="mb-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg border">
                <h4 className="font-semibold mb-3 text-center sm:text-left">Cuaca Saat Ini</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="text-center p-3 bg-white/50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600 flex items-center justify-center">
                      {Math.round(weatherData.list[0].main.temp)}°C
                      <span className="ml-2 text-base sm:text-lg">
                        {weatherData.list[0].main.temp > 30 ? "🔥" : 
                         weatherData.list[0].main.temp < 20 ? "❄️" : "🌡️"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Temperatur
                      <span className="block text-xs mt-1">
                        Terasa {Math.round(weatherData.list[0].main.feels_like)}°C
                      </span>
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white/50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-cyan-600 flex items-center justify-center">
                      {weatherData.list[0].main.humidity}%
                      <span className="ml-2 text-base sm:text-lg">
                        {weatherData.list[0].main.humidity > 80 ? "💧" : 
                         weatherData.list[0].main.humidity < 40 ? "🏜️" : "💨"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Kelembaban
                      <span className="block text-xs mt-1">
                        {weatherData.list[0].main.humidity > 80 ? "Sangat Lembab" : 
                         weatherData.list[0].main.humidity < 40 ? "Kering" : "Normal"}
                      </span>
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white/50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-green-600 flex items-center justify-center">
                      {Math.round(weatherData.list[0].pop * 100)}%
                      <span className="ml-2 text-base sm:text-lg">
                        {weatherData.list[0].pop > 0.7 ? "🌧️" : 
                         weatherData.list[0].pop > 0.3 ? "🌦️" : "☀️"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Peluang Hujan
                      <span className="block text-xs mt-1">
                        {weatherData.list[0].pop > 0.7 ? "Kemungkinan Tinggi" : 
                         weatherData.list[0].pop > 0.3 ? "Kemungkinan Sedang" : "Kemungkinan Rendah"}
                      </span>
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white/50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-purple-600 flex items-center justify-center">
                      {Math.round(weatherData.list[0].wind.speed * 3.6)} km/h
                      <span className="ml-2 text-base sm:text-lg">
                        {weatherData.list[0].wind.speed > 10 ? "💨" : 
                         weatherData.list[0].wind.speed > 5 ? "🍃" : "🌿"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Kecepatan Angin
                      <span className="block text-xs mt-1">
                        {weatherData.list[0].wind.speed > 10 ? "Kencang" : 
                         weatherData.list[0].wind.speed > 5 ? "Sedang" : "Tenang"}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <p className="text-sm font-medium capitalize">
                    {translateWeather(weatherData.list[0].weather[0].description)}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize mt-1">
                    ({weatherData.list[0].weather[0].description})
                  </p>
                </div>
              </div>

              {/* 5-Day Forecast */}
              <div>
                <h4 className="font-semibold mb-3 text-center sm:text-left">Prakiraan 5 Hari Kedepan</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {weatherData.list.filter((_: any, index: number) => index % 8 === 0).slice(0, 5).map((forecast: any, index: number) => {
                    const date = new Date(forecast.dt * 1000);
                    const isRainy = forecast.weather[0].main.toLowerCase().includes('rain');
                    
                    return (
                      <div key={index} className="p-3 sm:p-4 border rounded-lg text-center hover:bg-gray-50 transition-colors bg-white/50">
                        <p className="font-medium text-sm mb-3">
                          {date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                        
                        <div className="flex justify-center mb-3">
                          {isRainy ? (
                            <CloudRain className="w-7 h-7 sm:w-6 sm:h-6 text-blue-500" />
                          ) : forecast.weather[0].main === 'Clouds' ? (
                            <Cloud className="w-7 h-7 sm:w-6 sm:h-6 text-gray-500" />
                          ) : (
                            <Sun className="w-7 h-7 sm:w-6 sm:h-6 text-yellow-500" />
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <p className="font-bold text-lg sm:text-base">
                            {Math.round(forecast.main.temp)}°C
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Terasa {Math.round(forecast.main.feels_like)}°C
                          </p>
                          <p className="text-xs text-blue-600 font-medium">
                            💧 {Math.round(forecast.pop * 100)}%
                          </p>
                          <p className="text-xs text-muted-foreground capitalize leading-tight">
                            {translateWeather(forecast.weather[0].description)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Agricultural Recommendations */}
              <div className="mt-6 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold mb-3 flex items-center text-green-800">
                  <Sprout className="w-5 h-5 mr-2" />
                  Rekomendasi Pertanian
                </h4>
                <div className="text-sm text-green-700 space-y-3">
                  {weatherData.list[0].main.temp > 30 ? (
                    <p>🌡️ Suhu tinggi: Pastikan irigasi yang cukup dan lindungi tanaman dari panas berlebih</p>
                  ) : weatherData.list[0].main.temp < 20 ? (
                    <p>❄️ Suhu rendah: Perhatikan tanaman sensitif dingin dan pertimbangkan perlindungan</p>
                  ) : (
                    <p>🌡️ Suhu optimal: Kondisi baik untuk pertumbuhan sebagian besar tanaman</p>
                  )}
                  
                  {weatherData.list[0].pop > 0.7 ? (
                    <p>🌧️ Hujan tinggi: Pastikan drainase baik dan hindari aplikasi pupuk/pestisida</p>
                  ) : weatherData.list[0].pop < 0.3 ? (
                    <p>☀️ Cuaca kering: Tingkatkan frekuensi penyiraman dan mulsa untuk konservasi air</p>
                  ) : (
                    <p>🌤️ Cuaca moderat: Kondisi baik untuk aktivitas pertanian umum</p>
                  )}
                  
                  {weatherData.list[0].wind.speed > 5 ? (
                    <p>💨 Angin kencang: Berikan penyangga pada tanaman tinggi dan hindari penyemprotan</p>
                  ) : (
                    <p>🍃 Angin tenang: Kondisi baik untuk penyemprotan dan aktivitas lapangan</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/edukasi')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Edukasi
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Tools & Kalkulator Pertanian
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Manfaatkan berbagai tools dan kalkulator untuk membantu dalam perencanaan dan analisis pertanian Anda
            </p>
          </div>
        </div>

        {activeCalculator ? (
          /* Calculator Detail View */
          <div>
            <Button 
              variant="ghost" 
              onClick={() => setActiveCalculator(null)}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Tools
            </Button>

            {activeCalculator === "pupuk" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calculator className="w-6 h-6 mr-2 text-blue-500" />
                    Kalkulator Pupuk
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Hitung dosis pupuk yang tepat berdasarkan jenis tanaman, luas lahan, dan kondisi tanah
                  </p>
                </CardHeader>
                <CardContent>
                  <FertilizerCalculator />
                </CardContent>
              </Card>
            )}

            {activeCalculator === "irigasi" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Droplets className="w-6 h-6 mr-2 text-cyan-500" />
                    Kalkulator Irigasi
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Hitung kebutuhan air berdasarkan jenis tanaman, kondisi iklim, dan metode irigasi
                  </p>
                </CardHeader>
                <CardContent>
                  <IrrigationCalculator />
                </CardContent>
              </Card>
            )}

            {activeCalculator === "jadwal" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-6 h-6 mr-2 text-green-500" />
                    Jadwal Tanam
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Tentukan waktu tanam terbaik berdasarkan musim Indonesia dan jenis tanaman
                  </p>
                </CardHeader>
                <CardContent>
                  <PlantingScheduleCalculator />
                </CardContent>
              </Card>
            )}

            {activeCalculator === "cuaca" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Thermometer className="w-6 h-6 mr-2 text-orange-500" />
                    Prediksi Cuaca
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Peta curah hujan dan analisis kondisi cuaca untuk perencanaan pertanian
                  </p>
                </CardHeader>
                <CardContent>
                  <WeatherPredictionCalculator />
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Tools Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {calculatorTools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Card 
                  key={tool.id} 
                  className="group hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => setActiveCalculator(tool.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", tool.color)}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <Badge variant="outline" className="text-xs">
                        {tool.category}
                      </Badge>
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {tool.title}
                      </h3>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {tool.description}
                    </p>
                    
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EdukasiTools;
