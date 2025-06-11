import { useState, useEffect } from "react";
import axios from "axios";

const REVIEW_SERVICE_URL = "http://localhost:4003/graphql";
const USER_SERVICE_URL = "http://localhost:4000/graphql";
const MOVIE_SERVICE_URL = "http://localhost:4001/graphql";

export default function Review() {
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReview, setNewReview] = useState({
    userName: "",
    movieTitle: "",
    content: "",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      setLoading(true);
      // Fetch reviews
      const reviewsQuery = `
        query {
          reviews {
            id
            userId
            movieId
            content
            timestamp
          }
        }
      `;
      const reviewsRes = await axios.post(
        REVIEW_SERVICE_URL,
        { query: reviewsQuery },
        { headers: { "Content-Type": "application/json" } }
      );
      setReviews(reviewsRes.data.data.reviews);

      // Fetch users
      const usersQuery = `
        query {
          users {
            name
          }
        }
      `;
      const usersRes = await axios.post(
        USER_SERVICE_URL,
        { query: usersQuery },
        { headers: { "Content-Type": "application/json" } }
      );
      setUsers(usersRes.data.data.users);

      // Fetch movies
      const moviesQuery = `
        query {
          movies {
            title
          }
        }
      `;
      const moviesRes = await axios.post(
        MOVIE_SERVICE_URL,
        { query: moviesQuery },
        { headers: { "Content-Type": "application/json" } }
      );
      setMovies(moviesRes.data.data.movies);

      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }

  async function handleAddReview(e) {
    e.preventDefault();
    try {
      const mutation = `
        mutation AddReview($userName: String!, $movieTitle: String!, $content: String) {
          addReview(userName: $userName, movieTitle: $movieTitle, content: $content) {
            id
            content
          }
        }
      `;
      const variables = {
        userName: newReview.userName,
        movieTitle: newReview.movieTitle,
        content: newReview.content,
      };
      await axios.post(
        REVIEW_SERVICE_URL,
        { query: mutation, variables },
        { headers: { "Content-Type": "application/json" } }
      );
      setNewReview({ userName: "", movieTitle: "", content: "" });
      fetchInitialData(); // refresh list
    } catch (err) {
      // Check for bad language error message from backend
      const errorMessage =
        err.response?.data?.errors?.[0]?.message || err.message;

      if (errorMessage.includes("inappropriate language")) {
        alert("Your review contains inappropriate language. Please edit it.");
      } else {
        alert("Error adding review: " + errorMessage);
      }
    }
  }  

  if (loading) return <p className="text-gray-500">Loading reviews...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div className="px-6 py-10">
      <h2 className="text-2xl font-semibold mb-4">Add new users</h2>
      <div className="border-b-2 border-gray-300 pb-5 mb-10">
        <form
          onSubmit={handleAddReview}
          className="flex mb-6 gap-4 space-x-6 items-center"
        >
          <div className="flex flex-col gap-4">
            <select
              value={newReview.userName}
              onChange={(e) =>
                setNewReview({ ...newReview, userName: e.target.value })
              }
              required
              className="border border-gray-300 rounded px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-300 w-60"
            >
              <option value="" disabled>
                Select User
              </option>
              {users.map((u) => (
                <option key={u.name} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>

            <select
              value={newReview.movieTitle}
              onChange={(e) =>
                setNewReview({ ...newReview, movieTitle: e.target.value })
              }
              required
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 w-60"
            >
              <option value="" disabled>
                Select Movie
              </option>
              {movies.map((m) => (
                <option key={m.title} value={m.title}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          <textarea
            placeholder="Review Content"
            value={newReview.content}
            onChange={(e) =>
              setNewReview({ ...newReview, content: e.target.value })
            }
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none w-70"
            rows={4}
          />

          <button
            type="submit"
            className="self-start bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Review
          </button>
        </form>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Reviews</h2>

      <table className="table-auto w-full border-collapse border border-gray-300 max-w-4xl">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              User ID
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Movie ID
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Content
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Timestamp
            </th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <tr key={r.id} className="hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-2">{r.id}</td>
              <td className="border border-gray-300 px-4 py-2">{r.userId}</td>
              <td className="border border-gray-300 px-4 py-2">{r.movieId}</td>
              <td className="border border-gray-300 px-4 py-2">{r.content}</td>
              <td className="border border-gray-300 px-4 py-2">
                {new Date(r.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
