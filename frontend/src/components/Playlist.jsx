import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

const PLAYLIST_URL = "http://localhost:4002/graphql";
const USER_URL = "http://localhost:4000/graphql";
const MOVIE_URL = "http://localhost:4001/graphql";

export default function Playlist() {
  const [playlists, setPlaylists] = useState([]);
  const [users, setUsers] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: "",
    ownerName: "",
    movieNames: [],
    description: "",
  });

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      // Fetch playlists
      const playlistQuery = `query { 
        playlists { 
          id 
          name 
          ownerName 
          movieNames 
          description 
          createdAt 
        } 
      }`;
      const playlistRes = await axios.post(
        PLAYLIST_URL,
        JSON.stringify({ query: playlistQuery }),
        { headers: { "Content-Type": "application/json" } }
      );
      setPlaylists(playlistRes.data.data.playlists);

      // Fetch users
      const userQuery = `query { users { id name email } }`;
      const userRes = await axios.post(
        USER_URL,
        JSON.stringify({ query: userQuery }),
        { headers: { "Content-Type": "application/json" } }
      );
      setUsers(userRes.data.data.users);

      // Fetch movies
      const movieQuery = `query { movies { id title } }`;
      const movieRes = await axios.post(
        MOVIE_URL,
        JSON.stringify({ query: movieQuery }),
        { headers: { "Content-Type": "application/json" } }
      );
      setMovies(movieRes.data.data.movies);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleMovieSelect(selected) {
    setForm({
      ...form,
      movieNames: selected ? selected.map((option) => option.value) : [],
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const mutation = `mutation($name: String!, $ownerName: String!, $movieNames: [String!]!, $description: String) { 
        addPlaylist(
          name: $name, 
          ownerName: $ownerName, 
          movieNames: $movieNames, 
          description: $description
        ) { 
          id 
          name 
          ownerName 
          movieNames 
          description 
        } 
      }`;

      await axios.post(
        PLAYLIST_URL,
        JSON.stringify({
          query: mutation,
          variables: {
            name: form.name,
            ownerName: form.ownerName,
            movieNames: form.movieNames,
            description: form.description,
          },
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setForm({
        name: "",
        ownerName: "",
        movieNames: [],
        description: "",
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to add playlist: " + err.message);
    }
  }

  if (loading) return <p>Loading playlists...</p>;
  if (error) return <p className="text-red-600">Error loading playlists.</p>;

  const userOptions = users.map((user) => ({
    value: user.name,
    label: user.name,
  }));

  const movieOptions = movies.map((movie) => ({
    value: movie.title,
    label: movie.title,
  }));

  return (
    <div className="px-6 py-10">
      <h2 className="text-2xl font-semibold mb-4">Add new playlist</h2>
      <div className="border-b-2 border-gray-300 pb-5 mb-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <input
              name="name"
              type="text"
              placeholder="Playlist Name"
              value={form.name}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 px-3 py-2 flex-1"
            />

            <Select
              name="ownerName"
              options={userOptions}
              value={userOptions.find((opt) => opt.value === form.ownerName)}
              onChange={(selected) =>
                setForm({ ...form, ownerName: selected.value })
              }
              placeholder="Select Owner"
              className="flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
            />
          </div>

          <div className="flex gap-4">
            <Select
              isMulti
              name="movieNames"
              options={movieOptions}
              value={movieOptions.filter((opt) =>
                form.movieNames.includes(opt.value)
              )}
              onChange={handleMovieSelect}
              placeholder="Select Movies"
              className="flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
            />

            <input
              name="description"
              type="text"
              placeholder="Description (optional)"
              value={form.description}
              onChange={handleChange}
              className="border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 px-3 py-2 flex-1"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white font-semibold px-4 py-2 rounded hover:bg-blue-600 self-start"
          >
            Add Playlist
          </button>
        </form>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Playlists</h2>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Owner
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Movies
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Description
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Created At
            </th>
          </tr>
        </thead>
        <tbody>
          {playlists.map((playlist) => (
            <tr key={playlist.id} className="hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-2">
                {playlist.id}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {playlist.name}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {playlist.ownerName}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {playlist.movieNames.join(", ")}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {playlist.description || "-"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {new Date(playlist.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
