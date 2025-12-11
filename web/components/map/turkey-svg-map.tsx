"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import type { Feature, FeatureCollection, Geometry, GeoJsonProperties } from "geojson";

interface CityStats {
  id: number;
  name: string;
  post_count: number;
}

interface TurkeySvgMapProps {
  cityStats: CityStats[];
  onCityClick: (cityId: number, cityName: string) => void;
  selectedCityId?: number | null;
  isSheetOpen?: boolean;
}

// GeoJSON'daki şehir isimlerini normalize et
function normalizeCityName(name: string): string {
  return name
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .trim();
}

// GeoJSON koordinatlarını SVG path'e çevir
function geoJsonToSvgPath(
  geometry: Geometry,
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
  width: number,
  height: number
): string {
  const scaleX = width / (bounds.maxX - bounds.minX);
  const scaleY = height / (bounds.maxY - bounds.minY);
  const scale = Math.min(scaleX, scaleY);

  const project = (lng: number, lat: number): [number, number] => {
    const x = (lng - bounds.minX) * scale;
    const y = (bounds.maxY - lat) * scale; // Y eksenini ters çevir
    return [x, y];
  };

  if (geometry.type === "Polygon") {
    const path = geometry.coordinates[0]
      .map((coord, index) => {
        const [x, y] = project(coord[0], coord[1]);
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
    return `${path} Z`;
  } else if (geometry.type === "MultiPolygon") {
    return geometry.coordinates
      .map((polygon) => {
        const path = polygon[0]
          .map((coord, index) => {
            const [x, y] = project(coord[0], coord[1]);
            return `${index === 0 ? "M" : "L"} ${x} ${y}`;
          })
          .join(" ");
        return `${path} Z`;
      })
      .join(" ");
  }
  return "";
}

// GeoJSON'dan bounds hesapla
function calculateBounds(geoJson: FeatureCollection): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  geoJson.features.forEach((feature) => {
    const geometry = feature.geometry;
    if (geometry.type === "Polygon") {
      geometry.coordinates[0].forEach((coord) => {
        minX = Math.min(minX, coord[0]);
        minY = Math.min(minY, coord[1]);
        maxX = Math.max(maxX, coord[0]);
        maxY = Math.max(maxY, coord[1]);
      });
    } else if (geometry.type === "MultiPolygon") {
      geometry.coordinates.forEach((polygon) => {
        polygon[0].forEach((coord) => {
          minX = Math.min(minX, coord[0]);
          minY = Math.min(minY, coord[1]);
          maxX = Math.max(maxX, coord[0]);
          maxY = Math.max(maxY, coord[1]);
        });
      });
    }
  });

  return { minX, minY, maxX, maxY };
}

export function TurkeySvgMap({ cityStats, onCityClick, selectedCityId, isSheetOpen = false }: TurkeySvgMapProps) {
  const [hoveredCity, setHoveredCity] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection | null>(null);
  const [bounds, setBounds] = useState<{ minX: number; minY: number; maxX: number; maxY: number } | null>(null);
  // Mobilde daha yakın zoom, desktop'ta daha uzak
  const [zoom, setZoom] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 1.6 : 1.2; // Mobilde 1.6, desktop'ta 1.2
    }
    return 1.2;
  });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredCityCenter, setHoveredCityCenter] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // GeoJSON verisini yükle ve haritayı ortala
  useEffect(() => {
    fetch("/turkey-provinces.json")
      .then((res) => res.json())
      .then((data) => {
        setGeoJsonData(data);
        const calculatedBounds = calculateBounds(data);
        setBounds(calculatedBounds);
        
        // Haritayı otomatik ortala
        // SVG merkezini hesapla ve pan'i ayarla
        const svgWidth = 800;
        const svgHeight = 600;
        
        // Türkiye'nin coğrafi merkezini hesapla
        const centerLng = (calculatedBounds.minX + calculatedBounds.maxX) / 2;
        const centerLat = (calculatedBounds.minY + calculatedBounds.maxY) / 2;
        
        // SVG koordinatlarına çevir
        const scaleX = svgWidth / (calculatedBounds.maxX - calculatedBounds.minX);
        const scaleY = svgHeight / (calculatedBounds.maxY - calculatedBounds.minY);
        const scale = Math.min(scaleX, scaleY);
        
        const centerX = (centerLng - calculatedBounds.minX) * scale;
        const centerY = (calculatedBounds.maxY - centerLat) * scale;
        
        // SVG merkezinden offset hesapla (ortalamak için)
        // Transform origin center olduğu için direkt offset kullanılır
        const offsetX = (svgWidth / 2) - centerX;
        // Y eksenini biraz aşağı kaydır (tam ortalamak için)
        const offsetY = (svgHeight / 2) - centerY + 30; // +30 ile biraz aşağı
        
        // Pan'i ayarla
        setPan({ x: offsetX, y: offsetY });
      })
      .catch(console.error);
  }, []);

  // Post sayısına göre maximum değeri hesapla
  const maxPosts = useMemo(() => {
    if (!Array.isArray(cityStats) || cityStats.length === 0) {
      return 1;
    }
    return Math.max(...cityStats.map((c) => c.post_count || 0), 1);
  }, [cityStats]);

  // Şehir isim eşleştirme - Özel durumlar
  const getCityNameMapping = (geoJsonName: string): string[] => {
    const normalized = normalizeCityName(geoJsonName);
    // Özel durumlar: GeoJSON'daki isim -> Veritabanındaki isim
    const specialCases: Record<string, string> = {
      'afyon': 'afyonkarahisar',
      'kahramanmaras': 'kahramanmaras', // zaten aynı
    };
    
    const mapped = specialCases[normalized];
    if (mapped) {
      return [normalized, mapped];
    }
    return [normalized];
  };

  // Şehir stats'ını isime göre bul
  const getStatsByName = useCallback((name: string) => {
    if (!Array.isArray(cityStats) || cityStats.length === 0) {
      return undefined;
    }
    const possibleNames = getCityNameMapping(name);
    return cityStats.find((s) => {
      const normalized = normalizeCityName(s.name);
      return possibleNames.includes(normalized);
    });
  }, [cityStats]);

  // Post sayısına göre renk hesapla - Gri tonlarında, yumuşak renkler
  const getCityColor = (postCount: number, isHovered: boolean, isSelected: boolean) => {
    if (isSelected) return "hsl(var(--primary))";
    if (isHovered) return "hsl(var(--primary) / 0.7)";
    
    if (postCount === 0) return "hsl(var(--muted))";
    
    const intensity = Math.min(postCount / maxPosts, 1);
    
    // Gri tonlarında, yoğunluğa göre koyulaşan yumuşak renk skalası
    // Sıcak tonlar (yeşil-sarı-turuncu) kullanılıyor - Light mode için daha koyu ve doygun
    if (intensity < 0.2) {
      return "hsl(50, 40%, 65%)"; // Açık sarı-turuncu
    } else if (intensity < 0.4) {
      return "hsl(45, 50%, 60%)"; // Orta sarı-turuncu
    } else if (intensity < 0.6) {
      return "hsl(35, 55%, 55%)"; // Orta turuncu
    } else if (intensity < 0.8) {
      return "hsl(25, 60%, 50%)"; // Koyu turuncu
    } else {
      return "hsl(15, 65%, 45%)"; // En koyu kırmızı-turuncu
    }
  };

  const getStatsForCity = (cityId: number) => {
    if (!Array.isArray(cityStats) || cityStats.length === 0) {
      return { id: cityId, name: "", post_count: 0 };
    }
    return cityStats.find((c) => c.id === cityId) || { id: cityId, name: "", post_count: 0 };
  };

  // Şehir merkezini hesapla (SVG koordinatlarında)
  const getCityCenter = useCallback((feature: Feature<Geometry, GeoJsonProperties>, bounds: { minX: number; minY: number; maxX: number; maxY: number }, svgWidth: number, svgHeight: number) => {
    const scaleX = svgWidth / (bounds.maxX - bounds.minX);
    const scaleY = svgHeight / (bounds.maxY - bounds.minY);
    const scale = Math.min(scaleX, scaleY);

    const project = (lng: number, lat: number): [number, number] => {
      const x = (lng - bounds.minX) * scale;
      const y = (bounds.maxY - lat) * scale;
      return [x, y];
    };

    let sumX = 0;
    let sumY = 0;
    let count = 0;

    if (feature.geometry.type === "Polygon") {
      feature.geometry.coordinates[0].forEach((coord) => {
        const [x, y] = project(coord[0], coord[1]);
        sumX += x;
        sumY += y;
        count++;
      });
    } else if (feature.geometry.type === "MultiPolygon") {
      feature.geometry.coordinates.forEach((polygon) => {
        polygon[0].forEach((coord) => {
          const [x, y] = project(coord[0], coord[1]);
          sumX += x;
          sumY += y;
          count++;
        });
      });
    }

    return count > 0 ? { x: sumX / count, y: sumY / count } : null;
  }, []);

  const handleMouseMove = (e: React.MouseEvent, cityId: number, feature: Feature<Geometry, GeoJsonProperties>) => {
    if (isDragging) return;
    setHoveredCity(cityId);
    
    // Mouse pozisyonunu kullan (container'a göre)
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - containerRect.left;
      const mouseY = e.clientY - containerRect.top;
      
      setHoveredCityCenter({ x: mouseX, y: mouseY });
    }
  };

  // Zoom fonksiyonları
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.5));
  };

  const handleReset = () => {
    // Mobilde daha yakın zoom, desktop'ta daha uzak
    const defaultZoom = typeof window !== 'undefined' && window.innerWidth < 768 ? 1.6 : 1.2;
    setZoom(defaultZoom);
    
    // Haritayı tekrar ortala
    if (bounds) {
      const svgWidth = 800;
      const svgHeight = 600;
      
      const centerLng = (bounds.minX + bounds.maxX) / 2;
      const centerLat = (bounds.minY + bounds.maxY) / 2;
      
      const scaleX = svgWidth / (bounds.maxX - bounds.minX);
      const scaleY = svgHeight / (bounds.maxY - bounds.minY);
      const scale = Math.min(scaleX, scaleY);
      
      const centerX = (centerLng - bounds.minX) * scale;
      const centerY = (bounds.maxY - centerLat) * scale;
      
      const offsetX = (svgWidth / 2) - centerX;
      // Y eksenini biraz aşağı kaydır (tam ortalamak için)
      const offsetY = (svgHeight / 2) - centerY + 30; // +30 ile biraz aşağı
      
      setPan({ x: offsetX, y: offsetY });
    } else {
      setPan({ x: 0, y: 0 });
    }
  };

  // Pan (sürükleme) fonksiyonları - Mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Sol tık
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMovePan = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Pan (sürükleme) fonksiyonları - Touch
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      setPan({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.max(0.5, Math.min(5, prev * delta)));
  };

  if (!geoJsonData || !bounds) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Harita yükleniyor...</span>
        </div>
      </div>
    );
  }

  const svgWidth = 800;
  const svgHeight = 600;

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full overflow-hidden relative bg-muted/30 transition-all duration-300 ${isSheetOpen ? 'opacity-50' : 'opacity-100'}`}
    >
      {/* Tooltip - Şehir merkezinde */}
      {hoveredCity && !isDragging && hoveredCityCenter && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pointer-events-none absolute z-50 rounded-lg bg-card px-3 py-2 shadow-lg border border-border whitespace-nowrap"
          style={{
            left: `${hoveredCityCenter.x}px`,
            top: `${hoveredCityCenter.y - 40}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <p className="font-semibold text-foreground text-sm">
            {getStatsForCity(hoveredCity).name}
          </p>
          <p className="text-xs text-muted-foreground">
            {getStatsForCity(hoveredCity).post_count} gönderi
          </p>
        </motion.div>
      )}

      {/* Zoom kontrolleri */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-[1000] flex flex-col gap-1.5 sm:gap-2">
        <button
          onClick={handleZoomIn}
          className="bg-card hover:bg-muted border border-border rounded-lg p-1.5 sm:p-2 shadow-lg transition-colors"
          title="Yakınlaştır"
        >
          <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground" />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-card hover:bg-muted border border-border rounded-lg p-1.5 sm:p-2 shadow-lg transition-colors"
          title="Uzaklaştır"
        >
          <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground" />
        </button>
        <button
          onClick={handleReset}
          className="bg-card hover:bg-muted border border-border rounded-lg p-1.5 sm:p-2 shadow-lg transition-colors"
          title="Sıfırla"
        >
          <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground" />
        </button>
      </div>

      {/* SVG Harita */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-full cursor-move"
        onMouseLeave={() => {
          setHoveredCity(null);
          setHoveredCityCenter(null);
          setIsDragging(false);
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMovePan}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        preserveAspectRatio="xMidYMid meet"
        style={{ touchAction: 'none' }}
      >
        <g
          transform={`translate(${svgWidth / 2}, ${svgHeight / 2}) scale(${zoom}) translate(${-svgWidth / 2 + pan.x}, ${-svgHeight / 2 + pan.y})`}
        >
          {/* Arka plan */}
          <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="transparent" />
          
          {/* Şehirler - Gerçek GeoJSON verilerinden */}
          {geoJsonData.features.map((feature) => {
            const cityName = feature.properties?.name || "";
            const stats = getStatsByName(cityName);
            const cityId = stats?.id || (typeof feature.id === 'number' ? feature.id : 0) || 0;
            const isHovered = hoveredCity === cityId && !isDragging;
            const isSelected = selectedCityId === cityId;
            
            const path = geoJsonToSvgPath(feature.geometry, bounds, svgWidth, svgHeight);
            
            if (!path) return null;
            
            return (
              <motion.path
                key={feature.id || cityName}
                d={path}
                fill={getCityColor(stats?.post_count || 0, isHovered, isSelected)}
                stroke="hsl(0, 0%, 60%)"
                strokeWidth={isHovered || isSelected ? 2.5 / zoom : 1.5 / zoom}
                className="cursor-pointer transition-colors"
                whileHover={!isDragging ? { scale: 1.02 } : {}}
                onMouseMove={(e) => !isDragging && handleMouseMove(e, cityId, feature)}
                onTouchStart={(e) => {
                  if (!isDragging && containerRef.current) {
                    const touch = e.touches[0];
                    const containerRect = containerRef.current.getBoundingClientRect();
                    const mouseX = touch.clientX - containerRect.left;
                    const mouseY = touch.clientY - containerRect.top;
                    setHoveredCity(cityId);
                    setHoveredCityCenter({ x: mouseX, y: mouseY });
                  }
                }}
                onTouchEnd={(e) => {
                  if (!isDragging) {
                    e.stopPropagation();
                    if (stats) {
                      onCityClick(stats.id, stats.name);
                    } else if (cityName) {
                      const cityFromStats = cityStats.find(c => 
                        normalizeCityName(c.name) === normalizeCityName(cityName)
                      );
                      if (cityFromStats) {
                        onCityClick(cityFromStats.id, cityFromStats.name);
                      }
                    }
                  }
                }}
                onClick={(e) => {
                  if (isDragging) return;
                  e.stopPropagation();
                  if (stats) {
                    onCityClick(stats.id, stats.name);
                  } else if (cityName) {
                    const cityFromStats = cityStats.find(c => 
                      normalizeCityName(c.name) === normalizeCityName(cityName)
                    );
                    if (cityFromStats) {
                      onCityClick(cityFromStats.id, cityFromStats.name);
                    }
                  }
                }}
                opacity={(stats?.post_count || 0) === 0 ? 0.7 : 1}
              />
            );
          })}
        </g>
      </svg>

      {/* Lejant */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-[1000] bg-card/95 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-border shadow-lg">
        <p className="text-[10px] sm:text-xs font-semibold text-foreground mb-1.5 sm:mb-2">Gönderi Yoğunluğu</p>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-2.5 sm:w-4 sm:h-3 rounded-sm border border-border bg-muted" />
            <span className="hidden sm:inline">Yok</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-2.5 sm:w-4 sm:h-3 rounded-sm border border-border" style={{ background: "hsl(50, 40%, 65%)" }} />
            <span className="hidden sm:inline">Az</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-2.5 sm:w-4 sm:h-3 rounded-sm border border-border" style={{ background: "hsl(45, 50%, 60%)" }} />
            <span className="hidden sm:inline">Orta</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-2.5 sm:w-4 sm:h-3 rounded-sm border border-border" style={{ background: "hsl(35, 55%, 55%)" }} />
            <span className="hidden sm:inline">Çok</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-2.5 sm:w-4 sm:h-3 rounded-sm border border-border" style={{ background: "hsl(15, 65%, 45%)" }} />
            <span className="hidden sm:inline">Yoğun</span>
          </div>
        </div>
      </div>
    </div>
  );
}
