/**
 * APLICATIVO WEB INTERACTIVO - RESULTADOS DE CHILE EN LECTURA PISA 2025
 * Instituto Milenio MISTRALL
 * Reestructurado estrictamente según los datos y resultados del Policy Brief
 * (Claro & Espinosa, 2026), con la paleta oficial MISTRALL y tipografía Manrope.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Cargar datos
  let data = window.PISA_DATA;
  if (!data) {
    try {
      const resp = await fetch('data/pisa_data.json');
      data = await resp.json();
    } catch (e) {
      console.error('Error cargando los datos PISA:', e);
      return;
    }
  }

  // Inicializar tracker de capítulos
  setupChapterTracker();

  // Inicializar Gráficos del Policy Brief
  renderFigura1Historico(data);
  renderEvolucionLatAm(data);
  renderFigura7ScatterCobertura(data);
  renderFiguras8y9Divergente(data);
  renderFigura10Escs(data);
  renderFigura12EscsOcde(data);
  renderFigura13PercentilesEvolucion(data);
  renderFigura14Percentiles(data);
  renderFigura15Genero(data);
  renderFigura16y17GeneroEscs(data);
  renderFigura18MigracionLatAm(data);
  renderFigura19MigracionChile(data);
  renderFigura20y21MigracionBrechas(data);
  renderFigura22Dispositivos(data);
  renderFigura23Ia(data);
  renderFigura24Perseverancia(data);
  renderFigura25Curiosidad(data);
  renderFigura27ApoyoFamiliar(data);
});

/* --------------------------------------------------------------------------
   Tracker de Navegación por Capítulos y Barra de Progreso
   -------------------------------------------------------------------------- */
function setupChapterTracker() {
  const chapterPills = document.querySelectorAll('.chapter-pill');
  const chapters = document.querySelectorAll('.chapter-block, .editorial-hero');
  const currentChapterLabel = document.getElementById('currentChapterName');
  const progressBar = document.getElementById('readingProgress');

  chapterPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = pill.getAttribute('href').substring(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    
    if (progressBar) {
      progressBar.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
    }

    let activeChapter = '';
    let activeName = 'Resumen ejecutivo';

    chapters.forEach(chap => {
      const top = chap.offsetTop - 120;
      if (scrollTop >= top) {
        activeChapter = chap.getAttribute('id');
        const pill = document.querySelector(`.chapter-pill[href="#${activeChapter}"]`);
        if (pill) {
          activeName = pill.dataset.chapter || activeName;
        }
      }
    });

    if (activeChapter) {
      chapterPills.forEach(pill => {
        const isCurrent = pill.getAttribute('href') === `#${activeChapter}`;
        pill.classList.toggle('active', isCurrent);
      });
      if (currentChapterLabel) {
        currentChapterLabel.textContent = activeName;
      }
    }
  });
}

/* --------------------------------------------------------------------------
   Paleta Institucional Oficial de los Gráficos del Policy Brief de Mistrall
   -------------------------------------------------------------------------- */
const POLICY_PALETTE = {
  // Niveles de desempeño y cobertura (especificados explícitamente)
  mn2: '#BA9CA1',          // Menor a Nivel 2 (Rezago)
  n2: '#C5CADC',           // Nivel 2 (Básico funcional)
  n34: '#777D93',          // Nivel 3-4 (Intermedio)
  n56: '#505362',          // Nivel 5-6 (Avanzado)
  sinCobNoEval: '#B3B3B3', // Sin cobertura por fuera de la muestra
  sinCobFuera: '#CCCCCC',  // Sin cobertura por fuera de matrícula

  // Paleta oficial MISTRALL para los otros gráficos
  chile: '#3C4D5D',        // MISTRALL Azul pizarra principal (dataColors[0])
  latam: '#4DB6B5',        // MISTRALL Turquesa/Teal (dataColors[1])
  ocde: '#426871',         // MISTRALL Table accent / Slate petróleo
  mujeres: '#9B6673',      // MISTRALL Rosa ceniza (dataColors[6])
  hombres: '#3C4D5D',      // MISTRALL Azul pizarra (dataColors[0])
  alerta: '#C25A3D',       // MISTRALL Center / Coral-naranja
  amarillo: '#FFF265',     // MISTRALL Amarillo institucional (dataColors[3])
  arena: '#EAE5C8',        // MISTRALL Arena (dataColors[4])
  lavanda: '#D5DBFF',      // MISTRALL Lavanda (dataColors[2])
  cyanClaro: '#8ADFEA',    // MISTRALL bad / Cyan suave
  grisClaro: '#C2C8C4',    // MISTRALL good / Gris perla
  bgCard: '#F9F7F2',       // MISTRALL Background
  textDark: '#252423',     // MISTRALL Foreground

  fontFamily: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

/* --------------------------------------------------------------------------
   SERIE HISTÓRICA EN LECTURA DE CHILE (2000 - 2025) Y BRECHAS
   -------------------------------------------------------------------------- */
function renderFigura1Historico(data) {
  const dom = document.getElementById('chart-figura-1-historico');
  if (!dom) return;
  const chart = echarts.init(dom);

  const raw = data.Serie_Historica_Lectura || [];
  const years = [2000, 2006, 2009, 2012, 2015, 2018, 2022, 2025];
  const ocdeColor = '#8C5A63';

  const chileMap = {};
  const ocdeMap = {};
  const latamMap = {};

  raw.forEach(r => {
    const name = (r.Pais_o_Region || '').toLowerCase();
    const iso = (r.Codigo_ISO || '').toLowerCase();
    const yr = r.Anio;
    const score = r.Puntaje_Medio_Lectura;
    if (score === null || score === undefined) return;

    const intScore = Math.round(score);

    if (name.includes('chile') || iso === 'chl') {
      chileMap[yr] = intScore;
    } else if (name.includes('ocde') || name.includes('oecd') || iso.includes('oecd')) {
      ocdeMap[yr] = intScore;
    } else if ((name.includes('latinoam') || iso.includes('latam')) && (name.includes('8') || iso.includes('8'))) {
      latamMap[yr] = intScore;
    }
  });

  const chilePoints = years.map(y => [y, chileMap[y] !== undefined ? chileMap[y] : null]);
  const ocdePoints = years.map(y => [y, ocdeMap[y] !== undefined ? ocdeMap[y] : null]);
  const latamPoints = years.map(y => [y, latamMap[y] !== undefined ? latamMap[y] : null]);

  const realTimeXAxis = {
    type: 'value',
    min: 1999,
    max: 2026,
    minInterval: 1,
    maxInterval: 1,
    interval: 1,
    axisLine: { lineStyle: { color: '#C5C1B6' } },
    axisTick: { show: false },
    splitLine: { show: false },
    axisLabel: {
      color: '#252423',
      fontWeight: 600,
      fontSize: 13,
      fontFamily: POLICY_PALETTE.fontFamily,
      hideOverlap: false,
      formatter: (val) => {
        const yr = Math.round(val);
        return years.includes(yr) ? String(yr) : '';
      }
    }
  };

  const baseOption = {
    textStyle: { fontFamily: POLICY_PALETTE.fontFamily },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#252423',
      borderColor: '#FFF265',
      textStyle: { color: '#F9F7F2', fontFamily: POLICY_PALETTE.fontFamily },
      formatter: (params) => {
        const yearVal = Array.isArray(params[0].value) ? params[0].value[0] : params[0].axisValue;
        let str = `<div style="font-weight:700; margin-bottom:5px; border-bottom:1px solid #444; padding-bottom:4px;">Año ${yearVal}</div>`;
        params.forEach(p => {
          const val = Array.isArray(p.value) ? p.value[1] : p.value;
          if (val !== null && val !== undefined) {
            str += `<div style="display:flex; justify-content:space-between; gap:20px; margin:3px 0;">
              <span>${p.marker} ${p.seriesName}</span>
              <strong style="color:#FFF265;">${Math.round(val)} pts</strong>
            </div>`;
          }
        });
        return str;
      }
    },
    legend: {
      data: ['Chile', 'Promedio OCDE', 'Promedio América Latina (LatAm-8)'],
      top: 10,
      textStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 13, fontWeight: 600, color: '#252423' }
    },
    grid: { left: '3%', right: '4%', bottom: '8%', top: '15%', containLabel: true },
    xAxis: realTimeXAxis,
    yAxis: {
      type: 'value',
      min: 380,
      max: 520,
      interval: 20,
      axisLabel: { formatter: '{value} pts', color: '#555555', fontFamily: POLICY_PALETTE.fontFamily },
      splitLine: { lineStyle: { type: 'dashed', color: '#ECE8DD' } }
    },
    series: [
      {
        name: 'Chile',
        type: 'line',
        data: chilePoints,
        symbol: 'circle',
        symbolSize: 10,
        lineStyle: { width: 4, color: POLICY_PALETTE.chile },
        itemStyle: { color: POLICY_PALETTE.chile },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => `${p.value[1]}`,
          fontWeight: 700,
          color: POLICY_PALETTE.chile,
          fontFamily: POLICY_PALETTE.fontFamily
        }
      },
      {
        name: 'Promedio OCDE',
        type: 'line',
        data: ocdePoints,
        symbol: 'rect',
        symbolSize: 8,
        lineStyle: { width: 3, type: 'dashed', color: ocdeColor },
        itemStyle: { color: ocdeColor },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => `${p.value[1]}`,
          color: ocdeColor,
          fontFamily: POLICY_PALETTE.fontFamily,
          fontWeight: 600
        }
      },
      {
        name: 'Promedio América Latina (LatAm-8)',
        type: 'line',
        data: latamPoints,
        symbol: 'triangle',
        symbolSize: 8,
        lineStyle: { width: 3, type: 'dashed', color: POLICY_PALETTE.latam },
        itemStyle: { color: POLICY_PALETTE.latam },
        label: {
          show: true,
          position: 'bottom',
          formatter: (p) => `${p.value[1]}`,
          color: POLICY_PALETTE.latam,
          fontFamily: POLICY_PALETTE.fontFamily,
          fontWeight: 600
        }
      }
    ]
  };

  chart.setOption(baseOption, true);

  const ctrl = document.getElementById('control-serie-historica');
  if (ctrl) {
    ctrl.querySelectorAll('.seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        ctrl.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const view = btn.dataset.view;

        if (view === 'brechas') {
          const gapOcde = years.map(y =>
            (chileMap[y] !== undefined && ocdeMap[y] !== undefined) ? Math.round(chileMap[y] - ocdeMap[y]) : null
          );
          const gapLatam = years.map(y =>
            (chileMap[y] !== undefined && latamMap[y] !== undefined) ? Math.round(chileMap[y] - latamMap[y]) : null
          );

          chart.setOption({
            textStyle: { fontFamily: POLICY_PALETTE.fontFamily },
            tooltip: {
              trigger: 'axis',
              axisPointer: { type: 'shadow' },
              backgroundColor: '#252423',
              borderColor: '#FFF265',
              textStyle: { color: '#F9F7F2', fontFamily: POLICY_PALETTE.fontFamily },
              formatter: (params) => {
                let str = `<div style="font-weight:700; margin-bottom:5px; border-bottom:1px solid #444; padding-bottom:4px;">Año ${params[0].axisValue}</div>`;
                params.forEach(p => {
                  if (p.value !== null && p.value !== undefined) {
                    const intVal = Math.round(p.value);
                    const formatted = intVal > 0 ? `+${intVal} pts` : `${intVal} pts`;
                    str += `<div style="display:flex; justify-content:space-between; gap:20px; margin:3px 0;">
                      <span>${p.marker} ${p.seriesName}</span>
                      <strong style="color:#FFF265;">${formatted}</strong>
                    </div>`;
                  }
                });
                return str;
              }
            },
            legend: {
              data: ['Brecha de Chile frente a la OCDE', 'Brecha de Chile frente a América Latina'],
              top: 10,
              textStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 13, fontWeight: 600, color: '#252423' }
            },
            grid: { left: '3%', right: '4%', bottom: '8%', top: '15%', containLabel: true },
            xAxis: {
              type: 'category',
              data: years.map(String),
              axisLine: { lineStyle: { color: '#C5C1B6' } },
              axisLabel: { color: '#252423', fontWeight: 600, fontSize: 13, fontFamily: POLICY_PALETTE.fontFamily }
            },
            yAxis: {
              type: 'value',
              min: -120,
              max: 60,
              interval: 30,
              axisLabel: { formatter: '{value} pts', color: '#555555', fontFamily: POLICY_PALETTE.fontFamily },
              splitLine: { lineStyle: { type: 'dashed', color: '#ECE8DD' } }
            },
            series: [
              {
                name: 'Brecha de Chile frente a la OCDE',
                type: 'bar',
                data: gapOcde,
                barWidth: 32,
                barGap: '14%',
                itemStyle: {
                  color: ocdeColor,
                  borderRadius: [0, 0, 4, 4]
                },
                label: {
                  show: true,
                  position: 'bottom',
                  formatter: (p) => `${p.value}`,
                  fontFamily: POLICY_PALETTE.fontFamily,
                  color: ocdeColor,
                  fontWeight: 700
                },
                markLine: {
                  silent: true,
                  symbol: 'none',
                  lineStyle: { type: 'solid', color: '#9E9A90', width: 1.5 },
                  label: { show: false },
                  data: [{ yAxis: 0 }]
                }
              },
              {
                name: 'Brecha de Chile frente a América Latina',
                type: 'bar',
                data: gapLatam,
                barWidth: 32,
                itemStyle: {
                  color: POLICY_PALETTE.latam,
                  borderRadius: [4, 4, 0, 0]
                },
                label: {
                  show: true,
                  position: 'top',
                  formatter: (p) => `+${p.value}`,
                  fontFamily: POLICY_PALETTE.fontFamily,
                  color: POLICY_PALETTE.latam,
                  fontWeight: 700
                }
              }
            ]
          }, true);
        } else {
          chart.setOption(baseOption, true);
        }
      });
    });
  }

  window.addEventListener('resize', () => chart.resize());
}

/* --------------------------------------------------------------------------
   EVOLUCIÓN HISTÓRICA DE PUNTAJES POR PAÍS DE AMÉRICA LATINA (2000 - 2025)
   -------------------------------------------------------------------------- */
function renderEvolucionLatAm(data) {
  const dom = document.getElementById('chart-evolucion-latam');
  if (!dom) return;
  const chart = echarts.init(dom);

  const rawLatAm = data.Serie_Historica_LatAm || [];
  const rawHistorico = data.Serie_Historica_Lectura || [];
  const years = [2000, 2003, 2006, 2009, 2012, 2015, 2018, 2022, 2025];

  // Todas las líneas con el mismo grosor (2.5), paleta de alto contraste y micro-ajuste sólo en empates de 2025
  const entityMeta = {
    'Promedio OCDE': { color: '#8C5A63', width: 2.5, type: 'dashed', symbol: 'rect', symbolSize: 6.5, z: 13, labelOffsetY: 0 },
    'Chile': { color: '#3C4D5D', width: 2.5, symbol: 'circle', symbolSize: 6.5, z: 12, labelOffsetY: 0 },
    'Uruguay': { color: '#2563EB', width: 2.5, symbol: 'circle', symbolSize: 6.5, z: 9, labelOffsetY: 0 },
    'Costa Rica': { color: '#0D9488', width: 2.5, symbol: 'circle', symbolSize: 6.5, z: 8, labelOffsetY: 0 },
    'Brasil': { color: '#16A34A', width: 2.5, symbol: 'circle', symbolSize: 6.5, z: 7, labelOffsetY: -6 },
    'México': { color: '#D97706', width: 2.5, symbol: 'circle', symbolSize: 6.5, z: 7, labelOffsetY: 6 },
    'Colombia': { color: '#7C3AED', width: 2.5, symbol: 'circle', symbolSize: 6.5, z: 6, labelOffsetY: 0 },
    'Perú': { color: '#DC2626', width: 2.5, symbol: 'circle', symbolSize: 6.5, z: 6, labelOffsetY: -8 },
    'Argentina': { color: '#0284C7', width: 2.5, symbol: 'circle', symbolSize: 6.5, z: 6, labelOffsetY: 2 },
    'Ecuador': { color: '#CA8A04', width: 2.5, symbol: 'circle', symbolSize: 6.5, z: 5, labelOffsetY: 4 },
    'El Salvador': { color: '#4F46E5', width: 2.5, symbol: 'circle', symbolSize: 6.5, z: 5, labelOffsetY: 0 },
    'Paraguay': { color: '#EA580C', width: 2.5, symbol: 'circle', symbolSize: 6.5, z: 5, labelOffsetY: -1 },
    'República Dominicana': { color: '#DB2777', width: 2.5, symbol: 'circle', symbolSize: 6.5, z: 5, labelOffsetY: 1 },
    'Guatemala': { color: '#65A30D', width: 2.5, symbol: 'circle', symbolSize: 6.5, z: 5, labelOffsetY: 0 }
  };

  // Mapear datos por entidad (excluyendo promedios LatAm)
  const entityDataMap = {
    'Promedio OCDE': {}
  };

  // Cargar para Promedio OCDE los mismos valores del gráfico histórico principal (2000-2025)
  rawHistorico.forEach(r => {
    const name = (r.Pais_o_Region || '').toLowerCase();
    const iso = (r.Codigo_ISO || '').toLowerCase();
    if ((name.includes('ocde') || name.includes('oecd') || iso.includes('oecd')) && r.Puntaje_Medio_Lectura !== null && r.Puntaje_Medio_Lectura !== undefined) {
      entityDataMap['Promedio OCDE'][r.Anio] = Math.round(r.Puntaje_Medio_Lectura);
    }
  });

  rawLatAm.forEach(r => {
    const name = r.Pais_o_Region;
    if (!name || name.includes('Promedio')) return;
    if (!entityDataMap[name]) entityDataMap[name] = {};
    if (r.Puntaje_Medio_Lectura !== null && r.Puntaje_Medio_Lectura !== undefined) {
      entityDataMap[name][r.Anio] = Math.round(r.Puntaje_Medio_Lectura);
    }
  });

  const allEntities = Object.keys(entityMeta);

  const buildSeries = () => {
    return allEntities.map(name => {
      const meta = entityMeta[name];
      const seriesPoints = [];
      years.forEach(yr => {
        const val = entityDataMap[name] ? entityDataMap[name][yr] : undefined;
        if (val !== undefined && val !== null) {
          seriesPoints.push([yr, val]);
        }
      });

      const isHighlight = name === 'Chile' || name === 'Promedio OCDE';

      return {
        name: name,
        type: 'line',
        data: seriesPoints,
        symbol: meta.symbol || 'circle',
        symbolSize: meta.symbolSize || 6.5,
        z: meta.z || 5,
        lineStyle: {
          width: 2.5,
          type: meta.type || 'solid',
          color: meta.color
        },
        itemStyle: { color: meta.color },
        label: {
          show: name === 'Chile',
          position: 'top',
          formatter: (p) => `${p.value[1]}`,
          fontWeight: 700,
          color: meta.color,
          fontFamily: POLICY_PALETTE.fontFamily
        },
        endLabel: {
          show: true,
          formatter: (p) => `${p.seriesName} (${p.value[1]})`,
          fontFamily: POLICY_PALETTE.fontFamily,
          fontSize: 11.5,
          lineHeight: 12,
          fontWeight: isHighlight ? 800 : 600,
          color: meta.color,
          align: 'left',
          verticalAlign: 'middle',
          distance: 8,
          offset: [0, meta.labelOffsetY || 0]
        },
        emphasis: {
          focus: 'series',
          lineStyle: { width: 3.8 }
        }
      };
    });
  };

  const getOption = (allSelected = true) => {
    const selectedMap = {};
    allEntities.forEach(e => {
      selectedMap[e] = allSelected;
    });

    return {
      animation: true,
      animationDuration: 1200,
      animationEasing: 'cubicOut',
      textStyle: { fontFamily: POLICY_PALETTE.fontFamily },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#252423',
        borderColor: '#FFF265',
        textStyle: { color: '#F9F7F2', fontFamily: POLICY_PALETTE.fontFamily },
        formatter: (params) => {
          const yearVal = Array.isArray(params[0].value) ? params[0].value[0] : params[0].axisValue;
          let str = `<div style="font-weight:700; margin-bottom:6px; border-bottom:1px solid #444; padding-bottom:4px;">Año ${yearVal}</div>`;
          const valid = params.filter(p => {
            const v = Array.isArray(p.value) ? p.value[1] : p.value;
            return v !== null && v !== undefined;
          });
          valid.sort((a, b) => {
            const va = Array.isArray(a.value) ? a.value[1] : a.value;
            const vb = Array.isArray(b.value) ? b.value[1] : b.value;
            return vb - va;
          });
          valid.forEach(p => {
            const val = Array.isArray(p.value) ? p.value[1] : p.value;
            const isChile = p.seriesName === 'Chile';
            const weight = isChile ? 'bold' : 'normal';
            const color = isChile ? '#FFF265' : '#FFFFFF';
            str += `<div style="display:flex; justify-content:space-between; gap:20px; margin:3px 0; font-weight:${weight};">
              <span>${p.marker} ${p.seriesName}</span>
              <span style="color:${color};">${Math.round(val)} pts</span>
            </div>`;
          });
          return str;
        }
      },
      legend: {
        type: 'scroll',
        top: 0,
        selected: selectedMap,
        textStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 12, fontWeight: 600, color: '#252423' },
        pageTextStyle: { fontFamily: POLICY_PALETTE.fontFamily, color: '#252423' }
      },
      grid: { left: '3%', right: 195, bottom: '6%', top: '8%', containLabel: true },
      xAxis: {
        type: 'value',
        min: 2000,
        max: 2025,
        minInterval: 1,
        maxInterval: 1,
        interval: 1,
        axisLine: { lineStyle: { color: '#C5C1B6' } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          color: '#252423',
          fontWeight: 600,
          fontSize: 13,
          fontFamily: POLICY_PALETTE.fontFamily,
          hideOverlap: false,
          formatter: (val) => {
            const yr = Math.round(val);
            return years.includes(yr) ? String(yr) : '';
          }
        }
      },
      yAxis: {
        type: 'value',
        min: 320,
        max: 520,
        interval: 40,
        axisLabel: { formatter: '{value} pts', color: '#555555', fontFamily: POLICY_PALETTE.fontFamily },
        splitLine: { lineStyle: { type: 'dashed', color: '#ECE8DD' } }
      },
      series: buildSeries()
    };
  };

  const playFullChartAnimation = () => {
    chart.clear();
    chart.setOption(getOption(true), true);
  };

  // Animar todas las líneas cuando el usuario llega al gráfico durante el recorrido del sitio
  let hasAnimatedOnScroll = false;
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimatedOnScroll) {
          hasAnimatedOnScroll = true;
          playFullChartAnimation();
        }
      });
    }, { threshold: 0.2 });
    observer.observe(dom);
  } else {
    playFullChartAnimation();
  }

  // Botones para seleccionar todos los países o limpiar selección
  const btnSelectAll = document.getElementById('btn-latam-select-all');
  const btnClear = document.getElementById('btn-latam-clear');

  if (btnSelectAll) {
    btnSelectAll.addEventListener('click', () => {
      btnSelectAll.classList.add('active');
      if (btnClear) btnClear.classList.remove('active');
      playFullChartAnimation();
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      btnClear.classList.add('active');
      if (btnSelectAll) btnSelectAll.classList.remove('active');
      chart.setOption(getOption(false), true);
    });
  }

  chart.on('legendselectchanged', (params) => {
    const selectedValues = Object.values(params.selected || {});
    const allOn = selectedValues.length > 0 && selectedValues.every(Boolean);
    const allOff = selectedValues.length > 0 && selectedValues.every(v => !v);
    if (btnSelectAll) btnSelectAll.classList.toggle('active', allOn);
    if (btnClear) btnClear.classList.toggle('active', allOff);
  });

  window.addEventListener('resize', () => chart.resize());
}

