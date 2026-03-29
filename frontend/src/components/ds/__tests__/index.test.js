import { describe, it, expect } from 'vitest';
import * as ds from '../index';

describe('DS index exports', () => {
  it('exports all atom components', () => {
    expect(ds.Button).toBeDefined();
    expect(ds.Badge).toBeDefined();
    expect(ds.Input).toBeDefined();
    expect(ds.Select).toBeDefined();
    expect(ds.Textarea).toBeDefined();
    expect(ds.IconButton).toBeDefined();
    expect(ds.ProgressBar).toBeDefined();
    expect(ds.Spinner).toBeDefined();
  });

  it('exports all molecule components', () => {
    expect(ds.FormField).toBeDefined();
    expect(ds.SearchInput).toBeDefined();
    expect(ds.FilterPills).toBeDefined();
    expect(ds.StatusBadge).toBeDefined();
    expect(ds.StatCard).toBeDefined();
    expect(ds.AlertBox).toBeDefined();
    expect(ds.InfoRow).toBeDefined();
  });

  it('exports all organism components', () => {
    expect(ds.Card).toBeDefined();
    expect(ds.CardHeader).toBeDefined();
    expect(ds.CardBody).toBeDefined();
    expect(ds.Modal).toBeDefined();
    expect(ds.ConfirmDialog).toBeDefined();
    expect(ds.DeleteDialog).toBeDefined();
    expect(ds.DataTable).toBeDefined();
    expect(ds.PageHeader).toBeDefined();
    expect(ds.EmptyState).toBeDefined();
  });

  it('exports LoadingSpinner alias', () => {
    expect(ds.LoadingSpinner).toBeDefined();
    expect(ds.LoadingSpinner).toBe(ds.Spinner);
  });
});
