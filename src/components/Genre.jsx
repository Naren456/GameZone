import React, { useState, useEffect } from 'react';
import GameCard from './GameCard';
import Loader from "./Loader"

const Genre = () => {
  const [games, setGames] = useState([]);
  const [genres, setGenres] = useState([{ name: 'All', slug: '' }]);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);


  const PAGE_SIZE = 20;
  const MAX_PAGES = 10;

  const fetchGenres = async () => {
    try {
      const res = await fetch(`https://api.rawg.io/api/genres?key=${import.meta.env.VITE_RAWG_API_KEY}`);
      const data = await res.json();
      const fetchedGenres = data.results.map((genre) => ({
        name: genre.name,
        slug: genre.slug,
      }));
      setGenres([{ name: 'All', slug: '' }, ...fetchedGenres]);
    } catch (err) {
      console.error('Error fetching genres:', err);
    }
  };

  const fetchGames = async (genreSlug = '', page = 1) => {
    try {
      setLoading(true);
      const url = genreSlug
        ? `https://api.rawg.io/api/games?key=${import.meta.env.VITE_RAWG_API_KEY}&genres=${genreSlug}&ordering=-added&page_size=${PAGE_SIZE}&page=${page}`
        : `https://api.rawg.io/api/games?key=${import.meta.env.VITE_RAWG_API_KEY}&ordering=-added&page_size=${PAGE_SIZE}&page=${page}`;

      const res = await fetch(url);
      const data = await res.json();
      setGames(data.results || []);
    } catch (err) {
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
    fetchGames('', 1);
  }, []);

  const handleGenreChange = (genreName) => {
    setSelectedGenre(genreName);
    setCurrentPage(1);
    const selected = genres.find((g) => g.name === genreName);
    fetchGames(selected?.slug || '', 1);
  };

  const handlePageChange = (direction) => {
    let nextPage = currentPage;
    if (direction === 'next' && currentPage < MAX_PAGES) {
      nextPage += 1;
    } else if (direction === 'prev' && currentPage > 1) {
      nextPage -= 1;
    }

    setCurrentPage(nextPage);
    const selected = genres.find((g) => g.name === selectedGenre);
    fetchGames(selected?.slug || '', nextPage);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-5 py-6 bg-gray-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">{selectedGenre} Games</h1>

          <div className="w-full sm:w-auto">
            <select
              value={selectedGenre}
              onChange={(e) => handleGenreChange(e.target.value)}
              className="w-full sm:w-auto bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {genres.map((genre) => (
                <option key={genre.slug} value={genre.name}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
           <Loader />
        ) : (
          <>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>

            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => handlePageChange('prev')}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 hover:bg-gray-600 transition-colors"
              >
                Previous
              </button>
              <span className="text-lg font-medium px-4">{currentPage}</span>
              <button
                onClick={() => handlePageChange('next')}
                disabled={currentPage === MAX_PAGES}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 hover:bg-gray-600 transition-colors"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Genre;