/* --------------------------------------------------------------------------
   PUNTAJE PROMEDIO EN LECTURA EN PAÍSES DE AMÉRICA LATINA (2025)
   -------------------------------------------------------------------------- */
function renderFigura2LatAm(data) {
  const dom = document.getElementById('chart-figura-2-latam');
  if (!dom) return;
  const chart = echarts.init(dom);

  const raw = data.Comparativa_LatAm_OECD_2025 || [];

  // Filtrar países latinoamericanos
  const latamOnly = raw.filter(d => !d.Pais_o_Region.includes('OECD') && !d.Pais_o_Region.includes('Promedio'));
  latamOnly.sort((a, b) => a.Puntaje_Medio_2025 - b.Puntaje_Medio_2025);

  const names = latamOnly.map(d => d.Pais_o_Region);
  const scores = latamOnly.map(d => d.Puntaje_Medio_2025);

  chart.setOption({
    textStyle: { fontFamily: POLICY_PALETTE.fontFamily },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#252423',
      borderColor: '#FFF265',
      textStyle: { color: '#F9F7F2', fontFamily: POLICY_PALETTE.fontFamily },
      formatter: (params) => {
        const item = latamOnly[params[0].dataIndex];
        return `<strong>${item.Pais_o_Region}</strong><br/>
                Puntaje en lectura: <strong>${item.Puntaje_Medio_2025} pts</strong><br/>
                Estudiantes bajo Nivel 2: <strong>${item.Pct_Bajo_Nivel_2 ? item.Pct_Bajo_Nivel_2 + '%' : 'N/D'}</strong>`;
      }
    },
    grid: { left: '3%', right: '9%', bottom: '5%', top: '8%', containLabel: true },
    xAxis: {
      type: 'value',
      min: 320,
      max: 480,
      axisLabel: { formatter: '{value} pts', fontFamily: POLICY_PALETTE.fontFamily, color: '#555555' },
      splitLine: { lineStyle: { type: 'dashed', color: '#ECE8DD' } }
    },
    yAxis: {
      type: 'category',
      data: names,
      axisLabel: {
        color: (v) => v === 'Chile' ? POLICY_PALETTE.chile : '#252423',
        fontWeight: (v) => v === 'Chile' ? '800' : '600',
        fontSize: 12,
        fontFamily: POLICY_PALETTE.fontFamily
      }
    },
    series: [{
      name: 'Puntaje en lectura',
      type: 'bar',
      data: scores.map((val, idx) => {
        const isChile = names[idx] === 'Chile';
        return {
          value: val,
          itemStyle: {
            color: isChile ? POLICY_PALETTE.chile : POLICY_PALETTE.latam,
            borderRadius: [0, 4, 4, 0]
          }
        };
      }),
      label: {
        show: true,
        position: 'right',
        formatter: '{c} pts',
        fontWeight: 700,
        color: '#252423',
        fontFamily: POLICY_PALETTE.fontFamily
      },
      markLine: {
        silent: true,
        lineStyle: { type: 'dashed', color: POLICY_PALETTE.ocde, width: 2 },
        label: { formatter: 'Promedio OCDE (461 pts)', position: 'insideEndTop', fontFamily: POLICY_PALETTE.fontFamily, color: POLICY_PALETTE.ocde, fontWeight: 700 },
        data: [{ xAxis: 461 }]
      }
    }]
  });

  window.addEventListener('resize', () => chart.resize());
}

/* --------------------------------------------------------------------------
   FIGURA 7: PUNTAJE MEDIO EN LECTURA SEGÚN TASA DE COBERTURA POBLACIONAL (2025)
   -------------------------------------------------------------------------- */
function renderFigura7ScatterCobertura(data) {
  const dom = document.getElementById('chart-figura-7-scatter-cobertura');
  if (!dom) return;

  const chart = echarts.init(dom);
  const rows = data.Cobertura_vs_Puntaje_2025 || [];
  if (!rows.length) return;

  const countriesOnly = rows.filter(r => r.Grupo !== 'Promedio OCDE');
  const oecdRow = rows.find(r => r.Grupo === 'Promedio OCDE') || { Tasa_Cobertura_CI3_pct: 87.6, Puntaje_Lectura_2025: 460.94 };
  const chileRow = countriesOnly.find(r => r.Grupo === 'Chile' || r.Pais === 'Chile');
  const latamRows = countriesOnly.filter(r => r.Grupo === 'LatAm' && r.Pais !== 'Chile');
  const oecdMemberRows = countriesOnly.filter(r => r.Es_OCDE && r.Grupo !== 'LatAm' && r.Grupo !== 'Chile');
  const otherRows = countriesOnly.filter(r => !r.Es_OCDE && r.Grupo !== 'LatAm' && r.Grupo !== 'Chile');

  // Calcular regresión lineal global (X = cobertura %, Y = puntaje lectura)
  const n = countriesOnly.length;
  const xs = countriesOnly.map(r => Number(r.Tasa_Cobertura_CI3_pct));
  const ys = countriesOnly.map(r => Number(r.Puntaje_Lectura_2025));
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const slope = denX > 0 ? num / denX : 0;
  const intercept = meanY - slope * meanX;
  const rVal = (denX > 0 && denY > 0) ? num / Math.sqrt(denX * denY) : 0;
  const r2Val = rVal * rVal;

  const minX = Math.min(...xs);
  const trendData = [
    [minX, Number((slope * minX + intercept).toFixed(2))],
    [100, Number((slope * 100 + intercept).toFixed(2))]
  ];
  const trendName = `Tendencia global (r = ${rVal.toFixed(2)}; R² = ${r2Val.toFixed(2)})`;

  // Siglas ISO-3 y posición sugerida para países de América Latina
  const latamSiglas = {
    'Argentina': 'ARG',
    'Brasil': 'BRA',
    'Colombia': 'COL',
    'Costa Rica': 'CRI',
    'República Dominicana': 'DOM',
    'Rep. Dominicana': 'DOM',
    'Ecuador': 'ECU',
    'El Salvador': 'SLV',
    'Guatemala': 'GTM',
    'México': 'MEX',
    'Paraguay': 'PRY',
    'Perú': 'PER',
    'Uruguay': 'URY'
  };
  const leftSideLabels = new Set(['Colombia', 'Ecuador', 'El Salvador', 'Perú']);

  chart.setOption({
    textStyle: { fontFamily: POLICY_PALETTE.fontFamily },
    tooltip: {
      trigger: 'item',
      backgroundColor: '#252423',
      borderColor: '#FFF265',
      textStyle: { color: '#F9F7F2', fontFamily: POLICY_PALETTE.fontFamily },
      formatter: (p) => {
        if (p.seriesType === 'line') {
          return `<strong>${p.seriesName}</strong>`;
        }
        const d = p.data;
        if (!d || !Array.isArray(d.value)) return '';
        const name = d.name || p.seriesName;
        const ci3 = Number(d.value[0]).toFixed(1);
        const score = Math.round(Number(d.value[1]));
        const scoreDec = Number(d.value[1]).toFixed(1);
        return `<div style="font-weight:700; margin-bottom:4px; border-bottom:1px solid #444; padding-bottom:3px;">${name}</div>
          <div style="display:flex; justify-content:space-between; gap:16px;"><span>Tasa de cobertura (CI3):</span> <strong>${ci3}%</strong></div>
          <div style="display:flex; justify-content:space-between; gap:16px;"><span>Puntaje en lectura:</span> <strong>${score} pts (${scoreDec})</strong></div>`;
      }
    },
    legend: {
      top: 0,
      textStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 11.5, color: '#252423' },
      data: [
        'Chile',
        'Promedio OCDE',
        'Países de América Latina',
        'Países OCDE',
        'Otros países y economías PISA 2025',
        trendName
      ]
    },
    grid: { left: '6%', right: '5%', bottom: '11%', top: '13%', containLabel: true },
    xAxis: {
      type: 'value',
      name: 'Tasa de cobertura de la población de 15 años - Coverage Index 3 (%)',
      nameLocation: 'middle',
      nameGap: 32,
      nameTextStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontWeight: 700, fontSize: 12, color: '#252423' },
      min: 30,
      max: 110,
      interval: 10,
      axisLine: { lineStyle: { color: '#C5C1B6' } },
      axisLabel: { formatter: '{value}%', fontFamily: POLICY_PALETTE.fontFamily, color: '#555555' },
      splitLine: { lineStyle: { color: '#ECE8DD', type: 'dashed' } }
    },
    yAxis: {
      type: 'value',
      name: 'Puntaje promedio en lectura (PISA 2025)',
      nameLocation: 'middle',
      nameGap: 46,
      nameTextStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontWeight: 700, fontSize: 12, color: '#252423' },
      min: 280,
      max: 560,
      interval: 40,
      axisLine: { lineStyle: { color: '#C5C1B6' } },
      axisLabel: { formatter: '{value}', fontFamily: POLICY_PALETTE.fontFamily, color: '#555555' },
      splitLine: { lineStyle: { color: '#ECE8DD', type: 'dashed' } }
    },
    series: [
      {
        name: 'Otros países y economías PISA 2025',
        type: 'scatter',
        symbolSize: 8,
        z: 2,
        itemStyle: {
          color: 'rgba(148, 163, 184, 0.28)',
          borderColor: 'rgba(100, 116, 139, 0.45)',
          borderWidth: 0.8
        },
        data: otherRows.map(r => ({
          name: r.Pais,
          value: [r.Tasa_Cobertura_CI3_pct, r.Puntaje_Lectura_2025]
        }))
      },
      {
        name: 'Países OCDE',
        type: 'scatter',
        symbolSize: 9.2,
        z: 4,
        itemStyle: {
          color: 'rgba(185, 122, 132, 0.42)',
          borderColor: 'rgba(140, 90, 99, 0.55)',
          borderWidth: 1
        },
        data: oecdMemberRows.map(r => ({
          name: r.Pais,
          value: [r.Tasa_Cobertura_CI3_pct, r.Puntaje_Lectura_2025]
        }))
      },
      {
        name: trendName,
        type: 'line',
        data: trendData,
        showSymbol: false,
        silent: true,
        z: 3,
        lineStyle: {
          color: '#64748B',
          type: 'dashed',
          width: 1.8
        }
      },
      {
        name: 'Países de América Latina',
        type: 'scatter',
        symbolSize: 10.5,
        z: 5,
        itemStyle: {
          color: 'rgba(77, 182, 181, 0.5)',
          borderColor: 'rgba(43, 91, 100, 0.6)',
          borderWidth: 1.1
        },
        labelLayout: {
          moveOverlap: 'shiftY'
        },
        data: latamRows.map(r => ({
          name: r.Pais,
          value: [r.Tasa_Cobertura_CI3_pct, r.Puntaje_Lectura_2025],
          label: {
            show: true,
            position: leftSideLabels.has(r.Pais) ? 'left' : 'right',
            distance: 5,
            formatter: () => latamSiglas[r.Pais] || r.Pais,
            fontFamily: POLICY_PALETTE.fontFamily,
            fontSize: 9.5,
            fontWeight: 700,
            color: '#2B5B64',
            backgroundColor: 'rgba(255, 255, 255, 0.78)',
            borderRadius: 2,
            padding: [1, 3]
          }
        }))
      },
      {
        name: 'Promedio OCDE',
        type: 'scatter',
        symbol: 'diamond',
        symbolSize: 15,
        z: 7,
        itemStyle: {
          color: '#8C5A63',
          borderColor: '#FFFFFF',
          borderWidth: 1.8
        },
        label: {
          show: true,
          position: 'top',
          distance: 7,
          formatter: () => `Promedio OCDE (${Number(oecdRow.Tasa_Cobertura_CI3_pct).toFixed(1)}%; ${Math.round(oecdRow.Puntaje_Lectura_2025)} pts)`,
          fontFamily: POLICY_PALETTE.fontFamily,
          fontSize: 10,
          fontWeight: 800,
          color: '#8C5A63',
          backgroundColor: '#FDF2F4',
          borderColor: '#8C5A63',
          borderWidth: 1,
          borderRadius: 4,
          padding: [3, 6]
        },
        markLine: {
          symbol: 'none',
          silent: true,
          z: 1,
          lineStyle: { color: '#8C5A63', type: 'dotted', width: 1.3, opacity: 0.7 },
          label: { show: false },
          data: [
            { xAxis: oecdRow.Tasa_Cobertura_CI3_pct },
            { yAxis: oecdRow.Puntaje_Lectura_2025 }
          ]
        },
        data: [{
          name: 'Promedio OCDE',
          value: [oecdRow.Tasa_Cobertura_CI3_pct, oecdRow.Puntaje_Lectura_2025]
        }]
      },
      {
        name: 'Chile',
        type: 'scatter',
        symbolSize: 16,
        z: 8,
        itemStyle: {
          color: '#3C4D5D',
          borderColor: '#FFFFFF',
          borderWidth: 2.2
        },
        label: {
          show: true,
          position: 'bottom',
          distance: 8,
          formatter: () => chileRow ? `Chile (${Number(chileRow.Tasa_Cobertura_CI3_pct).toFixed(1)}%; ${Math.round(chileRow.Puntaje_Lectura_2025)} pts)` : 'Chile',
          fontFamily: POLICY_PALETTE.fontFamily,
          fontSize: 10.5,
          fontWeight: 800,
          color: '#FFFFFF',
          backgroundColor: '#3C4D5D',
          borderColor: '#3C4D5D',
          borderWidth: 1,
          borderRadius: 4,
          padding: [4, 7]
        },
        data: chileRow ? [{
          name: 'Chile',
          value: [chileRow.Tasa_Cobertura_CI3_pct, chileRow.Puntaje_Lectura_2025]
        }] : []
      }
    ]
  });

  window.addEventListener('resize', () => chart.resize());
}

/* --------------------------------------------------------------------------
   GRÁFICOS DIVERGENTES DE NIVELES Y CONDICIÓN DE COBERTURA POBLACIONAL
   1) Evolución 2006 - 2025 (Chile, Promedio OCDE, Promedio LatAm x 3 Fórmulas)
   2) Comparativa PISA 2025 en bloque independiente, orientación horizontal y 3 Fórmulas
   -------------------------------------------------------------------------- */
