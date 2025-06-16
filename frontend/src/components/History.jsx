import { useState, useEffect } from "react";
import axios from "axios";

const GRAPHQL_URL = "http://localhost:4005/graphql";

export default function History() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    setError(null);
    const query = `
      query {
        logs {
          id
          source
          message
          level
          createdAt
        }
      }
    `;
    try {
      const res = await axios.post(
        GRAPHQL_URL,
        { query },
        { headers: { "Content-Type": "application/json" } }
      );
      setLogs(res.data.data.logs);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }

  if (loading) return <p className="text-gray-500">Loading logs...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div className="px-6 py-10">
      <h2 className="text-2xl font-semibold mb-4">Log History</h2>

      <table className="table-auto w-full border-collapse border border-gray-300 max-w-6xl">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Source
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Message
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Level
            </th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-2">{log.id}</td>
              <td className="border border-gray-300 px-4 py-2">{log.source}</td>
              <td className="border border-gray-300 px-4 py-2">
                {log.message}
              </td>
              <td
                className={`border border-gray-300 px-4 py-2 font-semibold ${
                  log.level === "ERROR"
                    ? "text-red-500"
                    : log.level === "WARN"
                    ? "text-yellow-500"
                    : "text-green-600"
                }`}
              >
                {log.level}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
