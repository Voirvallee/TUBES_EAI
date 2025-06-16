import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const GRAPHQL_URL = "http://localhost:4004/graphql";

function Analytic() {
  const [summary, setSummary] = useState(null);
  const [topMovies, setTopMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    setLoading(true);
    setError(null);

    const summaryQuery = `
      query {
        systemSummary {
          totalUsers
          totalMovies
          totalReviews
          totalPlaylists
        }
      }
    `;

    const topMoviesQuery = `
      query {
        topReviewedMovies(limit: 5) {
          movieId
          reviewCount
        }
      }
    `;

    try {
      const [summaryRes, topMoviesRes] = await Promise.all([
        axios.post(
          GRAPHQL_URL,
          { query: summaryQuery },
          { headers: { "Content-Type": "application/json" } }
        ),
        axios.post(
          GRAPHQL_URL,
          { query: topMoviesQuery },
          { headers: { "Content-Type": "application/json" } }
        ),
      ]);

      setSummary(summaryRes.data.data.systemSummary);
      setTopMovies(topMoviesRes.data.data.topReviewedMovies);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div className="px-6 py-10">
      <h2 className="text-3xl font-semibold mb-6">System Analytics</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div className="p-4 bg-blue-100 rounded shadow">
          <h3 className="text-xl font-semibold">Total Users</h3>
          <p className="text-3xl">{summary.totalUsers}</p>
        </div>
        <div className="p-4 bg-green-100 rounded shadow">
          <h3 className="text-xl font-semibold">Total Movies</h3>
          <p className="text-3xl">{summary.totalMovies}</p>
        </div>
        <div className="p-4 bg-yellow-100 rounded shadow">
          <h3 className="text-xl font-semibold">Total Reviews</h3>
          <p className="text-3xl">{summary.totalReviews}</p>
        </div>
        <div className="p-4 bg-purple-100 rounded shadow">
          <h3 className="text-xl font-semibold">Total Playlists</h3>
          <p className="text-3xl">{summary.totalPlaylists}</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="mb-10">
        <h3 className="text-2xl font-semibold mb-4">
          Top Reviewed Movies (Chart)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={topMovies}
            margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="movieId" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="reviewCount" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Analytic;