function renderFiguras8y9Divergente(data) {
  const domEvol = document.getElementById('chart-figura-8-9-divergente');
  const domComp = document.getElementById('chart-figura-9-comparativa-2025');

  const rawEstandar = data.Evolucion_Niveles_Cobertura || [];
  const rawAjustada = data.Evolucion_Niveles_Cob_AjustMat || [];
  const rawInterEstandar = data.OCDE38_LatAm_Divergente_2025_v0 || data.OCDE38_LatAm_Divergente_2025 || [];
  const rawInterAjustada = data.OCDE38_LatAm_Divergente_2025 || [];

  const toPct = (v) => (v === null || v === undefined) ? 0 : (Math.abs(v) <= 1.0 ? v * 100 : v);

  const createStackedSeries = (name, dataValues, color, textColor, options = {}) => {
    const {
      fontSize = 9.5,
      useIntegers = false,
      showZero = false,
      labelPosition = 'inside',
      labelDistance = 5,
      barCategoryGap = undefined
    } = options;

    return {
      name: name,
      type: 'bar',
      stack: 'total',
      barCategoryGap: barCategoryGap,
      data: dataValues,
      itemStyle: {
        color: color
      },
      label: {
        show: true,
        position: labelPosition,
        distance: labelDistance,
        formatter: (p) => {
          const val = (p.value && typeof p.value === 'object') ? p.value.value : p.value;
          const absVal = Math.abs(val || 0);
          if (useIntegers) {
            const rounded = Math.round(absVal);
            if (showZero) return `${rounded}%`;
            return rounded >= 1 ? `${rounded}%` : '';
          }
          if (showZero) return `${absVal.toFixed(1)}%`;
          return absVal >= 0.1 ? `${absVal.toFixed(1)}%` : '';
        },
        fontSize: fontSize,
        fontWeight: 600,
        color: textColor,
        fontFamily: POLICY_PALETTE.fontFamily
      }
    };
  };

  const formulaTitles = {
    original: 'Distribución de estudiantes cubiertos en PISA',
    estandar: 'Distribución con estudiantes sin cobertura',
    ajustada: 'Distribución ajustada con estudiantes fuera de muestra'
  };

  // ==========================================================================
  // GRÁFICO 1: Evolución Histórica (2006 - 2025) por Entidad y Fórmula
  // ==========================================================================
  if (domEvol) {
    const chartEvol = echarts.init(domEvol);
    const targetYears = [2006, 2009, 2012, 2015, 2018, 2022, 2025];

    let currentEntidad = 'chile';
    let currentFormula = 'original';

    const entidadLabels = {
      chile: 'Chile',
      ocde: 'Promedio OCDE',
      latam: 'Promedio América Latina'
    };

    const getRowForEntityYear = (sourceTable, entidad, yr) => {
      if (entidad === 'chile') {
        return sourceTable.find(r => r.Entidad === 'Chile' && Number(r.Ano) === yr);
      }
      if (entidad === 'latam') {
        return sourceTable.find(r => (r.Entidad || '').includes('LatAm') && Number(r.Ano) === yr);
      }
      if (entidad === 'ocde') {
        const targetName = yr <= 2009 ? 'Promedio OCDE-23' : 'Promedio OCDE-35';
        return sourceTable.find(r => r.Entidad === targetName && Number(r.Ano) === yr)
            || sourceTable.find(r => r.Entidad === 'Promedio OCDE-23' && Number(r.Ano) === yr);
      }
      return null;
    };

    const renderEvolucion = () => {
      const sourceTable = currentFormula === 'ajustada' ? rawAjustada : rawEstandar;
      const rows = targetYears.map(yr => getRowForEntityYear(sourceTable, currentEntidad, yr)).filter(Boolean);
      const years = rows.map(r => String(r.Ano));

      const isOriginal = currentFormula === 'original';
      const isAjustada = currentFormula === 'ajustada';

      const n56 = rows.map(d => toPct(isOriginal ? d['Muestra:_Nivel_5_6_pct'] : d['Poblacion:_Nivel_5_6_pct']));
      const n34 = rows.map(d => toPct(isOriginal ? d['Muestra:_Nivel_3_4_pct'] : d['Poblacion:_Nivel_3_4_pct']));
      const n2  = rows.map(d => toPct(isOriginal ? d['Muestra:_Nivel_2_pct'] : d['Poblacion:_Nivel_2_pct']));
      const compTotals = rows.map((_, i) => n56[i] + n34[i] + n2[i]);
      const mn2 = rows.map(d => -toPct(isOriginal ? d['Muestra:_<_Nivel_2_pct'] : d['Poblacion:_Menor_a_Nivel_2_pct']));
      const noEval = rows.map(d => -toPct(d['Poblacion:_Sin_Cobertura__No_evaluados_en_muestra_pct']));
      const fuera7 = rows.map(d => -toPct(d['Poblacion:_Sin_Cobertura__Fuera_de_7modeg_o_mas_pct']));

      const totalLegendItem = {
        name: 'Total Nivel 2 o más',
        icon: 'roundRect',
        itemStyle: {
          color: '#E3F3F3',
          borderColor: '#426871',
          borderWidth: 1.5
        }
      };

      let legendItems = [];
      if (isOriginal) {
        legendItems = [totalLegendItem, 'Nivel 5-6', 'Nivel 3-4', 'Nivel 2', 'Menor a Nivel 2'];
      } else if (isAjustada) {
        legendItems = [totalLegendItem, 'Nivel 5-6', 'Nivel 3-4', 'Nivel 2', 'Menor a Nivel 2', 'Sin cobertura por fuera de matrícula'];
      } else {
        legendItems = [
          totalLegendItem,
          'Nivel 5-6',
          'Nivel 3-4',
          'Nivel 2',
          'Menor a Nivel 2',
          'Sin cobertura por fuera de la muestra',
          'Sin cobertura por fuera de matrícula'
        ];
      }

      const seriesList = [
        createStackedSeries('Nivel 2', n2, POLICY_PALETTE.n2, '#252423', { fontSize: 10 }),
        createStackedSeries('Nivel 3-4', n34, POLICY_PALETTE.n34, '#FFFFFF', { fontSize: 10 }),
        createStackedSeries('Nivel 5-6', n56, POLICY_PALETTE.n56, '#252423', { fontSize: 10, labelPosition: 'top', labelDistance: 3 }),
        createStackedSeries('Menor a Nivel 2', mn2, POLICY_PALETTE.mn2, '#252423', { fontSize: 10 }),
        {
          name: 'Total Nivel 2 o más',
          type: 'scatter',
          data: compTotals,
          symbol: 'roundRect',
          symbolSize: 0,
          itemStyle: {
            color: '#E3F3F3',
            borderColor: '#426871',
            borderWidth: 1.5
          },
          silent: true,
          z: 10,
          label: {
            show: true,
            position: 'top',
            distance: 19,
            formatter: (p) => `${Number(p.value).toFixed(1)}%`,
            fontFamily: POLICY_PALETTE.fontFamily,
            fontSize: 10.5,
            fontWeight: 800,
            color: '#183B42',
            backgroundColor: '#E3F3F3',
            borderColor: '#426871',
            borderWidth: 1.2,
            borderRadius: 4,
            padding: [3, 6]
          }
        }
      ];

      if (!isOriginal && !isAjustada) {
        seriesList.push(createStackedSeries('Sin cobertura por fuera de la muestra', noEval, POLICY_PALETTE.sinCobNoEval, '#252423', { fontSize: 10 }));
      }
      if (!isOriginal) {
        seriesList.push(createStackedSeries('Sin cobertura por fuera de matrícula', fuera7, POLICY_PALETTE.sinCobFuera, '#252423', { fontSize: 10 }));
      }

      chartEvol.setOption({
        textStyle: { fontFamily: POLICY_PALETTE.fontFamily },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: '#252423',
          borderColor: '#FFF265',
          textStyle: { color: '#F9F7F2', fontFamily: POLICY_PALETTE.fontFamily },
          formatter: (params) => {
            const formulaTitle = formulaTitles[currentFormula] || '';
            const idx = params[0].dataIndex;
            const totalN2Mas = compTotals[idx] || 0;
            let str = `<div style="font-weight:700; margin-bottom:5px; border-bottom:1px solid #444; padding-bottom:4px;">${entidadLabels[currentEntidad]} · Año ${params[0].axisValue}<br/><span style="font-weight:400; font-size:11px; color:#CFCBC2;">${formulaTitle}</span></div>`;
            str += `<div style="display:flex; justify-content:space-between; gap:16px; margin:3px 0 5px 0; padding:3px 6px; background:rgba(77,182,181,0.18); border-radius:4px; color:#FFF265;">
              <strong>Total Nivel 2 o más</strong>
              <strong>${totalN2Mas.toFixed(1)}%</strong>
            </div>`;
            params.forEach(p => {
              if (p.seriesName === 'Total Nivel 2 o más') return;
              const val = Math.abs(p.value);
              str += `<div style="display:flex; justify-content:space-between; gap:16px; margin:2px 0;">
                <span><span style="color:${p.color}">●</span> ${p.seriesName}</span>
                <strong>${val.toFixed(1)}%</strong>
              </div>`;
            });
            return str;
          }
        },
        legend: {
          data: legendItems,
          top: 0,
          textStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 12, color: '#252423' }
        },
        grid: { left: '4%', right: '4%', bottom: '8%', top: '14%', containLabel: true },
        xAxis: {
          type: 'category',
          data: years,
          axisLine: { lineStyle: { color: '#C5C1B6' } },
          axisLabel: { fontFamily: POLICY_PALETTE.fontFamily, fontWeight: 700, color: '#252423' }
        },
        yAxis: {
          type: 'value',
          min: -80,
          max: 100,
          interval: 20,
          axisLabel: { formatter: (v) => `${Math.abs(v)}%`, fontFamily: POLICY_PALETTE.fontFamily, color: '#555555' },
          splitLine: { lineStyle: { color: '#ECE8DD' } }
        },
        series: seriesList
      }, true);
    };

    renderEvolucion();

    const ctrlEntidad = document.getElementById('control-evolucion-entidad');
    if (ctrlEntidad) {
      ctrlEntidad.querySelectorAll('.seg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          ctrlEntidad.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentEntidad = btn.dataset.entidad || 'chile';
          renderEvolucion();
        });
      });
    }

    const ctrlFormula = document.getElementById('control-evolucion-formula');
    if (ctrlFormula) {
      ctrlFormula.querySelectorAll('.seg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          ctrlFormula.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentFormula = btn.dataset.formula || 'original';
          renderEvolucion();
        });
      });
    }

    window.addEventListener('resize', () => chartEvol.resize());
  }

  // ==========================================================================
  // GRÁFICO 2: Comparativa PISA 2025 (Países en horizontal en el eje X y 3 fórmulas)
  // ==========================================================================
  if (domComp) {
    const chartComp = echarts.init(domComp);

    let currentCompFiltro = 'todos';
    let currentCompFormula = 'original';

    const renderComparativa2025 = () => {
      const sourceRaw = currentCompFormula === 'estandar' ? rawInterEstandar : rawInterAjustada;
      const baseList = sourceRaw.filter(d => !['Promedio OCDE-23', 'Promedio OCDE (desde 2006)'].includes(d.Pais));

      let filtered = [];
      if (currentCompFiltro === 'latam') {
        filtered = baseList.filter(d => d.Es_LatAm === true || d.Es_LatAm === 1 || (d.Pais || '').includes('Promedio LatAm') || d.Pais === 'Chile');
      } else if (currentCompFiltro === 'ocde') {
        filtered = baseList.filter(d => d.Es_OCDE === true || d.Es_OCDE === 1 || (d.Pais || '').includes('Promedio OCDE') || d.Pais === 'Chile');
      } else if (currentCompFiltro === 'top20') {
        filtered = baseList.filter(d => d.Es_Top20_Asociado === true || d.Pais === 'Chile' || (d.Pais || '').includes('Promedio'));
      } else {
        filtered = [...baseList];
      }

      const isOriginal = currentCompFormula === 'original';
      const isAjustada = currentCompFormula === 'ajustada';

      // Calcular valores según fórmula seleccionada
      const computedRows = filtered.map(d => {
        const raw56 = toPct(d.Nivel_5_6_pct);
        const raw34 = toPct(d.Nivel_3_4_pct);
        const raw2  = toPct(d.Nivel_2_pct);
        const rawMn2 = toPct(d.Menor_a_nivel_2_pct);
        const sumSample = (raw56 + raw34 + raw2 + rawMn2) || 100;

        if (isOriginal) {
          const v56 = (raw56 / sumSample) * 100;
          const v34 = (raw34 / sumSample) * 100;
          const v2  = (raw2 / sumSample) * 100;
          const vMn2 = (rawMn2 / sumSample) * 100;
          return {
            name: d.Pais || d.Pais_EN,
            n56: v56,
            n34: v34,
            n2: v2,
            mn2: -vMn2,
            noEval: 0,
            fuera7: 0,
            compTotal: v56 + v34 + v2
          };
        }

        return {
          name: d.Pais || d.Pais_EN,
          n56: raw56,
          n34: raw34,
          n2: raw2,
          mn2: -rawMn2,
          noEval: -toPct(d.Sin_cobertura_no_participantes_muestra_pct),
          fuera7: -toPct(d.Sin_cobertura_fuera_7momo_mas_pct || d.Sin_cobertura_fuera_7mo_mas_pct),
          compTotal: raw56 + raw34 + raw2
        };
      });

      // Ordenar de mayor a menor competencia de izquierda a derecha en el eje X
      computedRows.sort((a, b) => b.compTotal - a.compTotal);

      const names = computedRows.map(r => r.name);
      const labelFontSize = computedRows.length > 35 ? 5.2 : (computedRows.length > 20 ? 6.2 : 7.5);
      const catGap = computedRows.length > 35 ? '20%' : '28%';

      const n56 = computedRows.map(r => r.n56);
      const n34 = computedRows.map(r => r.n34);
      const n2  = computedRows.map(r => r.n2);
      const compTotals = computedRows.map(r => r.compTotal);
      const mn2 = computedRows.map(r => r.mn2);
      const noEval = computedRows.map(r => r.noEval);
      const fuera7 = computedRows.map(r => r.fuera7);

      const totalLegendItem = {
        name: 'Total Nivel 2 o más',
        icon: 'roundRect',
        itemStyle: {
          color: '#E3F3F3',
          borderColor: '#426871',
          borderWidth: 1.5
        }
      };

      let legendItems = [];
      if (isOriginal) {
        legendItems = [totalLegendItem, 'Nivel 5-6', 'Nivel 3-4', 'Nivel 2', 'Menor a Nivel 2'];
      } else if (isAjustada) {
        legendItems = [totalLegendItem, 'Nivel 5-6', 'Nivel 3-4', 'Nivel 2', 'Menor a Nivel 2', 'Sin cobertura por fuera de matrícula'];
      } else {
        legendItems = [
          totalLegendItem,
          'Nivel 5-6',
          'Nivel 3-4',
          'Nivel 2',
          'Menor a Nivel 2',
          'Sin cobertura por fuera de la muestra',
          'Sin cobertura por fuera de matrícula'
        ];
      }

      const isMany = computedRows.length > 35;
      const totalFontSize = isMany ? 5.2 : (computedRows.length > 20 ? 6.5 : 8);

      const seriesList = [
        createStackedSeries('Nivel 2', n2, POLICY_PALETTE.n2, '#252423', { fontSize: labelFontSize, useIntegers: true, barCategoryGap: catGap }),
        createStackedSeries('Nivel 3-4', n34, POLICY_PALETTE.n34, '#FFFFFF', { fontSize: labelFontSize, useIntegers: true, barCategoryGap: catGap }),
        createStackedSeries('Nivel 5-6', n56, POLICY_PALETTE.n56, '#252423', { fontSize: labelFontSize, useIntegers: true, showZero: true, labelPosition: 'top', labelDistance: 2, barCategoryGap: catGap }),
        createStackedSeries('Menor a Nivel 2', mn2, POLICY_PALETTE.mn2, '#252423', { fontSize: labelFontSize, useIntegers: true, barCategoryGap: catGap }),
        {
          name: 'Total Nivel 2 o más',
          type: 'scatter',
          data: compTotals,
          symbol: 'roundRect',
          symbolSize: 0,
          itemStyle: {
            color: '#E3F3F3',
            borderColor: '#426871',
            borderWidth: 1.5
          },
          silent: true,
          z: 10,
          label: {
            show: true,
            position: 'top',
            distance: isMany ? 11 : 14,
            formatter: (p) => `${Math.round(Number(p.value) || 0)}%`,
            fontFamily: POLICY_PALETTE.fontFamily,
            fontSize: totalFontSize,
            fontWeight: 800,
            color: '#183B42',
            backgroundColor: '#E3F3F3',
            borderColor: '#426871',
            borderWidth: isMany ? 0.8 : 1,
            borderRadius: 2.5,
            padding: isMany ? [1.5, 1.5] : [2, 4]
          }
        }
      ];

      if (!isOriginal && !isAjustada) {
        seriesList.push(createStackedSeries('Sin cobertura por fuera de la muestra', noEval, POLICY_PALETTE.sinCobNoEval, '#252423', { fontSize: labelFontSize, useIntegers: true, barCategoryGap: catGap }));
      }
      if (!isOriginal) {
        seriesList.push(createStackedSeries('Sin cobertura por fuera de matrícula', fuera7, POLICY_PALETTE.sinCobFuera, '#252423', { fontSize: labelFontSize, useIntegers: true, barCategoryGap: catGap }));
      }

      chartComp.setOption({
        textStyle: { fontFamily: POLICY_PALETTE.fontFamily },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: '#252423',
          borderColor: '#FFF265',
          textStyle: { color: '#F9F7F2', fontFamily: POLICY_PALETTE.fontFamily },
          formatter: (params) => {
            const formulaTitle = formulaTitles[currentCompFormula] || '';
            const idx = params[0].dataIndex;
            const totalN2Mas = compTotals[idx] || 0;
            let str = `<div style="font-weight:700; margin-bottom:5px; border-bottom:1px solid #444; padding-bottom:4px;">${params[0].axisValue}<br/><span style="font-weight:400; font-size:11px; color:#CFCBC2;">${formulaTitle}</span></div>`;
            str += `<div style="display:flex; justify-content:space-between; gap:16px; margin:3px 0 5px 0; padding:3px 6px; background:rgba(77,182,181,0.18); border-radius:4px; color:#FFF265;">
              <strong>Total Nivel 2 o más</strong>
              <strong>${totalN2Mas.toFixed(1)}%</strong>
            </div>`;
            params.forEach(p => {
              if (p.seriesName === 'Total Nivel 2 o más') return;
              const rawVal = (p.value && typeof p.value === 'object') ? p.value.value : p.value;
              const val = Math.abs(rawVal || 0);
              str += `<div style="display:flex; justify-content:space-between; gap:16px; margin:2px 0;">
                <span><span style="color:${p.color}">●</span> ${p.seriesName}</span>
                <strong>${val.toFixed(1)}%</strong>
              </div>`;
            });
            return str;
          }
        },
        legend: {
          data: legendItems,
          top: 0,
          textStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 12, color: '#252423' }
        },
        grid: { left: '2.5%', right: '1.5%', bottom: '18%', top: '12%', containLabel: true },
        xAxis: {
          type: 'category',
          data: names,
          axisLine: { lineStyle: { color: '#C5C1B6' } },
          axisTick: { alignWithLabel: true },
          axisLabel: {
            interval: 0,
            rotate: 45,
            fontFamily: POLICY_PALETTE.fontFamily,
            fontSize: computedRows.length > 35 ? 5.8 : (computedRows.length > 20 ? 7 : 7.8),
            color: (name) => {
              if (name === 'Chile') return '#D9381E';
              if ((name || '').includes('OCDE') || (name || '').includes('OECD')) return '#8C5A63';
              if ((name || '').includes('LatAm') || (name || '').includes('Latinoam')) return '#0D9488';
              return '#252423';
            },
            fontWeight: (name) => {
              if (name === 'Chile' || (name || '').includes('Promedio')) return 800;
              return 500;
            }
          }
        },
        yAxis: {
          type: 'value',
          min: -100,
          max: 100,
          interval: 20,
          axisLabel: { formatter: (v) => `${Math.abs(v)}%`, fontFamily: POLICY_PALETTE.fontFamily, color: '#555555' },
          splitLine: { lineStyle: { color: '#ECE8DD' } }
        },
        series: seriesList
      }, true);
    };

    renderComparativa2025();

    const ctrlFiltro = document.getElementById('control-divergente-filtro');
    if (ctrlFiltro) {
      ctrlFiltro.querySelectorAll('.seg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          ctrlFiltro.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentCompFiltro = btn.dataset.filter || 'todos';
          renderComparativa2025();
        });
      });
    }

    const ctrlCompFormula = document.getElementById('control-comparativa-formula');
    if (ctrlCompFormula) {
      ctrlCompFormula.querySelectorAll('.seg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          ctrlCompFormula.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentCompFormula = btn.dataset.formula || 'original';
          renderComparativa2025();
        });
      });
    }

    window.addEventListener('resize', () => chartComp.resize());
  }
}

/* --------------------------------------------------------------------------
   FIGURAS 10 Y 11: EVOLUCIÓN POR CUARTIL SOCIOECONÓMICO (2015 - 2025)
   Y TENDENCIA DEL PROMEDIO OCDE Y AMÉRICA LATINA
   -------------------------------------------------------------------------- */
