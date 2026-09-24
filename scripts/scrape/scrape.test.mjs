import { describe, it, expect } from 'vitest';
import { extraerDias, extraerTipoTarjeta, extraerFecha, inferirCategoria, idEstable, limpiarTexto } from './lib.mjs';
import { validarResultado } from './index.mjs';

describe('helpers del scraper', () => {
  it('extraerDias entiende rangos, listas y "todos los días"', () => {
    expect(extraerDias('Válido de lunes a miércoles')).toEqual(['lunes', 'martes', 'miércoles']);
    expect(extraerDias('Martes y Jueves')).toEqual(['martes', 'jueves']);
    expect(extraerDias('Todos los días del año')).toHaveLength(7);
    expect(extraerDias('Fin de semana')).toEqual(['sábado', 'domingo']);
    expect(extraerDias('los sábados')).toEqual(['sábado']);
    expect(extraerDias('')).toEqual([]);
  });
  it('extraerTipoTarjeta', () => {
    expect(extraerTipoTarjeta('Tarjeta de Crédito')).toBe('credito');
    expect(extraerTipoTarjeta('tarjetas de débito')).toBe('debito');
    expect(extraerTipoTarjeta('crédito y débito')).toBe('ambas');
    expect(extraerTipoTarjeta('')).toBe('ambas');
  });
  it('extraerFecha soporta varios formatos', () => {
    expect(extraerFecha('Válido hasta el 31/12/2026')).toBe('2026-12-31');
    expect(extraerFecha('hasta 2026-10-05')).toBe('2026-10-05');
    expect(extraerFecha('hasta el 5 de octubre de 2026')).toBe('2026-10-05');
    expect(extraerFecha('sin fecha')).toBe('');
  });
  it('inferirCategoria', () => {
    expect(inferirCategoria('Rappi')).toBe('Delivery');
    expect(inferirCategoria('Farmacias Cruz Verde')).toBe('Farmacias');
    expect(inferirCategoria('Algo raro')).toBe('Otros');
  });
  it('idEstable es determinista', () => {
    expect(idEstable('bci', 'x')).toBe(idEstable('bci', 'x'));
    expect(idEstable('bci', 'x')).not.toBe(idEstable('bci', 'y'));
    expect(idEstable('bci', 'x')).toMatch(/^bci-[0-9a-f]{10}$/);
  });
  it('limpiarTexto quita HTML', () => {
    expect(limpiarTexto('<p>Hola&nbsp;<b>mundo</b></p>')).toBe('Hola mundo');
  });
});

describe('protecciones del scraper', () => {
  const scraper = { id: 'test', banco_nombre: 'BCI' };
  const item = (i) => ({ id: `test-${i}`, establecimiento: `Comercio ${i}`, descuento: '20%' });
  const lista = (n) => Array.from({ length: n }, (_, i) => item(i));

  it('acepta un resultado normal y marca la fuente', () => {
    const res = validarResultado(lista(12), { descuentos: lista(10) }, scraper);
    expect(res).toHaveLength(12);
    expect(res[0]).toMatchObject({ banco_nombre: 'BCI', fuente: 'test', activo: true });
  });
  it('rechaza cero resultados', () => {
    expect(() => validarResultado([], null, scraper)).toThrow(/ningún/);
  });
  it('rechaza una caída brusca respecto de la vez anterior', () => {
    expect(() => validarResultado(lista(4), { descuentos: lista(20) }, scraper)).toThrow(/bajó de 20 a 4/);
  });
  it('rechaza demasiados descuentos incompletos', () => {
    const malos = [...lista(5), ...Array.from({ length: 5 }, (_, i) => ({ id: `x${i}` }))];
    expect(() => validarResultado(malos, null, scraper)).toThrow(/incompletos/);
  });
  it('elimina duplicados por id', () => {
    expect(validarResultado([item(1), item(1), item(2)], null, scraper)).toHaveLength(2);
  });
});

import { parsearTarjeta } from './bancos/falabella.mjs';
import { mapearOferta } from './bancos/bci.mjs';

describe('Falabella: parsearTarjeta', () => {
  it('separa comercio, descuento, descripción y días', () => {
    const d = parsearTarjeta({
      titulo: 'Dcto en Casa Roque',
      lineas: ['Exclusivo', 'Dcto en Casa Roque', 'Sin azúcar y sin gluten', 'Martes', 'Hasta', '40%', 'DESCUENTO'],
      href: ''
    });
    expect(d).toMatchObject({ establecimiento: 'Casa Roque', descuento: 'Hasta 40% descuento', descripcion: 'Sin azúcar y sin gluten', dias_validos: ['martes'] });
  });
  it('no usa etiquetas ni días como descripción', () => {
    const d = parsearTarjeta({ titulo: 'Dcto Tito el Bambino', lineas: ['Dcto Tito el Bambino', 'Nuevo', 'Todos los días', '30%', 'DCTO'], href: '' });
    expect(d.establecimiento).toBe('Tito el Bambino');
    expect(d.descripcion).toBe('');
    expect(d.dias_validos).toHaveLength(7);
  });
});

describe('BCI: mapearOferta', () => {
  it('convierte la fecha UTC a la fecha de Chile y asume todos los días si no hay', () => {
    const d = mapearOferta({ id: 'x', titulo: '20% dcto', subtitulo: 'Crédito o Débito Bci', comercio: { nombre: 'Tienda' }, fechaTermino: '2027-01-01T02:59:59.000Z', slug: 'tienda-1' });
    expect(d).toMatchObject({ establecimiento: 'Tienda', fecha_vencimiento: '2026-12-31', tipo_tarjeta: 'ambas' });
    expect(d.dias_validos).toHaveLength(7);
    expect(d.url).toBe('https://www.bci.cl/beneficios/beneficios-bci/detalle/tienda-1');
  });
  it('respeta los días mencionados', () => {
    expect(mapearOferta({ id: 'y', titulo: 'Jueves 20%', descripcion: 'Todos los jueves' }).dias_validos).toEqual(['jueves']);
  });
});
