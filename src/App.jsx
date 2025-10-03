import { useEffect, useState } from "react";
import Search from "@/components/Search";
import Spinner from "@/components/Spinner";
import MovieCard from "@/components/MovieCard";
function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [moviesList, setMoviesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const BASE_URL = "https://api.themoviedb.org/3";
  const API_OPTIONS = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
  };

  const fetchMovies = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${BASE_URL}/discover/movie?sort_by=popularity.desc&page=1`,
        API_OPTIONS
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.response === "False") {
        setError(data.error || "No movies found.");
        setMoviesList([]);
      }

      console.log(data);
      setMoviesList(data.results);
    } catch (error) {
      console.error("Error fetching movies:", error);
      setError("Failed to fetch movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
    console.log(isLoading);
    return () => {};
  }, []);

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <h1>
            <img src="./hero.png" alt="hero images" />
            Find <span className="text-gradient">Movies</span> You Will Enjoy
            without the hassle
          </h1>

          <Search setSearchTerm={setSearchTerm} searchTerm={searchTerm} />
        </header>

        <section>
          {isLoading ? (
            <Spinner />
          ) : error ? (
            <p className="error">{error}</p>
          ) : moviesList.length > 0 ? (
            <div className="movies-list">
              {moviesList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <p>No movies found.</p>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