function renderFigura10Escs(data) {
  const dom = document.getElementById('chart-figura-10-escs');
  if (!dom) return;
  const chart = echarts.init(dom);

  const years = [2015, 2018, 2022, 2025];
  const q1 = [416.3, 414.9, 413.5, 411.9];
  const q2 = [454.8, 443.2, 440.7, 427.1];
  const q3 = [462.3, 454.8, 457.5, 441.2];
  const q4 = [504.7, 501.7, 489.3, 483.5];

  // Tendencia promedio OCDE y América Latina (2015 - 2025)
  const ocdeMean = [490.3, 487.6, 477.3, 463.0];
  const latamMean = [425.1, 419.2, 417.1, 408.6];

  // Brechas Q4 - Q1 (2015 - 2025)
  const gapsChile = [88.4, 86.8, 75.8, 71.5];
  const gapsOcde = [84.7, 87.9, 93.4, 76.5];
  const gapsLatam = [89.8, 94.1, 91.1, 82.7];

  const toPairs = (arr) => years.map((yr, i) => [yr, Math.round(arr[i])]);

  const getOptionCuartiles = () => ({
    textStyle: { fontFamily: POLICY_PALETTE.fontFamily },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#252423',
      borderColor: '#FFF265',
      textStyle: { color: '#F9F7F2', fontFamily: POLICY_PALETTE.fontFamily },
      formatter: (params) => {
        const yr = Array.isArray(params[0].value) ? params[0].value[0] : params[0].axisValue;
        let str = `<div style="font-weight:700; margin-bottom:5px; border-bottom:1px solid #444; padding-bottom:4px;">Año ${yr}</div>`;
        params.forEach(p => {
          const val = Array.isArray(p.value) ? p.value[1] : p.value;
          str += `<div style="display:flex; justify-content:space-between; gap:16px; margin:2px 0;">
            <span><span style="color:${p.color}">●</span> ${p.seriesName}</span>
            <strong>${val} pts</strong>
          </div>`;
        });
        return str;
      }
    },
    legend: {
      top: 0,
      textStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 11.5, color: '#252423' },
      data: [
        'Chile: Cuartil 4 (Alto)',
        'Chile: Cuartil 3 (Medio Alto)',
        'Chile: Cuartil 2 (Medio Bajo)',
        'Chile: Cuartil 1 (Bajo)',
        'Promedio OCDE',
        'Promedio América Latina (LatAm-8)'
      ]
    },
    grid: { left: '6.5%', right: '4%', bottom: '10%', top: '15%', containLabel: true },
    xAxis: {
      type: 'value',
      min: 2014,
      max: 2026,
      interval: 1,
      axisLine: { lineStyle: { color: '#C5C1B6' } },
      axisTick: {
        customValues: years
      },
      axisLabel: {
        fontFamily: POLICY_PALETTE.fontFamily,
        fontSize: 10.5,
        fontWeight: 600,
        color: '#252423',
        formatter: (val) => years.includes(val) ? String(val) : ''
      },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      name: 'Puntaje promedio en lectura',
      nameLocation: 'middle',
      nameGap: 64,
      nameTextStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontWeight: 700, fontSize: 12, color: '#252423' },
      min: 380,
      max: 520,
      interval: 20,
      axisLabel: { formatter: '{value} pts', fontSize: 10.5, fontFamily: POLICY_PALETTE.fontFamily, color: '#555555' },
      splitLine: { lineStyle: { color: '#ECE8DD', type: 'dashed' } }
    },
    series: [
      {
        name: 'Chile: Cuartil 4 (Alto)',
        type: 'line',
        data: toPairs(q4),
        symbol: 'circle',
        symbolSize: 8,
        z: 5,
        lineStyle: { width: 3, color: '#3C4D5D' },
        itemStyle: { color: '#3C4D5D' },
        label: { show: true, position: 'top', formatter: (p) => `${p.value[1]}`, fontWeight: 700, fontSize: 10.5, color: '#3C4D5D', fontFamily: POLICY_PALETTE.fontFamily }
      },
      {
        name: 'Chile: Cuartil 3 (Medio Alto)',
        type: 'line',
        data: toPairs(q3),
        symbol: 'rect',
        symbolSize: 7.5,
        z: 4,
        lineStyle: { width: 2.6, color: '#4DB6B5' },
        itemStyle: { color: '#4DB6B5' },
        label: { show: true, position: 'top', formatter: (p) => `${p.value[1]}`, fontWeight: 700, fontSize: 10, color: '#2E8B8A', fontFamily: POLICY_PALETTE.fontFamily }
      },
      {
        name: 'Chile: Cuartil 2 (Medio Bajo)',
        type: 'line',
        data: toPairs(q2),
        symbol: 'triangle',
        symbolSize: 7.5,
        z: 4,
        lineStyle: { width: 2.6, color: '#9FA6C4' },
        itemStyle: { color: '#9FA6C4' },
        label: { show: true, position: 'bottom', formatter: (p) => `${p.value[1]}`, fontWeight: 700, fontSize: 10, color: '#687091', fontFamily: POLICY_PALETTE.fontFamily }
      },
      {
        name: 'Chile: Cuartil 1 (Bajo)',
        type: 'line',
        data: toPairs(q1),
        symbol: 'diamond',
        symbolSize: 8,
        z: 5,
        lineStyle: { width: 3, color: '#8C5A63' },
        itemStyle: { color: '#8C5A63' },
        label: { show: true, position: 'top', formatter: (p) => `${p.value[1]}`, fontWeight: 700, fontSize: 10.5, color: '#8C5A63', fontFamily: POLICY_PALETTE.fontFamily }
      },
      {
        name: 'Promedio OCDE',
        type: 'line',
        data: toPairs(ocdeMean),
        symbol: 'emptyCircle',
        symbolSize: 5,
        z: 2,
        lineStyle: { width: 1.5, type: 'dashed', color: '#8C5A63', opacity: 0.45 },
        itemStyle: { color: '#8C5A63', opacity: 0.45 },
        label: { show: false }
      },
      {
        name: 'Promedio América Latina (LatAm-8)',
        type: 'line',
        data: toPairs(latamMean),
        symbol: 'emptyCircle',
        symbolSize: 5,
        z: 2,
        lineStyle: { width: 1.5, type: 'dashed', color: '#4DB6B5', opacity: 0.45 },
        itemStyle: { color: '#4DB6B5', opacity: 0.45 },
        label: { show: false }
      }
    ]
  });

  const getOptionBrecha = () => ({
    textStyle: { fontFamily: POLICY_PALETTE.fontFamily },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#252423',
      borderColor: '#FFF265',
      textStyle: { color: '#F9F7F2', fontFamily: POLICY_PALETTE.fontFamily },
      formatter: (params) => {
        let str = `<div style="font-weight:700; margin-bottom:5px; border-bottom:1px solid #444; padding-bottom:4px;">Año ${params[0].axisValue}</div>`;
        params.forEach(p => {
          str += `<div style="display:flex; justify-content:space-between; gap:16px; margin:2px 0;">
            <span><span style="color:${p.color}">●</span> ${p.seriesName}</span>
            <strong>${Number(p.value).toFixed(1)} pts</strong>
          </div>`;
        });
        return str;
      }
    },
    legend: {
      top: 0,
      textStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 11.5, color: '#252423' },
      data: [
        'Brecha Q4 - Q1 en Chile',
        'Brecha Q4 - Q1 Promedio OCDE',
        'Brecha Q4 - Q1 Promedio América Latina'
      ]
    },
    grid: { left: '6.5%', right: '4%', bottom: '10%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: years.map(String),
      axisLine: { lineStyle: { color: '#C5C1B6' } },
      axisLabel: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 10.5, fontWeight: 700, color: '#252423' }
    },
    yAxis: {
      type: 'value',
      name: 'Diferencia de puntaje (Q4 - Q1)',
      nameLocation: 'middle',
      nameGap: 64,
      nameTextStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontWeight: 700, fontSize: 12, color: '#252423' },
      min: 0,
      max: 120,
      interval: 20,
      axisLabel: { formatter: '{value} pts', fontSize: 10.5, fontFamily: POLICY_PALETTE.fontFamily, color: '#555555' },
      splitLine: { lineStyle: { color: '#ECE8DD', type: 'dashed' } }
    },
    series: [
      {
        name: 'Brecha Q4 - Q1 en Chile',
        type: 'bar',
        barGap: '15%',
        barWidth: 32,
        data: gapsChile,
        itemStyle: { color: '#3C4D5D', borderRadius: [5, 5, 0, 0] },
        label: { show: true, position: 'top', formatter: (p) => `${Number(p.value).toFixed(1)}`, fontSize: 10, fontWeight: 700, color: '#3C4D5D', fontFamily: POLICY_PALETTE.fontFamily }
      },
      {
        name: 'Brecha Q4 - Q1 Promedio OCDE',
        type: 'bar',
        barWidth: 32,
        data: gapsOcde,
        itemStyle: { color: '#8C5A63', borderRadius: [5, 5, 0, 0] },
        label: { show: true, position: 'top', formatter: (p) => `${Number(p.value).toFixed(1)}`, fontSize: 10, fontWeight: 600, color: '#8C5A63', fontFamily: POLICY_PALETTE.fontFamily }
      },
      {
        name: 'Brecha Q4 - Q1 Promedio América Latina',
        type: 'bar',
        barWidth: 32,
        data: gapsLatam,
        itemStyle: { color: '#4DB6B5', borderRadius: [5, 5, 0, 0] },
        label: { show: true, position: 'top', formatter: (p) => `${Number(p.value).toFixed(1)}`, fontSize: 10, fontWeight: 600, color: '#2E8B8A', fontFamily: POLICY_PALETTE.fontFamily }
      }
    ]
  });

  chart.setOption(getOptionCuartiles(), true);

  const ctrl = document.getElementById('control-escs-vista');
  if (ctrl) {
    ctrl.querySelectorAll('.seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        ctrl.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const view = btn.dataset.view;
        chart.setOption(view === 'brecha' ? getOptionBrecha() : getOptionCuartiles(), true);
      });
    });
  }

  window.addEventListener('resize', () => chart.resize());
}

/* --------------------------------------------------------------------------
   FIGURA 12: COMPARACIÓN DE CUARTILES SOCIOECONÓMICOS CHILE VS OCDE (2025)
   -------------------------------------------------------------------------- */
function renderFigura12EscsOcde(data) {
  const dom = document.getElementById('chart-figura-12-escs-ocde');
  if (!dom) return;
  const chart = echarts.init(dom);

  const grupos = ['Bajo (Q1)', 'Medio Bajo (Q2)', 'Medio Alto (Q3)', 'Alto (Q4)'];
  const chileQ = [411.9, 427.1, 441.2, 483.5];
  const ocdeQ = [429.1, 456.4, 484.0, 506.3];
  const ocdeMean = 461;
  const chileMean = 436;

  chart.setOption({
    textStyle: { fontFamily: POLICY_PALETTE.fontFamily },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#252423',
      borderColor: '#FFF265',
      textStyle: { color: '#F9F7F2', fontFamily: POLICY_PALETTE.fontFamily },
      formatter: (params) => {
        let str = `<div style="font-weight:700; margin-bottom:5px; border-bottom:1px solid #444; padding-bottom:4px;">${params[0].axisValue}</div>`;
        params.forEach(p => {
          str += `<div style="display:flex; justify-content:space-between; gap:16px; margin:2px 0;">
            <span><span style="color:${p.color}">●</span> ${p.seriesName}</span>
            <strong>${Math.round(p.value)} pts (${Number(p.value).toFixed(1)})</strong>
          </div>`;
        });
        const diff = (chileQ[params[0].dataIndex] - ocdeQ[params[0].dataIndex]).toFixed(1);
        str += `<div style="margin-top:4px; padding-top:4px; border-top:1px dashed #555; font-size:11.5px; color:#FFF265;">Diferencia Chile vs. OCDE: <strong>${diff} pts</strong></div>`;
        return str;
      }
    },
    legend: {
      top: 0,
      textStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 12, color: '#252423' },
      data: ['Chile', 'Promedio OCDE (por cuartil)']
    },
    grid: { left: '6.5%', right: '5%', bottom: '10%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: grupos,
      axisLine: { lineStyle: { color: '#C5C1B6' } },
      axisLabel: { fontSize: 11.5, fontWeight: 600, fontFamily: POLICY_PALETTE.fontFamily, color: '#252423' }
    },
    yAxis: {
      type: 'value',
      name: 'Puntaje promedio en lectura PISA 2025',
      nameLocation: 'middle',
      nameGap: 64,
      nameTextStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontWeight: 700, fontSize: 12, color: '#252423' },
      min: 360,
      max: 540,
      interval: 30,
      axisLabel: { formatter: '{value} pts', fontSize: 10.5, fontFamily: POLICY_PALETTE.fontFamily, color: '#555555' },
      splitLine: { lineStyle: { color: '#ECE8DD', type: 'dashed' } }
    },
    series: [
      {
        name: 'Chile',
        type: 'bar',
        barGap: '14%',
        barWidth: 42,
        data: chileQ,
        itemStyle: { color: '#3C4D5D', borderRadius: [5, 5, 0, 0] },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => `${Math.round(p.value)}`,
          fontWeight: 700,
          color: '#3C4D5D',
          fontFamily: POLICY_PALETTE.fontFamily
        },
        markLine: {
          symbol: 'none',
          silent: true,
          data: [
            {
              yAxis: ocdeMean,
              lineStyle: { color: '#8C5A63', type: 'dashed', width: 1.3, opacity: 0.7 },
              label: {
                show: true,
                position: 'insideStartTop',
                distance: [6, 3],
                formatter: 'Promedio OCDE (461 pts)',
                fontFamily: POLICY_PALETTE.fontFamily,
                fontSize: 9.5,
                fontWeight: 600,
                color: '#8C5A63'
              }
            },
            {
              yAxis: chileMean,
              lineStyle: { color: '#3C4D5D', type: 'dashed', width: 1.3, opacity: 0.7 },
              label: {
                show: true,
                position: 'insideStartTop',
                distance: [6, 3],
                formatter: 'Promedio Chile (436 pts)',
                fontFamily: POLICY_PALETTE.fontFamily,
                fontSize: 9.5,
                fontWeight: 600,
                color: '#3C4D5D'
              }
            }
          ]
        }
      },
      {
        name: 'Promedio OCDE (por cuartil)',
        type: 'bar',
        barWidth: 42,
        data: ocdeQ,
        itemStyle: { color: '#9FA6C4', borderRadius: [5, 5, 0, 0] },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => `${Math.round(p.value)}`,
          fontWeight: 600,
          color: '#687091',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      }
    ]
  });

  window.addEventListener('resize', () => chart.resize());
}

/* --------------------------------------------------------------------------
   FIGURA 13: EVOLUCIÓN DE LA DISTRIBUCIÓN DE PUNTAJES POR PERCENTILES EN CHILE (2000 - 2025)
   -------------------------------------------------------------------------- */
function renderFigura13PercentilesEvolucion(data) {
  const dom = document.getElementById('chart-figura-13-percentiles-evolucion');
  if (!dom) return;
  const chart = echarts.init(dom);

  const years = [2000, 2006, 2009, 2012, 2015, 2018, 2022, 2025];
  const p10 = [291.3, 309.7, 342.0, 339.2, 342.3, 331.3, 328.8, 312.7];
  const p25 = [349.6, 373.0, 393.3, 387.9, 397.9, 388.7, 384.4, 370.7];
  const p50 = [411.7, 442.6, 450.9, 443.5, 460.5, 453.1, 448.4, 437.1];
  const p75 = [471.6, 512.7, 506.1, 496.2, 521.4, 517.2, 513.5, 500.9];
  const p90 = [523.5, 574.8, 555.6, 540.9, 571.7, 571.9, 567.9, 556.4];

  const toPairs = (arr) => years.map((yr, i) => [yr, Math.round(arr[i])]);

  chart.setOption({
    textStyle: { fontFamily: POLICY_PALETTE.fontFamily },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#252423',
      borderColor: '#FFF265',
      textStyle: { color: '#F9F7F2', fontFamily: POLICY_PALETTE.fontFamily },
      formatter: (params) => {
        if (!params.length) return '';
        const yr = Array.isArray(params[0].value) ? params[0].value[0] : params[0].axisValue;
        const idx = years.indexOf(Number(yr));
        let str = `<div style="font-weight:700; margin-bottom:5px; border-bottom:1px solid #444; padding-bottom:4px;">Chile · Año ${yr}</div>`;
        params.forEach(p => {
          const val = Array.isArray(p.value) ? p.value[1] : p.value;
          str += `<div style="display:flex; justify-content:space-between; gap:16px; margin:2px 0;">
            <span><span style="color:${p.color}">●</span> ${p.seriesName}</span>
            <strong>${val} pts</strong>
          </div>`;
        });
        if (idx >= 0) {
          const range9010 = Math.round(p90[idx] - p10[idx]);
          str += `<div style="margin-top:4px; padding-top:4px; border-top:1px dashed #555; font-size:11.5px; color:#FFF265;">Rango Interdecil (P90 - P10): <strong>${range9010} pts</strong></div>`;
        }
        return str;
      }
    },
    legend: {
      top: 0,
      textStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 11.5, color: '#252423' },
      data: [
        'Percentil 90 (Alto rendimiento)',
        'Percentil 75',
        'Mediana (P50)',
        'Percentil 25',
        'Percentil 10 (Bajo rendimiento)'
      ]
    },
    grid: { left: '6.5%', right: '5%', bottom: '10%', top: '14%', containLabel: true },
    xAxis: {
      type: 'value',
      min: 1999,
      max: 2026,
      interval: 1,
      axisLine: { lineStyle: { color: '#C5C1B6' } },
      axisTick: {
        customValues: years
      },
      axisLabel: {
        fontFamily: POLICY_PALETTE.fontFamily,
        fontSize: 10.5,
        fontWeight: 600,
        color: '#252423',
        formatter: (val) => years.includes(val) ? String(val) : ''
      },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      name: 'Puntaje en la escala de lectura',
      nameLocation: 'middle',
      nameGap: 64,
      nameTextStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontWeight: 700, fontSize: 12, color: '#252423' },
      min: 250,
      max: 600,
      interval: 50,
      axisLabel: { formatter: '{value} pts', fontSize: 10.5, fontFamily: POLICY_PALETTE.fontFamily, color: '#555555' },
      splitLine: { lineStyle: { color: '#ECE8DD', type: 'dashed' } }
    },
    series: [
      {
        name: 'Percentil 90 (Alto rendimiento)',
        type: 'line',
        data: toPairs(p90),
        symbol: 'circle',
        symbolSize: 7.5,
        z: 5,
        lineStyle: { width: 2.8, type: 'solid', color: '#3C4D5D' },
        itemStyle: { color: '#3C4D5D' },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => `${p.value[1]}`,
          fontWeight: 700,
          fontSize: 10,
          color: '#3C4D5D',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      },
      {
        name: 'Percentil 75',
        type: 'line',
        data: toPairs(p75),
        symbol: 'circle',
        symbolSize: 7.5,
        z: 4,
        lineStyle: { width: 2.8, type: 'solid', color: '#4DB6B5' },
        itemStyle: { color: '#4DB6B5' },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => `${p.value[1]}`,
          fontWeight: 700,
          fontSize: 10,
          color: '#2E8B8A',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      },
      {
        name: 'Mediana (P50)',
        type: 'line',
        data: toPairs(p50),
        symbol: 'circle',
        symbolSize: 7.5,
        z: 6,
        lineStyle: { width: 2.8, type: 'solid', color: '#9FA6C4' },
        itemStyle: { color: '#9FA6C4' },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => `${p.value[1]}`,
          fontWeight: 700,
          fontSize: 10.5,
          color: '#687091',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      },
      {
        name: 'Percentil 25',
        type: 'line',
        data: toPairs(p25),
        symbol: 'circle',
        symbolSize: 7.5,
        z: 4,
        lineStyle: { width: 2.8, type: 'solid', color: '#BA9CA1' },
        itemStyle: { color: '#BA9CA1' },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => `${p.value[1]}`,
          fontWeight: 700,
          fontSize: 10,
          color: '#916D73',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      },
      {
        name: 'Percentil 10 (Bajo rendimiento)',
        type: 'line',
        data: toPairs(p10),
        symbol: 'circle',
        symbolSize: 7.5,
        z: 5,
        lineStyle: { width: 2.8, type: 'solid', color: '#8C5A63' },
        itemStyle: { color: '#8C5A63' },
        label: {
          show: true,
          position: 'bottom',
          formatter: (p) => `${p.value[1]}`,
          fontWeight: 700,
          fontSize: 10,
          color: '#8C5A63',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      }
    ]
  });

  window.addEventListener('resize', () => chart.resize());
}

/* --------------------------------------------------------------------------
   FIGURA 14: COMPARACIÓN DE PERCENTILES DE RENDIMIENTO CHILE VS OCDE (2025)
   -------------------------------------------------------------------------- */
