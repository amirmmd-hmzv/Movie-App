import { useEffect, useState } from "react";
import Search from "@/components/Search";
import Spinner from "@/components/Spinner";
import MovieCard from "@/components/MovieCard";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite";
function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [moviesList, setMoviesList] = useState([]);
  const [trendsMovies, settrendsMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState("");

  useDebounce(
    () => {
      setDebouncedValue(searchTerm);
    },
    800,
    [searchTerm]
  );

  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const BASE_URL = "https://api.themoviedb.org/3";
  const API_OPTIONS = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      settrendsMovies(movies);
    } catch (error) {
      console.error("Error fetching trending movies:", error);
    }
  };

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setError("");
    const endpoints = searchTerm
      ? `/search/movie?query=${encodeURIComponent(query)}&page=1`
      : `/discover/movie?sort_by=popularity.desc&page=1`;

    try {
      const response = await fetch(`${BASE_URL}/${endpoints}`, API_OPTIONS);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.response === "False") {
        setError(data.error || "No movies found.");
        setMoviesList([]);
      }

      setMoviesList(data.results || []);
      if (query.length > 0 && data.results.length > 0) {
        updateSearchCount(debouncedValue, data.results[0]);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      setError("Failed to fetch movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(searchTerm);
  }, [debouncedValue]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  console.log(trendsMovies);

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <h1>
            <img src="./hero.png" alt="hero images" />
            Discover Movies You’ll Love{" "}
            <span className="text-gradient">Instantly!</span>
          </h1>

          {trendsMovies.length > 0 && (
            <section className="trending">
              <h2>Trending Movies</h2>

              <ul>
                {trendsMovies.map((movie, index) => (
                  <li key={movie.$id}>
                    <p>{index + 1}</p>
                    <img src={movie.poster_url} alt={movie.title} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Search setSearchTerm={setSearchTerm} searchTerm={searchTerm} />
        </header>

        <section className="all-movies">
          <h2>All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : error ? (
            <p className="error">{error}</p>
          ) : moviesList.length > 0 ? (
            <div className="movies-list">
              <ul>
                {moviesList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </ul>
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
