// src/components/public/PublicApp.jsx
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { CreditCard, Lock, Search, SlidersHorizontal, X } from 'lucide-react';
import { useIsMobile, useFilteredDescuentos, useDebouncedValue } from '../shared/hooks';
import {
  asignarLogos,
  coincideConTarjetas,
  contarOpciones,
  contarTarjetas,
  enriquecerConBanco,
  getDiaActual,
  normalizar,
  DIAS_SEMANA,
  FILTROS_INICIALES
} from '../../utils/descuentos';
import DescuentoCard from './DescuentoCard';
import DescuentoDetalle from './DescuentoDetalle';
import FilterModal from './FilterModal';
import MisTarjetas from './MisTarjetas';
import { guardarMisTarjetas, leerMisTarjetas } from '../../utils/storage';

const POR_PAGINA = 60;

const TIPO_LABEL = { debito: 'Débito', credito: 'Crédito' };
const DIA_CORTO = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const formatActualizado = (iso) =>
  new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }).replace('.', '');

const Logo = () => (
  <div className="flex items-center gap-2.5">
    <span className="w-6 h-6 bg-volt grid place-items-center" aria-hidden="true">
      <span className="font-mono text-[13px] font-bold text-ink-950 leading-none">%</span>
    </span>
    <span className="font-mono text-sm font-semibold tracking-[0.18em] text-fg">
      CARD<span className="text-volt">/</span>DISCOUNT
    </span>
  </div>
);

