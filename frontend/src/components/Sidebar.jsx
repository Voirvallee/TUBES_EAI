import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="bg-gray-100 px-8 pt-10 h-screen">
      <NavLink to={'/'}>
        <h1 className="text-xl font-bold mb-10">Movie Rating Project</h1>
      </NavLink>
      <nav className="flex flex-col gap-2">
        {[
          { to: "/", label: "User" },
          { to: "/movie", label: "Movie" },
          { to: "/genre", label: "Genre" },
          { to: "/review", label: "Review" },
          { to: "/rating", label: "Rating" },
          { to: "/history", label: "History" },
        ].map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive
                ? "rounded-md font-semibold bg-blue-500 text-white py-2 px-3 cursor-default"
                : "rounded-md font-semibold hover:bg-gray-300 transition-all py-2 px-3"
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
