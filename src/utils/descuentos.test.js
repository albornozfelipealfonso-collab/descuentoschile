import { describe, it, expect } from 'vitest';
import {
  normalizar,
  getDiaActual,
  estaVigente,
  filtrarDescuentos,
  enriquecerConBanco,
  getTextColor,
  formatDias,
  validarDatos,
  nextId,
  unificarCategoria,
  ordenarPorDia,
  contarOpciones,
  diasParaVencer,
  normalizarDescuento,
  destacarDescuento,
  asignarLogos,
  iniciales,
  extraerCodigo,
  combinarDatos,
  coincideConTarjetas,
  contarTarjetas,
  FILTROS_INICIALES
} from './descuentos';
import { hashDatos } from './storage';
import { masReciente } from './remoteData';
import { initialData } from '../data/initialData.js';

const base = {
  establecimiento: 'Rappi',
  descripcion: 'Descuento en delivery',
  descuento: '20% dcto',
  banco_nombre: 'Banco de Chile',
  tipo_tarjeta: 'credito',
  categoria: 'Delivery',
  dias_validos: ['miércoles'],
  fecha_vencimiento: '',
  activo: true
};
const d = (over) => ({ id: Math.random(), ...base, ...over });

describe('normalizar', () => {
  it('quita tildes, mayúsculas y espacios', () => {
    expect(normalizar('  Miércoles ')).toBe('miercoles');
    expect(normalizar(undefined)).toBe('');
  });
});

describe('getDiaActual', () => {
  it('devuelve el día en español sin depender del locale', () => {
    expect(getDiaActual(new Date(2025, 0, 6))).toBe('lunes'); // 6 ene 2025 fue lunes
    expect(getDiaActual(new Date(2025, 0, 12))).toBe('domingo');
  });
});

describe('estaVigente', () => {
  it('sin fecha siempre está vigente', () => expect(estaVigente(d())).toBe(true));
  it('compara contra hoy (inclusive)', () => {
    expect(estaVigente(d({ fecha_vencimiento: '2025-07-31' }), '2025-07-31')).toBe(true);
    expect(estaVigente(d({ fecha_vencimiento: '2025-07-31' }), '2025-08-01')).toBe(false);
  });
});

describe('filtrarDescuentos', () => {
  const hoy = '2025-01-01';
  const filtrar = (lista, filtros = {}, busqueda = '') =>
    filtrarDescuentos(lista, { ...FILTROS_INICIALES, ...filtros }, busqueda, hoy);

  it('oculta inactivos y vencidos', () => {
    const lista = [d(), d({ activo: false }), d({ fecha_vencimiento: '2024-12-31' })];
    expect(filtrar(lista)).toHaveLength(1);
  });

  it('un descuento "ambas" aparece al filtrar débito y crédito', () => {
    const ambas = d({ tipo_tarjeta: 'ambas' });
    expect(filtrar([ambas], { tipo: 'debito' })).toHaveLength(1);
    expect(filtrar([ambas], { tipo: 'credito' })).toHaveLength(1);
    expect(filtrar([d({ tipo_tarjeta: 'credito' })], { tipo: 'debito' })).toHaveLength(0);
  });

  it('el filtro de día ignora tildes', () => {
    expect(filtrar([d()], { dia: 'miercoles' })).toHaveLength(1);
    expect(filtrar([d()], { dia: 'jueves' })).toHaveLength(0);
  });

  it('la búsqueda ignora tildes y mayúsculas', () => {
    expect(filtrar([d({ establecimiento: 'Café Haití' })], {}, 'cafe haiti')).toHaveLength(1);
    expect(filtrar([d()], {}, 'CHILE')).toHaveLength(1);
    expect(filtrar([d()], {}, 'falabella')).toHaveLength(0);
  });

  it('filtra por banco y categoría', () => {
    expect(filtrar([d()], { banco: 'banco de chile', categoria: 'delivery' })).toHaveLength(1);
    expect(filtrar([d()], { banco: 'BCI' })).toHaveLength(0);
  });
});