const PublicApp = ({ bancos = [], descuentos = [], cargando = false, actualizado, onLoginClick, showLoginButton }) => {
  const hoy = getDiaActual();
  // Al abrir se muestran los descuentos de hoy
  const inicio = useMemo(() => ({ ...FILTROS_INICIALES, dia: hoy }), [hoy]);
  const [filtros, setFiltros] = useState(inicio);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const buscador = useRef(null);
  const isMobile = useIsMobile();
  // Al escribir se espera un poco antes de filtrar; al borrar se aplica al instante.
  const busquedaDebounced = useDebouncedValue(busqueda);
  const busquedaEfectiva = busqueda === '' ? '' : busquedaDebounced;

  const bancosActivos = useMemo(() => bancos.filter((b) => b.activo !== false), [bancos]);
  const descuentosConBanco = useMemo(() => asignarLogos(enriquecerConBanco(descuentos, bancos)), [descuentos, bancos]);

  // Mis tarjetas: si el usuario marcó las suyas, por defecto ve solo esos descuentos
  const [mis, setMis] = useState(() => leerMisTarjetas() || { tarjetas: {}, soloMias: true });
  const [mostrarTarjetas, setMostrarTarjetas] = useState(false);
  const cantidadTarjetas = contarTarjetas(mis.tarjetas);
  const soloMias = cantidadTarjetas > 0 && mis.soloMias;
  const actualizarMis = (siguiente) => {
    setMis(siguiente);
    guardarMisTarjetas(siguiente.tarjetas, siguiente.soloMias);
  };
  const guardarTarjetas = (tarjetas) => {
    actualizarMis({ tarjetas, soloMias: true });
    setMostrarTarjetas(false);
  };
  const cerrarTarjetas = useCallback(() => setMostrarTarjetas(false), []);
  // Bancos con descuentos, para elegir tarjetas
  const bancosConDescuentos = useMemo(() => {
    const conteo = new Map();
    descuentosConBanco.forEach((d) => conteo.set(normalizar(d.banco_nombre), (conteo.get(normalizar(d.banco_nombre)) || 0) + 1));
    return bancosActivos
      .map((b) => ({ ...b, banco_color: b.color, cantidad: conteo.get(normalizar(b.nombre)) || 0 }))
      .filter((b) => b.cantidad > 0)
      .sort((a, b) => b.cantidad - a.cantidad || a.nombre.localeCompare(b.nombre, 'es'));
  }, [descuentosConBanco, bancosActivos]);

  const base = useMemo(
    () => (soloMias ? descuentosConBanco.filter((d) => coincideConTarjetas(d, mis.tarjetas)) : descuentosConBanco),
    [descuentosConBanco, soloMias, mis.tarjetas]
  );
  const descuentosFiltrados = useFilteredDescuentos(base, filtros, busquedaEfectiva);

  // Opciones de los filtros con cuántos descuentos quedarían al elegirlas. Se
  // ocultan las que no tienen ninguno, salvo la que está elegida.
  const categorias = useMemo(() => {
    const conteo = contarOpciones(base, filtros, busquedaEfectiva, 'categoria');
    const nombres = new Map(base.map((d) => [normalizar(d.categoria), d.categoria]));
    return [...conteo]
      .filter(([clave]) => clave)
      .map(([clave, cantidad]) => ({ valor: nombres.get(clave), cantidad }))
      .concat(
        filtros.categoria !== 'todas' && !conteo.has(normalizar(filtros.categoria))
          ? [{ valor: filtros.categoria, cantidad: 0 }]
          : []
      )
      .sort((a, b) => b.cantidad - a.cantidad || a.valor.localeCompare(b.valor, 'es'));
  }, [base, filtros, busquedaEfectiva]);

  const opcionesBancos = useMemo(() => {
    const conteo = contarOpciones(base, filtros, busquedaEfectiva, 'banco_nombre');
    return bancosActivos
      .map((b) => ({ valor: b.nombre, cantidad: conteo.get(normalizar(b.nombre)) || 0 }))
      .filter((b) => b.cantidad > 0 || normalizar(b.valor) === normalizar(filtros.banco))
      .sort((a, b) => b.cantidad - a.cantidad || a.valor.localeCompare(b.valor, 'es'));
  }, [base, bancosActivos, filtros, busquedaEfectiva]);

  const elegirCategoria = (categoria) =>
    setFiltros((prev) => ({
      ...prev,
      categoria: normalizar(prev.categoria) === normalizar(categoria) ? FILTROS_INICIALES.categoria : categoria
    }));
  const elegirDia = (dia) => setFiltros((prev) => ({ ...prev, dia }));

  // Se muestran de a POR_PAGINA para que la lista sea fluida con cientos de descuentos
  const [visibles, setVisibles] = useState(POR_PAGINA);
  useEffect(() => setVisibles(POR_PAGINA), [filtros, busquedaEfectiva, soloMias]);

  // "/" enfoca el buscador (como en las herramientas de desarrollo)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '/' || e.target.closest?.('input, textarea, select')) return;
      e.preventDefault();
      buscador.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filtrosActivos = Object.entries(filtros).filter(([key, value]) => value !== FILTROS_INICIALES[key]);
  // Día y categoría se ven arriba; aquí solo los que se eligen en el panel
  const etiquetas = filtrosActivos.filter(([key]) => key === 'banco' || key === 'tipo');
  const hayFiltros = busqueda !== '' || Object.keys(inicio).some((key) => filtros[key] !== inicio[key]);
  const cerrarFiltros = useCallback(() => setMostrarFiltros(false), []);

  // Ficha de detalle. Se guarda en el historial (#id) para que el botón "atrás"
  // del teléfono la cierre y para que un enlace compartido la abra directo.
  const [detalleId, setDetalleId] = useState(() => decodeURIComponent(window.location.hash.slice(1)) || null);
  const detalle = useMemo(
    () => (detalleId ? descuentosConBanco.find((d) => String(d.id) === detalleId) || null : null),
    [descuentosConBanco, detalleId]
  );
  const abrirDetalle = useCallback((d) => {
    window.history.pushState({ detalle: true }, '', `#${encodeURIComponent(d.id)}`);
    setDetalleId(String(d.id));
  }, []);
  const cerrarDetalle = useCallback(() => {
    if (window.history.state?.detalle) window.history.back();
    else {
      // Se abrió desde un enlace: no hay a dónde volver, se limpia la dirección
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      setDetalleId(null);
    }
  }, []);
  useEffect(() => {
    const onPop = () => setDetalleId(decodeURIComponent(window.location.hash.slice(1)) || null);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const limpiarTodo = () => {
    setFiltros(inicio);
    setBusqueda('');
  };
  const verTodos = () => {
    setFiltros(FILTROS_INICIALES);
    setBusqueda('');
  };

  const total = descuentosFiltrados.length;
  const resumen = useMemo(
    () => ({
      bancos: new Set(descuentosFiltrados.map((d) => d.banco_nombre)).size,
      delivery: descuentosFiltrados.filter((d) => d.es_delivery).length
    }),
    [descuentosFiltrados]
  );
  const cuando =
    filtros.dia === 'todos' ? 'vigentes esta semana' : filtros.dia === hoy ? 'disponibles hoy' : `para el ${filtros.dia}`;
  const subtitulo = soloMias ? `${cuando} con tus tarjetas` : cuando;

  return (
    <div className="min-h-screen fondo-grilla text-fg">
      <header className="sticky top-0 z-40 bg-ink-950/85 backdrop-blur-md border-b border-line pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-4">
            {actualizado && (
              <span className="rotulo text-fg-dim hidden sm:inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-volt animate-parpadeo" aria-hidden="true" />
                Sync {formatActualizado(actualizado)}
              </span>
            )}
            {showLoginButton && (
              <button
                onClick={onLoginClick}
                className="rotulo text-fg-muted hover:text-fg inline-flex items-center gap-1.5 transition-colors"
              >
                <Lock size={12} aria-hidden="true" />
                Admin
              </button>
            )}
          </div>
        </div>
      </header>

      <DescuentoDetalle descuento={detalle} onCerrar={cerrarDetalle} />

      <MisTarjetas
        mostrar={mostrarTarjetas}
        onClose={cerrarTarjetas}
        bancos={bancosConDescuentos}
        tarjetas={mis.tarjetas}
        onGuardar={guardarTarjetas}
      />

      <FilterModal
        mostrar={mostrarFiltros}
        onClose={cerrarFiltros}
        filtros={filtros}
        setFiltros={setFiltros}
        bancos={opcionesBancos}
        categorias={categorias}
        total={total}
      />

      <section className="max-w-7xl mx-auto px-4 pt-8 md:pt-14 pb-5">
        <p className="rotulo text-volt mb-3">// Descuentos con tarjeta · Chile</p>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.02]">
          <span className="text-volt tabular">{cargando ? '···' : total}</span> descuentos
          <br />
          <span className="text-fg-dim">{subtitulo}.</span>
        </h1>

        {/* Mis tarjetas */}
        {cantidadTarjetas === 0 ? (
          <div className="mt-6 border border-dashed border-volt/40 p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div>
              <p className="font-medium">¿Qué tarjetas tienes?</p>
              <p className="text-sm text-fg-muted">Márcalas y te mostramos solo los descuentos que puedes usar.</p>
            </div>
            <button
              onClick={() => setMostrarTarjetas(true)}
              className="rotulo bg-volt text-ink-950 font-semibold px-4 h-11 inline-flex items-center justify-center gap-2 hover:brightness-110 transition flex-shrink-0"
            >
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              Elegir mis tarjetas
            </button>
          </div>
        ) : (
          <div className="mt-6 flex items-center gap-3 flex-wrap">
            <div className="inline-flex border border-line bg-ink-900" role="group" aria-label="Qué descuentos ver">
              {[
                [true, `Mis tarjetas (${cantidadTarjetas})`],
                [false, 'Todas']
              ].map(([valor, label]) => (
                <button
                  key={label}
                  onClick={() => actualizarMis({ ...mis, soloMias: valor })}
                  aria-pressed={soloMias === valor}
                  className={`rotulo px-3 md:px-4 h-10 border-r border-line last:border-r-0 transition-colors ${
                    soloMias === valor ? 'bg-volt text-ink-950 font-semibold' : 'text-fg-muted hover:text-fg hover:bg-ink-850'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setMostrarTarjetas(true)}
              className="rotulo text-fg-dim hover:text-fg underline underline-offset-4"
            >
              Editar tarjetas
            </button>
          </div>
        )}

        {/* Selector de día */}
        <div className="mt-7">
          <div className="grid grid-cols-8 md:inline-grid border border-line bg-ink-900" role="group" aria-label="Día">
            {[['todos', 'Todos'], ...DIAS_SEMANA.map((d, i) => [d, DIA_CORTO[i]])].map(([valor, label]) => {
              const activo = filtros.dia === valor;
              return (
                <button
                  key={valor}
                  onClick={() => elegirDia(valor)}
                  aria-pressed={activo}
                  className={`relative rotulo !tracking-[0.02em] md:!tracking-[0.12em] md:px-4 py-2.5 border-r border-line last:border-r-0 transition-colors ${
                    activo ? 'bg-volt text-ink-950 font-semibold' : 'text-fg-muted hover:text-fg hover:bg-ink-850'
                  }`}
                >
                  {label}
                  {valor === hoy && (
                    <>
                      <span
                        className={`absolute left-1/2 -translate-x-1/2 bottom-1 w-1 h-1 ${activo ? 'bg-ink-950' : 'bg-volt'}`}
                        aria-hidden="true"
                      />
                      <span className="sr-only"> (hoy)</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Buscador + filtros */}
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-dim z-10 pointer-events-none"
              aria-hidden="true"
            />
            <input
              ref={buscador}
              type="search"
              aria-label="Buscar descuentos"
              placeholder={isMobile ? 'Buscar comercio, banco…' : 'Buscar por comercio, banco o categoría…'}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setBusqueda('')}
              className="w-full h-11 bg-ink-900 border border-line focus:border-volt/60 pl-10 pr-12 text-[15px] text-fg placeholder:text-fg-dim outline-none transition-colors"
            />
            {!isMobile && !busqueda && (
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-fg-dim border border-line px-1.5 py-0.5 pointer-events-none">
                /
              </kbd>
            )}
          </div>
          <button
            onClick={() => setMostrarFiltros(true)}
            className="h-11 px-3.5 md:px-4 inline-flex items-center gap-2 bg-ink-900 border border-line hover:border-line-strong text-fg-muted hover:text-fg transition-colors"
            aria-label={`Filtros${etiquetas.length ? ` (${etiquetas.length} activos)` : ''}`}
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            <span className="rotulo hidden sm:inline">Filtros</span>
            {etiquetas.length > 0 && (
              <span className="font-mono text-[11px] bg-volt text-ink-950 px-1.5 leading-5">{etiquetas.length}</span>
            )}
          </button>
        </div>

        {/* Categorías */}
        {categorias.length > 1 && (
          <div className="mt-3 -mx-4 px-4 flex gap-1.5 overflow-x-auto scrollbar-hide" role="group" aria-label="Categorías">
            {categorias.map(({ valor, cantidad }) => {
              const activa = normalizar(filtros.categoria) === normalizar(valor);
              return (
                <button
                  key={valor}
                  onClick={() => elegirCategoria(valor)}
                  aria-pressed={activa}
                  className={`flex-shrink-0 inline-flex items-center gap-2 px-3 h-8 text-[13px] border transition-colors ${
                    activa
                      ? 'bg-volt border-volt text-ink-950 font-medium'
                      : 'border-line text-fg-muted hover:text-fg hover:border-line-strong'
                  }`}
                >
                  {valor}
                  <span className={`font-mono text-[11px] tabular ${activa ? 'text-ink-950/60' : 'text-fg-dim'}`}>
                    {cantidad}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Resumen y filtros activos */}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2" aria-live="polite">
          <span className="rotulo text-fg-dim tabular">
            <span className="text-fg">{total}</span> resultados
            <span className="mx-2 text-line-strong">/</span>
            <span className="text-fg">{resumen.bancos}</span> bancos
            <span className="mx-2 text-line-strong">/</span>
            <span className="text-fg">{resumen.delivery}</span> delivery
          </span>
          {etiquetas.map(([key, value]) => (
            <button
              key={key}
              onClick={() => setFiltros((prev) => ({ ...prev, [key]: FILTROS_INICIALES[key] }))}
              className="rotulo inline-flex items-center gap-1.5 border border-volt/40 text-volt px-2 py-1 hover:bg-volt-dim transition-colors"
              aria-label={`Quitar filtro: ${TIPO_LABEL[value] || value}`}
            >
              {TIPO_LABEL[value] || value}
              <X size={11} aria-hidden="true" />
            </button>
          ))}
          {hayFiltros && (
            <button onClick={limpiarTodo} className="rotulo text-fg-dim hover:text-fg underline underline-offset-4">
              Limpiar todo
            </button>
          )}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 pb-12">
        {cargando ? (
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Cargando descuentos">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-72 border border-line bg-ink-900 animate-pulse" />
            ))}
          </div>
        ) : total === 0 ? (
          <div className="border border-dashed border-line-strong py-16 px-6 text-center">
            <p className="font-mono text-5xl text-fg-dim mb-4">0</p>
            <h2 className="text-lg font-medium mb-1">Sin resultados</h2>
            <p className="text-fg-muted text-sm mb-6">
              {soloMias
                ? 'Con tus tarjetas no hay descuentos para esta búsqueda. Prueba con otro día o mira los de todas las tarjetas.'
                : 'Prueba con otro día, otra categoría o una búsqueda más corta.'}
            </p>
            {soloMias && (
              <button
                onClick={() => actualizarMis({ ...mis, soloMias: false })}
                className="rotulo border border-line text-fg-muted hover:text-fg px-5 py-3 mb-3 mr-2 transition-colors"
              >
                Ver todas las tarjetas
              </button>
            )}
            {(hayFiltros || filtros.dia !== 'todos') && (
              <button
                onClick={verTodos}
                className="rotulo bg-volt text-ink-950 font-semibold px-5 py-3 hover:brightness-110 transition"
              >
                Ver todos los descuentos
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {descuentosFiltrados.slice(0, visibles).map((descuento) => (
                <DescuentoCard key={descuento.id} descuento={descuento} onAbrir={abrirDetalle} />
              ))}
            </div>

            {total > visibles && (
              <button
                onClick={() => setVisibles((v) => v + POR_PAGINA)}
                className="mt-3 w-full border border-line hover:border-volt/50 hover:text-volt text-fg-muted py-4 rotulo transition-colors"
              >
                Cargar {Math.min(POR_PAGINA, total - visibles)} más
                <span className="text-fg-dim ml-2">· quedan {total - visibles}</span>
              </button>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-line">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row gap-2 justify-between rotulo text-fg-dim pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <span>CardDiscount · Chile</span>
          {actualizado && (
            <span>
              Datos del{' '}
              {new Date(actualizado).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
        </div>
      </footer>
    </div>
  );
};

export default PublicApp;