function renderFigura14Percentiles(data) {
  const dom = document.getElementById('chart-figura-14-percentiles');
  if (!dom) return;
  const chart = echarts.init(dom);

  const labels = [
    'Percentil 10\n(Rend. Bajo)',
    'Percentil 25\n(Rend. Medio Bajo)',
    'Mediana (P50)\n(Rend. Medio)',
    'Percentil 75\n(Rend. Medio Alto)',
    'Percentil 90\n(Rend. Alto)'
  ];
  const chileVals = [312.7, 370.7, 437.1, 500.9, 556.4];
  const ocdeVals = [326.0, 390.6, 463.8, 533.4, 590.5];
  const ocdeMean = 461;
  const chileMean = 436;

  chart.setOption({
    textStyle: { fontFamily: POLICY_PALETTE.fontFamily },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#252423',
      borderColor: '#FFF265',
      textStyle: { color: '#F9F7F2', fontFamily: POLICY_PALETTE.fontFamily },
      formatter: (params) => {
        const title = (params[0].axisValue || '').replace('\n', ' ');
        let str = `<div style="font-weight:700; margin-bottom:5px; border-bottom:1px solid #444; padding-bottom:4px;">${title}</div>`;
        params.forEach(p => {
          str += `<div style="display:flex; justify-content:space-between; gap:16px; margin:2px 0;">
            <span><span style="color:${p.color}">●</span> ${p.seriesName}</span>
            <strong>${Math.round(p.value)} pts (${Number(p.value).toFixed(1)})</strong>
          </div>`;
        });
        const idx = params[0].dataIndex;
        const diff = (chileVals[idx] - ocdeVals[idx]).toFixed(1);
        str += `<div style="margin-top:4px; padding-top:4px; border-top:1px dashed #555; font-size:11.5px; color:#FFF265;">Diferencia Chile vs. OCDE: <strong>${diff} pts</strong></div>`;
        return str;
      }
    },
    legend: {
      data: ['Chile', 'Promedio OCDE'],
      top: 0,
      textStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 12, color: '#252423' }
    },
    grid: { left: '6.5%', right: '5%', bottom: '12%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: labels,
      axisLine: { lineStyle: { color: '#C5C1B6' } },
      axisLabel: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 11, fontWeight: 600, color: '#252423', lineHeight: 15 }
    },
    yAxis: {
      type: 'value',
      name: 'Puntaje en lectura en cada percentil (PISA 2025)',
      nameLocation: 'middle',
      nameGap: 64,
      nameTextStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontWeight: 700, fontSize: 12, color: '#252423' },
      min: 250,
      max: 650,
      interval: 50,
      axisLabel: { formatter: '{value} pts', fontSize: 10.5, fontFamily: POLICY_PALETTE.fontFamily, color: '#555555' },
      splitLine: { lineStyle: { color: '#ECE8DD', type: 'dashed' } }
    },
    series: [
      {
        name: 'Chile',
        type: 'bar',
        barGap: '14%',
        barWidth: 38,
        data: chileVals,
        itemStyle: { color: '#3C4D5D', borderRadius: [5, 5, 0, 0] },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => `${Math.round(p.value)}`,
          fontWeight: 700,
          color: '#3C4D5D',
          fontFamily: POLICY_PALETTE.fontFamily
        },
        markLine: {
          symbol: 'none',
          silent: true,
          data: [
            {
              yAxis: ocdeMean,
              lineStyle: { color: '#8C5A63', type: 'dashed', width: 1.3, opacity: 0.7 },
              label: {
                show: true,
                position: 'insideStartTop',
                distance: [6, 3],
                formatter: 'Promedio OCDE (461 pts)',
                fontFamily: POLICY_PALETTE.fontFamily,
                fontSize: 9.5,
                fontWeight: 600,
                color: '#8C5A63'
              }
            },
            {
              yAxis: chileMean,
              lineStyle: { color: '#3C4D5D', type: 'dashed', width: 1.3, opacity: 0.7 },
              label: {
                show: true,
                position: 'insideStartBottom',
                distance: [6, 3],
                formatter: 'Promedio Chile (436 pts)',
                fontFamily: POLICY_PALETTE.fontFamily,
                fontSize: 9.5,
                fontWeight: 600,
                color: '#3C4D5D'
              }
            }
          ]
        }
      },
      {
        name: 'Promedio OCDE',
        type: 'bar',
        barWidth: 38,
        data: ocdeVals,
        itemStyle: { color: '#9FA6C4', borderRadius: [5, 5, 0, 0] },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => `${Math.round(p.value)}`,
          fontWeight: 600,
          color: '#687091',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      }
    ]
  });

  window.addEventListener('resize', () => chart.resize());
}

/* --------------------------------------------------------------------------
   FIGURA 15: RENDIMIENTO EN LECTURA POR SEXO Y BRECHA DE GÉNERO EN CHILE Y OCDE (2012 - 2025)
   -------------------------------------------------------------------------- */
function renderFigura15Genero(data) {
  const dom = document.getElementById('chart-figura-15-genero');
  if (!dom) return;
  const chart = echarts.init(dom);

  const raw = data.Diferencias_Genero_Chile || [];
  const years = raw.length ? raw.map(d => Number(d.Anio)) : [2012, 2015, 2018, 2022, 2025];
  const mujeresChile = raw.length ? raw.map(d => Number(d.Mujeres_Chile)) : [452.4, 464.6, 462.0, 451.0, 446.0];
  const hombresChile = raw.length ? raw.map(d => Number(d.Hombres_Chile)) : [429.7, 452.6, 442.0, 445.0, 425.0];
  const mujeresOcde  = raw.length ? raw.map(d => Number(d.Mujeres_OCDE))  : [515.4, 504.1, 502.6, 489.9, 478.2];
  const hombresOcde  = raw.length ? raw.map(d => Number(d.Hombres_OCDE))  : [477.8, 476.8, 472.9, 465.1, 448.0];

  const toPairs = (arr) => years.map((yr, i) => [yr, Math.round(arr[i])]);

  chart.setOption({
    textStyle: { fontFamily: POLICY_PALETTE.fontFamily },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#252423',
      borderColor: '#FFF265',
      textStyle: { color: '#F9F7F2', fontFamily: POLICY_PALETTE.fontFamily },
      formatter: (params) => {
        if (!params.length) return '';
        const yr = Array.isArray(params[0].value) ? params[0].value[0] : params[0].axisValue;
        const idx = years.indexOf(Number(yr));
        let str = `<div style="font-weight:700; margin-bottom:5px; border-bottom:1px solid #444; padding-bottom:4px;">Año ${yr}</div>`;
        params.forEach(p => {
          const val = Array.isArray(p.value) ? p.value[1] : p.value;
          str += `<div style="display:flex; justify-content:space-between; gap:16px; margin:2px 0;">
            <span><span style="color:${p.color}">●</span> ${p.seriesName}</span>
            <strong>${val} pts</strong>
          </div>`;
        });
        if (idx >= 0) {
          const brechaCl = (mujeresChile[idx] - hombresChile[idx]).toFixed(1);
          const brechaOcde = (mujeresOcde[idx] - hombresOcde[idx]).toFixed(1);
          str += `<div style="margin-top:5px; padding-top:4px; border-top:1px dashed #555; font-size:11.5px; color:#FFF265;">
            Brecha Mujeres - Hombres (Chile): <strong>+${brechaCl} pts</strong><br/>
            Brecha Mujeres - Hombres (OCDE): <strong>+${brechaOcde} pts</strong>
          </div>`;
        }
        return str;
      }
    },
    legend: {
      data: ['Mujeres Chile', 'Hombres Chile', 'Mujeres OCDE', 'Hombres OCDE'],
      top: 0,
      textStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 12, color: '#252423' }
    },
    grid: { left: '6.5%', right: '4%', bottom: '10%', top: '14%', containLabel: true },
    xAxis: {
      type: 'value',
      min: 2011.2,
      max: 2025.8,
      interval: 1,
      axisLine: { lineStyle: { color: '#C5C1B6' } },
      axisTick: {
        customValues: years
      },
      axisLabel: {
        fontFamily: POLICY_PALETTE.fontFamily,
        fontSize: 10.5,
        fontWeight: 600,
        color: '#252423',
        formatter: (val) => years.includes(val) ? String(val) : ''
      },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      name: 'Puntaje promedio en lectura',
      nameLocation: 'middle',
      nameGap: 64,
      nameTextStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontWeight: 700, fontSize: 12, color: '#252423' },
      min: 420,
      max: 520,
      interval: 20,
      axisLabel: { formatter: '{value} pts', fontSize: 10.5, fontFamily: POLICY_PALETTE.fontFamily, color: '#555555' },
      splitLine: { lineStyle: { color: '#ECE8DD', type: 'dashed' } }
    },
    series: [
      {
        name: 'Mujeres Chile',
        type: 'line',
        data: toPairs(mujeresChile),
        symbol: 'circle',
        symbolSize: 8,
        z: 5,
        itemStyle: { color: '#8C5A63' },
        lineStyle: { width: 3, type: 'solid', color: '#8C5A63' },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => `${p.value[1]}`,
          fontWeight: 700,
          fontSize: 10.5,
          fontFamily: POLICY_PALETTE.fontFamily,
          color: '#8C5A63'
        }
      },
      {
        name: 'Hombres Chile',
        type: 'line',
        data: toPairs(hombresChile),
        symbol: 'circle',
        symbolSize: 8,
        z: 5,
        itemStyle: { color: '#4DB6B5' },
        lineStyle: { width: 3, type: 'solid', color: '#4DB6B5' },
        label: {
          show: true,
          position: 'bottom',
          formatter: (p) => `${p.value[1]}`,
          fontWeight: 700,
          fontSize: 10.5,
          fontFamily: POLICY_PALETTE.fontFamily,
          color: '#2E8B8A'
        }
      },
      {
        name: 'Mujeres OCDE',
        type: 'line',
        data: toPairs(mujeresOcde),
        symbol: 'circle',
        symbolSize: 6,
        z: 3,
        itemStyle: { color: '#8C5A63', opacity: 0.55 },
        lineStyle: { width: 1.8, type: 'dashed', color: '#8C5A63', opacity: 0.55 },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => `${p.value[1]}`,
          fontWeight: 600,
          fontSize: 10,
          fontFamily: POLICY_PALETTE.fontFamily,
          color: 'rgba(140, 90, 99, 0.8)'
        }
      },
      {
        name: 'Hombres OCDE',
        type: 'line',
        data: toPairs(hombresOcde),
        symbol: 'circle',
        symbolSize: 6,
        z: 3,
        itemStyle: { color: '#4DB6B5', opacity: 0.55 },
        lineStyle: { width: 1.8, type: 'dashed', color: '#4DB6B5', opacity: 0.55 },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => p.value[0] === 2025 ? '' : `${p.value[1]}`,
          fontWeight: 600,
          fontSize: 10,
          fontFamily: POLICY_PALETTE.fontFamily,
          color: 'rgba(46, 139, 138, 0.8)'
        }
      }
    ]
  });

  window.addEventListener('resize', () => chart.resize());
}

/* --------------------------------------------------------------------------
   FIGURAS 16 Y 17 (PESTAÑAS): INTERSECCIÓN DE GÉNERO Y CUARTIL SOCIOECONÓMICO (2018 - 2025)
   - Pestaña fig16: Puntaje PISA en lectura según sexo y cuartil socioeconómico en Chile (2018 - 2025)
   - Pestaña fig17: Brecha de género en lectura según cuartil socioeconómico en Chile y promedio OCDE (2018 - 2025)
   -------------------------------------------------------------------------- */
function renderFigura16y17GeneroEscs(data) {
  const dom = document.getElementById('chart-figura-16-17-genero-escs');
  if (!dom) return;
  const chart = echarts.init(dom);

  const raw = data.Brecha_Genero_Socioeconomica || [];
  const years = [2018, 2022, 2025];

  const getRow = (pais, cuartil, yr) =>
    raw.find(r => (r.Pais_o_Region === pais || r.Codigo_ISO === pais) && r.Cuartil_ESCS === cuartil && Number(r.Anio) === yr);

  // Datos Figura 16: Chile Q1 y Q4 por sexo (2018, 2022, 2025)
  const clQ1Mujeres = years.map(yr => {
    const r = getRow('Chile', 'Q1', yr);
    return [yr, r ? Math.round(r.Puntaje_Mujeres) : null];
  });
  const clQ1Hombres = years.map(yr => {
    const r = getRow('Chile', 'Q1', yr);
    return [yr, r ? Math.round(r.Puntaje_Hombres) : null];
  });
  const clQ4Mujeres = years.map(yr => {
    const r = getRow('Chile', 'Q4', yr);
    return [yr, r ? Math.round(r.Puntaje_Mujeres) : null];
  });
  const clQ4Hombres = years.map(yr => {
    const r = getRow('Chile', 'Q4', yr);
    return [yr, r ? Math.round(r.Puntaje_Hombres) : null];
  });

  // Datos Figura 17: Brechas (Mujeres - Hombres) en Q1 y Q4 para Chile y Promedio OCDE (2018, 2022, 2025)
  const getBrechasForYear = (pais, yr) => {
    const rQ1 = getRow(pais, 'Q1', yr);
    const rQ4 = getRow(pais, 'Q4', yr);
    return [
      rQ1 ? Number(rQ1.Brecha_Mujeres_Menos_Hombres) : 0,
      rQ4 ? Number(rQ4.Brecha_Mujeres_Menos_Hombres) : 0
    ];
  };

  const getOptionFig16 = () => ({
    textStyle: { fontFamily: POLICY_PALETTE.fontFamily },
    title: [
      {
        text: 'Bajo (Q1)',
        left: '26%',
        top: 28,
        textAlign: 'center',
        textStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 13, fontWeight: 700, color: '#252423' }
      },
      {
        text: 'Alto (Q4)',
        left: '74%',
        top: 28,
        textAlign: 'center',
        textStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 13, fontWeight: 700, color: '#252423' }
      }
    ],
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#252423',
      borderColor: '#FFF265',
      textStyle: { color: '#F9F7F2', fontFamily: POLICY_PALETTE.fontFamily },
      formatter: (params) => {
        if (!params.length) return '';
        const yr = Array.isArray(params[0].value) ? params[0].value[0] : params[0].axisValue;
        const isQ4 = params[0].axisIndex === 1;
        const cuartilLabel = isQ4 ? 'Cuartil Alto (Q4)' : 'Cuartil Bajo (Q1)';
        const row = getRow('Chile', isQ4 ? 'Q4' : 'Q1', Number(yr));
        let str = `<div style="font-weight:700; margin-bottom:5px; border-bottom:1px solid #444; padding-bottom:4px;">Chile · ${cuartilLabel} (${yr})</div>`;
        params.forEach(p => {
          const val = Array.isArray(p.value) ? p.value[1] : p.value;
          const cleanName = p.seriesName.replace(' (Q4)', '');
          str += `<div style="display:flex; justify-content:space-between; gap:16px; margin:2px 0;">
            <span><span style="color:${p.color}">●</span> ${cleanName}</span>
            <strong>${val} pts</strong>
          </div>`;
        });
        if (row) {
          str += `<div style="margin-top:4px; padding-top:4px; border-top:1px dashed #555; font-size:11.5px; color:#FFF265;">Brecha Mujeres - Hombres: <strong>+${Number(row.Brecha_Mujeres_Menos_Hombres).toFixed(1)} pts</strong></div>`;
        }
        return str;
      }
    },
    legend: {
      top: 0,
      data: ['Mujeres', 'Hombres'],
      textStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 12, color: '#252423' }
    },
    grid: [
      { left: '7%', width: '40%', top: '18%', bottom: '12%' },
      { left: '55%', width: '40%', top: '18%', bottom: '12%' }
    ],
    graphic: [
      {
        type: 'line',
        left: '50.5%',
        top: '12%',
        shape: { x1: 0, y1: 0, x2: 0, y2: 330 },
        style: { stroke: '#D5D0C5', lineWidth: 1.2 }
      }
    ],
    xAxis: [
      {
        gridIndex: 0,
        type: 'value',
        min: 2017.4,
        max: 2025.6,
        interval: 1,
        name: 'Año aplicación PISA',
        nameLocation: 'middle',
        nameGap: 28,
        nameTextStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 11.5, fontWeight: 600, color: '#252423' },
        axisLine: { lineStyle: { color: '#C5C1B6' } },
        axisTick: { customValues: years },
        axisLabel: {
          fontFamily: POLICY_PALETTE.fontFamily,
          fontSize: 10.5,
          fontWeight: 600,
          color: '#252423',
          formatter: (val) => years.includes(val) ? String(val) : ''
        },
        splitLine: { show: false }
      },
      {
        gridIndex: 1,
        type: 'value',
        min: 2017.4,
        max: 2025.6,
        interval: 1,
        name: 'Año aplicación PISA',
        nameLocation: 'middle',
        nameGap: 28,
        nameTextStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 11.5, fontWeight: 600, color: '#252423' },
        axisLine: { lineStyle: { color: '#C5C1B6' } },
        axisTick: { customValues: years },
        axisLabel: {
          fontFamily: POLICY_PALETTE.fontFamily,
          fontSize: 10.5,
          fontWeight: 600,
          color: '#252423',
          formatter: (val) => years.includes(val) ? String(val) : ''
        },
        splitLine: { show: false }
      }
    ],
    yAxis: [
      {
        gridIndex: 0,
        type: 'value',
        name: 'Puntaje promedio en lectura',
        nameLocation: 'middle',
        nameGap: 58,
        nameTextStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontWeight: 700, fontSize: 12, color: '#252423' },
        min: 380,
        max: 520,
        interval: 20,
        axisLabel: { formatter: '{value} pts', fontSize: 10.5, fontFamily: POLICY_PALETTE.fontFamily, color: '#555555' },
        splitLine: { lineStyle: { color: '#ECE8DD', type: 'dashed' } }
      },
      {
        gridIndex: 1,
        type: 'value',
        min: 380,
        max: 520,
        interval: 20,
        axisLabel: { show: false },
        axisTick: { show: false },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#ECE8DD', type: 'dashed' } }
      }
    ],
    series: [
      {
        name: 'Mujeres',
        type: 'line',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: clQ1Mujeres,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#8C5A63' },
        lineStyle: { width: 3, type: 'solid', color: '#8C5A63' },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => `${p.value[1]}`,
          fontWeight: 700,
          fontSize: 10.5,
          color: '#8C5A63',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      },
      {
        name: 'Hombres',
        type: 'line',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: clQ1Hombres,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#4DB6B5' },
        lineStyle: { width: 3, type: 'solid', color: '#4DB6B5' },
        label: {
          show: true,
          position: 'bottom',
          formatter: (p) => `${p.value[1]}`,
          fontWeight: 700,
          fontSize: 10.5,
          color: '#2E8B8A',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      },
      {
        name: 'Mujeres',
        type: 'line',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: clQ4Mujeres,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#8C5A63' },
        lineStyle: { width: 3, type: 'solid', color: '#8C5A63' },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => `${p.value[1]}`,
          fontWeight: 700,
          fontSize: 10.5,
          color: '#8C5A63',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      },
      {
        name: 'Hombres',
        type: 'line',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: clQ4Hombres,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#4DB6B5' },
        lineStyle: { width: 3, type: 'solid', color: '#4DB6B5' },
        label: {
          show: true,
          position: 'bottom',
          formatter: (p) => `${p.value[1]}`,
          fontWeight: 700,
          fontSize: 10.5,
          color: '#2E8B8A',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      }
    ]
  });

  const getOptionFig17 = () => ({
    textStyle: { fontFamily: POLICY_PALETTE.fontFamily },
    title: [
      {
        text: 'Chile',
        left: '26%',
        top: 28,
        textAlign: 'center',
        textStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 13, fontWeight: 700, color: '#252423' }
      },
      {
        text: 'Promedio OCDE',
        left: '74%',
        top: 28,
        textAlign: 'center',
        textStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 13, fontWeight: 700, color: '#252423' }
      }
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#252423',
      borderColor: '#FFF265',
      textStyle: { color: '#F9F7F2', fontFamily: POLICY_PALETTE.fontFamily },
      formatter: (params) => {
        if (!params.length) return '';
        const isOcde = params[0].axisIndex === 1;
        const entidad = isOcde ? 'Promedio OCDE' : 'Chile';
        let str = `<div style="font-weight:700; margin-bottom:5px; border-bottom:1px solid #444; padding-bottom:4px;">${entidad} · ${params[0].axisValue}</div>`;
        params.forEach(p => {
          str += `<div style="display:flex; justify-content:space-between; gap:16px; margin:2px 0;">
            <span><span style="color:${p.color}">●</span> Año ${p.seriesName}</span>
            <strong>+${Number(p.value).toFixed(1)} pts</strong>
          </div>`;
        });
        return str;
      }
    },
    legend: {
      top: 0,
      data: ['2018', '2022', '2025'],
      textStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 12, color: '#252423' }
    },
    grid: [
      { left: '7%', width: '40%', top: '18%', bottom: '13%' },
      { left: '55%', width: '40%', top: '18%', bottom: '13%' }
    ],
    graphic: [
      {
        type: 'line',
        left: '50.5%',
        top: '12%',
        shape: { x1: 0, y1: 0, x2: 0, y2: 330 },
        style: { stroke: '#D5D0C5', lineWidth: 1.2 }
      }
    ],
    xAxis: [
      {
        gridIndex: 0,
        type: 'category',
        data: ['Bajo (Q1)', 'Alto (Q4)'],
        name: 'Cuartil socioeconómico (ESCS)',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 11.5, fontWeight: 600, color: '#252423' },
        axisLine: { lineStyle: { color: '#C5C1B6' } },
        axisLabel: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 11, fontWeight: 600, color: '#252423' }
      },
      {
        gridIndex: 1,
        type: 'category',
        data: ['Bajo (Q1)', 'Alto (Q4)'],
        name: 'Cuartil socioeconómico (ESCS)',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 11.5, fontWeight: 600, color: '#252423' },
        axisLine: { lineStyle: { color: '#C5C1B6' } },
        axisLabel: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 11, fontWeight: 600, color: '#252423' }
      }
    ],
    yAxis: [
      {
        gridIndex: 0,
        type: 'value',
        name: 'Brecha en puntaje lectura (mujeres - hombres)',
        nameLocation: 'middle',
        nameGap: 58,
        nameTextStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontWeight: 700, fontSize: 11.5, color: '#252423' },
        min: 0,
        max: 35,
        interval: 5,
        axisLabel: { formatter: '{value} pts', fontSize: 10.5, fontFamily: POLICY_PALETTE.fontFamily, color: '#555555' },
        splitLine: { lineStyle: { color: '#ECE8DD', type: 'dashed' } }
      },
      {
        gridIndex: 1,
        type: 'value',
        min: 0,
        max: 35,
        interval: 5,
        axisLabel: { show: false },
        axisTick: { show: false },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#ECE8DD', type: 'dashed' } }
      }
    ],
    series: [
      // Panel izquierdo: Chile
      {
        name: '2018',
        type: 'bar',
        xAxisIndex: 0,
        yAxisIndex: 0,
        barGap: '8%',
        barWidth: 28,
        data: getBrechasForYear('Chile', 2018),
        itemStyle: { color: '#C5CADC', borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => Number(p.value).toFixed(1).replace('.', ','),
          fontWeight: 700,
          fontSize: 10,
          color: '#505362',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      },
      {
        name: '2022',
        type: 'bar',
        xAxisIndex: 0,
        yAxisIndex: 0,
        barWidth: 28,
        data: getBrechasForYear('Chile', 2022),
        itemStyle: { color: '#9FA6C4', borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => Number(p.value).toFixed(1).replace('.', ','),
          fontWeight: 700,
          fontSize: 10,
          color: '#505362',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      },
      {
        name: '2025',
        type: 'bar',
        xAxisIndex: 0,
        yAxisIndex: 0,
        barWidth: 28,
        data: getBrechasForYear('Chile', 2025),
        itemStyle: { color: '#3C4D5D', borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => Number(p.value).toFixed(1).replace('.', ','),
          fontWeight: 700,
          fontSize: 10,
          color: '#3C4D5D',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      },
      // Panel derecho: Promedio OCDE
      {
        name: '2018',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        barGap: '8%',
        barWidth: 28,
        data: getBrechasForYear('Promedio OCDE', 2018),
        itemStyle: { color: '#C5CADC', borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => Number(p.value).toFixed(1).replace('.', ','),
          fontWeight: 700,
          fontSize: 10,
          color: '#505362',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      },
      {
        name: '2022',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        barWidth: 28,
        data: getBrechasForYear('Promedio OCDE', 2022),
        itemStyle: { color: '#9FA6C4', borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => Number(p.value).toFixed(1).replace('.', ','),
          fontWeight: 700,
          fontSize: 10,
          color: '#505362',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      },
      {
        name: '2025',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        barWidth: 28,
        data: getBrechasForYear('Promedio OCDE', 2025),
        itemStyle: { color: '#3C4D5D', borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => Number(p.value).toFixed(1).replace('.', ','),
          fontWeight: 700,
          fontSize: 10,
          color: '#3C4D5D',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      }
    ]
  });

  chart.setOption(getOptionFig16(), true);

  const ctrl = document.getElementById('control-genero-escs-vista');
  const titleEl = document.getElementById('title-figura-16-17');
  const descEl = document.getElementById('desc-figura-16-17');
  const footEl = document.getElementById('footnote-figura-16-17');

  if (ctrl) {
    ctrl.querySelectorAll('.seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        ctrl.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const view = btn.dataset.view;
        if (view === 'fig17') {
          if (titleEl) titleEl.textContent = 'Brecha de género en lectura según cuartil socioeconómico en Chile y promedio OCDE (2018 - 2025)';
          if (descEl) descEl.textContent = 'Diferencia de puntaje promedio a favor de las mujeres (mujeres menos hombres) en los cuartiles socioeconómicos extremos (Q1 y Q4).';
          if (footEl) footEl.innerHTML = '<strong>Fuente:</strong> Instituto MISTRALL a partir de OCDE, 2026. PISA 2025 (OCDE-38 - Tabla I.B1.2c.18), PISA 2022 (OCDE-37 - Tabla I.B1.4.35) y PISA 2018 (OCDE-36 - Tabla II.B1.7.43), rendimiento lector según género y nivel socioeconómico.';
          chart.setOption(getOptionFig17(), true);
        } else {
          if (titleEl) titleEl.textContent = 'Puntaje PISA en lectura según sexo y cuartil socioeconómico en Chile (2018 - 2025)';
          if (descEl) descEl.textContent = 'Evolución del puntaje promedio de mujeres y hombres en el cuartil socioeconómico más bajo (Q1) y más alto (Q4) en Chile.';
          if (footEl) footEl.innerHTML = '<strong>Fuente:</strong> Instituto MISTRALL a partir de OCDE, 2026. PISA 2025 (Tabla I.B1.2c.18), PISA 2022 (Tabla I.B1.4.35) y PISA 2018 (Tabla II.B1.7.43), rendimiento lector según género y nivel socioeconómico.';
          chart.setOption(getOptionFig16(), true);
        }
      });
    });
  }

  window.addEventListener('resize', () => chart.resize());
}

