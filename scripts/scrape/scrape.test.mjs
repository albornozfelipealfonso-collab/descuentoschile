import { describe, it, expect } from 'vitest';
import {
  extraerArreglos,
  extraerDias,
  extraerFecha,
  extraerFechaTermino,
  extraerTipoTarjeta,
  idEstable,
  inferirCategoria,
  limpiarTexto,
  recortar
} from './lib.mjs';
import { validarResultado } from './index.mjs';
import { mapearBeneficio as spinMapear } from './bancos/spin.mjs';
import { mapearBeneficio as machMapear } from './bancos/mach.mjs';
import { mapearBeneficio as ripleyMapear } from './bancos/ripley.mjs';
import { mapearBeneficio as cencosudMapear, esDescuento as esDescuentoCencosud } from './bancos/cencosud.mjs';
import { mapearBeneficio as biceMapear, textoDescuento as biceTexto } from './bancos/bice.mjs';

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
  it('recortar corta en un espacio y agrega "…"', () => {
    expect(recortar('corto', 10)).toBe('corto');
    expect(recortar('uno dos tres cuatro', 14)).toBe('uno dos tres…');
    expect(recortar('uno dos tres cuatro', 14).length).toBeLessThanOrEqual(14);
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

  it('usa benefitTitle cuando el título es genérico', () => {
    const d = mapearTarjeta({ ...item, benefitTitle: 'Cuerovaca', benefitCard: { ...item.benefitCard, title: 'Dcto en Restaurante' } });
    expect(d.establecimiento).toBe('Cuerovaca');
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

describe('fechas y días (casos de los bancos nuevos)', () => {
  it('"todos los días martes" es solo martes', () => {
    expect(extraerDias('Todos los días martes obtén un descuento')).toEqual(['martes']);
    expect(extraerDias('Válido todos los días')).toHaveLength(7);
  });
  it('extraerFecha acepta años de 2 dígitos', () => {
    expect(extraerFecha('válida desde el 01/09/26 al 30/09/26')).toBe('2026-09-01');
  });
  it('extraerFechaTermino toma la fecha final', () => {
    expect(extraerFechaTermino('Válido entre el 01/01/2026 hasta el 30/09/2026')).toBe('2026-09-30');
    expect(extraerFechaTermino('Promoción válida desde el 01/09/26 al 30/09/26')).toBe('2026-09-30');
    expect(extraerFechaTermino('Desde el 18 de junio de 2024')).toBe('');
  });
  it('extraerFechaTermino sin año usa el próximo', () => {
    expect(extraerFechaTermino('Hasta el 30 de septiembre', new Date(2026, 8, 24))).toBe('2026-09-30');
    expect(extraerFechaTermino('Hasta el 15 de enero', new Date(2026, 8, 24))).toBe('2027-01-15');
  });
  it('extraerArreglos une los arreglos de una clave aunque haya texto con corchetes', () => {
    const payload = '{"benefits":[{"t":"a ] b"}],"x":1,"benefits":[{"t":"c"}]}';
    expect(extraerArreglos(payload, 'benefits')).toEqual([{ t: 'a ] b' }, { t: 'c' }]);
  });
});

describe('Spin', () => {
  it('reconoce el comercio y los días en el texto', () => {
    const d = spinMapear({
      id: 26,
      details: {
        title: '40% de Descuento en Burger King',
        description: 'En tu compra presencial.',
        legalText: '40% de descuento los días miércoles en locales Burger King adheridos',
        validityText: 'Válido entre el 01/01/2026 hasta el 30/09/2026'
      }
    });
    expect(d).toMatchObject({
      establecimiento: 'Burger King',
      categoria: 'Restaurantes',
      dias_validos: ['miércoles'],
      fecha_vencimiento: '2026-09-30',
      tipo_tarjeta: 'credito'
    });
  });
  it('sin comercio reconocible es de Cruz Verde', () => {
    expect(spinMapear({ id: 1, details: { title: '7% de descuento adicional', description: '' } }).establecimiento).toBe(
      'Cruz Verde'
    );
  });
});

describe('MACH', () => {
  const entrada = {
    meta: { uuid: 'u1', category_name: 'Market' },
    fields: {
      titulo: "40% de descuento en la App McDonald's con Tarjeta de Crédito",
      descripcion: 'Todos los martes.',
      nombre_de_empresa: "McDonald's",
      dia_de_promo: ['martes'],
      medio_de_pago: ['crédito'],
      logo_de_empresa: { url: 'https://cdn3.bci.cl/logo.webp' }
    }
  };
  it('usa los campos del CMS', () => {
    expect(machMapear(entrada)).toMatchObject({
      establecimiento: "McDonald's",
      tipo_tarjeta: 'credito',
      dias_validos: ['martes'],
      logo: 'https://cdn3.bci.cl/logo.webp'
    });
  });
  it('si el "comercio" es un día, usa el título', () => {
    const d = machMapear({ ...entrada, fields: { ...entrada.fields, nombre_de_empresa: 'Miércoles' } });
    expect(d.establecimiento).toBe(entrada.fields.titulo);
  });
});

describe('Banco Ripley', () => {
  const v = (value) => ({ value });
  it('mapea un beneficio de Restofans', () => {
    const d = ripleyMapear({
      config: { id: 'r1' },
      params: {
        txtNameComercio: v('Pastamore'),
        txtDescuento: v('40% dcto'),
        txtSubtitulo: v('Italiana'),
        txtDetalleCard: v('R.M. (Vitacura)'),
        txtValidezBeneficio: v('Martes'),
        imgLogo: v('https://img/logo.png'),
        details: { txtLegal: v('Promoción válida desde el 01/09/26 al 30/09/26') },
        boxRestricciones: { boxTarjetas: { valueBox: 'creditBlack,credit' }, boxConsumo: { valueBox: 'consumo_local' } }
      }
    });
    expect(d).toMatchObject({
      establecimiento: 'Pastamore',
      descuento: '40% de descuento',
      descripcion: 'Italiana · R.M. (Vitacura)',
      tipo_tarjeta: 'credito',
      dias_validos: ['martes'],
      fecha_vencimiento: '2026-09-30',
      es_delivery: false
    });
  });
});

describe('Cencosud', () => {
  const b = {
    id: 6,
    is_active: true,
    title: 'Todos domingos 25% de descuento en Papa Johns',
    short_description: 'Compra tu pizza con tu Tarjeta Cencosud Scotiabank',
    legal_text: '$16',
    categories: ['mastercard', 'comida'],
    url: 'https://www.tarjetacencosud.cl/publico/beneficios/landing/papa-johns'
  };
  it('el comercio sale de la dirección', () => {
    expect(cencosudMapear(b)).toMatchObject({ establecimiento: 'Papa Johns', dias_validos: ['domingo'], terminos: '' });
  });
  it('en páginas genéricas busca el comercio en el texto', () => {
    const d = cencosudMapear({
      ...b,
      title: '20% dcto. el mes de tu cumpleaños',
      short_description: 'En tiendas Paris categorías vestuario',
      url: 'https://www.tarjetacencosud.cl/publico/beneficios/landing/momento-black'
    });
    expect(d.establecimiento).toBe('Paris');
  });
  it('descarta seguros, donaciones y beneficios sin cifra', () => {
    expect(esDescuentoCencosud(b)).toBe(true);
    expect(esDescuentoCencosud({ ...b, categories: ['donaciones'] })).toBe(false);
    expect(esDescuentoCencosud({ ...b, title: 'Programa de Puntos', short_description: 'Acumula' })).toBe(false);
  });
});

describe('Banco BICE', () => {
  const f = (big, small) => ({ 'Texto-promo-big': big, 'Texto-promo-small': small });
  it('textoDescuento completa la cifra solo cuando el texto chico la complementa', () => {
    expect(biceTexto(f('Hasta', '7,5%'))).toBe('Hasta 7,5%');
    expect(biceTexto(f('40%', 'Presencial'))).toBe('40%');
    expect(biceTexto(f('$100', 'dcto. por litro'))).toBe('$100 de descuento por litro');
    expect(biceTexto(f('20% de dcto.', 'Online'))).toBe('20% de descuento');
  });
  it('mapea una entrada del widget', () => {
    const d = biceMapear({
      meta: { uuid: 'b1', slug: 'ceze', category_name: 'Shopping' },
      fields: {
        Marca: 'Cezé',
        'Texto-promo-big': '20% de dcto.',
        'Texto-promo-small': 'Online',
        'Bajada-sitio-publico': '<p>20% de dcto. todos los martes en Tienda online</p>',
        'Tipo Tarjeta': ['Débito', 'Crédito'],
        'Fecha-hasta': '2026-12-31T20:00:00.000-03:00',
        Logo: { url: 'https://bice/logo.jpg' }
      }
    });
    expect(d).toMatchObject({
      establecimiento: 'Cezé',
      descuento: '20% de descuento',
      tipo_tarjeta: 'ambas',
      dias_validos: ['martes'],
      fecha_vencimiento: '2026-12-31',
      url: 'https://banco.bice.cl/personas/beneficios/ceze',
      logo: 'https://bice/logo.jpg'
    });
  });
  it('en "Cuotas" el comercio es el título', () => {
    const d = biceMapear({ meta: {}, fields: { Marca: 'Cuotas', 'Titulo-sitio-publico': 'Despegar', 'Texto-promo-big': '3 o 6', 'Texto-promo-small': 'cuotas' } });
    expect(d.establecimiento).toBe('Despegar');
    expect(d.descuento).toBe('3 o 6 cuotas');
  });
});
