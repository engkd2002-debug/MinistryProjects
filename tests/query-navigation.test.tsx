import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useQueryState } from '../src/shared/query/useQueryState';

function QueryHarness() {
  const state = useQueryState();
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div>
      <output data-testid="route">{location.pathname}</output>
      <output data-testid="search">{location.search}</output>
      <output data-testid="diagnostics">{state.diagnostics.length}</output>
      <label>
        Query
        <input
          value={state.query.q}
          onChange={(event) => state.setFilter('q', event.target.value)}
        />
      </label>
      <label>
        Governorate
        <select
          value={state.query.gov}
          onChange={(event) => state.setFilter('gov', event.target.value)}
        >
          <option value="">All</option>
          <option value="DAM">Damascus</option>
          <option value="ALE">Aleppo</option>
          <option value="HOM">Homs</option>
        </select>
      </label>
      <ul aria-label="Active filters">
        {state.activeFilters.map((filter) => (
          <li key={filter.key} data-testid={`filter-${filter.key}`}>
            {filter.value}
            <button onClick={() => state.clearFilter(filter.key)}>Remove {filter.key}</button>
          </li>
        ))}
      </ul>
      <Link to={{ pathname: '/research', search: location.search }}>Research</Link>
      <Link to={{ pathname: '/insights', search: location.search }}>Insights</Link>
      <button onClick={() => navigate(-1)}>Back</button>
      <button onClick={() => navigate(1)}>Forward</button>
      <button onClick={state.reset}>Reset</button>
      <button onClick={() => state.setFilters({ gov: 'ALE', city: 'حلب' })}>Atomic location</button>
      <button
        onClick={() => {
          state.setFilter('q', 'Water المياه');
          state.setFilter('gov', 'DAM');
        }}
      >
        Rapid changes
      </button>
    </div>
  );
}

function setup(initialEntry: string) {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="*" element={<QueryHarness />} />
      </Routes>
    </MemoryRouter>,
  );
  return userEvent.setup();
}

describe('query navigation integration', () => {
  it('commits a geographic drill-down as one history entry without losing other filters', async () => {
    const user = setup('/explorer?gov=DAM&city=%D8%AF%D9%85%D8%B4%D9%82&q=water');
    await user.click(screen.getByRole('button', { name: 'Atomic location' }));
    expect(screen.getByTestId('filter-gov')).toHaveTextContent('ALE');
    expect(screen.getByTestId('filter-city')).toHaveTextContent('حلب');
    expect(screen.getByTestId('filter-q')).toHaveTextContent('water');
    await user.click(screen.getByRole('button', { name: 'Back' }));
    await waitFor(() => expect(screen.getByTestId('filter-gov')).toHaveTextContent('DAM'));
    expect(screen.getByTestId('filter-city')).toHaveTextContent('دمشق');
  });
  it('hydrates controls, preserves query between workspaces and restores facets with Back/Forward', async () => {
    const user = setup('/explorer?q=%D9%85%D9%8A%D8%A7%D9%87&gov=DAM');
    const query = screen.getByRole('textbox', { name: 'Query' });
    const governorate = screen.getByRole('combobox', { name: 'Governorate' });
    expect(query).toHaveValue('مياه');
    expect(governorate).toHaveValue('DAM');
    await user.selectOptions(governorate, 'ALE');
    await user.click(screen.getByRole('link', { name: 'Research' }));
    expect(screen.getByTestId('route')).toHaveTextContent('/research');
    expect(query).toHaveValue('مياه');
    expect(governorate).toHaveValue('ALE');
    await user.selectOptions(governorate, 'HOM');
    expect(governorate).toHaveValue('HOM');
    await user.click(screen.getByRole('button', { name: 'Back' }));
    await waitFor(() => expect(governorate).toHaveValue('ALE'));
    expect(screen.getByTestId('route')).toHaveTextContent('/research');
    await user.click(screen.getByRole('button', { name: 'Back' }));
    await waitFor(() => expect(screen.getByTestId('route')).toHaveTextContent('/explorer'));
    expect(governorate).toHaveValue('ALE');
    await user.click(screen.getByRole('button', { name: 'Back' }));
    await waitFor(() => expect(governorate).toHaveValue('DAM'));
    await user.click(screen.getByRole('button', { name: 'Forward' }));
    await waitFor(() => expect(governorate).toHaveValue('ALE'));
    expect(screen.getByTestId('filter-q')).toHaveTextContent('مياه');
    expect(screen.getByTestId('filter-gov')).toHaveTextContent('ALE');
  });

  it('keeps one canonical filter per input update, removes independently, and resets explicitly', async () => {
    const user = setup('/explorer?gov=DAM');
    const query = screen.getByRole('textbox', { name: 'Query' });
    await user.type(query, 'مياه');
    expect(query).toHaveValue('مياه');
    expect(screen.getAllByTestId('filter-q')).toHaveLength(1);
    expect(screen.getByTestId('filter-q')).toHaveTextContent('مياه');
    expect(new URLSearchParams(screen.getByTestId('search').textContent!).getAll('q')).toEqual([
      'مياه',
    ]);
    await user.click(screen.getByRole('link', { name: 'Insights' }));
    expect(query).toHaveValue('مياه');
    await user.click(screen.getByRole('button', { name: 'Remove q' }));
    expect(query).toHaveValue('');
    expect(screen.queryByTestId('filter-q')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Governorate' })).toHaveValue('DAM');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('combobox', { name: 'Governorate' })).toHaveValue('');
    expect(screen.getByTestId('search')).toBeEmptyDOMElement();
  });

  it('reports unsupported query keys and sanitizes them on the next user change', async () => {
    const user = setup('/research?q=water&role=admin&gov=UNKNOWN');
    expect(screen.getByTestId('diagnostics')).toHaveTextContent('2');
    expect(screen.getByRole('combobox', { name: 'Governorate' })).toHaveValue('');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Governorate' }), 'DAM');
    expect(screen.getByTestId('diagnostics')).toHaveTextContent('0');
    expect(screen.getByRole('textbox', { name: 'Query' })).toHaveValue('water');
    expect(screen.getByTestId('search')).not.toHaveTextContent('role=');
  });

  it('composes rapid query and facet changes before the router commits a render', async () => {
    const user = setup('/explorer');
    await user.click(screen.getByRole('button', { name: 'Rapid changes' }));
    expect(screen.getByRole('textbox', { name: 'Query' })).toHaveValue('Water المياه');
    expect(screen.getByRole('combobox', { name: 'Governorate' })).toHaveValue('DAM');
    const search = new URLSearchParams(screen.getByTestId('search').textContent!);
    expect(search.get('q')).toBe('Water المياه');
    expect(search.get('gov')).toBe('DAM');
    await user.click(screen.getByRole('link', { name: 'Research' }));
    await user.click(screen.getByRole('button', { name: 'Back' }));
    await waitFor(() => expect(screen.getByTestId('route')).toHaveTextContent('/explorer'));
    expect(screen.getByRole('textbox', { name: 'Query' })).toHaveValue('Water المياه');
    expect(screen.getByRole('combobox', { name: 'Governorate' })).toHaveValue('DAM');
  });
});