/* --------------------------------------------------------------------------
   FIGURA 18: ESTUDIANTES CON ANTECEDENTES DE INMIGRACIÓN (2025)
   -------------------------------------------------------------------------- */
function renderFigura18MigracionLatAm(data) {
  const dom = document.getElementById('chart-figura-18-migracion-latam');
  if (!dom) return;
  const chart = echarts.init(dom);

  const nameMap = {
    'OECD average-29': 'Promedio OCDE-29',
    'Chile': 'Chile',
    'Dominican Republic': 'República Dominicana',
    'República Dominicana': 'República Dominicana',
    'Argentina': 'Argentina',
    'Paraguay': 'Paraguay',
    'Colombia': 'Colombia',
    'Uruguay': 'Uruguay',
    'Guatemala': 'Guatemala',
    'Peru': 'Perú',
    'Perú': 'Perú',
    'El Salvador': 'El Salvador',
    'Mexico': 'México',
    'México': 'México',
    'Brazil': 'Brasil',
    'Brasil': 'Brasil'
  };

  const raw = (data.Inmigracion_Matricula_LatAm || [])
    .filter(d => d.Pct_Inmigrantes_2025 !== null && d.Pct_Inmigrantes_2025 !== undefined)
    .map(d => ({
      ...d,
      Pais_ES: nameMap[d.Pais_Region] || d.Pais_Region,
      total: Number(d.Pct_Inmigrantes_2025),
      gen1: Number(d.Pct_1ra_Generacion_2025 || 0),
      gen2: Number(d.Pct_2da_Generacion_2025 || 0)
    }))
    .sort((a, b) => b.total - a.total);

  const paises = raw.map(d => d.Pais_ES);
  const gen1Vals = raw.map(d => d.gen1);
  const gen2Vals = raw.map(d => d.gen2);
  const totalVals = raw.map(d => d.total);

  const totalLegendItem = {
    name: '% Total estudiantes migrantes',
    icon: 'roundRect',
    itemStyle: {
      color: '#E2E4EC',
      borderColor: '#9FA6C4',
      borderWidth: 1.2
    }
  };

  chart.setOption({
    textStyle: { fontFamily: POLICY_PALETTE.fontFamily },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#252423',
      borderColor: '#FFF265',
      textStyle: { color: '#F9F7F2', fontFamily: POLICY_PALETTE.fontFamily },
      formatter: (params) => {
        if (!params.length) return '';
        const idx = params[0].dataIndex;
        const row = raw[idx];
        return `<div style="font-weight:700; margin-bottom:5px; border-bottom:1px solid #444; padding-bottom:4px;">${row.Pais_ES} (PISA 2025)</div>
          <div style="display:flex; justify-content:space-between; gap:16px; margin:3px 0; color:#FFF265;">
            <strong>% Total estudiantes migrantes</strong>
            <strong>${row.total.toFixed(1).replace('.', ',')}%</strong>
          </div>
          <div style="display:flex; justify-content:space-between; gap:16px; margin:2px 0;">
            <span><span style="color:#3C4D5D">●</span> Detalle 1ra Generación</span>
            <strong>${row.gen1.toFixed(1).replace('.', ',')}%</strong>
          </div>
          <div style="display:flex; justify-content:space-between; gap:16px; margin:2px 0;">
            <span><span style="color:#4DB6B5">●</span> Detalle 2da Generación</span>
            <strong>${row.gen2.toFixed(1).replace('.', ',')}%</strong>
          </div>`;
      }
    },
    legend: {
      top: 0,
      data: ['Detalle 1ra Generación', 'Detalle 2da Generación', totalLegendItem],
      textStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 12, color: '#252423' }
    },
    grid: { left: '6%', right: '4%', bottom: '15%', top: '14%', containLabel: true },
    xAxis: {
      type: 'category',
      data: paises,
      axisLine: { lineStyle: { color: '#C5C1B6' } },
      axisLabel: {
        rotate: 28,
        fontSize: 10.5,
        color: (v) => v === 'Chile' ? '#3C4D5D' : '#252423',
        fontWeight: (v) => (v === 'Chile' || v.includes('OCDE')) ? '800' : '600',
        fontFamily: POLICY_PALETTE.fontFamily
      }
    },
    yAxis: {
      type: 'value',
      name: '% de estudiantes con antecedentes migratorios PISA 2025',
      nameLocation: 'middle',
      nameGap: 56,
      nameTextStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontWeight: 700, fontSize: 11.5, color: '#252423' },
      min: 0,
      max: 20,
      interval: 5,
      axisLabel: { formatter: '{value}%', fontSize: 10.5, fontFamily: POLICY_PALETTE.fontFamily, color: '#555555' },
      splitLine: { lineStyle: { color: '#ECE8DD', type: 'dashed' } }
    },
    series: [
      {
        name: 'Detalle 1ra Generación',
        type: 'bar',
        stack: 'mig',
        barWidth: 42,
        data: gen1Vals,
        itemStyle: { color: '#3C4D5D' },
        label: {
          show: true,
          position: 'inside',
          formatter: (p) => p.value >= 0.7 ? `${Number(p.value).toFixed(1).replace('.', ',')}%` : '',
          fontSize: 9.5,
          fontWeight: 700,
          color: '#FFFFFF',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      },
      {
        name: 'Detalle 2da Generación',
        type: 'bar',
        stack: 'mig',
        barWidth: 42,
        data: gen2Vals,
        itemStyle: { color: '#4DB6B5', borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: 'inside',
          formatter: (p) => p.value >= 0.7 ? `${Number(p.value).toFixed(1).replace('.', ',')}%` : '',
          fontSize: 9.5,
          fontWeight: 700,
          color: '#FFFFFF',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      },
      {
        name: '% Total estudiantes migrantes',
        type: 'scatter',
        symbol: 'roundRect',
        symbolSize: 0,
        silent: true,
        z: 10,
        data: totalVals,
        itemStyle: {
          color: '#E2E4EC',
          borderColor: '#9FA6C4',
          borderWidth: 1.2
        },
        label: {
          show: true,
          position: 'top',
          distance: 6,
          formatter: (p) => `${Number(p.value).toFixed(1).replace('.', ',')}%`,
          fontFamily: POLICY_PALETTE.fontFamily,
          fontSize: 10.5,
          fontWeight: 800,
          color: '#252423',
          backgroundColor: '#E2E4EC',
          borderColor: '#C5CADC',
          borderWidth: 1,
          borderRadius: 4,
          padding: [3, 6]
        }
      }
    ]
  });

  window.addEventListener('resize', () => chart.resize());
}

/* --------------------------------------------------------------------------
   FIGURA 19: PUNTAJE EN LECTURA Y % BAJO NIVEL 2 SEGÚN ANTECEDENTES DE INMIGRACIÓN EN CHILE (2015 - 2025)
   Separado en dos pestañas independientes: Puntaje en lectura y % bajo Nivel 2
   -------------------------------------------------------------------------- */
function renderFigura19MigracionChile(data) {
  const dom = document.getElementById('chart-figura-19-chile-migracion');
  if (!dom) return;
  const chart = echarts.init(dom);

  const rawLong = data.Grafico_16_Evolucion_long || [];
  const years = [2015, 2018, 2022, 2025];

  const getSeriesFromLong = (matchKey, field) => {
    return years.map(yr => {
      const row = rawLong.find(r => Number(r.Anio) === yr && (r.Grupo_Estudiante || '').includes(matchKey));
      return [yr, row ? Math.round(Number(row[field])) : null];
    });
  };

  const scoreGen1 = getSeriesFromLong('1ª Generación', 'Puntaje_Lectura');
  const scoreGen2 = getSeriesFromLong('2ª Generación', 'Puntaje_Lectura');
  const scoreNat  = getSeriesFromLong('No Migrantes', 'Puntaje_Lectura');

  const rezagoGen1 = getSeriesFromLong('1ª Generación', 'Pct_Rezago_Menor_Nivel2');
  const rezagoGen2 = getSeriesFromLong('2ª Generación', 'Pct_Rezago_Menor_Nivel2');
  const rezagoNat  = getSeriesFromLong('No Migrantes', 'Pct_Rezago_Menor_Nivel2');

  const getOptionPuntaje = () => ({
    textStyle: { fontFamily: POLICY_PALETTE.fontFamily },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#252423',
      borderColor: '#FFF265',
      textStyle: { color: '#F9F7F2', fontFamily: POLICY_PALETTE.fontFamily },
      formatter: (params) => {
        if (!params.length) return '';
        const yr = Array.isArray(params[0].value) ? params[0].value[0] : params[0].axisValue;
        let str = `<div style="font-weight:700; margin-bottom:5px; border-bottom:1px solid #444; padding-bottom:4px;">Chile · Puntaje en lectura (${yr})</div>`;
        params.forEach(p => {
          const val = Array.isArray(p.value) ? p.value[1] : p.value;
          str += `<div style="display:flex; justify-content:space-between; gap:16px; margin:2px 0;">
            <span><span style="color:${p.color}">●</span> ${p.seriesName}</span>
            <strong>${val} pts</strong>
          </div>`;
        });
        return str;
      }
    },
    legend: {
      top: 0,
      itemGap: 24,
      data: [
        'Estudiantes migrantes 1ra generación',
        'Estudiantes migrantes 2da generación',
        'Estudiantes no migrantes'
      ],
      textStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 12, color: '#252423' }
    },
    grid: { left: '6.5%', right: '4%', bottom: '12%', top: '14%', containLabel: true },
    xAxis: {
      type: 'value',
      min: 2014.4,
      max: 2025.6,
      interval: 1,
      name: 'Año aplicación PISA',
      nameLocation: 'middle',
      nameGap: 28,
      nameTextStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 11.5, fontWeight: 600, color: '#252423' },
      axisLine: { lineStyle: { color: '#C5C1B6' } },
      axisTick: { customValues: years },
      axisLabel: {
        fontFamily: POLICY_PALETTE.fontFamily,
        fontSize: 10.5,
        fontWeight: 600,
        color: '#252423',
        formatter: (val) => years.includes(val) ? String(val) : ''
      },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      name: 'Puntaje PISA en lectura',
      nameLocation: 'middle',
      nameGap: 60,
      nameTextStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontWeight: 700, fontSize: 12, color: '#252423' },
      min: 400,
      max: 490,
      interval: 20,
      axisLabel: { formatter: '{value} pts', fontSize: 10.5, fontFamily: POLICY_PALETTE.fontFamily, color: '#555555' },
      splitLine: { lineStyle: { color: '#ECE8DD', type: 'dashed' } }
    },
    series: [
      {
        name: 'Estudiantes migrantes 1ra generación',
        type: 'line',
        data: scoreGen1,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#3C4D5D' },
        lineStyle: { width: 3, type: 'solid', color: '#3C4D5D' },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => `${p.value[1]}`,
          fontWeight: 700,
          fontSize: 10.5,
          color: '#3C4D5D',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      },
      {
        name: 'Estudiantes migrantes 2da generación',
        type: 'line',
        data: scoreGen2,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#4DB6B5' },
        lineStyle: { width: 3, type: 'solid', color: '#4DB6B5' },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => `${p.value[1]}`,
          fontWeight: 700,
          fontSize: 10.5,
          color: '#2E8B8A',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      },
      {
        name: 'Estudiantes no migrantes',
        type: 'line',
        data: scoreNat,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#8C5A63' },
        lineStyle: { width: 3, type: 'solid', color: '#8C5A63' },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => `${p.value[1]}`,
          fontWeight: 700,
          fontSize: 10.5,
          color: '#8C5A63',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      }
    ]
  });

  const getOptionRezago = () => ({
    textStyle: { fontFamily: POLICY_PALETTE.fontFamily },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#252423',
      borderColor: '#FFF265',
      textStyle: { color: '#F9F7F2', fontFamily: POLICY_PALETTE.fontFamily },
      formatter: (params) => {
        if (!params.length) return '';
        const yr = Array.isArray(params[0].value) ? params[0].value[0] : params[0].axisValue;
        let str = `<div style="font-weight:700; margin-bottom:5px; border-bottom:1px solid #444; padding-bottom:4px;">Chile · % bajo Nivel 2 (${yr})</div>`;
        params.forEach(p => {
          const val = Array.isArray(p.value) ? p.value[1] : p.value;
          str += `<div style="display:flex; justify-content:space-between; gap:16px; margin:2px 0;">
            <span><span style="color:${p.color}">●</span> ${p.seriesName}</span>
            <strong>${val}%</strong>
          </div>`;
        });
        return str;
      }
    },
    legend: {
      top: 0,
      itemGap: 24,
      data: [
        'Estudiantes migrantes 1ra generación',
        'Estudiantes migrantes 2da generación',
        'Estudiantes no migrantes'
      ],
      textStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 12, color: '#252423' }
    },
    grid: { left: '6.5%', right: '4%', bottom: '12%', top: '14%', containLabel: true },
    xAxis: {
      type: 'value',
      min: 2014.4,
      max: 2025.6,
      interval: 1,
      name: 'Año aplicación PISA',
      nameLocation: 'middle',
      nameGap: 28,
      nameTextStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 11.5, fontWeight: 600, color: '#252423' },
      axisLine: { lineStyle: { color: '#C5C1B6' } },
      axisTick: { customValues: years },
      axisLabel: {
        fontFamily: POLICY_PALETTE.fontFamily,
        fontSize: 10.5,
        fontWeight: 600,
        color: '#252423',
        formatter: (val) => years.includes(val) ? String(val) : ''
      },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '% de estudiantes bajo Nivel 2',
      nameLocation: 'middle',
      nameGap: 56,
      nameTextStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontWeight: 700, fontSize: 12, color: '#252423' },
      min: 15,
      max: 55,
      interval: 5,
      axisLabel: { formatter: '{value}%', fontSize: 10.5, fontFamily: POLICY_PALETTE.fontFamily, color: '#555555' },
      splitLine: { lineStyle: { color: '#ECE8DD', type: 'dashed' } }
    },
    series: [
      {
        name: 'Estudiantes migrantes 1ra generación',
        type: 'line',
        data: rezagoGen1,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#3C4D5D' },
        lineStyle: { width: 3, type: 'solid', color: '#3C4D5D' },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => `${p.value[1]}%`,
          fontWeight: 700,
          fontSize: 10.5,
          color: '#3C4D5D',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      },
      {
        name: 'Estudiantes migrantes 2da generación',
        type: 'line',
        data: rezagoGen2,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#4DB6B5' },
        lineStyle: { width: 3, type: 'solid', color: '#4DB6B5' },
        label: {
          show: true,
          position: 'bottom',
          formatter: (p) => `${p.value[1]}%`,
          fontWeight: 700,
          fontSize: 10.5,
          color: '#2E8B8A',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      },
      {
        name: 'Estudiantes no migrantes',
        type: 'line',
        data: rezagoNat,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#8C5A63' },
        lineStyle: { width: 3, type: 'solid', color: '#8C5A63' },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => `${p.value[1]}%`,
          fontWeight: 700,
          fontSize: 10.5,
          color: '#8C5A63',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      }
    ]
  });

  chart.setOption(getOptionPuntaje(), true);

  const ctrl = document.getElementById('control-chile-migracion-vista');
  const titleEl = document.getElementById('title-figura-19');
  const descEl = document.getElementById('desc-figura-19');

  if (ctrl) {
    ctrl.querySelectorAll('.seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        ctrl.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const view = btn.dataset.view;
        if (view === 'rezago') {
          if (titleEl) titleEl.textContent = 'Porcentaje de estudiantes bajo Nivel 2 según antecedentes de inmigración en Chile (2015 - 2025)';
          if (descEl) descEl.textContent = 'Evolución del porcentaje de estudiantes que no alcanza el Nivel 2 de lectura según condición migratoria en Chile.';
          chart.setOption(getOptionRezago(), true);
        } else {
          if (titleEl) titleEl.textContent = 'Puntaje en lectura según antecedentes de inmigración en Chile (2015 - 2025)';
          if (descEl) descEl.textContent = 'Evolución del puntaje promedio en lectura para estudiantes no migrantes, migrantes de primera generación y migrantes de segunda generación en Chile.';
          chart.setOption(getOptionPuntaje(), true);
        }
      });
    });
  }

  window.addEventListener('resize', () => chart.resize());
}

