import { useState, useEffect } from "react";
import axios from "axios";

const MOVIE_SERVICE_URL = "http://localhost:4001/graphql";

export default function Movie() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMovie, setNewMovie] = useState({
    title: "",
    description: "",
    releaseDate: "",
  });

  useEffect(() => {
    fetchMovies();
  }, []);

  async function fetchMovies() {
    try {
      setLoading(true);
      const query = `
        query {
          movies {
            id
            title
            description
            releaseDate
          }
        }
      `;
      const res = await axios.post(
        MOVIE_SERVICE_URL,
        { query },
        { headers: { "Content-Type": "application/json" } }
      );
      setMovies(res.data.data.movies);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }

  async function handleAddMovie(e) {
    e.preventDefault();
    try {
      const mutation = `
        mutation AddMovie($title: String!, $description: String, $releaseDate: String) {
          addMovie(title: $title, description: $description, releaseDate: $releaseDate) {
            id
            title
          }
        }
      `;
      const variables = {
        title: newMovie.title,
        description: newMovie.description,
        releaseDate: newMovie.releaseDate,
      };
      await axios.post(
        MOVIE_SERVICE_URL,
        { query: mutation, variables },
        { headers: { "Content-Type": "application/json" } }
      );
      setNewMovie({ title: "", description: "", releaseDate: "" });
      fetchMovies(); // Refresh list after adding
    } catch (err) {
      alert(
        "Error adding movie: " + (err.response?.data?.message || err.message)
      );
    }
  }

  if (loading) return <p className="text-gray-500">Loading movies...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div className="px-6 py-10">
      <h2 className="text-2xl font-semibold mb-4">Add new movies</h2>
      <div className="border-b-2 border-gray-300 pb-5 mb-10">
        <form
          onSubmit={handleAddMovie}
          className="mb-6 gap-4 space-x-6 items-center"
        >
          <input
            type="text"
            placeholder="Title"
            value={newMovie.title}
            onChange={(e) =>
              setNewMovie({ ...newMovie, title: e.target.value })
            }
            required
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <input
            type="text"
            placeholder="Description"
            value={newMovie.description}
            onChange={(e) =>
              setNewMovie({ ...newMovie, description: e.target.value })
            }
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <input
            type="date"
            placeholder="Release Date"
            value={newMovie.releaseDate}
            onChange={(e) =>
              setNewMovie({ ...newMovie, releaseDate: e.target.value })
            }
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Movie
          </button>
        </form>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Movies</h2>

      <table className="table-auto w-full border-collapse border border-gray-300 max-w-4xl">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Title
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Description
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Release Date
            </th>
          </tr>
        </thead>
        <tbody>
          {movies.map((m) => (
            <tr key={m.id} className="hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-2">{m.id}</td>
              <td className="border border-gray-300 px-4 py-2">{m.title}</td>
              <td className="border border-gray-300 px-4 py-2">
                {m.description}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {m.releaseDate}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
