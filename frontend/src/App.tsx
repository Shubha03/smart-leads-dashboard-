import React, {
  useEffect,
  useState
} from 'react';

import {
  UserSession,
  LeadEntity,
  PaginationMeta,
  useDebounce,
  LoadingSpinner,
  ErrorMessage,
  EmptyState
} from './components';

const API_BASE =
  'http://localhost:5000/api';

export default function App() {
  const [token, setToken] =
    useState<string | null>(
      localStorage.getItem('token')
    );

  const [user, setUser] =
    useState<UserSession | null>(
      JSON.parse(
        localStorage.getItem('user') ||
          'null'
      )
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [leads, setLeads] =
    useState<LeadEntity[]>([]);

  const [metadata, setMetadata] =
    useState<PaginationMeta>({
      totalRecords: 0,
      currentPage: 1,
      totalPages: 1,
      limit: 10
    });

  /* AUTH */

  const [isRegistering, setIsRegistering] =
    useState(false);

  const [authName, setAuthName] =
    useState('');

  const [authEmail, setAuthEmail] =
    useState('');

  const [authPassword, setAuthPassword] =
    useState('');

  const [authRole, setAuthRole] =
    useState<'Admin' | 'Sales User'>(
      'Sales User'
    );

  /* FILTERS */

  const [search, setSearch] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState('');

  const [sourceFilter, setSourceFilter] =
    useState('');

  const [sortOrder, setSortOrder] =
    useState('latest');

  const [page, setPage] =
    useState(1);

  const debouncedSearch =
    useDebounce(search, 400);

  /* CREATE LEAD */

  const [leadName, setLeadName] =
    useState('');

  const [leadEmail, setLeadEmail] =
    useState('');

  const [leadStatus, setLeadStatus] =
    useState('New');

  const [leadSource, setLeadSource] =
    useState('Website');

  /* FETCH LEADS */

  useEffect(() => {
    if (token) {
      fetchLeads();
    }
  }, [
    token,
    debouncedSearch,
    statusFilter,
    sourceFilter,
    sortOrder,
    page
  ]);

  const fetchLeads = async () => {
    setLoading(true);

    try {
      const query =
        new URLSearchParams({
          search: debouncedSearch,
          status: statusFilter,
          source: sourceFilter,
          sort: sortOrder,
          page: page.toString()
        });

      const res = await fetch(
        `${API_BASE}/leads?${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            'Failed to fetch leads'
        );
      }

      setLeads(data.data);

      setMetadata(data.metadata);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* AUTH */

  const handleAuthSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError('');

    const endpoint = isRegistering
      ? '/auth/register'
      : '/auth/login';

    const body = isRegistering
      ? {
          name: authName,
          email: authEmail,
          password: authPassword,
          role: authRole
        }
      : {
          email: authEmail,
          password: authPassword
        };

    try {
      const res = await fetch(
        `${API_BASE}${endpoint}`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify(body)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            'Authentication failed'
        );
      }

      localStorage.setItem(
        'token',
        data.token
      );

      localStorage.setItem(
        'user',
        JSON.stringify(data.user)
      );

      setToken(data.token);

      setUser(data.user);
    } catch (err: any) {
      setError(err.message);
    }
  };

  /* LOGOUT */

  const handleLogout = () => {
    localStorage.clear();

    setToken(null);

    setUser(null);

    setLeads([]);
  };

  /* CREATE LEAD */

  const handleCreateLead = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/leads`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            name: leadName,
            email: leadEmail,
            status: leadStatus,
            source: leadSource
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            'Failed to create lead'
        );
      }

      setLeadName('');
      setLeadEmail('');

      fetchLeads();
    } catch (err: any) {
      setError(err.message);
    }
  };

  /* DELETE LEAD */

  const handleDeleteLead = async (
    id: string
  ) => {
    try {
      const res = await fetch(
        `${API_BASE}/leads/${id}`,
        {
          method: 'DELETE',

          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            'Delete failed'
        );
      }

      fetchLeads();
    } catch (err: any) {
      setError(err.message);
    }
  };

  /* LOGIN SCREEN */

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-md rounded bg-white p-6 shadow">
          <h1 className="mb-6 text-3xl font-bold">
            Smart Leads
          </h1>

          {error && (
            <ErrorMessage
              message={error}
            />
          )}

          <form
            onSubmit={handleAuthSubmit}
            className="space-y-4"
          >
            {isRegistering && (
              <input
                type="text"
                placeholder="Name"
                value={authName}
                onChange={(e) =>
                  setAuthName(
                    e.target.value
                  )
                }
                className="w-full rounded border p-2"
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={authEmail}
              onChange={(e) =>
                setAuthEmail(
                  e.target.value
                )
              }
              className="w-full rounded border p-2"
            />

            <input
              type="password"
              placeholder="Password"
              value={authPassword}
              onChange={(e) =>
                setAuthPassword(
                  e.target.value
                )
              }
              className="w-full rounded border p-2"
            />

            {isRegistering && (
              <select
                value={authRole}
                onChange={(e) =>
                  setAuthRole(
                    e.target.value as
                      | 'Admin'
                      | 'Sales User'
                  )
                }
                className="w-full rounded border p-2"
              >
                <option value="Sales User">
                  Sales User
                </option>

                <option value="Admin">
                  Admin
                </option>
              </select>
            )}

            <button
              type="submit"
              className="w-full rounded bg-indigo-600 py-2 text-white"
            >
              {isRegistering
                ? 'Register'
                : 'Login'}
            </button>
          </form>

          <button
            onClick={() =>
              setIsRegistering(
                !isRegistering
              )
            }
            className="mt-4 text-sm text-indigo-600"
          >
            {isRegistering
              ? 'Already have account? Login'
              : 'Create account'}
          </button>
        </div>
      </div>
    );
  }

  /* DASHBOARD */

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Smart Leads Dashboard
          </h1>

          <p className="text-sm text-slate-600">
            {user?.name} (
            {user?.role})
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() =>
              window.open(
                `${API_BASE}/leads/export`,
                '_blank'
              )
            }
            className="rounded bg-green-600 px-4 py-2 text-white"
          >
            Export CSV
          </button>

          <button
            onClick={handleLogout}
            className="rounded bg-red-600 px-4 py-2 text-white"
          >
            Logout
          </button>
        </div>
      </div>

      {/* CREATE LEAD */}

      <div className="mb-6 rounded bg-white p-4 shadow">
        <h2 className="mb-4 text-xl font-semibold">
          Create Lead
        </h2>

        <div className="grid gap-4 md:grid-cols-4">
          <input
            type="text"
            placeholder="Name"
            value={leadName}
            onChange={(e) =>
              setLeadName(
                e.target.value
              )
            }
            className="rounded border p-2"
          />

          <input
            type="email"
            placeholder="Email"
            value={leadEmail}
            onChange={(e) =>
              setLeadEmail(
                e.target.value
              )
            }
            className="rounded border p-2"
          />

          <select
            value={leadStatus}
            onChange={(e) =>
              setLeadStatus(
                e.target.value
              )
            }
            className="rounded border p-2"
          >
            <option>New</option>
            <option>Contacted</option>
            <option>Qualified</option>
            <option>Lost</option>
          </select>

          <select
            value={leadSource}
            onChange={(e) =>
              setLeadSource(
                e.target.value
              )
            }
            className="rounded border p-2"
          >
            <option>Website</option>
            <option>Instagram</option>
            <option>Referral</option>
          </select>
        </div>

        <button
          onClick={handleCreateLead}
          className="mt-4 rounded bg-indigo-600 px-4 py-2 text-white"
        >
          Create Lead
        </button>
      </div>

      {/* FILTERS */}

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="rounded border p-2"
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
          className="rounded border p-2"
        >
          <option value="">
            All Status
          </option>

          <option value="New">
            New
          </option>

          <option value="Contacted">
            Contacted
          </option>

          <option value="Qualified">
            Qualified
          </option>

          <option value="Lost">
            Lost
          </option>
        </select>

        <select
          value={sourceFilter}
          onChange={(e) =>
            setSourceFilter(
              e.target.value
            )
          }
          className="rounded border p-2"
        >
          <option value="">
            All Sources
          </option>

          <option value="Website">
            Website
          </option>

          <option value="Instagram">
            Instagram
          </option>

          <option value="Referral">
            Referral
          </option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) =>
            setSortOrder(
              e.target.value
            )
          }
          className="rounded border p-2"
        >
          <option value="latest">
            Latest
          </option>

          <option value="oldest">
            Oldest
          </option>
        </select>
      </div>

      {/* CONTENT */}

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage
          message={error}
        />
      ) : leads.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="overflow-x-auto rounded bg-white shadow">
            <table className="w-full text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-4">
                    Name
                  </th>

                  <th className="p-4">
                    Email
                  </th>

                  <th className="p-4">
                    Status
                  </th>

                  <th className="p-4">
                    Source
                  </th>

                  <th className="p-4">
                    Created
                  </th>

                  <th className="p-4">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead._id}
                    className="border-t"
                  >
                    <td className="p-4">
                      {lead.name}
                    </td>

                    <td className="p-4">
                      {lead.email}
                    </td>

                    <td className="p-4">
                      {lead.status}
                    </td>

                    <td className="p-4">
                      {lead.source}
                    </td>

                    <td className="p-4">
                      {new Date(
                        lead.createdAt
                      ).toLocaleDateString()}
                    </td>

                    <td className="p-4">
                      {user?.role ===
                        'Admin' && (
                        <button
                          onClick={() =>
                            handleDeleteLead(
                              lead._id
                            )
                          }
                          className="rounded bg-red-600 px-3 py-1 text-white"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}

          <div className="mt-4 flex items-center justify-between">
            <button
              disabled={page === 1}
              onClick={() =>
                setPage(
                  (prev) =>
                    prev - 1
                )
              }
              className="rounded border px-4 py-2 disabled:opacity-50"
            >
              Previous
            </button>

            <span>
              Page{' '}
              {metadata.currentPage}{' '}
              of{' '}
              {metadata.totalPages}
            </span>

            <button
              disabled={
                metadata.currentPage >=
                metadata.totalPages
              }
              onClick={() =>
                setPage(
                  (prev) =>
                    prev + 1
                )
              }
              className="rounded border px-4 py-2 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}