/* --------------------------------------------------------------------------
   FIGURAS 20 Y 21 (PESTAÑAS): BRECHAS DE LECTURA POR INMIGRACIÓN Y AJUSTE NSE + IDIOMA (2025)
   - Pestaña fig20: Brecha en lectura PISA 2025 entre estudiantes no inmigrantes e inmigrantes de 1ra y 2da generación
   - Pestaña fig21: Brecha ajustada por NSE e idioma (2025)
   -------------------------------------------------------------------------- */
function renderFigura20y21MigracionBrechas(data) {
  const dom = document.getElementById('chart-figura-20-21-migracion-brechas');
  if (!dom) return;
  const chart = echarts.init(dom);

  const nameMap = {
    'OECD average-29': 'Promedio\nOCDE-29',
    'Chile': 'Chile',
    'Uruguay': 'Uruguay',
    'Brazil': 'Brasil',
    'Brasil': 'Brasil',
    'Mexico': 'México',
    'México': 'México',
    'Argentina': 'Argentina',
    'Paraguay': 'Paraguay',
    'Dominican Republic': 'República\nDominicana',
    'República Dominicana': 'República\nDominicana',
    'El Salvador': 'El Salvador',
    'Guatemala': 'Guatemala',
    'Colombia': 'Colombia',
    'Peru': 'Perú',
    'Perú': 'Perú'
  };

  const toBarDataWithLabels = (arr) => arr.map(v => ({
    value: v,
    itemStyle: {
      borderRadius: v >= 0 ? [4, 4, 0, 0] : [0, 0, 4, 4]
    },
    label: {
      position: v >= 0 ? 'top' : 'bottom'
    }
  }));

  // Datos Figura 20 desde Inmigracion_Rendimiento_Lect
  const rawRend = data.Inmigracion_Rendimiento_Lect || [];
  const orderFig20 = ['OECD average-29', 'Chile', 'Uruguay', 'Brazil', 'Mexico', 'Argentina', 'Paraguay', 'Dominican Republic'];
  const rowsFig20 = orderFig20
    .map(key => rawRend.find(r => r.Pais_Region === key))
    .filter(r => r && r.Puntaje_Nativos_2025 !== null && r.Puntaje_1ra_Generacion_2025 !== null && r.Puntaje_2da_Generacion_2025 !== null);

  const labelsFig20 = rowsFig20.map(r => nameMap[r.Pais_Region] || r.Pais_Region);
  const diffGen1 = rowsFig20.map(r => Number((Number(r.Puntaje_Nativos_2025) - Number(r.Puntaje_1ra_Generacion_2025)).toFixed(1)));
  const diffGen2 = rowsFig20.map(r => Number((Number(r.Puntaje_Nativos_2025) - Number(r.Puntaje_2da_Generacion_2025)).toFixed(1)));

  // Datos Figura 21 desde Inmigracion_Brechas_ESCS
  const rawEscs = data.Inmigracion_Brechas_ESCS || [];
  const orderFig21 = ['Uruguay', 'Argentina', 'OECD average-29', 'Chile', 'Paraguay', 'Mexico', 'El Salvador', 'Dominican Republic', 'Guatemala', 'Colombia', 'Peru', 'Brazil'];
  const rowsFig21 = orderFig21
    .map(key => rawEscs.find(r => r.Pais_Region === key))
    .filter(r => r && r.Brecha_Bruta_Lectura_2025 !== null && r.Brecha_Bruta_Lectura_2025 !== undefined);

  const labelsFig21 = rowsFig21.map(r => nameMap[r.Pais_Region] || r.Pais_Region);
  const sinAjuste = rowsFig21.map(r => Number((-Number(r.Brecha_Bruta_Lectura_2025)).toFixed(1)));
  const ajusteEscs = rowsFig21.map(r => Number((-Number(r.Brecha_Ajustada_ESCS_2025)).toFixed(1)));
  const ajusteEscsLengua = rowsFig21.map(r => Number((-Number(r.Brecha_Ajustada_ESCS_y_Lengua_2025)).toFixed(1)));

  const getOptionFig20 = () => ({
    textStyle: { fontFamily: POLICY_PALETTE.fontFamily },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#252423',
      borderColor: '#FFF265',
      textStyle: { color: '#F9F7F2', fontFamily: POLICY_PALETTE.fontFamily },
      formatter: (params) => {
        if (!params.length) return '';
        const title = (params[0].axisValue || '').replace('\n', ' ');
        let str = `<div style="font-weight:700; margin-bottom:5px; border-bottom:1px solid #444; padding-bottom:4px;">${title} (PISA 2025)</div>`;
        params.forEach(p => {
          const rawVal = (p.value && typeof p.value === 'object') ? p.value.value : p.value;
          const val = Number(rawVal).toFixed(1).replace('.', ',');
          str += `<div style="display:flex; justify-content:space-between; gap:16px; margin:2px 0;">
            <span><span style="color:${p.color}">●</span> ${p.seriesName}</span>
            <strong>${val} pts</strong>
          </div>`;
        });
        return str;
      }
    },
    legend: {
      top: 0,
      itemGap: 28,
      data: [
        'No migrantes - Migrantes 1ra generación',
        'No migrantes - Migrantes 2da generación'
      ],
      textStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 12, color: '#252423' }
    },
    grid: { left: '6.5%', right: '4%', bottom: '12%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: labelsFig20,
      axisLine: { lineStyle: { color: '#C5C1B6' } },
      axisLabel: {
        fontFamily: POLICY_PALETTE.fontFamily,
        fontSize: 10.5,
        lineHeight: 14,
        color: (v) => v === 'Chile' ? '#3C4D5D' : '#252423',
        fontWeight: (v) => (v === 'Chile' || v.includes('OCDE')) ? '800' : '600'
      }
    },
    yAxis: {
      type: 'value',
      name: 'Diferencia puntaje lectura (no migrantes - migrantes)',
      nameLocation: 'middle',
      nameGap: 58,
      nameTextStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontWeight: 700, fontSize: 11.5, color: '#252423' },
      min: -40,
      max: 115,
      interval: 30,
      axisLabel: { formatter: '{value} pts', fontSize: 10.5, fontFamily: POLICY_PALETTE.fontFamily, color: '#555555' },
      splitLine: { lineStyle: { color: '#ECE8DD', type: 'dashed' } }
    },
    series: [
      {
        name: 'No migrantes - Migrantes 1ra generación',
        type: 'bar',
        barGap: '12%',
        barWidth: 32,
        data: toBarDataWithLabels(diffGen1),
        itemStyle: { color: '#C5CADC' },
        label: {
          show: true,
          distance: 4,
          formatter: (p) => Number(p.value).toFixed(1).replace('.', ','),
          fontWeight: 700,
          fontSize: 10,
          color: '#505362',
          fontFamily: POLICY_PALETTE.fontFamily
        },
        markLine: {
          symbol: 'none',
          silent: true,
          lineStyle: { color: '#777D93', type: 'solid', width: 1.4 },
          label: { show: false },
          data: [{ yAxis: 0 }]
        }
      },
      {
        name: 'No migrantes - Migrantes 2da generación',
        type: 'bar',
        barWidth: 32,
        data: toBarDataWithLabels(diffGen2),
        itemStyle: { color: '#3C4D5D' },
        label: {
          show: true,
          distance: 4,
          formatter: (p) => Number(p.value).toFixed(1).replace('.', ','),
          fontWeight: 700,
          fontSize: 10,
          color: '#3C4D5D',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      }
    ]
  });

  const getOptionFig21 = () => ({
    textStyle: { fontFamily: POLICY_PALETTE.fontFamily },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#252423',
      borderColor: '#FFF265',
      textStyle: { color: '#F9F7F2', fontFamily: POLICY_PALETTE.fontFamily },
      formatter: (params) => {
        if (!params.length) return '';
        const title = (params[0].axisValue || '').replace('\n', ' ');
        let str = `<div style="font-weight:700; margin-bottom:5px; border-bottom:1px solid #444; padding-bottom:4px;">${title} (PISA 2025)</div>`;
        params.forEach(p => {
          const rawVal = (p.value && typeof p.value === 'object') ? p.value.value : p.value;
          const val = Number(rawVal).toFixed(1).replace('.', ',');
          str += `<div style="display:flex; justify-content:space-between; gap:16px; margin:2px 0;">
            <span><span style="color:${p.color}">●</span> ${p.seriesName}</span>
            <strong>${val} pts</strong>
          </div>`;
        });
        return str;
      }
    },
    legend: {
      top: 0,
      itemGap: 24,
      data: [
        'Sin ajuste',
        'Ajustado por NSE (ESCS)',
        'Ajustado por NSE (ESCS) + idioma'
      ],
      textStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 12, color: '#252423' }
    },
    grid: { left: '6.5%', right: '3%', bottom: '12%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: labelsFig21,
      axisLine: { lineStyle: { color: '#C5C1B6' } },
      axisLabel: {
        interval: 0,
        fontFamily: POLICY_PALETTE.fontFamily,
        fontSize: 10,
        lineHeight: 13,
        color: (v) => v === 'Chile' ? '#3C4D5D' : '#252423',
        fontWeight: (v) => (v === 'Chile' || v.includes('OCDE')) ? '800' : '600'
      }
    },
    yAxis: {
      type: 'value',
      name: 'Diferencia puntaje lectura (no inmigrantes - inmigrantes)',
      nameLocation: 'middle',
      nameGap: 58,
      nameTextStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontWeight: 700, fontSize: 11.5, color: '#252423' },
      min: -20,
      max: 90,
      interval: 20,
      axisLabel: { formatter: '{value} pts', fontSize: 10.5, fontFamily: POLICY_PALETTE.fontFamily, color: '#555555' },
      splitLine: { lineStyle: { color: '#ECE8DD', type: 'dashed' } }
    },
    series: [
      {
        name: 'Sin ajuste',
        type: 'bar',
        barGap: '10%',
        barWidth: 18,
        data: toBarDataWithLabels(sinAjuste),
        itemStyle: { color: '#C5CADC' },
        label: {
          show: true,
          distance: 4,
          formatter: (p) => Number(p.value).toFixed(1).replace('.', ','),
          fontWeight: 700,
          fontSize: 9,
          color: '#505362',
          fontFamily: POLICY_PALETTE.fontFamily
        },
        markLine: {
          symbol: 'none',
          silent: true,
          lineStyle: { color: '#777D93', type: 'solid', width: 1.4 },
          label: { show: false },
          data: [{ yAxis: 0 }]
        }
      },
      {
        name: 'Ajustado por NSE (ESCS)',
        type: 'bar',
        barWidth: 18,
        data: toBarDataWithLabels(ajusteEscs),
        itemStyle: { color: '#777D93' },
        label: {
          show: true,
          distance: 4,
          formatter: (p) => Number(p.value).toFixed(1).replace('.', ','),
          fontWeight: 700,
          fontSize: 9,
          color: '#505362',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      },
      {
        name: 'Ajustado por NSE (ESCS) + idioma',
        type: 'bar',
        barWidth: 18,
        data: toBarDataWithLabels(ajusteEscsLengua),
        itemStyle: { color: '#3C4D5D' },
        label: {
          show: true,
          distance: 4,
          formatter: (p) => Number(p.value).toFixed(1).replace('.', ','),
          fontWeight: 700,
          fontSize: 9,
          color: '#3C4D5D',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      }
    ]
  });

  chart.setOption(getOptionFig20(), true);

  const ctrl = document.getElementById('control-migracion-brechas-vista');
  const titleEl = document.getElementById('title-figura-20-21');
  const descEl = document.getElementById('desc-figura-20-21');
  const footEl = document.getElementById('footnote-figura-20-21');

  if (ctrl) {
    ctrl.querySelectorAll('.seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        ctrl.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const view = btn.dataset.view;
        if (view === 'fig21') {
          if (titleEl) titleEl.textContent = 'Brecha ajustada por NSE e idioma (2025)';
          if (descEl) descEl.textContent = 'Diferencia de puntaje en lectura entre estudiantes no inmigrantes e inmigrantes antes y después de controlar por nivel socioeconómico (ESCS) e idioma hablado en el hogar.';
          if (footEl) footEl.innerHTML = '<strong>Fuente:</strong> Instituto MISTRALL a partir de OCDE, 2026. PISA 2025, Tabla I.B1.2d.8 y Tabla I.B1.2d.11. Para el promedio OCDE se consideran los 29 países con datos disponibles (OCDE-29).';
          chart.setOption(getOptionFig21(), true);
        } else {
          if (titleEl) titleEl.textContent = 'Brecha en lectura PISA 2025 entre estudiantes no inmigrantes e inmigrantes de 1ra y 2da generación';
          if (descEl) descEl.textContent = 'Diferencia de puntaje en lectura entre estudiantes no migrantes y estudiantes migrantes de primera y segunda generación en países de América Latina y promedio OCDE-29.';
          if (footEl) footEl.innerHTML = '<strong>Fuente:</strong> Instituto MISTRALL a partir de OCDE, 2026. PISA 2025, Tabla I.B1.2d.8. Para el promedio OCDE se consideran los 29 países con datos disponibles (OCDE-29). Valores positivos indican ventaja a favor de los estudiantes no migrantes.';
          chart.setOption(getOptionFig20(), true);
        }
      });
    });
  }

  window.addEventListener('resize', () => chart.resize());
}

/* --------------------------------------------------------------------------
   FIGURA 22: HORAS DIARIAS DE USO DE DISPOSITIVOS DIGITALES SEGÚN TIPO DE USO (2025)
   -------------------------------------------------------------------------- */
function renderFigura22Dispositivos(data) {
  const dom = document.getElementById('chart-figura-22-dispositivos');
  if (!dom) return;
  const chart = echarts.init(dom);

  const nameMap = {
    'Promedio OCDE': 'Promedio OCDE',
    'Argentina': 'Argentina',
    'Colombia': 'Colombia',
    'México': 'México',
    'Mexico': 'México',
    'Costa Rica': 'Costa Rica',
    'Promedio LatAm (8)': 'Promedio LatAm (8)',
    'Uruguay': 'Uruguay',
    'Perú': 'Perú',
    'Peru': 'Perú',
    'Brasil': 'Brasil',
    'Brazil': 'Brasil',
    'Dominican Republic': 'República Dominicana',
    'República Dominicana': 'República Dominicana',
    'Paraguay': 'Paraguay',
    'Chile': 'Chile',
    'El Salvador': 'El Salvador',
    'Guatemala': 'Guatemala'
  };

  const orderKeys = [
    'Promedio OCDE',
    'Argentina',
    'Colombia',
    'México',
    'Costa Rica',
    'Promedio LatAm (8)',
    'Uruguay',
    'Perú',
    'Brasil',
    'Dominican Republic',
    'Paraguay',
    'Chile',
    'El Salvador',
    'Guatemala'
  ];

  const raw = data.Recursos_Digitales_Escuela || [];
  const rows = orderKeys
    .map(k => raw.find(r => r.Pais_o_Region === k || nameMap[r.Pais_o_Region] === nameMap[k]))
    .filter(Boolean);

  const paises = rows.map(r => nameMap[r.Pais_o_Region] || r.Pais_o_Region);
  const aprEsc = rows.map(r => Number(r.Horas_Aprendizaje_Escuela_Dia));
  const ocioEsc = rows.map(r => Number(r.Horas_Ocio_Escuela_Dia));
  const ocioDia = rows.map(r => Number(r.Horas_Ocio_Hogar_Dia_Habil));
  const ocioFinde = rows.map(r => Number(r.Horas_Ocio_Hogar_Fin_Semana));

  chart.setOption({
    textStyle: { fontFamily: POLICY_PALETTE.fontFamily },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#252423',
      borderColor: '#FFF265',
      textStyle: { color: '#F9F7F2', fontFamily: POLICY_PALETTE.fontFamily },
      formatter: (params) => {
        if (!params.length) return '';
        let str = `<div style="font-weight:700; margin-bottom:5px; border-bottom:1px solid #444; padding-bottom:4px;">${params[0].axisValue} (PISA 2025)</div>`;
        params.forEach(p => {
          const val = Number(p.value).toFixed(1).replace('.', ',');
          str += `<div style="display:flex; justify-content:space-between; gap:16px; margin:2px 0;">
            <span><span style="color:${p.color}">●</span> ${p.seriesName}</span>
            <strong>${val} hrs/día</strong>
          </div>`;
        });
        return str;
      }
    },
    legend: {
      top: 0,
      itemGap: 20,
      data: [
        'Aprendizaje en la escuela',
        'Ocio en la escuela',
        'Ocio en el hogar en día hábil',
        'Ocio en el hogar en fin de semana'
      ],
      textStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 11.5, color: '#252423' }
    },
    grid: { left: '6.5%', right: '3%', bottom: '16%', top: '14%', containLabel: true },
    xAxis: {
      type: 'category',
      data: paises,
      axisLine: { lineStyle: { color: '#C5C1B6' } },
      axisLabel: {
        interval: 0,
        rotate: 30,
        fontSize: 10.5,
        color: (v) => v === 'Chile' ? '#3C4D5D' : '#252423',
        fontWeight: (v) => (v === 'Chile' || v.includes('Promedio')) ? '800' : '600',
        fontFamily: POLICY_PALETTE.fontFamily
      }
    },
    yAxis: {
      type: 'value',
      name: 'Promedio de horas al día de uso de dispositivos digitales',
      nameLocation: 'middle',
      nameGap: 52,
      nameTextStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontWeight: 700, fontSize: 11.5, color: '#252423' },
      min: 0,
      max: 4.5,
      interval: 1,
      axisLabel: { formatter: '{value}', fontSize: 10.5, fontFamily: POLICY_PALETTE.fontFamily, color: '#555555' },
      splitLine: { lineStyle: { color: '#ECE8DD', type: 'dashed' } }
    },
    series: [
      {
        name: 'Aprendizaje en la escuela',
        type: 'bar',
        barGap: '4%',
        barWidth: 12,
        data: aprEsc,
        itemStyle: { color: '#4DB6B5', borderRadius: [2, 2, 0, 0] },
        label: {
          show: true,
          position: 'top',
          distance: 3,
          formatter: (p) => Number(p.value).toFixed(1).replace('.', ','),
          fontWeight: 700,
          fontSize: 8.5,
          color: '#2E8B8A',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      },
      {
        name: 'Ocio en la escuela',
        type: 'bar',
        barWidth: 12,
        data: ocioEsc,
        itemStyle: { color: '#3C4D5D', borderRadius: [2, 2, 0, 0] },
        label: {
          show: true,
          position: 'top',
          distance: 3,
          formatter: (p) => Number(p.value).toFixed(1).replace('.', ','),
          fontWeight: 700,
          fontSize: 8.5,
          color: '#3C4D5D',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      },
      {
        name: 'Ocio en el hogar en día hábil',
        type: 'bar',
        barWidth: 12,
        data: ocioDia,
        itemStyle: { color: '#9FA6C4', borderRadius: [2, 2, 0, 0] },
        label: {
          show: true,
          position: 'top',
          distance: 3,
          formatter: (p) => Number(p.value).toFixed(1).replace('.', ','),
          fontWeight: 700,
          fontSize: 8.5,
          color: '#505362',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      },
      {
        name: 'Ocio en el hogar en fin de semana',
        type: 'bar',
        barWidth: 12,
        data: ocioFinde,
        itemStyle: { color: '#777D93', borderRadius: [2, 2, 0, 0] },
        label: {
          show: true,
          position: 'top',
          distance: 3,
          formatter: (p) => Number(p.value).toFixed(1).replace('.', ','),
          fontWeight: 700,
          fontSize: 8.5,
          color: '#505362',
          fontFamily: POLICY_PALETTE.fontFamily
        }
      }
    ]
  });

  window.addEventListener('resize', () => chart.resize());
}

