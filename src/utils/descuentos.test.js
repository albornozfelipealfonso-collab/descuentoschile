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
  FILTROS_INICIALES
} from './descuentos';
import { hashDatos } from './storage';
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
