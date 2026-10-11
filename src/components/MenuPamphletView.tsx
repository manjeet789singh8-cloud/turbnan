import React, { useState } from 'react';
import { Plus, Phone, MapPin, Clock, Truck } from 'lucide-react';
import { MENU_ITEMS, MenuItem, RESTAURANT_INFO, MenuCategoryId } from '../data/menuData';

interface MenuPamphletViewProps {
  onAddToCart: (item: MenuItem, variant?: 'Half' | 'Full') => void;
  jainHighlightEnabled: boolean;
}

export const MenuPamphletView: React.FC<MenuPamphletViewProps> = ({
  onAddToCart,
  jainHighlightEnabled,
}) => {
  const [activeSheet, setActiveSheet] = useState<'all' | 'sheet1' | 'sheet2'>('all');

  const getItemsByCategory = (cat: MenuCategoryId) =>
    MENU_ITEMS.filter((item) => item.category === cat);

  const renderSectionBanner = (title: string) => (
    <div className="my-4 flex items-center justify-center">
      <div className="relative bg-amber-400 text-neutral-950 font-bold tracking-wider text-sm px-6 py-1.5 uppercase shadow-sm">
        <span>{title}</span>
      </div>
    </div>
  );

  const renderMenuRows = (category: MenuCategoryId) => {
    const items = getItemsByCategory(category);
    return (
      <div className="divide-y divide-white/[0.06]">
        {items.map((item) => {
          const isHighlighted = jainHighlightEnabled && item.isJainAvailable;
          return (
            <div
              key={item.id}
              className={`group flex items-center justify-between py-2 px-2 rounded transition-colors hover:bg-white/[0.04] ${
                isHighlighted ? 'bg-emerald-950/20' : ''
              }`}
            >
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-100 group-hover:text-amber-400 transition-colors">
                    {item.name}
                  </span>
                  {item.isJainAvailable && jainHighlightEnabled && (
                    <span className="text-[11px] text-emerald-400">· Jain Option</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="font-mono tabular-nums text-sm font-semibold text-neutral-200">
                  {item.priceLabel ? 'MRP' : `${item.price}/-`}
                </span>
                <button
                  type="button"
                  onClick={() => onAddToCart(item, 'Full')}
                  title={`Add ${item.name} to order`}
                  className="inline-flex items-center justify-center w-7 h-7 rounded bg-neutral-800 text-neutral-200 hover:bg-amber-400 hover:text-neutral-950 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section className="space-y-8">
      {/* Header & Sheet Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-white/[0.08]">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-neutral-100">
            Interactive Tri-Fold Menu Pamphlet
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Complete 6-panel digital edition of The Turban Kitchen printed menu card · Click any dish price or plus button to add directly to your order.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-white/[0.08] rounded-lg self-start">
          <button
            type="button"
            onClick={() => setActiveSheet('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeSheet === 'all'
                ? 'bg-amber-400 text-neutral-950 font-semibold'
                : 'text-neutral-400 hover:text-neutral-100'
            }`}
          >
            All 6 Panels
          </button>
          <button
            type="button"
            onClick={() => setActiveSheet('sheet1')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeSheet === 'sheet1'
                ? 'bg-amber-400 text-neutral-950 font-semibold'
                : 'text-neutral-400 hover:text-neutral-100'
            }`}
          >
            Sheet 1 (Main Course & Drinks)
          </button>
          <button
            type="button"
            onClick={() => setActiveSheet('sheet2')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeSheet === 'sheet2'
                ? 'bg-amber-400 text-neutral-950 font-semibold'
                : 'text-neutral-400 hover:text-neutral-100'
            }`}
          >
            Sheet 2 (Chinese, Tandoori & Breads)
          </button>
        </div>
      </div>

      {/* SHEET 1: Brand Cover + Beverages/Soup/Continental + Main Course/Momos */}
      {(activeSheet === 'all' || activeSheet === 'sheet1') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Menu Card — Sheet 01 (Front & Inner Fold)</span>
            <span>All prices in INR (₹)</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panel 1: Brand Cover */}
            <div className="bg-[#18191D] border border-white/[0.08] rounded-xl p-6 flex flex-col justify-between">
              <div className="text-center space-y-5">
                <p className="text-xl sm:text-2xl font-bold text-neutral-100 tracking-wide leading-snug">
                  {RESTAURANT_INFO.hindiMotto}
                </p>

                <div className="py-6 px-4 border-y border-amber-400/30 space-y-2">
                  <div className="text-xs tracking-[0.25em] text-amber-400 uppercase">
                    THE
                  </div>
                  <div className="font-display text-4xl font-bold tracking-wider text-neutral-100">
                    TURBAN
                  </div>
                  <div className="text-sm tracking-[0.3em] text-amber-400 uppercase">
                    KITCHEN
                  </div>
                  <p className="text-xs text-neutral-400 pt-2">
                    {RESTAURANT_INFO.tagline}
                  </p>
                </div>

                <div className="py-3 px-4 bg-emerald-950/50 border border-emerald-500/30 rounded-lg">
                  <p className="text-sm font-bold text-emerald-400 tracking-wide uppercase">
                    100% Pure Vegetarian
                  </p>
                  <p className="text-base font-semibold text-neutral-100 mt-0.5">
                    Family Restaurant
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.08] text-center space-y-3">
                <div className="space-y-1">
                  <p className="text-base font-bold text-neutral-100 italic">
                    Free Home Delivery Within 3 Km.
                  </p>
                  <p className="text-xs font-mono text-emerald-400">
                    *100% Free delivery on all orders within 3 Km
                  </p>
                  <p className="text-sm font-bold text-amber-400 pt-1">
                    {RESTAURANT_INFO.hours}
                  </p>
                </div>

                <div className="pt-3 border-t border-amber-400/30 space-y-1 font-mono tabular-nums text-sm text-neutral-100">
                  <p className="font-bold text-base">{RESTAURANT_INFO.mobile}</p>
                  <p>{RESTAURANT_INFO.landlines[0]}</p>
                  <p>{RESTAURANT_INFO.landlines[1]}</p>
                  <p className="font-sans text-xs text-neutral-300 pt-1">
                    {RESTAURANT_INFO.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Panel 2: Beverages, Soup, Continental & Sandwich */}
            <div className="bg-[#18191D] border border-white/[0.08] rounded-xl p-6 space-y-5">
              <div>
                {renderSectionBanner('BEVERAGES')}
                {renderMenuRows('beverages')}
              </div>
              <div>
                {renderSectionBanner('SOUP')}
                {renderMenuRows('soup')}
              </div>
              <div>
                {renderSectionBanner('CONTINENTAL & SANDWICH')}
                {renderMenuRows('continental_sandwich')}
              </div>
            </div>

            {/* Panel 3: Main Course & Momos */}
            <div className="bg-[#18191D] border border-white/[0.08] rounded-xl p-6 space-y-5">
              <div>
                {renderSectionBanner('MAIN COURSE')}
                {renderMenuRows('main_course')}
              </div>
              <div>
                {renderSectionBanner('MOMOS')}
                {renderMenuRows('momos')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHEET 2: Chinese/Tandoori + Rice/Breads/Salad + Sweet/Burger/Outlets */}
      {(activeSheet === 'all' || activeSheet === 'sheet2') && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Menu Card — Sheet 02 (Inside Spread & Outlet Directory)</span>
            <span>Click + on any item to add to cart</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panel 4: Chinese & Tandoori Khazana */}
            <div className="bg-[#18191D] border border-white/[0.08] rounded-xl p-6 space-y-5">
              <div>
                {renderSectionBanner('CHINESE')}
                {renderMenuRows('chinese')}
              </div>
              <div>
                {renderSectionBanner('TANDOORI KHAZANA')}
                {renderMenuRows('tandoori_khazana')}
              </div>
            </div>

            {/* Panel 5: Rice & Pulao, Breads, Salad & Raita */}
            <div className="bg-[#18191D] border border-white/[0.08] rounded-xl p-6 space-y-5">
              <div>
                {renderSectionBanner('RICE & PULAO')}
                {renderMenuRows('rice_pulao')}
              </div>
              <div>
                {renderSectionBanner('BREADS')}
                {renderMenuRows('breads')}
              </div>
              <div>
                {renderSectionBanner('SALAD & RAITA')}
                {renderMenuRows('salad_raita')}
              </div>
            </div>

            {/* Panel 6: Sweet & Desserts, Burger, Outlets */}
            <div className="bg-[#18191D] border border-white/[0.08] rounded-xl p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-5">
                <div>
                  {renderSectionBanner('SWEET & DESSERTS')}
                  {renderMenuRows('sweet_desserts')}
                </div>
                <div>
                  {renderSectionBanner('BURGER')}
                  {renderMenuRows('burger')}
                </div>
              </div>

              {/* Outlets Box from Sheet 2 */}
              <div className="pt-4">
                {renderSectionBanner('OUTLETS')}
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-5 space-y-4 text-center">
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-neutral-100 flex items-center justify-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{RESTAURANT_INFO.address}</span>
                    </p>
                    <p className="text-sm font-mono tabular-nums font-semibold text-neutral-100 flex items-center justify-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Mob: {RESTAURANT_INFO.mobile}</span>
                    </p>
                    <p className="text-xs font-mono tabular-nums text-neutral-300">
                      Phone: {RESTAURANT_INFO.landlines[0]} · {RESTAURANT_INFO.landlines[1]}
                    </p>
                  </div>

                  <div className="py-3 px-3 bg-neutral-950/80 rounded-lg border border-white/[0.06] space-y-1">
                    <p className="text-sm font-bold text-neutral-100 flex items-center justify-center gap-1.5">
                      <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Free Home Delivery Within 3 Km.</span>
                    </p>
                    <p className="text-xs font-mono text-emerald-400">
                      *100% Free delivery on all orders within 3 Km
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-amber-400 font-semibold text-sm">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>{RESTAURANT_INFO.hours}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
