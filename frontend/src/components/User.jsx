import { useState, useEffect } from "react";
import axios from "axios";

const GRAPHQL_URL = "http://localhost:4000/graphql";

export default function User() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: "", email: "" });

  // Fetch users
  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const query = `
        query {
          users {
            id
            name
            email
            registeredAt
          }
        }
      `;
      const res = await axios.post(GRAPHQL_URL, { query });
      setUsers(res.data.data.users);
    } catch (err) {
      setError(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle input change
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Add user mutation
  async function handleSubmit(e) {
    e.preventDefault();
    const mutation = `
      mutation($name: String!, $email: String!) {
        registerUser(name: $name, email: $email) {
          id
          name
          email
        }
      }
    `;
    try {
      await axios.post(GRAPHQL_URL, {
        query: mutation,
        variables: { name: form.name, email: form.email },
      });
      setForm({ name: "", email: "" });
      fetchUsers();
    } catch (err) {
      alert("Failed to add user: " + err.message);
    }
  }

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="text-red-600">Error loading users.</p>;

  return (
    <div className="px-6 py-10">
      <h2 className="text-2xl font-semibold mb-4">Add new users</h2>
      <div className="border-b-2 border-gray-300 pb-5 mb-10">
        <form
          onSubmit={handleSubmit}
          className="mb-6 gap-4 space-x-6 items-center"
        >
          <input
            name="name"
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300 w-70"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300 w-70"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white font-semibold px-4 py-2 rounded hover:bg-blue-600"
          >
            Add User
          </button>
        </form>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Users</h2>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Email
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Registered At
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map(({ id, name, email, registeredAt }) => (
            <tr key={id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{id}</td>
              <td className="border border-gray-300 px-4 py-2">{name}</td>
              <td className="border border-gray-300 px-4 py-2">{email}</td>
              <td className="border border-gray-300 px-4 py-2">
                {new Date(registeredAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
