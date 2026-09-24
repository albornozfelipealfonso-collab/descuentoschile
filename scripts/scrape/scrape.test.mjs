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

import { mapearTarjeta, extraerPayload, extraerTarjetas } from './bancos/falabella.mjs';
import { mapearOferta } from './bancos/bci.mjs';

describe('Falabella', () => {
  const item = {
    benefitCard: {
      title: 'Dcto en Doggis',
      description: 'Presencial en totem y por la app',
      linkUrl: '/descuentos/detalle/doggis',
      discountDays: ['Lunes'],
      topDiscountText: '',
      centerDiscountText: '40%',
      bottomDiscountText: 'Sin Tope',
      endDate: '2026-09-30T07:00:00.000Z'
    },
    limitDate: '2026-09-30T07:00:00.000Z',
    benefitTitle: 'Doggis',
    creditCards: ['CMR Mastercard', 'Tarjeta Débito Banco Falabella']
  };

  it('extrae las tarjetas del payload de Next.js en el HTML', () => {
    const json = JSON.stringify({ slug: 'todos', benefitCardsData: [item] });
    const html = `<script>self.__next_f.push([1,${JSON.stringify('28:' + json)}])</script>`;
    const tarjetas = extraerTarjetas(extraerPayload(html));
    expect(tarjetas).toHaveLength(1);
    expect(tarjetas[0].benefitTitle).toBe('Doggis');
  });

  it('mapea una tarjeta', () => {
    expect(mapearTarjeta(item)).toMatchObject({
      establecimiento: 'Doggis',
      descuento: '40% Sin Tope',
      descripcion: 'Presencial en totem y por la app',
      dias_validos: ['lunes'],
      tipo_tarjeta: 'ambas',
      fecha_vencimiento: '2026-09-30',
      url: 'https://www.bancofalabella.cl/descuentos/detalle/doggis'
    });
  });

  it('prefiere el título de la tarjeta y no repite el descuento en la descripción', () => {
    const d = mapearTarjeta({
      ...item,
      benefitTitle: '¡Un eslogan largo!',
      benefitCard: { ...item.benefitCard, title: 'Dcto Tito el Bambino', description: '30% dcto', centerDiscountText: '30%', bottomDiscountText: 'DCTO' }
    });
    expect(d.establecimiento).toBe('Tito el Bambino');
    expect(d.descuento).toBe('30% dcto');
    expect(d.descripcion).toBe('');
  });

  it('ignora las referencias internas de Next.js', () => {
    const d = mapearTarjeta({ ...item, creditCards: '$28:props:benefitCardsData:0:creditCards', benefitTitle: '$28:x' });
    expect(d.tipo_tarjeta).toBe('credito');
    expect(d.establecimiento).toBe('Doggis');
  });

  it('usa la categoría del sitio si está disponible', () => {
    expect(mapearTarjeta(item, 'Restaurantes').categoria).toBe('Restaurantes');
  });

  it('solo CMR es crédito', () => {
    expect(mapearTarjeta({ ...item, creditCards: ['CMR Mastercard'] }).tipo_tarjeta).toBe('credito');
  });
});

describe('BCI: mapearOferta', () => {
  const oferta = {
    id: 'abc',
    titulo: 'Viernes- Vitacura',
    subtitulo: 'Exclusivo con tus tarjetas de Crédito o Débito Bci.',
    comercio: { nombre: 'Cuerovaca' },
    categorias: [{ titulo: 'Restaurantes' }, { titulo: 'Preferencial' }],
    deal: { discount: { percentage: 40 } },
    scheduling: { dayRecurrence: ['VIERNES'], recurrenceLabel: 'Todos los viernes' },
    fechaTermino: '2026-10-01T02:59:00.000Z',
    tieneFechaTermino: true,
    slug: 'cuerovaca-x1'
  };

  it('usa los campos estructurados de la API', () => {
    expect(mapearOferta(oferta)).toMatchObject({
      establecimiento: 'Cuerovaca',
      descuento: '40% de descuento',
      descripcion: 'Viernes- Vitacura',
      categoria: 'Restaurantes',
      dias_validos: ['viernes'],
      fecha_vencimiento: '2026-09-30',
      tipo_tarjeta: 'ambas',
      url: 'https://www.bci.cl/beneficios/beneficios-bci/detalle/cuerovaca-x1'
    });
  });

  it('cashback y "todos los días" por defecto', () => {
    const d = mapearOferta({ ...oferta, deal: { cashback: { percentage: 0.07, tope: 7000 } }, scheduling: {}, titulo: 'Jumbo' });
    expect(d.descuento).toBe('7% de cashback (tope $7.000)');
    expect(d.dias_validos).toHaveLength(7);
  });
});