/* --------------------------------------------------------------------------
   FIGURA 23: PORCENTAJE DE ESTUDIANTES CON USO DIARIO O SEMANAL DE INTELIGENCIA ARTIFICIAL GENERATIVA (2025)
   -------------------------------------------------------------------------- */
function renderFigura23Ia(data) {
  const dom = document.getElementById('chart-figura-23-ia');
  if (!dom) return;
  const chart = echarts.init(dom);

  const raw = data.Inteligencia_Artificial_IA || [];
  const getRow = (key) => raw.find(r => r.Pais_o_Region === key || r.Codigo_ISO === key);

  const rChile = getRow('Chile');
  const rLatAm = getRow('Promedio LatAm (8)');
  const rOcde  = getRow('Promedio OCDE');

  const toPct = (v) => v !== null && v !== undefined ? Number((Number(v) <= 1 ? Number(v) * 100 : Number(v)).toFixed(1)) : 0;

  const extractSeries = (row) => row ? [
    toPct(row.Pct_Frecuente_Ayuda_Aprender),
    toPct(row.Pct_Frecuente_Investigar_Tema),
    toPct(row.Pct_Frecuente_Resumir_Textos),
    toPct(row.Pct_Frecuente_Redactar_Textos)
  ] : [0, 0, 0, 0];

  const chileVals = rChile ? extractSeries(rChile) : [51.1, 39.1, 33.0, 33.2];
  const latamVals = rLatAm ? extractSeries(rLatAm) : [50.9, 40.5, 38.3, 33.7];
  const ocdeVals  = rOcde  ? extractSeries(rOcde)  : [45.5, 31.2, 29.7, 28.8];

  const categories = [
    'Para ayudarse a\naprender',
    'Para investigar\nun tema nuevo',
    'Para resumir\ntextos asignados',
    'Para redactar\nborradores'
  ];

  chart.setOption({
    textStyle: { fontFamily: POLICY_PALETTE.fontFamily },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#252423',
      borderColor: '#FFF265',
      textStyle: { color: '#F9F7F2', fontFamily: POLICY_PALETTE.fontFamily },
      formatter: (params) => {
        if (!params.length) return '';
        const title = (params[0].axisValue || '').replace('\n', ' ');
        let str = `<div style="font-weight:700; margin-bottom:5px; border-bottom:1px solid #444; padding-bottom:4px;">${title} (PISA 2025)</div>`;
        params.forEach(p => {
          const val = Number(p.value).toFixed(1).replace('.', ',');
          str += `<div style="display:flex; justify-content:space-between; gap:16px; margin:2px 0;">
            <span><span style="color:${p.color}">●</span> ${p.seriesName}</span>
            <strong>${val}%</strong>
          </div>`;
        });
        return str;
      }
    },
    legend: {
      data: ['Chile', 'Promedio LatAm (8)', 'Promedio OCDE'],
      top: 0,
      itemGap: 24,
      textStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontSize: 12, color: '#252423' }
    },
    grid: { left: '6.5%', right: '4%', bottom: '12%', top: '14%', containLabel: true },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: '#C5C1B6' } },
      axisLabel: {
        fontFamily: POLICY_PALETTE.fontFamily,
        fontSize: 11,
        lineHeight: 15,
        fontWeight: 600,
        color: '#252423'
      }
    },
    yAxis: {
      type: 'value',
      name: '% de estudiantes que lo usan semanal o diariamente',
      nameLocation: 'middle',
      nameGap: 58,
      nameTextStyle: { fontFamily: POLICY_PALETTE.fontFamily, fontWeight: 700, fontSize: 11.5, color: '#252423' },
      min: 0,
      max: 70,
      interval: 10,
      axisLabel: { formatter: '{value}%', fontSize: 10.5, fontFamily: POLICY_PALETTE.fontFamily, color: '#555555' },
      splitLine: { lineStyle: { color: '#ECE8DD', type: 'dashed' } }
    },
    series: [
      {
        name: 'Chile',
        type: 'bar',
        barGap: '6%',
        barWidth: 36,
        data: chileVals,
        itemStyle: { color: '#3C4D5D', borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: 'top',
          distance: 4,
          formatter: (p) => `${Number(p.value).toFixed(1).replace('.', ',')}%`,
          fontWeight: 700,
          fontSize: 10.5,
          fontFamily: POLICY_PALETTE.fontFamily,
          color: '#3C4D5D'
        }
      },
      {
        name: 'Promedio LatAm (8)',
        type: 'bar',
        barWidth: 36,
        data: latamVals,
        itemStyle: { color: '#4DB6B5', borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: 'top',
          distance: 4,
          formatter: (p) => `${Number(p.value).toFixed(1).replace('.', ',')}%`,
          fontWeight: 700,
          fontSize: 10.5,
          fontFamily: POLICY_PALETTE.fontFamily,
          color: '#2E8B8A'
        }
      },
      {
        name: 'Promedio OCDE',
        type: 'bar',
        barWidth: 36,
        data: ocdeVals,
        itemStyle: { color: '#9FA6C4', borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: 'top',
          distance: 4,
          formatter: (p) => `${Number(p.value).toFixed(1).replace('.', ',')}%`,
          fontWeight: 700,
          fontSize: 10.5,
          fontFamily: POLICY_PALETTE.fontFamily,
          color: '#505362'
        }
      }
    ]
  });

  window.addEventListener('resize', () => chart.resize());
}

/* --------------------------------------------------------------------------
   ACTITUDES DE LOS ESTUDIANTES (FIGURAS 24, 25 Y 26: LÍNEAS DE TIEMPO 2022 - 2025)
   -------------------------------------------------------------------------- */
function renderActitudesTimelineSection(config) {
  const dom = document.getElementById(config.domId);
  if (!dom || !config.rows || !config.rows.length) return;
  const chart = echarts.init(dom);

  const entities = [
    { key: 'Chile', name: 'Chile', color: '#3C4D5D', lineWidth: 3.0, symbolSize: 8, z: 5 },
    { key: 'Promedio LatAm (8)', name: 'Promedio LatAm (8)', color: '#4DB6B5', lineWidth: 2.5, symbolSize: 7, z: 4 },
    { key: 'Promedio OCDE', name: 'Promedio OCDE', color: '#8C5A63', lineWidth: 2.5, symbolSize: 7, z: 3 }
  ];
  const years = [2022, 2025];

  function getVal(entityKey, year, field) {
    const row = config.rows.find((r) => (r.Pais_o_Region || r.Pais) === entityKey && Number(r.Anio) === year);
    if (!row || row[field] == null) return null;
    return Number((Number(row[field]) * 100).toFixed(1));
  }

  function buildNonOverlappingPoints(itemKey, isSingleView) {
    const rawByEntity = {};
    entities.forEach((ent) => {
      rawByEntity[ent.key] = years.map((yr) => getVal(ent.key, yr, itemKey));
    });

    const posByEntityYear = {};
    entities.forEach((ent) => {
      posByEntityYear[ent.key] = ['top', 'top'];
    });

    years.forEach((_, tIdx) => {
      const ranked = entities
        .map((ent) => ({ key: ent.key, val: rawByEntity[ent.key][tIdx] }))
        .filter((d) => d.val != null)
        .sort((a, b) => b.val - a.val);

      if (ranked.length === 3) {
        const dTop = ranked[0].val - ranked[1].val;
        const dBot = ranked[1].val - ranked[2].val;
        posByEntityYear[ranked[0].key][tIdx] = 'top';
        posByEntityYear[ranked[2].key][tIdx] = 'bottom';
        if (dTop >= 7 && dBot >= 6) {
          posByEntityYear[ranked[1].key][tIdx] = 'top';
        } else {
          posByEntityYear[ranked[1].key][tIdx] = tIdx === 0 ? 'left' : 'right';
        }
      }
    });

    const formatted = {};
    entities.forEach((ent) => {
      formatted[ent.key] = years.map((_, tIdx) => {
        const v = rawByEntity[ent.key][tIdx];
        const pos = posByEntityYear[ent.key][tIdx];
        return {
          value: v,
          label: {
            show: true,
            position: pos,
            distance: isSingleView ? 7 : 4,
            formatter: (p) => `${Number(p.value).toFixed(1).replace('.', ',')}%`,
            fontWeight: ent.key === 'Chile' ? 800 : 700,
            fontSize: isSingleView ? 11.5 : (config.items.length >= 5 ? 9.5 : 10.5),
            fontFamily: POLICY_PALETTE.fontFamily,
            color: ent.color
          }
        };
      });
    });

    return { rawByEntity, formatted };
  }

  function renderView(activeItemKey) {
    const isSingle = activeItemKey !== 'todos';
    const activeItems = isSingle
      ? config.items.filter((it) => it.key === activeItemKey)
      : config.items;
    const count = activeItems.length;

    const grids = [];
    const xAxes = [];
    const yAxes = [];
    const titles = [];
    const series = [];

    const leftStart = isSingle ? 10 : (count >= 5 ? 6.5 : 7.5);
    const rightEnd = isSingle ? 92 : 97.5;
    const gap = isSingle ? 0 : (count >= 5 ? 2.2 : 3.8);
    const totalAvail = rightEnd - leftStart - gap * (count - 1);
    const panelWidth = totalAvail / count;

    activeItems.forEach((item, idx) => {
      const leftPct = leftStart + idx * (panelWidth + gap);
      const centerPct = leftPct + panelWidth / 2;

      grids.push({
        left: `${leftPct.toFixed(2)}%`,
        width: `${panelWidth.toFixed(2)}%`,
        top: isSingle ? '22%' : '25%',
        bottom: '12%',
        show: true,
        borderColor: '#E2DDD2',
        borderWidth: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.45)'
      });

      titles.push({
        text: isSingle ? item.fullTitle : item.shortTitle,
        subtext: item.subtitle,
        left: `${centerPct.toFixed(2)}%`,
        top: isSingle ? '9%' : '9.5%',
        textAlign: 'center',
        itemGap: 3,
        textStyle: {
          fontFamily: POLICY_PALETTE.fontFamily,
          fontSize: isSingle ? 13.5 : (count >= 5 ? 10.5 : 11.5),
          fontWeight: 800,
          lineHeight: isSingle ? 17 : 13.5,
          color: '#252423'
        },
        subtextStyle: {
          fontFamily: POLICY_PALETTE.fontFamily,
          fontSize: isSingle ? 11.5 : 10,
          fontStyle: 'italic',
          color: '#666666'
        }
      });

      xAxes.push({
        gridIndex: idx,
        type: 'category',
        data: ['2022', '2025'],
        boundaryGap: isSingle ? ['28%', '28%'] : (count >= 5 ? ['31%', '31%'] : ['28%', '28%']),
        axisTick: { show: true, alignWithLabel: true },
        axisLine: { lineStyle: { color: '#C8C4B8' } },
        axisLabel: {
          fontFamily: POLICY_PALETTE.fontFamily,
          fontSize: isSingle ? 12 : 11,
          fontWeight: 700,
          color: '#252423',
          margin: 10
        }
      });

      yAxes.push({
        gridIndex: idx,
        type: 'value',
        min: config.yMin,
        max: config.yMax,
        interval: 10,
        name: idx === 0 ? 'Porcentaje de estudiantes (%)' : '',
        nameLocation: 'middle',
        nameGap: 44,
        nameTextStyle: {
          fontFamily: POLICY_PALETTE.fontFamily,
          fontWeight: 700,
          fontSize: 11.5,
          color: '#555555'
        },
        axisLabel: {
          show: idx === 0,
          formatter: '{value}%',
          fontFamily: POLICY_PALETTE.fontFamily,
          fontSize: 10.5,
          color: '#555555'
        },
        splitLine: {
          show: true,
          lineStyle: { color: '#ECE8DD', type: 'dashed' }
        }
      });

      const { formatted } = buildNonOverlappingPoints(item.key, isSingle);

      entities.forEach((ent) => {
        series.push({
          name: ent.name,
          type: 'line',
          xAxisIndex: idx,
          yAxisIndex: idx,
          data: formatted[ent.key],
          symbol: 'circle',
          symbolSize: isSingle ? ent.symbolSize + 2 : ent.symbolSize,
          lineStyle: {
            color: ent.color,
            width: isSingle ? ent.lineWidth + 0.5 : ent.lineWidth,
            type: 'solid'
          },
          itemStyle: {
            color: ent.color,
            borderColor: '#FFFFFF',
            borderWidth: 1.5
          },
          z: ent.z
        });
      });
    });

    chart.setOption({
      textStyle: { fontFamily: POLICY_PALETTE.fontFamily },
      title: titles,
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#252423',
        borderColor: '#FFF265',
        textStyle: { color: '#F9F7F2', fontFamily: POLICY_PALETTE.fontFamily, fontSize: 12 },
        formatter: (params) => {
          if (!params || !params.length) return '';
          const axisIdx = params[0].axisIndex || 0;
          const itemObj = activeItems[axisIdx] || activeItems[0];
          const yr = params[0].axisValue;
          let html = `<div style="font-weight:800;margin-bottom:4px;color:#FFF265;">${itemObj.fullTitle.replace(/\n/g, ' ')} (${yr})</div>`;
          html += `<div style="font-size:11px;color:#CFCBC2;margin-bottom:6px;">${itemObj.subtitle}</div>`;
          params.forEach((p) => {
            html += `<div style="display:flex;justify-content:space-between;gap:14px;margin:2px 0;">
              <span>${p.marker} ${p.seriesName}</span>
              <strong>${Number(p.value).toFixed(1).replace('.', ',')}%</strong>
            </div>`;
          });
          return html;
        }
      },
      legend: {
        data: entities.map((e) => e.name),
        top: 0,
        itemGap: 24,
        textStyle: {
          fontFamily: POLICY_PALETTE.fontFamily,
          fontSize: 11.5,
          fontWeight: 700,
          color: '#252423'
        }
      },
      grid: grids,
      xAxis: xAxes,
      yAxis: yAxes,
      series
    }, true);
  }

  renderView('todos');

  const controlContainer = document.getElementById(config.controlId);
  if (controlContainer) {
    const buttons = controlContainer.querySelectorAll('.seg-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        renderView(btn.getAttribute('data-item') || 'todos');
      });
    });
  }

  window.addEventListener('resize', () => chart.resize());
}

function renderFigura24Perseverancia(data) {
  renderActitudesTimelineSection({
    domId: 'chart-figura-24-perseverancia',
    controlId: 'control-perseverancia-vista',
    rows: data.Perseverancia_Escolar || [],
    yMin: 20,
    yMax: 90,
    items: [
      {
        key: 'Pct_Rechaza_Dejar_Tarea',
        shortTitle: 'Abandono una tarea si\nes demasiado larga',
        fullTitle: 'Abandono una tarea si es demasiado larga',
        subtitle: '(% en desacuerdo)'
      },
      {
        key: 'Pct_Rechaza_Rendirse_Facil',
        shortTitle: 'Me rindo\nfácilmente',
        fullTitle: 'Me rindo fácilmente',
        subtitle: '(% en desacuerdo)'
      },
      {
        key: 'Pct_Esfuerzo_Desafio',
        shortTitle: 'Esfuerzo adicional si el\ntrabajo es desafiante',
        fullTitle: 'Esfuerzo adicional si el trabajo es desafiante',
        subtitle: '(% de acuerdo)'
      },
      {
        key: 'Pct_Sigue_Tarea',
        shortTitle: 'Sigo en la tarea\nhasta terminarla',
        fullTitle: 'Sigo en la tarea hasta terminarla',
        subtitle: '(% de acuerdo)'
      },
      {
        key: 'Pct_Termina_Aburrido',
        shortTitle: 'Termino lo empezado\naunque sea aburrido',
        fullTitle: 'Termino lo empezado aunque sea aburrido',
        subtitle: '(% de acuerdo)'
      }
    ]
  });
}

function renderFigura25Curiosidad(data) {
  renderActitudesTimelineSection({
    domId: 'chart-figura-25-curiosidad',
    controlId: 'control-curiosidad-vista',
    rows: data.Curiosidad_Estudiantil || [],
    yMin: 30,
    yMax: 90,
    items: [
      {
        key: 'Pct_Aprender_Nuevas',
        shortTitle: 'Me gusta aprender\ncosas nuevas',
        fullTitle: 'Me gusta aprender cosas nuevas',
        subtitle: '(% de acuerdo)'
      },
      {
        key: 'Pct_Saber_Como_Funciona',
        shortTitle: 'Me gusta saber cómo\nfuncionan las cosas',
        fullTitle: 'Me gusta saber cómo funcionan las cosas',
        subtitle: '(% de acuerdo)'
      },
      {
        key: 'Pct_Rechaza_Aprender_Aburrido',
        shortTitle: 'Aprender cosas nuevas\nes aburrido',
        fullTitle: 'Aprender cosas nuevas es aburrido',
        subtitle: '(% en desacuerdo)'
      }
    ]
  });
}

function renderFigura27ApoyoFamiliar(data) {
  renderActitudesTimelineSection({
    domId: 'chart-figura-27-apoyo-familiar',
    rows: data.Apoyo_Acompanamiento_Familiar || [],
    yMin: 30,
    yMax: 90,
    items: [
      {
        key: 'Pct_Conversa_Desempeno',
        shortTitle: 'Conversar sobre\ndesempeño escolar',
        fullTitle: 'Conversar sobre desempeño escolar',
        subtitle: '(% semanal o diario)'
      },
      {
        key: 'Pct_Habla_Problemas_Escuela',
        shortTitle: 'Hablar de problemas\nen la escuela',
        fullTitle: 'Hablar de problemas en la escuela',
        subtitle: '(% semanal o diario)'
      },
      {
        key: 'Pct_Pregunta_Que_Hizo_Hoy',
        shortTitle: 'Pregunta qué hizo\nhoy en el colegio',
        fullTitle: 'Pregunta qué hizo hoy en el colegio',
        subtitle: '(% semanal o diario)'
      },
      {
        key: 'Pct_Interes_Aprendizaje',
        shortTitle: 'Interés por lo que\naprende en la escuela',
        fullTitle: 'Interés por lo que está aprendiendo en la escuela',
        subtitle: '(% semanal o diario)'
      },
      {
        key: 'Pct_Habla_Futura_Educacion',
        shortTitle: 'Hablar sobre el futuro\nde su educación',
        fullTitle: 'Hablar sobre el futuro de su educación',
        subtitle: '(% semanal o diario)'
      }
    ]
  });
}