describe('enriquecerConBanco', () => {
  const bancos = [
    { id: 1, nombre: 'Banco de Chile', color: '#1976D2', logo_url: 'x.png', activo: true },
    { id: 2, nombre: 'BCI', color: '#F57C00', logo_url: '', activo: false }
  ];
  it('agrega color y logo, y descarta bancos inactivos', () => {
    const res = enriquecerConBanco([d(), d({ banco_nombre: 'BCI' })], bancos);
    expect(res).toHaveLength(1);
    expect(res[0]).toMatchObject({ banco_color: '#1976D2', logo_url: 'x.png' });
  });
});

describe('utilidades de formato', () => {
  it('getTextColor elige un texto legible', () => {
    expect(getTextColor('#ffffff')).not.toBe('#ffffff');
    expect(getTextColor('#000000')).toBe('#ffffff');
    expect(getTextColor('no-es-color')).toBe('#ffffff');
  });
  it('formatDias ordena y resume', () => {
    expect(formatDias(['viernes', 'lunes'])).toBe('Lunes, Viernes');
    expect(formatDias(['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'])).toBe('Todos los días');
  });
  it('nextId usa el máximo + 1', () => {
    expect(nextId([{ id: 3 }, { id: 10 }])).toBe(11);
    expect(nextId([])).toBe(1);
  });
});

describe('validarDatos', () => {
  it('rechaza estructuras inválidas', () => {
    expect(validarDatos(null).datos).toBeNull();
    expect(validarDatos({ bancos: [] }).datos).toBeNull();
  });
  it('detecta ids duplicados y bancos inexistentes', () => {
    const { datos, errores } = validarDatos({
      bancos: [{ id: 1, nombre: 'BCI', color: '#000000' }],
      descuentos: [
        { id: 1, establecimiento: 'A', descuento: '10%', banco_nombre: 'BCI' },
        { id: 1, establecimiento: 'B', descuento: '10%', banco_nombre: 'Otro' }
      ]
    });
    expect(datos).toBeNull();
    expect(errores.join('\n')).toMatch(/duplicado/);
    expect(errores.join('\n')).toMatch(/"Otro" no existe/);
  });
});

describe('datos publicados (initialData.js)', () => {
  it('son válidos', () => {
    expect(validarDatos(initialData).errores).toEqual([]);
  });
  it('no tienen nombres de banco con espacios sobrantes', () => {
    initialData.bancos.forEach((b) => expect(b.nombre).toBe(b.nombre.trim()));
  });
  it('hashDatos es estable y detecta cambios', () => {
    expect(hashDatos(initialData)).toBe(hashDatos(JSON.parse(JSON.stringify(initialData))));
    expect(hashDatos({ a: 1 })).not.toBe(hashDatos({ a: 2 }));
  });
});

describe('categorías', () => {
  it('unificarCategoria junta sinónimos', () => {
    expect(unificarCategoria('Cine')).toBe('Cine y entretención');
    expect(unificarCategoria('Moda y Vestuario')).toBe('Moda y vestuario');
    expect(unificarCategoria('Wellness')).toBe('Bienestar');
    expect(unificarCategoria(' Restaurantes ')).toBe('Restaurantes');
  });
  it('unificarCategoria deduce el rubro si la categoría es de campaña', () => {
    expect(unificarCategoria('Paga en cuotas', 'Sushi Bar')).toBe('Restaurantes');
    expect(unificarCategoria('Más Beneficios', 'Algo raro')).toBe('Otros');
    expect(unificarCategoria('', 'Rappi')).toBe('Delivery');
  });
  it('normalizarDescuento unifica la categoría', () => {
    expect(normalizarDescuento({ ...base, id: 1, categoria: 'Cine' }).categoria).toBe('Cine y entretención');
  });
});

