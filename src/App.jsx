import { useEffect, useState } from "react";
import Search from "@/components/Search";
import MovieCard from "@/components/MovieCard";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite";
import axiosInstance from "./axiosConfig";
import SkeletonList from "./components/SkeletonCard ";
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
      const res = await axiosInstance.get(endpoints);
      console.log(res);
      setMoviesList(res.data.results || []);
      if (query.length > 0 && res.data.results > 0) {
        updateSearchCount(debouncedValue, res.data.results[0]);
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
          <Search setSearchTerm={setSearchTerm} searchTerm={searchTerm} />

          {trendsMovies.length > 0 && (
            <section className="trending">
              <h2>Trending Movies</h2>

              <ul>
                {trendsMovies.map((movie, index) => (
                  <li key={movie.$id}>
                    <img src={movie.poster_url} alt={movie.title} />
                    <p>{index + 1}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </header>

        <section className="all-movies">
          <h2>All Movies</h2>

          {isLoading ? (
            <SkeletonList count={5} />
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
