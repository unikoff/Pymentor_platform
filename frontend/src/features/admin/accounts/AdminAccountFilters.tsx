import { RotateCcw, Search } from "lucide-react";
import { getMonthTitle } from "../../../shared/lib/dates";
import type { AdminAccountFilters as Filters } from "../../../shared/api/contracts/admin";
import type { CalendarMonth } from "../../../shared/api/contracts/account";

export function AdminAccountFilters({ search, filters, month, onSearch, onChange }: {
  search: string; filters: Filters; month: CalendarMonth;
  onSearch: (value: string) => void; onChange: (value: Filters) => void;
}) {
  return (
    <div className="admin-filters" role="group" aria-label="Фильтры аккаунтов">
      <label className="admin-search">
        <Search size={16} aria-hidden="true" />
        <input value={search} onChange={(event) => onSearch(event.target.value)}
          placeholder="Поиск по имени или email" aria-label="Поиск по имени или email" />
      </label>
      <div className="admin-filters__options">
        <label className="admin-filter-field">
          <span>Подписка</span>
          <select value={filters.subscription}
            onChange={(event) => onChange({ ...filters, subscription: event.target.value as Filters["subscription"] })}>
            <option value="all">Все подписки</option>
            <option value="active">Активна</option>
            <option value="inactive">Не активна</option>
          </select>
        </label>
        <label className="admin-filter-field">
          <span>Занятия · {getMonthTitle(month)}</span>
          <select value={filters.lessons}
            onChange={(event) => onChange({ ...filters, lessons: event.target.value as Filters["lessons"] })}>
            <option value="all">Любой остаток</option>
            <option value="none">Нет занятий</option>
            <option value="low">От 1 до 3</option>
            <option value="many">4 и больше</option>
          </select>
        </label>
        {(search || filters.subscription !== "all" || filters.lessons !== "all") && (
          <button className="admin-filters__reset" type="button" onClick={() => {
            onSearch(""); onChange({ subscription: "all", lessons: "all" });
          }}><RotateCcw size={14} aria-hidden="true" /> Очистить</button>
        )}
      </div>
    </div>
  );
}