describe('orden y conteos', () => {
  const soloJueves = d({ id: 1, dias_validos: ['jueves'] });
  const siempre = d({ id: 2, dias_validos: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'] });

  it('ordenarPorDia pone primero los exclusivos del día', () => {
    expect(ordenarPorDia([siempre, soloJueves], 'jueves').map((x) => x.id)).toEqual([1, 2]);
    expect(ordenarPorDia([siempre, soloJueves], 'todos').map((x) => x.id)).toEqual([2, 1]);
  });

  it('contarOpciones ignora el filtro del mismo campo y respeta los demás', () => {
    const lista = [
      d({ banco_nombre: 'BCI', categoria: 'Delivery' }),
      d({ banco_nombre: 'BCI', categoria: 'Viajes' }),
      d({ banco_nombre: 'Banco de Chile', categoria: 'Delivery' })
    ];
    const filtros = { ...FILTROS_INICIALES, banco: 'BCI', categoria: 'Delivery' };
    expect(Object.fromEntries(contarOpciones(lista, filtros, '', 'categoria'))).toEqual({ delivery: 1, viajes: 1 });
    expect(Object.fromEntries(contarOpciones(lista, filtros, '', 'banco_nombre'))).toEqual({
      bci: 1,
      'banco de chile': 1
    });
  });

  it('diasParaVencer', () => {
    expect(diasParaVencer('2026-09-24', '2026-09-24')).toBe(0);
    expect(diasParaVencer('2026-10-01', '2026-09-24')).toBe(7);
    expect(diasParaVencer('2026-11-01', '2026-10-31')).toBe(1);
    expect(diasParaVencer('')).toBeNull();
  });
});

describe('destacarDescuento', () => {
  it.each([
    ['40% de descuento', '40%', 'de descuento'],
    ['2 x 1 en entradas', '2x1', 'en entradas'],
    ['Uber One $6.000', '$6.000', 'Uber One'],
    ['100.000 CLP de descuento', '$100.000', 'de descuento'],
    ['Multiplica x5 tu cashback', 'x5', 'Multiplica tu cashback'],
    ['10X CB en restaurantes', 'x10', 'CB en restaurantes'],
    ['Paga en 3 ó 6 cuotas', '3–6', 'Paga en cuotas']
  ])('%s', (texto, cifra, resto) => {
    expect(destacarDescuento(texto)).toEqual({ cifra, resto });
  });
  it('sin cifra devuelve el texto completo', () => {
    expect(destacarDescuento('Maleta adicional')).toEqual({ cifra: null, resto: 'Maleta adicional' });
  });
});

describe('logos de comercios', () => {
  it('usa el logo incluido de la marca, aunque el nombre venga escrito distinto', () => {
    const [a, b] = asignarLogos([d({ establecimiento: 'UberEats' }), d({ establecimiento: 'Rappi.' })]);
    expect(a.logo).toBe('/logos/comercios/ubereats.svg');
    expect(b.logo).toBe('/logos/comercios/rappi.png');
  });
  it('reutiliza el logo de otro descuento del mismo comercio', () => {
    const logo = 'https://banco.cl/cinepolis.png';
    const [, manual] = asignarLogos([
      d({ establecimiento: 'Cinépolis', logo }),
      d({ establecimiento: 'Cinepolis' })
    ]);
    expect(manual.logo).toBe(logo);
  });
  it('sin logo conocido queda en null', () => {
    expect(asignarLogos([d({ establecimiento: 'Comercio X' })])[0].logo).toBeNull();
  });
  it('iniciales', () => {
    expect(iniciales('Uber Eats')).toBe('UE');
    expect(iniciales('Sushi')).toBe('SU');
    expect(iniciales('')).toBe('?');
  });
  it('normalizarDescuento solo acepta logos https', () => {
    expect(normalizarDescuento({ ...base, id: 1, logo: 'https://a.cl/x.png' }).logo).toBe('https://a.cl/x.png');
    expect(normalizarDescuento({ ...base, id: 1, logo: 'http://a.cl/x.png' }).logo).toBeUndefined();
  });
});

describe('ficha de detalle', () => {
  it('extraerCodigo encuentra el código en el texto', () => {
    expect(extraerCodigo(d({ descripcion: 'aplicando el cupón SBPAYJUL25.' }))).toBe('SBPAYJUL25');
    expect(extraerCodigo(d({ terminos: 'ingresando el código de descuento MACHFXBF antes de pagar' }))).toBe('MACHFXBF');
    expect(extraerCodigo(d({ descripcion: 'Sin código, descuento directo' }))).toBeNull();
    expect(extraerCodigo(d({ descripcion: 'usa el cupón de tu app' }))).toBeNull();
  });

  it('PedidosYa usa su logo, salvo los descuentos de PedidosYa Market con logo del banco', () => {
    const market = 'https://banco.cl/market.png';
    const [general, soloMarket] = asignarLogos([
      d({ establecimiento: 'PedidosYa', descuento: '30% en todas las categorías', logo: market }),
      d({ establecimiento: 'PedidosYa', descuento: '40% en PedidosYa Market', logo: market })
    ]);
    expect(general.logo).toBe('/logos/comercios/pedidosya.webp');
    expect(soloMarket.logo).toBe(market);
  });

  it('combinarDatos completa el manual repetido con el logo, enlace y vencimiento del banco', () => {
    const manual = { bancos: [], descuentos: [d({ id: 1, banco_nombre: 'MACH', establecimiento: 'PedidosYa', descuento: '40% OFF' })] };
    const delBanco = d({
      id: 'mach-1',
      banco_nombre: 'MACH',
      establecimiento: 'Pedidos Ya',
      descuento: '40% de descuento',
      logo: 'https://x/logo.png',
      url: 'https://machbank.cl',
      fecha_vencimiento: '2026-12-31'
    });
    const { descuentos } = combinarDatos(manual, [delBanco]);
    expect(descuentos).toHaveLength(1);
    expect(descuentos[0]).toMatchObject({ id: 1, logo: 'https://x/logo.png', url: 'https://machbank.cl', fecha_vencimiento: '2026-12-31' });
  });
});

describe('mis tarjetas', () => {
  const tarjetas = { bci: { debito: false, credito: true }, mach: { debito: true, credito: false } };
  it('coincideConTarjetas respeta banco y tipo de tarjeta', () => {
    expect(coincideConTarjetas(d({ banco_nombre: 'BCI', tipo_tarjeta: 'credito' }), tarjetas)).toBe(true);
    expect(coincideConTarjetas(d({ banco_nombre: 'BCI', tipo_tarjeta: 'debito' }), tarjetas)).toBe(false);
    expect(coincideConTarjetas(d({ banco_nombre: 'Bci', tipo_tarjeta: 'ambas' }), tarjetas)).toBe(true);
    expect(coincideConTarjetas(d({ banco_nombre: 'Banco de Chile', tipo_tarjeta: 'ambas' }), tarjetas)).toBe(false);
    expect(coincideConTarjetas(d({ banco_nombre: 'BCI' }), {})).toBe(false);
  });
  it('contarTarjetas cuenta débito y crédito por separado', () => {
    expect(contarTarjetas(tarjetas)).toBe(2);
    expect(contarTarjetas({ bci: { debito: true, credito: true } })).toBe(2);
    expect(contarTarjetas(null)).toBe(0);
  });
});

describe('masReciente (datos al abrir la app)', () => {
  const viejo = { generado: '2026-09-01T00:00:00Z' };
  const nuevo = { generado: '2026-09-24T00:00:00Z' };
  it('elige el más reciente y, sin copia previa, el que llegue', () => {
    expect(masReciente(viejo, nuevo)).toBe(nuevo);
    expect(masReciente(nuevo, viejo)).toBe(nuevo);
    expect(masReciente(null, { descuentos: [] })).toEqual({ descuentos: [] });
    expect(masReciente(viejo, null)).toBe(viejo);
  });
});
