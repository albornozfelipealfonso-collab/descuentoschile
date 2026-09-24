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
